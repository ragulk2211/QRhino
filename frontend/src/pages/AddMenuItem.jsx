import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/addMenuItem.css"

function AddItem() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    calories: "",
    category: "",
    foodType: "veg"
  })
  const [categories, setCategories] = useState([])
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/menu")
      const data = await res.json()
      const uniqueCategories = [...new Set(data.map(item => item.category))].filter(Boolean)
      setCategories(uniqueCategories)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name === "price" || name === "discount" || name === "calories") {
      const numValue = parseFloat(value)
      if (value !== "" && (numValue < 0 || isNaN(numValue))) {
        return
      }
      if (name === "discount" && numValue > 100) {
        setFormData(prev => ({ ...prev, [name]: "100" }))
        return
      }
      if (name === "price" && numValue < 0) {
        return
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "warning", text: "Image size should be less than 5MB" })
        return
      }
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleReset = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      discount: "",
      calories: "",
      category: "",
      foodType: "veg"
    })
    setImage(null)
    setImagePreview("")
    setMessage({ type: "", text: "" })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setMessage({ type: "warning", text: "Please enter item name" })
      return
    }
    if (!formData.description.trim()) {
      setMessage({ type: "warning", text: "Please enter description" })
      return
    }
    if (!formData.price) {
      setMessage({ type: "warning", text: "Please enter price" })
      return
    }
    if (parseFloat(formData.price) <= 0) {
      setMessage({ type: "warning", text: "Price must be greater than 0" })
      return
    }

    setIsLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key])
      })
      if (image) {
        formDataToSend.append("image", image)
      }

      // Your API call here
      setTimeout(() => {
        setMessage({ type: "success", text: "Menu item added successfully!" })
        handleReset()
        setIsLoading(false)
        
        setTimeout(() => {
          navigate("/admin")
        }, 2000)
      }, 1000)
    } catch (error) {
      setMessage({ type: "error", text: "Failed to add menu item" })
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate("/admin")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18L9 12L15 6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Dashboard
          </button>
          <div className="header-content">
            <h1>Add New Menu Item</h1>
            <p>Create a culinary masterpiece for your restaurant</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            {/* Alert Message */}
            {message.text && (
              <div className={`alert-message ${message.type}`}>
                <div className="alert-content">
                  <span className="alert-icon">
                    {message.type === "success" ? "✓" : message.type === "warning" ? "!" : "⚠"}
                  </span>
                  <span>{message.text}</span>
                </div>
                <button 
                  type="button"
                  className="alert-close"
                  onClick={() => setMessage({ type: "", text: "" })}
                >
                  ×
                </button>
              </div>
            )}

            {/* Item Name */}
            <div className="form-group">
              <label className="required">Item Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Margherita Pizza"
                autoComplete="off"
              />
            </div>

            {/* Category & Food Type Row */}
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="premium-select"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Food Type</label>
                <div className="food-type-group">
                  <label className={`food-type-card ${formData.foodType === 'veg' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="foodType"
                      value="veg"
                      checked={formData.foodType === 'veg'}
                      onChange={handleInputChange}
                    />
                    <div className="food-type-content">
                      <span className="food-icon veg-icon"></span>
                      <span className="food-type-name">Vegetarian</span>
                    </div>
                  </label>
                  
                  <label className={`food-type-card ${formData.foodType === 'non-veg' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="foodType"
                      value="non-veg"
                      checked={formData.foodType === 'non-veg'}
                      onChange={handleInputChange}
                    />
                    <div className="food-type-content">
                      <span className="food-icon nonveg-icon"></span>
                      <span className="food-type-name">Non-Vegetarian</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="required">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the menu item with enticing details..."
                rows="4"
                className="premium-textarea"
              />
            </div>

            {/* Price, Discount, Calories Row */}
            <div className="form-row three-col">
              <div className="form-group">
                <label className="required">Price</label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  <span className="input-suffix">$</span>
                </div>
              </div>

              <div className="form-group">
                <label>Discount</label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="1"
                  />
                  <span className="input-suffix">% OFF</span>
                </div>
              </div>

              <div className="form-group">
                <label>Calories</label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    name="calories"
                    value={formData.calories}
                    onChange={handleInputChange}
                    placeholder="450"
                    min="0"
                    step="1"
                  />
                  <span className="input-suffix">kcal</span>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label>Item Image</label>
              <div className="image-upload-area">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  id="image-input"
                  hidden
                />
                <label htmlFor="image-input" className="upload-label">
                  {imagePreview ? (
                    <div className="image-preview-container">
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                      <div className="change-image-overlay">
                        <span>Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <div className="upload-icon">📷</div>
                      <div className="upload-text">
                        <span>Click to upload image</span>
                        <small>JPEG, PNG, WEBP (max 5MB)</small>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Button Group */}
            <div className="button-group">
              <button type="button" className="btn-secondary" onClick={handleReset}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="3" strokeLinecap="round"/>
                </svg>
                Clear Form
              </button>
              <button type="button" className="btn-cancel" onClick={() => navigate("/admin")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Adding Item...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 4v12m0 0l-3-3m3 3l3-3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round"/>
                    </svg>
                    Add Menu Item
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddItem