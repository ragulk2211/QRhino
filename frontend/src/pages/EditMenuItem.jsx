import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "../components/Header"
import "../styles/addmenu.css"

function EditMenuItem() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    desc: "",
    price: "",
    kcal: "",
    time: "",
    category: ""
  })

  useEffect(() => {
    fetch(`http://localhost:5000/menu`)
      .then(res => res.json())
      .then(data => {
        const item = data.find(food => food._id === id)

        if (item) {
          setForm(item)
        }
      })
  }, [id])

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    await fetch(`http://localhost:5000/menu/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    })

    alert("Updated successfully ✅")

    navigate("/menu/main")
  }

  return (
    <div className="add-menu-page">

      <Header />

      <div className="add-menu-container">

        <h1>Edit Menu Item</h1>

        <form onSubmit={handleSubmit} className="add-menu-form">

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <textarea
            name="desc"
            value={form.desc}
            onChange={handleChange}
          />

          <div className="row-3">

            <input
              name="price"
              value={form.price}
              onChange={handleChange}
            />

            <input
              name="kcal"
              value={form.kcal}
              onChange={handleChange}
            />

            <input
              name="time"
              value={form.time}
              onChange={handleChange}
            />

          </div>

          <input
            name="category"
            value={form.category}
            onChange={handleChange}
          />

          <button className="submit-btn">
            Save Changes
          </button>

        </form>

      </div>

    </div>
  )
}

export default EditMenuItem