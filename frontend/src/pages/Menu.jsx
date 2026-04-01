import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Typography,
  Button,
  Card,
  Row,
  Col,
  Space,
  Spin,
  Empty,
  Tag,
  Tooltip,
  Modal,
  message,
  Badge,
  Divider,
  Avatar,
  Rate,
  Result,
  Affix,
  BackTop,
  Drawer
} from "antd";
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  FireOutlined,
  EnvironmentOutlined,
  MenuOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  MinusOutlined,
  PlusCircleOutlined,
  ShopOutlined,
  FilterOutlined
} from "@ant-design/icons";
import Header from "../components/Header";
import API_BASE_URL from "../config";
import "../styles/menu.css";

const { Title, Text, Paragraph } = Typography;

function Menu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurant");
  const categoryParam = searchParams.get("category");

  const [activeCategory, setActiveCategory] = useState("");
  const [menuData, setMenuData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantLocation, setRestaurantLocation] = useState("");
  const [restaurantRating, setRestaurantRating] = useState(4.5);
  const [foodTypeFilter, setFoodTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [categoryMap, setCategoryMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartDrawerVisible, setCartDrawerVisible] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    loadCartFromStorage();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (e) {
        console.error("Error loading cart:", e);
      }
    }
  };

  const handleStorageChange = (e) => {
    if (e.key === "cart") {
      loadCartFromStorage();
    }
  };

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    window.dispatchEvent(new Event('storage'));
  }, [cartItems]);

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.discount > 0 
      ? item.price - (item.price * item.discount / 100)
      : item.price;
    return sum + price * (item.quantity || 1);
  }, 0);

  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem._id === item._id);
      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: (cartItem.quantity || 1) + 1 }
            : cartItem
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
    message.success({
      content: `${item.name} added to cart!`,
      icon: <CheckCircleOutlined />,
      duration: 2
    });
  };

  const removeFromCart = (itemId) => {
    Modal.confirm({
      title: "Remove Item",
      content: "Are you sure you want to remove this item from cart?",
      okText: "Yes",
      cancelText: "No",
      okButtonProps: { danger: true },
      onOk: () => {
        setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
        message.success("Item removed from cart");
      }
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    Modal.confirm({
      title: "Clear Cart",
      content: "Are you sure you want to clear your entire cart?",
      okText: "Yes",
      cancelText: "No",
      okButtonProps: { danger: true },
      onOk: () => {
        setCartItems([]);
        message.success("Cart cleared");
      }
    });
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      message.warning("Your cart is empty");
      return;
    }
    setCartDrawerVisible(false);
    navigate("/cart");
  };

  // FETCH MENU
  useEffect(() => {
    fetchMenu();
  }, [restaurantId, categoryParam]);

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

      let url = `${API_BASE_URL}/api/menu`;
      const params = [];
      if (restaurantId) params.push(`restaurantId=${restaurantId}`);
      if (categoryParam) params.push(`category=${categoryParam}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await fetch(url);
      const data = await res.json();

      if (restaurantId) {
        try {
          const restaurantRes = await fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}`);
          if (restaurantRes.ok) {
            const restaurant = await restaurantRes.json();
            setRestaurantName(restaurant.name);
            setRestaurantLocation(restaurant.location?.address?.city || restaurant.location || "Location not set");
            setRestaurantRating(restaurant.rating || 4.5);
          }
        } catch (e) {
          console.error("Restaurant fetch error:", e);
        }
      }

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

      {/* Unified Top Bar - Restaurant Info, Filters & Cart */}
      <div className="menu-restaurant-header">
        <Row gutter={[16, 16]} align="middle">
          {/* Restaurant Info */}
          <Col xs={24} md={8}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar size={56} icon={<ShopOutlined />} className="menu-restaurant-avatar" />
              <div>
                <Title level={4} className="menu-restaurant-name" style={{ marginBottom: 4 }}>
                  {restaurantName || "Our Restaurant"}
                </Title>
                <Space size="small">
                  <EnvironmentOutlined style={{ fontSize: 12, color: '#c9a87c' }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>{restaurantLocation}</Text>
                </Space>
                <div style={{ marginTop: 4 }}>
                  <Rate disabled defaultValue={restaurantRating} allowHalf style={{ fontSize: 12 }} />
                </div>
              </div>
            </div>
          </Col>

          {/* Filter Buttons */}
          <Col xs={24} md={10}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
              <FilterOutlined style={{ color: '#b87a4a' }} />
              <div className="menu-filter-buttons">
                <Button
                  onClick={() => setFoodTypeFilter("all")}
                  type={foodTypeFilter === "all" ? "primary" : "default"}
                  className={foodTypeFilter === "all" ? "menu-filter-active" : ""}
                  size="middle"
                >
                  All
                </Button>
                <Button
                  onClick={() => setFoodTypeFilter("veg")}
                  type={foodTypeFilter === "veg" ? "primary" : "default"}
                  icon={<span>🌱</span>}
                  className={foodTypeFilter === "veg" ? "menu-filter-active" : ""}
                  size="middle"
                >
                  Vegetarian
                </Button>
                <Button
                  onClick={() => setFoodTypeFilter("nonveg")}
                  type={foodTypeFilter === "nonveg" ? "primary" : "default"}
                  icon={<span>🍖</span>}
                  className={foodTypeFilter === "nonveg" ? "menu-filter-active" : ""}
                  size="middle"
                >
                  Non-Vegetarian
                </Button>
              </div>
            </div>
          </Col>

          {/* Cart & Back Button */}
          <Col xs={24} md={6}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16 }}>
              <Badge count={cartCount} className="menu-cart-badge" offset={[-5, 5]}>
                <Button 
                  icon={<ShoppingCartOutlined />} 
                  onClick={() => setCartDrawerVisible(true)}
                  className="menu-cart-btn"
                  size="middle"
                >
                  Cart {cartCount > 0 && `(${cartCount})`}
                </Button>
              </Badge>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate("/")}
                type="link"
                style={{ color: '#b87a4a', padding: 0 }}
              >
                Back
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* Categories Tabs */}
      {Object.keys(menuData).length > 0 && (
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
              <div className="menu-grid">
                {menuData[category]?.map(food => (
                  <Card
                    key={food._id}
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
                          type="primary"
                          icon={<ShoppingCartOutlined />}
                          onClick={() => addToCart(food)}
                          className="menu-add-to-cart-btn"
                        >
                          Add
                        </Button>
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
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Cart Drawer */}
      <Drawer
        title={
          <div className="cart-drawer-header">
            <ShoppingCartOutlined />
            <span>Your Cart ({cartCount} items)</span>
          </div>
        }
        placement="right"
        onClose={() => setCartDrawerVisible(false)}
        open={cartDrawerVisible}
        width={420}
        className="cart-drawer"
        extra={
          cartItems.length > 0 && (
            <Button type="link" danger onClick={clearCart}>
              Clear All
            </Button>
          )
        }
        closeIcon={<CloseOutlined />}
      >
        {cartItems.length === 0 ? (
          <Empty
            description="Your cart is empty"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="cart-empty"
          >
            <Button 
              type="primary" 
              onClick={() => setCartDrawerVisible(false)}
            >
              Browse Menu
            </Button>
          </Empty>
        ) : (
          <div className="cart-drawer-content">
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item">
                  <div className="cart-item-image">
                    <img
                      src={item.image?.startsWith("http") ? item.image : `${API_BASE_URL}/uploads/${item.image}`}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/60x60?text=No+Image";
                      }}
                    />
                    {item.discount > 0 && (
                      <span className="cart-item-discount">-{item.discount}%</span>
                    )}
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">
                      {item.discount > 0 ? (
                        <>
                          <span className="original-price">₹{item.price}</span>
                          <span className="discounted-price">
                            ₹{Math.round(item.price - (item.price * item.discount / 100))}
                          </span>
                        </>
                      ) : (
                        <span className="current-price">₹{item.price}</span>
                      )}
                    </div>
                    <div className="cart-item-actions">
                      <div className="quantity-control">
                        <Button
                          size="small"
                          icon={<MinusOutlined />}
                          onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)}
                        />
                        <span className="quantity">{item.quantity || 1}</span>
                        <Button
                          size="small"
                          icon={<PlusCircleOutlined />}
                          onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}
                        />
                      </div>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeFromCart(item._id)}
                        size="small"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Divider className="cart-divider" />

            <div className="cart-summary">
              <div className="cart-subtotal">
                <Text type="secondary">Subtotal</Text>
                <Text strong className="subtotal-amount">₹{Math.round(cartTotal)}</Text>
              </div>
              <div className="cart-delivery">
                <Text type="secondary">Delivery Fee</Text>
                <Text>Free</Text>
              </div>
              <Divider className="cart-divider-small" />
              <div className="cart-total">
                <Text strong className="total-label">Total</Text>
                <Text strong className="total-amount">₹{Math.round(cartTotal)}</Text>
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              block
              className="checkout-btn"
              onClick={proceedToCheckout}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </Drawer>

      {/* Add Item Button - Fixed Position */}
      <div className="menu-add-item-btn-wrapper">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/add-item")}
          className="menu-add-item-btn"
        >
          Add New Item
        </Button>
      </div>

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

      <BackTop />
    </div>
  );
}

export default Menu;