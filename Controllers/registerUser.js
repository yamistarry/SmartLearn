const bcrypt = require('bcryptjs');
const User = require('../models/userSchema'); 
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config(); 

const registerUser = async (req, res) => {
  const { email, password} = req.body;

  try {
    //checking if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    // Create new user with OTP and unverified status
    const newUser = new User({
      // name: "Anonymous",
      email,
      password: hashedPassword,
    //   yearOfStudy: "1",
      
      department:"General Studies",
      college:"Unknown College",
      phone: 7017344818,
      assignments: { done: 0, total: 0 },
      classes: { attended: 0, total: 0 },
      weeksclasses: { attended: 0, total: 0 },
      projects: { completed: 0, total: 0 },
      timetable: [],  
      otp,
      otpExpiresAt,
      isVerified: false,

    });

    await newUser.save();

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use 'gmail' for Gmail service
      auth: {
        user: process.env.EMAIL_USER, // Environment variable for email user
        pass: process.env.EMAIL_PASS  // Environment variable for email password
      }
    });

    // Send OTP via email
    await transporter.sendMail({
      from: `"SmartLearn Services" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `'SmartLearn OTP Code`,
      text: `Your OTP code is ${otp} for successful registration. NOTE: It will expire in 10 minutes.`
    });

    res.status(201).json({ message: 'OTP sent to your email. Verify to complete registration.', userid: newUser._id });

  } catch (error) {
    console.error('Error during registration:', error); // Log detailed error
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

module.exports = registerUser;