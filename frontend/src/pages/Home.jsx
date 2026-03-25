import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import API_BASE_URL from "../config"
import "../styles/home.css"
import Advertisement from "../components/Advertisement"

function Home() {
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showExpertModal, setShowExpertModal] = useState(false)
  const [expertForm, setExpertForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  })
  const [formSubmitted, setFormSubmitted] = useState(false)

  // Category icons mapping
  const categoryIcons = {
    'salad': '🥗',
    'soups': '🍲',
    'starters': '🍟',
    'burgers': '🍔',
    'pizza': '🍕',
    'maincourse': '🍖',
    'biryani': '🍚',
    'desserts': '🍰',
    'beverages': '🥤',
    'drinks': '🍹',
    'breakfast': '🍳',
    'lunch': '🥘',
    'dinner': '🍝',
    'arabic-food': '🥙',
    'ice-cream': '🍦',
    'shakes': '🥤',
    'others': '🍽️'
  }

  const categoryColors = {
    'salad': '#22c55e',
    'soups': '#f59e0b',
    'starters': '#ef4444',
    'burgers': '#8b5cf6',
    'pizza': '#ec4899',
    'maincourse': '#f97316',
    'biryani': '#eab308',
    'desserts': '#a855f7',
    'beverages': '#06b6d4',
    'drinks': '#14b8a6',
    'breakfast': '#f59e0b',
    'lunch': '#84cc16',
    'dinner': '#6366f1',
    'arabic-food': '#f43f5e',
    'ice-cream': '#e879f9',
    'shakes': '#38bdf8',
    'others': '#6b7280'
  }

  // Fetch restaurants from backend
  useEffect(() => {
    fetchRestaurants()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu`)
      const data = await res.json()
      
      // Group menu items by category and count them
      const categoryCount = {}
      data.forEach(item => {
        const cat = item.category?.toLowerCase() || 'others'
        categoryCount[cat] = (categoryCount[cat] || 0) + 1
      })
      
      // Create category list with counts
      const categoryList = Object.keys(categoryCount).map(cat => ({
        name: cat,
        count: categoryCount[cat],
        icon: categoryIcons[cat] || '🍽️',
        color: categoryColors[cat] || '#6b7280'
      }))
      
      setCategories(categoryList)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/restaurants`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setRestaurants(data)
    } catch (error) {
      console.error("Error fetching restaurants:", error)
      if (window.toast) {
        window.toast.error("Backend server is not connected. Please start the backend server and try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle category click - navigate to menu with category filter
  const handleCategoryClick = (categoryName) => {
    navigate(`/menu/main?category=${categoryName}`)
  }

  // Handle expert consultation form
  const handleExpertSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Here you would send the form data to your backend
      console.log("Expert consultation request:", expertForm)
      
      setFormSubmitted(true)
      setTimeout(() => {
        setShowExpertModal(false)
        setFormSubmitted(false)
        setExpertForm({ name: "", email: "", phone: "", message: "" })
      }, 3000)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const handleExpertFormChange = (e) => {
    setExpertForm({
      ...expertForm,
      [e.target.name]: e.target.value
    })
  }

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term)
    if (term.trim()) {
      navigate(`/menu/search?q=${term}`)
    }
  }

  return (
    <div className="home-container">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          {/* Logo */}
          <div className="hero-logo">
            <span className="logo-icon">🍽️</span>
            <span className="logo-text">QRhino</span>
          </div>
          <h1 className="hero-title">
            <span className="hero-title-main">Discover</span>
            <span className="hero-title-accent">Extraordinary Flavors</span>
          </h1>
          <p className="hero-subtitle">
            Experience culinary excellence with our carefully crafted menu
          </p>
          <div className="hero-buttons">
            <button 
              className="hero-btn primary"
              onClick={() => navigate('/menu/main')}
            >
              Explore Menu
            </button>
            <button 
              className="hero-btn secondary"
              onClick={() => setShowExpertModal(true)}
            >
              Talk to Expert
            </button>
            <button 
              className="hero-btn admin"
              onClick={() => navigate('/admin')}
            >
              Admin Panel
            </button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">Dishes</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">15+</span>
            <span className="stat-label">Categories</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">1000+</span>
            <span className="stat-label">Happy Customers</span>
          </div>
        </div>
      </section>

      {/* Active Coupons/Offers Section */}
      <section style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Advertisement 
          useBackend={true} 
          animation="slideUp"
          showScanner={false}
        />
      </section>

      {/* Restaurants Section - Main focus */}
      <section className="restaurants-section" style={{ paddingTop: '2rem' }}>
        <div className="section-header">
          <h2 className="section-title">Choose a Restaurant</h2>
          <p className="section-subtitle">Select a restaurant to view its menu and order</p>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading restaurants...</p>
        ) : restaurants.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No restaurants found. Please add a restaurant from the Admin Panel.</p>
        ) : (
          <div className="restaurants-grid">
            {restaurants.map((restaurant) => (
              <div 
                key={restaurant._id} 
                className="restaurant-card"
                onClick={() => navigate(`/menu/main?restaurant=${restaurant._id}`)}
              >
                {restaurant.image ? (
                  <img 
                    src={restaurant.image.startsWith('http') ? restaurant.image : `${API_BASE_URL}/uploads/${restaurant.image}`}
                    alt={restaurant.name}
                    className="restaurant-image"
                  />
                ) : (
                  <div className="restaurant-image-placeholder">
                    <span>🍽️</span>
                  </div>
                )}
                <div className="restaurant-content">
                  <h3>{restaurant.name}</h3>
                  <p>{restaurant.location || 'View menu'}</p>
                  {restaurant.phone && <span className="restaurant-phone">{restaurant.phone}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Restaurants Section - continues below */}
      {showExpertModal && (
        <div className="modal-overlay" onClick={() => setShowExpertModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowExpertModal(false)}
            >
              ×
            </button>
            
            {formSubmitted ? (
              <div className="modal-success">
                <span className="success-icon">✓</span>
                <h3>Thank You!</h3>
                <p>Our expert will contact you within 24 hours.</p>
              </div>
            ) : (
              <>
                <h2 className="modal-title">Talk to a Menu Expert</h2>
                <p className="modal-subtitle">
                  Get personalized recommendations and expert advice
                </p>

                <form onSubmit={handleExpertSubmit} className="expert-form">
                  <div className="form-group">
                    <label htmlFor="name">Your Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={expertForm.name}
                      onChange={handleExpertFormChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={expertForm.email}
                      onChange={handleExpertFormChange}
                      required
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={expertForm.phone}
                      onChange={handleExpertFormChange}
                      placeholder="+1 234 567 890"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Your Question</label>
                    <textarea
                      id="message"
                      name="message"
                      value={expertForm.message}
                      onChange={handleExpertFormChange}
                      rows="4"
                      placeholder="Tell us what you'd like to know..."
                    />
                  </div>

                  <button type="submit" className="submit-btn">
                    Request Consultation
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="floating-buttons">
        <button 
          className="floating-btn expert"
          onClick={() => setShowExpertModal(true)}
        >
          <span className="btn-icon">👨‍🍳</span>
          <span className="btn-text">Talk to Expert</span>
        </button>

        <button 
          className="floating-btn cart"
          onClick={() => navigate("/cart")}
        >
          <span className="btn-icon">🛒</span>
          <span className="btn-text">View Cart</span>
        </button>
      </div>

      {/* Scroll to top button */}
      <button 
        className="scroll-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑
      </button>

      {/* Footer with Animation */}
      <footer className="home-footer">
        <div className="footer-wave">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="footer-wave-shape"></path>
          </svg>
        </div>
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo-icon">🍽️</span>
            <span className="logo-text">QRhino</span>
          </div>
          <p className="footer-tagline">
            ✨ Scan • Order • Enjoy ✨
          </p>
          
          <div className="footer-grid">
            <div className="footer-section">
              <h4>📞 Contact Us</h4>
              <p>Phone: +91 98765 43210</p>
              <p>WhatsApp: +91 98765 43211</p>
              <p>Email: support@qrhino.com</p>
            </div>
            <div className="footer-section">
              <h4>🕐 Operating Hours</h4>
              <p>Monday - Friday: 9AM - 11PM</p>
              <p>Saturday - Sunday: 10AM - 12AM</p>
              <p> Holidays: 10AM - 10PM</p>
            </div>
            <div className="footer-section">
              <h4>📍 Our Locations</h4>
              <p>Main Branch: Downtown</p>
              <p>Branch 2: Westside Mall</p>
              <p>Branch 3: Airport Road</p>
            </div>
            <div className="footer-section">
              <h4>🍕 Popular Categories</h4>
              <p>Burgers • Pizzas • Biryani</p>
              <p>Desserts • Beverages</p>
              <p>Starters • Main Course</p>
            </div>
          </div>
          
          <div className="footer-social">
            <span className="social-icon">📘</span>
            <span className="social-icon">📸</span>
            <span className="social-icon">🐦</span>
            <span className="social-icon">💼</span>
          </div>
          
          <div className="footer-links">
            <button onClick={() => navigate("/menu/main")}>🍴 Menu</button>
            <button onClick={() => navigate("/cart")}>🛒 Cart</button>
            <button onClick={() => navigate("/kitchen")}>👨‍🍳 Kitchen</button>
            <button onClick={() => navigate("/admin")}>⚙️ Admin</button>
          </div>
          
          <p className="footer-copyright">
            © 2024 QRhino. All rights reserved. Made with ❤️
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home
