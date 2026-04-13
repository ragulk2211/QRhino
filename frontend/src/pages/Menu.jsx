// Menu.jsx - Complete fixed file
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Typography,
  Button,
  Space,
  Spin,
  Empty,
  Tag,
  Modal,
  message,
  Badge,
  Divider,
  Drawer,
  Input
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
  MenuOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  MinusOutlined,
  PlusCircleOutlined,
  UpOutlined,
  SearchOutlined
} from "@ant-design/icons";
import API_BASE_URL from "../config";
import "../styles/menu.css";

const { Text } = Typography;

function Menu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurant");
  const categoryParam = searchParams.get("category");

  const [activeCategory, setActiveCategory] = useState("");
  const [menuData, setMenuData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [foodTypeFilter, setFoodTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [categoryMap, setCategoryMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartDrawerVisible, setCartDrawerVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    loadCartFromStorage();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    setPulseAnimation(true);
    setTimeout(() => setPulseAnimation(false), 600);
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

  // Filter menu data based on foodTypeFilter and searchTerm
  useEffect(() => {
    let filtered = { ...originalData };
    
    if (foodTypeFilter !== "all") {
      const typeFiltered = {};
      Object.keys(originalData).forEach(category => {
        const matchedItems = originalData[category].filter(
          item => item.foodType?.toLowerCase() === foodTypeFilter.toLowerCase()
        );
        if (matchedItems.length > 0) {
          typeFiltered[category] = matchedItems;
        }
      });
      filtered = typeFiltered;
    }
    
    if (searchTerm.trim()) {
      const searchFiltered = {};
      Object.keys(filtered).forEach(category => {
        const items = filtered[category].filter(item =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (items.length > 0) {
          searchFiltered[category] = items;
        }
      });
      filtered = searchFiltered;
    }
    
    setMenuData(filtered);
    
    if (filtered[activeCategory]?.length === 0 && Object.keys(filtered).length > 0) {
      setActiveCategory(Object.keys(filtered)[0]);
    }
  }, [foodTypeFilter, searchTerm, originalData, activeCategory]);

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

      const categoryOrder = ["burgers", "salad", "rajasthani", "arabic-food", "pizza", "starters", "soups", "others"];
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
    return type === "veg" ? <CheckCircleOutlined /> : <FireOutlined />;
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const getDiscountedPrice = (price, discount) => {
    if (discount > 0) {
      return Math.round(price - (price * discount / 100));
    }
    return price;
  };

  if (isLoading) {
    return (
      <div className="menu-page">
        <div className="menu-loading-container">
          <Spin size="large" />
          <Text type="secondary">Loading delicious menu...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <div className="menu-header">
        <div className="header-row">
          <button 
            onClick={() => navigate("/")}
            className="back-btn"
            aria-label="Go back"
          >
            <ArrowLeftOutlined />
          </button>
          <div className="search-wrapper-header">
            <Input
              placeholder="Search for delicious food..."
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-header"
              prefix={<SearchOutlined />}
            />
          </div>
        </div>
        
        <div className="filter-tabs">
          <button 
            onClick={() => setFoodTypeFilter("all")}
            className={`filter-tab ${foodTypeFilter === "all" ? "active" : ""}`}
          >
            All
          </button>
          <button 
            onClick={() => setFoodTypeFilter("veg")}
            className={`filter-tab ${foodTypeFilter === "veg" ? "active" : ""}`}
          >
            <CheckCircleOutlined /> Veg
          </button>
          <button 
            onClick={() => setFoodTypeFilter("nonveg")}
            className={`filter-tab ${foodTypeFilter === "nonveg" ? "active" : ""}`}
          >
            <FireOutlined /> Non-Veg
          </button>
        </div>
      </div>

      {Object.keys(menuData).length > 0 && (
        <div className="category-tabs-wrapper">
          <div className="category-tabs">
            {Object.keys(menuData).map(category => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  const element = document.getElementById(`category-${category}`);
                  if (element) {
                    const offset = 70;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                }}
                className={`category-tab ${activeCategory === category ? "active" : ""}`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="menu-items-container">
        {Object.keys(menuData).length === 0 ? (
          <div className="empty-menu-state">
            <MenuOutlined className="empty-icon" />
            <h3>No menu items found</h3>
            <p>Try adjusting your filters or search term</p>
            <Button type="primary" onClick={() => {
              setFoodTypeFilter("all");
              setSearchTerm("");
            }}>
              Reset Filters
            </Button>
          </div>
        ) : (
          Object.keys(menuData).map(category => (
            <section key={category} id={`category-${category}`} className="menu-category-section">
              <div className="menu-category-header">
                <h2 className="menu-category-title">{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
                <div className="category-title-underline"></div>
              </div>
              <div className="menu-list">
                {menuData[category]?.map(food => {
                  const discountedPrice = getDiscountedPrice(food.price, food.discount);
                  return (
                    <div key={food._id} className="menu-item-card">
                      <div className="menu-item-image">
                        <img
                          src={food.image?.startsWith("http") ? food.image : `${API_BASE_URL}/uploads/${food.image}`}
                          alt={food.name}
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1550547660-d9450f859349?w=120&h=120&fit=crop";
                          }}
                        />
                        {food.discount > 0 && (
                          <span className="discount-badge">-{food.discount}%</span>
                        )}
                        {food.bestseller && (
                          <span className="bestseller-badge">⭐</span>
                        )}
                      </div>
                      <div className="menu-item-info">
                        <div className="menu-item-header">
                          <h3 className="menu-item-name">{food.name}</h3>
                          <div className="menu-item-price">
                            {food.discount > 0 ? (
                              <>
                                <span className="current-price">${discountedPrice}</span>
                                <span className="original-price">${food.price}</span>
                              </>
                            ) : (
                              <span className="current-price">${food.price}</span>
                            )}
                          </div>
                        </div>
                        <p className="menu-item-desc">{food.desc || "Delicious dish prepared with fresh ingredients"}</p>
                        <div className="menu-item-meta">
                          {food.kcal > 0 && (
                            <span className="meta-badge">
                              <FireOutlined /> {food.kcal}kcal
                            </span>
                          )}
                          {food.time > 0 && (
                            <span className="meta-badge">
                              <ClockCircleOutlined /> {food.time}min
                            </span>
                          )}
                          <Tag 
                            icon={getFoodTypeIcon(food.foodType)} 
                            color={getFoodTypeColor(food.foodType)}
                            className="food-type-badge"
                          >
                            {food.foodType === "veg" ? "Veg" : "Non-Veg"}
                          </Tag>
                        </div>
                        <div className="menu-item-actions">
                          <Button 
                            type="primary"
                            icon={<ShoppingCartOutlined />}
                            onClick={() => addToCart(food)}
                            className="add-to-cart-btn"
                          >
                            Add
                          </Button>
                          <Button 
                            icon={<EyeOutlined />}
                            onClick={() => viewDetails(food)}
                            className="view-btn"
                          >
                            View
                          </Button>
                          <Button 
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => deleteItem(food._id)}
                            className="delete-btn"
                            type="text"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      <div className="fab-container">
        <Badge count={cartCount} className="cart-fab-badge">
          <div 
            className={`fab-btn cart-fab ${pulseAnimation ? 'pulse' : ''}`}
            onClick={() => setCartDrawerVisible(true)}
          >
            <ShoppingCartOutlined />
          </div>
        </Badge>

        <div 
          className="fab-btn add-fab"
          onClick={() => navigate("/add-item")}
        >
          <PlusOutlined />
        </div>

        {showScrollTop && (
          <div className="fab-btn scroll-fab" onClick={scrollToTop}>
            <UpOutlined />
          </div>
        )}
      </div>

      <Drawer
        title="My Order"
        placement="right"
        onClose={() => setCartDrawerVisible(false)}
        open={cartDrawerVisible}
        className="cart-drawer"
        closeIcon={<CloseOutlined />}
      >
        {cartItems.length === 0 ? (
          <Empty description="Your cart is empty" />
        ) : (
          <>
            <div className="cart-items-list">
              {cartItems.map((item) => {
                const discountedPrice = getDiscountedPrice(item.price, item.discount);
                return (
                  <div key={item._id} className="cart-item">
                    <div className="cart-item-image">
                      <img 
                        src={item.image?.startsWith("http") ? item.image : `${API_BASE_URL}/uploads/${item.image}`} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1550547660-d9450f859349?w=60&h=60&fit=crop";
                        }}
                      />
                    </div>
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">
                        ${discountedPrice}
                        {item.discount > 0 && (
                          <span className="original-price">${item.price}</span>
                        )}
                      </div>
                      <div className="quantity-control">
                        <Button size="small" icon={<MinusOutlined />} onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)} />
                        <span>{item.quantity || 1}</span>
                        <Button size="small" icon={<PlusCircleOutlined />} onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)} />
                      </div>
                    </div>
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(item._id)} />
                  </div>
                );
              })}
            </div>
            <Divider />
            <div className="cart-summary">
              <div className="cart-total-row">
                <span>Total</span>
                <span className="cart-total-amount">${Math.round(cartTotal)}</span>
              </div>
              <Button type="primary" block className="checkout-btn" onClick={proceedToCheckout}>
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </Drawer>

      <Modal
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        className="food-detail-modal"
      >
        {selectedFood && (
          <div className="food-detail-content">
            <img 
              src={selectedFood.image?.startsWith("http") ? selectedFood.image : `${API_BASE_URL}/uploads/${selectedFood.image}`} 
              alt={selectedFood.name} 
              className="food-detail-image"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop";
              }}
            />
            <h2>{selectedFood.name}</h2>
            <p>{selectedFood.desc || "Delicious dish prepared with fresh ingredients"}</p>
            <div className="food-detail-meta">
              {selectedFood.kcal > 0 && <span><FireOutlined /> {selectedFood.kcal} kcal</span>}
              {selectedFood.time > 0 && <span><ClockCircleOutlined /> {selectedFood.time} min</span>}
            </div>
            <div className="food-detail-price">
              ${getDiscountedPrice(selectedFood.price, selectedFood.discount)}
              {selectedFood.discount > 0 && (
                <span className="original-price">${selectedFood.price}</span>
              )}
            </div>
            <div className="food-detail-actions">
              <Button type="primary" block onClick={() => { addToCart(selectedFood); setModalVisible(false); }}>
                Add to Cart
              </Button>
              <Button onClick={() => navigate(`/edit-item/${selectedFood._id}`)}>
                <EditOutlined /> Edit
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Menu;