import React, { useEffect, useState } from "react";
import { api, formatRupee } from "../main.jsx";

export default function Admin() {
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function loadSummary() {
    api("/admin/summary")
      .then(data => setSummary(data))
      .catch(err => setError(err.message));
  }

  useEffect(() => {
    loadSummary();
  }, []);

  async function handleRestock() {
    setError("");
    try {
      const data = await api("/admin/restock", { method: "POST", body: JSON.stringify({}) });
      setSummary(current => ({ ...current, products: data.products }));
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    }
  }

  const metrics = summary?.metrics || {};
  const products = summary?.products || [];

  return (
    <main className="page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h1>Inventory, schedules, and business health</h1>
        </div>
        <button className="secondary-button" type="button" onClick={handleRestock}>Restock low items</button>
      </div>
      <div className="admin-grid">
        <article className="kpi"><span>Monthly recurring revenue</span><strong>{formatRupee(metrics.mrr)}</strong></article>
        <article className="kpi"><span>Open maintenance requests</span><strong>{metrics.openRequests || 0}</strong></article>
        <article className="kpi"><span>Pending deliveries</span><strong>{metrics.pendingDeliveries || 0}</strong></article>
        <article className="kpi"><span>Damage claims</span><strong>{metrics.damageClaims || 0}</strong></article>
      </div>
      <p className={`form-note ${error ? "error-note" : ""}`}>{error || message}</p>
      <div className="inventory-list">
        {products.map(product => (
          <article className="inventory-row" key={product.id}>
            <div>
              <strong>{product.name}</strong>
              <div className="inventory-meta">
                <span>{product.category}</span>
                <span>{product.stock}% availability</span>
                <span>{formatRupee(product.rent)}/month</span>
              </div>
            </div>
            <div className="stock-bar" aria-label={`${product.stock}% stock`}>
              <span style={{ width: `${product.stock}%` }} />
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
