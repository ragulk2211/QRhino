import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import {
  Button,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  message,
  Skeleton,
  Empty,
  Rate,
  Tag,
  Tooltip,
  FloatButton,
  Avatar,
  Divider,
  Result,
  Spin,
  Alert
} from "antd";
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  CustomerServiceOutlined,
  UpOutlined,
  EnvironmentOutlined,
  StarOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  MenuOutlined,
  UserOutlined,
  HomeOutlined,
  ShopOutlined,
  RocketOutlined,
  SafetyOutlined,
  GiftOutlined,
  QrcodeOutlined
} from "@ant-design/icons";
import API_BASE_URL from "../config";
import "../styles/home.css";

const { Title, Text, Paragraph } = Typography;

// Permanent placeholder image (base64 encoded fallback)
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f5efe9'/%3E%3Ctext x='50%25' y='50%25' font-size='16' text-anchor='middle' dy='.3em' fill='%23b89a78'%3ENo Image Available%3C/text%3E%3C/svg%3E";

function Home() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const heroRef = useRef(null);
  const featuredRef = useRef(null);
  const observerRef = useRef(null);
=======

import "../styles/home.css";

function Home() {
  const navigate = useNavigate();

  const heroRef = useRef(null);
  const featuredRef = useRef(null);
  const observerRef = useRef(null);
  const modalRef = useRef(null);

  const API_BASE_URL = useMemo(() => "http://localhost:5000", []);
>>>>>>> 05ec542275b1e10bcf483ed8339c70e7aa99c497

  const [featuredItems, setFeaturedItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState({ restaurants: false, featured: false });
  const [error, setError] = useState({ restaurants: null, featured: null });
  const [showExpertModal, setShowExpertModal] = useState(false);
<<<<<<< HEAD
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

=======
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

>>>>>>> 05ec542275b1e10bcf483ed8339c70e7aa99c497
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

<<<<<<< HEAD
    const elements = document.querySelectorAll(".home-animate-on-scroll");
=======
    const elements = document.querySelectorAll(".animate-on-scroll");
>>>>>>> 05ec542275b1e10bcf483ed8339c70e7aa99c497
    elements.forEach((el) => observerRef.current.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

<<<<<<< HEAD
=======
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

>>>>>>> 05ec542275b1e10bcf483ed8339c70e7aa99c497
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
<<<<<<< HEAD
      message.error("Failed to load restaurants");
=======
>>>>>>> 05ec542275b1e10bcf483ed8339c70e7aa99c497
      console.error("Error fetching restaurants:", err);
    } finally {
      setLoading(prev => ({ ...prev, restaurants: false }));
    }
<<<<<<< HEAD
  }, []);
=======
  }, [API_BASE_URL]);
>>>>>>> 05ec542275b1e10bcf483ed8339c70e7aa99c497

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
<<<<<<< HEAD
      setFeaturedItems(data.slice(0, 8));
    } catch (error) {
      console.error("Error fetching featured items:", error);
      setError(prev => ({ ...prev, featured: "Failed to load featured items" }));
      message.error("Failed to load featured items");
    } finally {
      setLoading(prev => ({ ...prev, featured: false }));
    }
  }, []);
=======
      setFeaturedItems(data.slice(0, 4));
    } catch (error) {
      console.error("Error fetching featured items:", error);
      setError(prev => ({ ...prev, featured: "Failed to load featured items" }));
    } finally {
      setLoading(prev => ({ ...prev, featured: false }));
    }
  }, [API_BASE_URL]);
>>>>>>> 05ec542275b1e10bcf483ed8339c70e7aa99c497

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
<<<<<<< HEAD
    []
=======
    [API_BASE_URL, PLACEHOLDER_IMAGE]
>>>>>>> 05ec542275b1e10bcf483ed8339c70e7aa99c497
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
<<<<<<< HEAD
  }, [getImageUrl, imageErrors]);

  // Handle expert form submission
  const handleExpertSubmit = useCallback(async (values) => {
    setIsSubmitting(true);
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setFormSubmitted(true);
    setIsSubmitting(false);
    message.success("Request sent successfully! Our expert will contact you soon.");
    
    setTimeout(() => {
      setShowExpertModal(false);
      setFormSubmitted(false);
      form.resetFields();
    }, 2000);
  }, [form]);
=======
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
>>>>>>> 05ec542275b1e10bcf483ed8339c70e7aa99c497

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

