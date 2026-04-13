# Socket.io Chat System - Setup & Testing Guide

This is a real-time chat system built with **Socket.io** for both **Providers** and **Users** in the Speedy Chow appointment platform.

## 📋 What's Included

### Backend (Node.js + Express + Socket.io)
- **Socket.io Server** - Real-time bidirectional communication
- **Chat Model** - MongoDB schema for storing messages
- **Chat API Routes** - REST endpoints for chat operations
- **Event Handlers** - Socket events for join, message, typing, etc.

### Frontend (HTML + Vanilla JavaScript)
- **Provider Chat** (`public/provider-chat.html`) - Interface for service providers
- **User Chat** (`public/user-chat.html`) - Interface for customers
- Both use Socket.io client library for real-time communication

## 🚀 Quick Start

### 1. **Install Dependencies**
```bash
npm install
# or
pnpm install
```

The `socket.io` package has been added to `package.json` automatically.

### 2. **Start the Server**
```bash
npm run dev
# or
pnpm dev
```

The server will run on `http://localhost:5000`

You should see in console:
```
[Socket] New connection: socket_id_here
```

### 3. **Open Both Chat Interfaces**

#### Option A: Open in Two Browser Windows
1. **Provider Interface**: `http://localhost:5000/provider-chat.html`
2. **User Interface**: `http://localhost:5000/user-chat.html`

#### Option B: Open in Split Screen
- Use browser DevTools or arrange windows side by side

### 4. **Test Real-Time Messaging**

1. Select a chat from the list in **both** interfaces
2. Type a message in the input field
3. Press Enter or click Send (➤ button)
4. **Message appears instantly** in both windows!

## 📡 Socket Events

### Client-to-Server Events

#### `user-join`
```javascript
socket.emit('user-join', {
  userId: 'user_001',           // Unique user ID
  userType: 'user',             // 'user' or 'provider'
  userName: 'Jenny Wilson'      // Display name
});
```

#### `send-message`
```javascript
socket.emit('send-message', {
  chatId: 'user_001',                    // Chat room ID
  senderId: 'provider_001',              // Who's sending
  senderType: 'provider',                // 'user' or 'provider'
  senderName: 'Speedy Chow',             // Sender display name
  receiverId: 'user_001',                // Who receives
  message: 'Hello! How can I help?',     // Message text
  timestamp: new Date()                  // Message time
});
```

#### `typing`
```javascript
socket.emit('typing', {
  chatId: 'user_001',
  userName: 'Jenny Wilson',
  userType: 'user'
});
```

#### `stop-typing`
```javascript
socket.emit('stop-typing', {
  chatId: 'user_001'
});
```

### Server-to-Client Events

#### `receive-message`
```javascript
socket.on('receive-message', (data) => {
  console.log('New message:', data);
  // data contains: chatId, senderId, message, timestamp, etc.
});
```

#### `user-online`
```javascript
socket.on('user-online', (data) => {
  console.log('User came online:', data);
});
```

#### `user-offline`
```javascript
socket.on('user-offline', (data) => {
  console.log('User went offline:', data);
});
```

#### `user-typing`
```javascript
socket.on('user-typing', (data) => {
  console.log('User is typing:', data);
});
```

## 🗄️ Database (MongoDB)

### Chat Schema
```javascript
{
  chatId: String,           // Unique chat room ID
  senderId: String,         // Who sent the message
  senderType: String,       // 'user' or 'provider'
  senderName: String,       // Display name
  receiverId: String,       // Who receives
  message: String,          // Message content
  timestamp: Date,          // When sent
  read: Boolean,            // If message was read
  createdAt: Date,          // Auto timestamp
  updatedAt: Date           // Auto timestamp
}
```

### Indexes
- `chatId` - For fast chat lookups
- `chatId` + `timestamp` - For message ordering

## 🔌 REST API Endpoints

### Get Messages for a Chat
```
GET /api/chat/messages/:chatId?limit=50&skip=0
```
Response:
```json
{
  "success": true,
  "data": [...messages],
  "total": 42
}
```

### Get Chat History Between Two Users
```
GET /api/chat/history/:userId1/:userId2
```
Response:
```json
{
  "success": true,
  "data": [...all messages between users]
}
```

### Mark Message as Read
```
PUT /api/chat/messages/:messageId/read
```

### Delete Message
```
DELETE /api/chat/messages/:messageId
```

### Get Unread Count
```
GET /api/chat/unread/:userId
```

## 🧪 Testing Tips

