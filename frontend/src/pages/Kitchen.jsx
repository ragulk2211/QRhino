import { useEffect, useState } from "react";
import {
  Button,
  InputNumber,
  message,
  Spin,
  Empty,
  Tooltip
} from "antd";
import {
  ReloadOutlined,
  FireOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TableOutlined,
  OrderedListOutlined,
  DollarOutlined,
  CoffeeOutlined,
  TrophyOutlined,
  HourglassOutlined,
  SyncOutlined,
  TagOutlined,
  FieldTimeOutlined
} from "@ant-design/icons";
import "../styles/kitchen.css";

// API Base URL - Change this to your backend URL
const API_BASE_URL = 'http://localhost:5000';

function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preparingTimes, setPreparingTimes] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [messageApi, contextHolder] = message.useMessage();

  // Helper function to format price to 2 decimal places
  const formatPrice = (price) => {
    if (!price && price !== 0) return '0.00';
    return Number(price).toFixed(2);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/all`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const sortedOrders = data.sort((a, b) => (a.tokenNumber || 0) - (b.tokenNumber || 0));
      setOrders(sortedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      messageApi.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus, preparingTime) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          preparingTime: preparingTime || 15
        })
      });

      if (response.ok) {
        messageApi.success(`Order marked as ${newStatus}`);
        fetchOrders();
      } else {
        messageApi.error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      messageApi.error("Network error");
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "Pending":
        return { color: "#f59e0b", icon: <HourglassOutlined />, text: "Pending", class: "pending" };
      case "Preparing":
        return { color: "#3b82f6", icon: <SyncOutlined spin />, text: "Preparing", class: "preparing" };
      case "Ready":
        return { color: "#22c55e", icon: <CheckCircleOutlined />, text: "Ready", class: "ready" };
      case "Completed":
        return { color: "#6b7280", icon: <TrophyOutlined />, text: "Completed", class: "completed" };
      default:
        return { color: "#f59e0b", icon: <HourglassOutlined />, text: "Pending", class: "pending" };
    }
  };

  const getFilteredOrders = () => {
    if (activeTab === "all") return orders;
    return orders.filter(o => o.status === activeTab);
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "Pending").length,
    preparing: orders.filter(o => o.status === "Preparing").length,
    ready: orders.filter(o => o.status === "Ready").length,
    completed: orders.filter(o => o.status === "Completed").length
  };

  const filteredOrders = getFilteredOrders();

  const handleStatClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="kitchen-container">
      {contextHolder}
      
      {/* Header */}
      <div className="kitchen-header">
        <div className="kitchen-header-left">
          <div className="kitchen-logo">
            <CoffeeOutlined />
          </div>
          <div className="kitchen-header-text">
            <h1 className="kitchen-title">Kitchen Dashboard</h1>
            <p className="kitchen-subtitle">Manage and track all incoming orders in real-time</p>
          </div>
        </div>
        <Button 
          type="primary"
          icon={<ReloadOutlined />} 
          onClick={fetchOrders}
          loading={loading}
          className="refresh-btn"
        >
          Refresh Orders
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="kitchen-stats-grid">
        <div className={`stat-card ${activeTab === "all" ? "active" : ""}`} onClick={() => handleStatClick("all")}>
          <div className="stat-icon total">
            <OrderedListOutlined />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className={`stat-card ${activeTab === "Pending" ? "active" : ""}`} onClick={() => handleStatClick("Pending")}>
          <div className="stat-icon pending">
            <HourglassOutlined />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className={`stat-card ${activeTab === "Preparing" ? "active" : ""}`} onClick={() => handleStatClick("Preparing")}>
          <div className="stat-icon preparing">
            <SyncOutlined />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.preparing}</div>
            <div className="stat-label">Preparing</div>
          </div>
        </div>
        <div className={`stat-card ${activeTab === "Ready" ? "active" : ""}`} onClick={() => handleStatClick("Ready")}>
          <div className="stat-icon ready">
            <CheckCircleOutlined />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.ready}</div>
            <div className="stat-label">Ready</div>
          </div>
        </div>
        <div className={`stat-card ${activeTab === "Completed" ? "active" : ""}`} onClick={() => handleStatClick("Completed")}>
          <div className="stat-icon completed">
            <TrophyOutlined />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="orders-section">
        <div className="orders-header">
          <div className="orders-title-wrapper">
            <FireOutlined className="orders-icon" />
            <h2 className="orders-title">
              {activeTab === "all" ? "All Orders" : `${activeTab} Orders`}
              <span className="orders-count">({filteredOrders.length})</span>
            </h2>
          </div>
          {activeTab !== "all" && (
            <Button 
              type="link" 
              onClick={() => handleStatClick("all")}
              className="clear-filter-btn"
            >
              Show All Orders
            </Button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="kitchen-loading">
            <Spin size="large" tip="Loading orders..." />
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="kitchen-empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="empty-description-wrapper">
                  <span className="empty-title">No Orders Yet</span>
                  <span className="empty-subtitle">Click refresh to check for new orders</span>
                </div>
              }
            >
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={fetchOrders}
              >
                Refresh Now
              </Button>
            </Empty>
          </div>
        )}

        {/* No Filtered Orders State */}
        {!loading && orders.length > 0 && filteredOrders.length === 0 && (
          <div className="kitchen-empty-filter">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="empty-description-wrapper">
                  <span className="empty-title">No {activeTab} Orders</span>
                  <span className="empty-subtitle">There are no orders with {activeTab.toLowerCase()} status</span>
                </div>
              }
            >
              <Button 
                type="primary" 
                onClick={() => handleStatClick("all")}
              >
                View All Orders
              </Button>
            </Empty>
          </div>
        )}

        {/* Orders Grid */}
        {!loading && filteredOrders.length > 0 && (
          <div className="orders-grid">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const itemCount = order.items?.length || 0;
              const hasMoreThan3Items = itemCount > 3;
              
              return (
                <div key={order._id} className={`order-card ${statusConfig.class}`}>
                  {/* Order Header */}
                  <div className="order-card-header">
                    <div className="order-token-section">
                      <div className="token-badge">
                        <span className="token-label">TOKEN</span>
                        <span className="token-number">{order.tokenNumber}</span>
                      </div>
                    </div>
                    <div className="order-table-section">
                      <TableOutlined />
                      <span>Table {order.tableNumber || "N/A"}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`status-badge ${statusConfig.class}`}>
                    {statusConfig.icon}
                    <span>{statusConfig.text}</span>
                  </div>

                  {/* Items Section with proper spacing */}
                  <div className="order-items-container">
                    <div className="items-header">
                      <span>ITEM</span>
                      <span>QTY</span>
                      <span>PRICE</span>
                    </div>
                    <div className={`order-items-list ${hasMoreThan3Items ? 'scrollable' : ''}`}>
                      {order.items && order.items.map((item, idx) => (
                        <div key={idx} className="order-item">
                          <div className="item-name-wrapper">
                            <Tooltip title={item.name} placement="topLeft">
                              <span className="item-name">{item.name}</span>
                            </Tooltip>
                            {item.specialInstructions && (
                              <Tooltip title={item.specialInstructions} placement="bottom">
                                <FieldTimeOutlined className="item-note-icon" />
                              </Tooltip>
                            )}
                          </div>
                          <span className="item-quantity">x{item.quantity || 1}</span>
                          <span className="item-price">₹{formatPrice(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Items count badge for orders with more than 3 items */}
                  {hasMoreThan3Items && (
                    <div className="items-count-badge">
                      <span>{itemCount} total items</span>
                    </div>
                  )}

                  {/* Prep Time Input */}
                  {order.status !== "Completed" && (
                    <div className="prep-time-wrapper">
                      <label><ClockCircleOutlined /> Prep Time:</label>
                      <div className="prep-time-input-group">
                        <InputNumber
                          min={1}
                          max={240}
                          value={preparingTimes[order._id] || order.preparingTime || 15}
                          onChange={(val) => {
                            if (val && val > 0) {
                              setPreparingTimes({ ...preparingTimes, [order._id]: val });
                            }
                          }}
                          size="small"
                          className="prep-time-input"
                        />
                        <span>minutes</span>
                      </div>
                    </div>
                  )}

                  {/* Order Footer */}
                  <div className="order-card-footer">
                    <div className="order-total">
                      <DollarOutlined />
                      <span>Total: ₹{formatPrice(order.total)}</span>
                    </div>
                    <div className="order-time">
                      <ClockCircleOutlined />
                      <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="order-actions">
                    {order.status === "Pending" && (
                      <Button
                        type="primary"
                        className="action-btn btn-preparing"
                        icon={<SyncOutlined />}
                        onClick={() => updateStatus(order._id, "Preparing", preparingTimes[order._id] || order.preparingTime || 15)}
                        disabled={loading}
                        block
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.status === "Preparing" && (
                      <Button
                        type="primary"
                        className="action-btn btn-ready"
                        icon={<CheckCircleOutlined />}
                        onClick={() => updateStatus(order._id, "Ready", preparingTimes[order._id] || order.preparingTime || 15)}
                        disabled={loading}
                        block
                      >
                        Mark as Ready
                      </Button>
                    )}
                    {order.status === "Ready" && (
                      <Button
                        type="primary"
                        className="action-btn btn-complete"
                        icon={<TrophyOutlined />}
                        onClick={() => updateStatus(order._id, "Completed", preparingTimes[order._id] || order.preparingTime || 15)}
                        disabled={loading}
                        block
                      >
                        Complete Order
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Kitchen;