import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import API_BASE_URL from "../config"
import "../styles/admin.css"
import "../styles/CreateRestaurant.css"

function EditRestaurant() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: "", location: "", phone: "" })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/restaurants/${id}`)
      .then(r => {
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`)
        }
        return r.json()
      })
      .then(data => {
        if (data.name) {
          setForm({ name: data.name, location: data.location || "", phone: data.phone || "" })
          if (data.image) {
            setCurrentImage(`${API_BASE_URL}/uploads/${data.image}`)
          }
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load restaurant:", err)
        setMessage("❌ Restaurant not found or may have been deleted")
        setLoading(false)
      })
  }, [id])

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
    setSaving(true)
    setMessage("")
    try {
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("location", form.location)
      formData.append("phone", form.phone)
      if (imageFile) {
        formData.append("image", imageFile)
      }

      const res = await fetch(`${API_BASE_URL}/api/restaurants/${id}`, {
        method: "PUT",
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        setMessage("✅ Restaurant updated successfully!")
        setTimeout(() => navigate(-1), 1000)
      } else {
        setMessage("❌ Error: " + data.error)
      }
    } catch {
      setMessage("❌ Failed to connect to backend.")
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>✏️ Edit Restaurant</h1>
          <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
        </div>
        <p className="admin-message">Loading...</p>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>✏️ Edit Restaurant</h1>
        <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
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
          <div className="image-upload-area" onClick={() => document.getElementById("editRestaurantImageInput").click()}>
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="image-preview" />
            ) : currentImage ? (
              <img src={currentImage} alt="Current" className="image-preview" />
            ) : (
              <div className="image-placeholder">
                <span>🏨</span>
                <p>Click to upload restaurant image</p>
                <small>JPG, PNG, WEBP up to 5MB</small>
              </div>
            )}
          </div>
          <input
            id="editRestaurantImageInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditRestaurant
