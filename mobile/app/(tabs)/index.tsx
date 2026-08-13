import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

type Expense = {
  id: number;
  user_id: number;
  category_id: number;
  amount: string;
  description: string;
  expense_date: string;
};

const API_URL = "http://192.168.0.2:4000";

const categories: Record<number, string> = {
  1: "Food",
  2: "Transport",
  3: "Shopping",
};

export default function HomeScreen() {
  const router = useRouter();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("1");
  const [expenseDate, setExpenseDate] = useState("");

  const [editingExpense, setEditingExpense] =
    useState<Expense | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // --------------------------------------------------
  // GET TOKEN
  // --------------------------------------------------

  async function getToken() {
    return await SecureStore.getItemAsync("jwt_token");
  }

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  async function logout() {
    await SecureStore.deleteItemAsync("jwt_token");
    await SecureStore.deleteItemAsync("user_id");

    router.replace("/login");
  }

  // --------------------------------------------------
  // GET EXPENSES
  // --------------------------------------------------

  async function fetchExpenses() {
    try {
      setLoading(true);
      setError("");

      const token = await getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_URL}/expenses`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        await logout();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setExpenses(data);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error("Fetch expenses error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load expenses",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExpenses();
  }, []);

  // --------------------------------------------------
  // SUMMARY CALCULATIONS
  // --------------------------------------------------

  const totalExpenses = useMemo(() => {
    return expenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0,
    );
  }, [expenses]);

  const numberOfExpenses = expenses.length;

  const averageExpense =
    numberOfExpenses > 0
      ? totalExpenses / numberOfExpenses
      : 0;

  const largestExpense =
    expenses.length > 0
      ? Math.max(
          ...expenses.map((expense) =>
            Number(expense.amount),
          ),
        )
      : 0;

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
  // DATE FORMAT
  // --------------------------------------------------

  function convertToDatabaseDate(date: string) {
    const parts = date.split("-");

    if (parts.length !== 3) {
      return date;
    }

    // DD-MM-YYYY -> YYYY-MM-DD
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];

    return `${year}-${month}-${day}`;
  }

  function formatDate(dateString: string) {
    const date = dateString.split("T")[0];

    const parts = date.split("-");

    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return date;
  }

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

    const datePattern = /^\d{2}-\d{2}-\d{4}$/;

    if (!datePattern.test(expenseDate)) {
      setError("Date must be in DD-MM-YYYY format");
      return;
    }

    try {
      setError("");

      const token = await getToken();
      const userId =
        await SecureStore.getItemAsync("user_id");

      if (!token || !userId) {
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_URL}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: Number(userId),
          category_id: Number(categoryId),
          amount: amountNumber,
          description: description.trim(),
          expense_date:
            convertToDatabaseDate(expenseDate),
        }),
      });

      if (response.status === 401) {
        await logout();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to add expense");
      }

      const newExpense = await response.json();

      setExpenses((previous) => [
        ...previous,
        newExpense,
      ]);

      clearForm();
    } catch (error) {
      console.error("Add expense error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to add expense",
      );
    }
  }

  // --------------------------------------------------
  // EDIT EXPENSE
  // --------------------------------------------------

  function startEdit(expense: Expense) {
    setEditingExpense(expense);

    setDescription(expense.description);
    setAmount(String(expense.amount));
    setCategoryId(String(expense.category_id));
    setExpenseDate(
      formatDate(expense.expense_date),
    );

    setError("");
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

    const datePattern = /^\d{2}-\d{2}-\d{4}$/;

    if (!datePattern.test(expenseDate)) {
      setError("Date must be in DD-MM-YYYY format");
      return;
    }

    try {
      setError("");

      const token = await getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/expenses/${editingExpense.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: amountNumber,
            description: description.trim(),
            expense_date:
              convertToDatabaseDate(expenseDate),
          }),
        },
      );

      if (response.status === 401) {
        await logout();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update expense");
      }

      const updatedExpense = await response.json();

      setExpenses((previous) =>
        previous.map((expense) =>
          expense.id === updatedExpense.id
            ? updatedExpense
            : expense,
        ),
      );

      clearForm();
    } catch (error) {
      console.error("Update expense error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update expense",
      );
    }
  }

  // --------------------------------------------------
  // DELETE EXPENSE
  // --------------------------------------------------

  async function deleteExpense(id: number) {
    try {
      setError("");

      const token = await getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/expenses/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401) {
        await logout();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      setExpenses((previous) =>
        previous.filter(
          (expense) => expense.id !== id,
        ),
      );
    } catch (error) {
      console.error("Delete expense error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete expense",
      );
    }
  }

  // --------------------------------------------------
  // CLEAR FORM
  // --------------------------------------------------

  function clearForm() {
    setEditingExpense(null);
    setDescription("");
    setAmount("");
    setCategoryId("1");
    setExpenseDate("");
    setError("");
  }

  // --------------------------------------------------
  // SEARCH + FILTER
  // --------------------------------------------------

  const filteredExpenses = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return expenses.filter((expense) => {
      const categoryName =
        categories[expense.category_id] ||
        "Unknown";

      const matchesSearch =
        expense.description
          .toLowerCase()
          .includes(search) ||
        categoryName
          .toLowerCase()
          .includes(search) ||
        expense.amount
          .toString()
          .includes(search);

      const matchesCategory =
        filterCategory === "all" ||
        expense.category_id ===
          Number(filterCategory);

      return matchesSearch && matchesCategory;
    });
  }, [
    expenses,
    searchTerm,
    filterCategory,
  ]);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            💰 SpendWise
          </Text>

          <Text style={styles.headerSubtitle}>
            Track your expenses effortlessly
          </Text>
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              "Logout",
              "Are you sure you want to logout?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Logout",
                  style: "destructive",
                  onPress: logout,
                },
              ],
            );
          }}
        >
          <Text style={styles.logoutText}>
            Logout
          </Text>
        </Pressable>
      </View>

      {/* ERROR */}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            ⚠️ {error}
          </Text>
        </View>
      ) : null}

      {/* SUMMARY */}

      <Text style={styles.sectionTitle}>
        Overview
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.summaryScroll}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            Total Expenses
          </Text>

          <Text style={styles.summaryValue}>
            ₹{totalExpenses.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            Transactions
          </Text>

          <Text style={styles.summaryValue}>
            {numberOfExpenses}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            Average Expense
          </Text>

          <Text style={styles.summaryValue}>
            ₹{averageExpense.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            Largest Expense
          </Text>

          <Text style={styles.summaryValue}>
            ₹{largestExpense.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            This Month
          </Text>

          <Text style={styles.summaryValue}>
            ₹{currentMonthExpenses.toFixed(2)}
          </Text>
        </View>
      </ScrollView>

      {/* ADD / EDIT */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {editingExpense
            ? "Edit Expense"
            : "Add Expense"}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
        />

        <TextInput
          style={styles.input}
          placeholder="Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>
          Category
        </Text>

        <View style={styles.categoryRow}>
          <Pressable
            style={[
              styles.categoryButton,
              categoryId === "1" &&
                styles.selectedCategory,
            ]}
            onPress={() => setCategoryId("1")}
          >
            <Text
              style={[
                styles.categoryText,
                categoryId === "1" &&
                  styles.selectedCategoryText,
              ]}
            >
              Food
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.categoryButton,
              categoryId === "2" &&
                styles.selectedCategory,
            ]}
            onPress={() => setCategoryId("2")}
          >
            <Text
              style={[
                styles.categoryText,
                categoryId === "2" &&
                  styles.selectedCategoryText,
              ]}
            >
              Transport
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.categoryButton,
              categoryId === "3" &&
                styles.selectedCategory,
            ]}
            onPress={() => setCategoryId("3")}
          >
            <Text
              style={[
                styles.categoryText,
                categoryId === "3" &&
                  styles.selectedCategoryText,
              ]}
            >
              Shopping
            </Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Date: DD-MM-YYYY"
          value={expenseDate}
          onChangeText={setExpenseDate}
        />

        <Pressable
          style={styles.primaryButton}
          onPress={
            editingExpense
              ? updateExpense
              : addExpense
          }
        >
          <Text style={styles.primaryButtonText}>
            {editingExpense
              ? "Update Expense"
              : "Add Expense"}
          </Text>
        </Pressable>

        {editingExpense ? (
          <Pressable
            style={styles.cancelButton}
            onPress={clearForm}
          >
            <Text style={styles.cancelText}>
              Cancel
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* SEARCH */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Search & Filter
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Search description, category or amount..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        <Text style={styles.label}>
          Filter by Category
        </Text>

        <View style={styles.filterRow}>
          <Pressable
            style={[
              styles.filterButton,
              filterCategory === "all" &&
                styles.selectedFilter,
            ]}
            onPress={() =>
              setFilterCategory("all")
            }
          >
            <Text
              style={[
                styles.filterText,
                filterCategory === "all" &&
                  styles.selectedFilterText,
              ]}
            >
              All
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              filterCategory === "1" &&
                styles.selectedFilter,
            ]}
            onPress={() =>
              setFilterCategory("1")
            }
          >
            <Text
              style={[
                styles.filterText,
                filterCategory === "1" &&
                  styles.selectedFilterText,
              ]}
            >
              Food
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              filterCategory === "2" &&
                styles.selectedFilter,
            ]}
            onPress={() =>
              setFilterCategory("2")
            }
          >
            <Text
              style={[
                styles.filterText,
                filterCategory === "2" &&
                  styles.selectedFilterText,
              ]}
            >
              Transport
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              filterCategory === "3" &&
                styles.selectedFilter,
            ]}
            onPress={() =>
              setFilterCategory("3")
            }
          >
            <Text
              style={[
                styles.filterText,
                filterCategory === "3" &&
                  styles.selectedFilterText,
              ]}
            >
              Shopping
            </Text>
          </Pressable>
        </View>
      </View>

      {/* EXPENSE LIST */}

      <View style={styles.section}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>
            Recent Expenses
          </Text>

          <Text style={styles.showingText}>
            {filteredExpenses.length} /{" "}
            {expenses.length}
          </Text>
        </View>

        {loading ? (
          <Text style={styles.emptyText}>
            Loading expenses...
          </Text>
        ) : filteredExpenses.length === 0 ? (
          <Text style={styles.emptyText}>
            No expenses found.
          </Text>
        ) : (
          filteredExpenses.map((expense) => (
            <View
              key={expense.id}
              style={styles.expenseCard}
            >
              <View style={styles.expenseInfo}>
                <Text
                  style={styles.expenseDescription}
                >
                  {expense.description}
                </Text>

                <Text style={styles.expenseCategory}>
                  {categories[
                    expense.category_id
                  ] || "Unknown Category"}
                </Text>

                <Text style={styles.expenseDate}>
                  {formatDate(
                    expense.expense_date,
                  )}
                </Text>
              </View>

              <View style={styles.expenseRight}>
                <Text style={styles.expenseAmount}>
                  ₹
                  {Number(
                    expense.amount,
                  ).toFixed(2)}
                </Text>

                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.editButton}
                    onPress={() =>
                      startEdit(expense)
                    }
                  >
                    <Text
                      style={styles.actionText}
                    >
                      Edit
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => {
                      Alert.alert(
                        "Delete Expense",
                        "Are you sure you want to delete this expense?",
                        [
                          {
                            text: "Cancel",
                            style: "cancel",
                          },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: () =>
                              deleteExpense(
                                expense.id,
                              ),
                          },
                        ],
                      );
                    }}
                  >
                    <Text
                      style={styles.actionText}
                    >
                      Delete
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f9ff",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  header: {
    backgroundColor: "#2563eb",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
  },

  headerSubtitle: {
    marginTop: 5,
    color: "#dbeafe",
    fontSize: 13,
  },

  logoutButton: {
    backgroundColor: "white",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 9,
  },

  logoutText: {
    color: "#2563eb",
    fontWeight: "bold",
  },

  errorBox: {
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  errorText: {
    color: "#dc2626",
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },

  summaryScroll: {
    marginBottom: 20,
  },

  summaryCard: {
    width: 155,
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    marginRight: 12,
    elevation: 3,
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  summaryLabel: {
    fontSize: 13,
    color: "#6b7280",
  },

  summaryValue: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563eb",
  },

  section: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    elevation: 2,
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 13,
    marginBottom: 12,
    backgroundColor: "#ffffff",
    fontSize: 15,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },

  categoryRow: {
    flexDirection: "row",
    marginBottom: 12,
  },

  categoryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 9,
    paddingVertical: 11,
    marginRight: 6,
    alignItems: "center",
  },

  selectedCategory: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  categoryText: {
    fontWeight: "600",
    color: "#374151",
  },

  selectedCategoryText: {
    color: "white",
  },

  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },

  cancelButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 10,
    padding: 13,
    alignItems: "center",
  },

  cancelText: {
    color: "#2563eb",
    fontWeight: "bold",
  },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  filterButton: {
    backgroundColor: "#e5e7eb",
    borderRadius: 9,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },

  selectedFilter: {
    backgroundColor: "#2563eb",
  },

  filterText: {
    color: "#374151",
    fontWeight: "600",
  },

  selectedFilterText: {
    color: "white",
  },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  showingText: {
    color: "#6b7280",
    fontSize: 12,
  },

  emptyText: {
    color: "#6b7280",
    paddingVertical: 20,
    textAlign: "center",
  },

  expenseCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },

  expenseInfo: {
    marginBottom: 12,
  },

  expenseDescription: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
  },

  expenseCategory: {
    marginTop: 4,
    fontSize: 13,
    color: "#2563eb",
    fontWeight: "600",
  },

  expenseDate: {
    marginTop: 3,
    fontSize: 12,
    color: "#6b7280",
  },

  expenseRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  expenseAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  actionRow: {
    flexDirection: "row",
  },

  editButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginRight: 8,
  },

  deleteButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  actionText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
});