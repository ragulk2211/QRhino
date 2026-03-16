const mongoose = require("mongoose")

let db = null

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)

    db = conn.connection.db

    console.log("✅ MongoDB Connected")
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message)
    process.exit(1)
  }
}

function getDB() {
  return db
}

module.exports = { connectDB, getDB }