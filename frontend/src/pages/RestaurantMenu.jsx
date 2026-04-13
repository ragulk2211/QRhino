import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/restaurantMenu.css";

function RestaurantMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const restaurantId = queryParams.get("restaurant");

  const [restaurant, setRestaurant] = useState(null);
  const [menuCategories, setMenuCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch restaurant details and menu categories
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        // Simulated data - replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data based on your screenshots
        const mockRestaurant = {
          id: restaurantId,
          name: "il frutto",
          tagline: "A TASTE OF HOME",
          cuisine: "Italian",
          rating: 4.5,
          reviews: 120,
          location: "Downtown",
          image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format"
        };

        const mockCategories = [
          {
            id: 1,
            name: "Main courses",
            description: "Hearty plates for every craving",
            icon: "🍝",
            color: "#e8c9a0"
          },
          {
            id: 2,
            name: "Breakfast",
            description: "Morning favorites to start fresh",
            icon: "🍳",
            color: "#d9b48b"
          },
          {
            id: 3,
            name: "Pizza",
            description: "Hand tossed pies with bold toppings",
            icon: "🍕",
            color: "#c69c6d"
          },
          {
            id: 4,
            name: "Desserts",
            description: "Sweet bites to treat yourself",
            icon: "🍰",
            color: "#b89a78"
          },
          {
            id: 5,
            name: "Beverages",
            description: "Cool drinks to refresh your day",
            icon: "🥂",
            color: "#a07f5e"
          }
        ];

        setRestaurant(mockRestaurant);
        setMenuCategories(mockCategories);
        setError(null);
      } catch (err) {
        setError("Failed to load restaurant menu");
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchRestaurantData();
    }
  }, [restaurantId]);

  const handleCategoryClick = (categoryId, categoryName) => {
    navigate(`/menu/items?restaurant=${restaurantId}&category=${categoryId}&name=${encodeURIComponent(categoryName)}`);
  };

  const handleExpertClick = () => {
    // Navigate to expert consultation or open modal
    console.log("Talk to expert clicked");
  };

  if (loading) {
    return (
      <div className="restaurant-menu-container">
        <div className="loading-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-categories">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton-category"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="restaurant-menu-container">
        <div className="error-state">
          <p>{error || "Restaurant not found"}</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-menu-container">
      {/* Hero Section with Restaurant Image */}
      <div className="restaurant-hero">
        <img 
          src={restaurant.image} 
          alt={restaurant.name}
          className="restaurant-hero-image"
        />
        <div className="restaurant-hero-overlay"></div>
        
        {/* Back Button */}
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {/* Restaurant Info */}
        <div className="restaurant-info">
          <span className="restaurant-tagline">{restaurant.tagline}</span>
          <h1 className="restaurant-name">{restaurant.name}</h1>
          <div className="restaurant-cuisine">
            <span className="cuisine-badge">{restaurant.cuisine}</span>
          </div>
          <div className="restaurant-meta">
            <span className="rating">⭐ {restaurant.rating}</span>
            <span className="reviews">({restaurant.reviews}+ reviews)</span>
            <span className="location">📍 {restaurant.location}</span>
          </div>
        </div>
      </div>

      {/* Menu Categories Section */}
      <div className="menu-categories-section">
        <h2 className="categories-title">Explore Our Menu</h2>
        
        <div className="categories-grid">
          {menuCategories.map((category) => (
            <div
              key={category.id}
              className="category-card"
              onClick={() => handleCategoryClick(category.id, category.name)}
              style={{ '--category-color': category.color }}
            >
              <div className="category-icon-wrapper">
                <span className="category-icon">{category.icon}</span>
              </div>
              <div className="category-content">
                <h3 className="category-name">{category.name}</h3>
                <p className="category-description">{category.description}</p>
              </div>
              <button className="category-arrow">→</button>
            </div>
          ))}
        </div>

        {/* Talk to Expert Section */}
        <div className="expert-section">
          <button className="expert-button" onClick={handleExpertClick}>
            Talk to a menu expert
          </button>
          <p className="expert-text">
            Get personalized recommendations from our culinary experts
          </p>
        </div>
      </div>
    </div>
  );
}

export default RestaurantMenu;