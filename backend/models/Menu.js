const { getDB } = require("../db")

async function getMenu(){

const db = getDB()

const menu = await db.collection("menu").find().toArray()

return menu

}

module.exports = { getMenu }