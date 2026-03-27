import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import Header from "../components/Header"
import CategoryTabs from "../components/CategoryTabs"
import FoodCard from "../components/FoodCard"
import Advertisement from "../components/Advertisement"
import API_BASE_URL from "../config"

import "../styles/menu.css"

function Menu() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const restaurantId = searchParams.get("restaurant")
  const categoryParam = searchParams.get("category")

  const [active, setActive] = useState("")
  const [menuData, setMenuData] = useState({})
  const [originalData, setOriginalData] = useState({})
  const [restaurantName, setRestaurantName] = useState("")
  const [foodTypeFilter, setFoodTypeFilter] = useState("all")

  const [isLoading, setIsLoading] = useState(true)
  const [categoryMap, setCategoryMap] = useState({})

  // FETCH MENU (ONLY ON LOAD)
  useEffect(() => {
    fetchMenu()
  }, [restaurantId, categoryParam])

  // Filter when foodTypeFilter changes
  useEffect(() => {
    if (foodTypeFilter === "all") {
      setMenuData(originalData)
    } else {
      const filtered = {}

      Object.keys(originalData).forEach(category => {
        const matchedItems = originalData[category].filter(
          item => item.foodType?.toLowerCase() === foodTypeFilter.toLowerCase()
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
      // First fetch categories
      let catMap = {}
      try {
        const catRes = await fetch(`${API_BASE_URL}/api/categories`)
        const categories = await catRes.json()
        
        categories.forEach(cat => {
          catMap[cat._id] = cat.name
        })
        setCategoryMap(catMap)
      } catch (e) {
        console.error("Category fetch error:", e)
      }

      // Build URL with filters
      let url = `${API_BASE_URL}/api/menu`
      const params = []
      if (restaurantId) {
        params.push(`restaurantId=${restaurantId}`)
      }
      if (categoryParam) {
        params.push(`category=${categoryParam}`)
      }
      if (params.length > 0) {
        url += `?${params.join('&')}`
      }

      const res = await fetch(url)
      const data = await res.json()

      // Fetch restaurant name
      if (restaurantId) {
        try {
          const restaurantRes = await fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}`)

          if (restaurantRes.ok) {
            const restaurant = await restaurantRes.json()
            setRestaurantName(restaurant.name)
          }
        } catch (e) {
          console.error("Restaurant fetch error:", e)
        }
      }

      // GROUP DATA
      const grouped = {}

      data.forEach(item => {
        let category
        if (item.categoryId && catMap[item.categoryId]) {
          category = catMap[item.categoryId]
        } else {
          category = item.category?.toLowerCase() || "others"
        }

        if (!grouped[category]) grouped[category] = []
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
      console.error("Menu load error:", error)
      alert("Backend not connected")
    } finally {
      setIsLoading(false)
    }
  }

  // SEARCH FUNCTION
  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setMenuData(originalData)
      return
    }

    const filtered = {}

    Object.keys(originalData).forEach(category => {
      const items = originalData[category].filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )

      if (items.length > 0) {
        filtered[category] = items
      }
    })

    setMenuData(filtered)
  }

  // DELETE
  const deleteItem = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/menu/${id}`, {
        method: "DELETE"
      })
      fetchMenu()
    } catch (error) {
      console.error("Delete failed:", error)
    }
  }

  // Intersection Observer for active tab
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

      {/* FILTER BUTTONS */}
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

      {/* Active Coupons/Offers */}
      <div style={{ margin: "10px 0" }}>
        <Advertisement 
          useBackend={true} 
          animation="slideUp"
          showScanner={false}
          size="sm"
        />
      </div>

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

      <button
        className="add-item-btn"
        onClick={() => navigate("/add-item")}
      >
        + Add Item
      </button>

      {/* Footer */}
      <footer className="menu-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo-icon">🍽️</span>
            <span className="logo-text">FoodieHub</span>
          </div>
          <div className="footer-info">
            <p className="footer-tagline">Delicious Food, Happy Moments</p>
            <p className="footer-contact">📞 +1 234 567 890</p>
            <p className="footer-email">✉️ info@foodiehub.com</p>
            <p className="footer-address">📍 123 Food Street, Culinary City</p>
          </div>
          <div className="footer-links">
            <button onClick={() => navigate("/about")}>About Us</button>
            <button onClick={() => navigate("/contact")}>Contact</button>
            <button onClick={() => navigate("/privacy")}>Privacy Policy</button>
          </div>
          <div className="footer-copyright">
            <p>© 2024 FoodieHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Menu