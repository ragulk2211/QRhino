import { useNavigate } from "react-router-dom"
import "../styles/foodmodal.css"

function FoodModal({ item, onClose, onDelete }) {
  const navigate = useNavigate()

  function handleEdit() {
    navigate(`/edit-item/${item._id}`)
  }

  function handleRemove() {
    onDelete(item._id)
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="modal-left">
          <img
            src={
              item.image
                ? `http://localhost:5000${item.image}`
                : "/images/default-food.png"
            }
            alt={item.name}
          />
        </div>

        <div className="modal-right">
          <h2>{item.name}</h2>

          <p>{item.desc}</p>

          <h3>₹{item.price}</h3>

          <div className="modal-actions">
            <button className="edit-btn" onClick={handleEdit}>
              Edit
            </button>

            <button className="remove-btn" onClick={handleRemove}>
              Remove
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default FoodModal