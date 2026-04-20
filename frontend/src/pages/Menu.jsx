import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Typography,
  Button,
  Spin,
  Empty,
  Modal,
  message,
  Divider,
  Drawer,
  Input,
  Dropdown,
  Tooltip,
  Popconfirm,
  Row,
  Col
} from "antd";
import {
  ShoppingCartOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  FireOutlined,
  MenuOutlined,
  CloseOutlined,
  UpOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  FilterOutlined,
  DownOutlined
} from "@ant-design/icons";
import API_BASE_URL from "../config";
import "../styles/menu.css";

const { Text, Title } = Typography;

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
  const [imageErrors, setImageErrors] = useState({});
  const [isManualScroll, setIsManualScroll] = useState(false);
  const categoryRefs = useRef({});
  const scrollTimer = useRef(null);

  const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop";

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error loading cart:", e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Handle scroll for active category
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      
      if (!isManualScroll && Object.keys(menuData).length > 0) {
        const categories = Object.keys(menuData);
        for (let i = categories.length - 1; i >= 0; i--) {
          const category = categories[i];
          const element = categoryRefs.current[category];
          if (element) {
            const rect = element.getBoundingClientRect();
            const offset = 100;
            if (rect.top <= offset) {
              if (activeCategory !== category) {
                setActiveCategory(category);
              }
              break;
            }
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuData, isManualScroll, activeCategory]);

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.discount > 0 
      ? item.price - (item.price * item.discount / 100)
      : item.price;
    return sum + price * (item.quantity || 1);
  }, 0);

  const handleImageError = (itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const getImageSrc = (food) => {
    if (imageErrors[food._id]) return PLACEHOLDER_IMAGE;
    if (food.image) {
      if (food.image.startsWith("http")) return food.image;
      return `${API_BASE_URL}/uploads/${food.image}`;
    }
    return PLACEHOLDER_IMAGE;
  };

  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem._id === item._id);
      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: (cartItem.quantity || 1) + 1 }
            : cartItem
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
    message.success(`${item.name} added to cart!`);
  };

  const removeFromCart = (itemId) => {
    Modal.confirm({
      title: "Remove Item",
      content: "Are you sure you want to remove this item from cart?",
      okText: "Yes",
      cancelText: "No",
      okButtonProps: { danger: true },
      onOk: () => {
        setCartItems(prev => prev.filter(item => item._id !== itemId));
        message.success("Item removed from cart");
      }
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      message.warning("Your cart is empty");
      return;
    }
    setCartDrawerVisible(false);
    navigate("/cart");
  };

  // Fetch menu data
  useEffect(() => {
    fetchMenu();
  }, [restaurantId, categoryParam]);

  // Filter menu data
  useEffect(() => {
    let filtered = { ...originalData };
    
    if (foodTypeFilter !== "all") {
      const typeFiltered = {};
      Object.keys(originalData).forEach(category => {
        const matchedItems = originalData[category].filter(item => {
          const foodType = item.foodType?.toLowerCase() || '';
          if (foodTypeFilter === "veg") {
            return foodType === 'veg' || foodType === 'vegetarian' || foodType === 'vegan';
          } else if (foodTypeFilter === "nonveg") {
            return foodType === 'nonveg' || foodType === 'non-veg' || foodType === 'non veg' || 
                   foodType === 'meat' || foodType === 'chicken' || foodType === 'fish';
          }
          return true;
        });
        if (matchedItems.length > 0) typeFiltered[category] = matchedItems;
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
        if (items.length > 0) searchFiltered[category] = items;
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
        categories.forEach(cat => { catMap[cat._id] = cat.name; });
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
        let category = (item.categoryId && catMap[item.categoryId]) 
          ? catMap[item.categoryId] 
          : (item.category?.toLowerCase() || "others");
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(item);
      });

      const categoryOrder = ["burgers", "pizza", "salad", "rajasthani", "arabic-food", "starters", "soups", "others"];
      const sortedGrouped = {};
      categoryOrder.forEach(cat => { if (grouped[cat]) sortedGrouped[cat] = grouped[cat]; });
      Object.keys(grouped).forEach(cat => { if (!categoryOrder.includes(cat)) sortedGrouped[cat] = grouped[cat]; });

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

  const getFoodTypeDisplay = (foodType) => {
    const type = foodType?.toLowerCase() || '';
    if (type === 'veg' || type === 'vegetarian' || type === 'vegan') {
      return { text: 'VEG', color: '#22c55e' };
    }
    return { text: 'NON-VEG', color: '#ef4444' };
  };

  const getDiscountedPrice = (price, discount) => {
    if (discount > 0 && discount < 100) {
      return Math.round(price - (price * discount / 100));
    }
    return price;
  };

  const scrollToCategory = useCallback((category) => {
    const element = categoryRefs.current[category];
    if (element) {
      setIsManualScroll(true);
      setActiveCategory(category);
      
      const fixedOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      
      window.scrollTo({
        top: elementPosition - fixedOffset,
        behavior: "smooth"
      });
      
      setTimeout(() => {
        setIsManualScroll(false);
      }, 800);
    }
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const filterMenuItems = [
    { key: 'all', label: 'All Items' },
    { key: 'veg', label: 'Vegetarian' },
    { key: 'nonveg', label: 'Non-Vegetarian' },
  ];

  const getFilterLabel = () => {
    switch(foodTypeFilter) {
      case 'veg': return 'Veg';
      case 'nonveg': return 'Non-Veg';
      default: return 'All';
    }
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
      {/* Header */}
      <div className="menu-header">
        <div className="header-row">
          <Tooltip title="Go Back" placement="bottom">
            <button onClick={() => navigate("/")} className="back-btn-icon">
              <ArrowLeftOutlined />
            </button>
          </Tooltip>
          
          <div className="search-wrapper">
            <Input
              placeholder="Search menu items..."
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              prefix={<SearchOutlined />}
              size="middle"
            />
          </div>
          
          <Dropdown
            menu={{
              items: filterMenuItems,
              onClick: ({ key }) => setFoodTypeFilter(key),
              selectedKeys: [foodTypeFilter]
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <button className="filter-btn">
              <FilterOutlined /> {getFilterLabel()} <DownOutlined />
            </button>
          </Dropdown>
        </div>
      </div>

      {/* Category Tabs */}
      {Object.keys(menuData).length > 0 && (
        <div className="category-tabs-wrapper">
          <div className="category-tabs">
            {Object.keys(menuData).map(category => (
              <button
                key={category}
                onClick={() => scrollToCategory(category)}
                className={`category-tab ${activeCategory === category ? "active" : ""}`}
              >
                {category === "arabic-food" ? "Arabic Food" : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="menu-items-container">
        {Object.keys(menuData).length === 0 ? (
          <div className="empty-menu-state">
            <MenuOutlined className="empty-icon" />
            <Title level={3}>No menu items found</Title>
            <p>Try adjusting your filters or search term</p>
            <Button type="primary" onClick={() => { setFoodTypeFilter("all"); setSearchTerm(""); }}>
              Reset Filters
            </Button>
          </div>
        ) : (
          Object.keys(menuData).map(category => (
            <section 
              key={category} 
              ref={el => categoryRefs.current[category] = el}
              className="menu-category-section"
            >
              <div className="menu-category-header">
                <h2 className="menu-category-title">
                  {category === "arabic-food" ? "Arabic Food" : category.charAt(0).toUpperCase() + category.slice(1)}
                </h2>
                <div className="category-title-underline"></div>
              </div>
              
              <Row gutter={[16, 16]}>
                {menuData[category]?.map(food => {
                  const discountedPrice = getDiscountedPrice(food.price, food.discount);
                  const foodTypeDisplay = getFoodTypeDisplay(food.foodType);
                  const hasValidDiscount = food.discount > 0 && food.discount < 100;
                  
                  return (
                    <Col xs={24} sm={12} md={8} lg={8} xl={6} key={food._id}>
                      <div className="menu-card">
                        <div className="menu-card-image">
                          <img
                            src={getImageSrc(food)}
                            alt={food.name}
                            onError={() => handleImageError(food._id)}
                          />
                          {hasValidDiscount && (
                            <div className="discount-badge-corner">
                              <span className="percent">{food.discount}%</span>
                              <span className="off-text">OFF</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="menu-card-content">
                          <h3 className="menu-card-title">{food.name}</h3>
                          
                          <p className="menu-card-description">
                            {food.desc || "Delicious dish prepared with fresh ingredients"}
                          </p>
                          
                          <div className="menu-card-meta">
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
                            <span className={`meta-badge food-type ${foodTypeDisplay.text === 'VEG' ? 'veg' : 'nonveg'}`}>
                              {foodTypeDisplay.text}
                            </span>
                          </div>
                          
                          <div className="menu-card-price-row">
                            <div className="menu-card-price">
                              {hasValidDiscount ? (
                                <>
                                  <span className="current-price">${discountedPrice}</span>
                                  <span className="original-price">${food.price}</span>
                                </>
                              ) : (
                                <span className="current-price">${food.price}</span>
                              )}
                            </div>
                            <button 
                              className="card-add-btn"
                              onClick={() => addToCart(food)}
                            >
                              <ShoppingCartOutlined /> Add
                            </button>
                          </div>
                          
                          <div className="menu-card-actions">
                            <button 
                              className="card-action-btn view-btn"
                              onClick={() => viewDetails(food)}
                            >
                              <EyeOutlined /> View
                            </button>
                            <button 
                              className="card-action-btn edit-btn"
                              onClick={() => navigate(`/edit-item/${food._id}`)}
                            >
                              <EditOutlined /> Edit
                            </button>
                            <Popconfirm
                              title="Delete Item"
                              description="Are you sure you want to delete this item?"
                              onConfirm={() => deleteItem(food._id)}
                              okText="Yes"
                              cancelText="No"
                              okButtonProps={{ danger: true }}
                            >
                              <button className="card-action-btn delete-btn">
                                <DeleteOutlined /> Del
                              </button>
                            </Popconfirm>
                          </div>
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </section>
          ))
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fab-container">
        <Tooltip title="Add New Item">
          <button className="fab-btn add-fab" onClick={() => navigate("/add-item")}>
            <PlusOutlined />
          </button>
        </Tooltip>
        
        <Tooltip title="View Cart">
          <div className="cart-fab-wrapper">
            <button className="fab-btn cart-fab" onClick={() => setCartDrawerVisible(true)}>
              <ShoppingCartOutlined />
            </button>
            {cartCount > 0 && (
              <span className="cart-count-badge">{cartCount}</span>
            )}
          </div>
        </Tooltip>
        
        {showScrollTop && (
          <Tooltip title="Scroll to Top">
            <button className="fab-btn scroll-fab" onClick={scrollToTop}>
              <UpOutlined />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Cart Drawer */}
      <Drawer
        title="My Order"
        placement="right"
        onClose={() => setCartDrawerVisible(false)}
        open={cartDrawerVisible}
        className="cart-drawer"
        closeIcon={<CloseOutlined />}
        styles={{ wrapper: { width: 380 } }}
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
                    <img 
                      src={item.image?.startsWith("http") ? item.image : `${API_BASE_URL}/uploads/${item.image}`} 
                      alt={item.name}
                      className="cart-item-image"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">${discountedPrice}</div>
                      <div className="quantity-control">
                        <button onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)}>-</button>
                        <span>{item.quantity || 1}</span>
                        <button onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}>+</button>
                      </div>
                    </div>
                    <button className="cart-item-delete" onClick={() => removeFromCart(item._id)}>
                      <DeleteOutlined />
                    </button>
                  </div>
                );
              })}
            </div>
            <Divider />
            <div className="cart-summary">
              <div className="cart-total-row">
                <span>Total</span>
                <span className="cart-total-amount">${Math.round(cartTotal + 2.99)}</span>
              </div>
              <button className="checkout-btn" onClick={proceedToCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </Drawer>

      {/* Food Detail Modal */}
      <Modal
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        className="food-detail-modal"
        width={500}
        centered
      >
        {selectedFood && (
          <div className="food-detail-content">
            <img 
              src={selectedFood.image?.startsWith("http") ? selectedFood.image : `${API_BASE_URL}/uploads/${selectedFood.image}`} 
              alt={selectedFood.name} 
              className="food-detail-image"
              onError={(e) => {
                e.target.src = PLACEHOLDER_IMAGE;
              }}
            />
            <div className="food-detail-info">
              <h2>{selectedFood.name}</h2>
              <p>{selectedFood.desc || "Delicious dish prepared with fresh ingredients"}</p>
              <div className="food-detail-meta">
                {selectedFood.kcal > 0 && <span><FireOutlined /> {selectedFood.kcal} kcal</span>}
                {selectedFood.time > 0 && <span><ClockCircleOutlined /> {selectedFood.time} min</span>}
              </div>
              <div className="food-detail-price">
                <span className="price">${getDiscountedPrice(selectedFood.price, selectedFood.discount)}</span>
                {selectedFood.discount > 0 && <span className="original">${selectedFood.price}</span>}
              </div>
              <div className="food-detail-actions">
                <button className="detail-add-btn" onClick={() => { addToCart(selectedFood); setModalVisible(false); }}>
                  <ShoppingCartOutlined /> Add to Cart
                </button>
                <button className="detail-edit-btn" onClick={() => navigate(`/edit-item/${selectedFood._id}`)}>
                  <EditOutlined /> Edit Item
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Menu;