# Socket.io Chat - Quick Start (5 Minutes)

## ⚡ TL;DR - Get it Running NOW

### 1️⃣ Install & Start
```bash
npm install      # socket.io already added
npm run dev      # Server runs on localhost:5000
```

### 2️⃣ Open Two Browser Windows
- **Window 1**: http://localhost:5000/provider-chat.html (Provider)
- **Window 2**: http://localhost:5000/user-chat.html (User)

### 3️⃣ Send a Message
1. Click on "Jenny Wilson" in **both** windows
2. Type "Hello!" in either window
3. **BOOM** 💥 Message appears instantly in both!

---

## 📁 What Was Added

| File | What It Does |
|------|-------------|
| **server.js** | Socket.io server + event handlers |
| **models/Chat.js** | Database schema for messages |
| **routes/chat.routes.js** | REST API for chat history |
| **public/provider-chat.html** | Provider chat interface |
| **public/user-chat.html** | User chat interface |
| **public/socket-test.html** | Debug tool for testing |

---

## 🔌 Socket Events (Copy-Paste)

### Send Message
```javascript
socket.emit('send-message', {
  chatId: 'user_001',
  senderId: 'provider_001',
  senderType: 'provider',
  senderName: 'Speedy Chow',
  receiverId: 'user_001',
  message: 'Hello! How can I help?',
  timestamp: new Date()
});
```

### Join Chat
```javascript
socket.emit('user-join', {
  userId: 'provider_001',
  userType: 'provider',
  userName: 'Speedy Chow'
});
```

### Listen for Messages
```javascript
socket.on('receive-message', (data) => {
  console.log(data.message);
});
```

---

## 📊 API Endpoints

```javascript
// Get all messages
GET /api/chat/messages/chat_id?limit=50

// Get history between users
GET /api/chat/history/user_1/user_2

// Mark as read
PUT /api/chat/messages/msg_id/read

// Delete message
DELETE /api/chat/messages/msg_id

// Get unread count
GET /api/chat/unread/user_id
```

---

## 🧪 Testing Tools

### Option 1: HTML Test Files ✅ (Easiest)
```
http://localhost:5000/provider-chat.html
http://localhost:5000/user-chat.html
```

### Option 2: Debug Tool
```
http://localhost:5000/socket-test.html
```

### Option 3: Check DevTools Console
Open DevTools (F12) → Console to see all socket events logged.

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Can't connect" | Is server running? Check `npm run dev` |
| "Messages not sending" | Both windows must select same chat |
| "Socket disconnected" | Refresh page or restart server |
| "Port 5000 in use" | Change port in `.env` or kill process using port |

---

## 📝 MongoDB Schema

```javascript
{
  chatId: "user_001_provider_001",
  senderId: "user_001",
  senderType: "user",
  senderName: "Jenny Wilson",
  receiverId: "provider_001",
  message: "Hello!",
  timestamp: ISODate("2024-04-13T10:30:00Z"),
  read: false
}
```

---

## 🎯 Next Steps

1. ✅ **Test locally** - Run both HTML files and send messages
2. 📱 **Integrate into React** - See `SOCKET_INTEGRATION_GUIDE.md`
3. 🔐 **Add authentication** - Verify user tokens
4. 🚀 **Deploy to production** - Use HTTPS + Nginx + Redis
5. 📊 **Add monitoring** - Log all chat events

---

## 📚 Full Docs

- **Setup Guide**: `SOCKET_CHAT_README.md` (detailed)
- **Integration Guide**: `SOCKET_INTEGRATION_GUIDE.md` (for React)
- **This File**: Quick reference

---

## 🎓 Socket.io Basics

| Term | Meaning |
|------|---------|
| **Socket** | Connection between client & server |
| **Emit** | Send event from client to server |
| **On** | Listen for event from server |
| **Broadcast** | Send to all connected users |
| **Namespace** | Separate connection channels |
| **Room** | Group of sockets within namespace |

---

## 💡 Pro Tips

1. **Check Console Logs** - All events are logged with `[v0]` prefix
2. **Use Test Tool** - `socket-test.html` shows all events in real-time
3. **Monitor Network** - DevTools → Network → WS to see socket traffic
4. **Check Socket ID** - Each connection has unique ID in console
5. **Use Timestamps** - Always include `timestamp: new Date()` in messages

---

## ✨ Features Included

- ✅ Real-time 1-to-1 messaging
- ✅ User online/offline status
- ✅ Message persistence (MongoDB)
- ✅ Read/unread status support
- ✅ Typing indicators (prepared)
- ✅ Message history via REST API
- ✅ Automatic reconnection
- ✅ Error handling
- ✅ Beautiful UI (matching Figma design)

---

## 🎉 You're Ready!

```
npm run dev
# Open browser tabs →
# http://localhost:5000/provider-chat.html
# http://localhost:5000/user-chat.html
# Send a message and watch the magic ✨
```

**Questions?** Check the detailed guides or open DevTools console to debug.

---

**Happy Chatting! 🚀**
