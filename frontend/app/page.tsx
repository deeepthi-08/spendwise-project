"use client";

import { useState, useEffect } from "react";

type Expense = {
  id: number;
  user_id: number;
  category_id: number;
  amount: string;
  description: string;
  expense_date: string;
};

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
  console.log("EditingExpense value:", editingExpense);

// this is PUT EXPENSE

  useEffect(() => {
  async function fetchExpenses() {
    try {
      const response = await fetch(
        "http://localhost:4000/expenses"
      );

      console.log("Status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }

      const data = await response.json();

      console.log("Expenses:", data);

      setExpenses(data);

    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  fetchExpenses();
}, []);

// this is the POST expense..
async function addExpense() {
  try {
    const response = await fetch(
      "http://localhost:4000/expenses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: 1,
          category_id: Number(categoryId),
          amount: Number(amount),
          description,
          expense_date: expenseDate,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to add expense");
    }

    const newExpense = await response.json();

    setExpenses([...expenses, newExpense]);

    // clear form
    setDescription("");
    setAmount("");
    setExpenseDate("");

  } catch (error) {
    console.error("Add expense error:", error);
  }
}
// this is for UPDATE EXPENSE
async function updateExpense() {
  if (!editingExpense) return;

  try {
    const response = await fetch(
      `http://localhost:4000/expenses/${editingExpense.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          description,
          expense_date: expenseDate,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update expense");
    }

    const updatedExpense = await response.json();

    setExpenses(
      expenses.map((expense) =>
        expense.id === updatedExpense.id
          ? updatedExpense
          : expense
      )
    );

    setEditingExpense(null);
    setDescription("");
    setAmount("");
    setExpenseDate("");

  } catch (error) {
    console.error("Update expense error:", error);
  }
}
// THIS IS FOR DELETE EXPENSE
async function deleteExpense(id: number) {
  try {
    const response = await fetch(
      `http://localhost:4000/expenses/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete expense");
    }

    setExpenses(
      expenses.filter((expense) => expense.id !== id)
    );

  } catch (error) {
    console.error("Delete expense error:", error);
  }
}
return (
  <main className="min-h-screen bg-purple-50 p-8">

    {/* Header */}
    <section className="rounded-2xl bg-fuchsia-700 p-5 text-white shadow-lg">

      <h1 className="text-3xl font-bold">
        💰 SpendWise
      </h1>

      <p className="mt-2 text-fuchsia-100">
        Track your expenses effortlessly
      </p>

    </section>


    {/* Summary Cards */}
    <section className="mt-6 grid grid-cols-4 gap-4 items-start">

{/* this is a part where its for ADD EXPENSE */}

    <section className="col-span-2 rounded-2xl bg-white p-6 shadow">

  <h2 className="text-2xl font-bold">
    Add Expense
  </h2>


  <input
    className="mt-3 w-full rounded-lg border p-2 text-sm"
    placeholder="Description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
  />


  <input
    className="mt-3 w-full rounded-lg border p-2 text-sm"
    placeholder="Amount"
    type="number"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
  />

  {/* <input
  className="mt-3 w-full rounded-lg border p-2 text-sm"
  placeholder="Category ID"
  type="number"
  value={categoryId}
  onChange={(e) => setCategoryId(e.target.value)}
/> */}

{/* "this is for CATEGORY,TYPES" */}
<select
  className="mt-3 w-full rounded-lg border p-2 text-sm"
  value={categoryId}
  onChange={(e) => setCategoryId(e.target.value)}
>

  <option value="1">
    Food
  </option>

  <option value="2">
    Transport
  </option>

  <option value="3">
    Shopping
  </option>

</select>


  <input
    className="mt-3 w-full rounded-lg border p-2 text-sm"
    type="date"
    value={expenseDate}
    onChange={(e) => setExpenseDate(e.target.value)}
  />

{/* BUTTON  */}
  <button
    onClick={editingExpense ? updateExpense : addExpense}
    className="mt-3 rounded-full bg-fuchsia-700 px-5 py-2 text-sm text-white"
  >
     {editingExpense ? "Update Expense" : "Add Expense"}
  </button>

</section>  


      {/* Total Expense */}
      <div className="rounded-lg bg-white p-3 shadow">

        <h2 className="text-xs text-gray-500">
          Total Expenses
        </h2>

        <p className="mt-1 text-lg font-bold text-fuchsia-700">
          ₹
          {expenses.reduce(
            (total, expense) =>
              total + Number(expense.amount),
            0
          )}
        </p>

      </div>


      {/* Number of Expenses */}
      <div className="rounded-lg bg-white p-3 shadow">

        <h2 className="text-xs text-gray-500">
          Number of Expenses
        </h2>

        <p className="mt-1 text-lg font-bold text-fuchsia-700">
          {expenses.length}
        </p>

      </div>


      {/* Categories */}
      <div className="rounded-lg bg-white p-3 shadow">

        <h2 className="text-xs text-gray-500">
          Categories
        </h2>

        <p className="mt-1 text-lg font-bold text-fuchsia-700">
         3 
        </p>

      </div>

    </section>


    {/* Expense List */}
    <section className="mt-8 rounded-2xl bg-white p-6 shadow">

      <h2 className="text-2xl font-bold">
        Recent Expenses
      </h2>


      <div className="mt-6 space-y-4">

        {expenses.map((expense) => (

<div
  key={expense.id}
  className="flex justify-between rounded-lg bg-fuchsia-50 p-4"
>

  <div className="flex flex-col">
    <span className="font-medium">
      {expense.description}
    </span>

    <span className="text-sm text-gray-500">
      {categories[expense.category_id]}
    </span>
  </div>


  <div className="flex items-center gap-3">
    <span className="font-bold">
      ₹{expense.amount}
    </span>

    <button
           
        onClick={() => {     
    setEditingExpense(expense);
    setDescription(expense.description);
    setAmount(expense.amount);
    setCategoryId(String(expense.category_id));
    setExpenseDate(expense.expense_date.split("T")[0]);
  }}
  className="rounded-lg bg-fuchsia-700 px-3 py-1 text-sm text-white"
>
  Edit
</button>

<button
  onClick={() =>{
  if (confirm("Are you sure you want to delete this expense?")){
     deleteExpense(expense.id)
  }
  }}
  className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white"
>
  Delete
</button>

          </div>
        </div>
        ))}

      </div>

    </section>


  </main>
);
}