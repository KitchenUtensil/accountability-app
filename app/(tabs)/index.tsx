import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking auth:', error);
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
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        // An error occurred, but not the "no rows returned" error
        console.error('Error checking profile:', profileError);
        setLoading(false);
        return;
      }
      
      setLoading(false);
      
      if (profileData) {
        // User exists in profiles table, redirect to dashboard
        router.push("/dashboard");
      } else {
        // User is authenticated but doesn't have a profile
        // You might want to redirect to a profile creation screen instead
        // For now, we'll stay on the welcome screen
        console.log('User authenticated but no profile found');
      }
    } catch (error) {
      console.error('Session/profile check failed:', error);
      setLoading(false);
    }
  };
  
  const handleButtonPress = () => {
    router.push("/login-screen");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5E72E4" />
        <Text style={styles.loadingText}>{loadingMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Accountable</Text>
        <Text style={styles.subtitle}>
          Creating better habits doesn't have to be done solo
        </Text>
      </View>
      <View style={styles.loginContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleButtonPress}
        >
          <Text style={styles.buttonText}>Login using SMS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
  },
  loginButton: {
    backgroundColor: "#5E72E4",
    borderRadius: 8,
    padding: 16,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
