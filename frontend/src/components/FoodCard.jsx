import "../styles/menu.css"

function FoodCard({food}){

return(

<div className="food-card">

<img src={food.img} alt={food.name}/>

<div className="food-details">

<h3>{food.name}</h3>

<p>{food.desc}</p>

<div className="food-meta">

<span className="price">{food.price}</span>

<span>{food.kcal} kcal</span>

<span>{food.time}</span>

</div>

</div>

</div>

)

}

export default FoodCard