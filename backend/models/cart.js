const mongoose = require("mongoose")

const CartSchema = new mongoose.Schema({

  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel"
  },

  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Table"
  },

  items: [

    {

      foodItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodItem"
      },

      quantity: Number,

      price: Number

    }

  ],

  total: Number,

  createdAt: {
    type: Date,
    default: Date.now
  }

})

module.exports = mongoose.model("Cart", CartSchema)