require("dotenv").config()

const { connectDB } = require("./config/db")
const Restaurant = require("./models/Restaurant")
const Menu = require("./models/Menu")
const Payment = require("./models/payment")
const User = require("./models/users")
const bcrypt = require("bcryptjs")

async function seed() {

  await connectDB()

  console.log("Seeding database...")

  // RESTAURANTS
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

    console.log("✅ Restaurants seeded")

  } else {

    console.log("ℹ️  Restaurants already exist, skipping")

  }

  // MENU
  const menuCount = await Menu.countDocuments()

  if (menuCount === 0) {

    await Menu.insertMany([
      {
        name: "Margherita Pizza",
        desc: "Classic cheese pizza",
        price: 250,
        category: "burgers",
        image: ""
      },
      {
        name: "Chicken Burger",
        desc: "Juicy chicken with lettuce",
        price: 180,
        category: "burgers",
        image: ""
      },
      {
        name: "Veg Starter Platter",
        desc: "Assorted vegetarian starters",
        price: 220,
        category: "starters",
        image: ""
      },
      {
        name: "Tomato Soup",
        desc: "Creamy tomato soup",
        price: 120,
        category: "soups",
        image: ""
      },
      {
        name: "Caesar Salad",
        desc: "Fresh romaine with caesar dressing",
        price: 160,
        category: "salad",
        image: ""
      },
      {
        name: "Shawarma Wrap",
        desc: "Middle Eastern spiced wrap",
        price: 200,
        category: "arabic-food",
        image: ""
      }
    ])

    console.log("✅ Menu seeded")

  } else {

    console.log("ℹ️  Menu already exists, skipping")

  }

  console.log("✅ Database seeding complete")

  // Create super admin user
  const superAdminCount = await User.countDocuments({ role: "superadmin" })
  
  if (superAdminCount === 0) {
    const hashedPassword = await bcrypt.hash("superadmin123", 10)
    
    await User.create({
      name: "Super Admin",
      email: "super@admin.com",
      password: hashedPassword,
      role: "superadmin"
    })
    
    console.log("✅ Super admin user created")
  } else {
    console.log("ℹ️  Super admin already exists, skipping")
  }

  process.exit(0)

}

seed().catch(err => {
  console.error("Seed error:", err.message)
  process.exit(1)
})
