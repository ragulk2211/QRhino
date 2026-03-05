import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Menu from "./pages/Menu"
import AddMenuItem from "./pages/AddMenuItem"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu/main" element={<Menu />} />
        <Route path="/add-item" element={<AddMenuItem />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
