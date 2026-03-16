const mongoose = require("mongoose")

const MenuSchema = new mongoose.Schema({
  name: String,
  desc: String,
  price: Number,
  category: String,
  image: String,
  kcal: String,
  time: String,
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
