import { useNavigate } from "react-router-dom"
import Header from "../components/Header"
import "../styles/home.css"

import mainImg from "../assets/images/maincourse.webp"
import breakfastImg from "../assets/images/breakfast.webp"
import pizzaImg from "../assets/images/pizza.webp"
import dessertImg from "../assets/images/desserts.webp"
import drinksImg from "../assets/images/drinks.webp"

function Home() {

  const navigate = useNavigate()

  const categories = [

    {
      title: "Main courses",
      desc: "Hearty plates for every craving",
      img: mainImg,
      page: "/menu/main"
    },

    {
      title: "Breakfast",
      desc: "Morning favorites to start fresh",
      img: breakfastImg,
      page: "/breakfast"
    },

    {
      title: "Pizza",
      desc: "Hand tossed pies with bold toppings",
      img: pizzaImg,
      page: "/pizza"
    },

    {
      title: "Desserts",
      desc: "Sweet bites to treat yourself",
      img: dessertImg,
      page: "/desserts"
    },

    {
      title: "Beverages",
      desc: "Cool drinks to refresh your day",
      img: drinksImg,
      page: "/beverages"
    }

  ]

  return (

    <div className="home-container">

      <Header />

      <div className="categories">

        {categories.map((cat, i) => (

          <div
            key={i}
            className="card"
            onClick={() => navigate(cat.page)}
          >

            <img src={cat.img} alt={cat.title} />

            <div className="overlay">

              <h2>{cat.title}</h2>
              <p>{cat.desc}</p>

            </div>

          </div>

        ))}

      </div>

      <button className="floating-btn">
        Talk to a menu expert →
      </button>

    </div>

  )
}

export default Home