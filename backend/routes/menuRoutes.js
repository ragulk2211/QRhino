const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const {
  getMenu,
  addMenu,
  deleteMenu,
  updateMenu
} = require("../controllers/menuController")

const uploadsDir = path.join(__dirname, "../uploads")

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

router.get("/menu", getMenu)

router.post("/menu", upload.single("image"), addMenu)

router.delete("/menu/:id", deleteMenu)

router.put("/menu/:id", updateMenu)



module.exports = router