const { getDB } = require("../config/db")

// Get all dishes
async function getDishes() {
  const db = getDB()
  if (!db) throw new Error("Database not connected")

  const dishes = await db.collection("dishes").find().toArray()
  return dishes
}

// Add new dish
async function addDish(dish) {
  const db = getDB()
  if (!db) throw new Error("Database not connected")

  return await db.collection("dishes").insertOne(dish)
}

module.exports = { getDishes, addDish }