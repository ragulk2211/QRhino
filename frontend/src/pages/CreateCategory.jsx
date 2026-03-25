import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import API_BASE_URL from "../config"
import "../styles/admin.css"
import "../styles/CreateCategory.css"

function CreateCategory() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const restaurantId = searchParams.get("restaurantId")
  const [name, setName] = useState("")
  const [categories, setCategories] = useState([])
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const url = restaurantId
      ? `${API_BASE_URL}/api/categories?restaurantId=${restaurantId}`
      : `${API_BASE_URL}/api/categories`
    fetch(url)
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {})
  }, [restaurantId])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, restaurantId })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage("✅ Category created: " + data.name)
        setCategories(prev => [...prev, data])
        setName("")
        setDone(true)
      } else {
        setMessage("❌ Error: " + data.error)
      }
    } catch {
      setMessage("❌ Failed to connect to backend.")
    }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this category?")) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, { method: "DELETE" })
      if (res.ok) {
        setCategories(categories.filter(c => c._id !== id))
        setMessage("✅ Category deleted")
      } else {
        setMessage("❌ Failed to delete category")
      }
    } catch {
      setMessage("❌ Failed to connect to backend")
    }
  }

  async function handleEdit(id, currentName) {
    const newName = prompt("Edit category name:", currentName)
    if (!newName || newName === currentName) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName })
      })
      if (res.ok) {
        setCategories(categories.map(c => c._id === id ? { ...c, name: newName } : c))
        setMessage("✅ Category updated")
      } else {
        setMessage("❌ Failed to update category")
      }
    } catch {
      setMessage("❌ Failed to connect to backend")
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>📂 Create Category</h1>
        <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
      </div>

      {message && <p className="admin-message">{message}</p>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Category Name *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. burgers, starters, desserts"
            required
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Creating..." : "Create Category"}
          </button>
          {done && (
            <button type="button" className="btn-submit" style={{ background: "#27ae60" }} onClick={() => navigate(`/admin/add-item?restaurantId=${restaurantId || ""}`)}>
              Next: Add Food Menu →
            </button>
          )}
        </div>
      </form>

      {categories.length > 0 && (
        <div className="admin-list">
          <h3>Existing Categories</h3>
          <ul>
            {categories.map((cat) => (
              <li key={cat._id}>
                <span>{cat.name}</span>
                <div style={{ display: "flex", gap: "0.5rem", marginLeft: "auto" }}>
                  <button onClick={() => handleEdit(cat._id, cat.name)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "0.9rem" }}>✏️</button>
                  <button onClick={() => handleDelete(cat._id)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "0.9rem" }}>🗑️</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default CreateCategory
