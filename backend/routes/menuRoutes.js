const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const Menu = require("../models/Menu")

console.log("✅ menuRoutes loaded")

/* Upload folder */
const uploadsDir = path.join(__dirname, "../uploads")

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

/* Multer storage */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    )
  }
})

const upload = multer({ storage })

router.get("/", async (req, res) => {
  try {
    console.log("✅ GET /api/menu hit")

    const { restaurantId } = req.query

    const filter = restaurantId ? { restaurantId } : {}

    const menu = await Menu.find(filter).sort({ createdAt: -1 })

    res.status(200).json(menu)
  } catch (error) {
    console.error("❌ Error fetching menu:", error)
    res.status(500).json({
      error: "Failed to fetch menu"
    })
  }
})


/* =========================
   GET FEATURED ITEMS
========================= */

router.get("/featured", async (req, res) => {
  try {
    console.log("✅ GET /api/menu/featured hit")

    const featured = await Menu.find()
      .sort({ createdAt: -1 })
      .limit(8)

    res.status(200).json(featured)
  } catch (error) {
    console.error("❌ Error fetching featured:", error)
    res.status(500).json({
      error: "Failed to fetch featured items"
    })
  }
})


// POST create menu item with optional image upload

/* =========================
   CREATE MENU ITEM
========================= */

router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("✅ POST /api/menu hit")

    const {
      name,
      desc,
      price,
      category,
      kcal,
      time,
      restaurantId
    } = req.body

    const image = req.file ? req.file.filename : null

    const newMenu = new Menu({
      name,
      desc,
      price,
      category,
      kcal,
      time,
      image,
      restaurantId: restaurantId || null
    })

    await newMenu.save()

    res.status(201).json(newMenu)
  } catch (error) {
    console.error("❌ Error creating menu:", error)
    res.status(500).json({
      error: "Failed to create menu item"
    })
  }
})


// PUT update menu item

/* =========================
   UPDATE MENU ITEM
========================= */

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    console.log("✅ PUT /api/menu/:id hit")

    const {
      name,
      desc,
      price,
      category,
      kcal,
      time,
      restaurantId
    } = req.body

    const updateData = {
      name,
      desc,
      price,
      category,
      kcal,
      time,
      restaurantId
    }

    if (req.file) {
      updateData.image = req.file.filename
    }

    const updated = await Menu.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    )

    if (!updated) {
      return res.status(404).json({
        error: "Menu item not found"
      })
    }

    res.status(200).json(updated)
  } catch (error) {
    console.error("❌ Error updating menu:", error)
    res.status(500).json({
      error: "Failed to update menu item"
    })
  }
})


// DELETE menu item

/* =========================
   DELETE MENU ITEM
========================= */

router.delete("/:id", async (req, res) => {
  try {
    console.log("✅ DELETE /api/menu/:id hit")

    const deleted = await Menu.findByIdAndDelete(req.params.id)

    if (!deleted) {
      return res.status(404).json({
        error: "Menu item not found"
      })
    }

    res.status(200).json({
      message: "Menu item deleted successfully"
    })
  } catch (error) {
    console.error("❌ Error deleting menu:", error)
    res.status(500).json({
      error: "Failed to delete menu item"
    })
  }
})

module.exports = router