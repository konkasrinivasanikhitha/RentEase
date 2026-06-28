import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "..", "data", "rentease-db.json");

async function readStore() {
  const raw = await fs.readFile(dataPath, "utf8");
  return JSON.parse(raw);
}

async function writeStore(store) {
  await fs.writeFile(dataPath, JSON.stringify(store, null, 2));
}

function rentalDefaults(email) {
  return [
    {
      id: "rental-bed",
      email,
      product: "Queen Bed Frame",
      tenure: "6 months",
      status: "Active",
      nextAction: "Extend or return",
      monthlyRent: 799
    },
    {
      id: "rental-washer",
      email,
      product: "Front Load Washer",
      tenure: "12 months",
      status: "Pickup scheduled",
      nextAction: "Return on 28 Jun",
      monthlyRent: 999
    }
  ];
}

export const db = {
  async init(products) {
    try {
      await fs.access(dataPath);
    } catch {
      const passwordHash = await bcrypt.hash("admin123", 10);
      await writeStore({
        users: [
          {
            id: "admin-user",
            name: "RentEase Admin",
            email: "admin@rentease.com",
            passwordHash,
            city: "Bengaluru",
            role: "admin"
          }
        ],
        products,
        rentals: rentalDefaults("admin@rentease.com"),
        supportRequests: []
      });
    }
  },

  async findUser(email) {
    const store = await readStore();
    return store.users.find(user => user.email.toLowerCase() === String(email).toLowerCase());
  },

  async createUser({ name, email, password, city, role }) {
    const store = await readStore();
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      city,
      role
    };

    store.users.push(user);
    store.rentals.push(...rentalDefaults(user.email));
    await writeStore(store);
    return user;
  },

  async validateUser(email, password) {
    const user = await this.findUser(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  },

  async getProducts() {
    const store = await readStore();
    return store.products;
  },

  async getRentals(email) {
    const store = await readStore();
    return store.rentals.filter(rental => rental.email === email);
  },

  async createRental(email, payload) {
    const store = await readStore();
    const rental = {
      id: `rental-${Date.now()}`,
      email,
      product: payload.productNames?.join(", ") || "Rental bundle",
      tenure: payload.tenure || "6 months",
      status: "Active",
      nextAction: `Delivery on ${payload.deliveryDate}`,
      monthlyRent: payload.monthlyRent || 0,
      city: payload.city,
      location: payload.location
    };

    store.rentals.push(rental);
    await writeStore(store);
    return rental;
  },

  async createSupportRequest(email, payload) {
    const store = await readStore();
    const request = {
      id: `support-${Date.now()}`,
      email,
      product: payload.product,
      issueType: payload.issueType,
      details: payload.details,
      status: "Open"
    };

    store.supportRequests.push(request);
    await writeStore(store);
    return request;
  },

  async getAdminSummary() {
    const store = await readStore();
    const pendingDeliveries = store.rentals.filter(rental => rental.nextAction?.includes("Delivery")).length + 16;
    return {
      metrics: {
        mrr: store.rentals.reduce((sum, rental) => sum + Number(rental.monthlyRent || 0), 0) + 248000,
        openRequests: store.supportRequests.filter(request => request.status === "Open").length + 7,
        pendingDeliveries,
        damageClaims: 3
      },
      products: store.products,
      supportRequests: store.supportRequests
    };
  },

  async restock() {
    const store = await readStore();
    store.products = store.products.map(product => ({
      ...product,
      stock: product.stock < 45 ? Math.min(product.stock + 18, 100) : product.stock
    }));
    await writeStore(store);
    return store.products;
  }
};
