import { useContext } from "react";
import { CartContext } from "../context/CartContext";

function FoodCard({ food }) {

 const { addToCart } = useContext(CartContext);

 return (
  <div className="food-card">

   <h3>{food.name}</h3>
   <p>₹{food.price}</p>

   <button onClick={() => addToCart(food)}>
     Add to Cart
   </button>

  </div>
 );
}

export default FoodCard;