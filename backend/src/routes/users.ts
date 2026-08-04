import express from "express";
import pool from "../db";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { name, email } = req.body;

        const result = await pool.query(
            `INSERT INTO users (name, email)
             VALUES ($1, $2)
             RETURNING *`,
            [name, email]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            message: "Error creating user"
        });
    }
});

router.get("/", async (req, res) => {
    try {

        const result = await pool.query(
            "SELECT * FROM users"
        );

        res.json(result.rows);

    } catch (error) {

        console.error("Database error:", error);

        res.status(500).json({
            message: "Error fetching users"
        });

    }
});

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const { name, email } = req.body;

        const result = await pool.query(
            `UPDATE users
             SET name = $1,
                 email = $2
             WHERE id = $3
             RETURNING *`,
            [name, email, id]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            message: "Error updating user"
        });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM users
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        res.json({
            message: "User deleted successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            message: "Error deleting user"
        });
    }
});

export default router;