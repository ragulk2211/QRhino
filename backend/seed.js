require("dotenv").config()
const { MongoClient } = require("mongodb")

const url = process.env.MONGO_URI
const client = new MongoClient(url)

const menuItems = [
  // Burgers
  { category: "burgers", name: "Swedish Burger", desc: "Meat patty, mushroom sauce, tomato", price: "4.20", kcal: "350", time: "15 min", img: "/images/burger1.jpg" },
  { category: "burgers", name: "Loaded Crispy Chicken Burger", desc: "Crispy thai chicken burger", price: "2.80", kcal: "290", time: "20 min", img: "/images/burger2.jpg" },
  { category: "burgers", name: "American Burger", desc: "Beef grilled steak burger", price: "3.50", kcal: "410", time: "15 min", img: "/images/burger3.jpg" },

  // Arabic Food
  { category: "arabic-food", name: "Laham Mansaf", desc: "Lamb with rice", price: "50.00", kcal: "400", time: "35 min", img: "/images/arabic1.jpg" },
  { category: "arabic-food", name: "Chicken Kabsa", desc: "Spiced chicken with rice", price: "45.00", kcal: "380", time: "40 min", img: "/images/arabic2.jpg" },
  { category: "arabic-food", name: "Shawarma Plate", desc: "Grilled meat with bread and sauce", price: "20.00", kcal: "350", time: "20 min", img: "/images/arabic3.jpg" },

  // Starters
  { category: "starters", name: "Dynamite Shrimps", desc: "Crispy shrimp with sauce", price: "3.50", kcal: "250", time: "15 min", img: "/images/shrimp.jpg" },
  { category: "starters", name: "Chicken Wings", desc: "Spicy grilled wings", price: "4.00", kcal: "300", time: "20 min", img: "/images/wings.jpg" },
  { category: "starters", name: "Spring Rolls", desc: "Crispy vegetable rolls", price: "2.50", kcal: "200", time: "10 min", img: "/images/springrolls.jpg" },

  // Soups
  { category: "soups", name: "Italian Soup", desc: "Tomato ravioli soup", price: "3.50", kcal: "210", time: "10 min", img: "/images/soup.jpg" },
  { category: "soups", name: "Mushroom Soup", desc: "Creamy mushroom broth", price: "3.00", kcal: "180", time: "10 min", img: "/images/mushroom.jpg" },
  { category: "soups", name: "Chicken Broth", desc: "Classic chicken soup", price: "3.00", kcal: "160", time: "10 min", img: "/images/broth.jpg" },

  // Salad   
  { category: "salad", name: "Italian Salad", desc: "Fresh vegetable salad", price: "3.00", kcal: "150", time: "5 min", img: "/images/salad.jpg" },
  { category: "salad", name: "Caesar Salad", desc: "Romaine lettuce with caesar dressing", price: "3.50", kcal: "180", time: "5 min", img: "/images/caesar.jpg" },
  { category: "salad", name: "Greek Salad", desc: "Tomato, cucumber, feta cheese", price: "3.50", kcal: "170", time: "5 min", img: "/images/greek.jpg" },
]

async function seed() {
  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db("foodmenu")
    const collection = db.collection("menu")

    await collection.deleteMany({})
    console.log("🗑️  Cleared existing menu data")

    await collection.insertMany(menuItems)
    console.log(`✅ Inserted ${menuItems.length} menu items`)

    await client.close()
    console.log("Done!")
  } catch (err) {
    console.error("❌ Seed error:", err.message)
    process.exit(1)
  }
}

seed()
