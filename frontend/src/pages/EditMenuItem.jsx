import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "../components/Header"
import API_BASE_URL from "../config"
import "../styles/addmenu.css"

function EditMenuItem() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    desc: "",
    price: "",
    discount: "0",
    kcal: "",
    time: "",
    category: "",
    categoryId: "",
    foodType: "veg",
    restaurantId: ""
  })

  const [restaurants, setRestaurants] = useState([])
  const [categories, setCategories] = useState([])

  const [image, setImage] = useState(null)
  const [currentImage, setCurrentImage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch restaurants for dropdown
    fetch(`${API_BASE_URL}/api/restaurants`)
      .then(res => res.json())
      .then(data => setRestaurants(data))
      .catch(err => console.error("Failed to fetch restaurants:", err))

    // Fetch categories from database
    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Failed to fetch categories:", err))

    fetch(`${API_BASE_URL}/api/menu`)
      .then(res => res.json())
      .then(data => {
        const item = data.find(food => food._id === id)

        if (item) {
          setForm({
            name: item.name || "",
            desc: item.desc || "",
            price: item.price || "",
            discount: item.discount || 0,
            kcal: item.kcal || "",
            time: item.time || "",
            category: item.category || "",
            categoryId: item.categoryId || "",
            foodType: item.foodType || "veg",
            restaurantId: item.restaurantId || ""
          })
          // Set current image URL
          if (item.image) {
            const imageUrl = item.image.startsWith('http') 
              ? item.image 
              : `${API_BASE_URL}/uploads/${item.image}`
            setCurrentImage(imageUrl)
          }
        }
      })
      .catch(err => {
        console.error("Error fetching menu item:", err)
        alert("Backend server is not connected. Please start the backend server and try again.")
      })
  }, [id])

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("desc", form.desc)
      formData.append("price", form.price)
      formData.append("kcal", form.kcal)
      formData.append("time", form.time)
      formData.append("category", form.category)
      formData.append("categoryId", form.categoryId)
      formData.append("foodType", form.foodType)
      formData.append("discount", form.discount)
      formData.append("restaurantId", form.restaurantId)
      
      // Only append image if a new one was selected
      if (image) {
        formData.append("image", image)
      }

      const response = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
        method: "PUT",
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      alert("Updated successfully ✅")
      navigate("/menu/main")
    } catch (error) {
      console.error("Error updating menu item:", error)
      alert("Failed to update. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-menu-page">

      <Header />

      <div className="add-menu-container">

        <h1>Edit Menu Item</h1>

        <form onSubmit={handleSubmit} className="add-menu-form">

          {/* Current Image Preview */}
          <div className="image-upload-section">
            <label>Current Image:</label>
            {currentImage ? (
              <div className="current-image-preview">
                <img 
                  src={currentImage} 
                  alt="Current item" 
                  style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "8px" }}
                />
              </div>
            ) : (
              <p>No image currently set</p>
            )}
            
            <label>Replace Image (optional):</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ marginTop: "10px" }}
            />
            {image && (
              <p style={{ color: "green", marginTop: "5px" }}>
                New image selected: {image.name}
              </p>
            )}
          </div>

          {/* Restaurant Selection */}
          <div className="form-group">
            <label>Restaurant</label>
            <select
              name="restaurantId"
              value={form.restaurantId}
              onChange={handleChange}
            >
              <option value="">Select a restaurant</option>
              {restaurants.map(restaurant => (
                <option key={restaurant._id} value={restaurant._id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Dish Name"
          />

          <textarea
            name="desc"
            value={form.desc}
            onChange={handleChange}
            placeholder="Description"
          />

          <div className="row-3">

            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
            />

            <input
              name="kcal"
              value={form.kcal}
              onChange={handleChange}
              placeholder="Calories"
            />

            <input
              name="time"
              value={form.time}
              onChange={handleChange}
              placeholder="Time"
            />

          </div>

          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category"
          />

          {/* Category ID Selection (from database) */}
          <div className="form-group">
            <label htmlFor="categoryId">
              Link to Category (Optional)
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
            >
              <option value="">-- Select a category --</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Discount */}
          <div className="form-group">
            <label htmlFor="discount">Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={form.discount}
              onChange={handleChange}
              placeholder="0"
              min="0"
              max="100"
              style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '8px' }}
            />
          </div>

          {/* Food Type (Veg/Non-Veg) */}
          <div className="form-group">
            <label htmlFor="foodType">
              Food Type
            </label>
            <div className="food-type-selector">
              <label className={`food-type-option ${form.foodType === 'veg' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="foodType"
                  value="veg"
                  checked={form.foodType === 'veg'}
                  onChange={handleChange}
                />
                <span className="veg-indicator">●</span>
                <span>Vegetarian</span>
              </label>
              <label className={`food-type-option ${form.foodType === 'non-veg' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="foodType"
                  value="non-veg"
                  checked={form.foodType === 'non-veg'}
                  onChange={handleChange}
                />
                <span className="non-veg-indicator">●</span>
                <span>Non-Vegetarian</span>
              </label>
            </div>
          </div>

          <button className="submit-btn" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>

        </form>

      </div>

    </div>
  )
}

export default EditMenuItem