### Console Logging
Both HTML files have console logging enabled. Open DevTools (F12) to see:
- Socket connection events
- Received messages
- User online/offline status
- Errors and debug info

### Test Scenarios

**Test 1: Basic Messaging**
1. Open both interfaces
2. Select same chat in both windows
3. Send a message from User → Provider should receive instantly

**Test 2: Two-Way Messaging**
1. Send message from Provider
2. Send reply from User
3. Watch messages alternate in both windows

**Test 3: Multiple Chats**
1. Open two chats (different users)
2. Send messages in both
3. Verify messages route to correct chats

**Test 4: Offline Behavior**
1. Close one window (simulates disconnect)
2. See "Offline" status in other window
3. Reopen - should reconnect and show "Online"

## ⚙️ Configuration

### Socket.io Server (server.js)
```javascript
const io = socketIO(server, {
  cors: {
    origin: "*",          // Allow all origins (set restrictive in production)
    methods: ["GET", "POST"]
  }
});
```

### Socket Client (HTML files)
```javascript
const USER_CONFIG = {
  userId: 'user_001',
  userType: 'user',
  userName: 'Jenny Wilson',
  socketUrl: 'http://localhost:5000'  // ← Change this if deploying
};

socket = io(USER_CONFIG.socketUrl, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});
```

## 🔧 Customization

### Add Your Own Users
Edit the `mockUsers` array in HTML files:
```javascript
const mockUsers = [
  { id: 'user_001', name: 'Your Name', avatar: 'YN' },
  // Add more...
];
```

### Change Socket Server URL
In both HTML files, update:
```javascript
socketUrl: 'https://your-production-url.com'
```

### Style Changes
All CSS is in `<style>` tags. Search for color values like `#00bcd4` (cyan) to customize the design.

## 📊 Active Connections

The server tracks active users in memory:
```javascript
const activeUsers = {
  'socket_id_1': { userId, userType, userName, socketId },
  'socket_id_2': { userId, userType, userName, socketId },
  // ...
};
```

This data is lost on server restart (for production, consider Redis or database).

## 🚨 Known Limitations & Future Enhancements

### Current
- ✅ Real-time 1-to-1 messaging
- ✅ User online/offline status
- ✅ Message persistence in MongoDB
- ✅ Message read status support
- ✅ Typing indicators (prepared)

### Future
- 🔄 Group chats (multiple users)
- 🔄 Message search functionality
- 🔄 File/image sharing
- 🔄 Message reactions (emoji)
- 🔄 Voice/video calls
- 🔄 Delivery confirmation
- 🔄 Message editing/deletion
- 🔄 Conversation threads

## 🐛 Troubleshooting

### Messages Not Sending
1. Check browser console for errors (F12)
2. Verify server is running: `http://localhost:5000/health`
3. Check that both windows are connected (see Socket ID in console)
4. Ensure `socketUrl` matches your server URL

### Can't Connect
```
Error: Failed to connect
```
- Server might not be running
- Port 5000 might be in use
- Change `socketUrl` to correct server address

### Messages Not Appearing
- Check that you selected the same chat in both windows
- Verify `chatId` matches in both interfaces
- Look at console logs for errors

### MongoDB Errors
- Ensure MongoDB connection string is in `.env`
- Chat model might not be available in development
- Check server logs for database errors

## 📝 Files Structure

```
project/
├── server.js                    # Socket.io server setup
├── models/
│   └── Chat.js                 # MongoDB Chat schema
├── routes/
│   └── chat.routes.js          # REST API endpoints
└── public/
    ├── provider-chat.html      # Provider interface
    └── user-chat.html          # User interface
```

## 🌐 Production Deployment

### Before Deploying:

1. **Update Socket URL** in HTML files:
```javascript
socketUrl: 'https://yourdomain.com'  // Use HTTPS
```

2. **Set Proper CORS** in server.js:
```javascript
const io = socketIO(server, {
  cors: {
    origin: "https://yourdomain.com",
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

3. **Use Redis Adapter** for multiple server instances:
```javascript
const { createAdapter } = require("@socket.io/redis-adapter");
io.adapter(createAdapter(pubClient, subClient));
```

4. **Enable HTTPS** - Socket.io requires secure connection in production

## 📞 Support

For issues or questions:
1. Check browser console (F12) for errors
2. Review server logs
3. Verify MongoDB connection
4. Check Socket.io documentation: https://socket.io/docs/

---

**Happy Chatting! 🎉**
