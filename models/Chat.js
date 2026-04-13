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
    },
    status: {
      type: String,
      enum: ["pending", "delivered", "read"],
      default: "pending"
    },
    readAt: {
      type: Date,
      default: null
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Create indexes for efficient chat queries
chatSchema.index({ chatId: 1, timestamp: -1 });
chatSchema.index({ receiverId: 1, read: 1 });
chatSchema.index({ senderId: 1, receiverId: 1 });
chatSchema.index({ chatId: 1, read: 1 });

module.exports = mongoose.model("Chat", chatSchema);
