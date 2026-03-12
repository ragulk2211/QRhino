const express = require("express")
const router = express.Router()
const Category = require("../models/categories")

// GET all categories (optionally filter by restaurantId)
router.get("/", async (req, res) => {
  try {
    const { restaurantId } = req.query
    const filter = restaurantId ? { restaurantId } : {}
    const categories = await Category.find(filter).sort({ createdAt: -1 })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST create category
router.post("/", async (req, res) => {
  try {
    const { name, restaurantId } = req.body
    const category = new Category({ name, restaurantId: restaurantId || null })
    await category.save()
    res.status(201).json(category)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT update category
router.put("/:id", async (req, res) => {
  try {
    const { name } = req.body
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    )
    if (!category) {
      return res.status(404).json({ error: "Category not found" })
    }
    res.json(category)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE category
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id)
    if (!category) {
      return res.status(404).json({ error: "Category not found" })
    }
    res.json({ message: "Category deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
