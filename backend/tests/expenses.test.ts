import request from "supertest";
import app from "../src/server";

describe("Expenses API", () => {
  let token: string;
  let expenseId: number;

  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = "TestPassword123";

  beforeAll(async () => {
    // Create test user
    const signupResponse = await request(app)
      .post("/auth/signup")
      .send({
        name: "Test User",
        email: testEmail,
        password: testPassword,
      });

    expect(signupResponse.status).toBe(201);

    // Login test user
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(loginResponse.status).toBe(200);

    token = loginResponse.body.token;
  });

  test("GET /expenses should return all expenses", async () => {
    const response = await request(app)
      .get("/expenses")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("POST /expenses should create a new expense", async () => {
    const response = await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        category_id: 1,
        amount: 200,
        description: "Test expense",
        expense_date: "2026-07-30",
      });

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body.description).toBe("Test expense");

    expenseId = response.body.id;
  });

  test("PUT /expenses/:id should update an expense", async () => {
    const response = await request(app)
      .put(`/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 300,
        description: "Updated expense",
        expense_date: "2026-07-30",
      });

    expect(response.status).toBe(200);
    expect(response.body.description).toBe("Updated expense");
  });

  test("DELETE /expenses/:id should delete an expense", async () => {
    const response = await request(app)
      .delete(`/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "Expense deleted successfully"
    );
  });
});