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
  const [activeIndex, setActiveIndex] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

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
    setLoading((prev) => ({ ...prev, restaurants: true }));
    setError((prev) => ({ ...prev, restaurants: null }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/restaurants`);
      if (!res.ok) throw new Error("Failed to fetch restaurants");
      const data = await res.json();
      setRestaurants(data.slice(0, 6));
    } catch {
      setError((prev) => ({ ...prev, restaurants: "Failed to load restaurants" }));
    } finally {
      setLoading((prev) => ({ ...prev, restaurants: false }));
    }
  }, [API_BASE_URL]);

  // Fetch featured items
  const fetchFeaturedItems = useCallback(async () => {
    setLoading((prev) => ({ ...prev, featured: true }));
    setError((prev) => ({ ...prev, featured: null }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/menu/featured`);
      if (!res.ok) throw new Error("Failed to fetch featured items");
      const data = await res.json();
      setFeaturedItems(data.slice(0, 4));
    } catch {
      setError((prev) => ({ ...prev, featured: "Failed to load featured items" }));
    } finally {
      setLoading((prev) => ({ ...prev, featured: false }));
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchRestaurants();
    fetchFeaturedItems();
  }, [fetchRestaurants, fetchFeaturedItems]);

  // Get image URL helper
  const getImageUrl = useCallback(
    (image, type = "restaurant") => {
      if (!image) return "https://via.placeholder.com/400x300?text=No+Image";
      if (image.startsWith("http")) return image;
      if (type === "menu") return `${API_BASE_URL}${image}`;
      return `${API_BASE_URL}/uploads/${image}`;
    },
    [API_BASE_URL]
  );

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

  const handleRestaurantClick = useCallback(
    (id) => {
      navigate(`/menu/main?restaurant=${id}`);
    },
    [navigate]
  );

  // Loading skeletons
  const renderRestaurantSkeleton = () => (
    Array(3).fill(0).map((_, i) => (
      <div key={i} className="restaurant-card skeleton">
        <div className="card-media skeleton-pulse"></div>
        <div className="card-body">
          <div className="skeleton-title"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-btn"></div>
        </div>
      </div>
    ))
  );

  const renderFeaturedSkeleton = () => (
    Array(4).fill(0).map((_, i) => (
      <div key={i} className="featured-card skeleton">
        <div className="card-media skeleton-pulse"></div>
        <div className="card-body">
          <div className="skeleton-title"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-footer"></div>
        </div>
      </div>
    ))
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
        <div className="floating-particle particle-1"></div>
        <div className="floating-particle particle-2"></div>
        <div className="floating-particle particle-3"></div>
        <div className="floating-particle particle-4"></div>
        <div className="floating-particle particle-5"></div>
        <div className="floating-particle particle-6"></div>
        <div className="floating-particle particle-7"></div>
        <div className="floating-particle particle-8"></div>
        <div className="floating-particle particle-9"></div>
        <div className="floating-particle particle-10"></div>
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-overlay"></div>
        
        {/* Floating Food Icons - Right Side with Slower Animation */}
        <div className="floating-food-icons">
          <div className="food-icon icon-1 slow-float">🍽️</div>
          <div className="food-icon icon-2 slower-float">🍜</div>
          <div className="food-icon icon-3 slow-float">🍣</div>
          <div className="food-icon icon-4 slower-float">🍝</div>
          <div className="food-icon icon-5 slow-float">🥗</div>
          <div className="food-icon icon-6 slower-float">🍖</div>
          <div className="food-icon icon-7 slow-float">🍕</div>
          <div className="food-icon icon-8 slower-float">🍔</div>
          <div className="food-icon icon-9 slow-float">🥘</div>
          <div className="food-icon icon-10 slower-float">🍛</div>
          <div className="food-icon icon-11 slow-float">🥂</div>
          <div className="food-icon icon-12 slower-float">🍰</div>
          <div className="food-icon icon-13 slow-float">🥩</div>
          <div className="food-icon icon-14 slower-float">🍗</div>
          <div className="food-icon icon-15 slow-float">🥙</div>
          <div className="food-icon icon-16 slower-float">🌮</div>
        </div>

        {/* Floating Food Images - Right Side with Slower Animation */}
        <div className="floating-food-images">
          <div className="food-image-container image-1 slow-float-img">
            <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format" alt="Salad" />
          </div>
          <div className="food-image-container image-2 slower-float-img">
            <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&auto=format" alt="Pizza" />
          </div>
          <div className="food-image-container image-3 slow-float-img">
            <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&auto=format" alt="Steak" />
          </div>
          <div className="food-image-container image-4 slower-float-img">
            <img src="https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&auto=format" alt="Seafood" />
          </div>
          <div className="food-image-container image-5 slow-float-img">
            <img src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&auto=format" alt="Pasta" />
          </div>
          <div className="food-image-container image-6 slower-float-img">
            <img src="https://images.unsplash.com/photo-1574484284004-953d0e4c9a1f?w=300&auto=format" alt="Dessert" />
          </div>
          <div className="food-image-container image-7 slow-float-img">
            <img src="https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=300&auto=format" alt="Pasta" />
          </div>
          <div className="food-image-container image-8 slower-float-img">
            <img src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&auto=format" alt="Salad" />
          </div>
        </div>

        {/* Left Side Content */}
        <div className="hero-content-wrapper">
          <div className="hero-content animate-on-scroll">
            <h1 className="hero-title">
              <span className="title-line">Discover</span>
              <span className="title-line gradient-text">Exquisite</span>
              <span className="title-line">Dining</span>
            </h1>

            <p className="hero-subtitle">
              Premium restaurant experiences crafted for unforgettable moments.
              Explore curated menus from the finest establishments.
            </p>

            <div className="hero-actions">
              <button
                className="hero-btn primary"
                onClick={() =>
                  featuredRef.current?.scrollIntoView({ behavior: "smooth" })
                }
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
            ) : (
              restaurants.map((restaurant, index) => (
                <article
                  key={restaurant._id}
                  className={`restaurant-card hover-style-${index % 6 + 1} ${
                    hoveredCard === `restaurant-${index}` ? "hover-active" : ""
                  }`}
                  onClick={() => handleRestaurantClick(restaurant._id)}
                  onMouseEnter={() => setHoveredCard(`restaurant-${index}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="card-front">
                    <div className="card-media">
                      <img
                        src={getImageUrl(restaurant.image)}
                        alt={restaurant.name}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
                        }}
                      />
                      <div className="card-overlay"></div>
                    </div>

                    <div className="card-body">
                      <h3 className="card-title">{restaurant.name}</h3>

                      <div className="card-meta">
                        <div className="meta-item">
                          <span className="meta-icon">📍</span>
                          <span className="meta-text">{restaurant.location || "Prime Location"}</span>
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
                  </div>
                </article>
              ))
            )}
          </div>

          {!loading.restaurants && restaurants.length > 0 && (
            <div className="section-footer">
              <button className="view-all-btn">
                View All Restaurants
                <span className="btn-arrow">→</span>
              </button>
            </div>
          )}
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
                  className={`featured-card featured-hover-${index % 4 + 1} ${
                    hoveredCard === `featured-${index}` ? "hover-active" : ""
                  }`}
                  onMouseEnter={() => setHoveredCard(`featured-${index}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="card-media">
                    <img
                      src={getImageUrl(item.image, "menu")}
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
                      }}
                    />
                    {item.isVegetarian && (
                      <span className="veg-badge">🌱 Veg</span>
                    )}
                    <div className="card-image-overlay"></div>
                  </div>

                  <div className="card-body">
                    <h3 className="card-title">{item.name}</h3>
                    <p className="card-description">{item.desc || "Delicious dish prepared with fresh ingredients"}</p>

                    <div className="card-footer">
                      <div className="price-section">
                        <span className="card-price">₹{item.price}</span>
                        {item.originalPrice && (
                          <span className="original-price">₹{item.originalPrice}</span>
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
                className={`feature-card feature-card-hover-${index + 1} ${
                  hoveredCard === `feature-${index}` ? "hover-active" : ""
                }`}
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

      {/* Floating Action Button */}
      <button 
        className="floating-btn"
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
    </div>
  );
}

export default Home;