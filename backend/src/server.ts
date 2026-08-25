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

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

// Health check
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Health check database error:", error);

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

// Categories routes
app.use("/categories", categoryRoutes);

// Start server only when this file is run directly
if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;