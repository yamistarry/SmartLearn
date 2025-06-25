const Timetable = require('../models/TimeTableSchema'); // Replace with the correct path to your model

// Create a new timetable or replace an existing one
exports.createOrUpdateTimetable = async (req, res) => {
  try {
    const { semester, branch, schedule } = req.body; // 'schedule' contains the whole timetable (Mon-Sun)
    
    // Find existing timetable by semester and branch
    let timetable = await Timetable.findOne({ semester, branch });

    if (timetable) {
      // Update existing timetable
      timetable.schedule = schedule;
      await timetable.save();
      res.status(200).json({ message: 'Timetable updated successfully', timetable });
    } else {
      // Create new timetable
      timetable = new Timetable({ semester, branch, ...schedule });
      await timetable.save();
      res.status(201).json({ message: 'Timetable created successfully', timetable });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update a specific day's schedule
exports.updateDaySchedule = async (req, res) => {
  try {
    const { semester, branch, day } = req.params; // e.g., 'monday', 'tuesday', etc.
    const { subjects } = req.body; // Array of subjects for the specified day

    // Find the timetable by semester and branch
    const timetable = await Timetable.findOne({ semester, branch });

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    // Update the specified day with new subjects
    timetable[day] = subjects;
    await timetable.save();

    res.status(200).json({ message: `${day} schedule updated successfully`, timetable });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};




// controllers/timetableController.js
// Assuming the Timetable model is in the models directory

// Controller to get timetable by semester and branch
exports.getTt = async (req, res) => {
  try {
    const { semester, branch } = req.params;  // Extract semester and branch from URL parameters

    // Find the timetable based on semester and branch
    const timetable = await Timetable.findOne({ semester, branch });

    // If no timetable is found
    if (!timetable) {
      return res.status(404).json({ message: "Timetable not found for the specified semester and branch" });
    }

    // Send the timetable data in the response
    return res.status(200).json(timetable);
  } catch (error) {
    console.error("Error fetching timetable:", error);
    return res.status(500).json({ message: "An error occurred while fetching the timetable" });
  }
};
