import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";

export default function WelcomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Checking authentication...");

  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      // Check if user is authenticated
      setLoadingMessage("Checking authentication...");
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error checking auth:", error);
        setLoading(false);
        return;
      }

      if (!session) {
        // No active session, stay on welcome screen
        setLoading(false);
        return;
      }

      // User is authenticated, check if they exist in profiles table
      setLoadingMessage("Verifying user profile...");
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        // An error occurred, but not the "no rows returned" error
        console.error("Error checking profile:", profileError);
        setLoading(false);
        return;
      }

      setLoading(false);

      if (profileData) {
        // User exists in profiles table, redirect to dashboard
        router.push("/dashboard");
      } else {
        // User is authenticated but doesn't have a profile
        console.log("User authenticated but no profile found");
      }
    } catch (error) {
      console.error("Session/profile check failed:", error);
      setLoading(false);
    }
  };

  const handleButtonPress = () => {
    router.push("/login-screen");
  };

  // -----------
  // LOADING STATE
  // -----------
  if (loading) {
    return (
      <LinearGradient colors={["#36D1DC", "#5B86E5"]} style={styles.gradientBackground}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>{loadingMessage}</Text>
        </View>
      </LinearGradient>
    );
  }

  // ---------------
  // WELCOME SCREEN
  // ---------------
  return (
    <LinearGradient colors={["#36D1DC", "#5B86E5"]} style={styles.gradientBackground}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Accountable</Text>
          <Text style={styles.subtitle}>Creating better habits doesn't have to be done solo</Text>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleButtonPress}>
          <Text style={styles.buttonText}>Login using SMS</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

// =========================================
// ============     STYLES     ============
// =========================================
const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    // Center all content vertically
    justifyContent: "center",
    // Center horizontally
    alignItems: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 24,
  },
  // =====================
  // LOADING (Spinner) State
  // =====================
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  // =====================
  // HEADER / TITLE
  // =====================
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: "#f5f5f5",
    textAlign: "center",
  },
  // =====================
  // BUTTON
  // =====================
  loginButton: {
    backgroundColor: "#5E72E4",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 30,
    // Subtle shadow on iOS; elevation on Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
