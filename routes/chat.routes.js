const express = require("express");
const Chat = require("../models/Chat");

const router = express.Router();

// Get all messages for a chat
router.get("/messages/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const messages = await Chat.find({ chatId })
      .sort({ timestamp: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: messages.reverse(),
      total: await Chat.countDocuments({ chatId })
    });
  } catch (error) {
    console.error("[Chat API] Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get chat history between two users
router.get("/history/:userId1/:userId2", async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const chatId = [userId1, userId2].sort().join("_");

    const messages = await Chat.find({ chatId })
      .sort({ timestamp: 1 });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error("[Chat API] Error fetching history:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Mark message as read
router.put("/messages/:messageId/read", async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Chat.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error("[Chat API] Error marking message as read:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete a message
router.delete("/messages/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;

    await Chat.findByIdAndDelete(messageId);

    res.json({
      success: true,
      message: "Message deleted successfully"
    });
  } catch (error) {
    console.error("[Chat API] Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get unread message count for a user
router.get("/unread/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const unreadCount = await Chat.countDocuments({
      receiverId: userId,
      read: false
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error("[Chat API] Error fetching unread count:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
