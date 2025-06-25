const mongoose = require("mongoose");

// Schema for each subject with start time, end time, and location
const subjectSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
  },
  startTime: {
    type: String, // e.g., "09:00 AM"
    required: true,
  },
  endTime: {
    type: String, // e.g., "10:30 AM"
    required: true,
  },
  location: {
    type: String, // e.g., "Room 101"
    required: true,
  },
});

// Main timetable schema with 7 days
const timetableSchema = new mongoose.Schema({
  semester: {
    type: String,
    required: true, // Semester (e.g., "Semester 1")
  },
  branch: {
    type: String,
    required: true, // Branch (e.g., "Computer Science")
  },
  monday: [subjectSchema], // Array of subjects for Monday
  tuesday: [subjectSchema], // Array of subjects for Tuesday
  wednesday: [subjectSchema], // Array of subjects for Wednesday
  thursday: [subjectSchema], // Array of subjects for Thursday
  friday: [subjectSchema], // Array of subjects for Friday
  saturday: [subjectSchema], 
  sunday: [subjectSchema], 
  createdAt: {
    type: Date,
    default: Date.now, 
  },
});


const Timetable = mongoose.model("Timetable", timetableSchema);

module.exports = Timetable;