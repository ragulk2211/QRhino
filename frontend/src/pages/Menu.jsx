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
  const [originalData, setOriginalData] = useState({})
  const [restaurantName, setRestaurantName] = useState("")
  const [foodTypeFilter, setFoodTypeFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [categoryMap, setCategoryMap] = useState({}) // Map categoryId to category name

  // ✅ FETCH MENU (ONLY ON LOAD)
  useEffect(() => {
    fetchMenu()
  }, [restaurantId, categoryParam])

  const fetchMenu = async () => {
    try {
      setLoading(true)

      // First fetch categories
      let catMap = {}
      try {
        const catRes = await fetch(`${API_BASE_URL}/api/categories`)
        const categories = await catRes.json()
        
        // Create a map of categoryId -> category name
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

      // ✅ GROUP DATA
      const grouped = {}

      data.forEach(item => {
        // Use categoryId if available, otherwise fall back to category string
        let category
        if (item.categoryId && catMap[item.categoryId]) {
          category = catMap[item.categoryId]
        } else {
          category = item.category?.toLowerCase() || "others"
        }

        if (!grouped[category]) grouped[category] = []
        grouped[category].push(item)
      })

      setOriginalData(grouped)

      const firstCategory = Object.keys(grouped)[0]
      if (firstCategory) setActive(firstCategory)

    } catch (error) {
      console.error("Menu load error:", error)
      alert("Backend not connected")
    } finally {
      setLoading(false)
    }
  }

  // ✅ FILTER FUNCTION (NO STATE BUG)
  const getFilteredData = () => {
    if (foodTypeFilter === "all") return originalData

    const filtered = {}

    Object.keys(originalData).forEach(category => {
      const items = originalData[category].filter(item => {
        const type = item.foodType?.toLowerCase()

        if (foodTypeFilter === "veg") {
          return type === "veg" || type === "vegetarian"
        }

        if (foodTypeFilter === "non-veg") {
          return type === "non-veg" || type === "non-vegetarian"
        }

        return true
      })

      if (items.length > 0) {
        filtered[category] = items
      }
    })

    return filtered
  }

  // ✅ SEARCH FUNCTION
  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) return

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

    setOriginalData(filtered)
  }

  // ✅ DELETE
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

  const displayData = getFilteredData()

  return (
    <div className="menu-page">

      <Header onSearch={handleSearch} />

      {restaurantName && (
        <div style={{ textAlign: "center", padding: "10px" }}>
          <h2>{restaurantName}</h2>
          <button onClick={() => navigate("/")}>← Back</button>
        </div>
      )}

      {/* ✅ FILTER BUTTONS */}
      <div style={{ textAlign: "center", margin: "10px" }}>
        <button onClick={() => setFoodTypeFilter("all")}>
          All
        </button>

        <button onClick={() => setFoodTypeFilter("veg")}>
          🟢 Veg
        </button>

        <button onClick={() => setFoodTypeFilter("non-veg")}>
          🔴 Non-Veg
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
        categories={Object.keys(displayData)}
        active={active}
        setActive={setActive}
      />

      {/* ✅ LOADING */}
      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}

      {/* ✅ MENU */}
      {Object.keys(displayData).map(category => (
        <section key={category} id={category}>
          <h1>{category.toUpperCase()}</h1>

          <div className="menu-grid">
            {displayData[category]?.map(food => (
              <FoodCard
                key={food._id}
                item={food}
                onDelete={deleteItem}
              />
            ))}
          </div>
        </section>
      ))}

      <button
        className="add-item-btn"
        onClick={() => navigate("/add-item")}
      >
        + Add Item
      </button>

    </div>
  )
}

export default Menu