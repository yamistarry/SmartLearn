const User = require("../models/userSchema");

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log(user);
    if (!user || user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined; 
    user.otpExpiresAt = undefined; 
    await user.save();

    res.status(200).json({ message: "OTP verified successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Verification failed.", error: error.message });
  }
};

module.exports = verifyOtp;