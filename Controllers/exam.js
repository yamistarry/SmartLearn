const ExamTimetable = require('../models/examSchema');


const addTimetable = async (req, res) => {
  try {
    const { branch, semester, exams } = req.body;

    // Check if timetable already exists for the branch and semester
    const existingTimetable = await ExamTimetable.findOne({ branch, semester });
    if (existingTimetable) {
      return res.status(400).json({ message: 'Timetable already exists for this branch and semester.' });
    }

    // Create and save the new timetable
    const newTimetable = new ExamTimetable({
      branch,
      semester,
      exams,
    });

    await newTimetable.save();
    res.status(201).json({ message: 'Timetable added successfully!', timetable: newTimetable });
  } catch (error) {
    res.status(500).json({ message: 'Error adding timetable', error: error.message });
  }
};

// Controller to get timetable based on branch and semester
const getTimetable = async (req, res) => {
  try {
    const { branch, semester } = req.query;

    // Fetch the timetable for the specified branch and semester
    const timetable = await ExamTimetable.findOne({ branch, semester });
    if (!timetable) {
      return res.status(404).json({ message: 'No timetable found for this branch and semester.' });
    }

    res.status(200).json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching timetable', error: error.message });
  }
};

module.exports = { addTimetable, getTimetable };