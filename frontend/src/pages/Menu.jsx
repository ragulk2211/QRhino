import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import Header from "../components/Header"
import CategoryTabs from "../components/CategoryTabs"
import FoodCard from "../components/FoodCard"

import "../styles/menu.css"

function Menu() {
  const navigate = useNavigate()

  const [active, setActive] = useState("")
  const [menuData, setMenuData] = useState({})
  const [originalData, setOriginalData] = useState({})

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      const res = await fetch("http://localhost:5000/menu")
      const data = await res.json()

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