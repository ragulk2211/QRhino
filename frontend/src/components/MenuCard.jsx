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
        if (e.key === "Enter" || e.key === " ") {
          navigate(category.path);
        }
      }}
    >
      <div className="category-card-image-wrapper">
        <img
          src={category.image}
          alt={category.title}
          className="category-card-image"
          loading="lazy"
        />

        <div className="discount-badge">
          {category.discount || "-5%"}
        </div>
      </div>

      <div className="category-card-content">
        <div className="category-card-top">
          <h3 className="category-card-title">{category.title}</h3>

          <div className="price-box">
            <span className="new-price">₹{category.price || 120}</span>
            <span className="old-price">₹{category.oldPrice || 150}</span>
          </div>
        </div>

        <p className="category-card-desc">
          {category.desc || "Delicious food prepared with fresh ingredients"}
        </p>

        <div className="food-meta">
          <span>{category.calories || "45 kcal"}</span>
          <span>{category.time || "20 min"}</span>
          <span>{category.type || "Veg"}</span>
        </div>

        <div className="card-buttons">
          <button className="add-btn">Add</button>
          <button className="view-btn">View</button>
        </div>
      </div>
    </div>
  );
}

export default CategoryCard;