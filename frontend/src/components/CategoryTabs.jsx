import "../styles/CategoryTabs.css"

function CategoryTabs({ categories, active, setActive }) {
  return (
    <div className="category-tabs-wrapper">
      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category}
            className={`category-tab ${active === category ? "active-tab" : ""}`}
            onClick={() => setActive(category)}
          >
            {category.replace("-", " ")}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryTabs