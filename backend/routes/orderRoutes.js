const express = require("express")
const router = express.Router()
const Order = require("../models/Order")

// Create Order
router.post("/create", async (req,res)=>{

 try{

  const order = await Order.create(req.body)

  res.json(order)

 }catch(err){
  res.status(500).json({error:err.message})
 }

})

// Get All Orders (Kitchen)
router.get("/all", async (req,res)=>{

 const orders = await Order.find().sort({createdAt:-1})

 res.json(orders)

})

module.exports = router
