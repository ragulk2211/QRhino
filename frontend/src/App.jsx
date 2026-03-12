import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Menu from "./pages/Menu"
import AddMenuItem from "./pages/AddMenuItem"
import AdminDashboard from "./pages/AdminDashboard"
import CreateRestaurant from "./pages/CreateRestaurant"
import CreateCategory from "./pages/CreateCategory"
import QRGenerator from "./pages/QRGenerator"
import EditRestaurant from "./pages/EditRestaurant"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/menu/main" element={<Menu />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/create-restaurant" element={<CreateRestaurant />} />
        <Route path="/admin/edit-restaurant/:id" element={<EditRestaurant />} />
        <Route path="/admin/create-category" element={<CreateCategory />} />
        <Route path="/admin/create-category" element={<CreateCategory />} />
        <Route path="/admin/add-item" element={<AddMenuItem />} />
        <Route path="/add-item" element={<AddMenuItem />} />
        <Route path="/admin/qr-generator" element={<QRGenerator />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
