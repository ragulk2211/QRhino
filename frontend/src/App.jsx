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
import Cart from "./pages/cart"
import Breakfast from "./pages/Breakfast"
import Burgers from "./pages/Burgers"
import EditMenuItem from "./pages/EditMenuItem"
import RestaurantMenu from "./pages/RestaurantMenu"
import CouponManagement from "./pages/CouponManagement"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/menu/main" element={<Menu />} />
        <Route path="/menu/:restaurantId" element={<Menu />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/breakfast" element={<Breakfast />} />
        <Route path="/burgers" element={<Burgers />} />

        {/* Kitchen */}
        <Route path="/kitchen" element={<Kitchen />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/create-restaurant" element={<CreateRestaurant />} />
        <Route path="/admin/edit-restaurant/:id" element={<EditRestaurant />} />
        <Route path="/admin/create-category" element={<CreateCategory />} />
        <Route path="/admin/add-item" element={<AddMenuItem />} />
        <Route path="/admin/qr-generator" element={<QRGenerator />} />
        <Route path="/admin/coupons" element={<CouponManagement />} />

        {/* Menu Management */}
        <Route path="/add-item" element={<AddMenuItem />} />
        <Route path="/edit-item/:id" element={<EditMenuItem />} />
        <Route path="/restaurant/menu" element={<RestaurantMenu />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App