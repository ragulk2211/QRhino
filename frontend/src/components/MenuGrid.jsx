import React, { useState, useEffect } from 'react'
import FoodCard from './FoodCard'
import '../styles/foodcard.css'

const MenuGrid = ({ items, onCartUpdate }) => {
  const [menuItems, setMenuItems] = useState(items || [])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMenuItems(items)
  }, [items])

  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="food-grid-container">
        <div className="menu-section-header">
          <h2 className="menu-section-title">Our Menu</h2>
          <p className="menu-section-subtitle">Delicious dishes waiting for you</p>
        </div>
        <div className="no-items">
          <p>No items available at the moment.</p>
          <p>Please check back later!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="food-grid-container">
      <div className="menu-section-header">
        <h2 className="menu-section-title">Our Special Menu</h2>
        <p className="menu-section-subtitle">Handcrafted with love and fresh ingredients</p>
      </div>
      
      <div className="food-grid">
        {menuItems.map((item, index) => (
          <FoodCard
            key={item._id || index}
            item={item}
            onCartUpdate={onCartUpdate}
          />
        ))}
      </div>
    </div>
  )
}

export default MenuGrid