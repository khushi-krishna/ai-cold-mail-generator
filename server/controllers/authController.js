const User = require('../models/user');
const sendEmail = require('../utils/sendEmail')
const jwt = require('jsonwebtoken');


// Generate JWT token
const generateAuthToken = function (id) {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};



// ================= REGISTER USER =================
exports.registerUser = async (req, res) => {
  try {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP expires after 24hour
   const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      username,
      email,
      password,
      otp,
      otpExpiry
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        username: user.username,
        email: user.email
      }
    });

    // Send OTP email in background
    sendEmail({
      to: email,
      subject: "Your OTP for AI COLD MAIL GENERATOR",
      text: `Your OTP is ${otp}. Valid for 1 hour only.`
    }).catch(err => console.log("Email error:", err.message));

  } catch (error) {

    console.error(error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Server error",
        error: error.message
      });
    }
  }
};



// ================= VERIFY OTP =================
exports.verifyOTP = async (req, res) => {

  try {

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    user.isVerified = true;

    // clear OTP after verification
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    const token = generateAuthToken(user._id);

    return res.status(200).json({
      message: "OTP verified successfully",
      token
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};



// ================= LOGIN USER =================
exports.loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({
        message: 'User not found'
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: 'User not verified. Please verify OTP first.'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid password'
      });
    }

    const token = generateAuthToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (error) {

    res.status(500).json({
      message: "Error logging in",
      error: error.message
    });
  }
};