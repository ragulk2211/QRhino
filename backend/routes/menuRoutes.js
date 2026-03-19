const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const Menu = require("../models/Menu")

const uploadsDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

// GET all menu items (optionally filter by restaurantId and foodType)
router.get("/", async (req, res) => {
  try {
    const { restaurantId, foodType } = req.query
    const filter = {}
    if (restaurantId) filter.restaurantId = restaurantId
    if (foodType) filter.foodType = foodType
    const menu = await Menu.find(filter).sort({ createdAt: -1 })
    res.json(menu)
  } catch (error) {
    console.error("Error fetching menu:", error.message)
    res.status(500).json({ error: "Failed to fetch menu" })
  }
})

// GET featured menu items
router.get("/featured", async (req, res) => {
  try {
    const menu = await Menu.find().sort({ createdAt: -1 }).limit(8)
    res.json(menu)
  } catch (error) {
    console.error("Error fetching featured items:", error.message)
    res.status(500).json({ error: "Failed to fetch featured items" })
  }
})

// POST create menu item with optional image upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, desc, price, discount, category, kcal, time, restaurantId, foodType } = req.body
    const image = req.file ? req.file.filename : null

    const menuItem = new Menu({ 
      name, 
      desc, 
      price, 
      discount: discount || 0, 
      category, 
      kcal, 
      time, 
      image, 
      restaurantId: restaurantId || null, 
      foodType: foodType || 'veg' 
    })
    await menuItem.save()

    res.status(201).json(menuItem)
  } catch (error) {
    console.error("Error creating menu item:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// PUT update menu item
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, desc, price, discount, category, kcal, time, restaurantId, foodType } = req.body
    const image = req.file ? req.file.filename : undefined

    const updateData = { name, desc, price, discount, category, kcal, time, restaurantId, foodType }
    if (image) {
      updateData.image = image
    }

    const menuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" })
    }

    res.json(menuItem)
  } catch (error) {
    console.error("Error updating menu item:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// DELETE menu item
router.delete("/:id", async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndDelete(req.params.id)
    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" })
    }
    res.json({ message: "Menu item deleted successfully" })
  } catch (error) {
    console.error("Error deleting menu item:", error.message)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
