import { useState, useCallback, memo } from "react"
import FoodModal from "./FoodModal"
import "../styles/foodcard.css"

const FoodCard = memo(({ item, onDelete, onCartUpdate }) => {
  const [added, setAdded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  if (!item) return null

  const handleCart = useCallback((e) => {
    e.stopPropagation()

    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      const existingIndex = cart.findIndex(i => i._id === item._id)

      if (existingIndex !== -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1
      } else {
        cart.push({
          ...item,
          quantity: 1,
          addedAt: Date.now()
        })
      }

      localStorage.setItem("cart", JSON.stringify(cart))

      if (onCartUpdate) onCartUpdate(cart)

      setAdded(true)

      if (window.navigator.vibrate) {
        window.navigator.vibrate(50)
      }

      setTimeout(() => setAdded(false), 2000)

    } catch (error) {
      console.error("Error updating cart:", error)
    }
  }, [item, onCartUpdate])

  const getImageUrl = useCallback(() => {
    if (imageError) {
      return "https://dummyimage.com/400x300/f5e6d3/8b6946&text=Food+Image"
    }

    if (item.image?.startsWith("http")) {
      return item.image
    }

    if (item.image) {
      return `http://localhost:5000/uploads/${item.image}`
    }

    return "https://dummyimage.com/400x300/f5e6d3/8b6946&text=Food+Image"
  }, [item.image, imageError])

  const discountedPrice =
    item.discount > 0
      ? Math.round(item.price * (1 - item.discount / 100))
      : item.price

  const savingsAmount =
    item.discount > 0
      ? Math.round(item.price - discountedPrice)
      : 0

  return (
    <>
      <div
        className={`food-card ${isHovered ? "hovered" : ""}`}
        onClick={() => setShowModal(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === "Enter" && setShowModal(true)}
        aria-label={`View details for ${item.name}`}
      >
        {/* Image Section */}
        <div className="image-wrapper">
          <div className="image-container">
            <img
              src={getImageUrl()}
              alt={item.name}
              className="food-img"
              onError={() => setImageError(true)}
              loading="lazy"
            />

            <div className="image-overlay">
              <span className="view-details-icon">👁️</span>
              <span className="view-details-text">Quick View</span>
            </div>
          </div>

          {/* Badges */}
          <div className="badges-container">
            {item.discount > 0 && (
              <div className="discount-badge">
                <span className="discount-percent">{item.discount}%</span>
                <span className="discount-label">OFF</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="food-content">
          <div className="food-header">
            <h3 className="food-title" title={item.name}>
              {item.name}
            </h3>

            <div className="food-badges">
              {item.category && (
                <span className="category-badge">
                  {item.category}
                </span>
              )}

              {item.foodType && (
                <span className={`food-type-badge ${item.foodType === "veg" ? "veg" : "nonveg"}`}>
                  <span className="food-type-dot" />
                  {item.foodType === "veg" ? "Veg" : "Non-Veg"}
                </span>
              )}
            </div>
          </div>

          <p className="food-description">
            {item.desc || "Delicious dish prepared with fresh ingredients"}
          </p>

          <div className="food-meta">
            <div className="meta-item">
              <span className="meta-icon">🔥</span>
              <span className="meta-value">{item.kcal || 0} cal</span>
            </div>

            <div className="meta-divider" />

            <div className="meta-item">
              <span className="meta-icon">⏱️</span>
              <span className="meta-value">{item.time || 15} min</span>
            </div>
          </div>

          <div className="price-cart-section">
            <div className="price-info">
              {item.discount > 0 ? (
                <>
                  <div className="discounted-price">
                    <span className="currency">₹</span>
                    <span className="amount">{discountedPrice}</span>
                  </div>

                  <div className="original-price-wrapper">
                    <span className="original-price">₹{item.price}</span>
                    <span className="savings-badge">
                      Save ₹{savingsAmount}
                    </span>
                  </div>
                </>
              ) : (
                <div className="regular-price">
                  <span className="currency">₹</span>
                  <span className="amount">{item.price}</span>
                </div>
              )}
            </div>

            <button
              className={`cart-btn ${added ? "added" : ""}`}
              onClick={handleCart}
              disabled={added}
            >
              {added ? "Added!" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <FoodModal
          item={item}
          onClose={() => setShowModal(false)}
          onDelete={onDelete}
          onCartUpdate={onCartUpdate}
        />
      )}
    </>
  )
})

FoodCard.displayName = "FoodCard"

export default FoodCard