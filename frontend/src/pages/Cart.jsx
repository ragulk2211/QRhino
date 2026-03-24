import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../styles/Cart.css"

function Cart() {
  const { cart, setCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Calculate total with discount
  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const price = item.discount && item.discount > 0 
        ? item.price - (item.price * item.discount / 100) 
        : item.price;
      return sum + (price * (item.quantity || 1));
    }, 0);
  };

  const total = calculateTotal();

  const removeItem = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = [...cart];
    updatedCart[index] = { ...updatedCart[index], quantity: newQuantity };
    setCart(updatedCart);
  };

  const handlePayment = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setLoading(true);

    try {
      // Get hotelId and tableId from localStorage or context
      const hotelId = localStorage.getItem("hotelId") || "your_hotel_id_here";
      const tableId = localStorage.getItem("tableId") || "your_table_id_here";
      
      // Format items according to Cart schema
      const orderData = {
        hotelId: hotelId,
        tableId: tableId,
        items: cart.map(item => ({
          foodItemId: item.foodItemId || item._id,
          quantity: item.quantity || 1,
          price: item.discount && item.discount > 0 
            ? item.price - (item.price * item.discount / 100) 
            : item.price
        })),
        total: total
      };

      const response = await fetch("http://localhost:5000/api/cart/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const cartData = await response.json();
        alert(`Order placed successfully!`);
        setCart([]);
        navigate("/order-confirmation");
      } else {
        const errorData = await response.json();
        alert(`Failed to place order: ${errorData.message || "Please try again."}`);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-container">
      {/* Header */}
      <div className="cart-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2 className="cart-title">Your Cart</h2>
        <div className="header-placeholder"></div>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3 className="empty-title">Your cart is empty</h3>
          <p className="empty-text">Add some delicious items from the menu</p>
          <button className="browse-button" onClick={() => navigate("/menu")}>
            Browse Menu
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="cart-items-container">
            {cart.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="item-content">
                  {/* Image */}
                  <div className="image-wrapper">
                    <img 
                      src={
                        item.image 
                          ? (item.image.startsWith('http') 
                            ? item.image 
                            : `http://localhost:5000/uploads/${item.image}`)
                          : "https://via.placeholder.com/80x80?text=Food"
                      }
                      alt={item.name}
                      className="item-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/80x80?text=Food";
                      }}
                    />
                  </div>

                  {/* Item Details */}
                  <div className="item-details">
                    <div className="item-name-section">
                      <h4 className="item-name">{item.name}</h4>
                      {item.foodType && (
                        <span className={`food-type-badge ${item.foodType === 'veg' ? 'veg' : 'nonveg'}`}>
                          {item.foodType === 'veg' ? 'VEG' : 'NON-VEG'}
                        </span>
                      )}
                    </div>
                    
                    <div className="price-section">
                      {item.discount && item.discount > 0 ? (
                        <>
                          <span className="original-price">₹{item.price}</span>
                          <span className="discounted-price">
                            ₹{Math.round(item.price - (item.price * item.discount / 100))}
                          </span>
                          <span className="discount-badge">{item.discount}% OFF</span>
                        </>
                      ) : (
                        <span className="regular-price">₹{item.price}</span>
                      )}
                    </div>

                    <div className="item-actions">
                      <div className="quantity-control">
                        <button 
                          className="quantity-btn"
                          onClick={() => updateQuantity(index, (item.quantity || 1) - 1)}
                        >
                          -
                        </button>
                        <span className="quantity-value">
                          {item.quantity || 1}
                        </span>
                        <button 
                          className="quantity-btn"
                          onClick={() => updateQuantity(index, (item.quantity || 1) + 1)}
                        >
                          +
                        </button>
                      </div>

                      <span className="item-total">
                        ₹{Math.round(
                          (item.discount && item.discount > 0 
                            ? item.price - (item.price * item.discount / 100) 
                            : item.price) * (item.quantity || 1)
                        )}
                      </span>

                      <button 
                        className="remove-btn"
                        onClick={() => removeItem(index)}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <div className="summary-header">
              <h3 className="summary-title">Order Summary</h3>
            </div>
            
            <div className="summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">₹{Math.round(total)}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-label">GST (5%)</span>
              <span className="summary-value">₹{Math.round(total * 0.05)}</span>
            </div>
            
            <div className="total-row">
              <span className="total-label">Total Amount</span>
              <span className="total-amount">₹{Math.round(total + (total * 0.05))}</span>
            </div>

            <button 
              className="pay-button"
              onClick={handlePayment} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Processing...
                </>
              ) : (
                `Proceed to Pay ₹${Math.round(total + (total * 0.05))}`
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;