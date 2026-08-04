"use client";

import { useEffect, useState } from "react";

// Expense data type coming from backend API
type Expense = {
  id: number;
  user_id: number;
  category_id: number;
  amount: string;
  description: string;
  expense_date: string;
};

export default function Home() {

  // Store expenses received from backend
  const [expenses, setExpenses] = useState<Expense[]>([]);


  // Fetch expenses when page loads
  useEffect(() => {

    async function fetchExpenses() {

      try {

        // Calling backend API running on port 4000
        const response = await fetch(
          "http://127.0.0.1:4000/expenses"
        );


        // Check backend response status
        console.log("Response status:", response.status);


        if (!response.ok) {
          throw new Error("Failed to fetch expenses");
        }


        // Convert response into JSON data
        const data = await response.json();


        // Check data received from backend
        console.log("Data from backend:", data);


        // Store expenses in React state
        setExpenses(data);


      } catch (error) {

        // Show connection error
        console.error("Fetch error:", error);

      }

    }


    fetchExpenses();

  }, []);



  return (
    <main className="min-h-screen bg-purple-50 p-8">


      {/* Header */}
      <section className="rounded-2xl bg-fuchsia-700 p-8 text-white shadow-lg">

        <h1 className="text-4xl font-bold">
          💰 SpendWise
        </h1>

        <p className="mt-2 text-fuchsia-100">
          Track your expenses effortlessly
        </p>

      </section>



      {/* Summary Cards */}
      <section className="mt-8 grid gap-6 md:grid-cols-3">


        {/* Total Expense */}
        <div className="rounded-2xl bg-white p-6 shadow">

          <h2 className="text-gray-500">
            Total Expenses
          </h2>

          <p className="mt-2 text-3xl font-bold text-fuchsia-700">

            ₹
            {expenses.reduce(
              (total, expense) =>
                total + Number(expense.amount),
              0
            )}

          </p>

        </div>



        {/* Expense Count */}
        <div className="rounded-2xl bg-white p-6 shadow">

          <h2 className="text-gray-500">
            Number of Expenses
          </h2>

          <p className="mt-2 text-3xl font-bold text-fuchsia-700">
            {expenses.length}
          </p>

        </div>



        {/* Categories */}
        <div className="rounded-2xl bg-white p-6 shadow">

          <h2 className="text-gray-500">
            Categories
          </h2>

          <p className="mt-2 text-3xl font-bold text-fuchsia-700">
            3
          </p>

        </div>


      </section>




      {/* Recent Expenses */}
      <section className="mt-8 rounded-2xl bg-white p-6 shadow">


        <div className="flex items-center justify-between">


          <h2 className="text-2xl font-bold">
            Recent Expenses
          </h2>


          <button className="rounded-lg bg-fuchsia-700 px-4 py-2 text-white hover:bg-fuchsia-800">

            + Add Expense

          </button>


        </div>




        {/* Display expenses received from backend */}
        <div className="mt-6 space-y-4">


          {expenses.map((expense) => (

            <div
              key={expense.id}
              className="flex justify-between rounded-lg bg-fuchsia-50 p-4"
            >

              <span>
                {expense.description}
              </span>


              <span className="font-bold">
                ₹{expense.amount}
              </span>


            </div>

          ))}


        </div>


      </section>


    </main>
  );
}