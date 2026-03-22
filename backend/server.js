require("dotenv").config()

const express = require("express")
const cors = require("cors")
const path = require("path")

const { connectDB } = require("./config/db")

const menuRoutes = require("./routes/menuRoutes")
console.log("🔥 USING menuRoutes from routes/menuRoutes.js")
const restaurantRoutes = require("./routes/restaurantRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const categoryRoutes = require("./routes/categoryRoutes")
const orderRoutes = require("./routes/orderRoutes")

const Restaurant = require("./models/Restaurant")
const Menu = require("./models/Menu")

const app = express()
const PORT = process.env.PORT || 5000

console.log("✅ menuRoutes imported:", typeof menuRoutes)

/* Middleware */
app.use(cors())
app.use(express.json())

/* Static folder */
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

/* Route Debug Middleware */
app.use((req, res, next) => {
  console.log(`➡ ${req.method} ${req.originalUrl}`)
  next()
})

/* Routes */
app.use("/api/menu", menuRoutes)


console.log("✅ /api/menu mounted")


app.use("/api/restaurants", restaurantRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/orders", orderRoutes)

/* 404 handler */
app.use((req, res) => {
  console.log(`❌ 404 Route not found: ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  })
})

/* Error handler */
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err)
  res.status(500).json({
    error: "Internal server error"
  })
})

/* Seed */
async function autoSeed() {
  const restaurantCount = await Restaurant.countDocuments()

  if (restaurantCount === 0) {
    await Restaurant.insertMany([
      {
        name: "Pizza Palace",
        location: "Bangalore",
        phone: "9876543210"
      },
      {
        name: "Burger Barn",
        location: "Mumbai",
        phone: "9123456789"
      }
    ])

    console.log("🌱 Sample restaurants inserted")
  }

  const menuCount = await Menu.countDocuments()

  if (menuCount === 0) {
    await Menu.insertMany([
      {
        name: "Margherita Pizza",
        desc: "Classic cheese pizza",
        price: 250,
        category: "pizza"
      },
      {
        name: "Chicken Burger",
        desc: "Juicy chicken burger",
        price: 180,
        category: "burgers"
      }
    ])

    console.log("🌱 Sample menu inserted")
  }
}

/* Start server */
async function startServer() {
  try {
    console.log("🚀 Starting server...")

    await connectDB()

    await autoSeed()

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("❌ Failed to start:", error)
  }
}

startServer()