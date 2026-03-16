const { ObjectId } = require("mongodb")
const { getDB } = require("../db")

exports.getMenu = async (req, res) => {
  try {
    const db = getDB()
    const menu = await db.collection("menu").find().toArray()
    res.json(menu)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch menu" })
  }
}

exports.addMenu = async (req, res) => {
  try {
    const db = getDB()
    const { name, desc, price, kcal, time, category } = req.body

    const imgUrl = req.file
      ? `http://localhost:5000/uploads/${req.file.filename}`
      : ""

    const newItem = {
      name,
      desc,
      price,
      kcal,
      time,
      category,
      img: imgUrl,
      createdAt: new Date()
    }

    const result = await db.collection("menu").insertOne(newItem)

    res.status(201).json(result)

  } catch (error) {
    res.status(500).json({ error: "Failed to add item" })
  }
}

exports.deleteMenu = async (req, res) => {
  try {
    const db = getDB()

    await db.collection("menu").deleteOne({
      _id: new ObjectId(req.params.id)
    })

    res.json({ message: "Item removed successfully" })

  } catch (error) {
    res.status(500).json({ error: "Delete failed" })
  }
}

exports.updateMenu = async (req, res) => {
  try {
    const db = getDB()

    const { name, desc, price, kcal, time, category } = req.body

    await db.collection("menu").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          name,
          desc,
          price,
          kcal,
          time,
          category
        }
      }
    )

    res.json({ message: "Updated successfully" })

  } catch (error) {
    res.status(500).json({ error: "Update failed" })
  }
}