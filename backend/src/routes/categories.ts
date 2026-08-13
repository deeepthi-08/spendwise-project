import express from "express";
import pool from "../db";

const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM categories ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Category error:", error);

    res.status(500).json({
      message: "Error fetching categories",
    });
  }
});

export default router;