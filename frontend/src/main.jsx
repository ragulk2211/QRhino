import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/home.css";
import { CartProvider } from "./context/CartContext";
import ToastContainer from "./components/Toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CartProvider>
      <App />
      <ToastContainer />
    </CartProvider>
  </React.StrictMode>
);