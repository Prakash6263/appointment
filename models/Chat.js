const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      index: true
    },
    senderId: {
      type: String,
      required: true
    },
    senderType: {
      type: String,
      enum: ["user", "provider"],
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    receiverId: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Create index for efficient chat queries
chatSchema.index({ chatId: 1, timestamp: -1 });

module.exports = mongoose.model("Chat", chatSchema);
