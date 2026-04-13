const socketIO = require('socket.io');
const socketManager = require('./services/socketManager');
const Chat = require('./models/Chat');

// Helper function to generate chat room ID
function generateChatRoomId(userId1, userId2) {
  return [userId1, userId2].sort().join('_');
}

// Helper function to check if user is member of chat room
function isMemberOfChatRoom(userId, chatRoomId) {
  const [user1, user2] = chatRoomId.split('_');
  return userId === user1 || userId === user2;
}

/**
 * Initialize Socket.io with JWT authentication
 */
function initializeSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: process.env.SOCKET_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  /**
   * Middleware for JWT token verification
   */
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.log('[Socket] Connection attempt without token from:', socket.id);
        return next(new Error('No token provided'));
      }

      const decoded = socketManager.verifyToken(token);
      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      // Attach user info to socket for later use
      socket.userId = decoded.id || decoded.userId;
      socket.userRole = decoded.role || decoded.userType || 'user';
      socket.userName = decoded.name || decoded.userName || 'Anonymous';
      socket.userData = decoded;

      console.log('[Socket] Token verified for user:', {
        userId: socket.userId,
        role: socket.userRole,
        socketId: socket.id
      });

      next();
    } catch (error) {
      console.log('[Socket] Middleware error:', error.message);
      next(new Error('Authentication error'));
    }
  });

  /**
   * Handle socket connection
   */
  io.on('connection', (socket) => {
    console.log('[Socket] User connected:', {
      userId: socket.userId,
      socketId: socket.id,
      role: socket.userRole
    });

    // Add user to active users
    socketManager.addActiveUser(socket.userId, socket.id, {
      role: socket.userRole,
      name: socket.userName
    });

    // Emit online status to all connected clients
    io.emit('user-online', {
      userId: socket.userId,
      userName: socket.userName,
      userRole: socket.userRole,
      socketId: socket.id,
      activeUsers: socketManager.getAllActiveUsers()
    });

    /**
     * Handle user joining a specific chat room
     */
    socket.on('join-chat', (data) => {
      try {
        const { recipientId } = data;
        
        if (!recipientId) {
          console.log('[Socket] join-chat: Missing recipientId');
          socket.emit('error', { message: 'recipientId is required' });
          return;
        }

        // Generate consistent room ID
        const chatRoomId = generateChatRoomId(socket.userId, recipientId);
        
        // Join the socket to the room
        socket.join(chatRoomId);
        socket.currentChatRoom = chatRoomId;

        console.log('[Socket] User joined chat room:', {
          userId: socket.userId,
          chatRoomId,
          socketId: socket.id
        });

        // Notify both users that someone joined
        io.to(chatRoomId).emit('chat-active', {
          chatRoomId,
          activeMembers: socketManager.getAllActiveUsers().filter(u => 
            isMemberOfChatRoom(u.userId, chatRoomId) && socketManager.isUserOnline(u.userId)
          )
        });

      } catch (error) {
        console.log('[Socket] Error in join-chat:', error.message);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    /**
     * Handle message sending
     */
    socket.on('send-message', async (data) => {
      try {
        const { recipientId, message } = data;

        if (!recipientId || !message) {
          console.log('[Socket] send-message: Missing required fields');
          socket.emit('error', { message: 'recipientId and message are required' });
          return;
        }

        // Verify user is in a valid chat room with recipient
        const chatRoomId = generateChatRoomId(socket.userId, recipientId);
        
        if (!isMemberOfChatRoom(socket.userId, chatRoomId)) {
          console.log('[Socket] User not authorized for this chat');
          socket.emit('error', { message: 'Not authorized for this chat' });
          return;
        }

        const messageData = {
          chatRoomId,
          senderId: socket.userId,
          senderType: socket.userRole,
          senderName: socket.userName,
          receiverId: recipientId,
          message: message.trim(),
          status: 'delivered',
          deliveredAt: new Date(),
          createdAt: new Date()
        };

        console.log('[Socket] Message received:', {
          from: socket.userId,
          to: recipientId,
          chatRoomId,
          message: message.substring(0, 50) + (message.length > 50 ? '...' : '')
        });

        // Save message to database
        try {
          const savedMessage = await Chat.create({
            chatId: chatRoomId,
            senderId: socket.userId,
            senderType: socket.userRole,
            senderName: socket.userName,
            receiverId: recipientId,
            message: message.trim(),
            status: 'delivered',
            read: false
          });

          messageData._id = savedMessage._id;
          console.log('[Socket] Message saved to DB:', savedMessage._id);
        } catch (dbError) {
          console.log('[Socket] Database save error (message still sent):', dbError.message);
          // Message still gets sent even if DB save fails
        }

        // Send message only to the specific chat room
        io.to(chatRoomId).emit('receive-message', messageData);

        // Acknowledge receipt back to sender
        socket.emit('message-sent', {
          status: 'success',
          messageId: messageData._id,
          timestamp: messageData.createdAt
        });

      } catch (error) {
        console.log('[Socket] Error in send-message:', error.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * Handle typing indicator (only sent to other user in room)
     */
    socket.on('typing', (data) => {
      try {
        if (!socket.currentChatRoom) {
          return;
        }

        // Send typing indicator only to other user (not to self)
        socket.to(socket.currentChatRoom).emit('user-typing', {
          userId: socket.userId,
          userName: socket.userName,
          chatRoomId: socket.currentChatRoom
        });

      } catch (error) {
        console.log('[Socket] Error in typing:', error.message);
      }
    });

    /**
     * Handle stop typing
     */
    socket.on('stop-typing', (data) => {
      try {
        if (!socket.currentChatRoom) {
          return;
        }

        socket.to(socket.currentChatRoom).emit('user-stop-typing', {
          userId: socket.userId,
          chatRoomId: socket.currentChatRoom
        });

      } catch (error) {
        console.log('[Socket] Error in stop-typing:', error.message);
      }
    });

    /**
     * Handle socket disconnection
     */
    socket.on('disconnect', () => {
      try {
        const userId = socketManager.removeActiveUser(socket.id);

        if (userId) {
          console.log('[Socket] User disconnected:', {
            userId,
            socketId: socket.id
          });

          // Broadcast offline status to all connected clients
          io.emit('user-offline', {
            userId,
            socketId: socket.id
          });

          // Notify room that user left
          if (socket.currentChatRoom) {
            io.to(socket.currentChatRoom).emit('user-left-chat', {
              userId,
              chatRoomId: socket.currentChatRoom
            });
          }
        }
      } catch (error) {
        console.log('[Socket] Error in disconnect:', error.message);
      }
    });

    /**
     * Handle socket errors
     */
    socket.on('error', (error) => {
      console.log('[Socket] Socket error for user', socket.userId, ':', error.message);
    });

    /**
     * Handle connection errors
     */
    socket.on('connect_error', (error) => {
      console.log('[Socket] Connection error:', error.message);
    });
  });

  return io;
}

module.exports = initializeSocket;
