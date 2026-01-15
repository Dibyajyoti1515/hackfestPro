import { useParams, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "./context/AppContext";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gifts } = useContext(AppContext);
  const product = gifts.find(g => g.id === Number(id));
  if (!product) {
    return (
      <div className="product-page">
        <h2>Product not found</h2>
        <button onClick={() => navigate("/")}>← Back</button>
      </div>
    );
  }
  return (
    <div className="product-page">
      <img
        src={product.image}
        alt={product.name}
        className="product-image"
      />

      <h2>{product.name}</h2>
      <p className="price">{product.price}</p>

      <a
        href="https://www.amazon.in"
        target="_blank"
        rel="noreferrer"
      >
        <button>Buy on Amazon</button>
      </a>
      <br /><br />
      <button onClick={() => navigate(-1)}>
        ← Back
      </button>
    </div>
  );
}

