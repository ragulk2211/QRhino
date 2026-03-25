import { useNavigate } from "react-router-dom"
import "../styles/admin.css"
import "../styles/AdminDashboard.css"

function AdminDashboard() {
  const navigate = useNavigate()

  const actions = [
    { label: "🏨 Create Restaurant", path: "/admin/create-restaurant", desc: "Add a new restaurant to the system" },
    { label: "📂 Create Category",   path: "/admin/create-category",   desc: "Add a new menu category" },
    { label: "🍔 Add Food Menu",     path: "/add-item",                 desc: "Add a new food item with image" },
    { label: "📱 Generate QR Code",  path: "/admin/qr-generator",       desc: "Generate QR code for a menu page" },
    { label: "🎟️ Manage Coupons",    path: "/admin/coupons",           desc: "Create and manage discount coupons" },
  ]

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>🛠️ Admin Panel</h1>
        <p>Manage your QR Restaurant System</p>
        <button className="btn-back" onClick={() => navigate("/")}>← Back to Home</button>
      </div>

      <div className="admin-grid">
        {actions.map((action, i) => (
          <div key={i} className="admin-card" onClick={() => navigate(action.path)}>
            <h2>{action.label}</h2>
            <p>{action.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboard
