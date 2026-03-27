const mongoose = require("mongoose")

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  discountPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: {
    type: Number,
    default: null // null means no limit
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    default: null
  },
  validUntil: {
    type: Date,
    default: null
  },
  usageCount: {
    type: Number,
    default: 0
  },
  maxUsage: {
    type: Number,
    default: null // null means unlimited
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Method to validate coupon
couponSchema.methods.isValid = function() {
  const now = new Date()
  
  // Check if active
  if (!this.isActive) return false
  
  // Check validFrom date
  if (this.validFrom && now < this.validFrom) return false
  
  // Check validUntil date
  if (this.validUntil && now > this.validUntil) return false
  
  // Check max usage
  if (this.maxUsage && this.usageCount >= this.maxUsage) return false
  
  return true
}

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(orderAmount) {
  if (orderAmount < this.minOrderAmount) {
    return { valid: false, message: `Minimum order amount of ₹${this.minOrderAmount} required` }
  }
  
  let discountAmount = (orderAmount * this.discountPercent) / 100
  
  // Apply max discount limit if set
  if (this.maxDiscountAmount && discountAmount > this.maxDiscountAmount) {
    discountAmount = this.maxDiscountAmount
  }
  
  return {
    valid: true,
    discountAmount: Math.round(discountAmount),
    discountPercent: this.discountPercent
  }
}

module.exports = mongoose.model("Coupon", couponSchema)
