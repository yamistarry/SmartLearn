const User = require("../models/userSchema");
// Controller to search for users by name, allowing partial, case-insensitive matches
const searchUsersByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a name to search",
      });
    }
    // Find users with a case-insensitive, partial match on the name and role as "Student"
    const users = await User.find({
        name: { $regex: name, $options: "i" }, // Allows partial, case-insensitive match
      });
    // Send the found users in the response
    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    console.error("Error searching for users:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to search for users",
    });
  }
};
module.exports = {
  searchUsersByName,
}