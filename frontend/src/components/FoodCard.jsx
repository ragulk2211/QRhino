import "../styles/menu.css"

const API_BASE = "http://localhost:5000"

function FoodCard({ food }) {
  const imageUrl = food.image
    ? `${API_BASE}/uploads/${food.image}`
    : null

  return (
    <div className="food-card">
      {imageUrl ? (
        <img src={imageUrl} alt={food.name} />
      ) : (
        <div className="food-img-placeholder">🍽️</div>
      )}

      <div className="food-details">
        <h3>{food.name}</h3>
        <p>{food.desc}</p>
        <div className="food-meta">
          <span className="price">₹{food.price}</span>
          {food.kcal && <span>{food.kcal} kcal</span>}
          {food.time && <span>{food.time}</span>}
        </div>
      </div>
    </div>
  )
}

export default FoodCard
