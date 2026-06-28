import React, { useState } from "react";
import { api } from "../main.jsx";

export default function Support() {
  const [form, setForm] = useState({ product: "Queen Bed Frame", issueType: "Repair required", details: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("Creating request...");

    try {
      const data = await api("/support", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setMessage(data.message);
      setForm({ ...form, details: "" });
    } catch (err) {
      setMessage("");
      setError(err.message);
    }
  }

  return (
    <main className="page">
      <div className="split-grid">
        <div className="page-intro">
          <p className="eyebrow">Maintenance support</p>
          <h1>Request help for any rental</h1>
          <p>Submit repair, installation, pickup delay, or damage claim requests after logging in.</p>
        </div>
        <section className="support-box">
          <form className="support-form" onSubmit={handleSubmit}>
            <label>Product<select value={form.product} onChange={event => setForm({ ...form, product: event.target.value })}>
              <option>Queen Bed Frame</option>
              <option>Front Load Washer</option>
              <option>Smart TV 43 inch</option>
              <option>Double Door Fridge</option>
            </select></label>
            <label>Issue type<select value={form.issueType} onChange={event => setForm({ ...form, issueType: event.target.value })}>
              <option>Repair required</option>
              <option>Installation help</option>
              <option>Pickup delay</option>
              <option>Damage claim</option>
            </select></label>
            <label>Details<textarea rows="5" value={form.details} onChange={event => setForm({ ...form, details: event.target.value })} placeholder="Describe the problem" required /></label>
            <button className="primary-button" type="submit">Create request</button>
            <p className={`form-note ${error ? "error-note" : ""}`}>{error || message}</p>
          </form>
        </section>
      </div>
    </main>
  );
}
