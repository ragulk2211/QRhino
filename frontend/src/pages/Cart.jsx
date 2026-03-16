import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function Cart(){

  const { cart, setCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum,item)=> sum + (item.price * (item.quantity || 1)),0);

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
          price: item.price
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
    <div style={{ padding: "20px" }}>

      <h2>Your Cart</h2>

      {cart.length === 0 && <p>Cart is empty</p>}

      {cart.map((item,index)=>(
        <div key={index} style={{border:"1px solid #ddd",margin:"10px",padding:"10px",borderRadius:"8px"}}>

          <h3>{item.name}</h3>
          <p>Price: ₹{item.price}</p>
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button onClick={() => updateQuantity(index, (item.quantity || 1) - 1)}>-</button>
            <span>{item.quantity || 1}</span>
            <button onClick={() => updateQuantity(index, (item.quantity || 1) + 1)}>+</button>
          </div>

          <p>Subtotal: ₹{item.price * (item.quantity || 1)}</p>

          <button onClick={()=>removeItem(index)}>
            Remove
          </button>

        </div>
      ))}

      <h3>Total: ₹{total}</h3>

      <button 
        onClick={handlePayment} 
        disabled={loading}
        style={{ padding: "15px 30px", fontSize: "18px", cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "Processing..." : "Proceed to Pay"}
      </button>

    </div>
  )
}

export default Cart
