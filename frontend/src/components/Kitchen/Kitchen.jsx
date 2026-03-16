import { useEffect, useState } from "react"

function Kitchen(){

 const [orders,setOrders] = useState([])

 useEffect(()=>{

  fetch("http://localhost:5000/api/orders")
  .then(res=>res.json())
  .then(data=>setOrders(data))

 },[])

 return(

  <div>

   <h1>Kitchen Orders</h1>

   {orders.map(order=>(
     <div>

      <h3>Table {order.tableNumber}</h3>

      {order.items.map(item=>(
        <p>{item.name}</p>
      ))}

     </div>
   ))}

  </div>

 )

}

export default Kitchen