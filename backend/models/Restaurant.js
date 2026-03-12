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
