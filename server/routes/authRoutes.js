const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Register a new user
router.post("/register", authController.registerUser);

// Login user
router.post("/login", authController.loginUser);

// Verify OTP
router.post("/verify-otp", authController.verifyOTP);

// Resend OTP
router.post("/resend-otp", authController.resendOTP);


module.exports = router;
