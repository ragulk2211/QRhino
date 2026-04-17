const express = require("express")
const router = express.Router()
const Coupon = require("../models/coupon")

// Validate and calculate discount for a coupon
router.post("/validate", async (req, res) => {
  try {
    const { code, orderAmount } = req.body
    
    if (!code || !orderAmount) {
      return res.status(400).json({ 
        success: false, 
        message: "Coupon code and order amount are required" 
      })
    }
    
    // Find the coupon
    const coupon = await Coupon.findOne({ code: code.toUpperCase() })
    
    if (!coupon) {
      return res.status(404).json({ 
        success: false, 
        message: "Invalid coupon code" 
      })
    }
    
    // Check if coupon is valid
    if (!coupon.isValid()) {
      if (coupon.usageCount >= coupon.maxUsage && coupon.maxUsage) {
        return res.status(400).json({ 
          success: false, 
          message: "This coupon has reached maximum usage limit" 
        })
      }
      return res.status(400).json({ 
        success: false, 
        message: "This coupon is no longer valid" 
      })
    }
    
    // Calculate discount
    const discountResult = coupon.calculateDiscount(orderAmount)
    
    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountPercent: coupon.discountPercent,
        minOrderAmount: coupon.minOrderAmount
      },
      ...discountResult
    })
    
  } catch (error) {
    console.error("Error validating coupon:", error)
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    })
  }
})

// Apply coupon (increment usage count after order is placed)
router.post("/apply", async (req, res) => {
  try {
    const { code } = req.body
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: "Coupon code is required" 
      })
    }
    
    // Find and update the coupon
    const coupon = await Coupon.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usageCount: 1 } },
      { new: true }
    )
    
    if (!coupon) {
      return res.status(404).json({ 
        success: false, 
        message: "Invalid coupon code" 
      })
    }
    
    res.json({
      success: true,
      message: "Coupon applied successfully",
      coupon: {
        code: coupon.code,
        usageCount: coupon.usageCount
      }
    })
    
  } catch (error) {
    console.error("Error applying coupon:", error)
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    })
  }
})

// Get all coupons (for admin)
router.get("/", async (req, res) => {
  try {
    const { active } = req.query
    let coupons = await Coupon.find().sort({ createdAt: -1 })
    
    // If active=true, only return valid coupons
    if (active === 'true') {
      coupons = coupons.filter(c => c.isValid())
    }
    
    res.json({ success: true, coupons })
  } catch (error) {
    console.error("Error fetching coupons:", error)
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    })
  }
})

// Get only active (valid) coupons for display
router.get("/active", async (req, res) => {
  try {
    const now = new Date()
    const coupons = await Coupon.find({
      isActive: true,
      $or: [{ validFrom: null }, { validFrom: { $lte: now } }],
      $or: [{ validUntil: null }, { validUntil: { $gte: now } }]
    }).sort({ createdAt: -1 })
    
    // Filter out expired ones manually due to complex query
    const validCoupons = coupons.filter(c => c.isValid())
    
    res.json({ success: true, coupons: validCoupons })
  } catch (error) {
    console.error("Error fetching active coupons:", error)
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    })
  }
})

// Create a new coupon (for admin)
router.post("/", async (req, res) => {
  try {
    const { code, description, discountPercent, minOrderAmount, maxDiscountAmount, isActive, validFrom, validUntil, maxUsage } = req.body
    
    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() })
    if (existingCoupon) {
      return res.status(400).json({ 
        success: false, 
        message: "Coupon code already exists" 
      })
    }
    
    const coupon = new Coupon({
      code,
      description,
      discountPercent,
      minOrderAmount,
      maxDiscountAmount,
      isActive,
      validFrom,
      validUntil,
      maxUsage
    })
    
    await coupon.save()
    
    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon
    })
  } catch (error) {
    console.error("Error creating coupon:", error)
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    })
  }
})

// Update a coupon (for admin)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    
    // Remove code from updates if present (to prevent changing unique code)
    delete updates.code
    
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
    
    if (!coupon) {
      return res.status(404).json({ 
        success: false, 
        message: "Coupon not found" 
      })
    }
    
    res.json({
      success: true,
      message: "Coupon updated successfully",
      coupon
    })
  } catch (error) {
    console.error("Error updating coupon:", error)
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    })
  }
})

// Delete a coupon (for admin)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    
    const coupon = await Coupon.findByIdAndDelete(id)
    
    if (!coupon) {
      return res.status(404).json({ 
        success: false, 
        message: "Coupon not found" 
      })
    }
    
    res.json({
      success: true,
      message: "Coupon deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    })
  }
})

// Seed some default coupons
router.post("/seed", async (req, res) => {
  try {
    const defaultCoupons = [
      {
        code: "WELCOME10",
        description: "Welcome discount for new users",
        discountPercent: 10,
        minOrderAmount: 100,
        maxDiscountAmount: 50,
        isActive: true
      },
      {
        code: "SAVE20",
        description: "Flat 20% off on orders above ₹500",
        discountPercent: 20,
        minOrderAmount: 500,
        maxDiscountAmount: 200,
        isActive: true
      },
      {
        code: "FREESHIP",
        description: "Free delivery on orders above ₹300",
        discountPercent: 100,
        minOrderAmount: 300,
        maxDiscountAmount: 50,
        isActive: true
      },
      {
        code: "SPECIAL50",
        description: "Special 50% off for limited time",
        discountPercent: 50,
        minOrderAmount: 200,
        maxDiscountAmount: 100,
        isActive: true,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Valid for 7 days
      }
    ]
    
    for (const couponData of defaultCoupons) {
      const existing = await Coupon.findOne({ code: couponData.code })
      if (!existing) {
        await Coupon.create(couponData)
      }
    }
    
    res.json({
      success: true,
      message: "Default coupons seeded successfully"
    })
  } catch (error) {
    console.error("Error seeding coupons:", error)
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    })
  }
})

module.exports = router
