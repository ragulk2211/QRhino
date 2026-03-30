const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Menu = require("../models/Menu");

console.log("✅ menuRoutes loaded");

/* =========================
   Upload Folder
========================= */

const uploadsDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/* =========================
   Multer Storage
========================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

/* =========================
   File Filter
========================= */

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpg|jpeg|png|webp/;

  const ext = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"));
  }
};

/* =========================
   Multer Upload
========================= */

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

/* =========================
   GET ALL MENU ITEMS
========================= */

router.get("/", async (req, res) => {
  try {
    console.log("✅ GET /api/menu hit");

    const { restaurantId, foodType, category } = req.query;
    const filter = {};

    if (restaurantId) filter.restaurantId = restaurantId;
    if (foodType) filter.foodType = foodType;
    if (category) filter.category = new RegExp(category, "i");

    const menu = await Menu.find(filter).sort({ createdAt: -1 });

    res.status(200).json(menu);

  } catch (error) {
    console.error("❌ Error fetching menu:", error);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

/* =========================
   GET FEATURED ITEMS
========================= */

router.get("/featured", async (req, res) => {
  try {
    console.log("✅ GET /api/menu/featured hit");

    const featured = await Menu.find()
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json(featured);

  } catch (error) {
    console.error("❌ Error fetching featured:", error);
    res.status(500).json({ error: "Failed to fetch featured items" });
  }
});

/* =========================
   GET SINGLE MENU ITEM
========================= */

router.get("/:id", async (req, res) => {
  try {
    console.log("✅ GET /api/menu/:id hit");

    const item = await Menu.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        error: "Menu item not found"
      });
    }

    res.status(200).json(item);

  } catch (error) {
    console.error("❌ Error fetching single menu item:", error);
    res.status(500).json({
      error: "Failed to fetch menu item"
    });
  }
});

/* =========================
   CREATE MENU ITEM
========================= */

router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("✅ POST /api/menu hit");

    let {
      name,
      desc,
      price,
      discount,
      category,
      categoryId,
      kcal,
      time,
      restaurantId,
      foodType
    } = req.body;

    price = Number(price) || 0;
    discount = Number(discount) || 0;
    kcal = Number(kcal) || 0;
    time = Number(time) || 0;

    const image = req.file ? req.file.filename : null;

    const menuItem = new Menu({
      name,
      desc,
      price,
      discount,
      category,
      categoryId: categoryId || null,
      kcal,
      time,
      image,
      restaurantId: restaurantId || null,
      foodType: foodType || "veg"
    });

    await menuItem.save();

    res.status(201).json(menuItem);

  } catch (error) {
    console.error("❌ Error creating menu item:", error);
    res.status(500).json({
      error: error.message
    });
  }
});

/* =========================
   UPDATE MENU ITEM
========================= */

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    console.log("✅ PUT /api/menu/:id hit");

    const existing = await Menu.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        error: "Menu item not found"
      });
    }

    let {
      name,
      desc,
      price,
      discount,
      category,
      categoryId,
      kcal,
      time,
      restaurantId,
      foodType
    } = req.body;

    const updateData = {
      name,
      desc,
      price: Number(price) || 0,
      discount: Number(discount) || 0,
      category,
      categoryId: categoryId || null,
      kcal: Number(kcal) || 0,
      time: Number(time) || 0,
      restaurantId: restaurantId || null,
      foodType: foodType || "veg"
    };

    if (req.file) {
      if (existing.image) {
        const oldImagePath = path.join(uploadsDir, existing.image);

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      updateData.image = req.file.filename;
    }

    const updated = await Menu.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json(updated);

  } catch (error) {
    console.error("❌ Error updating menu:", error);
    res.status(500).json({
      error: "Failed to update menu item"
    });
  }
});

/* =========================
   DELETE MENU ITEM
========================= */

router.delete("/:id", async (req, res) => {
  try {
    console.log("✅ DELETE /api/menu/:id hit");

    const deleted = await Menu.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        error: "Menu item not found"
      });
    }

    if (deleted.image) {
      const imagePath = path.join(uploadsDir, deleted.image);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(200).json({
      message: "Menu item deleted successfully"
    });

  } catch (error) {
    console.error("❌ Error deleting menu:", error);
    res.status(500).json({
      error: "Failed to delete menu item"
    });
  }
});

module.exports = router;