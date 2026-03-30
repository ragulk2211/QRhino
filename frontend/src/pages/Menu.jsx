import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Layout,
  Typography,
  Button,
  Card,
  Row,
  Col,
  Space,
  Tabs,
  Spin,
  Empty,
  Tag,
  Tooltip,
  Modal,
  message,
  Input,
  Select,
  Badge,
  Divider,
  Breadcrumb,
  Avatar,
  Rate,
  Pagination,
  Skeleton,
  Alert,
  Result,
  Affix,
  BackTop,
  Menu as AntMenu,
  Dropdown
} from "antd";
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HeartOutlined,
  ShareAltOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  FireOutlined,
  StarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  MenuOutlined,
  FilterOutlined,
  SearchOutlined,
  CloseOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import Header from "../components/Header";
import API_BASE_URL from "../config";
import "../styles/menu.css";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;

function Menu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurant");
  const categoryParam = searchParams.get("category");

  const [activeCategory, setActiveCategory] = useState("");
  const [menuData, setMenuData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [restaurantName, setRestaurantName] = useState("");
  const [foodTypeFilter, setFoodTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [categoryMap, setCategoryMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // FETCH MENU
  useEffect(() => {
    fetchMenu();
  }, [restaurantId, categoryParam]);

  // Filter when foodTypeFilter changes
  useEffect(() => {
    if (foodTypeFilter === "all") {
      setMenuData(originalData);
    } else {
      const filtered = {};
      Object.keys(originalData).forEach(category => {
        const matchedItems = originalData[category].filter(
          item => item.foodType?.toLowerCase() === foodTypeFilter.toLowerCase()
        );
        if (matchedItems.length > 0) {
          filtered[category] = matchedItems;
        }
      });
      setMenuData(filtered);
    }
  }, [foodTypeFilter, originalData]);

  // Search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setMenuData(originalData);
      return;
    }
    const filtered = {};
    Object.keys(originalData).forEach(category => {
      const items = originalData[category].filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (items.length > 0) {
        filtered[category] = items;
      }
    });
    setMenuData(filtered);
  }, [searchTerm, originalData]);

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      // Fetch categories
      let catMap = {};
      try {
        const catRes = await fetch(`${API_BASE_URL}/api/categories`);
        const categories = await catRes.json();
        categories.forEach(cat => {
          catMap[cat._id] = cat.name;
        });
        setCategoryMap(catMap);
      } catch (e) {
        console.error("Category fetch error:", e);
      }

      // Build URL with filters
      let url = `${API_BASE_URL}/api/menu`;
      const params = [];
      if (restaurantId) params.push(`restaurantId=${restaurantId}`);
      if (categoryParam) params.push(`category=${categoryParam}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await fetch(url);
      const data = await res.json();

      // Fetch restaurant name
      if (restaurantId) {
        try {
          const restaurantRes = await fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}`);
          if (restaurantRes.ok) {
            const restaurant = await restaurantRes.json();
            setRestaurantName(restaurant.name);
          }
        } catch (e) {
          console.error("Restaurant fetch error:", e);
        }
      }

      // Group data
      const grouped = {};
      data.forEach(item => {
        let category;
        if (item.categoryId && catMap[item.categoryId]) {
          category = catMap[item.categoryId];
        } else {
          category = item.category?.toLowerCase() || "others";
        }
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(item);
      });

      // Sort categories
      const categoryOrder = ["burgers", "pizza", "starters", "salad", "soups", "arabic food", "others"];
      const sortedGrouped = {};
      categoryOrder.forEach(cat => {
        if (grouped[cat]) sortedGrouped[cat] = grouped[cat];
      });
      Object.keys(grouped).forEach(cat => {
        if (!categoryOrder.includes(cat)) sortedGrouped[cat] = grouped[cat];
      });

      setMenuData(sortedGrouped);
      setOriginalData(sortedGrouped);

      const firstCategory = Object.keys(sortedGrouped)[0];
      if (firstCategory) setActiveCategory(firstCategory);
    } catch (error) {
      console.error("Menu load error:", error);
      message.error("Failed to load menu");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id) => {
    Modal.confirm({
      title: "Delete Item",
      content: "Are you sure you want to delete this item?",
      okText: "Yes",
      cancelText: "No",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await fetch(`${API_BASE_URL}/api/menu/${id}`, { method: "DELETE" });
          message.success("Item deleted successfully");
          fetchMenu();
        } catch (error) {
          message.error("Failed to delete item");
        }
      }
    });
  };

  const addToCart = (item) => {
    setCartCount(prev => prev + 1);
    message.success(`${item.name} added to cart`);
  };

  const viewDetails = (food) => {
    setSelectedFood(food);
    setModalVisible(true);
  };

  const getFoodTypeColor = (type) => {
    return type === "veg" ? "success" : "error";
  };

  const getFoodTypeIcon = (type) => {
    return type === "veg" ? "🌱" : "🍖";
  };

  if (isLoading) {
    return (
      <div className="menu-page">
        <Header onSearch={setSearchTerm} />
        <div className="menu-loading-container">
          <Spin size="large" />
          <Text type="secondary">Loading delicious menu...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <Header onSearch={setSearchTerm} />

      {/* Restaurant Header */}
      {restaurantName && (
        <div className="menu-restaurant-header">
          <div className="menu-restaurant-info">
            <Avatar size={64} icon={<EnvironmentOutlined />} className="menu-restaurant-avatar" />
            <div>
              <Title level={3} className="menu-restaurant-name">{restaurantName}</Title>
              <Text type="secondary">View our special menu curated just for you</Text>
            </div>
          </div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate("/")}
            className="menu-back-btn"
          >
            Back to Restaurants
          </Button>
        </div>
      )}

      {/* Filter Section */}
      <div className="menu-filter-section">
        <Space size="middle" wrap>
          <div className="menu-filter-buttons">
            <Button
              onClick={() => setFoodTypeFilter("all")}
              type={foodTypeFilter === "all" ? "primary" : "default"}
              className={foodTypeFilter === "all" ? "menu-filter-active" : ""}
            >
              All
            </Button>
            <Button
              onClick={() => setFoodTypeFilter("veg")}
              type={foodTypeFilter === "veg" ? "primary" : "default"}
              icon={<span>🌱</span>}
              className={foodTypeFilter === "veg" ? "menu-filter-active" : ""}
            >
              Vegetarian
            </Button>
            <Button
              onClick={() => setFoodTypeFilter("nonveg")}
              type={foodTypeFilter === "nonveg" ? "primary" : "default"}
              icon={<span>🍖</span>}
              className={foodTypeFilter === "nonveg" ? "menu-filter-active" : ""}
            >
              Non-Vegetarian
            </Button>
          </div>
          <Badge count={cartCount} className="menu-cart-badge">
            <Button 
              icon={<ShoppingCartOutlined />} 
              onClick={() => navigate("/cart")}
              className="menu-cart-btn"
            >
              Cart
            </Button>
          </Badge>
        </Space>
      </div>

      {/* Categories Tabs */}
      {Object.keys(menuData).length > 0 && (
        <Affix offsetTop={70}>
          <div className="menu-category-tabs-wrapper">
            <div className="menu-category-tabs">
              {Object.keys(menuData).map(category => (
                <Button
                  key={category}
                  onClick={() => {
                    setActiveCategory(category);
                    document.getElementById(`menu-${category}`)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start"
                    });
                  }}
                  className={`menu-category-tab ${activeCategory === category ? "active" : ""}`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </Affix>
      )}

      {/* Menu Items */}
      <div className="menu-items-container">
        {Object.keys(menuData).length === 0 ? (
          <Result
            icon={<MenuOutlined />}
            title="No menu items found"
            subTitle="Try adjusting your filters or search term"
            extra={
              <Button type="primary" onClick={() => {
                setFoodTypeFilter("all");
                setSearchTerm("");
              }}>
                Reset Filters
              </Button>
            }
          />
        ) : (
          Object.keys(menuData).map(category => (
            <section key={category} id={`menu-${category}`} className="menu-category-section">
              <div className="menu-category-header">
                <Title level={3} className="menu-category-title">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Title>
                <div className="menu-category-line"></div>
              </div>
              <Row gutter={[24, 24]} className="menu-grid">
                {menuData[category]?.map(food => (
                  <Col xs={24} sm={12} lg={8} key={food._id}>
                    <Card
                      hoverable
                      className="menu-food-card"
                      cover={
                        <div className="menu-food-image">
                          <img
                            alt={food.name}
                            src={food.image?.startsWith("http") ? food.image : `${API_BASE_URL}/uploads/${food.image}`}
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                            }}
                          />
                          {food.bestseller && (
                            <Tag color="orange" className="menu-bestseller-tag">
                              <FireOutlined /> Best Seller
                            </Tag>
                          )}
                          {food.discount > 0 && (
                            <Tag color="red" className="menu-discount-tag">
                              -{food.discount}%
                            </Tag>
                          )}
                        </div>
                      }
                      actions={[
                        <Tooltip title="View Details">
                          <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => viewDetails(food)}
                          />
                        </Tooltip>,
                        <Tooltip title="Add to Cart">
                          <Button
                            type="text"
                            icon={<ShoppingCartOutlined />}
                            onClick={() => addToCart(food)}
                          />
                        </Tooltip>,
                        <Tooltip title="Delete Item">
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => deleteItem(food._id)}
                          />
                        </Tooltip>
                      ]}
                    >
                      <div className="menu-food-header">
                        <Tag 
                          icon={getFoodTypeIcon(food.foodType)} 
                          color={getFoodTypeColor(food.foodType)}
                          className="menu-food-type-tag"
                        >
                          {food.foodType === "veg" ? "Vegetarian" : "Non-Vegetarian"}
                        </Tag>
                        <Rate disabled defaultValue={food.rating || 4.5} allowHalf style={{ fontSize: 12 }} />
                      </div>
                      <Title level={4} className="menu-food-name">{food.name}</Title>
                      <Paragraph ellipsis={{ rows: 2 }} className="menu-food-description">
                        {food.desc || "Delicious dish prepared with fresh ingredients"}
                      </Paragraph>
                      <div className="menu-food-footer">
                        <div className="menu-food-price">
                          <Text strong className="menu-current-price">₹{food.price}</Text>
                          {food.discount > 0 && (
                            <Text delete className="menu-original-price">₹{food.originalPrice || food.price}</Text>
                          )}
                        </div>
                        <div className="menu-food-meta">
                          {food.kcal > 0 && (
                            <Tooltip title="Calories">
                              <Tag icon={<FireOutlined />} className="menu-meta-tag">
                                {food.kcal} kcal
                              </Tag>
                            </Tooltip>
                          )}
                          {food.time > 0 && (
                            <Tooltip title="Prep Time">
                              <Tag icon={<ClockCircleOutlined />} className="menu-meta-tag">
                                {food.time} min
                              </Tag>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </section>
          ))
        )}
      </div>

      {/* Add Item Button */}
      <Affix offsetBottom={30}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/add-item")}
          className="menu-add-item-btn"
        >
          Add New Item
        </Button>
      </Affix>

      {/* Food Details Modal */}
      <Modal
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        width={800}
        className="menu-food-modal"
        closeIcon={<CloseOutlined />}
      >
        {selectedFood && (
          <div className="menu-modal-content">
            <div className="menu-modal-image">
              <img
                src={selectedFood.image?.startsWith("http") ? selectedFood.image : `${API_BASE_URL}/uploads/${selectedFood.image}`}
                alt={selectedFood.name}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                }}
              />
              {selectedFood.discount > 0 && (
                <Tag color="red" className="menu-modal-discount">-{selectedFood.discount}% OFF</Tag>
              )}
            </div>
            <div className="menu-modal-info">
              <Tag 
                icon={getFoodTypeIcon(selectedFood.foodType)} 
                color={getFoodTypeColor(selectedFood.foodType)}
                className="menu-modal-type"
              >
                {selectedFood.foodType === "veg" ? "Vegetarian" : "Non-Vegetarian"}
              </Tag>
              <Title level={2} className="menu-modal-name">{selectedFood.name}</Title>
              <div className="menu-modal-rating">
                <Rate disabled defaultValue={selectedFood.rating || 4.5} allowHalf />
                <Text type="secondary">(120+ reviews)</Text>
              </div>
              <Paragraph className="menu-modal-description">
                {selectedFood.desc || "Delicious dish prepared with fresh ingredients by our expert chefs."}
              </Paragraph>
              <div className="menu-modal-meta">
                <Space size="large">
                  {selectedFood.kcal > 0 && (
                    <div className="menu-modal-meta-item">
                      <FireOutlined />
                      <Text>{selectedFood.kcal} kcal</Text>
                    </div>
                  )}
                  {selectedFood.time > 0 && (
                    <div className="menu-modal-meta-item">
                      <ClockCircleOutlined />
                      <Text>{selectedFood.time} min</Text>
                    </div>
                  )}
                </Space>
              </div>
              <Divider />
              <div className="menu-modal-price">
                <div>
                  <Text type="secondary">Price</Text>
                  <Title level={2} className="menu-modal-current-price">₹{selectedFood.price}</Title>
                  {selectedFood.discount > 0 && (
                    <Text delete className="menu-modal-original-price">₹{selectedFood.originalPrice || selectedFood.price}</Text>
                  )}
                </div>
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<ShoppingCartOutlined />}
                  onClick={() => {
                    addToCart(selectedFood);
                    setModalVisible(false);
                  }}
                  className="menu-modal-add-btn"
                >
                  Add to Cart
                </Button>
              </div>
              <div className="menu-modal-actions">
                <Button 
                  icon={<EditOutlined />} 
                  onClick={() => navigate(`/edit-item/${selectedFood._id}`)}
                >
                  Edit Item
                </Button>
                <Button 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    deleteItem(selectedFood._id);
                    setModalVisible(false);
                  }}
                >
                  Delete Item
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Footer */}
      <footer className="menu-footer">
        <div className="menu-footer-content">
          <div className="menu-footer-logo">
            <span className="menu-logo-icon">🍽️</span>
            <span className="menu-logo-text">QRhino</span>
          </div>
          <Paragraph className="menu-footer-tagline">
            ✨ Scan • Order • Enjoy ✨
          </Paragraph>
          <Row gutter={[24, 24]} className="menu-footer-grid">
            <Col xs={24} sm={12} md={6}>
              <div className="menu-footer-section">
                <Title level={4}>📞 Contact Us</Title>
                <Paragraph>Phone: +91 98765 43210</Paragraph>
                <Paragraph>WhatsApp: +91 98765 43211</Paragraph>
                <Paragraph>Email: support@qrhino.com</Paragraph>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="menu-footer-section">
                <Title level={4}>🕐 Operating Hours</Title>
                <Paragraph>Monday - Friday: 9AM - 11PM</Paragraph>
                <Paragraph>Saturday - Sunday: 10AM - 12AM</Paragraph>
                <Paragraph>Holidays: 10AM - 10PM</Paragraph>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="menu-footer-section">
                <Title level={4}>📍 Our Locations</Title>
                <Paragraph>Main Branch: Downtown</Paragraph>
                <Paragraph>Branch 2: Westside Mall</Paragraph>
                <Paragraph>Branch 3: Airport Road</Paragraph>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="menu-footer-section">
                <Title level={4}>🍕 Popular Categories</Title>
                <Paragraph>Burgers • Pizzas • Biryani</Paragraph>
                <Paragraph>Desserts • Beverages</Paragraph>
                <Paragraph>Starters • Main Course</Paragraph>
              </div>
            </Col>
          </Row>
          <div className="menu-footer-social">
            <Tooltip title="Facebook">
              <span className="menu-social-icon">📘</span>
            </Tooltip>
            <Tooltip title="Instagram">
              <span className="menu-social-icon">📸</span>
            </Tooltip>
            <Tooltip title="Twitter">
              <span className="menu-social-icon">🐦</span>
            </Tooltip>
            <Tooltip title="LinkedIn">
              <span className="menu-social-icon">💼</span>
            </Tooltip>
          </div>
          <div className="menu-footer-links">
            <Button type="link" onClick={() => navigate("/menu/main")}>Menu</Button>
            <Button type="link" onClick={() => navigate("/cart")}>Cart</Button>
            <Button type="link" onClick={() => navigate("/kitchen")}>Kitchen</Button>
            <Button type="link" onClick={() => navigate("/admin")}>Admin</Button>
          </div>
          <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />
          <Text type="secondary" className="menu-footer-copyright">
            © 2024 QRhino. All rights reserved. Made with ❤️
          </Text>
        </div>
      </footer>

      <BackTop />
    </div>
  );
}

export default Menu;