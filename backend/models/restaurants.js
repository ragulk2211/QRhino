const { getDB } = require("../config/db")

// Get all restaurants
async function getRestaurants() {
  const db = getDB()
  if (!db) throw new Error("Database not connected")

  const restaurants = await db.collection("restaurants").find().toArray()
  return restaurants
}

// Add restaurant
async function addRestaurant(restaurant) {
  const db = getDB()
  if (!db) throw new Error("Database not connected")

  return await db.collection("restaurants").insertOne(restaurant)
}

module.exports = { getRestaurants, addRestaurant }