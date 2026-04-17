// Card.jsx
import { useNavigate } from "react-router-dom";
import "./Card.css";

function CategoryCard({ category }) {
  const navigate = useNavigate();

  return (
    <div
      className="category-card"
      onClick={() => navigate(category.path)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(category.path);
        }
      }}
    >
      <div className="category-card-image">
        <img src={category.image} alt={category.title} loading="lazy" />
      </div>
      <div className="category-card-overlay">
        <h3 className="category-card-title">{category.title}</h3>
        <p className="category-card-desc">{category.desc}</p>
      </div>
    </div>
  );
}

export default CategoryCard;