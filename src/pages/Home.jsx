import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

  const [featuredItems, setFeaturedItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState({ restaurants: false, featured: false });
  const [error, setError] = useState({ restaurants: null, featured: null });
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

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

    const elements = document.querySelectorAll(".home-animate-on-scroll");
    elements.forEach((el) => observerRef.current.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

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
      message.error("Failed to load restaurants");
      console.error("Error fetching restaurants:", err);
    } finally {
      setLoading(prev => ({ ...prev, restaurants: false }));
    }
  }, []);

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
      setFeaturedItems(data.slice(0, 8));
    } catch (error) {
      console.error("Error fetching featured items:", error);
      setError(prev => ({ ...prev, featured: "Failed to load featured items" }));
      message.error("Failed to load featured items");
    } finally {
      setLoading(prev => ({ ...prev, featured: false }));
    }
  }, []);

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
    []
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
  );

  return (
    <div className="home-container">
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
            </div>
          </div>
        </div>
      </section>

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
            {[
              { icon: "🍽️", title: "Premium Quality", desc: "Hand-picked restaurants with exceptional standards" },
              { icon: "🚚", title: "Fast Delivery", desc: "Quick and reliable delivery to your doorstep" },
              { icon: "💳", title: "Secure Payment", desc: "Multiple secure payment options available" },
              { icon: "🎉", title: "Special Offers", desc: "Exclusive deals and loyalty rewards" }
            ].map((feature, index) => (
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
        </section>
      </main>

      {/* Floating Action Buttons */}
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
        </div>
      </footer>
    </div>
  );
}

export default Home;