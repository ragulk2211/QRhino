import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import API_BASE_URL from "../config"
import "../styles/addmenu.css"

const CATEGORIES = ["burgers",  "soups", "salad", "pizza", "pasta", "desserts", "beverages"]

function AddMenuItem() {
  const navigate = useNavigate()

  // Restaurants list
  const [restaurants, setRestaurants] = useState([])
  // Categories list from database
  const [categories, setCategories] = useState([])

  // Form state
  const [form, setForm] = useState({
    name: "",
    desc: "",
    price: "",
    discount: "0",
    kcal: "",
    time: "",
    category: "burgers",
    categoryId: "",
    foodType: "veg",
    restaurantId: ""
  })

  // UI state
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState({})

  // Cleanup image preview on unmount
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

    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  // Handle input changes
  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  // Handle field blur for validation
  function handleBlur(e) {
    const { name } = e.target
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))
    validateField(name, form[name])
  }

  // Validate single field
  function validateField(name, value) {
    let error = ""

    switch (name) {
      case "name":
        if (!value.trim()) error = "Item name is required"
        else if (value.length < 3) error = "Name must be at least 3 characters"
        else if (value.length > 50) error = "Name must be less than 50 characters"
        break
      case "desc":
        if (!value.trim()) error = "Description is required"
        else if (value.length < 10) error = "Description must be at least 10 characters"
        else if (value.length > 500) error = "Description must be less than 500 characters"
        break
      case "price":
        if (!value.trim()) error = "Price is required"
        else if (isNaN(value) || parseFloat(value) <= 0) error = "Price must be a positive number"
        else if (parseFloat(value) > 10000) error = "Price cannot exceed $10,000"
        break
      case "kcal":
        if (!value.trim()) error = "Calories are required"
        else if (isNaN(value) || parseInt(value) <= 0) error = "Calories must be a positive number"
        else if (parseInt(value) > 5000) error = "Calories cannot exceed 5000"
        break
      case "time":
        if (!value.trim()) error = "Prep time is required"
        else if (isNaN(value) || parseInt(value) <= 0) error = "Prep time must be a positive number"
        else if (parseInt(value) > 240) error = "Prep time cannot exceed 4 hours (240 minutes)"
        break
      default:
        break
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }))

    return !error
  }

  // Validate entire form
  function validateForm() {
    const newErrors = {}
    let isValid = true

    // Validate restaurant selection
    if (!form.restaurantId) {
      newErrors.restaurantId = "Please select a restaurant"
      isValid = false
    }

    // Validate each field
    if (!form.name.trim()) {
      newErrors.name = "Item name is required"
      isValid = false
    } else if (form.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters"
      isValid = false
    }

    if (!form.desc.trim()) {
      newErrors.desc = "Description is required"
      isValid = false
    } else if (form.desc.length < 10) {
      newErrors.desc = "Description must be at least 10 characters"
      isValid = false
    }

    if (!form.price.trim()) {
      newErrors.price = "Price is required"
      isValid = false
    } else if (isNaN(form.price) || parseFloat(form.price) <= 0) {
      newErrors.price = "Price must be a positive number"
      isValid = false
    }

    if (!form.kcal.trim()) {
      newErrors.kcal = "Calories are required"
      isValid = false
    } else if (isNaN(form.kcal) || parseInt(form.kcal) <= 0) {
      newErrors.kcal = "Calories must be a positive number"
      isValid = false
    }

    if (!form.time.trim()) {
      newErrors.time = "Prep time is required"
      isValid = false
    } else if (isNaN(form.time) || parseInt(form.time) <= 0) {
      newErrors.time = "Prep time must be a positive number"
      isValid = false
    }

    if (!imageFile) {
      newErrors.image = "Item image is required"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // Handle image selection
  function handleImageChange(e) {
    const file = e.target.files[0]

    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setMessage({
          text: "Please select a valid image file (JPEG, PNG, WEBP)",
          type: "error"
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({
          text: "Image size should be less than 5MB",
          type: "error"
        })
        return
      }

      setImageFile(file)

      // Create preview URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
      setImagePreview(URL.createObjectURL(file))

      // Clear image error if any
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: ""
        }))
      }
    }
  }

  // Remove selected image
  function handleRemoveImage() {
    setImageFile(null)
    setImagePreview(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
  }

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      setMessage({
        text: "Please fix the errors in the form",
        type: "error"
      })

      // Mark all fields as touched to show errors
      const allTouched = {}
      Object.keys(form).forEach(key => {
        allTouched[key] = true
      })
      setTouched(allTouched)

      return
    }

    setIsSubmitting(true)
    setMessage({ text: "", type: "" })

    try {
      const formData = new FormData()

      // Append form fields
      Object.keys(form).forEach(key => {
        formData.append(key, form[key])
      })

      // Append image
      if (imageFile) {
        formData.append("image", imageFile)
      }

      const res = await fetch(`${API_BASE_URL}/api/menu`, {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      console.log("SERVER RESPONSE:", data)

      if (res.ok) {
        setMessage({
          text: "✅ Menu item added successfully!",
          type: "success"
        })

        // Reset form
        setForm({
          name: "",
          desc: "",
          price: "",
          discount: "0",
          kcal: "",
          time: "",
          category: "burgers",
          categoryId: "",
          foodType: "veg",
          restaurantId: ""
        })
        handleRemoveImage()
        setErrors({})
        setTouched({})

        // Navigate after success
        setTimeout(() => {
          navigate("/menu/main")
        }, 1500)
      } else {
        throw new Error("Failed to add menu item")
      }
    } catch (error) {
      setMessage({
        text: "Error adding menu item. Please try again.",
        type: "error"
      })
      console.error("Submit error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle cancel
  function handleCancel() {
    if (window.confirm("Are you sure you want to cancel? All entered data will be lost.")) {
      navigate("/menu/main")
    }
  }

  return (
    <div className="add-menu-page">

      <div className="add-menu-container">
        <div className="add-menu-header">
          <h1>Add Menu Item</h1>
          <p className="subtitle">Fill in the details to add a new item to your menu</p>
        </div>

        {/* Message display */}
        {message.text && (
          <div className={`message ${message.type}`}>
            <span>{message.text}</span>
            <button
              className="close-btn"
              onClick={() => setMessage({ text: "", type: "" })}
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-menu-form">
          {/* Restaurant Selection */}
          <div className="form-group">
            <label htmlFor="restaurantId">
              Restaurant <span className="required">*</span>
            </label>
            <select
              id="restaurantId"
              name="restaurantId"
              value={form.restaurantId}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            >
              <option value="">Select a restaurant</option>
              {restaurants.map(restaurant => (
                <option key={restaurant._id} value={restaurant._id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>

          {/* Item Name */}
          <div className="form-group">
            <label htmlFor="name">
              Item Name <span className="required">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g., Margherita Pizza"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.name && errors.name ? "error" : ""}
              disabled={isSubmitting}
              maxLength={50}
            />
            {touched.name && errors.name && (
              <span className="error-text">{errors.name}</span>
            )}
            <span className="char-count">
              {form.name.length}/50
            </span>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="desc">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="desc"
              name="desc"
              placeholder="Describe the menu item..."
              value={form.desc}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="4"
              className={touched.desc && errors.desc ? "error" : ""}
              disabled={isSubmitting}
              maxLength={500}
            />
            {touched.desc && errors.desc && (
              <span className="error-text">{errors.desc}</span>
            )}
            <span className="char-count">
              {form.desc.length}/500
            </span>
          </div>

          {/* Price, Discount, Calories Row */}
          <div className="row-3">
            <div className="form-group">
              <label htmlFor="price">
                Price ($) <span className="required">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                max="10000"
                placeholder="0.00"
                value={form.price}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.price && errors.price ? "error" : ""}
                disabled={isSubmitting}
              />
              {touched.price && errors.price && (
                <span className="error-text">{errors.price}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="time">
                Prep Time (minutes) <span className="required">*</span>
              </label>
              <input
                id="time"
                name="time"
                type="number"
                min="1"
                max="240"
                placeholder="e.g., 20"
                value={form.time}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.time && errors.time ? "error" : ""}
                disabled={isSubmitting}
              />
              {touched.time && errors.time && (
                <span className="error-text">{errors.time}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="discount">
                Discount (%)
              </label>
              <input
                id="discount"
                name="discount"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={form.discount}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="kcal">
                Calories <span className="required">*</span>
              </label>
              <input
                id="kcal"
                name="kcal"
                type="number"
                min="0"
                max="5000"
                placeholder="e.g., 450"
                value={form.kcal}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.kcal && errors.kcal ? "error" : ""}
                disabled={isSubmitting}
              />
              {touched.kcal && errors.kcal && (
                <span className="error-text">{errors.kcal}</span>
              )}
            </div>
          </div>

          {/* Category Selection */}
          <div className="form-group">
            <label htmlFor="category">
              Category <span className="required">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

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
              disabled={isSubmitting}
            >
              <option value="">-- Select a category --</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <span className="hint-text">Link this menu item to a category for better organization</span>
          </div>

          {/* Food Type (Veg/Non-Veg) */}
          <div className="form-group">
            <label htmlFor="foodType">
              Food Type <span className="required">*</span>
            </label>
            <div className="food-type-selector">
              <label className={`food-type-option ${form.foodType === 'veg' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="foodType"
                  value="veg"
                  checked={form.foodType === 'veg'}
                  onChange={handleChange}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
                <span className="non-veg-indicator">●</span>
                <span>Non-Vegetarian</span>
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label htmlFor="image">
              Item Image <span className="required">*</span>
            </label>
            <div className="image-upload-container">
              <input
                id="image"
                name="image"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                className={errors.image ? "error" : ""}
                disabled={isSubmitting}
              />

              {imagePreview ? (
                <div className="image-preview-container">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="image-preview"
                  />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📸</span>
                  <span>Click to upload image</span>
                  <span className="hint-text">JPEG, PNG, WEBP (max 5MB)</span>
                </div>
              )}
            </div>
            {errors.image && (
              <span className="error-text">{errors.image}</span>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Adding...
                </>
              ) : (
                "Add Menu Item"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddMenuItem
