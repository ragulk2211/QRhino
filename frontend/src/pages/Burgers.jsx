import Header from "../components/Header"
import FoodCard from "../components/FoodCard"
import burgerData from "../data/burgerData"

function Burgers() {
  return (
    <>
      <Header />

      <div className="food-grid">
        {burgerData.map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}
      </div>
    </>
  )
}

export default Burgers