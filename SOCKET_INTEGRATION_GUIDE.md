# Socket.io Chat Integration Guide

This guide explains how to integrate the Socket.io chat system into your existing React/Next.js frontend.

## 📦 What Was Added

### Backend Files
```
server.js                          # ✅ Updated with Socket.io
models/Chat.js                     # ✅ New - MongoDB chat schema
routes/chat.routes.js              # ✅ New - Chat REST API
```

### Frontend HTML Files (For Testing)
```
public/provider-chat.html          # ✅ New - Provider interface
public/user-chat.html              # ✅ New - User interface
public/socket-test.html            # ✅ New - Connection tester
```

### Documentation
```
SOCKET_CHAT_README.md              # ✅ Complete setup guide
SOCKET_INTEGRATION_GUIDE.md        # ✅ This file
```

## 🎯 Quick Start (3 Steps)

### Step 1: Install & Start Server
```bash
npm install          # socket.io already added to package.json
npm run dev          # Server runs on localhost:5000
```

### Step 2: Test Real-Time Chat
Open in two browser windows:
- **Provider**: http://localhost:5000/provider-chat.html
- **User**: http://localhost:5000/user-chat.html

### Step 3: Send Messages
1. Select a chat from the list (same one in both windows)
2. Type a message and press Enter
3. **Message appears instantly** in both windows!

## 🚀 Integrating into React/Next.js

If you have a React frontend, follow these steps to integrate:

### 1. Install Socket.io Client
```bash
npm install socket.io-client
```

### 2. Create a Chat Hook

```javascript
// hooks/useChat.js
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useChat(userId, userType, userName) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to socket server
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('[Chat] Connected:', newSocket.id);
      setIsConnected(true);
      
      // Notify server that user joined
      newSocket.emit('user-join', {
        userId,
        userType,
        userName
      });
    });

    newSocket.on('disconnect', () => {
      console.log('[Chat] Disconnected');
      setIsConnected(false);
    });

    // Message events
    newSocket.on('receive-message', (data) => {
      console.log('[Chat] New message:', data);
      setMessages(prev => [...prev, data]);
    });

    newSocket.on('user-online', (data) => {
      console.log('[Chat] User online:', data);
      setOnlineUsers(data.onlineUsers || []);
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      newSocket.disconnect();
    };
  }, [userId, userType, userName]);

  // Send message function
  const sendMessage = (chatId, receiverId, message) => {
    if (!socket) return;

    socket.emit('send-message', {
      chatId,
      senderId: userId,
      senderType: userType,
      senderName: userName,
      receiverId,
      message,
      timestamp: new Date()
    });
  };

  // Typing indicator
  const notifyTyping = (chatId) => {
    if (!socket) return;
    socket.emit('typing', {
      chatId,
      userName,
      userType
    });
  };

  const stopTyping = (chatId) => {
    if (!socket) return;
    socket.emit('stop-typing', { chatId });
  };

  return {
    socket,
    messages,
    onlineUsers,
    isConnected,
    sendMessage,
    notifyTyping,
    stopTyping
  };
}
```

### 3. Use Hook in Component

```javascript
// components/ChatWindow.jsx
import { useChat } from '../hooks/useChat';
import { useState, useRef, useEffect } from 'react';

export function ChatWindow({ userId, userType, userName, chatId, receiverId }) {
  const { sendMessage, messages, isConnected } = useChat(userId, userType, userName);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (messageInput.trim()) {
      sendMessage(chatId, receiverId, messageInput);
      setMessageInput('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>Chat</h2>
        <span className={isConnected ? 'status-online' : 'status-offline'}>
          {isConnected ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className="messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}
          >
            <div className="message-bubble">{msg.message}</div>
            <div className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
```

## 📡 Socket Events Reference

### Emit (Client → Server)

```javascript
socket.emit('user-join', {
  userId: 'user_001',
  userType: 'user',
  userName: 'John Doe'
});

socket.emit('send-message', {
  chatId: 'chat_001',
  senderId: 'user_001',
  senderType: 'user',
  senderName: 'John Doe',
  receiverId: 'provider_001',
  message: 'Hello!',
  timestamp: new Date()
});

socket.emit('typing', {
  chatId: 'chat_001',
  userName: 'John Doe',
  userType: 'user'
});

socket.emit('stop-typing', {
  chatId: 'chat_001'
});
```

### Listen (Server → Client)

```javascript
socket.on('receive-message', (data) => {
  // data: { chatId, senderId, senderType, senderName, message, timestamp }
  console.log('New message:', data);
});

socket.on('user-online', (data) => {
  // data: { userId, userType, userName, onlineUsers: [...] }
  console.log('User online:', data);
});

socket.on('user-offline', (data) => {
  // data: { userId, userType, userName }
  console.log('User offline:', data);
});

socket.on('user-typing', (data) => {
  // data: { chatId, userName, userType }
  console.log('User typing:', data);
});

socket.on('user-stop-typing', (data) => {
  // data: { chatId }
  console.log('User stopped typing:', data);
});
```

