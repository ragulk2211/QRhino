import { useState, useContext } from "react"
import FoodModal from "./FoodModal"
import { CartContext } from "../context/CartContext"
import API_BASE_URL from "../config"
import { calculateDiscountedPrice } from "../utils/priceUtils"
import "../styles/foodcard.css"

function FoodCard({ item, onDelete }) {
  const { addToCart } = useContext(CartContext)
  const [added, setAdded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [imageError, setImageError] = useState(false)

  if (!item) return null

  function handleCart(e) {
    e.stopPropagation()
    setAdded(true)
    
    // Use context to add to cart
    addToCart(item)

    setTimeout(() => {
      setAdded(false)
    }, 2000)
  }

  const getImageUrl = () => {
    if (imageError) return "/images/burger2.webp"
    // Check if it's a full URL already
    if (item.image && item.image.startsWith('http')) {
      return item.image
    }
    // Check if it's a stored filename (without path)
    if (item.image) {
      return `${API_BASE_URL}/uploads/${item.image}`
    }
    return "/images/burger2.webp"
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
            <div className="food-badges">
              <span className="food-badge">{item.category}</span>
              {item.foodType && (
                <span 
                  className={`food-type-badge ${item.foodType}`}
                  style={{
                    background: item.foodType === 'veg' ? '#22c55e' : '#dc2626',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}
                >
                  {item.foodType === 'veg' ? '● Veg' : '● Non-Veg'}
                </span>
              )}
            </div>
          </div>

          <p className="food-description">{item.desc}</p>

          <div className="food-meta">
            <div className="meta-item">
              <span className="meta-icon"></span>
              <div className="price-display">
                {item.discount && item.discount > 0 ? (
                  <>
                    <span className="original-price" style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.8rem' }}>₹{item.price}</span>
                    <span className="discounted-price" style={{ color: '#22c55e', fontWeight: 'bold' }}>₹{Math.round(calculateDiscountedPrice(item.price, item.discount))}</span>
                  </>
                ) : (
                  <span className="meta-value">₹{item.price}</span>
                )}
              </div>
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
