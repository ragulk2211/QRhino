import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import "../styles/admin.css"
import "../styles/AdminDashboard.css"

function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    restaurants: 0,
    categories: 0,
    menuItems: 0,
    qrCodes: 0
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
    fetchRecentActivities()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const restaurantsRes = await fetch("http://localhost:5000/api/restaurants")
      const restaurants = await restaurantsRes.json()
      
      const menuRes = await fetch("http://localhost:5000/api/menu")
      const menuItems = await menuRes.json()
      
      const categories = [...new Set(menuItems.map(item => item.category))].length

      setStats({
        restaurants: restaurants.length || 0,
        categories: categories || 0,
        menuItems: menuItems.length || 0,
        qrCodes: restaurants.length || 0
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRecentActivities = async () => {
    const activities = [
      { id: 1, action: "New restaurant added", time: "2 minutes ago", type: "success" },
      { id: 2, action: "Menu item updated", time: "15 minutes ago", type: "info" },
      { id: 3, action: "QR code generated", time: "1 hour ago", type: "warning" },
      { id: 4, action: "Category created", time: "3 hours ago", type: "success" }
    ]
    setRecentActivities(activities)
  }

  const actions = [
    { 
      label: "Create Restaurant", 
      path: "/admin/create-restaurant", 
      desc: "Add a new restaurant to the system",
      icon: "🏨",
      gradient: "linear-gradient(135deg, #2c2c2c, #1a1a1a)"
    },
    { 
      label: "Create Category",   
      path: "/admin/create-category",   
      desc: "Add a new menu category",
      icon: "📂",
      gradient: "linear-gradient(135deg, #2c2c2c, #1a1a1a)"
    },
    { 
      label: "Add Food Menu",     
      path: "/add-item",                 
      desc: "Add a new food item with image",
      icon: "🍔",
      gradient: "linear-gradient(135deg, #2c2c2c, #1a1a1a)"
    },
    { 
      label: "Generate QR Code",  
      path: "/admin/qr-generator",       
      desc: "Generate QR code for a menu page",
      icon: "📱",
      gradient: "linear-gradient(135deg, #2c2c2c, #1a1a1a)"
    },
  ]

  const StatCard = ({ title, value, icon, trend }) => (
    <div className="stat-card">
      <div className="stat-icon">
        {icon}
      </div>
      <div className="stat-info">
        <h3>{title}</h3>
        <div className="stat-value">
          {isLoading ? <div className="stat-skeleton"></div> : value}
        </div>
        {trend && <span className="stat-trend">{trend}</span>}
      </div>
    </div>
  )

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-left">
            <div className="header-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H21V5H3V3Z" fill="currentColor"/>
                <path d="M5 7H19V9H5V7Z" fill="currentColor"/>
                <path d="M7 11H17V13H7V11Z" fill="currentColor"/>
                <path d="M9 15H15V17H9V15Z" fill="currentColor"/>
                <path d="M11 19H13V21H11V19Z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h1>Admin Dashboard</h1>
              <p>Manage your QR Restaurant System</p>
            </div>
          </div>
          <button className="btn-home" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard 
            title="Total Restaurants" 
            value={stats.restaurants} 
            icon="🏨"
            trend="+2 this week"
          />
          <StatCard 
            title="Categories" 
            value={stats.categories} 
            icon="📂"
            trend="+5 new"
          />
          <StatCard 
            title="Menu Items" 
            value={stats.menuItems} 
            icon="🍔"
            trend="+12 added"
          />
          <StatCard 
            title="QR Codes" 
            value={stats.qrCodes} 
            icon="📱"
            trend="Active"
          />
        </div>

        {/* Quick Actions Section */}
        <div className="quick-actions-section">
          <div className="section-title">
            <h2>Quick Actions</h2>
            <p>Manage your restaurant content</p>
          </div>
          <div className="actions-grid">
            {actions.map((action, i) => (
              <div 
                key={i} 
                className="action-card"
                onClick={() => navigate(action.path)}
              >
                <div className="action-icon">{action.icon}</div>
                <div className="action-content">
                  <h3>{action.label}</h3>
                  <p>{action.desc}</p>
                  <span className="action-link">Get started →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="recent-activity-section">
          <div className="section-title">
            <h2>Recent Activity</h2>
            <p>Latest updates from your system</p>
          </div>
          <div className="activity-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className={`activity-item ${activity.type}`}>
                <div className="activity-dot"></div>
                <div className="activity-details">
                  <div className="activity-action">{activity.action}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="view-all-btn" onClick={() => navigate("/admin/activities")}>
            View All Activities
          </button>
        </div>

        {/* Quick Tips */}
        <div className="quick-tips-section">
          <div className="section-title">
            <h2>Quick Tips</h2>
            <p>Get the most out of your admin panel</p>
          </div>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon">📸</div>
              <p>Add high-quality images to your menu items for better engagement</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">🏷️</div>
              <p>Organize items with proper categories for easy navigation</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">📊</div>
              <p>Generate QR codes for each restaurant to track performance</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">🎯</div>
              <p>Regularly update menu items to keep customers engaged</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard