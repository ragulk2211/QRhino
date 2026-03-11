import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../components/Header"
import "../styles/home.css"

import mainImg from "../assets/images/maincourse.webp"
import breakfastImg from "../assets/images/breakfast.webp"
import pizzaImg from "../assets/images/pizza.webp"
import dessertImg from "../assets/images/desserts.webp"
import drinksImg from "../assets/images/drinks.webp"

function Home() {
  const navigate = useNavigate()
  const [featuredItems, setFeaturedItems] = useState([])
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

  const categories = [
    {
      title: "Main Courses",
      desc: "Hearty plates for every craving",
      img: mainImg,
      page: "/menu/main",
      color: "#c49a6c",
      icon: "🍖"
    },
    {
      title: "Breakfast",
      desc: "Morning favorites to start fresh",
      img: breakfastImg,
      page: "/breakfast",
      color: "#f39c12",
      icon: "🍳"
    },
    {
      title: "Pizza",
      desc: "Hand tossed pies with bold toppings",
      img: pizzaImg,
      page: "/pizza",
      color: "#e74c3c",
      icon: "🍕"
    },
    {
      title: "Desserts",
      desc: "Sweet bites to treat yourself",
      img: dessertImg,
      page: "/desserts",
      color: "#e67e22",
      icon: "🍰"
    },
    {
      title: "Beverages",
      desc: "Cool drinks to refresh your day",
      img: drinksImg,
      page: "/beverages",
      color: "#3498db",
      icon: "🥤"
    }
  ]

  // Fetch featured items
  useEffect(() => {
    fetchFeaturedItems()
  }, [])

  const fetchFeaturedItems = async () => {
    try {
      setLoading(true)
      const res = await fetch("http://localhost:5000/menu/featured")
      const data = await res.json()
      setFeaturedItems(data.slice(0, 4))
    } catch (error) {
      console.error("Error fetching featured items:", error)
    } finally {
      setLoading(false)
    }
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

  // Handle category click with animation
  const handleCategoryClick = (page) => {
    navigate(page)
  }

  return (
    <div className="home-container">
      <Header onSearch={handleSearch} />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
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
              onClick={() => {
                document.getElementById('categories').scrollIntoView({ 
                  behavior: 'smooth' 
                })
              }}
            >
              Explore Menu
            </button>
            <button 
              className="hero-btn secondary"
              onClick={() => setShowExpertModal(true)}
            >
              Talk to Expert
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

      {/* Categories Section */}
      <section id="categories" className="categories-section">
        <div className="section-header">
          <h2 className="section-title">Our Categories</h2>
          <p className="section-subtitle">Explore our diverse range of culinary delights</p>
        </div>

        <div className="categories-grid">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="category-card"
              onClick={() => handleCategoryClick(cat.page)}
              style={{ '--category-color': cat.color }}
            >
              <div className="category-image-wrapper">
                <img 
                  src={cat.img} 
                  alt={cat.title} 
                  className="category-image"
                  loading="lazy"
                />
                <div className="category-overlay">
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-explore">Explore →</span>
                </div>
              </div>
              <div className="category-content">
                <h3 className="category-title">{cat.title}</h3>
                <p className="category-desc">{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Items Section */}
      {featuredItems.length > 0 && (
        <section className="featured-section">
          <div className="section-header">
            <h2 className="section-title">Featured Dishes</h2>
            <p className="section-subtitle">Most popular items from our menu</p>
          </div>

          <div className="featured-grid">
            {featuredItems.map((item) => (
              <div 
                key={item._id} 
                className="featured-card"
                onClick={() => navigate(`/menu/item/${item._id}`)}
              >
                <img 
                  src={item.image ? `http://localhost:5000${item.image}` : '/default-food.jpg'} 
                  alt={item.name}
                  className="featured-image"
                />
                <div className="featured-content">
                  <h3>{item.name}</h3>
                  <p>{item.desc.substring(0, 60)}...</p>
                  <div className="featured-meta">
                    <span className="featured-price">₹{item.price}</span>
                    <span className="featured-category">{item.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Expert Consultation Modal */}
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
    </div>
  )
}

export default Home