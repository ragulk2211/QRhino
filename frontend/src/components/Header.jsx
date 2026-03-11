import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/header.css"

function Header({ onSearch, cartItemCount = 0 }) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [cartTotal, setCartTotal] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef(null)
  const cartRef = useRef(null)

  // Load cart from localStorage
  useEffect(() => {
    loadCart()
    
    // Add scroll listener for header effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll)
    
    // Close cart when clicking outside
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Load cart data
  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    setCartItems(cart)
    
    const total = cart.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * (item.quantity || 1))
    }, 0)
    
    setCartTotal(total)
  }

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, onSearch])

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("")
    if (onSearch) {
      onSearch("")
    }
  }

  // Toggle cart
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
    if (!isCartOpen) {
      loadCart() // Refresh cart data when opening
    }
  }

  // Remove item from cart
  const removeFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => item._id !== itemId)
    localStorage.setItem("cart", JSON.stringify(updatedCart))
    setCartItems(updatedCart)
    
    const total = updatedCart.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * (item.quantity || 1))
    }, 0)
    setCartTotal(total)
  }

  // Update quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return
    
    const updatedCart = cartItems.map(item => {
      if (item._id === itemId) {
        return { ...item, quantity: newQuantity }
      }
      return item
    })
    
    localStorage.setItem("cart", JSON.stringify(updatedCart))
    setCartItems(updatedCart)
    
    const total = updatedCart.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * (item.quantity || 1))
    }, 0)
    setCartTotal(total)
  }

  // Clear entire cart
  const clearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      localStorage.setItem("cart", "[]")
      setCartItems([])
      setCartTotal(0)
      setIsCartOpen(false)
    }
  }

  // Checkout function
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!")
      return
    }
    // Navigate to checkout page
    navigate("/checkout")
  }

  // Get total items in cart
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo with click to home */}
        <div className="logo" onClick={() => navigate("/")}>
          <h1>Food Menu</h1>
          <span className="logo-badge">Premium</span>
        </div>

        {/* Header Right Section */}
        <div className="header-right">
          {/* Search Bar */}
          <div className={`search-container ${showSearch ? 'active' : ''}`}>
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search dishes, categories..."
                value={searchTerm}
                onChange={handleSearchChange}
                ref={searchRef}
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={handleClearSearch}
                >
                  ✕
                </button>
              )}
            </div>
            <button 
              className="search-toggle"
              onClick={() => setShowSearch(!showSearch)}
            >
              🔍
            </button>
          </div>

          {/* Cart Button */}
          <div className="cart-wrapper" ref={cartRef}>
            <button 
              className={`cart-button ${totalItems > 0 ? 'has-items' : ''}`}
              onClick={toggleCart}
            >
              <span className="cart-icon">🛒</span>
              <span className="cart-text">Cart</span>
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </button>

            {/* Cart Dropdown */}
            {isCartOpen && (
              <div className="cart-dropdown">
                <div className="cart-header">
                  <h3>Your Cart</h3>
                  <button 
                    className="close-cart"
                    onClick={() => setIsCartOpen(false)}
                  >
                    ✕
                  </button>
                </div>

                {cartItems.length === 0 ? (
                  <div className="empty-cart">
                    <span className="empty-cart-icon">🛒</span>
                    <p>Your cart is empty</p>
                    <button 
                      className="browse-menu-btn"
                      onClick={() => {
                        setIsCartOpen(false)
                        navigate("/menu")
                      }}
                    >
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="cart-items">
                      {cartItems.map((item) => (
                        <div key={item._id} className="cart-item">
                          <img 
                            src={item.image ? `http://localhost:5000${item.image}` : "/default-food.jpg"} 
                            alt={item.name}
                            className="cart-item-image"
                          />
                          <div className="cart-item-details">
                            <h4>{item.name}</h4>
                            <p className="cart-item-price">₹{item.price}</p>
                            <div className="cart-item-quantity">
                              <button 
                                onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)}
                                disabled={(item.quantity || 1) <= 1}
                              >
                                −
                              </button>
                              <span>{item.quantity || 1}</span>
                              <button 
                                onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <button 
                            className="remove-item"
                            onClick={() => removeFromCart(item._id)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="cart-footer">
                      <div className="cart-total">
                        <span>Total:</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="cart-actions">
                        <button 
                          className="clear-cart-btn"
                          onClick={clearCart}
                        >
                          Clear Cart
                        </button>
                        <button 
                          className="checkout-btn"
                          onClick={handleCheckout}
                        >
                          Checkout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header