import { useEffect, useState } from "react"
import API_BASE_URL from "../../config"

function Kitchen(){

 const [orders,setOrders] = useState([])
 const [error, setError] = useState(null)

 const fetchOrders = () => {
  fetch(`${API_BASE_URL}/api/orders/all`)
   .then(res => {
     if (!res.ok) throw new Error('Failed to fetch orders')
     return res.json()
   })
   .then(data => {
     setOrders(data)
     setError(null)
   })
   .catch(err => {
     console.error('Error fetching orders:', err)
     setError(err.message)
   })
 }

 useEffect(()=>{
  fetchOrders()

  // 🔥 Auto refresh every 3 sec
  const interval = setInterval(fetchOrders, 3000)
  return () => clearInterval(interval)

 },[])

 return(

  <div>

   <h1>🍳 Kitchen Orders</h1>

   {orders.length === 0 && <p>No Orders Yet</p>}

   {orders.map(order=>(
     <div key={order._id} style={{border:"1px solid black", margin:"10px", padding:"10px"}}>

      <h3>Table {order.tableNumber}</h3>
      <p>Token: {order.tokenNumber}</p>
      <p>Status: {order.status}</p>
      <p>Total: ₹{order.total}</p>

      {order.items.map((item,index)=>(
        <p key={index}>
          {item.name} x {item.quantity}
        </p>
      ))}

     </div>
   ))}

  </div>

 )

}

export default Kitchen