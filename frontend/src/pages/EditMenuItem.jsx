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

  const [image, setImage] = useState(null)
  const [currentImage, setCurrentImage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("http://localhost:5000/api/menu")
      .then(res => res.json())
      .then(data => {
        const item = data.find(food => food._id === id)

        if (item) {
          setForm({
            name: item.name || "",
            desc: item.desc || "",
            price: item.price || "",
            kcal: item.kcal || "",
            time: item.time || "",
            category: item.category || ""
          })
          // Set current image URL
          if (item.image) {
            const imageUrl = item.image.startsWith('http') 
              ? item.image 
              : `http://localhost:5000/uploads/${item.image}`
            setCurrentImage(imageUrl)
          }
        }
      })
      .catch(err => {
        console.error("Error fetching menu item:", err)
        alert("Backend server is not connected. Please start the backend server and try again.")
      })
  }, [id])

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("desc", form.desc)
      formData.append("price", form.price)
      formData.append("kcal", form.kcal)
      formData.append("time", form.time)
      formData.append("category", form.category)
      
      // Only append image if a new one was selected
      if (image) {
        formData.append("image", image)
      }

      const response = await fetch(`http://localhost:5000/api/menu/${id}`, {
        method: "PUT",
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      alert("Updated successfully ✅")
      navigate("/menu/main")
    } catch (error) {
      console.error("Error updating menu item:", error)
      alert("Failed to update. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-menu-page">

      <Header />

      <div className="add-menu-container">

        <h1>Edit Menu Item</h1>

        <form onSubmit={handleSubmit} className="add-menu-form">

          {/* Current Image Preview */}
          <div className="image-upload-section">
            <label>Current Image:</label>
            {currentImage ? (
              <div className="current-image-preview">
                <img 
                  src={currentImage} 
                  alt="Current item" 
                  style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "8px" }}
                />
              </div>
            ) : (
              <p>No image currently set</p>
            )}
            
            <label>Replace Image (optional):</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ marginTop: "10px" }}
            />
            {image && (
              <p style={{ color: "green", marginTop: "5px" }}>
                New image selected: {image.name}
              </p>
            )}
          </div>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Dish Name"
          />

          <textarea
            name="desc"
            value={form.desc}
            onChange={handleChange}
            placeholder="Description"
          />

          <div className="row-3">

            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
            />

            <input
              name="kcal"
              value={form.kcal}
              onChange={handleChange}
              placeholder="Calories"
            />

            <input
              name="time"
              value={form.time}
              onChange={handleChange}
              placeholder="Time"
            />

          </div>

          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category"
          />

          <button className="submit-btn" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>

        </form>

      </div>

    </div>
  )
}

export default EditMenuItem
