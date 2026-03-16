import { useEffect, useState } from "react"

function Kitchen(){

 const [orders,setOrders] = useState([])

 useEffect(()=>{

  fetch("http://localhost:5000/api/orders/all")
  .then(res=>res.json())
  .then(data=>setOrders(data))

 },[])

 return(

  <div>

   <h1>Kitchen Dashboard</h1>

   {orders.map((order,index)=>(
    <div key={index} style={{border:"1px solid black",margin:"10px",padding:"10px"}}>

      <h3>Table {order.tableNumber}</h3>

      {order.items.map((item,i)=>(
        <p key={i}>{item.name}</p>
      ))}

      <p>Total ₹{order.total}</p>
      <p>Status: {order.status}</p>

    </div>
   ))}

  </div>

 )

}

export default Kitchen