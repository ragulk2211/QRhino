import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import { calculateDiscountedPrice } from "../utils/priceUtils";
import "../styles/header.css";

function Header({ onSearch = () => {} }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const cartRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Get image URL helper
  const getImageUrl = useCallback((image) => {
    if (!image) return "/images/default-food.jpg";
    if (image.startsWith("http")) return image;
    if (image.startsWith("/uploads/")) return `${API_BASE_URL}${image}`;
    return `${API_BASE_URL}/uploads/${image}`;
  }, []);

  // Load cart from localStorage
  const loadCart = useCallback(() => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(cart);
      
      // Calculate total with discounts
      const total = cart.reduce((sum, item) => {
        const discountedPrice = calculateDiscountedPrice(item.price, item.discount);
        return sum + discountedPrice * (item.quantity || 1);
      }, 0);
      
      setCartTotal(total);
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartItems([]);
      setCartTotal(0);
    }
  }, []);

  // Calculate total items count
  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [cartItems]);

  // Update cart in localStorage and state
  const updateCart = useCallback((updatedCart) => {
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    
    const total = updatedCart.reduce((sum, item) => {
      const discountedPrice = calculateDiscountedPrice(item.price, item.discount);
      return sum + discountedPrice * (item.quantity || 1);
    }, 0);
    
    setCartTotal(total);
  }, []);

  // Handle quantity updates
  const updateQuantity = useCallback((id, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item =>
      item._id === id ? { ...item, quantity: newQuantity } : item
    );
    
    updateCart(updatedCart);
  }, [cartItems, updateCart]);

  // Remove item from cart
  const removeFromCart = useCallback((id) => {
    const updatedCart = cartItems.filter(item => item._id !== id);
    updateCart(updatedCart);
  }, [cartItems, updateCart]);

  // Toggle cart dropdown
  const toggleCart = useCallback(() => {
    setIsCartOpen(prev => !prev);
    loadCart();
  }, [loadCart]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, onSearch]);

  // Handle click outside to close cart
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setIsCartOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load cart on mount
  useEffect(() => {
    loadCart();
    
    // Listen for storage changes (cart updates from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === "cart") {
        loadCart();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadCart]);

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={() => navigate("/")} role="button" tabIndex={0}>
          <span className="logo-icon">🍽️</span>
          <span className="logo-text">QRhino</span>
        </div>

        <div className="header-right">
          <div className="search-wrapper">
            <input
              className="search-input"
              placeholder="Search for delicious food..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search food items"
            />
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" strokeWidth="2"/>
            </svg>
          </div>

          <div className="cart-wrapper" ref={cartRef}>
            <button 
              className={`cart-button ${isCartOpen ? 'active' : ''}`} 
              onClick={toggleCart}
              aria-label="Shopping cart"
            >
              <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.2 15.8 4.6 16.5 5.3 16.5H17M17 16.5C15.9 16.5 15 17.4 15 18.5C15 19.6 15.9 20.5 17 20.5C18.1 20.5 19 19.6 19 18.5C19 17.4 18.1 16.5 17 16.5ZM9 18.5C9 19.6 8.1 20.5 7 20.5C5.9 20.5 5 19.6 5 18.5C5 17.4 5.9 16.5 7 16.5C8.1 16.5 9 17.4 9 18.5Z" strokeWidth="2"/>
              </svg>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>

            {isCartOpen && (
              <div className="cart-dropdown">
                <div className="cart-header">
                  <h3>Shopping Cart</h3>
                  <button className="close-cart" onClick={() => setIsCartOpen(false)}>✕</button>
                </div>
                
                {cartItems.length === 0 ? (
                  <div className="empty-cart">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.2 15.8 4.6 16.5 5.3 16.5H17M17 16.5C15.9 16.5 15 17.4 15 18.5C15 19.6 15.9 20.5 17 20.5C18.1 20.5 19 19.6 19 18.5C19 17.4 18.1 16.5 17 16.5ZM9 18.5C9 19.6 8.1 20.5 7 20.5C5.9 20.5 5 19.6 5 18.5C5 17.4 5.9 16.5 7 16.5C8.1 16.5 9 17.4 9 18.5Z" strokeWidth="2"/>
                    </svg>
                    <p>Your cart is empty</p>
                    <span>Add some delicious items!</span>
                  </div>
                ) : (
                  <>
                    <div className="cart-items">
                      {cartItems.map(item => (
                        <div key={item._id} className="cart-item">
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="cart-item-image"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = "/images/default-food.jpg";
                            }}
                          />
                          <div className="cart-item-details">
                            <h4>{item.name}</h4>
                            <p className="cart-item-price">
                              {item.discount > 0 ? (
                                <>
                                  <span className="original-price">₹{item.price}</span>
                                  <span className="discounted-price">
                                    ₹{calculateDiscountedPrice(item.price, item.discount)}
                                  </span>
                                </>
                              ) : (
                                `₹${item.price}`
                              )}
                            </p>
                            <div className="cart-item-quantity">
                              <button 
                                onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)}
                                aria-label="Decrease quantity"
                              >−</button>
                              <span>{item.quantity || 1}</span>
                              <button 
                                onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}
                                aria-label="Increase quantity"
                              >+</button>
                            </div>
                          </div>
                          <button 
                            className="remove-btn" 
                            onClick={() => removeFromCart(item._id)}
                            aria-label="Remove item"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="cart-footer">
                      <div className="cart-subtotal">
                        <span>Subtotal</span>
                        <span className="cart-total">₹{cartTotal}</span>
                      </div>
                      <button 
                        className="view-cart-btn"
                        onClick={() => {
                          navigate("/cart");
                          setIsCartOpen(false);
                        }}
                      >
                        View Cart
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <button 
            className="admin-button" 
            onClick={() => navigate("/admin")}
            aria-label="Admin panel"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" strokeWidth="2"/>
              <path d="M3 21C3.906 18.814 5.697 17 8 17H16C18.303 17 20.094 18.814 21 21" strokeWidth="2"/>
            </svg>
            <span>Admin</span>
          </button>

          <button 
            className="admin-button kitchen-btn" 
            onClick={() => navigate("/kitchen")}
            aria-label="Kitchen panel"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 3H21V7H3V3Z" strokeWidth="2"/>
              <path d="M5 7V21H19V7" strokeWidth="2"/>
              <path d="M9 10H15" strokeWidth="2"/>
              <path d="M12 10V17" strokeWidth="2"/>
            </svg>
            <span>Kitchen</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;