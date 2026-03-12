import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Header from "../components/Header"
import "../styles/addmenu.css"
import "../styles/AddFoodMenu.css"

function AddMenuItem() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const restaurantId = searchParams.get("restaurantId")

  const [form, setForm] = useState({
    name: "",
    desc: "",
    price: "",
    kcal: "",
    time: "",
    category: ""
  })
  const [categories, setCategories] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    const url = restaurantId
      ? `http://localhost:5000/api/categories?restaurantId=${restaurantId}`
      : "http://localhost:5000/api/categories"
    fetch(url)
      .then(r => r.json())
      .then(data => {
        setCategories(data)
        if (data.length > 0) {
          setForm(prev => ({ ...prev, category: data[0].name }))
        }
      })
      .catch(() => {
        const fallback = ["burgers", "arabic-food", "starters", "soups", "salad"]
        setCategories(fallback.map(n => ({ name: n })))
        setForm(prev => ({ ...prev, category: "burgers" }))
      })
  }, [restaurantId])

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
      formData.append("desc", form.desc)
      formData.append("price", form.price)
      formData.append("kcal", form.kcal)
      formData.append("time", form.time)
      formData.append("category", form.category)
      if (restaurantId) {
        formData.append("restaurantId", restaurantId)
      }
      if (imageFile) {
        formData.append("image", imageFile)
      }

      const res = await fetch("http://localhost:5000/menu", {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setMessage("✅ Menu item added successfully!")
        setForm({ name: "", desc: "", price: "", kcal: "", time: "", category: categories[0]?.name || "" })
        setImageFile(null)
        setImagePreview(null)
        setDone(true)
      } else {
        setMessage("❌ Error: " + data.error)
      }
    } catch (err) {
      setMessage("❌ Failed to connect to server. Make sure backend is running on port 5000.")
    }

    setLoading(false)
  }

  return (
    <div className="add-menu-page">
      <Header />
      <div className="add-menu-container">
        <h1>Add Menu Item</h1>

        {message && <p className="add-menu-message">{message}</p>}

        <form onSubmit={handleSubmit} className="add-menu-form">
          <div className="form-group">
            <label>Item Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Cheese Burger"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              name="desc"
              value={form.desc}
              onChange={handleChange}
              placeholder="e.g. Juicy beef patty with cheese"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (₹)</label>
              <input
                type="text"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 199"
              />
            </div>

            <div className="form-group">
              <label>Calories (kcal)</label>
              <input
                type="text"
                name="kcal"
                value={form.kcal}
                onChange={handleChange}
                placeholder="e.g. 350"
              />
            </div>

            <div className="form-group">
              <label>Prep Time</label>
              <input
                type="text"
                name="time"
                value={form.time}
                onChange={handleChange}
                placeholder="e.g. 15 min"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={form.category} onChange={handleChange} required>
              {categories.map((cat, i) => (
                <option key={i} value={cat.name}>
                  {cat.name.charAt(0).toUpperCase() + cat.name.slice(1).replace(/-/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Item Image</label>
            <div className="image-upload-area" onClick={() => document.getElementById("imageInput").click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="image-preview" />
              ) : (
                <div className="image-placeholder">
                  <span>📷</span>
                  <p>Click to upload image</p>
                  <small>JPG, PNG, WEBP up to 5MB</small>
                </div>
              )}
            </div>
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Adding..." : "Add Item"}
            </button>
            {done && (
              <button type="button" className="btn-submit" style={{ background: "#27ae60" }} onClick={() => navigate(`/admin/qr-generator?restaurantId=${restaurantId || ""}`)}>
                Next: Generate QR →
              </button>
            )}
            <button type="button" className="btn-back" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddMenuItem
