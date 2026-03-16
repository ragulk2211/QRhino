import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Header from "../components/Header"
import CategoryTabs from "../components/CategoryTabs"
import FoodCard from "../components/FoodCard"

import "../styles/menu.css"

const API_BASE = "http://localhost:5000"

function Menu() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const restaurantId = searchParams.get("restaurantId")

  const [active, setActive] = useState("")
  const [menuData, setMenuData] = useState({})
  const [categories, setCategories] = useState([])
  const [restaurant, setRestaurant] = useState(null)

  useEffect(() => {
    if (restaurantId) {
      fetch(`${API_BASE}/api/restaurants/${restaurantId}`)
        .then(r => r.json())
        .then(data => {
          setRestaurant(data)
        })
        .catch(() => {})
    }
  }, [restaurantId])

  useEffect(() => {
    const url = restaurantId
      ? `${API_BASE}/menu?restaurantId=${restaurantId}`
      : `${API_BASE}/menu`
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const grouped = {}
        data.forEach(item => {
          if (!grouped[item.category]) {
            grouped[item.category] = []
          }
          grouped[item.category].push(item)
        })
        setMenuData(grouped)
        const keys = Object.keys(grouped)
        setCategories(keys)
        if (keys.length > 0) setActive(keys[0])
      })
      .catch(err => console.error("Failed to fetch menu:", err))
  }, [restaurantId])

  useEffect(() => {
    const sections = document.querySelectorAll("section[data-category]")

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        })
      },
      { threshold: 0.4 }
    )

    sections.forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [categories])

  return (
    <div className="menu-page">
      <button
  onClick={() => navigate(-1)}
  style={{
    margin: "10px",
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer"
  }}
>
  ← Back
</button>
      <Header />

      {/* Restaurant Header with Image */}
      {restaurant && (
        <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
          {restaurant.image ? (
            <img 
              src={`${API_BASE}/uploads/${restaurant.image}`} 
              alt={restaurant.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #2c3e50, #3498db)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "4rem" }}>🏨</span>
            </div>
          )}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1rem", background: "linear-gradient(transparent, rgba(0,0,0,0.8))" }}>
            <h2 style={{ margin: 0, color: "#fff", fontSize: "1.8rem" }}>{restaurant.name}</h2>
            {restaurant.location && <p style={{ margin: 0, color: "#ddd" }}>📍 {restaurant.location}</p>}
          </div>
        </div>
      )}

      {/* Admin Controls */}
      <div style={{ padding: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", borderBottom: "1px solid #eee", background: "#f9f9f9" }}>
        <button onClick={() => navigate(`/admin/edit-restaurant/${restaurantId}`)} style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>
          ✏️ Edit Restaurant
        </button>
        <button onClick={() => navigate(`/admin/create-category?restaurantId=${restaurantId}`)} style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>
          📂 Add Category
        </button>
        <button onClick={() => navigate(`/admin/add-item?restaurantId=${restaurantId}`)} style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>
          🍔 Add Food Item
        </button>
        <button onClick={() => navigate(`/admin/qr-generator?restaurantId=${restaurantId}`)} style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>
          📱 Generate QR
        </button>
      </div>

      <CategoryTabs active={active} setActive={setActive} categories={categories} />

      {categories.map(cat => (
        <section key={cat} id={cat} data-category={cat}>
          <h1 className="menu-title">
            {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " ")}
          </h1>
          <div className="menu-grid">
            {menuData[cat]?.map((food, i) => (
              <FoodCard key={i} food={food} />
            ))}
          </div>
        </section>
      ))}

      {categories.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
          <p>No menu items yet.</p>
          <button onClick={() => navigate(`/admin/add-item?restaurantId=${restaurantId}`)} style={{ padding: "0.8rem 1.5rem", background: "#e8c96b", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            + Add First Menu Item
          </button>
        </div>
      )}

      <button className="expert-btn">
        Talk to a menu expert →
      </button>
    </div>
  )
}

export default Menu
