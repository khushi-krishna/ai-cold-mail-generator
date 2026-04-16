const mongoose = require("mongoose");

const EmailHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    emailBody: {
      type: String,
      default: "", // ✅
    },
    linkedInDM: {
      type: String,
      default: "", // ✅
    },
    followUpEmail: {
      type: String,
      default: "", // ✅
    },
    resumeTips: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const EmailHistory = mongoose.model("EmailHistory", EmailHistorySchema);

module.exports = EmailHistory;
