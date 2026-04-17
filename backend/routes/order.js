import express from "express"
import Order from "../models/Order.js"

const router = express.Router()

router.post("/create", async (req,res)=>{

 const { tableNumber, items, total } = req.body

 const order = await Order.create({
  tableNumber,
  items,
  total,
  status:"Pending"
 })

 res.json(order)
})

export default router