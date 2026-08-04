import express from "express";
import cors from "cors";
import pool from "./db";
import expenseRoutes from "./routes/expenses";

const app = express();

const PORT = 4000;


// Allow requests from Next.js frontend
app.use(
  cors({
    origin: "http://localhost:3000",
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


// Expense routes
app.use("/expenses", expenseRoutes);


// Start server
app.listen(PORT, () => {
  console.log("Database connected");
  console.log(`Server running on port ${PORT}`);
});

export default app;