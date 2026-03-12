import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../components/Header"
import "../styles/home.css"
import "../styles/HomePage.css"

const API_BASE = "http://localhost:5000"

function Home() {
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/restaurants`)
      .then(r => r.json())
      .then(data => {
        setRestaurants(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="home-container">
      <Header />

      <div className="home-section-title">
        <h2>🍽️ Our Restaurants</h2>
        <p>Select a restaurant to view its menu</p>
      </div>

      {loading ? (
        <p className="home-empty">Loading restaurants...</p>
      ) : restaurants.length === 0 ? (
        <p className="home-empty">No restaurants found. Add one from the Admin Panel.</p>
      ) : (
        <div className="categories">
          {restaurants.map((r) => (
            <div
              key={r._id}
              className="card"
              onClick={() => navigate(`/menu?restaurantId=${r._id}`)}
            >
              {r.image ? (
                <img src={`${API_BASE}/uploads/${r.image}`} alt={r.name} />
              ) : (
                <div className="restaurant-card-inner">
                  <span className="restaurant-icon">🏨</span>
                  <h2>{r.name}</h2>
                  {r.location && <p className="location">📍 {r.location}</p>}
                  {r.phone && <p className="phone">📞 {r.phone}</p>}
                </div>
              )}
              {r.image && (
                <div className="overlay">
                  <h2>{r.name}</h2>
                  {r.location && <p>📍 {r.location}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button className="floating-btn">
        Talk to a menu expert →
      </button>

      <button className="admin-floating-btn" onClick={() => navigate("/admin")}>
        🛠️ Admin Panel
      </button>
    </div>
  )
}

export default Home
