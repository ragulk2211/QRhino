import { useNavigate } from "react-router-dom";
import { useEffect, useCallback, memo } from "react";
import API_BASE_URL from "../config";
import "../styles/foodmodal.css";

const FoodModal = memo(({ item, onClose, onDelete, onCartUpdate }) => {
  const navigate = useNavigate();

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);
    
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  // Handle click outside modal
  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle edit navigation
  const handleEdit = useCallback(() => {
    navigate(`/edit-item/${item._id}`);
  }, [navigate, item._id]);

  // Handle remove item
  const handleRemove = useCallback(() => {
    if (window.confirm(`Are you sure you want to remove "${item.name}" from the menu?`)) {
      if (onDelete) {
        onDelete(item._id);
      }
      onClose();
    }
  }, [item._id, item.name, onDelete, onClose]);

  // Handle add to cart from modal
  const handleAddToCart = useCallback(() => {
    if (onCartUpdate) {
      const cartItem = {
        ...item,
        quantity: 1,
        addedAt: Date.now()
      };
      onCartUpdate(cartItem);
      
      // Show success feedback
      const btn = document.querySelector('.modal-add-btn');
      if (btn) {
        btn.textContent = '✓ Added!';
        setTimeout(() => {
          btn.textContent = 'Add to Cart';
        }, 1500);
      }
    }
  }, [item, onCartUpdate]);

  // Get image URL with fallback
  const getImageUrl = useCallback(() => {
    if (item.image) {
      // Check if it's a full URL
      if (item.image.startsWith("http")) {
        return item.image;
      }
      // Check if it's a local path
      if (item.image.startsWith("/uploads/")) {
        return `${API_BASE_URL}${item.image}`;
      }
      return `${API_BASE_URL}/uploads/${item.image}`;
    }
    return "/images/default-food.png";
  }, [item.image]);

  // Calculate discounted price
  const getDiscountedPrice = useCallback(() => {
    if (item.discount && item.discount > 0) {
      return Math.round(item.price * (1 - item.discount / 100));
    }
    return item.price;
  }, [item.price, item.discount]);

  // Format currency
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }, []);

  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box">
        <button 
          className="close-btn" 
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="modal-left">
          <img
            src={getImageUrl()}
            alt={item.name}
            onError={(e) => {
              e.target.src = "/images/default-food.png";
            }}
          />
          
          {/* Badges in modal */}
          {item.discount > 0 && (
            <div className="modal-discount-badge">
              <span className="discount-percent">{item.discount}% OFF</span>
            </div>
          )}
        </div>

        <div className="modal-right">
          <div className="modal-header">
            <h2 className="modal-title">{item.name}</h2>
            
            {item.foodType && (
              <span className={`modal-food-type ${item.foodType === "veg" ? "veg" : "nonveg"}`}>
                <span className="food-type-dot"></span>
                {item.foodType === "veg" ? "Vegetarian" : "Non-Vegetarian"}
              </span>
            )}
          </div>

          {item.category && (
            <div className="modal-category">
              <span className="category-label">Category:</span>
              <span className="category-value">{item.category}</span>
            </div>
          )}

          <p className="modal-description">
            {item.desc || "Delicious dish prepared with fresh ingredients and authentic recipes. A perfect choice for your meal."}
          </p>

          <div className="modal-details">
            {item.kcal && (
              <div className="detail-item">
                <span className="detail-icon">🔥</span>
                <span className="detail-label">Calories:</span>
                <span className="detail-value">{item.kcal}</span>
              </div>
            )}
            
            {(item.time || item.preparationTime) && (
              <div className="detail-item">
                <span className="detail-icon">⏱️</span>
                <span className="detail-label">Prep Time:</span>
                <span className="detail-value">{item.time || item.preparationTime} min</span>
              </div>
            )}
            
            {item.ingredients && item.ingredients.length > 0 && (
              <div className="detail-item">
                <span className="detail-icon">🥘</span>
                <span className="detail-label">Ingredients:</span>
                <span className="detail-value">{item.ingredients.join(", ")}</span>
              </div>
            )}
          </div>

          <div className="modal-price-section">
            {item.discount > 0 ? (
              <div className="modal-price-discount">
                <div className="modal-discounted-price">
                  <span className="currency">₹</span>
                  <span className="amount">{getDiscountedPrice()}</span>
                </div>
                <div className="modal-original-price">
                  <span className="original-price">₹{item.price}</span>
                  <span className="savings-badge">
                    Save ₹{item.price - getDiscountedPrice()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="modal-regular-price">
                <span className="currency">₹</span>
                <span className="amount">{item.price}</span>
              </div>
            )}
          </div>

          <div className="modal-actions">
            {onCartUpdate && (
              <button 
                className="modal-add-btn"
                onClick={handleAddToCart}
              >
                🛒 Add to Cart
              </button>
            )}
            
            <button 
              className="modal-edit-btn"
              onClick={handleEdit}
            >
              ✏️ Edit Item
            </button>
            
            <button 
              className="modal-remove-btn"
              onClick={handleRemove}
            >
              🗑️ Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

FoodModal.displayName = "FoodModal";

export default FoodModal;