const mongoose = require("mongoose")

const MenuSchema = new mongoose.Schema({
  name: String,
  desc: String,
  price: Number,
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  category: String,
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null
  },
  image: String,
  kcal: Number,
  time: Number,
  foodType: {
    type: String,
    enum: ['veg', 'non-veg'],
    default: 'veg'
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("Menu", MenuSchema)
