import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatRupee, useAuth, useCart } from "../main.jsx";

export default function Checkout() {
  const { cart, monthlyRent, deposit, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const tomorrow = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  }, []);
  const [form, setForm] = useState({ deliveryDate: tomorrow, city: user?.city || "Bengaluru", location: "", tenure: "6 months" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("Add at least one rental product before checkout.");
      return;
    }

    try {
      const data = await api("/rentals", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          productNames: cart.map(item => item.name),
          monthlyRent
        })
      });
      clearCart();
      setMessage(`${data.message} Redirecting to rentals...`);
      setTimeout(() => navigate("/rentals"), 700);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page">
      <div className="checkout-band">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1>Schedule delivery before confirming your plan</h1>
          <p>Choose delivery details and confirm a rental. Your confirmed order appears on the rentals page.</p>
          <div className="quick-actions">
            <Link className="secondary-link" to="/catalog">Back to catalog</Link>
          </div>
        </div>
        <section className="checkout-card">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <label>Delivery date<input required type="date" min={tomorrow} value={form.deliveryDate} onChange={event => setForm({ ...form, deliveryDate: event.target.value })} /></label>
            <label>City<input required type="text" value={form.city} onChange={event => setForm({ ...form, city: event.target.value })} /></label>
            <label>Location<input required type="text" value={form.location} onChange={event => setForm({ ...form, location: event.target.value })} placeholder="Area or apartment name" /></label>
            <label>Tenure<select value={form.tenure} onChange={event => setForm({ ...form, tenure: event.target.value })}>
              <option>3 months</option>
              <option>6 months</option>
              <option>12 months</option>
            </select></label>
            <div className="cart-total"><span>Items</span><strong>{cart.length}</strong></div>
            <div className="cart-total"><span>Monthly rent</span><strong>{formatRupee(monthlyRent)}</strong></div>
            <div className="cart-total"><span>Security deposit</span><strong>{formatRupee(deposit)}</strong></div>
            <button className="primary-button" type="submit">Confirm rental</button>
            <p className={`form-note ${error ? "error-note" : ""}`}>{error || message}</p>
          </form>
        </section>
      </div>
    </main>
  );
}