<<<<<<< HEAD
  // Loading skeletons
  const renderRestaurantSkeleton = () => (
    <Row gutter={[24, 24]}>
      {[1, 2, 3, 4, 5, 6].map((_, i) => (
        <Col xs={24} sm={12} lg={8} key={i}>
          <Card className="home-restaurant-card skeleton">
            <Skeleton.Image active style={{ width: '100%', height: 220 }} />
            <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 16 }} />
          </Card>
        </Col>
      ))}
    </Row>
=======
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
>>>>>>> 05ec542275b1e10bcf483ed8339c70e7aa99c497
  );

  return (
    <div className="home-container">
<<<<<<< HEAD
      {/* Floating decorative elements */}
      <div className="home-floating-elements">
        <div className="home-floating-orb orb-1"></div>
        <div className="home-floating-orb orb-2"></div>
        <div className="home-floating-orb orb-3"></div>
        <div className="home-floating-orb orb-4"></div>
      </div>

      {/* Hero Section */}
      <section className="home-hero-section" ref={heroRef}>
        <div className="home-hero-overlay"></div>
        
        {/* Floating Food Icons */}
        <div className="home-floating-food-icons">
          <div className="home-food-icon icon-1 slow-float">🍽️</div>
          <div className="home-food-icon icon-2 slower-float">🍜</div>
          <div className="home-food-icon icon-3 slow-float">🍣</div>
          <div className="home-food-icon icon-4 slower-float">🍝</div>
          <div className="home-food-icon icon-5 slow-float">🥗</div>
          <div className="home-food-icon icon-6 slower-float">🍖</div>
          <div className="home-food-icon icon-7 slow-float">🍕</div>
          <div className="home-food-icon icon-8 slower-float">🍔</div>
        </div>

        {/* Hero Content */}
        <div className="home-hero-content-wrapper">
          <div className="home-hero-content home-animate-on-scroll">
            <div className="home-hero-logo">
              <span className="home-logo-icon">🍽️</span>
              <span className="home-logo-text">QRhino</span>
            </div>
            
            <Title level={1} className="home-hero-title">
              <span className="home-title-line">Discover</span>
              <span className="home-title-line home-gradient-text">Exquisite</span>
              <span className="home-title-line">Dining</span>
            </Title>

            <Paragraph className="home-hero-subtitle">
              Experience culinary excellence with our carefully crafted menu.
              Scan, Order, and Enjoy from the finest restaurants.
            </Paragraph>

            <Space size="middle" className="home-hero-actions" wrap>
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate('/menu/main')}
                icon={<MenuOutlined />}
                className="home-hero-btn-primary"
              >
                Explore Menu
              </Button>

              <Button 
                size="large"
                onClick={() => setShowExpertModal(true)}
                icon={<CustomerServiceOutlined />}
                className="home-hero-btn-secondary"
              >
                Talk to Expert
              </Button>

              <Button 
                size="large"
                onClick={() => navigate('/admin')}
                icon={<UserOutlined />}
                className="home-hero-btn-admin"
              >
                Admin Panel
              </Button>
            </Space>

            <Row gutter={[16, 16]} className="home-hero-stats">
              <Col xs={24} sm={8}>
                <div className="home-stat-item">
                  <div className="home-stat-number">50+</div>
                  <div className="home-stat-label">Restaurants</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="home-stat-item">
                  <div className="home-stat-number">100+</div>
                  <div className="home-stat-label">Menu Items</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="home-stat-item">
                  <div className="home-stat-number">10k+</div>
                  <div className="home-stat-label">Happy Customers</div>
                </div>
              </Col>
            </Row>

            {/* QR Code Section */}
            <div className="home-qr-section">
              <Button 
                icon={<QrcodeOutlined />} 
                onClick={() => setShowQRCode(!showQRCode)}
                type="link"
                className="home-qr-btn"
              >
                Scan to Order
              </Button>
              {showQRCode && (
                <div className="home-qr-code-container">
                  <div className="home-qr-code">
                    <QrcodeOutlined style={{ fontSize: 80, color: '#ff9f4a' }} />
                  </div>
                  <Text type="secondary" className="home-qr-text">
                    Scan to view menu on your phone
                  </Text>
                </div>
              )}
=======
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
>>>>>>> 05ec542275b1e10bcf483ed8339c70e7aa99c497
            </div>
          </div>
        </div>
      </section>

