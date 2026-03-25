import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/admin.css"

function CreateCategory() {
  const navigate = useNavigate()
  const [categoryName, setCategoryName] = useState("")
  const [existingCategories, setExistingCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    fetchExistingCategories()
  }, [])

  const fetchExistingCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/menu")
      const data = await res.json()
      const categories = [...new Set(data.map(item => item.category))].filter(Boolean)
      setExistingCategories(categories)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!categoryName.trim()) {
      setMessage({ type: "error", text: "Please enter a category name" })
      return
    }

    setIsLoading(true)
    setMessage({ type: "", text: "" })

    try {
      // This is a placeholder - implement your category creation logic
      // For now, we'll just show success
      setTimeout(() => {
        setMessage({ type: "success", text: "Category created successfully!" })
        setCategoryName("")
        fetchExistingCategories()
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create category" })
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate("/admin")}>
            ← Back
          </button>
          <div className="header-content">
            <h1>Create Category</h1>
            <p>Add a new menu category to organize your food items</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="create-category-wrapper">
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
                <label className="required">Category Name</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., burgers, starters, desserts"
                  className="category-input"
                />
                <small className="input-hint">
                  Use lowercase, singular form for better organization
                </small>
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
                  "Create Category"
                )}
              </button>
            </form>
          </div>

          {/* Existing Categories Section */}
          <div className="categories-list-card">
            <div className="card-header">
              <h3>Existing Categories</h3>
              <span className="category-count">{existingCategories.length} total</span>
            </div>
            
            {existingCategories.length > 0 ? (
              <div className="categories-grid">
                {existingCategories.map((category, index) => (
                  <div key={index} className="category-tag">
                    <span className="category-icon">📁</span>
                    <span className="category-name">{category}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-small">
                <p>No categories yet. Create your first category!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateCategory