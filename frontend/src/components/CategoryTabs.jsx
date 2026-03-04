import "../styles/menu.css"

function CategoryTabs({ active, setActive }) {

const tabs = [
{ id: "burgers", label: "Burgers" },
{ id: "arabic-food", label: "Arabic Food" },
{ id: "starters", label: "Starters" },
{ id: "soups", label: "Soups" },
{ id: "salad", label: "Salad" }
]

const scrollToSection = (id) => {

const section = document.getElementById(id)

if(section){

setActive(id) // highlight immediately

section.scrollIntoView({
behavior: "smooth",
block: "start"
})

}

}

return (

<div className="category-tabs">

<div className="menu-icon">☰</div>

{tabs.map(tab => (

<span
key={tab.id}
className={active === tab.id ? "active-tab" : ""}
onClick={() => scrollToSection(tab.id)}
>

{tab.label}

</span>

))}

</div>

)

}

export default CategoryTabs