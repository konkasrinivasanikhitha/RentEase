import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { db } from "./store.js";

dotenv.config();

const app = express();
const jwtSecret = process.env.JWT_SECRET || "rentease-dev-secret";

app.use(cors());
app.use(express.json());

const productSeed = [
  {
    id: "bed",
    name: "Queen Bed Frame",
    category: "Furniture",
    rent: 799,
    deposit: 1800,
    tenure: ["3 months", "6 months", "12 months"],
    stock: 74,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "sofa",
    name: "Three Seat Sofa",
    category: "Furniture",
    rent: 1199,
    deposit: 2500,
    tenure: ["6 months", "12 months"],
    stock: 42,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "desk",
    name: "Work Desk",
    category: "Furniture",
    rent: 449,
    deposit: 900,
    tenure: ["3 months", "6 months", "12 months"],
    stock: 88,
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "fridge",
    name: "Double Door Fridge",
    category: "Appliance",
    rent: 1299,
    deposit: 3000,
    tenure: ["6 months", "12 months"],
    stock: 33,
    image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "washer",
    name: "Front Load Washer",
    category: "Appliance",
    rent: 999,
    deposit: 2200,
    tenure: ["6 months", "12 months"],
    stock: 25,
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "tv",
    name: "Smart TV 43 inch",
    category: "Appliance",
    rent: 899,
    deposit: 2000,
    tenure: ["3 months", "6 months", "12 months"],
    stock: 57,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80"
  }
];

const ready = (async () => {
  await db.init(productSeed);

  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected for RentEase");
    } catch (error) {
      console.log(`MongoDB unavailable, using preview store: ${error.message}`);
    }
  }
})();

app.use(async (req, res, next) => {
  try {
    await ready;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function signUser(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: "7d" });
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    city: user.city,
    role: user.role
  };
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ error: "Login required before accessing RentEase." });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ error: "Session expired. Please login again." });
  }
}

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, city } = req.body;

  if (!name || !email || !password || !city) {
    return res.status(400).json({ error: "Name, email, password, and city are required." });
  }

  const existing = await db.findUser(email);
  if (existing) {
    return res.status(409).json({ error: "This email is already registered. Please login." });
  }

  const user = await db.createUser({ name, email, password, city, role: email.includes("admin") ? "admin" : "customer" });
  return res.status(201).json({ message: "Registration successful.", token: signUser(user), user: publicUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await db.validateUser(email, password);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  return res.json({ message: "Login successful.", token: signUser(user), user: publicUser(user) });
});

app.get("/api/me", requireAuth, async (req, res) => {
  const user = await db.findUser(req.user.email);
  return res.json({ user: publicUser(user) });
});

app.get("/api/products", requireAuth, async (req, res) => {
  const products = await db.getProducts();
  return res.json({ products });
});

app.get("/api/rentals", requireAuth, async (req, res) => {
  const rentals = await db.getRentals(req.user.email);
  return res.json({ rentals });
});

app.post("/api/rentals", requireAuth, async (req, res) => {
  const rental = await db.createRental(req.user.email, req.body);
  return res.status(201).json({ message: "Rental confirmed.", rental });
});

app.post("/api/support", requireAuth, async (req, res) => {
  const request = await db.createSupportRequest(req.user.email, req.body);
  return res.status(201).json({ message: "Support request created.", request });
});

app.get("/api/admin/summary", requireAuth, async (req, res) => {
  const summary = await db.getAdminSummary();
  return res.json(summary);
});

app.post("/api/admin/restock", requireAuth, async (req, res) => {
  const products = await db.restock();
  return res.json({ message: "Low inventory items restocked.", products });
});

export default app;
