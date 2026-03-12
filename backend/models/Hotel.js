const mongoose = require("mongoose")

const HotelSchema = new mongoose.Schema({

  name: String,

  slug: String,

  logo: String,

  location: String,

  createdAt: {
    type: Date,
    default: Date.now
  }

})

module.exports = mongoose.model("Hotel", HotelSchema)