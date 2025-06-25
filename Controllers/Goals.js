const Goal = require('../models/GoalSchema');

exports.createGoal = async (req, res) => {
  try {
    const goal = new Goal(req.body);
    console.log("Received goal data:", req.body);
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getGoalsByUser = async (req, res) => {
    try {
      const { userId } = req.params; // Extract userId from params
      const { date } = req.query; // Extract date from query string
  
      // Build the query object
      let query = { userId };
  
      // If date is provided, add a filter for the deadline
      if (date) {
        query.deadline = { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) }; // Filter goals by date range (start of the given day)
      }
  
      const goals = await Goal.find(query);
  
      // Return the goals as a JSON response
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

exports.updateGoal = async (req, res) => {
    try {
      const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
  
      if (!updatedGoal) {
        return res.status(404).json({ message: "Goal not found" });
      }
  
      res.status(200).json({ message: "Goal updated successfully", data: updatedGoal });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update goal" });
    }
  };
  
  
exports.deleteGoal = async (req, res) => {
    try {
      const deletedGoal = await Goal.findByIdAndDelete(req.params.id);
      if (!deletedGoal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.status(200).json({ message: "Goal deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete goal" });
    }
  };
  