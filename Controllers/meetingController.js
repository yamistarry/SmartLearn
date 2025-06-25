const Meeting = require('../models/Meeting');
const { v4: uuidv4 } = require('uuid');

// ✅ Use function declarations or const assignments
const createMeeting = async (req, res) => {
  const { otp, durationMinutes } = req.body;

  const rawId = uuidv4();
  const linkId = `/meet/${rawId}`; // ✅ Save with /meet/
  const expiresAt = new Date(Date.now() + durationMinutes * 60000);

  try {
    const newMeeting = new Meeting({ linkId, otp, expiresAt });
    await newMeeting.save();

    res.status(201).json({ success: true, link: linkId, otp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const verifyMeeting = async (req, res) => {
  const { linkId, otp } = req.body;

  try {
    const meeting = await Meeting.findOne({ linkId });

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found or expired" });
    }

    // Check if meeting expired
    if (new Date() > new Date(meeting.expiresAt)) {
      return res.status(410).json({ success: false, message: "Meeting has expired" });
    }

    if (meeting.otp !== otp) {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    res.status(200).json({ success: true, message: "OTP verified" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createMeeting,
  verifyMeeting,
};
