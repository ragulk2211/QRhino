require("dotenv").config()
const express = require("express")
const cors = require("cors")
const path = require("path")
const { connectDB } = require("./db")
const menuRoutes = require("./routes/menuRoutes")

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.use("/", menuRoutes)

async function startServer() {
  console.log("Starting server...")
  await connectDB()
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

startServer()
