
const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.isVerified) {
      // User exists and password is valid, but OTP not verified
      return res.status(403).json({
        message: "Email not verified.",
        redirectTo: "/verify-otp",
        email: user.email, // Send email back to client to pass into VerifyOtp
      });
    }

    // If verified, proceed with login (e.g., generate token)
    return res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = loginUser;
