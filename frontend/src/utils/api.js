const API_BASE_URL = "http://localhost:5000";

// Toast notification function - will be imported lazily to avoid circular dependencies
let showToast = null;
const setToastFn = (fn) => { showToast = fn; };

// Initialize toast from the global window object if available
if (typeof window !== 'undefined') {
  window.__setToastFn = setToastFn;
}

const showErrorToast = (message = "Backend server is not connected. Please start the backend server and try again.") => {
  if (showToast) {
    showToast({ type: "error", message });
  } else if (typeof window !== 'undefined' && window.__setToastFn) {
    window.__setToastFn(({ type, message }) => {
      // Fallback to alert if toast not ready
      alert(message);
    });
  } else {
    // Fallback to browser alert
    alert(message);
  }
};

export const api = {
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      showErrorToast();
      throw error;
    }
  },

  async post(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error posting to ${endpoint}:`, error);
      showErrorToast();
      throw error;
    }
  },

  async put(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error putting to ${endpoint}:`, error);
      showErrorToast();
      throw error;
    }
  },

  async delete(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error deleting ${endpoint}:`, error);
      showErrorToast();
      throw error;
    }
  },
};

export default api;
