import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Menu from "./pages/Menu"
import AddMenuItem from "./pages/AddMenuItem"
import AdminDashboard from "./pages/AdminDashboard"
import CreateRestaurant from "./pages/CreateRestaurant"
import CreateCategory from "./pages/CreateCategory"
import QRGenerator from "./pages/QRGenerator"
import EditRestaurant from "./pages/EditRestaurant"
import Kitchen from "./pages/Kitchen"
import Cart from "./pages/Cart";
import Breakfast from "./pages/Breakfast"
import Burgers from "./pages/Burgers"
import EditMenuItem from "./pages/EditMenuItem"
import RestaurantMenu from "./pages/RestaurantMenu";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/menu/main" element={<Menu />} />

        <Route path="/menu/:restaurantId" element={<Menu />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/kitchen" element={<Kitchen />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/create-restaurant" element={<CreateRestaurant />} />
        <Route path="/admin/edit-restaurant/:id" element={<EditRestaurant />} />
        <Route path="/admin/create-category" element={<CreateCategory />} />
        <Route path="/admin/add-item" element={<AddMenuItem />} />
        <Route path="/admin/qr-generator" element={<QRGenerator />} />
        
        <Route path="/add-item" element={<AddMenuItem />} />

        <Route path="/breakfast" element={<Breakfast />} />

        <Route path="/burgers" element={<Burgers />} />

        <Route path="/edit-item/:id" element={<EditMenuItem />} />
        <Route path="/restaurant/menu" element={<RestaurantMenu />} />

      </Routes>

    </BrowserRouter>
  )
}

export default App
