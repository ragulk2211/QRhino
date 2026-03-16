const mongoose = require("mongoose")

const QRSessionSchema = new mongoose.Schema({

  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Table"
  },

  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel"
  },

  sessionId: String,

  startedAt: {
    type: Date,
    default: Date.now
  }

})

module.exports = mongoose.model("QRSession", QRSessionSchema)