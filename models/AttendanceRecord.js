const mongoose = require("mongoose");

const AttendanceRecordSchema = new mongoose.Schema({
  email: { type: String, required: true },
  branch: { type: String, required: true },
  semester: { type: String, required: true },
  subjects: [
    {
      subject: { type: String, required: true },
      attended: { type: Number, default: 0 },
      missed: { type: Number, default: 0 },
      lastMarked: { type: Date },  // Store the last marked date (or OTP date)
    },
  ],
}, { timestamps: true });
AttendanceRecordSchema.index({ email: 1, branch: 1, semester: 1, "subjects.subject": 1 }, { unique: true });

module.exports = mongoose.model("AttendanceRecord", AttendanceRecordSchema);
