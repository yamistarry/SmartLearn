const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  branch: String,
  semester: String,
  subjects: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
