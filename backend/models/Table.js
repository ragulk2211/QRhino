const mongoose = require("mongoose")

const TableSchema = new mongoose.Schema({

  tableNumber: String,

  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel"
  },

  qrCode: String,

  capacity: Number,

  status: {
    type: String,
    default: "available"
  }

})

module.exports = mongoose.model("Table", TableSchema)