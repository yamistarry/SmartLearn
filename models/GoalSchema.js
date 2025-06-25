const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ["daily", "weekly", "monthly"], default: "daily" },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  deadline: { type: Date },
  userId: { type: String, ref: "User", required: true }, // Link to the user
}, { timestamps: true });

module.exports = mongoose.model("Goal", goalSchema);
