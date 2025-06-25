// step 1 import the schema
const Branch = require('../models/branchSchema');

// step 2 collect required data
const addSyllabus = async (req, res) => {
  try {
    const { branchName, semesters } = req.body;

    // step 3- create a new object to add in db
    const newBranch = new Branch({
      branchName,
      semesters,
    });

    //step 4- Save & send success message 
    await newBranch.save();

    res.status(201).json({
      message: 'Branch syllabus added successfully',
      data: newBranch,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to add branch syllabus',
      error: error.message,
    });
  }
};

module.exports = {
  addSyllabus,
};