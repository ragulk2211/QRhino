
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/header.css"

function Header({ onSearch = () => {} }) {
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState("")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [cartTotal, setCartTotal] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  const cartRef = useRef(null)

  useEffect(() => {
    loadCart()

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    const handleClickOutside = (e) => {
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setIsCartOpen(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, onSearch])

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")

    setCartItems(cart)

    const total = cart.reduce((sum, item) => {
      return sum + Number(item.price || 0) * (item.quantity || 1)
    }, 0)

    setCartTotal(total)
  }

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
    loadCart()
  }

  const updateQuantity = (id, qty) => {
    if (qty < 1) return

    const updated = cartItems.map(item =>
      item._id === id ? { ...item, quantity: qty } : item
    )

    localStorage.setItem("cart", JSON.stringify(updated))
    setCartItems(updated)

    const total = updated.reduce((sum, item) => {
      return sum + Number(item.price || 0) * (item.quantity || 1)
    }, 0)

    setCartTotal(total)
  }

  const removeFromCart = (id) => {
    const updated = cartItems.filter(item => item._id !== id)

    localStorage.setItem("cart", JSON.stringify(updated))
    setCartItems(updated)

    const total = updated.reduce((sum, item) => {
      return sum + Number(item.price || 0) * (item.quantity || 1)
    }, 0)

    setCartTotal(total)
  }

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-container">

        <div className="logo" onClick={() => navigate("/")}>
          <h1>Food Menu</h1>
        </div>

        <div className="header-right">

          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search food, veg, non-veg..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="cart-wrapper" ref={cartRef}>
            <button className="cart-button" onClick={toggleCart}>
              🛒 Cart
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </button>

            {isCartOpen && (
              <div className="cart-dropdown">

                {cartItems.length === 0 ? (
                  <p className="empty-cart">Cart Empty</p>
                ) : (
                  <>
                    {cartItems.map(item => (
                      <div key={item._id} className="cart-item">

                        <img
                          src={
                            item.image
                              ? (item.image.startsWith('http') ? item.image : `http://localhost:5000/uploads/${item.image}`)
                              : "/default-food.jpg"
                          }
                          alt={item.name}
                          className="cart-item-image"
                        />

                        <div className="cart-item-details">
                          <h4>{item.name}</h4>
                          <p>₹{item.price}</p>

                          <div className="cart-item-quantity">
                            <button onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)}>
                              −
                            </button>

                            <span>{item.quantity || 1}</span>

                            <button onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}>
                              +
                            </button>
                          </div>
                        </div>

                        <button onClick={() => removeFromCart(item._id)}>
                          ✕
                        </button>

                      </div>
                    ))}

                    <div className="cart-footer">
                      <h3>Total ₹{cartTotal}</h3>

                      <button onClick={() => navigate("/cart")}>
                        View Cart
                      </button>
                    </div>
                  </>
                )}

              </div>
            )}
          </div>

          <button className="admin-button" onClick={() => navigate("/admin")}>
            ⚙️ Admin
          </button>

        </div>
      </div>
    </header>
  )
}

export default Header
