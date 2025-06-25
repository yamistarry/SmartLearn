const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
  linkId: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

// meetingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Meeting", meetingSchema);
