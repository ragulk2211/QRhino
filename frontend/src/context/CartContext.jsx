import { createContext, useState, useEffect } from "react";
import { calculateCartTotal } from "../utils/priceUtils";
import API_BASE_URL from "../config";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {

  const [cart, setCart] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // ✅ Load cart from localStorage on first load
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    }

    // Load applied coupon from localStorage
    const savedCoupon = localStorage.getItem("appliedCoupon");
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (error) {
        console.error("Error loading coupon:", error);
      }
    }
  }, []);

  // ✅ Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ✅ Save coupon to localStorage whenever it changes
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem("appliedCoupon", JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem("appliedCoupon");
    }
  }, [appliedCoupon]);

  // ✅ Recalculate discount when cart total changes
  useEffect(() => {
    if (appliedCoupon && cart.length > 0) {
      const total = getCartTotal();
      const discountAmount = Math.round((total * appliedCoupon.discountPercent) / 100);
      setCouponDiscount(discountAmount);
    }
  }, [cart, appliedCoupon]);

  // ✅ Add item to cart
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(i => i._id === item._id);

      if (existingItem) {
        return prevCart.map(i =>
          i._id === item._id
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        );
      }

      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  // ✅ Remove item completely
  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter(item => item._id !== itemId));
  };

  // ✅ Update quantity
  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map(item =>
        item._id === itemId ? { ...item, quantity } : item
      )
    );
  };

  // ✅ Clear entire cart (IMPORTANT)
  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  // ✅ Get total price
  const getCartTotal = () => {
    return calculateCartTotal(cart);
  };

  // ✅ Get total item count
  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  // ✅ Apply coupon code
  const applyCoupon = async (code) => {
    const total = getCartTotal();
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, orderAmount: total }),
      });

      const data = await response.json();

      if (data.success) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountPercent: data.coupon.discountPercent,
          discountAmount: data.discountAmount,
        });
        setCouponDiscount(data.discountAmount);
        return { success: true, message: `Coupon applied! You save ₹${data.discountAmount}` };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      return { success: false, message: "Failed to apply coupon" };
    }
  };

  // ✅ Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  // ✅ Get final total after discount
  const getFinalTotal = () => {
    return Math.max(0, getCartTotal() - couponDiscount);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        appliedCoupon,
        couponDiscount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        applyCoupon,
        removeCoupon,
        getFinalTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};