const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")

const fs = require("fs")

const {
  getMenu,
  addMenu,
  deleteMenu,
  updateMenu
} = require("../controllers/menuController")

const uploadsDir = path.join(__dirname, "../uploads")

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}


const Menu = require("../models/Menu")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
  }
})

const upload = multer({ storage })


router.get("/menu", getMenu)

router.post("/menu", upload.single("image"), addMenu)

router.delete("/menu/:id", deleteMenu)

router.put("/menu/:id", updateMenu)



// GET all menu items (optionally filter by restaurantId)
router.get("/menu", async (req, res) => {
  try {
    const { restaurantId } = req.query
    const filter = restaurantId ? { restaurantId } : {}
    const menu = await Menu.find(filter).sort({ createdAt: -1 })
    res.json(menu)
  } catch (error) {
    console.error("Error fetching menu:", error.message)
    res.status(500).json({ error: "Failed to fetch menu" })
  }
})

// POST create menu item with optional image upload
router.post("/menu", upload.single("image"), async (req, res) => {
  try {
    const { name, desc, price, category, kcal, time, restaurantId } = req.body
    const image = req.file ? req.file.filename : null

    const menuItem = new Menu({ name, desc, price, category, kcal, time, image, restaurantId: restaurantId || null })
    await menuItem.save()

    res.status(201).json(menuItem)
  } catch (error) {
    console.error("Error creating menu item:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// PUT update menu item
router.put("/menu/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, desc, price, category, kcal, time, restaurantId } = req.body
    const image = req.file ? req.file.filename : undefined

    const updateData = { name, desc, price, category, kcal, time, restaurantId }
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
router.delete("/menu/:id", async (req, res) => {
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