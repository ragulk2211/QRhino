require("dotenv").config()
const { MongoClient } = require("mongodb")

const url = process.env.MONGO_URI

console.log("Loaded Mongo URI:", url ? "YES" : "NO")

const client = new MongoClient(url)

let db = null

async function connectDB() {
  try {
    console.log("Connecting to MongoDB...")
    await client.connect()
    db = client.db("foodmenu")
    console.log("✅ MongoDB Atlas Connected")
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message)
    console.warn("⚠️  Server will start but DB features won't work.")
  }
}

function getDB() {
  if (!db) {
    throw new Error("Database not connected")
  }
  return db
}

module.exports = { connectDB, getDB }
