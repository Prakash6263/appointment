const jwt = require('jsonwebtoken');

class SocketManager {
  constructor() {
    // activeUsers structure: { userId: { socketId, userRole, connectedAt } }
    this.activeUsers = {};
    // userSockets structure: { socketId: userId } - for reverse lookup
    this.userSockets = {};
  }

  /**
   * Verify JWT token from socket handshake
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      console.log('[Socket] Token verification failed:', error.message);
      return null;
    }
  }

  /**
   * Add user to active users when they connect
   */
  addActiveUser(userId, socketId, userData) {
    if (!userId || !socketId) {
      console.log('[Socket] Invalid userId or socketId');
      return false;
    }

    // If user already exists, update the socketId (reconnection)
    if (this.activeUsers[userId]) {
      console.log('[Socket] User reconnected:', userId, 'Old socket:', this.activeUsers[userId].socketId, 'New socket:', socketId);
      delete this.userSockets[this.activeUsers[userId].socketId];
    }

    this.activeUsers[userId] = {
      socketId,
      userRole: userData.role || userData.userType || 'user',
      connectedAt: new Date(),
      userData
    };

    this.userSockets[socketId] = userId;

    console.log('[Socket] User added to active users:', {
      userId,
      socketId,
      role: this.activeUsers[userId].userRole,
      totalActiveUsers: Object.keys(this.activeUsers).length
    });

    return true;
  }

  /**
   * Remove user from active users when they disconnect
   */
  removeActiveUser(socketId) {
    const userId = this.userSockets[socketId];

    if (!userId) {
      return false;
    }

    delete this.activeUsers[userId];
    delete this.userSockets[socketId];

    console.log('[Socket] User removed from active users:', {
      userId,
      socketId,
      totalActiveUsers: Object.keys(this.activeUsers).length
    });

    return userId;
  }

  /**
   * Get user info by userId
   */
  getUser(userId) {
    return this.activeUsers[userId] || null;
  }

  /**
   * Get user info by socketId
   */
  getUserBySocket(socketId) {
    const userId = this.userSockets[socketId];
    return userId ? this.activeUsers[userId] : null;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId) {
    return !!this.activeUsers[userId];
  }

  /**
   * Get all active users
   */
  getAllActiveUsers() {
    return Object.keys(this.activeUsers).map(userId => ({
      userId,
      ...this.activeUsers[userId]
    }));
  }

  /**
   * Generate room ID for two users (chat room)
   * Ensures consistent room ID regardless of user order
   */
  static generateChatRoomId(userId1, userId2) {
    return [userId1, userId2].sort().join('_');
  }

  /**
   * Check if user belongs to chat room
   */
  static isMemberOfChatRoom(userId, chatRoomId) {
    const [user1, user2] = chatRoomId.split('_');
    return userId === user1 || userId === user2;
  }

  /**
   * Get other user in chat room
   */
  static getOtherUserInChatRoom(userId, chatRoomId) {
    const [user1, user2] = chatRoomId.split('_');
    return userId === user1 ? user2 : user1;
  }
}

// Export singleton instance
module.exports = new SocketManager();
