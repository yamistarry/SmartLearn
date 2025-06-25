const AttendanceRecord = require("../models/AttendanceRecord");
const Attendance = require("../models/Attendance");

// View Attendance
const viewAttendance = async (req, res) => {
  const { email, branch, semester, subject } = req.body;

  try {
    const attendanceRecord = await AttendanceRecord.findOne({
      email,
      branch,
      semester,
      "subjects.subject": subject, // Match subject inside the array
    });

    if (!attendanceRecord) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    const subjectRecord = attendanceRecord.subjects.find(
      (subj) => subj.subject === subject
    );

    if (!subjectRecord) {
      return res.status(404).json({ error: "Subject not found in attendance record" });
    }

    const totalAttended = subjectRecord.attended;
    const totalMissed = subjectRecord.missed;

    if (totalAttended + totalMissed === 0) {
      return res.status(400).json({ error: "No attendance data available for this subject." });
    }

    const attendancePercentage = (totalAttended / (totalAttended + totalMissed)) * 100;

    res.json({ subject, attendancePercentage: attendancePercentage.toFixed(2) });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Server error" });
  }
};
const saveOtp = async (req, res) => {
  try {
    const { branch, semester, subject, otp } = req.body;
    console.log("Received OTP POST request:", req.body);

    let attendance = await Attendance.findOne({ branch, semester });

    if (!attendance) {
      attendance = new Attendance({
        branch,
        semester,
        subjects: new Map([[subject, otp]])
      });
    } else {
      attendance.subjects.set(subject, otp);
    }

    await attendance.save();

    // Save current time for OTP creation
    const otpCreatedAt = new Date();

    setTimeout(async () => {
      try {
        const current = await Attendance.findOne({ branch, semester });

        if (current && current.subjects.has(subject)) {
          current.subjects.delete(subject); // delete OTP
          await current.save();

          const students = await AttendanceRecord.find({ branch, semester });

          for (let student of students) {
            const subjectIndex = student.subjects.findIndex(s => s.subject === subject);

            if (subjectIndex === -1) {
              // Subject not found, means completely missed
              student.subjects.push({
                subject,
                attended: 0,
                missed: 1,
                lastMarked: null
              });
            } else {
              const subjectData = student.subjects[subjectIndex];

              // Check if they marked attendance *after* OTP creation
              const markedTime = new Date(subjectData.lastMarked || 0);

              if (markedTime < otpCreatedAt) {
                // Missed, because last marked was before OTP session
                subjectData.missed = (subjectData.missed || 0) + 1;
              } // Else: student has marked during this OTP session, no action
            }

            await student.save();
          }

          console.log(`✅ OTP for '${subject}' expired. Missed counts updated.`);
        }
      } catch (err) {
        console.error("❌ Error auto-deleting OTP:", err);
      }
    }, 30 * 1000); // 30 seconds (for testing)

    res.status(200).json({ message: "OTP saved. It will auto-expire in 30 seconds." });

  } catch (error) {
    console.error("Error saving OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Get current time
const getCurrentTime = () => new Date(); // make sure this is defined somewhere

// Mark Attendance
const markAttendance = async (req, res) => {
  const { email, branch, semester, subject, otp } = req.body;
  console.log("Incoming request body:", req.body);

  if (!email) {
    return res.status(400).json({ error: "Email is required to mark attendance." });
  }

  try {
    const attendance = await Attendance.findOne({ branch, semester });

    if (!attendance || !attendance.subjects.has(subject)) {
      console.log("Subject not found in attendance DB");
      return res.status(400).json({ error: "Invalid OTP or details." });
    }

    const storedOtp = attendance.subjects.get(subject);

    console.log("Stored OTP:", `'${storedOtp}'`);
    console.log("User Provided OTP:", `'${otp}'`);

    if (!storedOtp || storedOtp.toString().trim() !== otp.toString().trim()) {
      console.log("OTP mismatch");
      return res.status(400).json({ error: "Invalid OTP or details." });
    }

    let record = await AttendanceRecord.findOne({ email, branch, semester });

    if (!record) {
      record = new AttendanceRecord({
        email,
        branch,
        semester,
        subjects: [{ subject, attended: 1, missed: 0, lastMarked: getCurrentTime() }],
      });
    } else {
      const existingSubject = record.subjects.find(sub => sub.subject === subject);

      if (existingSubject) {
        const now = new Date();
        const lastMarked = new Date(existingSubject.lastMarked);

        const diff = (now - lastMarked) / 1000; // seconds
        if (diff < 30) {
          return res.status(400).json({ error: "Attendance already marked recently." });
        }

        existingSubject.attended += 1;
        existingSubject.lastMarked = getCurrentTime();
      } else {
        record.subjects.push({ subject, attended: 1, missed: 0, lastMarked: getCurrentTime() });
      }
    }

    await record.save();
    res.status(200).json({ message: "Attendance marked successfully." });

  } catch (err) {
    console.error("Error marking attendance:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  markAttendance,
  saveOtp,
  viewAttendance,
};
