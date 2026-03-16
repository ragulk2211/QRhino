require("dotenv").config()

const express = require("express")
const cors = require("cors")
const path = require("path")

const { connectDB } = require("./db")

const menuRoutes = require("./routes/menuRoutes")
const categoryRoutes = require("./routes/categoryRoutes")

const app = express()
const PORT = process.env.PORT || 5000


app.use(cors())
app.use(express.json())


app.use("/uploads", express.static(path.join(__dirname, "uploads")))


app.use("/", menuRoutes)
app.use("/", categoryRoutes)


async function startServer() {

  console.log("Starting server...")

  await connectDB()

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

startServer()