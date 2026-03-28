const cors = require("cors");
const express = require("express");
const app = express();
const connectDb = require("./config/db");
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");

const PORT = 3000;

//CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// env
require("dotenv").config();

// connect to MongoDB
connectDb();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes); // ✅ FIXED

// Error handler
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({ error: "Something went wrong." });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
