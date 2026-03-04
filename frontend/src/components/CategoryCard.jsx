import "../styles/card.css";

function CategoryCard({ category }) {
  return (
    <div className="category-card">
      <img src={category.image} alt={category.title} />

      <div className="card-overlay">
        <h2>{category.title}</h2>
        <p>{category.desc}</p>
      </div>
    </div>
  );
}

export default CategoryCard;