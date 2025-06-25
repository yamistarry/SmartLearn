const express = require('express');
const Syllabus = require('../models/branchSchema');

const router = express.Router();

// POST endpoint to add syllabus data
router.post('/syllabus', async (req, res) => {
  try {
    const syllabus = new Syllabus(req.body);
    await syllabus.save();
    res.status(201).json(syllabus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET syllabus data by branch, semester, and/or subject
router.get('/syllabus', async (req, res) => {
  try {
    const { branchName, semesterNumber, subjectName } = req.query;

    // Build the query object based on provided filters
    const query = {};
    if (branchName) query.branchName = branchName;
    if (semesterNumber) query['semesters.semesterNumber'] = parseInt(semesterNumber);

    // Fetching data from the database with initial filters on branchName and semesterNumber
    const syllabusData = await Syllabus.find(query);

    if (!syllabusData || syllabusData.length === 0) {
      return res.status(404).json({ message: 'Syllabus not found' });
    }

    // Narrowing down to specific subject if subjectName is provided
    let result = syllabusData.map((branch) => {
      const filteredSemesters = branch.semesters
        .filter((semester) => !semesterNumber || semester.semesterNumber === parseInt(semesterNumber))
        .map((semester) => {
          if (subjectName) {
            const filteredSubjects = semester.subjects.filter((subject) => subject.subjectName === subjectName);
            return { ...semester._doc, subjects: filteredSubjects };
          }
          return semester;
        });

      return { branchName: branch.branchName, semesters: filteredSemesters };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;