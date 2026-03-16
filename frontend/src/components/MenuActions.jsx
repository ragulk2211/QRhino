import { useNavigate } from "react-router-dom"

function MenuActions() {
  const navigate = useNavigate()

  return (
    <div className="menu-buttons">

      <button
        className="add-btn"
        onClick={() => navigate("/add-item")}
      >
        + Add Menu Item
      </button>

      <button className="remove-btn">
        − Remove Menu Item
      </button>

    </div>
  )
}

export default MenuActions