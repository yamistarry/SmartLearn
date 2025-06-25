// step 1 get nesecarry schema
const Assignment = require('../models/assignment');
const User = require('../models/userSchema'); 

// get assignment number and email
const submitAssignment = async (req, res) => {
  try {
    const { email, assignmentNumber } = req.body;

    // step 3 find on basis of number and email
    const assignment = await Assignment.findOneAndUpdate(
      { email: email, assignmentNumber: assignmentNumber },
      { submitted: true },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    // step 4 Increment the assignments.done for the user
    await User.findOneAndUpdate(
      { email: email },
      { $inc: { 'assignments.done': 1 } }
    );

    res.status(200).json({ message: 'Assignment submitted successfully', assignment });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ error: 'Server error. Could not submit assignment.' });
  }
};

module.exports = { submitAssignment };