const { getDB } = require("../db")

async function getMenu() {
  const db = getDB()
  if (!db) throw new Error("Database not connected")
  const menu = await db.collection("menu").find().toArray()
  return menu
}

module.exports = { getMenu }
