import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

const API_URL = "http://192.168.0.2:4000";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.token || !data.user || !data.user.id) {
        throw new Error("Invalid login response");
      }

      await SecureStore.setItemAsync("jwt_token", data.token);

      await SecureStore.setItemAsync("user_id", String(data.user.id));

      router.replace("/(tabs)");
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      Alert.alert(
        "Login Failed",
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SpendWise</Text>

      <Text style={styles.subtitle}>Login to your account</Text>

      <Text style={styles.label}>Email</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don&apos;t have an account?</Text>

        <TouchableOpacity onPress={() => router.push("/signup" as any)}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f5f9ff",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2563eb",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 30,
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },

  label: {
    marginTop: 12,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#ffffff",
  },

  button: {
    marginTop: 20,
    borderRadius: 25,
    padding: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },

  signupText: {
    color: "#6b7280",
    fontSize: 15,
  },

  signupLink: {
    marginLeft: 5,
    color: "#2563eb",
    fontSize: 15,
    fontWeight: "bold",
  },
});
