import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, useAuth } from "../main.jsx";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("Creating account...");

    try {
      const data = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify(form)
      });
      login(data);
      navigate("/");
    } catch (err) {
      setMessage("");
      setError(err.message);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-container" aria-labelledby="registerTitle">
        <div>
          <p className="eyebrow">Create account</p>
          <h1 id="registerTitle">Start renting with RentEase</h1>
          <p className="auth-copy">Register first, then browse the protected catalog, rentals, support, and admin pages.</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Full name<input type="text" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Your full name" required /></label>
          <label>Email<input type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" required /></label>
          <label>Password<input type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="Create a password" required /></label>
          <label>City<input type="text" value={form.city} onChange={event => setForm({ ...form, city: event.target.value })} placeholder="Bengaluru" required /></label>
          <button className="primary-button" type="submit">Register</button>
          <p className={`form-note ${error ? "error-note" : ""}`} role="status">{error || message}</p>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </section>
    </main>
  );
}
