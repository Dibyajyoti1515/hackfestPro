import { Routes, Route } from "react-router-dom";

import ProductPage from "./Pages/ProductPage";
import HomePage from "./Pages/home";

export default function App() {


  return (
    <Routes>
      <Route path="/" element={< HomePage />} />
      <Route path="/product" element={<ProductPage />} />
    </Routes>
  );
}

