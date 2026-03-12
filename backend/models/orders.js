const mongoose = require("mongoose")

const OrderSchema = new mongoose.Schema({

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

  totalAmount: Number,

  status: {
    type: String,
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

})

module.exports = mongoose.model("Order", OrderSchema)