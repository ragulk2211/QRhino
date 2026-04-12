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

// Single multer instance used as middleware directly on routes
const upload = multer({ storage }).single("image")

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

// GET single restaurant by ID
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" })
    }
    res.json(restaurant)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch restaurant" })
  }
})

// POST create restaurant — multer runs BEFORE the handler, so req.body is always ready
router.post("/", upload, async (req, res) => {
  try {
    const { name = "", location = "", phone = "", email = "", description = "", cuisine = "", priceRange = 0, deliveryTime = 0, isOpen = true, rating = 0, timings = "" } = req.body
    const image = req.file ? req.file.filename : null

    // Parse location if it's a JSON string
    let locationString = location
    if (typeof location === 'string' && location.startsWith('{')) {
      try {
        const locationObj = JSON.parse(location)
        locationString = `${locationObj.address || ''}, ${locationObj.city || ''}, ${locationObj.state || ''} - ${locationObj.pincode || ''}`.trim()
        if (locationObj.landmark) {
          locationString += ` (Near ${locationObj.landmark})`
        }
      } catch (e) {
        locationString = location
      }
    }

    const restaurant = new Restaurant({ 
      name, 
      location: locationString, 
      phone, 
      email,
      description,
      cuisine,
      priceRange,
      deliveryTime,
      isOpen,
      rating,
      timings,
      image 
    })
    await restaurant.save()

    res.status(201).json(restaurant)
  } catch (error) {
    console.error("Error creating restaurant:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// PUT update restaurant
router.put("/:id", upload, async (req, res) => {
  try {
    const { name = "", location = "", phone = "", email = "", description = "", cuisine = "", priceRange = 0, deliveryTime = 0, isOpen = true, rating = 0, timings = "" } = req.body
    
    // Parse location if it's a JSON string
    let locationString = location
    if (typeof location === 'string' && location.startsWith('{')) {
      try {
        const locationObj = JSON.parse(location)
        locationString = `${locationObj.address || ''}, ${locationObj.city || ''}, ${locationObj.state || ''} - ${locationObj.pincode || ''}`.trim()
        if (locationObj.landmark) {
          locationString += ` (Near ${locationObj.landmark})`
        }
      } catch (e) {
        locationString = location
      }
    }

    const updateData = { 
      name, 
      location: locationString, 
      phone, 
      email,
      description,
      cuisine,
      priceRange,
      deliveryTime,
      isOpen,
      rating,
      timings
    }

    // Only update image if a new file was uploaded
    if (req.file) {
      updateData.image = req.file.filename
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
    console.error("Error updating restaurant:", error.message)
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
    console.error("Error deleting restaurant:", error.message)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router