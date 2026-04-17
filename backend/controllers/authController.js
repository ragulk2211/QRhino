const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

// =========================
// Signup
// =========================
const signup = async (req, res) => {
  try {
    const { name, email, password, role, restaurantId } = req.body

    // Check existing user
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      restaurantId: restaurantId || null
    })

    await newUser.save()

    res.status(201).json({
      success: true,
      message: "User created successfully"
    })

  } catch (error) {
    console.error("Signup error:", error)

    res.status(500).json({
      success: false,
      message: "Signup failed"
    })
  }
}


// =========================
// Login
// =========================
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      })
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      })
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        restaurantId: user.restaurantId
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    )

    // Response
    res.status(200).json({
      success: true,
      token,
      role: user.role,
      restaurantId: user.restaurantId,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    console.error("Login error:", error)

    res.status(500).json({
      success: false,
      message: "Login failed"
    })
  }
}

module.exports = {
  signup,
  login
}