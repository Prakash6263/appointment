const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");
const Service = require("./models/Service"); // ✅ import



const routes = require("./routes")

const app = express()

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Socket.io configuration
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// MongoDB Connections
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err))


// async function updateCategory() {
//   try {
//     await Service.updateMany(
//       { category: { $exists: false } },
//       { $set: { category: "General" } }
//     );

//     console.log("✅ Categories added");
//   } catch (err) {
//     console.error("❌ Error updating categories:", err);
//   }
// }
// updateCategory()

app.use("/api", routes)

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "API is running for testss" })
})

// Store active connections
const activeUsers = {};

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`[Socket] New connection: ${socket.id}`);

  // User joins the chat
  socket.on("user-join", (data) => {
    const { userId, userType, userName } = data;
    activeUsers[socket.id] = { userId, userType, userName, socketId: socket.id };
    
    console.log(`[Socket] ${userType} ${userName} (${userId}) joined - Socket ID: ${socket.id}`);
    
    // Broadcast that a user is online
    io.emit("user-online", {
      userId,
      userType,
      userName,
      socketId: socket.id,
      onlineUsers: Object.values(activeUsers)
    });
  });

  // Handle incoming messages
  socket.on("send-message", async (data) => {
    const { chatId, senderId, senderType, senderName, receiverId, message, timestamp } = data;
    
    console.log(`[Socket] Message from ${senderType} ${senderName}: ${message}`);

    // Emit message to the receiver
    io.emit("receive-message", {
      chatId,
      senderId,
      senderType,
      senderName,
      receiverId,
      message,
      timestamp: timestamp || new Date(),
      socketId: socket.id
    });

    // Try to save message to database if Chat model exists
    try {
      const Chat = require("./models/Chat");
      if (Chat) {
        await Chat.create({
          chatId,
          senderId,
          senderType,
          senderName,
          receiverId,
          message,
          timestamp: timestamp || new Date(),
          read: false
        });
      }
    } catch (error) {
      console.log("[Socket] Chat model not available, message not saved to DB (development mode)");
    }
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    const { chatId, userName, userType } = data;
    socket.broadcast.emit("user-typing", {
      chatId,
      userName,
      userType
    });
  });

  // Handle stop typing
  socket.on("stop-typing", (data) => {
    const { chatId } = data;
    socket.broadcast.emit("user-stop-typing", {
      chatId
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    const user = activeUsers[socket.id];
    if (user) {
      console.log(`[Socket] ${user.userType} ${user.userName} disconnected`);
      delete activeUsers[socket.id];
      
      io.emit("user-offline", {
        userId: user.userId,
        userType: user.userType,
        userName: user.userName
      });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
