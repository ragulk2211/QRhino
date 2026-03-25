import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/admin.css"

function QRGenerator() {
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState([])
  const [selectedRestaurant, setSelectedRestaurant] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/restaurants")
      const data = await res.json()
      setRestaurants(data)
    } catch (error) {
      console.error("Error fetching restaurants:", error)
    }
  }

  const generateQR = async () => {
    if (!selectedRestaurant) {
      setMessage({ type: "error", text: "Please select a restaurant" })
      return
    }

    setIsLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const restaurant = restaurants.find(r => r._id === selectedRestaurant)
      const menuUrl = `${window.location.origin}/menu?restaurant=${selectedRestaurant}`
      
      // Generate QR code using QRServer API or your own endpoint
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`
      setQrCode(qrUrl)
      
      setMessage({ type: "success", text: "QR Code generated successfully!" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to generate QR code" })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadQR = () => {
    if (qrCode) {
      const link = document.createElement('a')
      link.href = qrCode
      link.download = `qr-${selectedRestaurant}.png`
      link.click()
    }
  }

  const selectedRestaurantData = restaurants.find(r => r._id === selectedRestaurant)

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate("/admin")}>
            ← Back
          </button>
          <div className="header-content">
            <h1>Generate QR Code</h1>
            <p>Create a QR code for your restaurant menu</p>
          </div>
        </div>

        <div className="qr-generator-wrapper">
          <div className="form-card qr-form">
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
              <label>Select Restaurant</label>
              <select
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="restaurant-select"
              >
                <option value="">Choose a restaurant</option>
                {restaurants.map(restaurant => (
                  <option key={restaurant._id} value={restaurant._id}>
                    {restaurant.name} — {restaurant.location || "Location not set"}
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={generateQR} 
              className="btn-primary generate-btn"
              disabled={isLoading || !selectedRestaurant}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Generating...
                </>
              ) : (
                "Generate QR Code"
              )}
            </button>
          </div>

          {qrCode && (
            <div className="qr-result-card">
              <div className="qr-header">
                <h3>Your QR Code</h3>
                <p>Scan to view {selectedRestaurantData?.name} menu</p>
              </div>
              <div className="qr-display">
                <img src={qrCode} alt="QR Code" className="qr-image" />
              </div>
              <div className="qr-actions">
                <button className="btn-secondary" onClick={downloadQR}>
                  📥 Download QR Code
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => window.open(qrCode, '_blank')}
                >
                  🔍 View Full Size
                </button>
              </div>
              <div className="qr-info">
                <small>Scan this QR code with your phone camera to access the menu</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QRGenerator