import { useState, useEffect } from "react";
import "../styles/toast.css";

function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Expose toast functions globally
  useEffect(() => {
    window.toast = {
      success: (message) => addToast({ type: "success", message }),
      error: (message) => addToast({ type: "error", message }),
      info: (message) => addToast({ type: "info", message }),
      warning: (message) => addToast({ type: "warning", message }),
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => removeToast(t.id)}>
          <div className="toast-icon">
            {t.type === "success" && "✓"}
            {t.type === "error" && "✕"}
            {t.type === "info" && "ℹ"}
            {t.type === "warning" && "⚠"}
          </div>
          <div className="toast-message">{t.message}</div>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
