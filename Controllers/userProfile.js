const User = require("../models/userSchema");

const getUserProfile = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not exist" });
    }

    const { password, otp, otpExpiresAt, ...userDetails } = user.toObject();
    res.status(200).json(userDetails);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = getUserProfile;
