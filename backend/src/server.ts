import express from "express";
import cors from "cors";
import pool from "./db";

import expenseRoutes from "./routes/expenses";
import authRoutes from "./routes/auth";
import categoryRoutes from "./routes/categories";

const app = express();

const PORT = 4000;

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://localhost:8081",
];

// Allow requests from frontend/mobile
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Parse JSON body
app.use(express.json());

// Health check
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

// Auth routes
app.use("/auth", authRoutes);

// Expense routes
app.use("/expenses", expenseRoutes);

// categories routes
app.use("/categories", categoryRoutes);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log("Database connected");
  console.log(`Server running on port ${PORT}`);
});

export default app;