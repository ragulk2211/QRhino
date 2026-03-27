import { useEffect, useState } from "react";
import {
  Typography
} from "antd";
import {
  ReloadOutlined,
  FireOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TableOutlined,
  OrderedListOutlined,
  DollarOutlined,
  SmileOutlined,
  CoffeeOutlined
} from "@ant-design/icons";
import API_BASE_URL from "../config";
import "../styles/kitchen.css";

const { Title, Text } = Typography;

function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preparingTimes, setPreparingTimes] = useState({});

  const fetchOrders = () => {
    fetch(`${API_BASE_URL}/api/orders/all`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setOrders(data))
      .catch(err => {
        console.error("Error fetching orders:", err);
      });
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId, newStatus, preparingTime) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: newStatus,
          preparingTime: preparingTime || 15
        })
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "Pending":
        return { color: "orange", icon: <ClockCircleOutlined />, text: "Pending", class: "pending" };
      case "Preparing":
        return { color: "processing", icon: <FireOutlined />, text: "Preparing", class: "preparing" };
      case "Ready":
        return { color: "success", icon: <CheckCircleOutlined />, text: "Ready", class: "ready" };
      case "Completed":
        return { color: "default", icon: <CheckCircleOutlined />, text: "Completed", class: "completed" };
      default:
        return { color: "default", icon: <ClockCircleOutlined />, text: status, class: "pending" };
    }
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const preparingOrders = orders.filter(o => o.status === "Preparing").length;
  const readyOrders = orders.filter(o => o.status === "Ready").length;

  const activeOrders = orders.filter(o => o.status !== "Completed");

  return (
    <div className="kitchen-container">
      {/* Header Section */}
      <div className="kitchen-header">
        <div>
          <h1 className="kitchen-title">
            <CoffeeOutlined /> Kitchen Dashboard
          </h1>
          <p className="kitchen-subtitle">Manage and track all incoming orders</p>
        </div>
        <button className="refresh-btn" onClick={fetchOrders}>
          <ReloadOutlined /> Refresh Orders
        </button>
      </div>

      {/* Statistics Section */}
      <div className="kitchen-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <OrderedListOutlined />
          </div>
          <div className="stat-info">
            <h3>{totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <ClockCircleOutlined />
          </div>
          <div className="stat-info">
            <h3>{pendingOrders}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon preparing">
            <FireOutlined />
          </div>
          <div className="stat-info">
            <h3>{preparingOrders}</h3>
            <p>Preparing</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon ready">
            <CheckCircleOutlined />
          </div>
          <div className="stat-info">
            <h3>{readyOrders}</h3>
            <p>Ready</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      )}

      {/* Empty State */}
      {orders.length === 0 && !loading && (
        <div className="empty-state">
          <CoffeeOutlined style={{ fontSize: 64 }} />
          <h3>No Orders Yet</h3>
          <p>New orders will appear here automatically</p>
        </div>
      )}

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="orders-grid">
          {activeOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            return (
              <div key={order._id} className={`order-card ${statusConfig.class}`}>
                {/* Order Header */}
                <div className="order-header">
                  <div className="order-token">
                    <span>Token</span>
                    <strong>#{order.tokenNumber}</strong>
                  </div>
                  <div className="order-table">
                    <TableOutlined /> Table {order.tableNumber || "N/A"}
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`status-badge ${statusConfig.class}`}>
                  {statusConfig.icon} {statusConfig.text}
                </span>

                {/* Order Items - Scrollable */}
                <div className="order-items">
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <span className="item-name">
                        {item.name}
                        {item.specialInstructions && (
                          <span className="item-note"> ({item.specialInstructions})</span>
                        )}
                      </span>
                      <span className="item-quantity">x{item.quantity || 1}</span>
                      <span className="item-price">₹{item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Prep Time Input */}
                <div className="preparing-time">
                  <label><ClockCircleOutlined /> Prep Time:</label>
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={preparingTimes[order._id] || order.preparingTime || 15}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val > 0) {
                        setPreparingTimes({ ...preparingTimes, [order._id]: val });
                      }
                    }}
                  />
                  <span>min</span>
                </div>

                {/* Order Footer */}
                <div className="order-footer">
                  <span className="order-total">
                    <DollarOutlined /> Total: ₹{order.total}
                  </span>
                  <span className="order-time">
                    <ClockCircleOutlined /> {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                {/* Action Buttons - Order: Preparing first, then Ready, then Complete */}
                <div className="order-actions">
                  {/* Preparing Button - Always first */}
                  {order.status !== "Preparing" && order.status !== "Ready" && order.status !== "Completed" && (
                    <button
                      className="btn-status btn-preparing"
                      onClick={() => updateStatus(order._id, "Preparing", preparingTimes[order._id] || order.preparingTime || 15)}
                      disabled={loading}
                    >
                      <FireOutlined /> Preparing
                    </button>
                  )}
                  
                  {/* Ready Button - Only shows when status is Preparing */}
                  {order.status === "Preparing" && (
                    <button
                      className="btn-status btn-ready"
                      onClick={() => updateStatus(order._id, "Ready", preparingTimes[order._id] || order.preparingTime || 15)}
                      disabled={loading}
                    >
                      <CheckCircleOutlined /> Ready
                    </button>
                  )}
                  
                  {/* Complete Button - Shows after Ready */}
                  {order.status === "Ready" && (
                    <button
                      className="btn-status btn-complete"
                      onClick={() => updateStatus(order._id, "Completed", preparingTimes[order._id] || order.preparingTime || 15)}
                      disabled={loading}
                    >
                      <SmileOutlined /> Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Kitchen;