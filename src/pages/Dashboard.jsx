import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../main.jsx";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Monthly furniture and appliance rentals</p>
          <h1>Welcome, {user?.name?.split(" ")[0] || "there"}.</h1>
          <p>
            Browse furniture and appliances, add products to a rental cart, confirm delivery, and manage support after
            login. Every main area opens as its own page.
          </p>
          <div className="hero-actions">
            <Link className="primary-link" to="/catalog">Browse catalog</Link>
            <Link className="secondary-link" to="/rentals">View rentals</Link>
          </div>
        </div>
        <div className="hero-panel" aria-label="Rental summary">
          <div className="metric-row">
            <span className="metric-value">124</span>
            <span className="metric-label">active rentals</span>
          </div>
          <div className="metric-row">
            <span className="metric-value">88%</span>
            <span className="metric-label">product utilization</span>
          </div>
          <div className="metric-row">
            <span className="metric-value">18h</span>
            <span className="metric-label">avg. support resolution</span>
          </div>
        </div>
      </section>
    </main>
  );
}
