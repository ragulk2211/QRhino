import "../styles/card.css"
import { useNavigate } from "react-router-dom"

function CategoryCard({ category }) {
  const navigate = useNavigate()

  return (
    <div
      className="category-card"
      onClick={() => navigate(category.path)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(category.path)
        }
      }}
    >
      <img src={category.image} alt={category.title} loading="lazy" />
      <div className="card-overlay">
        <h2>{category.title}</h2>
        <p>{category.desc}</p>
      </div>
    </div>
  )
}

export default CategoryCard