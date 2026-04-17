const jwt = require("jsonwebtoken")

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "No token provided"
        })
      }

      // Extract token
      const token = authHeader.split(" ")[1]

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Token missing"
        })
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Role check
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        })
      }

      // Save user info in request
      req.user = decoded

      next()

    } catch (error) {
      console.error("Auth error:", error)

      return res.status(401).json({
        success: false,
        message: "Invalid token"
      })
    }
  }
}

module.exports = authMiddleware