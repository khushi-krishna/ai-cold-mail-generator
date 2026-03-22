const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("DB connected successfully.");
  } catch (error) {
    console.error("Mongo DB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDb;