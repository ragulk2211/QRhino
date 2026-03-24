import { useState } from "react"
import FoodModal from "./FoodModal"
import "../styles/foodcard.css"

function FoodCard({ item, onDelete }) {
  const [added, setAdded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [imageError, setImageError] = useState(false)

  if (!item) return null

  function handleCart(e) {
    e.stopPropagation()

    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const existing = cart.find(i => i._id === item._id)

    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1
    } else {
      cart.push({
        ...item,
        quantity: 1
      })
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    setAdded(true)

    setTimeout(() => {
      setAdded(false)
    }, 1500)
  }

  const getImageUrl = () => {
    if (imageError) return "/images/default-food.png"
    if (item.image?.startsWith("http")) return item.image
    if (item.image) return `http://localhost:5000/uploads/${item.image}`
    return "/images/default-food.png"
  }

  const discountedPrice = item.discount > 0
    ? Math.round(item.price - (item.price * item.discount) / 100)
    : item.price

  return (
    <>
      <div className="food-card" onClick={() => setShowModal(true)}>
        {/* Image Section */}
        <div className="image-wrapper">
          <img
            src={getImageUrl()}
            alt={item.name}
            className="food-img"
            onError={() => setImageError(true)}
            loading="lazy"
          />
          <div className="image-overlay">
            <span className="view-details">View Details</span>
          </div>
          {item.discount > 0 && (
            <div className="discount-badge">
              {item.discount}% OFF
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="food-content">
          {/* Header */}
          <div className="food-header">
            <h3 className="food-title">{item.name}</h3>
            <div className="food-badges">
              {item.category && (
                <span className="food-badge">{item.category}</span>
              )}
              {item.foodType && (
                <span className={`food-type-badge ${item.foodType === 'veg' ? 'veg' : 'nonveg'}`}>
                  {item.foodType === 'veg' ? '● Veg' : '● Non-Veg'}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="food-description">
            {item.desc || item.description || "Delicious dish prepared with fresh ingredients"}
          </p>

          {/* Meta Info */}
          <div className="food-meta">
            {/* Price Section */}
            <div className="meta-item price-item">
              {item.discount > 0 ? (
                <div className="price-container">
                  <span className="old-price">₹{item.price}</span>
                  <span className="new-price">₹{discountedPrice}</span>
                </div>
              ) : (
                <span className="meta-value price">₹{item.price}</span>
              )}
            </div>

            {/* Calories */}
            <div className="meta-item">
              <span className="meta-icon">🔥</span>
              <span className="meta-value">{item.kcal || 0} kcal</span>
            </div>

            {/* Time */}
            <div className="meta-item">
              <span className="meta-icon">⏱️</span>
              <span className="meta-value">{item.time || 15} min</span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            className={`cart-btn ${added ? "added" : ""}`}
            onClick={handleCart}
            disabled={added}
          >
            {added ? (
              <>
                <span className="btn-icon">✓</span>
                <span className="btn-text">Added to Cart!</span>
              </>
            ) : (
              <>
                <span className="btn-icon">🛒</span>
                <span className="btn-text">Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <FoodModal
          item={item}
          onClose={() => setShowModal(false)}
          onDelete={onDelete}
        />
      )}
    </>
  )
}

export default FoodCard