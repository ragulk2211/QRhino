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
  const [foodTypeFilter, setFoodTypeFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMenu()
  }, [restaurantId])

  useEffect(() => {
    if (foodTypeFilter === "all") {
      setMenuData(originalData)
    } else {
      const filtered = {}

      Object.keys(originalData).forEach(category => {
        const matchedItems = originalData[category].filter(
          item => item.foodType === foodTypeFilter
        )

        if (matchedItems.length > 0) {
          filtered[category] = matchedItems
        }
      })

      setMenuData(filtered)
    }
  }, [foodTypeFilter, originalData])

  const fetchMenu = async () => {
    setIsLoading(true)

    try {
      const res = await fetch("http://localhost:5000/api/menu")

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()

      if (restaurantId) {
        try {
          const restaurantRes = await fetch(
            `http://localhost:5000/api/restaurants/${restaurantId}`
          )

          if (restaurantRes.ok) {
            const restaurant = await restaurantRes.json()
            setRestaurantName(restaurant.name)
          }
        } catch (e) {
          console.error("Restaurant fetch error:", e)
        }
      }

      const grouped = {}

      data.forEach(item => {
        let category = item.category?.toLowerCase() || "others"

        if (!grouped[category]) {
          grouped[category] = []
        }

        grouped[category].push(item)
      })

      const sortedGrouped = {}
      const categoryOrder = [
        "burgers",
        "pizza",
        "starters",
        "salad",
        "soups",
        "arabic food",
        "others"
      ]

      categoryOrder.forEach(cat => {
        if (grouped[cat]) {
          sortedGrouped[cat] = grouped[cat]
        }
      })

      Object.keys(grouped).forEach(cat => {
        if (!categoryOrder.includes(cat)) {
          sortedGrouped[cat] = grouped[cat]
        }
      })

      setMenuData(sortedGrouped)
      setOriginalData(sortedGrouped)

      const firstCategory = Object.keys(sortedGrouped)[0]
      if (firstCategory) {
        setActive(firstCategory)
      }

    } catch (error) {
      console.error("Error loading menu:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = searchTerm => {
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

  const deleteItem = async id => {
    try {
      await fetch(`http://localhost:5000/api/menu/${id}`, {
        method: "DELETE"
      })

      fetchMenu()
    } catch (error) {
      console.error("Delete failed:", error)
    }
  }

  useEffect(() => {
    const sections = document.querySelectorAll("section")

    if (!sections.length) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        })
      },
      {
        threshold: 0.35
      }
    )

    sections.forEach(section => observer.observe(section))

    return () => observer.disconnect()
  }, [menuData])

  const formatCategoryName = category => {
    return category.replace("-", " ").toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="menu-page">
        <Header onSearch={handleSearch} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="menu-page">

      <Header onSearch={handleSearch} />

      {restaurantName && (
        <div className="restaurant-header">
          <h2>{restaurantName}</h2>
          <button onClick={() => navigate("/")}>
            ← Back to Restaurants
          </button>
        </div>
      )}

      <CategoryTabs
        categories={Object.keys(menuData)}
        active={active}
        setActive={(category) => {
          setActive(category)

          document.getElementById(category)?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          })
        }}
      />

      <div className="food-type-filter">
        <button
          onClick={() => setFoodTypeFilter("all")}
          className={foodTypeFilter === "all" ? "active" : ""}
        >
          All
        </button>

        <button
          onClick={() => setFoodTypeFilter("veg")}
          className={foodTypeFilter === "veg" ? "active" : ""}
        >
          Veg
        </button>

        <button
          onClick={() => setFoodTypeFilter("nonveg")}
          className={foodTypeFilter === "nonveg" ? "active" : ""}
        >
          Non-Veg
        </button>
      </div>

      {Object.keys(menuData).length === 0 ? (
        <div className="no-items">
          <p>No menu items found</p>
          <button onClick={() => setFoodTypeFilter("all")}>
            Reset Filters
          </button>
        </div>
      ) : (
        Object.keys(menuData).map(category => (
          <section key={category} id={category}>
            <h1 className="menu-title">
              {formatCategoryName(category)}
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
        ))
      )}

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