const express = require("express");
const Chat = require("../models/Chat");
const ChatService = require("../services/chatService");
const socketManager = require("../services/socketManager");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Get all messages for a chat (authenticated)
router.get("/messages/:chatId", authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, skip = 0 } = req.query;
    const userId = req.userId;

    // Validate user belongs to this chat
    if (!socketManager.constructor.isMemberOfChatRoom(userId, chatId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this chat"
      });
    }

    // Validate and sanitize limit
    const validLimit = Math.min(parseInt(limit) || 50, 100);
    const validSkip = Math.max(0, parseInt(skip) || 0);

    const messages = await ChatService.getMessages(chatId, userId, validLimit, validSkip);
    const total = await Chat.countDocuments({ chatId });

    res.json({
      success: true,
      data: messages,
      total,
      limit: validLimit,
      skip: validSkip
    });
  } catch (error) {
    console.error("[Chat API] Error fetching messages:", error.message);
    res.status(error.message.includes("not a member") ? 403 : 500).json({
      success: false,
      message: error.message
    });
  }
});

// Get chat history between two users (authenticated)
router.get("/history/:userId1/:userId2", authMiddleware, async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const userId = req.userId;

    // Verify user is part of this conversation
    if (userId !== userId1 && userId !== userId2) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this conversation"
      });
    }

    const messages = await ChatService.getConversationHistory(userId1, userId2);

    res.json({
      success: true,
      data: messages,
      total: messages.length
    });
  } catch (error) {
    console.error("[Chat API] Error fetching history:", error.message);
    res.status(error.message.includes("not a member") ? 403 : 500).json({
      success: false,
      message: error.message
    });
  }
});

// Mark message as read (authenticated - only receiver)
router.put("/messages/:messageId/read", authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await ChatService.markMessageAsRead(messageId, userId);

    res.json({
      success: true,
      data: message,
      message: "Message marked as read"
    });
  } catch (error) {
    console.error("[Chat API] Error marking message as read:", error.message);
    res.status(error.message.includes("receiver") ? 403 : 404).json({
      success: false,
      message: error.message
    });
  }
});

// Delete a message (authenticated - only sender)
router.delete("/messages/:messageId", authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    await ChatService.deleteMessage(messageId, userId);

    res.json({
      success: true,
      message: "Message deleted successfully"
    });
  } catch (error) {
    console.error("[Chat API] Error deleting message:", error.message);
    res.status(error.message.includes("sender") ? 403 : 404).json({
      success: false,
      message: error.message
    });
  }
});

// Get unread message count for a user (authenticated)
router.get("/unread/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    // User can only check their own unread count
    if (userId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "You can only check your own unread count"
      });
    }

    const unreadCount = await ChatService.getUnreadCount(userId);

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error("[Chat API] Error fetching unread count:", error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Mark entire chat as read (authenticated)
router.put("/chat/:chatId/read-all", authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    const result = await ChatService.markChatAsRead(chatId, userId);

    res.json({
      success: true,
      message: "Chat marked as read",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("[Chat API] Error marking chat as read:", error.message);
    res.status(error.message.includes("not a member") ? 403 : 500).json({
      success: false,
      message: error.message
    });
  }
});

// Get count of unique providers for a customer (analytics)
router.get("/stats/customer/providers-count", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const count = await ChatService.getCustomerProvidersCount(userId);

    res.json({
      success: true,
      totalProvidersChatted: count,
      userId
    });
  } catch (error) {
    console.error("[Chat API] Error getting providers count:", error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get count of unique customers for a provider (analytics)
router.get("/stats/provider/customers-count", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const count = await ChatService.getProviderCustomersCount(userId);

    res.json({
      success: true,
      totalCustomersChatted: count,
      userId
    });
  } catch (error) {
    console.error("[Chat API] Error getting customers count:", error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
