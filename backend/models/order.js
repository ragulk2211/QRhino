const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({

 tableNumber:Number,

 items:[
  {
   name:String,
   price:Number,
   quantity: {
     type: Number,
     default: 1
   },
   foodType: {
    type: String,
    enum: ['veg', 'non-veg'],
    default: 'veg'
   }
  }
 ],

 total:Number,

 tokenNumber: {
  type: Number,
  default: () => Math.floor(1000 + Math.random() * 9000)
 },

 status:{
  type:String,
  default:"Pending"
 },

 preparingTime: {
  type: Number,
  default: 15
 },

 createdAt:{
  type:Date,
  default:Date.now
 }

})

module.exports = mongoose.model("Order",orderSchema)