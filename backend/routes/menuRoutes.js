const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")

const fs = require("fs")
const { getDB } = require("../db")

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/
    const ext = allowed.test(path.extname(file.originalname).toLowerCase())
    const mime = allowed.test(file.mimetype)
    if (ext && mime) cb(null, true)
    else cb(new Error("Only image files are allowed"))
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})

// GET all menu items
router.get("/menu", async (req, res) => {
  try {
    const db = getDB()
    const menu = await db.collection("menu").find().toArray()
    res.json(menu)
  } catch (error) {
    console.error("Error fetching menu:", error.message)
    res.status(500).json({ error: "Failed to fetch menu" })
  }
})

// POST add a new menu item (with optional image upload)
router.post("/menu", upload.single("image"), async (req, res) => {
  try {
    const db = getDB()
    const { name, desc, price, kcal, time, category } = req.body

    if (!name || !category) {
      return res.status(400).json({ error: "name and category are required" })
    }

    const imgUrl = req.file
      ? `http://localhost:5000/uploads/${req.file.filename}`
      : ""

    const newItem = {
      name,
      desc: desc || "",
      price: price || "0.00",
      kcal: kcal || "0",
      time: time || "N/A",
      category,
      img: imgUrl,
      createdAt: new Date()
    }

    const result = await db.collection("menu").insertOne(newItem)
    res.status(201).json({ message: "Item added", id: result.insertedId, item: newItem })
  } catch (error) {
    console.error("Error adding menu item:", error.message)
    res.status(500).json({ error: "Failed to add menu item" })
  }
})

module.exports = router
