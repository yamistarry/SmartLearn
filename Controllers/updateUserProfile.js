const User = require("../models/userSchema");
const updateUserProfile = async (req, res) => {
  try {
    const { email } = req.params;
    const updateData = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email parameter is required" });
    }
    if (updateData.email && updateData.email !== email) {
      return res.status(400).json({ message: "Email cannot be changed" });
    }
    const updatedUser = await User.findOneAndUpdate(
      { email },
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, otp, otpExpiresAt, ...userDetails } = updatedUser.toObject();
    res.status(200).json(userDetails);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Failed to update user details.", error: error.message });
  }
};
module.exports = updateUserProfile;