## 🔌 REST API Endpoints

Use these to fetch chat history or manage messages:

```javascript
// Get messages for a chat
fetch('/api/chat/messages/chat_001?limit=50&skip=0')
  .then(r => r.json())
  .then(data => console.log(data.data));

// Get chat history between two users
fetch('/api/chat/history/user_001/provider_001')
  .then(r => r.json())
  .then(data => console.log(data.data));

// Mark message as read
fetch('/api/chat/messages/msg_id/read', { method: 'PUT' })
  .then(r => r.json());

// Delete message
fetch('/api/chat/messages/msg_id', { method: 'DELETE' })
  .then(r => r.json());

// Get unread count
fetch('/api/chat/unread/user_001')
  .then(r => r.json())
  .then(data => console.log('Unread:', data.unreadCount));
```

## 🗄️ Database Schema

Messages are stored in MongoDB with this structure:

```javascript
{
  chatId: String,           // e.g., "user_001_provider_001"
  senderId: String,         // Who sent it
  senderType: String,       // "user" or "provider"
  senderName: String,       // Display name
  receiverId: String,       // Who receives it
  message: String,          // Message content
  timestamp: Date,          // When sent
  read: Boolean,            // If read
  createdAt: Date,          // Auto
  updatedAt: Date           // Auto
}
```

## 🔐 Security Considerations

### 1. Authentication
Add authentication to verify users:

```javascript
// server.js - Require auth for socket connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Verify JWT token
  if (!verifyToken(token)) {
    return next(new Error('Invalid token'));
  }
  next();
});
```

### 2. Authorization
Verify users can only chat with allowed recipients:

```javascript
socket.on('send-message', async (data) => {
  // Check if sender is allowed to message receiver
  const isAllowed = await checkChatPermission(
    data.senderId,
    data.receiverId
  );
  
  if (!isAllowed) {
    console.error('Unauthorized chat attempt');
    return;
  }
  
  // Process message...
});
```

### 3. CORS Configuration
For production, set specific origins:

```javascript
const io = socketIO(server, {
  cors: {
    origin: 'https://yourdomain.com',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

## 🧪 Testing the Integration

### Using the Test Tool
1. Go to: http://localhost:5000/socket-test.html
2. Configure user details
3. Click "Connect"
4. Click "Join Chat"
5. Type a message and click "Send Message"
6. Open DevTools (F12) to see events logged

### Using the HTML Interfaces
1. Open http://localhost:5000/provider-chat.html
2. Open http://localhost:5000/user-chat.html
3. Select the same chat in both
4. Send messages - should appear instantly in both

## 🚀 Production Deployment

### Environment Variables
```bash
# .env
SOCKET_URL=https://yourdomain.com
SOCKET_PORT=5000
MONGODB_URI=mongodb+srv://...
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Redis Adapter (For Scaling)
```javascript
// server.js
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const pubClient = createClient();
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
});
```

## 📊 Monitoring & Logging

Add logging to track chat events:

```javascript
// server.js
socket.on('send-message', async (data) => {
  console.log(`[Chat Event] ${data.senderName} → ${data.receiverId}`);
  console.log(`Message: "${data.message}"`);
  
  // Log to database for analytics
  await ChatLog.create({
    senderId: data.senderId,
    receiverId: data.receiverId,
    timestamp: new Date(),
    status: 'sent'
  });
});
```

## 🐛 Common Issues & Solutions

### Messages not arriving
- Check socket connection (DevTools console)
- Verify server is running
- Check if receiver has same chatId

### High latency
- Check network connection
- Monitor server CPU/memory
- Use Redis adapter for multiple instances
- Enable compression: `socket.io(..., { transports: ['websocket'] })`

### Memory leaks
- Always disconnect sockets on cleanup
- Remove event listeners when done
- Monitor active connections

## 📚 Additional Resources

- [Socket.io Docs](https://socket.io/docs/)
- [Socket.io Best Practices](https://socket.io/docs/v4/socket-io-best-practices/)
- [Real-time Chat Patterns](https://socket.io/blog/socket-io-3-4-with-connection-state-recovery/)
- [Production Checklist](https://socket.io/docs/v4/production-checklist/)

## ✅ Checklist for Production

- [ ] Add authentication/authorization
- [ ] Set proper CORS origins
- [ ] Use HTTPS/WSS
- [ ] Set up database persistence
- [ ] Configure Redis adapter
- [ ] Add logging and monitoring
- [ ] Set up message encryption
- [ ] Test with load tester
- [ ] Set up error handling
- [ ] Document API for team

---

**Ready to chat! 🎉**
