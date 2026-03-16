const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({

 tableNumber:Number,

 items:[
  {
   name:String,
   price:Number
  }
 ],

 total:Number,

 tokenNumber: {
  type: Number,
  default: () => Math.floor(1000 + Math.random() * 9000) // 4-digit token
 },

 status:{
  type:String,
  default:"Pending"
 },

 createdAt:{
  type:Date,
  default:Date.now
 }

})

module.exports = mongoose.model("Order",orderSchema)
