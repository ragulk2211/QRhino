import { useContext } from "react";
import { CartContext } from "../context/CartContext";

function Cart(){

 const { cart, setCart } = useContext(CartContext);

 const total = cart.reduce((sum,item)=> sum + item.price,0);

 const removeItem = (index) => {
  const updatedCart = cart.filter((_,i)=> i !== index);
  setCart(updatedCart);
 };

 const handlePayment = () => {
   alert("Payment Successful! Order sent to kitchen");
 };

 return(
  <div>

   <h2>Your Cart</h2>

   {cart.length === 0 && <p>Cart is empty</p>}

   {cart.map((item,index)=>(
     <div key={index} style={{marginBottom:"10px"}}>

       {item.name} - ₹{item.price}

       <button onClick={()=>removeItem(index)}>
         Remove
       </button>

     </div>
   ))}

   <h3>Total: ₹{total}</h3>

   <button onClick={handlePayment}>
     Proceed to Pay
   </button>

  </div>
 )
}

export default Cart