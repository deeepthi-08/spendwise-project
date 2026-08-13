"use client";

import { useEffect, useMemo, useState } from "react";

type Expense = {
  id: number;
  user_id: number;
  category_id: number;
  amount: string;
  description: string;
  expense_date: string;
};

type User = {
  id: number;
  name: string;
  email: string;
};

const API_URL = "http://localhost:4000";

const categories: Record<number, string> = {
  1: "Food",
  2: "Transport",
  3: "Shopping",
};

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("1");
  const [expenseDate, setExpenseDate] = useState("");

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // --------------------------------------------------
  // GET LOGGED-IN USER
  // --------------------------------------------------

  function getLoggedInUser(): User | null {
    try {
      const userData = localStorage.getItem("user");

      if (!userData) {
        return null;
      }

      const user = JSON.parse(userData);

      if (!user || !user.id) {
        return null;
      }

      return user;
    } catch (error) {
      console.error("User data error:", error);
      return null;
    }
  }

  // --------------------------------------------------
  // GET EXPENSES
  // --------------------------------------------------

  async function fetchExpenses() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/expenses`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setError("Your session has expired. Please login again.");
        setLoading(false);

        return;
      }

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Expenses API status:", response.status);
        console.error("Expenses API response:", errorText);

        throw new Error(`Failed to fetch expenses: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setExpenses(data);
      } else {
        setExpenses([]);
        console.error("Unexpected expenses response:", data);
      }
    } catch (error) {
      console.error("Fetch expenses error:", error);

      if (error instanceof TypeError) {
        setError(
          "Unable to connect to the backend. Make sure the backend is running."
        );
      } else {
        setError(
          error instanceof Error ? error.message : "Failed to load expenses"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // LOAD EXPENSES
  // --------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExpenses();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // --------------------------------------------------
  // SEARCH + FILTER
  // --------------------------------------------------

  const filteredExpenses = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return expenses.filter((expense) => {
      const categoryName = categories[expense.category_id] || "Unknown";

      const matchesSearch =
        expense.description.toLowerCase().includes(search) ||
        categoryName.toLowerCase().includes(search) ||
        expense.amount.toString().includes(search);

      const matchesCategory =
        filterCategory === "all" ||
        expense.category_id === Number(filterCategory);

      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, filterCategory]);

  // --------------------------------------------------
  // SUMMARY CALCULATIONS
  // --------------------------------------------------

  const totalExpenses = useMemo(() => {
    return expenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0
    );
  }, [expenses]);

  const numberOfExpenses = expenses.length;

  const averageExpense =
    numberOfExpenses > 0 ? totalExpenses / numberOfExpenses : 0;

  const largestExpense =
    expenses.length > 0
      ? Math.max(...expenses.map((expense) => Number(expense.amount)))
      : 0;

  // --------------------------------------------------
  // MONTH-WISE EXPENSE
  // --------------------------------------------------

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = useMemo(() => {
    return expenses.reduce((total, expense) => {
      const date = new Date(expense.expense_date);

      if (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      ) {
        return total + Number(expense.amount);
      }

      return total;
    }, 0);
  }, [expenses, currentMonth, currentYear]);

  // --------------------------------------------------
  // ADD EXPENSE
  // --------------------------------------------------

  async function addExpense() {
    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (!amount.trim()) {
      setError("Amount is required");
      return;
    }

    const amountNumber = Number(amount);

    if (isNaN(amountNumber) || amountNumber <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (!expenseDate.trim()) {
      setError("Date is required");
      return;
    }

    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first");
        return;
      }

      const user = getLoggedInUser();

      if (!user) {
        setError("User information not found. Please login again.");
        return;
      }

      console.log("Adding expense for user:", user.id);

      const response = await fetch(`${API_URL}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          category_id: Number(categoryId),
          amount: amountNumber,
          description: description.trim(),
          expense_date: expenseDate,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setError("Your session has expired. Please login again.");

        return;
      }

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Add expense status:", response.status);

        console.error("Add expense response:", errorText);

        throw new Error(`Failed to add expense: ${response.status}`);
      }

      const newExpense = await response.json();

      setExpenses((previousExpenses) => [...previousExpenses, newExpense]);

      setDescription("");
      setAmount("");
      setCategoryId("1");
      setExpenseDate("");

      setError("");
    } catch (error) {
      console.error("Add expense error:", error);

      setError(
        error instanceof Error ? error.message : "Failed to add expense"
      );
    }
  }

  // --------------------------------------------------
  // UPDATE EXPENSE
  // --------------------------------------------------

  async function updateExpense() {
    if (!editingExpense) {
      return;
    }

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (!amount.trim()) {
      setError("Amount is required");
      return;
    }

    const amountNumber = Number(amount);

    if (isNaN(amountNumber) || amountNumber <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (!expenseDate.trim()) {
      setError("Date is required");
      return;
    }

    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first");
        return;
      }

      const response = await fetch(`${API_URL}/expenses/${editingExpense.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amountNumber,
          description: description.trim(),
          expense_date: expenseDate,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setError("Your session has expired. Please login again.");

        return;
      }

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Update expense status:", response.status);

        console.error("Update expense response:", errorText);

        throw new Error(`Failed to update expense: ${response.status}`);
      }

      const updatedExpense = await response.json();

      setExpenses((previousExpenses) =>
        previousExpenses.map((expense) =>
          expense.id === updatedExpense.id ? updatedExpense : expense
        )
      );

      setEditingExpense(null);
      setDescription("");
      setAmount("");
      setCategoryId("1");
      setExpenseDate("");
    } catch (error) {
      console.error("Update expense error:", error);

      setError(
        error instanceof Error ? error.message : "Failed to update expense"
      );
    }
  }

  // --------------------------------------------------
  // DELETE EXPENSE
  // --------------------------------------------------

  async function deleteExpense(id: number) {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first");
        return;
      }

      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setError("Your session has expired. Please login again.");

        return;
      }

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Delete expense status:", response.status);

        console.error("Delete expense response:", errorText);

        throw new Error(`Failed to delete expense: ${response.status}`);
      }

      setExpenses((previousExpenses) =>
        previousExpenses.filter((expense) => expense.id !== id)
      );
    } catch (error) {
      console.error("Delete expense error:", error);

      setError(
        error instanceof Error ? error.message : "Failed to delete expense"
      );
    }
  }

  // --------------------------------------------------
  // START EDIT
  // --------------------------------------------------

  function startEdit(expense: Expense) {
    setEditingExpense(expense);

    setDescription(expense.description);
    setAmount(String(expense.amount));
    setCategoryId(String(expense.category_id));

    setExpenseDate(expense.expense_date.split("T")[0]);

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // --------------------------------------------------
  // CANCEL EDIT
  // --------------------------------------------------

  function cancelEdit() {
    setEditingExpense(null);
    setDescription("");
    setAmount("");
    setCategoryId("1");
    setExpenseDate("");
    setError("");
  }

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  }

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  function formatDate(dateString: string) {
    const date = dateString.split("T")[0];

    const parts = date.split("-");

    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return date;
  }

  return (
    <main className="min-h-screen bg-purple-50 p-8">
      {/* HEADER */}

      <section className="rounded-2xl bg-fuchsia-700 p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">💰 SpendWise</h1>

            <p className="mt-2 text-fuchsia-100">
              Track your expenses effortlessly
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg bg-white px-5 py-2 font-semibold text-fuchsia-700 hover:bg-fuchsia-50"
          >
            Logout
          </button>
        </div>
      </section>

      {/* ERROR */}

      {error && (
        <section className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-600">⚠️ {error}</p>

          {error.toLowerCase().includes("login") ||
          error.toLowerCase().includes("session") ? (
            <button
              onClick={() => {
                window.location.href = "/login";
              }}
              className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Go to Login
            </button>
          ) : null}
        </section>
      )}

      {/* SUMMARY CARDS */}

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Total Expenses</p>

          <p className="mt-2 text-2xl font-bold text-fuchsia-700">
            ₹{totalExpenses.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Transactions</p>

          <p className="mt-2 text-2xl font-bold text-fuchsia-700">
            {numberOfExpenses}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Average Expense</p>

          <p className="mt-2 text-2xl font-bold text-fuchsia-700">
            ₹{averageExpense.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Largest Expense</p>

          <p className="mt-2 text-2xl font-bold text-fuchsia-700">
            ₹{largestExpense.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">This Month</p>

          <p className="mt-2 text-2xl font-bold text-fuchsia-700">
            ₹{currentMonthExpenses.toFixed(2)}
          </p>
        </div>
      </section>

      {/* ADD / EDIT EXPENSE */}

      <section className="mt-6 rounded-2xl bg-white p-6 shadow">
        <h2 className="text-2xl font-bold">
          {editingExpense ? "Edit Expense" : "Add Expense"}
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          <input
            className="rounded-lg border p-3"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            className="rounded-lg border p-3"
            placeholder="Amount"
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <select
            className="rounded-lg border p-3"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="1">Food</option>

            <option value="2">Transport</option>

            <option value="3">Shopping</option>
          </select>

          <input
            className="rounded-lg border p-3"
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <button
            onClick={editingExpense ? updateExpense : addExpense}
            className="rounded-full bg-fuchsia-700 px-6 py-3 font-semibold text-white hover:bg-fuchsia-800"
          >
            {editingExpense ? "Update Expense" : "Add Expense"}
          </button>

          {editingExpense && (
            <button
              onClick={cancelEdit}
              className="ml-3 rounded-full border border-fuchsia-700 px-6 py-3 font-semibold text-fuchsia-700"
            >
              Cancel
            </button>
          )}
        </div>
      </section>

      {/* SEARCH + FILTER */}

      <section className="mt-6 rounded-2xl bg-white p-6 shadow">
        <h2 className="text-xl font-bold">Search & Filter</h2>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            className="rounded-lg border p-3"
            placeholder="Search description, category or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="rounded-lg border p-3"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>

            <option value="1">Food</option>

            <option value="2">Transport</option>

            <option value="3">Shopping</option>
          </select>
        </div>
      </section>

      {/* EXPENSE LIST */}

      <section className="mt-6 rounded-2xl bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Expenses</h2>

          <p className="text-sm text-gray-500">
            Showing {filteredExpenses.length} of {expenses.length}
          </p>
        </div>

        {loading ? (
          <p className="mt-6 text-gray-500">Loading expenses...</p>
        ) : filteredExpenses.length === 0 ? (
          <p className="mt-6 text-gray-500">No expenses found.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex flex-col justify-between gap-4 rounded-lg bg-fuchsia-50 p-4 md:flex-row md:items-center"
              >
                <div className="flex flex-col">
                  <span className="font-semibold">{expense.description}</span>

                  <span className="text-sm text-gray-500">
                    {categories[expense.category_id] || "Unknown Category"}
                  </span>

                  <span className="text-sm text-gray-500">
                    {formatDate(expense.expense_date)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold">
                    ₹{Number(expense.amount).toFixed(2)}
                  </span>

                  <button
                    onClick={() => startEdit(expense)}
                    className="rounded-lg bg-fuchsia-700 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-800"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      const confirmed = window.confirm(
                        "Are you sure you want to delete this expense?"
                      );

                      if (confirmed) {
                        deleteExpense(expense.id);
                      }
                    }}
                    className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
