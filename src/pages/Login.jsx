import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, useAuth } from "../main.jsx";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("Logging in...");

    try {
      const data = await api("/auth/login", {
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
      <section className="auth-container" aria-labelledby="loginTitle">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1 id="loginTitle">Login to RentEase</h1>
          <p className="auth-copy">Manage rentals, track deliveries, and schedule maintenance from one place.</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Email<input type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" required /></label>
          <label>Password<input type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="Enter your password" required /></label>
          <button className="primary-button" type="submit">Login</button>
          <p className={`form-note ${error ? "error-note" : ""}`} role="status">{error || message}</p>
        </form>
        <p className="auth-switch">New user? <Link to="/register">Register</Link></p>
      </section>
    </main>
  );
}
