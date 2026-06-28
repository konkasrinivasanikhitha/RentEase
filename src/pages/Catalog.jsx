import React, { useEffect, useState } from "react";
import { api, formatRupee, useCart } from "../main.jsx";

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All");
  const [error, setError] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    api("/products")
      .then(data => setProducts(data.products))
      .catch(err => setError(err.message));
  }, []);

  const visibleProducts = category === "All" ? products : products.filter(product => product.category === category);

  return (
    <main className="page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Product catalog</p>
          <h1>Furniture and appliances ready to rent</h1>
        </div>
        <div className="filters" role="group" aria-label="Catalog filters">
          {["All", "Furniture", "Appliance"].map(item => (
            <button className={`filter ${category === item ? "active" : ""}`} type="button" key={item} onClick={() => setCategory(item)}>
              {item === "Appliance" ? "Appliances" : item}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="form-note error-note">{error}</p>}
      <div className="product-grid">
        {visibleProducts.map(product => (
          <article className="product-card" key={product.id}>
            <img src={product.image} alt={product.name} />
            <div className="product-body">
              <div>
                <p className="eyebrow">{product.category}</p>
                <h3>{product.name}</h3>
              </div>
              <div className="product-meta">
                {product.tenure.map(item => <span className="pill" key={item}>{item}</span>)}
              </div>
              <div className="price-row">
                <span className="price">{formatRupee(product.rent)}/mo</span>
                <span>Deposit {formatRupee(product.deposit)}</span>
              </div>
              <button className="primary-button" type="button" onClick={() => addToCart(product)}>Add to cart</button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
