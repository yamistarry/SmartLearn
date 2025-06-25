const mongoose = require('mongoose');

const ExamTimetableSchema = new mongoose.Schema({
  branch: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  exams: [
    {
      subject: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      startTime: {
        type: String,
        required: true,
      },
      endTime: {
        type: String, 
        required: true,
      },
    },
  ],
});

const ExamTimetable = mongoose.model('ExamTimetable', ExamTimetableSchema);

module.exports = ExamTimetable;