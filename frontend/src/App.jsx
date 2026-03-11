import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Menu from "./pages/Menu"
import AddMenuItem from "./pages/AddMenuItem"
import Breakfast from "./pages/Breakfast"
import Burgers from "./pages/Burgers"
import EditMenuItem from "./pages/EditMenuItem"

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/menu/main" element={<Menu />} />

        <Route path="/add-item" element={<AddMenuItem />} />

        <Route path="/breakfast" element={<Breakfast />} />

        <Route path="/burgers" element={<Burgers />} />

        <Route path="/edit-item/:id" element={<EditMenuItem />} />

      </Routes>

    </BrowserRouter>
  )
}

export default App 