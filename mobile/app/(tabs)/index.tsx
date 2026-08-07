import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";

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

export default function HomeScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    async function fetchExpenses() {
      try {
        const response = await fetch(
          "http://192.168.0.2:4000/expenses"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch expenses");
        }

        const data = await response.json();
        console.log("mobile expense:", data);
        setExpenses(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }

    fetchExpenses();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>💰 SpendWise</Text>

      <Text style={styles.subtitle}>Recent Expenses</Text>

      {expenses.map((expense) => (
        <View key={expense.id} style={styles.expenseCard}>
          <Text style={styles.description}>
            {expense.description}
          </Text>

          <Text style={styles.category}>
            {categories[expense.category_id]}
          </Text>

          <Text style={styles.amount}>
            ₹{expense.amount}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#faf5ff",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 30,
  },

  subtitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  expenseCard: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
  },

  description: {
    fontSize: 18,
    fontWeight: "600",
  },

  category: {
    fontSize: 14,
    color: "gray",
    marginTop: 4,
  },

  amount: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
});