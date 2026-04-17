const User = require("../models/users")
const Restaurant = require("../models/Restaurant")
const Order = require("../models/order")
const bcrypt = require("bcryptjs")

// =========================
// Get All Users (Super Admin only)
// =========================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 })
    res.status(200).json({
      success: true,
      users
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    })
  }
}

// =========================
// Get All Restaurants (Super Admin only)
// =========================
const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 })
    res.status(200).json({
      success: true,
      restaurants
    })
  } catch (error) {
    console.error("Error fetching restaurants:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurants"
    })
  }
}

// =========================
// Get All Orders (Super Admin only)
// =========================
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("restaurantId", "name")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
    res.status(200).json({
      success: true,
      orders
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    })
  }
}

// =========================
// Get Dashboard Stats (Super Admin)
// =========================
const getSuperAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalRestaurants = await Restaurant.countDocuments()
    const totalOrders = await Order.countDocuments()
    
    // Get orders by status
    const pendingOrders = await Order.countDocuments({ status: "pending" })
    const completedOrders = await Order.countDocuments({ status: "completed" })
    
    // Get user breakdown by role
    const adminCount = await User.countDocuments({ role: "admin" })
    const kitchenCount = await User.countDocuments({ role: "kitchen" })
    const userCount = await User.countDocuments({ role: "user" })
    
    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalRestaurants,
        totalOrders,
        pendingOrders,
        completedOrders,
        adminCount,
        kitchenCount,
        userCount
      }
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats"
    })
  }
}

// =========================
// Create Admin User (Super Admin only)
// =========================
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, restaurantId } = req.body
    
    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      restaurantId: restaurantId || null
    })
    
    await newAdmin.save()
    
    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      user: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      }
    })
  } catch (error) {
    console.error("Error creating admin:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create admin"
    })
  }
}

// =========================
// Delete User (Super Admin only)
// =========================
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params
    
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }
    
    // Prevent deleting super admin
    if (user.role === "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete super admin"
      })
    }
    
    await User.findByIdAndDelete(userId)
    
    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete user"
    })
  }
}

// =========================
// Toggle Restaurant Status (Super Admin)
// =========================
const toggleRestaurantStatus = async (req, res) => {
  try {
    const { restaurantId } = req.params
    
    const restaurant = await Restaurant.findById(restaurantId)
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      })
    }
    
    restaurant.isActive = !restaurant.isActive
    await restaurant.save()
    
    res.status(200).json({
      success: true,
      message: `Restaurant ${restaurant.isActive ? "activated" : "deactivated"} successfully`,
      restaurant
    })
  } catch (error) {
    console.error("Error toggling restaurant status:", error)
    res.status(500).json({
      success: false,
      message: "Failed to toggle restaurant status"
    })
  }
}

// =========================
// Delete Restaurant (Super Admin only)
// =========================
const deleteRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params
    
    const restaurant = await Restaurant.findById(restaurantId)
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      })
    }
    
    await Restaurant.findByIdAndDelete(restaurantId)
    
    res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting restaurant:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete restaurant"
    })
  }
}

module.exports = {
  getAllUsers,
  getAllRestaurants,
  getAllOrders,
  getSuperAdminStats,
  createAdmin,
  deleteUser,
  toggleRestaurantStatus,
  deleteRestaurant
}