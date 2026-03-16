const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({

  name: String,

  email: String,

  password: String,

  role: {
    type: String,
    enum: ["superadmin", "admin", "kitchen", "customer"]
  },

  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

})

module.exports = mongoose.model("User", UserSchema)