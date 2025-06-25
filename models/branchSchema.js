const mongoose = require('mongoose');

// Resource schema to store links for each chapter
const resourceSchema = new mongoose.Schema({
//   pretestLink: {
//     type: String,
//     trim: true,
//     match: [/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/, 'Please enter a valid URL for pretest'],
//   },
  studyMaterialLink: {
    type: String,
    trim: true,
    match: [/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/, 'Please enter a valid URL for study material'],
  },
//   assignmentLink: {
//     type: String,
//     trim: true,
//     match: [/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/, 'Please enter a valid URL for assignment'],
//   },
});

// Chapter schema, including a list of resources and a completed field
const chapterSchema = new mongoose.Schema({
  chapterName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  resources: {
    type: resourceSchema,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false, // Default value is false
  },
});

// Subject schema, including a list of chapters
const subjectSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  chapters: [chapterSchema],
});

// Semester schema, including a list of subjects
const semesterSchema = new mongoose.Schema({
  semesterNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  subjects: [subjectSchema],
});

// Branch schema, including a list of semesters
const branchSchema = new mongoose.Schema({
  branchName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  semesters: [semesterSchema],
});

module.exports = mongoose.model('Branch', branchSchema);