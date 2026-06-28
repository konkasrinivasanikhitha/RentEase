import "bootstrap/dist/css/bootstrap.min.css";
import "../styles.css";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Navigate, NavLink, Route, BrowserRouter as Router, Routes, useNavigate } from "react-router-dom";
import Admin from "./pages/Admin.jsx";
import Catalog from "./pages/Catalog.jsx";
import Checkout from "./pages/Checkout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Rentals from "./pages/Rentals.jsx";
import Support from "./pages/Support.jsx";

const API_BASE = "/api";
const AuthContext = createContext(null);
const CartContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function useCart() {
  return useContext(CartContext);
}

export async function api(path, options = {}) {
  const token = localStorage.getItem("renteaseToken");
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data;
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("renteaseUser");
    return raw ? JSON.parse(raw) : null;
  });

  const login = ({ token, user: nextUser }) => {
    localStorage.setItem("renteaseToken", token);
    localStorage.setItem("renteaseUser", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem("renteaseToken");
    localStorage.removeItem("renteaseUser");
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout, isAuthenticated: Boolean(user) }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isOpen, setOpen] = useState(false);

  const addToCart = product => {
    setCart(items => (items.some(item => item.id === product.id) ? items : [...items, product]));
    setOpen(true);
  };

  const removeFromCart = id => setCart(items => items.filter(item => item.id !== id));
  const clearCart = () => setCart([]);
  const monthlyRent = cart.reduce((sum, item) => sum + item.rent, 0);
  const deposit = cart.reduce((sum, item) => sum + item.deposit, 0);

  const value = useMemo(
    () => ({ cart, addToCart, removeFromCart, clearCart, monthlyRent, deposit, isOpen, setOpen }),
    [cart, monthlyRent, deposit, isOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function Header() {
  const { user, logout } = useAuth();
  const { cart, setOpen } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <NavLink className="brand" to="/" aria-label="RentEase home">
        <span className="brand-mark">R</span>
        <span>RentEase</span>
      </NavLink>
      <nav className="nav" aria-label="Primary navigation">
        <NavLink to="/catalog">Catalog</NavLink>
        <NavLink to="/rentals">Rentals</NavLink>
        <NavLink to="/support">Support</NavLink>
        <NavLink to="/admin">Admin</NavLink>
      </nav>
      <div className="topbar-actions">
        <button className="cart-button" type="button" onClick={() => setOpen(true)}>
          Cart <span id="cartCount">{cart.length}</span>
        </button>
        <div className="user-chip" title={user?.email}>
          <span>{user?.name}</span>
        </div>
        <button className="secondary-button" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

function CartDrawer() {
  const { cart, removeFromCart, monthlyRent, deposit, isOpen, setOpen } = useCart();

  return (
    <>
      <aside className={`cart-drawer ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
        <div className="cart-header">
          <h2>Your rental cart</h2>
          <button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Close cart">
            x
          </button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <p>Your cart is empty. Add a product from the catalog.</p>
          ) : (
            cart.map(product => (
              <div className="cart-item" key={product.id}>
                <img src={product.image} alt={product.name} />
                <div>
                  <strong>{product.name}</strong>
                  <p>{formatRupee(product.rent)}/mo</p>
                </div>
                <button type="button" onClick={() => removeFromCart(product.id)}>
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
        <div className="cart-total">
          <span>Monthly rent</span>
          <strong>{formatRupee(monthlyRent)}</strong>
        </div>
        <div className="cart-total">
          <span>Security deposit</span>
          <strong>{formatRupee(deposit)}</strong>
        </div>
        <NavLink className="primary-link full" to="/checkout" onClick={() => setOpen(false)}>
          Schedule checkout
        </NavLink>
      </aside>
      <div className={`overlay ${isOpen ? "open" : ""}`} onClick={() => setOpen(false)} />
    </>
  );
}

function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Header />
      {children}
      <CartDrawer />
    </div>
  );
}

export function formatRupee(value) {
  return `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/*" element={<ProtectedRoute><AppShell><Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/rentals" element={<Rentals />} />
              <Route path="/support" element={<Support />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes></AppShell></ProtectedRoute>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

createRoot(document.getElementById("root")).render(<App />);
