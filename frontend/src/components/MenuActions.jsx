import { useNavigate } from "react-router-dom";
import "../styles/MenuActions.css";

function MenuActions() {
  const navigate = useNavigate();

  return (
    <div className="menu-actions-container">
      <div className="menu-actions-wrapper">
        <button
          className="action-btn add-menu-btn"
          onClick={() => navigate("/add-item")}
        >
          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 4v16M4 12h16" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="btn-text">Add Menu Item</span>
        </button>

        <button
          className="action-btn remove-menu-btn"
          onClick={() => navigate("/remove-item")}
        >
          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 12h16" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="btn-text">Remove Menu Item</span>
        </button>
      </div>
    </div>
  );
}

export default MenuActions;