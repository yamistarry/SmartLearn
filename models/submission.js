const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentNumber: {
    type: Number,
    required: true,
  },
  subject: String,
  chapter: String,
  deadline: Date,
  professorName: String,
  description: String,
  submitted: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    required: true,
  },
  branch: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  attachments: [
    {
      filename: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model('Submission', submissionSchema);
