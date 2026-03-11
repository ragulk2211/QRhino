import "../styles/card.css"
import { useNavigate } from "react-router-dom"

function CategoryCard({ category }) {

  const navigate = useNavigate()

  return (
    <div
      className="category-card"
      onClick={() => navigate(category.path)}
    >
      <img src={category.image} alt={category.title} />

      <div className="card-overlay">
        <h2>{category.title}</h2>
        <p>{category.desc}</p>
      </div>
    </div>
  )
}

export default CategoryCard