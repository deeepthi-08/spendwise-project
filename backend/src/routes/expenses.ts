import express from "express";
import pool from "../db";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// GET EXPENSES
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { category_id } = req.query;

    let query = `
      SELECT *
      FROM expenses
      WHERE user_id = $1
    `;

    const values: any[] = [userId];

    if (category_id) {
      query += ` AND category_id = $2`;
      values.push(category_id);
    }

    query += ` ORDER BY expense_date DESC, id DESC`;

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      message: "Error fetching expenses",
    });
  }
});

// POST EXPENSE
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const {
      category_id,
      amount,
      description,
      expense_date,
    } = req.body;

    if (
      !category_id ||
      !amount ||
      !description ||
      !expense_date
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than zero",
      });
    }

    const result = await pool.query(
      `INSERT INTO expenses
       (user_id, category_id, amount, description, expense_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        userId,
        category_id,
        amount,
        description,
        expense_date,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      message: "Error creating expense",
    });
  }
});

// UPDATE EXPENSE
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const {
      amount,
      description,
      expense_date,
    } = req.body;

    if (!amount || !description || !expense_date) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than zero",
      });
    }

    const result = await pool.query(
      `UPDATE expenses
       SET amount = $1,
           description = $2,
           expense_date = $3
       WHERE id = $4
       AND user_id = $5
       RETURNING *`,
      [
        amount,
        description,
        expense_date,
        id,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      message: "Error updating expense",
    });
  }
});

// DELETE EXPENSE
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM expenses
       WHERE id = $1
       AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.json({
      message: "Expense deleted successfully",
      deletedExpense: result.rows[0],
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      message: "Error deleting expense",
    });
  }
});

export default router;