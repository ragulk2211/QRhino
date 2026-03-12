import "../styles/menu.css"

function CategoryTabs({ active, setActive, categories = [] }) {

  const scrollToSection = (id) => {
    const section = document.getElementById(id)
    if (section) {
      setActive(id)
      section.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="category-tabs">
      <div className="menu-icon">☰</div>
      {categories.map(cat => (
        <span
          key={cat}
          className={active === cat ? "active-tab" : ""}
          onClick={() => scrollToSection(cat)}
        >
          {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " ")}
        </span>
      ))}
    </div>
  )
}

export default CategoryTabs
