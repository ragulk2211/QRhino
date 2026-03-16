require("dotenv").config()

const express = require("express")
const cors = require("cors")
const path = require("path")

const { connectDB } = require("./config/db")

const menuRoutes = require("./routes/menuRoutes")
const restaurantRoutes = require("./routes/restaurantRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const categoryRoutes = require("./routes/categoryRoutes")
const Restaurant = require("./models/Restaurant")
const Menu = require("./models/Menu")
const orderRoutes = require("./routes/orderRoutes")

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use("/uploads", express.static(path.join(__dirname, "uploads")))

/* Routes */
app.use("/api/menu", menuRoutes)
app.use("/api/restaurants", restaurantRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/orders", orderRoutes)

/* 404 */
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  })
})

/* Error Handler */
app.use((err, req, res, next) => {
  console.error("Server error:", err)
  res.status(500).json({
    error: "Internal server error"
  })
})

/* Auto Seed */
async function autoSeed() {
  const restaurantCount = await Restaurant.countDocuments({
    name: "Pizza Palace"
  })

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

  const menuCount = await Menu.countDocuments({
    name: "Margherita Pizza"
  })

  if (menuCount === 0) {
    await Menu.insertMany([
      {
        name: "Margherita Pizza",
        desc: "Classic cheese pizza",
        price: 250,
        category: "burgers"
      },
      {
        name: "Chicken Burger",
        desc: "Juicy chicken with lettuce",
        price: 180,
        category: "burgers"
      },
      {
        name: "Veg Starter Platter",
        desc: "Assorted vegetarian starters",
        price: 220,
        category: "starters"
      },
      {
        name: "Tomato Soup",
        desc: "Creamy tomato soup",
        price: 120,
        category: "soups"
      },
      {
        name: "Caesar Salad",
        desc: "Fresh romaine with caesar dressing",
        price: 160,
        category: "salad"
      },
      {
        name: "Shawarma Wrap",
        desc: "Middle Eastern spiced wrap",
        price: 200,
        category: "arabic-food"
      }
    ])

    console.log("🌱 Sample menu items inserted")
  }
}

/* Start Server */
async function startServer() {
  console.log("Starting server...")

  await connectDB()

  await autoSeed()

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

startServer()