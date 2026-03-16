import { useEffect, useState } from "react"

function Kitchen(){

 const [orders,setOrders] = useState([])
 const [loading, setLoading] = useState(false)

 const fetchOrders = () => {
  fetch("http://localhost:5000/api/orders/all")
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    return res.json()
  })
  .then(data=>setOrders(data))
  .catch(err=>{
    console.error("Error fetching orders:", err)
    alert("Backend server is not connected. Please start the backend server and try again.")
  })
 }

 useEffect(()=>{
  fetchOrders()
  
  // Poll for new orders every 10 seconds
  const interval = setInterval(fetchOrders, 10000)
  
  return () => clearInterval(interval)
 },[])

 const updateStatus = async (orderId, newStatus) => {
  setLoading(true)
  try {
   const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
    method: "PUT",
    headers: {
     "Content-Type": "application/json"
    },
    body: JSON.stringify({ status: newStatus })
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

 const getStatusColor = (status) => {
  switch(status) {
   case "Pending": return "#ffc107"
   case "Preparing": return "#17a2b8"
   case "Ready": return "#28a745"
   case "Completed": return "#6c757d"
   default: return "#ffc107"
  }
 }

 return(

  <div style={{ padding: "20px" }}>

   <h1>Kitchen Dashboard</h1>
   <button onClick={fetchOrders} style={{ marginBottom: "20px" }}>Refresh Orders</button>

   {orders.length === 0 && <p>No orders yet</p>}

   {orders.map((order,index)=>(
    <div key={order._id || index} style={{
     border:"1px solid #ddd",
     margin:"10px",
     padding:"15px",
     borderRadius:"8px",
     backgroundColor: "#f8f9fa"
    }}>

     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h3>Token Number: #{order.tokenNumber}</h3>
      <span style={{ 
       backgroundColor: getStatusColor(order.status),
       padding: "5px 15px",
       borderRadius: "20px",
       color: "white",
       fontWeight: "bold"
      }}>
       {order.status}
      </span>
     </div>

     <p><strong>Table:</strong> {order.tableNumber || "N/A"}</p>
     
     <h4>Ordered Items:</h4>
     <ul>
      {order.items && order.items.map((item,i)=>(
       <li key={i}>{item.name} - ₹{item.price}</li>
      ))}
     </ul>

     <p><strong>Total:</strong> ₹{order.total}</p>

     <div style={{ marginTop: "15px" }}>
      <p><strong>Update Status:</strong></p>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
       <button 
        onClick={() => updateStatus(order._id, "Preparing")}
        disabled={loading || order.status === "Preparing"}
        style={{ backgroundColor: "#17a2b8", color: "white", padding: "8px 16px", border: "none", borderRadius: "4px", cursor: "pointer" }}
       >
        Preparing
       </button>
       <button 
        onClick={() => updateStatus(order._id, "Ready")}
        disabled={loading || order.status === "Ready"}
        style={{ backgroundColor: "#28a745", color: "white", padding: "8px 16px", border: "none", borderRadius: "4px", cursor: "pointer" }}
       >
        Ready
       </button>
       <button 
        onClick={() => updateStatus(order._id, "Completed")}
        disabled={loading || order.status === "Completed"}
        style={{ backgroundColor: "#6c757d", color: "white", padding: "8px 16px", border: "none", borderRadius: "4px", cursor: "pointer" }}
       >
        Completed
       </button>
      </div>
     </div>

     <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
      Ordered at: {new Date(order.createdAt).toLocaleString()}
     </p>

    </div>
   ))}

  </div>

 )

}

export default Kitchen
