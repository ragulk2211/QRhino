const mongoose = require("mongoose")

const PaymentSchema = new mongoose.Schema({

  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },

  amount: Number,

  method: String,

  status: String,

  createdAt: {
    type: Date,
    default: Date.now
  }

})

module.exports = mongoose.model("Payment", PaymentSchema)