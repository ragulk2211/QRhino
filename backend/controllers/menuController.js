const Menu = require("../models/Menu")

exports.getMenu = async (req, res) => {
  try {
    const menu = await Menu.find()
    res.json(menu)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch menu" })
  }
}

exports.addMenu = async (req, res) => {
  try {
    const { name, desc, price, kcal, time, category } = req.body

    const imgUrl = req.file
      ? `http://localhost:5000/uploads/${req.file.filename}`
      : ""

    const newItem = new Menu({
      name,
      desc,
      price,
      kcal,
      time,
      category,
      image: imgUrl
    })

    await newItem.save()

    res.status(201).json(newItem)

  } catch (error) {
    res.status(500).json({ error: "Failed to add item" })
  }
}