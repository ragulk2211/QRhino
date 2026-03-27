import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import { calculateDiscountedPrice } from "../utils/priceUtils";

import "../styles/Cart.css"

function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon, getFinalTotal, appliedCoupon, couponDiscount } = useContext(CartContext);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

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
    if (cart.length > 0) {
      fetchCoupons();
    }
  }, [cart.length]);

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const price = calculateDiscountedPrice(item.price, item.discount);
      return sum + price * (item.quantity || 1);
    }, 0);
  };

  const total = calculateTotal();
  const finalTotal = getFinalTotal();

  // Remove item
  const handleRemove = (itemId) => {
    removeFromCart(itemId);
  };

  // Update quantity
  const handleQuantity = (itemId, qty) => {
    if (qty < 1) return;
    updateQuantity(itemId, qty);
  };

  // Handle coupon application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponMessage("");

    try {
      const result = await applyCoupon(couponCode.trim());
      setCouponMessage(result.message);
    } catch (error) {
      setCouponMessage("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  // Handle coupon removal
  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode("");
    setCouponMessage("");
  };

  // Quick select coupon from available list
  const handleSelectCoupon = async (code) => {
    setCouponCode(code);
    setCouponLoading(true);
    setCouponMessage("");

    try {
      const result = await applyCoupon(code);
      setCouponMessage(result.message);
    } catch (error) {
      setCouponMessage("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  // Payment handler
  const handlePayment = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setLoading(true);

    try {
      const hotelId = localStorage.getItem("hotelId") || "your_hotel_id_here";
      const tableId = localStorage.getItem("tableId") || "your_table_id_here";
      
      const orderData = {
        tableNumber: 1,
        items: cart.map(item => ({
          name: item.name,
          price: calculateDiscountedPrice(item.price, item.discount),
          quantity: item.quantity || 1,
          foodType: item.foodType
        })),
        total: finalTotal,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discountPercent: appliedCoupon ? appliedCoupon.discountPercent : 0,
        discountAmount: couponDiscount
      };

      console.log("API URL:", `${API_BASE_URL}/api/orders/create`);
      console.log("Order Data:", orderData);

      const response = await fetch(`${API_BASE_URL}/api/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        alert(
          `✅ Order placed!\nToken: ${order.tokenNumber}\nTime: ${order.preparingTime || 15} mins`
        );
        clearCart();
        navigate("/");
      } else {
        alert("❌ Failed to place order");
      }

    } catch (error) {
      console.error("Error placing order:", error);
      alert("❌ Error placing order");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: "15px", maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center" }}>Your Cart</h2>
        <p style={{ textAlign: "center" }}>Cart is empty</p>
        <button 
          onClick={() => navigate("/menu")}
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            background: "#2e7d32",
            color: "white",
            border: "none",
            borderRadius: "8px",
            marginTop: "10px"
          }}
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "15px", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center" }}>Your Cart</h2>

      {cart.map((item) => (
        <div key={item._id} style={{
          border: "1px solid #ddd",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "8px"
        }}>
          <h4>{item.name}</h4>
          <p>₹{calculateDiscountedPrice(item.price, item.discount)} × {item.quantity || 1}</p>
          <div>
            <button onClick={() => handleQuantity(item._id, (item.quantity || 1) - 1)}>-</button>
            <span style={{ margin: "0 10px" }}>{item.quantity || 1}</span>
            <button onClick={() => handleQuantity(item._id, (item.quantity || 1) + 1)}>+</button>
          </div>
          <button
            onClick={() => handleRemove(item._id)}
            style={{ marginTop: "5px", background: "red", color: "white" }}
          >
            Remove
          </button>
        </div>
      ))}

      {/* Coupon Section */}
      <div style={{ margin: "15px 0", padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
        {availableCoupons.length > 0 && !appliedCoupon && (
          <div style={{ marginBottom: "15px" }}>
            <h4 style={{ margin: "0 0 10px" }}>🎟️ Available Offers</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {availableCoupons.map((coupon) => (
                <button
                  key={coupon._id}
                  onClick={() => handleSelectCoupon(coupon.code)}
                  disabled={couponLoading || total < coupon.minOrderAmount}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #2e7d32",
                    borderRadius: "20px",
                    background: total >= coupon.minOrderAmount ? "#e8f5e9" : "#f5f5f5",
                    color: total >= coupon.minOrderAmount ? "#2e7d32" : "#999",
                    cursor: total >= coupon.minOrderAmount ? "pointer" : "not-allowed",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                >
                  {coupon.code} - {coupon.discountPercent}% OFF
                </button>
              ))}
            </div>
            <p style={{ fontSize: "11px", color: "#666", marginTop: "5px" }}>
              * Tap an offer to apply it
            </p>
          </div>
        )}

        <h4 style={{ margin: "0 0 10px" }}>Have a coupon?</h4>
        {appliedCoupon ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "green", fontWeight: "bold" }}>
              ✓ {appliedCoupon.code} applied (-₹{couponDiscount})
            </span>
            <button
              onClick={handleRemoveCoupon}
              style={{ background: "red", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px" }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={couponLoading}
              style={{ padding: "8px 15px", background: "#2e7d32", color: "white", border: "none", borderRadius: "4px" }}
            >
              {couponLoading ? "Applying..." : "Apply"}
            </button>
          </div>
        )}
        {couponMessage && (
          <p style={{ margin: "10px 0 0", color: couponMessage.includes("save") ? "green" : "red", fontSize: "14px" }}>
            {couponMessage}
          </p>
        )}
      </div>

      <h3 style={{ textAlign: "center" }}>
        Total: {couponDiscount > 0 && <s>₹{Math.round(total)}</s>} ₹{Math.round(finalTotal)}
        {couponDiscount > 0 && <span style={{ color: "green", marginLeft: "10px" }}>(You save ₹{couponDiscount})</span>}
      </h3>

      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          background: "#2e7d32",
          color: "white",
          border: "none",
          borderRadius: "8px"
        }}
      >
        {loading ? "Processing..." : `Pay ₹${Math.round(finalTotal)}`}
      </button>
    </div>
  );
}

export default Cart;