<<<<<<< HEAD
      <main className="home-main-content">
        {/* Back to Home Button */}
        <div className="home-back-to-home-wrapper">
          <Button 
            onClick={handleBackToHome}
            icon={<ArrowLeftOutlined />}
            className="home-back-to-home-btn"
          >
            Back to Home
          </Button>
        </div>

        {/* Restaurants Section */}
        <section className="home-restaurants-section home-animate-on-scroll" ref={featuredRef}>
          <div className="home-section-header">
            <Title level={2} className="home-section-title">
              Popular <span className="home-gradient-text">Restaurants</span>
            </Title>
            <Paragraph className="home-section-description">
              Discover the most beloved dining spots in your area
            </Paragraph>
          </div>

          {loading.restaurants ? (
            renderRestaurantSkeleton()
          ) : error.restaurants ? (
            <Result
              status="error"
              title="Failed to load restaurants"
              subTitle={error.restaurants}
              extra={
                <Button type="primary" onClick={fetchRestaurants}>
                  Retry
                </Button>
              }
            />
          ) : restaurants.length === 0 ? (
            <Empty
              description="No restaurants found"
              className="home-error-state"
            >
              <Button type="primary" onClick={() => navigate('/admin')}>
                Go to Admin
              </Button>
            </Empty>
          ) : (
            <Row gutter={[24, 24]} className="home-restaurants-grid">
              {restaurants.map((restaurant, index) => (
                <Col xs={24} sm={12} lg={8} key={restaurant._id}>
                  <Card
                    hoverable
                    className="home-restaurant-card"
                    onClick={() => handleRestaurantClick(restaurant._id)}
                    cover={
                      <div className="home-card-media">
                        <img
                          src={getImageSource(restaurant, "restaurant")}
                          alt={restaurant.name}
                          loading="lazy"
                          onError={() => handleImageError(restaurant._id, "restaurant")}
                        />
                        <div className="home-card-overlay"></div>
                      </div>
                    }
                    onMouseEnter={() => setHoveredCard(`restaurant-${index}`)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Title level={4} className="home-card-title">{restaurant.name}</Title>
                    <div className="home-card-meta">
                      <div className="home-meta-item">
                        <EnvironmentOutlined className="home-meta-icon" />
                        <Text>{restaurant.location?.address?.city || "Prime Location"}</Text>
                      </div>
                      <div className="home-meta-item">
                        <StarOutlined className="home-meta-icon" />
                        <Rate disabled defaultValue={restaurant.rating || 4.5} style={{ fontSize: 14 }} />
                        <Text style={{ marginLeft: 8 }}>({restaurant.reviews || 120}+)</Text>
                      </div>
                    </div>
                    <Button type="link" className="home-card-btn">
                      View Menu
                      <span className="home-btn-arrow">→</span>
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </section>

        {/* Features Section */}
        <section className="home-features-section home-animate-on-scroll">
          <div className="home-section-header centered">
            <Title level={2} className="home-section-title">
              Why Choose <span className="home-gradient-text">Us</span>
            </Title>
          </div>

          <Row gutter={[24, 24]} className="home-features-grid">
=======
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
>>>>>>> 05ec542275b1e10bcf483ed8339c70e7aa99c497
            {[
              { icon: "🍽️", title: "Premium Quality", desc: "Hand-picked restaurants with exceptional standards" },
              { icon: "🚚", title: "Fast Delivery", desc: "Quick and reliable delivery to your doorstep" },
              { icon: "💳", title: "Secure Payment", desc: "Multiple secure payment options available" },
              { icon: "🎉", title: "Special Offers", desc: "Exclusive deals and loyalty rewards" }
            ].map((feature, index) => (
<<<<<<< HEAD
              <Col xs={24} sm={12} md={6} key={index}>
                <Card
                  hoverable
                  className="home-feature-card"
                  onMouseEnter={() => setHoveredCard(`feature-${index}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="home-feature-icon-wrapper">
                    <div className="home-feature-icon">{feature.icon}</div>
                  </div>
                  <Title level={4} className="home-feature-title">{feature.title}</Title>
                  <Paragraph className="home-feature-description">{feature.desc}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
=======
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
>>>>>>> 05ec542275b1e10bcf483ed8339c70e7aa99c497
        </section>
      </main>

      {/* Floating Action Buttons */}
<<<<<<< HEAD
      <FloatButton.Group shape="circle" className="home-floating-buttons">
        <FloatButton 
          icon={<CustomerServiceOutlined />}
          onClick={() => setShowExpertModal(true)}
          tooltip="Talk to Expert"
        />
        <FloatButton 
          icon={<ShoppingCartOutlined />}
          onClick={() => navigate("/cart")}
          tooltip="View Cart"
        />
      </FloatButton.Group>

      {/* Scroll to top button */}
      <FloatButton 
        icon={<UpOutlined />}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        tooltip="Scroll to top"
        className="home-scroll-top"
      />

      {/* Expert Consultation Modal */}
      <Modal
        title={
          <div className="home-modal-header">
            <Title level={3} className="home-modal-title">Talk to Our Expert</Title>
            <Text type="secondary" className="home-modal-subtitle">
              Get personalized recommendations from our culinary experts
            </Text>
          </div>
        }
        open={showExpertModal}
        onCancel={() => setShowExpertModal(false)}
        footer={null}
        width={500}
        className="home-expert-modal"
        centered
      >
        {formSubmitted ? (
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Request Sent Successfully!"
            subTitle="Our expert will contact you within 24 hours."
            status="success"
          />
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleExpertSubmit}
            className="home-premium-form"
          >
            <Form.Item
              name="name"
              label="Your Name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input 
                placeholder="Enter your full name"
                prefix={<UserOutlined />}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input 
                placeholder="your@email.com"
                prefix={<MailOutlined />}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                { required: true, message: 'Please enter your phone number' },
                { pattern: /^\d{10}$/, message: 'Phone number must be 10 digits' }
              ]}
            >
              <Input 
                placeholder="9876543210"
                prefix={<PhoneOutlined />}
                size="large"
                maxLength={10}
              />
            </Form.Item>

            <Form.Item
              name="message"
              label="Your Message (Optional)"
            >
              <Input.TextArea 
                placeholder="Tell us about your dining preferences or special requests..."
                rows={4}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                size="large"
                loading={isSubmitting}
                icon={<CustomerServiceOutlined />}
                className="home-submit-btn"
              >
                Send Request
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-wave">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="home-footer-wave-shape"></path>
          </svg>
        </div>
        <div className="home-footer-content">
          <div className="home-footer-logo">
            <span className="home-logo-icon">🍽️</span>
            <span className="home-logo-text">QRhino</span>
          </div>
          <Paragraph className="home-footer-tagline">
            ✨ Scan • Order • Enjoy ✨
          </Paragraph>
          
          <Row gutter={[24, 24]} className="home-footer-grid">
            <Col xs={24} sm={12} md={6}>
              <div className="home-footer-section">
                <Title level={4}>📞 Contact Us</Title>
                <Paragraph>Phone: +91 98765 43210</Paragraph>
                <Paragraph>WhatsApp: +91 98765 43211</Paragraph>
                <Paragraph>Email: support@qrhino.com</Paragraph>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="home-footer-section">
                <Title level={4}>🕐 Operating Hours</Title>
                <Paragraph>Monday - Friday: 9AM - 11PM</Paragraph>
                <Paragraph>Saturday - Sunday: 10AM - 12AM</Paragraph>
                <Paragraph>Holidays: 10AM - 10PM</Paragraph>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="home-footer-section">
                <Title level={4}>📍 Our Locations</Title>
                <Paragraph>Main Branch: Downtown</Paragraph>
                <Paragraph>Branch 2: Westside Mall</Paragraph>
                <Paragraph>Branch 3: Airport Road</Paragraph>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="home-footer-section">
                <Title level={4}>🍕 Popular Categories</Title>
                <Paragraph>Burgers • Pizzas • Biryani</Paragraph>
                <Paragraph>Desserts • Beverages</Paragraph>
                <Paragraph>Starters • Main Course</Paragraph>
              </div>
            </Col>
          </Row>
          
          <div className="home-footer-social">
            <Tooltip title="Facebook">
              <span className="home-social-icon">📘</span>
            </Tooltip>
            <Tooltip title="Instagram">
              <span className="home-social-icon">📸</span>
            </Tooltip>
            <Tooltip title="Twitter">
              <span className="home-social-icon">🐦</span>
            </Tooltip>
            <Tooltip title="LinkedIn">
              <span className="home-social-icon">💼</span>
            </Tooltip>
          </div>
          
          <div className="home-footer-links">
            <Button type="link" onClick={() => navigate("/menu/main")} icon={<MenuOutlined />}>
              Menu
            </Button>
            <Button type="link" onClick={() => navigate("/cart")} icon={<ShoppingCartOutlined />}>
              Cart
            </Button>
            <Button type="link" onClick={() => navigate("/kitchen")} icon={<HomeOutlined />}>
              Kitchen
            </Button>
            <Button type="link" onClick={() => navigate("/admin")} icon={<UserOutlined />}>
              Admin
            </Button>
          </div>
          
          <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />
          
          <Text type="secondary" className="home-footer-copyright">
            © 2024 QRhino. All rights reserved. Made with ❤️
          </Text>
=======
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
>>>>>>> 05ec542275b1e10bcf483ed8339c70e7aa99c497
        </div>
      </footer>
    </div>
  );
}

export default Home;