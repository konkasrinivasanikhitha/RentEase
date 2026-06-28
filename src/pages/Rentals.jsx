import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatRupee } from "../main.jsx";

function statusClass(status) {
  if (status === "Active") return "live";
  if (status === "Pickup scheduled") return "scheduled";
  return "closed";
}

export default function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/rentals")
      .then(data => setRentals(data.rentals))
      .catch(err => setError(err.message));
  }, []);

  return (
    <main className="page">
      <div className="page-intro">
        <p className="eyebrow">User rentals</p>
        <h1>Active plans and rental history</h1>
        <p>Track current rentals, delivery actions, returns, and completed rental plans.</p>
      </div>
      {error && <p className="form-note error-note">{error}</p>}
      <div className="rental-grid">
        {rentals.map(rental => (
          <article className="rental-card" key={rental.id}>
            <span className={`status ${statusClass(rental.status)}`}>{rental.status}</span>
            <h3>{rental.product}</h3>
            <div className="rental-meta">
              <span>{rental.tenure}</span>
              <span>{formatRupee(rental.monthlyRent)}/month</span>
            </div>
            <strong>{rental.nextAction}</strong>
          </article>
        ))}
      </div>
      <div className="quick-actions">
        <Link className="primary-link" to="/catalog">Add more products</Link>
        <Link className="secondary-link" to="/support">Request support</Link>
      </div>
    </main>
  );
}
