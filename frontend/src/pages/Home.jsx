import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/home.css";

function Home() {
  const navigate = useNavigate();

  const heroRef = useRef(null);
  const featuredRef = useRef(null);
  const observerRef = useRef(null);
  const modalRef = useRef(null);

  const API_BASE_URL = useMemo(() => "http://localhost:5000", []);

  const [featuredItems, setFeaturedItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState({ restaurants: false, featured: false });
  const [error, setError] = useState({ restaurants: null, featured: null });
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [expertForm, setExpertForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  // Permanent placeholder image (base64 encoded fallback to avoid external requests)
  const PLACEHOLDER_IMAGE = useMemo(() => 
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e8d9cc'/%3E%3Ctext x='50%25' y='50%25' font-size='16' text-anchor='middle' dy='.3em' fill='%238b6946'%3ENo Image Available%3C/text%3E%3C/svg%3E",
    []
  );

  // Intersection Observer for scroll animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observerRef.current.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  // Modal click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowExpertModal(false);
      }
    };

    if (showExpertModal) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [showExpertModal]);

  // Fetch restaurants
  const fetchRestaurants = useCallback(async () => {
    setLoading(prev => ({ ...prev, restaurants: true }));
    setError(prev => ({ ...prev, restaurants: null }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/restaurants`);
      if (!res.ok) throw new Error("Failed to fetch restaurants");
      const data = await res.json();
      setRestaurants(data.slice(0, 6));
    } catch (err) {
      setError(prev => ({ ...prev, restaurants: "Failed to load restaurants" }));
      console.error("Error fetching restaurants:", err);
    } finally {
      setLoading(prev => ({ ...prev, restaurants: false }));
    }
  }, [API_BASE_URL]);

  // Fetch featured items
  const fetchFeaturedItems = useCallback(async () => {
    setLoading(prev => ({ ...prev, featured: true }));
    setError(prev => ({ ...prev, featured: null }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/menu/featured`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setFeaturedItems(data.slice(0, 4));
    } catch (error) {
      console.error("Error fetching featured items:", error);
      setError(prev => ({ ...prev, featured: "Failed to load featured items" }));
    } finally {
      setLoading(prev => ({ ...prev, featured: false }));
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchRestaurants();
    fetchFeaturedItems();
  }, [fetchRestaurants, fetchFeaturedItems]);

  // Get image URL helper with permanent fallback
  const getImageUrl = useCallback(
    (image, type = "restaurant") => {
      if (!image) return PLACEHOLDER_IMAGE;
      if (image.startsWith("http")) return image;
      if (image.startsWith("data:")) return image;
      if (type === "menu") return `${API_BASE_URL}${image}`;
      return `${API_BASE_URL}/uploads/${image}`;
    },
    [API_BASE_URL, PLACEHOLDER_IMAGE]
  );

  // Handle image errors permanently
  const handleImageError = useCallback((itemId, type = "restaurant") => {
    setImageErrors(prev => ({
      ...prev,
      [`${type}-${itemId}`]: true
    }));
  }, []);

  // Get final image source with error handling
  const getImageSource = useCallback((item, type = "restaurant") => {
    const errorKey = `${type}-${item._id || item.name}`;
    if (imageErrors[errorKey]) {
      return PLACEHOLDER_IMAGE;
    }
    const imageUrl = getImageUrl(item.image, type);
    return imageUrl || PLACEHOLDER_IMAGE;
  }, [getImageUrl, imageErrors, PLACEHOLDER_IMAGE]);

  // Form validation
  const validateForm = useCallback(() => {
    const errors = {};
    if (!expertForm.name.trim()) errors.name = "Name is required";
    if (!expertForm.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(expertForm.email)) errors.email = "Email is invalid";
    if (!expertForm.phone.trim()) errors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(expertForm.phone.replace(/\D/g, ""))) errors.phone = "Phone must be 10 digits";
    return errors;
  }, [expertForm]);

  const handleExpertFormChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setExpertForm((prev) => ({ ...prev, [name]: value }));
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: null }));
      }
    },
    [formErrors]
  );

  const handleExpertSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = validateForm();

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setFormSubmitted(true);
      setIsSubmitting(false);

      setTimeout(() => {
        setShowExpertModal(false);
        setFormSubmitted(false);
        setExpertForm({ name: "", email: "", phone: "", message: "" });
      }, 2000);
    },
    [validateForm]
  );

  // Handle restaurant click
  const handleRestaurantClick = useCallback(
    (id) => {
      navigate(`/menu/main?restaurant=${id}`);
    },
    [navigate]
  );

  // Handle back to home
  const handleBackToHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Handle category click
  const handleCategoryClick = useCallback((categoryName) => {
    navigate(`/menu/main?category=${categoryName}`);
  }, [navigate]);

  // Loading skeletons
  const renderRestaurantSkeleton = () => (
    <>
      {[1, 2, 3, 4, 5, 6].map((_, i) => (
        <div key={i} className="restaurant-card skeleton">
          <div className="card-media skeleton-pulse"></div>
          <div className="card-body">
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-btn"></div>
          </div>
        </div>
      ))}
    </>
  );

  const renderFeaturedSkeleton = () => (
    <>
      {[1, 2, 3, 4].map((_, i) => (
        <div key={i} className="featured-card skeleton">
          <div className="card-media skeleton-pulse"></div>
          <div className="card-body">
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-footer"></div>
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="home-container">
      {/* Floating decorative elements - Background Layer */}
      <div className="floating-elements">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        <div className="floating-orb orb-4"></div>
        <div className="floating-bubble bubble-1"></div>
        <div className="floating-bubble bubble-2"></div>
        <div className="floating-bubble bubble-3"></div>
        <div className="floating-bubble bubble-4"></div>
        <div className="floating-bubble bubble-5"></div>
        <div className="floating-bubble bubble-6"></div>
      </div>

      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-overlay"></div>
        
        {/* Floating Food Icons */}
        <div className="floating-food-icons">
          <div className="food-icon icon-1 slow-float">🍽️</div>
          <div className="food-icon icon-2 slower-float">🍜</div>
          <div className="food-icon icon-3 slow-float">🍣</div>
          <div className="food-icon icon-4 slower-float">🍝</div>
          <div className="food-icon icon-5 slow-float">🥗</div>
          <div className="food-icon icon-6 slower-float">🍖</div>
          <div className="food-icon icon-7 slow-float">🍕</div>
          <div className="food-icon icon-8 slower-float">🍔</div>
        </div>

        {/* Left Side Content */}
        <div className="hero-content-wrapper">
          <div className="hero-content animate-on-scroll">
            <div className="hero-logo">
              <span className="logo-icon">🍽️</span>
              <span className="logo-text">QRhino</span>
            </div>
            
            <h1 className="hero-title">
              <span className="title-line">Discover</span>
              <span className="title-line gradient-text">Exquisite</span>
              <span className="title-line">Dining</span>
            </h1>

            <p className="hero-subtitle">
              Experience culinary excellence with our carefully crafted menu.
              Scan, Order, and Enjoy from the finest restaurants.
            </p>

            <div className="hero-actions">
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

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Restaurants</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100+</span>
                <span className="stat-label">Menu Items</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="main-content">
        {/* Back to Home Button */}
        <div className="back-to-home-wrapper">
          <button className="back-to-home-btn" onClick={handleBackToHome}>
            <span className="back-icon">←</span>
            <span>Back to Home</span>
          </button>
        </div>

        {/* Restaurants Section */}
        <section className="restaurants-section animate-on-scroll" ref={featuredRef}>
          <div className="section-header">
            <h2 className="section-title">
              Popular <span className="gradient-text">Restaurants</span>
            </h2>
            <p className="section-description">
              Discover the most beloved dining spots in your area
            </p>
          </div>

          <div className="restaurants-grid">
            {loading.restaurants ? (
              renderRestaurantSkeleton()
            ) : error.restaurants ? (
              <div className="error-state">
                <p>{error.restaurants}</p>
                <button onClick={fetchRestaurants} className="retry-btn">
                  Retry
                </button>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="error-state">
                <p>No restaurants found. Please add a restaurant from the Admin Panel.</p>
                <button onClick={() => navigate('/admin')} className="retry-btn">
                  Go to Admin
                </button>
              </div>
            ) : (
              restaurants.map((restaurant, index) => (
                <article
                  key={restaurant._id}
                  className="restaurant-card"
                  onClick={() => handleRestaurantClick(restaurant._id)}
                  onMouseEnter={() => setHoveredCard(`restaurant-${index}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="card-media">
                    <img
                      src={getImageSource(restaurant, "restaurant")}
                      alt={restaurant.name}
                      loading="lazy"
                      onError={() => handleImageError(restaurant._id, "restaurant")}
                    />
                    <div className="card-overlay"></div>
                  </div>

                  <div className="card-body">
                    <h3 className="card-title">{restaurant.name}</h3>

                    <div className="card-meta">
                      <div className="meta-item">
                        <span className="meta-icon">📍</span>
                        <span className="meta-text">{restaurant.location?.address?.city || "Prime Location"}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">⭐</span>
                        <span className="meta-text">{restaurant.rating || "4.5"} (120+ reviews)</span>
                      </div>
                    </div>

                    <button className="card-btn">
                      View Menu
                      <span className="btn-arrow">→</span>
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Featured Items Section */}
        <section className="featured-section animate-on-scroll">
          <div className="section-header">
            <h2 className="section-title">
              Featured <span className="gradient-text">Dishes</span>
            </h2>
            <p className="section-description">
              Chef's special selections you don't want to miss
            </p>
          </div>

          <div className="featured-grid">
            {loading.featured ? (
              renderFeaturedSkeleton()
            ) : error.featured ? (
              <div className="error-state">
                <p>{error.featured}</p>
                <button onClick={fetchFeaturedItems} className="retry-btn">
                  Retry
                </button>
              </div>
            ) : (
              featuredItems.map((item, index) => (
                <article 
                  key={item._id} 
                  className="featured-card"
                  onMouseEnter={() => setHoveredCard(`featured-${index}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="card-media">
                    <img
                      src={getImageSource(item, "menu")}
                      alt={item.name}
                      loading="lazy"
                      onError={() => handleImageError(item._id, "menu")}
                    />
                    {item.foodType && (
                      <span className={`veg-nonveg-badge ${item.foodType === 'veg' ? 'veg' : 'non-veg'}`}>
                        {item.foodType === 'veg' ? '🌱 Veg' : '🍖 Non-Veg'}
                      </span>
                    )}
                    <div className="card-image-overlay"></div>
                  </div>

                  <div className="card-body">
                    <h3 className="card-title">{item.name}</h3>
                    <p className="card-description">{item.desc || "Delicious dish prepared with fresh ingredients"}</p>

                    <div className="card-footer">
                      <div className="price-section">
                        <span className="card-price">₹{item.price}</span>
                        {item.discount > 0 && (
                          <span className="original-price">₹{item.originalPrice || item.price}</span>
                        )}
                      </div>
                      <button className="add-btn" aria-label="Add to cart">
                        <span className="add-icon">+</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section animate-on-scroll">
          <div className="section-header centered">
            <h2 className="section-title">
              Why Choose <span className="gradient-text">Us</span>
            </h2>
          </div>

          <div className="features-grid">
            {[
              { icon: "🍽️", title: "Premium Quality", desc: "Hand-picked restaurants with exceptional standards" },
              { icon: "🚚", title: "Fast Delivery", desc: "Quick and reliable delivery to your doorstep" },
              { icon: "💳", title: "Secure Payment", desc: "Multiple secure payment options available" },
              { icon: "🎉", title: "Special Offers", desc: "Exclusive deals and loyalty rewards" }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="feature-card"
                onMouseEnter={() => setHoveredCard(`feature-${index}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="feature-icon-wrapper">
                  <div className="feature-icon">{feature.icon}</div>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Action Buttons */}
      <div className="floating-buttons">
        <button 
          className="floating-btn expert"
          onClick={() => setShowExpertModal(true)}
          aria-label="Talk to Expert"
        >
          <span className="btn-icon">👨‍🍳</span>
        </button>

        <button 
          className="floating-btn cart"
          onClick={() => navigate("/cart")}
          aria-label="View Cart"
        >
          <span className="btn-icon">🛒</span>
        </button>
      </div>

      {/* Scroll to top button */}
      <button 
        className="scroll-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        ↑
      </button>

      {/* Expert Consultation Modal */}
      {showExpertModal && (
        <div className="modal-overlay">
          <div className="modal-container" ref={modalRef}>
            <button 
              className="modal-close"
              onClick={() => setShowExpertModal(false)}
              aria-label="Close modal"
            >
              ×
            </button>

            <div className="modal-header">
              <h3 className="modal-title">Talk to Our Expert</h3>
              <p className="modal-subtitle">
                Get personalized recommendations from our culinary experts
              </p>
            </div>

            {formSubmitted ? (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h4>Request Sent Successfully!</h4>
                <p>Our expert will contact you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleExpertSubmit} className="premium-form">
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    value={expertForm.name}
                    onChange={handleExpertFormChange}
                    placeholder="Your Name"
                    className={formErrors.name ? "error" : ""}
                  />
                  {formErrors.name && (
                    <span className="error-message">{formErrors.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    value={expertForm.email}
                    onChange={handleExpertFormChange}
                    placeholder="Email Address"
                    className={formErrors.email ? "error" : ""}
                  />
                  {formErrors.email && (
                    <span className="error-message">{formErrors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <input
                    type="tel"
                    name="phone"
                    value={expertForm.phone}
                    onChange={handleExpertFormChange}
                    placeholder="Phone Number"
                    className={formErrors.phone ? "error" : ""}
                  />
                  {formErrors.phone && (
                    <span className="error-message">{formErrors.phone}</span>
                  )}
                </div>

                <div className="form-group">
                  <textarea
                    name="message"
                    value={expertForm.message}
                    onChange={handleExpertFormChange}
                    placeholder="Your Message (Optional)"
                    rows="4"
                  />
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Submitting...
                    </>
                  ) : (
                    "Send Request"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
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
              <p>Holidays: 10AM - 10PM</p>
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
  );
}

export default Home;