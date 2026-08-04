import request from "supertest";
import app from "../src/server";

describe("Expenses API", () => {

    test("GET /expenses should return all expenses", async () => {

        const response = await request(app).get("/expenses");

        expect(response.status).toBe(200);

        expect(Array.isArray(response.body)).toBe(true);

    });

});

test("POST /expenses should create a new expense", async () => {

    const response = await request(app)
        .post("/expenses")
        .send({
            user_id: 1,
            category_id: 1,
            amount: 200,
            description: "Test expense",
            expense_date: "2026-07-30"
        });

    expect(response.status).toBe(201);

    expect(response.body).toHaveProperty("id");
    expect(response.body.description).toBe("Test expense");

});

test("PUT /expenses/:id should update an expense", async () => {

    const response = await request(app)
        .put("/expenses/2")
        .send({
            amount: 300,
            description: "Updated expense",
            expense_date: "2026-07-30"
        });
     
    // console.log("STATUS:", response.status);
    // console.log("BODY:", response.body);

    // expect(response.status).toBe(200);

    console.log(response.body);

    expect(response.status).toBe(200);

    expect(response.body.description).toBe("Updated expense");

});

test("DELETE /expenses/:id should delete an expense", async () => {

    const response = await request(app)
        .delete("/expenses/11");

    expect(response.status).toBe(200);

    expect(response.body.message).toBe("Expense deleted successfully");

});