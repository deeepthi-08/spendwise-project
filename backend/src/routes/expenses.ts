import express from "express";
import pool from "../db";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM expenses"
        );

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching expenses"
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const {
            user_id,
            category_id,
            amount,
            description,
            expense_date
        } = req.body;
        if (!user_id || !category_id || !amount || !description || !expense_date) {
    return res.status(400).json({
        message: "All fields are required"
    });
}

if (amount <= 0) {
    return res.status(400).json({
        message: "Amount must be greater than zero"
    });
}

        const result = await pool.query(
            `INSERT INTO expenses
            (user_id, category_id, amount, description, expense_date)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [user_id, category_id, amount, description, expense_date]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Database error:",error);
        res.status(500).json({
            message: "Error creating expense"
        });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            amount,
            description,
            expense_date
        } = req.body;
if (!amount || !description || !expense_date) {
    return res.status(400).json({
        message: "All fields are required"
    });
}
if (amount <= 0) {
    return res.status(400).json({
        message: "Amount must be greater than zero"
    });
}

        const result = await pool.query(
            `UPDATE expenses
             SET amount = $1,
                 description = $2,
                 expense_date = $3
             WHERE id = $4
             RETURNING *`,
            [
                amount,
                description,
                expense_date,
                id
            ]
        );
console.log(result.rows);

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            message: "Error updating expense"
        });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM expenses
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        res.json({
            message: "Expense deleted successfully",
            deletedExpense: result.rows[0]
        });

    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            message: "Error deleting expense"
        });
    }
});
export default router;