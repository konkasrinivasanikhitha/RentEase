import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import app from "./app.js";

const port = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "..", "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`RentEase API running on http://127.0.0.1:${port}`);
});
