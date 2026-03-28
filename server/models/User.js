const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//A schema defines the structure of a document in MongoDB.
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  username: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    select: false,
  },
  otpExpiry: {
    type: Date,
    select: false,
  },
});

//hash password before saving
//sign up
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
//compare password for login
userSchema.methods.comparePassword = async function (cadidatePassword) {
  return await bcrypt.compare(cadidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
