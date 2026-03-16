const express = require("express")
const router = express.Router()
const { ObjectId } = require("mongodb")
const { getDB } = require("../db")


router.get("/categories", async (req, res) => {
  const db = getDB()
  const categories = await db.collection("categories").find().toArray()
  res.json(categories)
})


router.post("/categories", async (req, res) => {
  const db = getDB()

  const { name } = req.body

  if (!name) {
    return res.status(400).json({ error: "Category name required" })
  }

  await db.collection("categories").insertOne({
    name
  })

  res.json({ message: "Category added" })
})


router.delete("/categories/:id", async (req, res) => {
  const db = getDB()

  await db.collection("categories").deleteOne({
    _id: new ObjectId(req.params.id)
  })

  res.json({ message: "Category removed" })
})

module.exports = router