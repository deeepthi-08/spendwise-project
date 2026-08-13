"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:4000";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Name, email and password are required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      alert("Signup successful! Please login.");

      router.push("/login");
    } catch (error) {
      console.error("Signup error:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Signup failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-purple-50 p-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-fuchsia-700">Create Account</h1>

        <p className="mt-2 text-gray-500">Create your SpendWise account</p>

        <input
          className="mt-6 w-full rounded-lg border p-3"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="mt-3 w-full rounded-lg border p-3"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="mt-3 w-full rounded-lg border p-3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="mt-3 text-sm font-semibold text-red-600">⚠️ {error}</p>
        )}

        <button
          onClick={handleSignup}
          disabled={loading}
          className="mt-5 w-full rounded-full bg-fuchsia-700 px-5 py-3 text-white"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="font-semibold text-fuchsia-700"
          >
            Login
          </button>
        </p>
      </section>
    </main>
  );
}
