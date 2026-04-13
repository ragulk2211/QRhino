import { useState, useCallback, memo, useContext } from "react";
import FoodModal from "./FoodModal";
import { CartContext } from "../context/CartContext";
import API_BASE_URL from "../config";
import { calculateDiscountedPrice } from "../utils/priceUtils";
import "../styles/foodcard.css";

const FoodCard = memo(({ item, onDelete, onCartUpdate }) => {
  const { addToCart } = useContext(CartContext);
  
  const [added, setAdded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Return null if no item
  if (!item) return null;

  // Get image URL with fallback
  const getImageUrl = useCallback(() => {
    if (imageError) {
      return "/images/burger2.webp";
    }
    
    // Check if it's a full URL
    if (item.image && item.image.startsWith("http")) {
      return item.image;
    }
    
    // Check if it's a local file path
    if (item.image) {
      return `${API_BASE_URL}/uploads/${item.image}`;
    }
    
    // Default fallback
    return "/images/burger2.webp";
  }, [item.image, imageError]);

  // Calculate discounted price
  const discountedPrice = item.discount > 0
    ? Math.round(item.price * (1 - item.discount / 100))
    : item.price;
  
  const savingsAmount = item.discount > 0
    ? Math.round(item.price - discountedPrice)
    : 0;

  // Handle add to cart
  const handleCart = useCallback(async (e) => {
    e.stopPropagation();
    
    try {
      // Try using context first
      if (addToCart) {
        await addToCart(item);
      } else {
        // Fallback to localStorage if context is not available
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existingIndex = cart.findIndex(i => i._id === item._id);
        
        if (existingIndex !== -1) {
          cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
        } else {
          cart.push({
            ...item,
            quantity: 1,
            addedAt: Date.now()
          });
        }
        
        localStorage.setItem("cart", JSON.stringify(cart));
        
        if (onCartUpdate) {
          onCartUpdate(cart);
        }
      }
      
      setAdded(true);
      
      // Optional: haptic feedback
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
      
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  }, [item, addToCart, onCartUpdate]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  // Handle modal delete
  const handleModalDelete = useCallback(() => {
    if (onDelete) {
      onDelete(item._id);
    }
    setShowModal(false);
  }, [item._id, onDelete]);

  // Handle modal cart update
  const handleModalCartUpdate = useCallback((updatedCart) => {
    if (onCartUpdate) {
      onCartUpdate(updatedCart);
    }
  }, [onCartUpdate]);

  // Format category name
  const formatCategoryName = (category) => {
    if (!category) return "";
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

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
            {item.isNew && (
              <div className="new-badge">
                <span>New</span>
              </div>
            )}
            {item.isPopular && (
              <div className="popular-badge">
                <span>🔥 Popular</span>
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
                  {formatCategoryName(item.category)}
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
            {item.kcal && (
              <div className="meta-item">
                <span className="meta-icon">🔥</span>
                <span className="meta-value">{item.kcal} cal</span>
              </div>
            )}
            
            {item.kcal && (item.time || item.preparationTime) && (
              <div className="meta-divider" />
            )}
            
            {(item.time || item.preparationTime) && (
              <div className="meta-item">
                <span className="meta-icon">⏱️</span>
                <span className="meta-value">
                  {item.time || item.preparationTime || 15} min
                </span>
              </div>
            )}
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
              aria-label={`Add ${item.name} to cart`}
            >
              {added ? "✓ Added!" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
      
      {showModal && (
        <FoodModal
          item={item}
          onClose={handleModalClose}
          onDelete={handleModalDelete}
          onCartUpdate={handleModalCartUpdate}
        />
      )}
    </>
  );
});

FoodCard.displayName = "FoodCard";

export default FoodCard;