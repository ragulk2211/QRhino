const express = require("express")
const router = express.Router()

const Payment = require("../models/payment")

// Create payment
router.post("/", async (req, res) => {

  try {

    const { orderId, amount, method } = req.body

    const payment = new Payment({
      orderId,
      amount,
      method,
      status: "paid"
    })

    await payment.save()

    res.json({
      message: "Payment successful",
      payment
    })

  } catch (error) {

    res.status(500).json({ error: error.message })

  }

})

// Get payments
router.get("/", async (req, res) => {

  const payments = await Payment.find()
  .populate("orderId")

  res.json(payments)

})

module.exports = router