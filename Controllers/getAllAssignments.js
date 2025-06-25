const Assignment = require('../models/assignment');

const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 }); // Fetch all assignments, latest first

    if (!assignments.length) {
      return res.status(404).json({ error: 'No assignments found' });
    }

    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Server error. Could not fetch assignments.' });
  }
};

module.exports = { getAllAssignments };
