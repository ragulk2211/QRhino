import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import Header from "../components/Header"
import CategoryTabs from "../components/CategoryTabs"
import FoodCard from "../components/FoodCard"

import "../styles/menu.css"

function Menu() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const restaurantId = searchParams.get("restaurant")

  const [active, setActive] = useState("")
  const [menuData, setMenuData] = useState({})
  const [originalData, setOriginalData] = useState({})
  const [restaurantName, setRestaurantName] = useState("")

  useEffect(() => {
    fetchMenu()
  }, [restaurantId])

  const fetchMenu = async () => {
    try {
      // Show all menu items for now (restaurant filter data not properly set in DB)
      const res = await fetch("http://localhost:5000/menu")
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()

      // Fetch restaurant name if URL has restaurant param
      if (restaurantId) {
        try {
          const restaurantRes = await fetch(`http://localhost:5000/api/restaurants/${restaurantId}`)
          if (restaurantRes.ok) {
            const restaurant = await restaurantRes.json()
            setRestaurantName(restaurant.name)
          }
        } catch (e) {
          console.error("Error fetching restaurant:", e)
        }
      }

      const grouped = {}

      data.forEach(item => {
        const category = item.category?.toLowerCase() || "others"

        if (!grouped[category]) {
          grouped[category] = []
        }

        grouped[category].push(item)
      })

      setMenuData(grouped)
      setOriginalData(grouped)

      const firstCategory = Object.keys(grouped)[0]
      if (firstCategory) {
        setActive(firstCategory)
      }

    } catch (error) {
      console.error("Error loading menu:", error)
      // Use modern toast notification
      if (window.toast) {
        window.toast.error("Backend server is not connected. Please start the backend server and try again.")
      } else {
        alert("Backend server is not connected. Please start the backend server and try again.")
      }
    }
  }

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setMenuData(originalData)
      return
    }

    const filtered = {}

    Object.keys(originalData).forEach(category => {
      const matchedItems = originalData[category].filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.foodType?.toLowerCase().includes(searchTerm.toLowerCase())
      )

      if (matchedItems.length > 0) {
        filtered[category] = matchedItems
      }
    })

    setMenuData(filtered)
  }

  const deleteItem = async (id) => {
    try {
      await fetch(`http://localhost:5000/menu/${id}`, {
        method: "DELETE"
      })

      fetchMenu()

    } catch (error) {
      console.error("Delete failed:", error)
    }
  }

  useEffect(() => {
    const sections = document.querySelectorAll("section")

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        })
      },
      {
        threshold: 0.4
      }
    )

    sections.forEach(section => observer.observe(section))

    return () => observer.disconnect()
  }, [menuData])

  return (
    <div className="menu-page">

      <Header onSearch={handleSearch} />

      {restaurantName && (
        <div className="restaurant-header" style={{ padding: '1rem 2rem', background: '#f8f9fa', textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: '#333' }}>{restaurantName}</h2>
          <button 
            onClick={() => navigate('/')}
            style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            ← Back to Restaurants
          </button>
        </div>
      )}

      <CategoryTabs
        categories={Object.keys(menuData)}
        active={active}
        setActive={setActive}
      />

      {Object.keys(menuData).map(category => (
        <section key={category} id={category}>
          <h1 className="menu-title">
            {category.replace("-", " ").toUpperCase()}
          </h1>

          <div className="menu-grid">
            {menuData[category]?.map(food => (
              <FoodCard
                key={food._id}
                item={food}
                onDelete={deleteItem}
              />
            ))}
          </div>
        </section>
      ))}

      <button className="expert-btn">
        Talk to a menu expert →
      </button>

      <button
        className="add-item-btn"
        onClick={() => navigate("/add-item")}
      >
        + Add Menu Item
      </button>

    </div>
  )
}

export default Menu