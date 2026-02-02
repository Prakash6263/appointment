const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const routes = require("./routes")

const app = express()

// Middlewares
app.use(express.json())
app.use(cors())

app.use("/uploads", express.static("uploads"))

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err))

app.use("/api", routes)

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "API is running for test" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
