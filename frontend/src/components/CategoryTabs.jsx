import { useEffect } from "react"
import "../styles/menu.css"

function CategoryTabs({ active, setActive, categories = [] }) {

  const scrollToSection = (id) => {
    const section = document.getElementById(id)
    if (section) {
      setActive(id)
      section.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // Scroll spy - update active tab on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = categories.map(cat => document.getElementById(cat)).filter(Boolean)
      
      let currentActive = ""
      
      for (const section of sections) {
        const rect = section.getBoundingClientRect()
        if (rect.top <= 150) {
          currentActive = section.id
        }
      }
      
      if (currentActive && currentActive !== active) {
        setActive(currentActive)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Check on mount
    
    return () => window.removeEventListener("scroll", handleScroll)
  }, [categories, active, setActive])

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
