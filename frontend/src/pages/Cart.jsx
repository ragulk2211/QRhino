import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  message,
  Modal,
  Spin,
  Alert
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShoppingCartOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import API_BASE_URL from "../config";
import { calculateDiscountedPrice } from "../utils/priceUtils";
import "../styles/cart.css";

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("card");

  // Get image URL
  const getImageUrl = (image) => {
    if (!image) return "https://via.placeholder.com/80x80?text=No+Image";
    if (image.startsWith("http")) return image;
    if (image.startsWith("/uploads/")) return `${API_BASE_URL}${image}`;
    return `${API_BASE_URL}/uploads/${image}`;
  };

  // Load cart from localStorage
  const loadCart = useCallback(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);

    const total = cart.reduce((sum, item) => {
      const discountedPrice = calculateDiscountedPrice(item.price, item.discount);
      return sum + discountedPrice * (item.quantity || 1);
    }, 0);

    setCartTotal(total);
  }, []);

  // Fetch available coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/coupons`);
        const data = await response.json();
        if (data.success) {
          setAvailableCoupons(data.coupons.filter(c => c.isActive));
        }
      } catch (error) {
        console.error("Error fetching coupons:", error);
      }
    };
    fetchCoupons();
  }, []);

  useEffect(() => {
    loadCart();
    const handleStorageChange = (e) => {
      if (e.key === "cart") {
        loadCart();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadCart]);

  // Update cart
  const updateCart = (updatedCart) => {
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    window.dispatchEvent(new Event('storage'));

    const total = updatedCart.reduce((sum, item) => {
      const discountedPrice = calculateDiscountedPrice(item.price, item.discount);
      return sum + discountedPrice * (item.quantity || 1);
    }, 0);

    setCartTotal(total);
  };

  // Update quantity
  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    const updatedCart = cartItems.map((item) =>
      item._id === id ? { ...item, quantity } : item
    );
    updateCart(updatedCart);
    message.success({
      content: "Quantity updated",
      icon: <CheckCircleOutlined />,
      duration: 1
    });
  };

  // Remove item
  const removeItem = (id) => {
    Modal.confirm({
      title: "Remove Item",
      content: "Are you sure you want to remove this item from your cart?",
      okText: "Yes, Remove",
      cancelText: "Cancel",
      okButtonProps: { danger: true },
      onOk: () => {
        const updatedCart = cartItems.filter((item) => item._id !== id);
        updateCart(updatedCart);
        message.success({
          content: "Item removed from cart",
          icon: <CheckCircleOutlined />,
          duration: 2
        });
      }
    });
  };

  // Clear cart
  const clearCart = () => {
    Modal.confirm({
      title: "Clear Cart",
      content: "Are you sure you want to remove all items from your cart?",
      okText: "Yes, Clear All",
      cancelText: "Cancel",
      okButtonProps: { danger: true },
      onOk: () => {
        updateCart([]);
        setAppliedCoupon(null);
        setCouponDiscount(0);
        message.success({
          content: "Cart cleared successfully",
          icon: <CheckCircleOutlined />,
          duration: 2
        });
      }
    });
  };

  // Apply coupon
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      message.warning({
        content: "Please enter a coupon code",
        icon: <CloseCircleOutlined />,
        duration: 2
      });
      return;
    }

    setCouponLoading(true);
    setCouponMessage("");

    try {
      setTimeout(() => {
        const foundCoupon = availableCoupons.find(c => c.code === couponCode.toUpperCase());
        if (foundCoupon && cartTotal >= foundCoupon.minOrderAmount) {
          const discountAmount = Math.round(cartTotal * foundCoupon.discountPercent / 100);
          setAppliedCoupon({ code: couponCode.toUpperCase(), discountPercent: foundCoupon.discountPercent });
          setCouponDiscount(discountAmount);
          setCouponMessage(`Coupon applied! You saved ₹${discountAmount}`);
          message.success({
            content: `Coupon applied! You saved ₹${discountAmount}`,
            icon: <CheckCircleOutlined />,
            duration: 3
          });
        } else if (foundCoupon && cartTotal < foundCoupon.minOrderAmount) {
          setCouponMessage(`Minimum order amount ₹${foundCoupon.minOrderAmount} required`);
          message.warning({
            content: `Minimum order amount ₹${foundCoupon.minOrderAmount} required`,
            duration: 3
          });
        } else {
          setCouponMessage("Invalid coupon code");
          message.error({
            content: "Invalid coupon code",
            icon: <CloseCircleOutlined />,
            duration: 2
          });
        }
        setCouponLoading(false);
      }, 500);
    } catch (error) {
      setCouponMessage("Failed to apply coupon");
      message.error({
        content: "Failed to apply coupon",
        duration: 2
      });
      setCouponLoading(false);
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    setCouponMessage("");
    message.info({
      content: "Coupon removed",
      duration: 2
    });
  };

  // Quick select coupon
  const handleSelectCoupon = (code) => {
    setCouponCode(code);
    setTimeout(() => applyCoupon(), 100);
  };

  // Calculate final total
  const finalTotal = cartTotal - couponDiscount;

  // Place order
  const placeOrder = async () => {
    if (cartItems.length === 0) {
      message.warning({
        content: "Your cart is empty! Add some items first.",
        duration: 3
      });
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        tableNumber: 1,
        items: cartItems.map(item => ({
          name: item.name,
          price: calculateDiscountedPrice(item.price, item.discount),
          quantity: item.quantity || 1,
          foodType: item.foodType,
          itemId: item._id
        })),
        total: finalTotal,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discountPercent: appliedCoupon ? appliedCoupon.discountPercent : 0,
        discountAmount: couponDiscount,
        paymentMethod: paymentMethod
      };

      const response = await fetch(`${API_BASE_URL}/api/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        
        // Show success modal instead of alert
        Modal.success({
          title: "🎉 Order Placed Successfully!",
          content: (
            <div className="order-success-content">
              <div className="success-details">
                <div className="detail-item">
                  <span className="detail-label">Token Number:</span>
                  <span className="detail-value token">#{order.tokenNumber}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Amount:</span>
                  <span className="detail-value amount">₹{order.total}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Preparation Time:</span>
                  <span className="detail-value time">{order.preparingTime || 15} minutes</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Payment Method:</span>
                  <span className="detail-value">
                    {paymentMethod === "card" ? "💳 Credit/Debit Card" : 
                     paymentMethod === "upi" ? "📱 UPI / Google Pay" : 
                     "💵 Cash on Delivery"}
                  </span>
                </div>
              </div>
              <div className="order-note">
                <p>✨ Your order is being prepared!</p>
                <p>📱 You can track your order status in real-time</p>
              </div>
            </div>
          ),
          okText: "Continue Shopping",
          onOk: () => {
            updateCart([]);
            setAppliedCoupon(null);
            setCouponDiscount(0);
            navigate("/");
          }
        });
      } else {
        const error = await response.json();
        message.error({
          content: error.message || "Failed to place order. Please try again.",
          duration: 4,
          icon: <CloseCircleOutlined />
        });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      message.error({
        content: "Network error. Please check your connection and try again.",
        duration: 4
      });
    } finally {
      setLoading(false);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-header">
          <button className="back-link" onClick={() => navigate(-1)}>
            <ArrowLeftOutlined /> Continue Shopping
          </button>
        </div>
        <div className="empty-cart">
          <div className="empty-icon">
            <ShoppingCartOutlined style={{ fontSize: 64, color: '#ff9f4a' }} />
          </div>
          <h3>Your cart is empty</h3>
          <p>Add some delicious items to get started!</p>
          <button className="browse-btn" onClick={() => navigate("/menu/main")}>
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <button className="back-link" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined /> Continue Shopping
        </button>
        <h2>
          <ShoppingCartOutlined /> Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </h2>
        <button className="clear-link" onClick={clearCart}>
          Clear All
        </button>
      </div>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <img src={getImageUrl(item.image)} alt={item.name} />
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-price">
                  {item.discount > 0 ? (
                    <>
                      <span className="old-price">₹{item.price}</span>
                      <span className="new-price">₹{calculateDiscountedPrice(item.price, item.discount)}</span>
                    </>
                  ) : (
                    <span>₹{item.price}</span>
                  )}
                </div>
                <div className="item-controls">
                  <div className="qty-control">
                    <button onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)}>-</button>
                    <span>{item.quantity || 1}</span>
                    <button onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}>+</button>
                  </div>
                  <button className="remove-btn" onClick={() => removeItem(item._id)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <div className="summary-box">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{Math.round(cartTotal)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="summary-row savings">
                <span>Discount</span>
                <span>- ₹{Math.round(couponDiscount)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>Free</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <strong>Total</strong>
              <strong className="total-price">₹{Math.round(finalTotal)}</strong>
            </div>

            {/* Coupon Section */}
            <div className="coupon-section">
              <div className="coupon-title">🎟️ Apply Coupon</div>
              {availableCoupons.length > 0 && !appliedCoupon && (
                <div className="coupon-list">
                  {availableCoupons.slice(0, 2).map((c) => (
                    <button 
                      key={c._id} 
                      className="coupon-tag" 
                      onClick={() => handleSelectCoupon(c.code)} 
                      disabled={cartTotal < c.minOrderAmount}
                      title={cartTotal < c.minOrderAmount ? `Min order ₹${c.minOrderAmount}` : ""}
                    >
                      {c.code} - {c.discountPercent}% OFF
                      {cartTotal < c.minOrderAmount && (
                        <span className="min-order-hint"> (Min ₹{c.minOrderAmount})</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {appliedCoupon ? (
                <div className="applied-coupon">
                  <span>✓ {appliedCoupon.code} applied</span>
                  <span className="saved-amount">- ₹{couponDiscount}</span>
                  <button onClick={removeCoupon}>Remove</button>
                </div>
              ) : (
                <div className="coupon-input">
                  <input 
                    type="text" 
                    placeholder="Enter coupon code" 
                    value={couponCode} 
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                  />
                  <button onClick={applyCoupon} disabled={couponLoading}>
                    {couponLoading ? <Spin size="small" /> : "Apply"}
                  </button>
                </div>
              )}
              {couponMessage && (
                <div className={`coupon-message ${couponMessage.includes("saved") ? "success" : "error"}`}>
                  {couponMessage}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="payment-section">
              <div className="payment-title">💳 Payment Method</div>
              <div className="payment-options">
                <label className={paymentMethod === "card" ? "active" : ""}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="card" 
                    checked={paymentMethod === "card"} 
                    onChange={(e) => setPaymentMethod(e.target.value)} 
                  />
                  <span>💳 Credit/Debit Card</span>
                </label>
                <label className={paymentMethod === "upi" ? "active" : ""}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="upi" 
                    checked={paymentMethod === "upi"} 
                    onChange={(e) => setPaymentMethod(e.target.value)} 
                  />
                  <span>📱 UPI / Google Pay</span>
                </label>
                <label className={paymentMethod === "cash" ? "active" : ""}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cash" 
                    checked={paymentMethod === "cash"} 
                    onChange={(e) => setPaymentMethod(e.target.value)} 
                  />
                  <span>💵 Cash on Delivery</span>
                </label>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="delivery-info">
              <div className="info-row">
                <span>⏱️</span>
                <span>Estimated delivery: 30-45 minutes</span>
              </div>
              <div className="info-row">
                <span>🚚</span>
                <span>Free delivery on orders above ₹500</span>
              </div>
              <div className="info-row">
                <span>🔄</span>
                <span>Easy returns & cancellations</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button 
              className="checkout-btn" 
              onClick={placeOrder} 
              disabled={loading}
            >
              {loading ? (
                <span>
                  <Spin size="small" style={{ marginRight: 8 }} />
                  Processing...
                </span>
              ) : (
                `Proceed to Checkout • ₹${Math.round(finalTotal)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;