// Centralized API configuration
// Use environment variables in production, fallback to localhost for development

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  UPLOADS: `${API_BASE_URL}/uploads`,
  RESTAURANTS: `${API_BASE_URL}/api/restaurants`,
  MENU: `${API_BASE_URL}/api/menu`,
  MENU_FEATURED: `${API_BASE_URL}/api/menu/featured`,
  ORDERS: `${API_BASE_URL}/api/orders`,
  ORDER_CREATE: `${API_BASE_URL}/api/orders/create`,
  ORDERS_ALL: `${API_BASE_URL}/api/orders/all`,
};

export default API_BASE_URL;
