const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")

const Restaurant = require("../models/Restaurant")

// Multer storage config for restaurant images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

// GET all restaurants
router.get("/", async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 })
    res.json(restaurants)
  } catch (error) {
    console.error("Error fetching restaurants:", error.message)
    res.status(500).json({ error: "Failed to fetch restaurants" })
  }
})

// GET single restaurant
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" })
    }
    res.json(restaurant)
  } catch (error) {
    console.error("Error fetching restaurant:", error.message)
    res.status(500).json({ error: "Failed to fetch restaurant" })
  }
})

// POST create restaurant (with optional image)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, location, phone } = req.body
    const image = req.file ? req.file.filename : null

    const restaurant = new Restaurant({ name, location, phone, image })
    await restaurant.save()

    res.status(201).json(restaurant)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT update restaurant (with optional image)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, location, phone } = req.body
    const image = req.file ? req.file.filename : undefined

    const updateData = { name, location, phone }
    if (image) {
      updateData.image = image
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" })
    }

    res.json(restaurant)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE restaurant
router.delete("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id)
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" })
    }
    res.json({ message: "Restaurant deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
