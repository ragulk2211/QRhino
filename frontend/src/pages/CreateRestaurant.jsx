import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/admin.css"

function CreateRestaurant() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    phone: ""
  })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image size should be less than 5MB" })
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Please enter restaurant name" })
      return
    }

    setIsLoading(true)
    setMessage({ type: "", text: "" })

    try {
      // Implement your restaurant creation logic here
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("location", formData.location)
      formDataToSend.append("phone", formData.phone)
      if (image) {
        formDataToSend.append("image", image)
      }

      // const res = await fetch("http://localhost:5000/api/restaurants", {
      //   method: "POST",
      //   body: formDataToSend
      // })

      setTimeout(() => {
        setMessage({ type: "success", text: "Restaurant created successfully!" })
        setFormData({ name: "", location: "", phone: "" })
        setImage(null)
        setImagePreview("")
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create restaurant" })
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate("/admin")}>
            ← Back to Admin
          </button>
          <div className="header-content">
            <h1>Create Restaurant</h1>
            <p>Add a new restaurant to your platform</p>
          </div>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            {message.text && (
              <div className={`alert-message ${message.type}`}>
                <span className="alert-icon">
                  {message.type === "success" ? "✓" : "⚠️"}
                </span>
                <span>{message.text}</span>
                <button 
                  className="alert-close"
                  onClick={() => setMessage({ type: "", text: "" })}
                >
                  ×
                </button>
              </div>
            )}

            <div className="form-group">
              <label className="required">Restaurant Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Pizza Palace"
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Bangalore"
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g., 9876543210"
              />
            </div>

            <div className="form-group">
              <label>Restaurant Image</label>
              <div className="image-upload-area">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  id="restaurant-image"
                  hidden
                />
                <label htmlFor="restaurant-image" className="upload-label">
                  {imagePreview ? (
                    <div className="image-preview-container">
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                      <div className="change-image-overlay">
                        <span>Click to change</span>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📸</span>
                      <span>Click to upload restaurant image</span>
                      <small>JPG, PNG, WEBP up to 5MB</small>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                "Create Restaurant"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateRestaurant