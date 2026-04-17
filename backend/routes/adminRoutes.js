const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const adminController = require("../controllers/adminController")

// =========================
// Super Admin Routes
// All routes require superadmin role
// =========================

// Get all users
router.get("/users", authMiddleware(["superadmin"]), adminController.getAllUsers)

// Get all restaurants
router.get("/restaurants", authMiddleware(["superadmin"]), adminController.getAllRestaurants)

// Get all orders
router.get("/orders", authMiddleware(["superadmin"]), adminController.getAllOrders)

// Get super admin dashboard stats
router.get("/stats", authMiddleware(["superadmin"]), adminController.getSuperAdminStats)

// Create admin user
router.post("/create-admin", authMiddleware(["superadmin"]), adminController.createAdmin)

// Delete user
router.delete("/users/:userId", authMiddleware(["superadmin"]), adminController.deleteUser)

// Toggle restaurant status (activate/deactivate)
router.patch("/restaurants/:restaurantId/toggle", authMiddleware(["superadmin"]), adminController.toggleRestaurantStatus)

// Delete restaurant
router.delete("/restaurants/:restaurantId", authMiddleware(["superadmin"]), adminController.deleteRestaurant)

module.exports = router