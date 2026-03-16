import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/admin.css"
import "../styles/CreateRestaurant.css"

function CreateRestaurant() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: "", location: "", phone: "" })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    try {
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("location", form.location)
      formData.append("phone", form.phone)
      if (imageFile) {
        formData.append("image", imageFile)
      }

      const res = await fetch("http://localhost:5000/api/restaurants", {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        setMessage("✅ Restaurant created: " + data.name)
        setForm({ name: "", location: "", phone: "" })
        setImageFile(null)
        setImagePreview(null)
        setTimeout(() => navigate("/admin/create-category"), 1000)
      } else {
        setMessage("❌ Error: " + data.error)
      }
    } catch {
      setMessage("❌ Failed to connect to backend.")
    }
    setLoading(false)
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>🏨 Create Restaurant</h1>
        <button className="btn-back" onClick={() => navigate("/admin")}>← Back to Admin</button>
      </div>

      {message && <p className="admin-message">{message}</p>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Restaurant Name *</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Pizza Palace" required />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bangalore" />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 9876543210" />
        </div>
        <div className="form-group">
          <label>Restaurant Image</label>
          <div className="image-upload-area" onClick={() => document.getElementById("restaurantImageInput").click()}>
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="image-preview" />
            ) : (
              <div className="image-placeholder">
                <span>🏨</span>
                <p>Click to upload restaurant image</p>
                <small>JPG, PNG, WEBP up to 5MB</small>
              </div>
            )}
          </div>
          <input
            id="restaurantImageInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Creating..." : "Create Restaurant"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateRestaurant
