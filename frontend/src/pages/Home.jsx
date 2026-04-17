import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, message, Input } from "antd";
import {
  ShoppingOutlined,
  CustomerServiceOutlined,
  MenuOutlined,
  UserOutlined,
  EnvironmentOutlined,
  StarOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  WhatsAppOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  SearchOutlined,
  RocketOutlined,
  SecurityScanOutlined,
  GiftOutlined,
  ThunderboltOutlined
} from "@ant-design/icons";
import "../styles/home.css";

function Home() {
  const navigate = useNavigate();

  const heroRef = useRef(null);
  const featuredRef = useRef(null);
  const observerRef = useRef(null);
  const modalRef = useRef(null);

  const API_BASE_URL = useMemo(() => "http://localhost:5000", []);

  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [expertForm, setExpertForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const PLACEHOLDER_IMAGE = useMemo(() => 
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3ede8'/%3E%3Ctext x='50%25' y='50%25' font-size='16' text-anchor='middle' dy='.3em' fill='%238b7355'%3ENo Image Available%3C/text%3E%3C/svg%3E",
    []
  );

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

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/restaurants`);
      if (!res.ok) throw new Error("Failed to fetch restaurants");
      const data = await res.json();
      setRestaurants(data.slice(0, 6));
      setFilteredRestaurants(data.slice(0, 6));
    } catch (err) {
      setError("Failed to load restaurants");
      console.error("Error fetching restaurants:", err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.location?.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  }, [searchTerm, restaurants]);

  const getImageUrl = useCallback(
    (image) => {
      if (!image) return PLACEHOLDER_IMAGE;
      if (image.startsWith("http")) return image;
      if (image.startsWith("data:")) return image;
      return `${API_BASE_URL}/uploads/${image}`;
    },
    [API_BASE_URL, PLACEHOLDER_IMAGE]
  );

  const handleImageError = useCallback((restaurantId) => {
    setImageErrors(prev => ({
      ...prev,
      [restaurantId]: true
    }));
  }, []);

  const getImageSource = useCallback((restaurant) => {
    if (imageErrors[restaurant._id]) {
      return PLACEHOLDER_IMAGE;
    }
    return getImageUrl(restaurant.image) || PLACEHOLDER_IMAGE;
  }, [getImageUrl, imageErrors, PLACEHOLDER_IMAGE]);

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
      message.success("Request sent successfully! Our expert will contact you soon.");

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

  return (
    <div className="home-container">
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
        <div className="floating-bubble bubble-7"></div>
        <div className="floating-bubble bubble-8"></div>
        <div className="floating-bubble bubble-9"></div>
        <div className="floating-bubble bubble-10"></div>
        <div className="floating-bubble bubble-11"></div>
        <div className="floating-bubble bubble-12"></div>
        <div className="floating-bubble bubble-13"></div>
        <div className="floating-bubble bubble-14"></div>
        <div className="floating-bubble bubble-15"></div>
        <div className="floating-bubble bubble-16"></div>
        <div className="floating-bubble bubble-17"></div>
        <div className="floating-bubble bubble-18"></div>
        <div className="floating-bubble bubble-19"></div>
        <div className="floating-bubble bubble-20"></div>
      </div>

      <section className="hero-section" ref={heroRef}>
        <div className="hero-overlay"></div>
        
        {/* Floating Food Icons - Food Items Only */}
        <div className="floating-food-icons">
          <div className="food-icon icon-1 slow-float">
            <img src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png" alt="fine dining" />
          </div>
          <div className="food-icon icon-2 slower-float">
            <img src="https://cdn-icons-png.flaticon.com/512/1998/1998629.png" alt="noodles" />
          </div>
          <div className="food-icon icon-3 slow-float">
            <img src="https://cdn-icons-png.flaticon.com/512/3082/3082383.png" alt="sushi" />
          </div>
          <div className="food-icon icon-4 slower-float">
            <img src="https://cdn-icons-png.flaticon.com/512/1069/1069701.png" alt="pasta" />
          </div>
          <div className="food-icon icon-5 slow-float">
            <img src="https://cdn-icons-png.flaticon.com/512/1098/1098591.png" alt="salad" />
          </div>
          <div className="food-icon icon-6 slower-float">
            <img src="https://cdn-icons-png.flaticon.com/512/1998/1998612.png" alt="meat" />
          </div>
          <div className="food-icon icon-7 slow-float">
            <img src="https://cdn-icons-png.flaticon.com/512/1046/1046779.png" alt="pizza" />
          </div>
          <div className="food-icon icon-8 slower-float">
            <img src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="burger" />
          </div>
        </div>

        <div className="hero-content-wrapper">
          <div className="hero-content animate-on-scroll">
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
              <Button 
                size="large" 
                icon={<CustomerServiceOutlined />} 
                onClick={() => setShowExpertModal(true)} 
                className="hero-btn primary"
              >
                Talk to Expert
              </Button>

              <Button 
                size="large" 
                icon={<UserOutlined />} 
                onClick={() => navigate('/admin')} 
                className="hero-btn secondary"
              >
                Admin Panel
              </Button>

              <Button 
                size="large" 
                icon={<FireOutlined />} 
                onClick={() => navigate('/kitchen')} 
                className="hero-btn secondary"
              >
                Kitchen Panel
              </Button>
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
        {/* Restaurants Section with Search Bar */}
        <section className="restaurants-section animate-on-scroll" ref={featuredRef}>
          <div className="section-header-with-search">
            <div className="section-header">
              <h2 className="section-title">
                Popular <span className="gradient-text">Restaurants</span>
              </h2>
              <p className="section-description">
                Discover the most beloved dining spots in your area
              </p>
            </div>
            <div className="restaurant-search">
              <Input
                placeholder="Search by restaurant name or city..."
                prefix={<SearchOutlined style={{ color: '#ea580c' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                size="large"
                className="restaurant-search-input"
              />
            </div>
          </div>

          <div className="restaurants-grid">
            {loading ? (
              renderRestaurantSkeleton()
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
                <Button type="primary" onClick={fetchRestaurants}>Retry</Button>
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="error-state">
                <p>No restaurants found matching "{searchTerm}"</p>
                <Button type="primary" onClick={() => setSearchTerm("")}>Clear Search</Button>
              </div>
            ) : (
              filteredRestaurants.map((restaurant) => (
                <div key={restaurant._id} className="restaurant-card" onClick={() => handleRestaurantClick(restaurant._id)}>
                  <div className="card-media">
                    <img src={getImageSource(restaurant)} alt={restaurant.name} loading="lazy" onError={() => handleImageError(restaurant._id)} />
                    <div className="card-overlay"></div>
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{restaurant.name}</h3>
                    <div className="card-meta">
                      <div className="meta-item">
                        <EnvironmentOutlined className="meta-icon" />
                        <span>{restaurant.location?.address?.city || "Prime Location"}</span>
                      </div>
                      <div className="meta-item">
                        <StarOutlined className="meta-icon" />
                        <span>{restaurant.rating || "4.5"} (120+ reviews)</span>
                      </div>
                    </div>
                    <button className="card-btn">View Menu <span className="btn-arrow">→</span></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Why Choose Us Section with Ant Design Icons */}
        <section className="features-section animate-on-scroll">
          <div className="section-header centered">
            <h2 className="section-title">Why Choose <span className="gradient-text">Us</span></h2>
          </div>
          <div className="features-grid">
            {[
              { icon: <RocketOutlined />, title: "Premium Quality", desc: "Hand-picked restaurants with exceptional standards" },
              { icon: <ThunderboltOutlined />, title: "Fast Delivery", desc: "Quick and reliable delivery to your doorstep" },
              { icon: <SecurityScanOutlined />, title: "Secure Payment", desc: "Multiple secure payment options available" },
              { icon: <GiftOutlined />, title: "Special Offers", desc: "Exclusive deals and loyalty rewards" }
            ].map((feature, index) => (
              <div key={index} className="feature-card">
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

      {/* Expert Consultation Modal */}
      {showExpertModal && (
        <div className="modal-overlay">
          <div className="modal-container" ref={modalRef}>
            <button className="modal-close" onClick={() => setShowExpertModal(false)}>×</button>
            <div className="modal-header">
              <h3 className="modal-title">Talk to Our Expert</h3>
              <p className="modal-subtitle">Get personalized recommendations from our culinary experts</p>
            </div>
            {formSubmitted ? (
              <div className="success-message">
                <CheckCircleOutlined className="success-icon" />
                <h4>Request Sent Successfully!</h4>
                <p>Our expert will contact you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleExpertSubmit} className="premium-form">
                <div className="form-group">
                  <input type="text" name="name" value={expertForm.name} onChange={handleExpertFormChange} placeholder="Your Name" className={formErrors.name ? "error" : ""} />
                  {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                </div>
                <div className="form-group">
                  <input type="email" name="email" value={expertForm.email} onChange={handleExpertFormChange} placeholder="Email Address" className={formErrors.email ? "error" : ""} />
                  {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                </div>
                <div className="form-group">
                  <input type="tel" name="phone" value={expertForm.phone} onChange={handleExpertFormChange} placeholder="Phone Number" className={formErrors.phone ? "error" : ""} />
                  {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                </div>
                <div className="form-group">
                  <textarea name="message" value={expertForm.message} onChange={handleExpertFormChange} placeholder="Your Message (Optional)" rows="4" />
                </div>
                <Button type="primary" htmlType="submit" block size="large" loading={isSubmitting} icon={<CustomerServiceOutlined />} className="submit-btn">
                  {isSubmitting ? "Submitting..." : "Send Request"}
                </Button>
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
          <div className="footer-grid">
            <div className="footer-section">
              <h4><PhoneOutlined /> Contact Us</h4>
              <p><PhoneOutlined /> Phone: +91 98765 43210</p>
              <p><WhatsAppOutlined /> WhatsApp: +91 98765 43211</p>
              <p><MailOutlined /> Email: support@qrhino.com</p>
            </div>
            <div className="footer-section">
              <h4><ClockCircleOutlined /> Operating Hours</h4>
              <p>Monday - Friday: 9AM - 11PM</p>
              <p>Saturday - Sunday: 10AM - 12AM</p>
              <p>Holidays: 10AM - 10PM</p>
            </div>
            <div className="footer-section">
              <h4><EnvironmentOutlined /> Our Locations</h4>
              <p>Main Branch: Downtown</p>
              <p>Branch 2: Westside Mall</p>
              <p>Branch 3: Airport Road</p>
            </div>
            <div className="footer-section">
              <h4><FireOutlined /> Popular Categories</h4>
              <p>Burgers • Pizzas • Biryani</p>
              <p>Desserts • Beverages</p>
              <p>Starters • Main Course</p>
            </div>
          </div>
          <div className="footer-social">
            <FacebookOutlined className="social-icon facebook" />
            <InstagramOutlined className="social-icon instagram" />
            <TwitterOutlined className="social-icon twitter" />
            <LinkedinOutlined className="social-icon linkedin" />
          </div>
          <div className="footer-links">
            <Button type="link" onClick={() => setShowExpertModal(true)} icon={<CustomerServiceOutlined />}>
              Talk to Expert
            </Button>
            <Button type="link" onClick={() => navigate("/kitchen")} icon={<FireOutlined />}>
              Kitchen Panel
            </Button>
            <Button type="link" onClick={() => navigate("/admin")} icon={<UserOutlined />}>
              Admin Panel
            </Button>
          </div>
          <p className="footer-copyright">© 2024 QRhino. All rights reserved. Made with love</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;