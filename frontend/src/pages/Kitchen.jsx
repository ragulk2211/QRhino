import { useEffect, useState } from "react"
import API_BASE_URL from "../config"
import '../styles/kitchen.css'

function Kitchen(){

  const [orders,setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [preparingTimes, setPreparingTimes] = useState({})

  const fetchOrders = () => {
   fetch(`${API_BASE_URL}/api/orders/all`)
   .then(res => {
     if (!res.ok) {
       throw new Error(`HTTP error! status: ${res.status}`)
     }
     return res.json()
   })
   .then(data=>setOrders(data))
   .catch(err=>{
     console.error("Error fetching orders:", err)
   })
  }

  useEffect(()=>{
   fetchOrders()
   
   // Poll for new orders every 10 seconds
   const interval = setInterval(fetchOrders, 10000)
   
   return () => clearInterval(interval)
  },[])

  const updateStatus = async (orderId, newStatus, preparingTime) => {
   setLoading(true)
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
    })
    
    if (response.ok) {
     fetchOrders() // Refresh orders after update
    }
   } catch (error) {
    console.error("Error updating status:", error)
   } finally {
    setLoading(false)
   }
  }

  const getStatusClass = (status) => {
   switch(status) {
    case "Pending": return "pending"
    case "Preparing": return "preparing"
    case "Ready": return "ready"
    case "Completed": return "completed"
    default: return "pending"
   }
  }

  // Calculate statistics
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === "Pending").length
  const preparingOrders = orders.filter(o => o.status === "Preparing").length
  const readyOrders = orders.filter(o => o.status === "Ready").length

  // Filter orders to show only non-completed orders first
  const activeOrders = orders.filter(o => o.status !== "Completed")
  const completedOrders = orders.filter(o => o.status === "Completed")

  return(

   <div className="kitchen-container">
    
    {/* Header Section */}
    <div className="kitchen-header">
     <div>
      <h1 className="kitchen-title">🍳 Kitchen Dashboard</h1>
      <p className="kitchen-subtitle">Manage and track all incoming orders</p>
     </div>
     <button className="refresh-btn" onClick={fetchOrders}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
       <path d="M23 4v6h-6M1 20v-6h6"/>
       <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
      </svg>
      Refresh Orders
     </button>
    </div>

    {/* Statistics Section */}
    <div className="kitchen-stats">
     <div className="stat-card">
      <div className="stat-icon total">📋</div>
      <div className="stat-info">
       <h3>{totalOrders}</h3>
       <p>Total Orders</p>
      </div>
     </div>
     <div className="stat-card">
      <div className="stat-icon pending">⏳</div>
      <div className="stat-info">
       <h3>{pendingOrders}</h3>
       <p>Pending</p>
      </div>
     </div>
     <div className="stat-card">
      <div className="stat-icon preparing">👨‍🍳</div>
      <div className="stat-info">
       <h3>{preparingOrders}</h3>
       <p>Preparing</p>
      </div>
     </div>
     <div className="stat-card">
      <div className="stat-icon ready">✅</div>
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
       <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
      <h3>No Orders Yet</h3>
      <p>New orders will appear here automatically</p>
     </div>
    )}

    {/* Active Orders */}
    {activeOrders.length > 0 && (
     <div className="orders-grid">
      {activeOrders.map((order,index)=>(
       <div key={order._id || index} className={`order-card ${getStatusClass(order.status)}`}>

        {/* Order Header */}
        <div className="order-header">
         <div className="order-token">
          <span>Token</span>
          <strong>#{order.tokenNumber}</strong>
         </div>
         <div className="order-table">
          Table {order.tableNumber || "N/A"}
         </div>
        </div>

        {/* Status Badge */}
        <span className={`status-badge ${getStatusClass(order.status)}`}>
         {order.status}
        </span>

        {/* Order Items */}
        <div className="order-items">
         {order.items && order.items.map((item,i)=>(
          <div key={i} className="order-item">
           <span className="item-name">{item.name}</span>
           <span className="item-quantity">x{item.quantity || 1}</span>
           <span className="item-price">₹{item.price}</span>
          </div>
         ))}
        </div>

        {/* Preparing Time Input */}
        <div className="preparing-time">
         <label>Prep Time:</label>
         <input 
          type="number" 
          min="1"
          max="240"
          value={preparingTimes[order._id] || order.preparingTime || 15}
          onChange={(e) => {
           const val = parseInt(e.target.value);
           if (!isNaN(val) && val > 0) {
             setPreparingTimes({...preparingTimes, [order._id]: val});
           }
          }}
         />
         <span>min</span>
        </div>

        {/* Order Footer */}
        <div className="order-footer">
         <span className="order-total">Total: ₹{order.total}</span>
         <span className="order-time">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
           <circle cx="12" cy="12" r="10"/>
           <path d="M12 6v6l4 2"/>
          </svg>
          {new Date(order.createdAt).toLocaleTimeString()}
         </span>
        </div>

        {/* Action Buttons */}
        <div className="order-actions">
         <button 
          className="btn-status btn-preparing"
          onClick={() => updateStatus(order._id, "Preparing", preparingTimes[order._id] || order.preparingTime || 15)}
          disabled={loading || order.status === "Preparing"}
         >
          👨‍🍳 Preparing
         </button>
         <button 
          className="btn-status btn-ready"
          onClick={() => updateStatus(order._id, "Ready", preparingTimes[order._id] || order.preparingTime || 15)}
          disabled={loading || order.status === "Ready"}
         >
          ✅ Ready
         </button>
         <button 
          className="btn-status btn-complete"
          onClick={() => updateStatus(order._id, "Completed", preparingTimes[order._id] || order.preparingTime || 15)}
          disabled={loading || order.status === "Completed"}
         >
          ✓ Complete
         </button>
        </div>

       </div>
      ))}
     </div>
    )}

   </div>

  )

}

export default Kitchen
