import { useEffect, useState } from "react"
import Header from "../components/Header"
import CategoryTabs from "../components/CategoryTabs"
import FoodCard from "../components/FoodCard"
import menuData from "../data/menuData"

import "../styles/menu.css"

function Menu(){

const [active,setActive] = useState("burgers")

useEffect(()=>{

const sections = document.querySelectorAll("section")

const observer = new IntersectionObserver(

(entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){
setActive(entry.target.id)
}

})

},

{
threshold:0.4
}

)

sections.forEach(section=>observer.observe(section))

return ()=>observer.disconnect()

},[])

return(

<div className="menu-page">

<Header/>

<CategoryTabs active={active} setActive={setActive}/>

{/* BURGERS */}
<section id="burgers">

<h1 className="menu-title">Burgers</h1>

<div className="menu-grid">
{menuData.burgers.map((food,i)=>(
<FoodCard key={i} food={food}/>
))}
</div>

</section>

{/* ARABIC FOOD */}
<section id="arabic-food">

<h1 className="menu-title">Arabic Food</h1>

<div className="menu-grid">
{menuData["arabic-food"].map((food,i)=>(
<FoodCard key={i} food={food}/>
))}
</div>

</section>

{/* STARTERS */}
<section id="starters">

<h1 className="menu-title">Starters</h1>

<div className="menu-grid">
{menuData.starters.map((food,i)=>(
<FoodCard key={i} food={food}/>
))}
</div>

</section>

{/* SOUPS */}
<section id="soups">

<h1 className="menu-title">Soups</h1>

<div className="menu-grid">
{menuData.soups.map((food,i)=>(
<FoodCard key={i} food={food}/>
))}
</div>

</section>

{/* SALAD */}
<section id="salad">

<h1 className="menu-title">Salad</h1>

<div className="menu-grid">
{menuData.salad.map((food,i)=>(
<FoodCard key={i} food={food}/>
))}
</div>

</section>

<button className="expert-btn">
Talk to a menu expert →
</button>

</div>

)

}

export default Menu