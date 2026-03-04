const { MongoClient } = require("mongodb")

const url = "mongodb+srv://ragul:itvedant%40123@cluster0.5dgd2wx.mongodb.net/foodmenu"

const client = new MongoClient(url)

let db

async function connectDB(){

await client.connect()

db = client.db("foodmenu")

console.log("MongoDB Atlas Connected")

}

function getDB(){
return db
}

module.exports = { connectDB, getDB }