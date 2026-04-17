const mongoose = require("mongoose")

const RestaurantSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  location: {
    type: String
  },

  phone: {
    type: String
  },

  email: {
    type: String
  },

  description: {
    type: String
  },

  cuisine: {
    type: String
  },

  priceRange: {
    type: Number,
    default: 0
  },

  deliveryTime: {
    type: Number,
    default: 0
  },

  isOpen: {
    type: Boolean,
    default: true
  },

  rating: {
    type: Number,
    default: 0
  },

  timings: {
    type: String
  },

  image: {
    type: String,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

})

module.exports = mongoose.model("Restaurant", RestaurantSchema)
