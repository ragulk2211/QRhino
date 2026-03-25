import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import API_BASE_URL from "../config"
import "../styles/admin.css"

function CouponManagement() {
  const navigate = useNavigate()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountPercent: 10,
    minOrderAmount: 0,
    maxDiscountAmount: "",
    isActive: true,
    maxUsage: ""
  })
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons`)
      const data = await response.json()
      if (data.success) {
        setCoupons(data.coupons)
      }
    } catch (error) {
      console.error("Error fetching coupons:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        discountPercent: Number(formData.discountPercent),
        minOrderAmount: Number(formData.minOrderAmount),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        maxUsage: formData.maxUsage ? Number(formData.maxUsage) : null
      }

      const response = await fetch(`${API_BASE_URL}/api/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (data.success) {
        setMessage("Coupon created successfully!")
        setShowForm(false)
        setFormData({
          code: "",
          description: "",
          discountPercent: 10,
          minOrderAmount: 0,
          maxDiscountAmount: "",
          isActive: true,
          maxUsage: ""
        })
        fetchCoupons()
      } else {
        setMessage(data.message)
      }
    } catch (error) {
      setMessage("Error creating coupon")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons/${id}`, {
        method: "DELETE"
      })
      const data = await response.json()
      if (data.success) {
        fetchCoupons()
      }
    } catch (error) {
      console.error("Error deleting coupon:", error)
    }
  }

  const handleSeed = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons/seed`, {
        method: "POST"
      })
      const data = await response.json()
      if (data.success) {
        setMessage("Default coupons seeded!")
        fetchCoupons()
      }
    } catch (error) {
      console.error("Error seeding coupons:", error)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>🎟️ Coupon Management</h1>
        <button className="btn-back" onClick={() => navigate("/admin")}>← Back to Admin</button>
      </div>

      {message && (
        <div className="admin-message" style={{ marginBottom: "20px" }}>
          {message}
          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: "10px 20px", background: "#2e7d32", color: "white", border: "none", borderRadius: "5px" }}
        >
          {showForm ? "Cancel" : "+ Create New Coupon"}
        </button>
        <button
          onClick={handleSeed}
          style={{ padding: "10px 20px", background: "#1976d2", color: "white", border: "none", borderRadius: "5px" }}
        >
          Seed Default Coupons
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form" style={{ marginBottom: "30px", padding: "20px", background: "#f5f5f5", borderRadius: "8px" }}>
          <div className="form-group">
            <label>Coupon Code *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. SAVE20"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description for this coupon"
            />
          </div>

          <div className="form-group">
            <label>Discount (%) *</label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.discountPercent}
              onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Minimum Order Amount</label>
            <input
              type="number"
              min="0"
              value={formData.minOrderAmount}
              onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Maximum Discount Amount</label>
            <input
              type="number"
              min="0"
              value={formData.maxDiscountAmount}
              onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
              placeholder="Leave empty for no limit"
            />
          </div>

          <div className="form-group">
            <label>Maximum Usage (leave empty for unlimited)</label>
            <input
              type="number"
              min="1"
              value={formData.maxUsage}
              onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Active
            </label>
          </div>

          <button type="submit" style={{ padding: "10px 20px", background: "#2e7d32", color: "white", border: "none", borderRadius: "5px" }}>
            Create Coupon
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : coupons.length === 0 ? (
        <p>No coupons found. Create one or seed default coupons.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: "10px", textAlign: "left" }}>Code</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Description</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Discount</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Min Order</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Usage</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}><strong>{coupon.code}</strong></td>
                <td style={{ padding: "10px" }}>{coupon.description}</td>
                <td style={{ padding: "10px" }}>{coupon.discountPercent}%</td>
                <td style={{ padding: "10px" }}>₹{coupon.minOrderAmount}</td>
                <td style={{ padding: "10px" }}>{coupon.usageCount}{coupon.maxUsage ? `/${coupon.maxUsage}` : "/∞"}</td>
                <td style={{ padding: "10px" }}>
                  <span style={{ 
                    padding: "3px 8px", 
                    borderRadius: "3px",
                    background: coupon.isActive ? "#4caf50" : "#f44336",
                    color: "white"
                  }}>
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "10px" }}>
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    style={{ padding: "5px 10px", background: "#f44336", color: "white", border: "none", borderRadius: "3px" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default CouponManagement
