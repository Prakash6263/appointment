const Chat = require('../models/Chat');
const socketManager = require('./socketManager');

class ChatService {
  /**
   * Save a message to the database
   */
  static async saveMessage(messageData) {
    try {
      const { chatRoomId, senderId, senderType, senderName, receiverId, message } = messageData;

      if (!chatRoomId || !senderId || !receiverId || !message) {
        throw new Error('Missing required message fields');
      }

      const savedMessage = await Chat.create({
        chatId: chatRoomId,
        senderId,
        senderType,
        senderName,
        receiverId,
        message: message.trim(),
        status: 'delivered',
        read: false
      });

      console.log('[Chat Service] Message saved:', savedMessage._id);
      return savedMessage;

    } catch (error) {
      console.log('[Chat Service] Error saving message:', error.message);
      throw error;
    }
  }

  /**
   * Get messages for a specific chat room
   */
  static async getMessages(chatRoomId, userId, limit = 50, skip = 0) {
    try {
      // Validate that user belongs to this chat room
      if (!socketManager.constructor.isMemberOfChatRoom(userId, chatRoomId)) {
        throw new Error('User is not a member of this chat');
      }

      // Validate limit
      const maxLimit = 100;
      const validLimit = Math.min(parseInt(limit), maxLimit);
      const validSkip = Math.max(0, parseInt(skip));

      const messages = await Chat.find({ chatId: chatRoomId })
        .sort({ createdAt: -1 })
        .skip(validSkip)
        .limit(validLimit)
        .lean();

      console.log('[Chat Service] Retrieved messages:', {
        chatRoomId,
        count: messages.length,
        skip: validSkip,
        limit: validLimit
      });

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.log('[Chat Service] Error retrieving messages:', error.message);
      throw error;
    }
  }

  /**
   * Get conversation history between two users
   */
  static async getConversationHistory(userId1, userId2, limit = 100, skip = 0) {
    try {
      const chatRoomId = socketManager.constructor.generateChatRoomId(userId1, userId2);
      return this.getMessages(chatRoomId, userId1, limit, skip);
    } catch (error) {
      console.log('[Chat Service] Error retrieving conversation history:', error.message);
      throw error;
    }
  }

  /**
   * Mark a message as read
   */
  static async markMessageAsRead(messageId, userId) {
    try {
      const message = await Chat.findById(messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      // Only the receiver can mark as read
      if (message.receiverId !== userId) {
        throw new Error('Only receiver can mark message as read');
      }

      message.read = true;
      message.status = 'read';
      message.readAt = new Date();

      await message.save();

      console.log('[Chat Service] Message marked as read:', messageId);
      return message;

    } catch (error) {
      console.log('[Chat Service] Error marking message as read:', error.message);
      throw error;
    }
  }

  /**
   * Delete a message (only sender can delete)
   */
  static async deleteMessage(messageId, userId) {
    try {
      const message = await Chat.findById(messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      // Only the sender can delete
      if (message.senderId !== userId) {
        throw new Error('Only sender can delete message');
      }

      await Chat.deleteOne({ _id: messageId });

      console.log('[Chat Service] Message deleted:', messageId);
      return { success: true, deletedId: messageId };

    } catch (error) {
      console.log('[Chat Service] Error deleting message:', error.message);
      throw error;
    }
  }

  /**
   * Get unread message count for a user
   */
  static async getUnreadCount(userId) {
    try {
      const count = await Chat.countDocuments({
        receiverId: userId,
        read: false
      });

      console.log('[Chat Service] Unread count for', userId, ':', count);
      return count;

    } catch (error) {
      console.log('[Chat Service] Error getting unread count:', error.message);
      throw error;
    }
  }

  /**
   * Get count of unique providers a customer has chatted with
   */
  static async getCustomerProvidersCount(customerId) {
    try {
      const result = await Chat.aggregate([
        {
          $match: {
            receiverId: customerId,
            senderType: 'provider'
          }
        },
        {
          $group: {
            _id: '$senderId'
          }
        },
        {
          $count: 'totalProviders'
        }
      ]);

      const count = result.length > 0 ? result[0].totalProviders : 0;
      console.log('[Chat Service] Customer providers count:', count);
      return count;

    } catch (error) {
      console.log('[Chat Service] Error getting customer providers count:', error.message);
      throw error;
    }
  }

  /**
   * Get count of unique customers a provider has chatted with
   */
  static async getProviderCustomersCount(providerId) {
    try {
      const result = await Chat.aggregate([
        {
          $match: {
            $or: [
              { senderId: providerId, senderType: 'provider' },
              { receiverId: providerId, senderType: 'customer' }
            ]
          }
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ['$senderId', providerId] },
                '$receiverId',
                '$senderId'
              ]
            }
          }
        },
        {
          $count: 'totalCustomers'
        }
      ]);

      const count = result.length > 0 ? result[0].totalCustomers : 0;
      console.log('[Chat Service] Provider customers count:', count);
      return count;

    } catch (error) {
      console.log('[Chat Service] Error getting provider customers count:', error.message);
      throw error;
    }
  }

  /**
   * Mark all messages in a chat as read
   */
  static async markChatAsRead(chatRoomId, userId) {
    try {
      // Validate user belongs to chat
      if (!socketManager.constructor.isMemberOfChatRoom(userId, chatRoomId)) {
        throw new Error('User is not a member of this chat');
      }

      const result = await Chat.updateMany(
        {
          chatId: chatRoomId,
          receiverId: userId,
          read: false
        },
        {
          $set: {
            read: true,
            status: 'read',
            readAt: new Date()
          }
        }
      );

      console.log('[Chat Service] Chat marked as read:', {
        chatRoomId,
        modifiedCount: result.modifiedCount
      });

      return result;

    } catch (error) {
      console.log('[Chat Service] Error marking chat as read:', error.message);
      throw error;
    }
  }
}

module.exports = ChatService;
