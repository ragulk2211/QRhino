const express = require("express")
const router = express.Router()
const Order = require("../models/Order")

// Create Order
router.post("/create", async (req,res)=>{
 try{
  console.log("Incoming Order:", req.body)

  const order = await Order.create(req.body)

  res.json(order)

 }catch(err){
  console.error("Order Error:", err)
  res.status(500).json({error:err.message})
 }
})

// Get All Orders (Kitchen)
router.get("/all", async (req,res)=>{

 const orders = await Order.find().sort({createdAt:-1})

 res.json(orders)

})

// Update Order Status
router.put("/:id", async (req,res)=>{

 try{

  const { status, preparingTime } = req.body

  const updateData = { status }
  if (preparingTime !== undefined) {
   updateData.preparingTime = preparingTime
  }

  const order = await Order.findByIdAndUpdate(
   req.params.id,
   updateData,
   { new: true }
  )

  res.json(order)

 }catch(err){
  res.status(500).json({error:err.message})
 }

})

module.exports = router
