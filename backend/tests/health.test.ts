import request from "supertest";
import app from "../src/server";

describe("Health Check API", () => {

    test("GET /health should return status ok", async () => {

        const response = await request(app).get("/health");

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            status: "ok",
            message: "hello healthcheck"
        });

    });

});