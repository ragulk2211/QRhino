import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function Cart(){

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
    const updatedCart = cart.filter((_,i)=> i !== index);
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
      const orderData = {
        tableNumber: 1, // Can be made dynamic based on QR code
        items: cart.map(item => ({
          name: item.name,
          price: item.discount && item.discount > 0 
            ? item.price - (item.price * item.discount / 100) 
            : item.price,
          foodType: item.foodType
        })),
        total: total
      };

      const response = await fetch("http://localhost:5000/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        alert(`Payment Successful! Order placed with Token Number: ${order.tokenNumber}`);
        setCart([]); // Clear cart after successful order
        navigate("/");
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return(
    <div style={{ padding: "15px", maxWidth: "600px", margin: "0 auto" }}>

      <h2 style={{ marginBottom: "15px", textAlign: "center", fontSize: "1.5rem" }}>Your Cart</h2>

      {cart.length === 0 && <p style={{ textAlign: "center" }}>Cart is empty</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {cart.map((item,index)=>(
          <div 
            key={index} 
            style={{
              border: "1px solid #ddd",
              padding: "12px",
              borderRadius: "8px",
              display: "flex",
              gap: "15px",
              backgroundColor: "#fff",
              alignItems: "center"
            }}
          >
            {/* Image - Normal Size */}
            <div style={{ flexShrink: 0 }}>
              <img 
                src={item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:5000/uploads/${item.image}`) : "/images/default-food.png"}
                alt={item.name}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "6px"
                }}
              />
            </div>

            {/* Item Details */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h4 style={{ margin: 0, fontSize: "1rem" }}>{item.name}</h4>
                {item.foodType && (
                  <span 
                    style={{
                      background: item.foodType === 'veg' ? '#22c55e' : '#dc2626',
                      color: 'white',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: '600'
                    }}
                  >
                    {item.foodType === 'veg' ? '● Veg' : '● Non-Veg'}
                  </span>
                )}
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                {item.discount && item.discount > 0 ? (
                  <>
                    <span style={{ textDecoration: "line-through", color: "#999", fontSize: "0.8rem" }}>₹{item.price}</span>
                    <span style={{ color: "#22c55e", fontWeight: "bold" }}>
                      ₹{Math.round(item.price - (item.price * item.discount / 100))}
                    </span>
                    <span style={{ background: "#22c55e", color: "white", padding: "1px 4px", borderRadius: "4px", fontSize: "0.65rem" }}>
                      {item.discount}%
                    </span>
                  </>
                ) : (
                  <span style={{ fontWeight: "bold" }}>₹{item.price}</span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #ddd", borderRadius: "6px", padding: "2px 8px" }}>
                  <button 
                    onClick={() => updateQuantity(index, (item.quantity || 1) - 1)}
                    style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "1rem", padding: "0" }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: "15px", textAlign: "center", fontSize: "0.9rem" }}>{item.quantity || 1}</span>
                  <button 
                    onClick={() => updateQuantity(index, (item.quantity || 1) + 1)}
                    style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "1rem", padding: "0" }}
                  >
                    +
                  </button>
                </div>

                <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>₹{Math.round((item.discount && item.discount > 0 ? item.price - (item.price * item.discount / 100) : item.price) * (item.quantity || 1))}</span>

                <button 
                  onClick={()=>removeItem(index)}
                  style={{
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.8rem"
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <h3>Total: ₹{Math.round(total)}</h3>

        <button 
          onClick={handlePayment} 
          disabled={loading}
          style={{ 
            padding: "12px 25px", 
            fontSize: "1rem", 
            cursor: loading ? "not-allowed" : "pointer",
            background: "#2e7d32",
            color: "white",
            border: "none",
            borderRadius: "8px",
            marginTop: "10px"
          }}
        >
          {loading ? "Processing..." : "Proceed to Pay ₹" + Math.round(total)}
        </button>
      </div>

    </div>
  )
}

export default Cart
