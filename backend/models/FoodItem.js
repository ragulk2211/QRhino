const mongoose = require("mongoose")

const FoodItemSchema = new mongoose.Schema({

  name: String,

  price: Number,

  description: String,

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },

  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel"
  },

  image: String,

  foodType: {
    type: String,
    enum: ['veg', 'non-veg'],
    default: 'veg'
  },

  available: {
    type: Boolean,
    default: true
  }

})

module.exports = mongoose.model("FoodItem", FoodItemSchema)