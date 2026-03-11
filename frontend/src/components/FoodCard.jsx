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
    setAdded(true)

    // Get existing cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    
    // Check if item already in cart
    const existingItem = cart.find(i => i._id === item._id)
    
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1
    } else {
      cart.push({ ...item, quantity: 1 })
    }
    
    localStorage.setItem("cart", JSON.stringify(cart))

    setTimeout(() => {
      setAdded(false)
    }, 2000)
  }

  const getImageUrl = () => {
    if (imageError) return "/images/default-food.png"
    return item.image ? `http://localhost:5000${item.image}` : "/images/default-food.png"
  }

  return (
    <>
      <div
        className="food-card"
        onClick={() => setShowModal(true)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setShowModal(true)
          }
        }}
      >
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
        </div>

        <div className="food-content">
          <div className="food-header">
            <h3 className="food-title">{item.name}</h3>
            <span className="food-badge">{item.category}</span>
          </div>

          <p className="food-description">{item.desc}</p>

          <div className="food-meta">
            <div className="meta-item">
              <span className="meta-icon"></span>
              <span className="meta-value">₹{item.price}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon"></span>
              <span className="meta-value">{item.kcal} kcal</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon"></span>
              <span className="meta-value">{item.time} min</span>
            </div>
          </div>

          <button
            className={`cart-btn ${added ? "added" : ""}`}
            onClick={handleCart}
            disabled={added}
          >
            <span className="btn-icon">{added ? "✓" : "🛒"}</span>
            <span className="btn-text">{added ? "Added to Cart!" : "Add to Cart"}</span>
          </button>
        </div>
      </div>

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