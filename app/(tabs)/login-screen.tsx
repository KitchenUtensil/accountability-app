import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsCode, setSMSCode] = useState("");
  const [username, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const router = useRouter();

  // Send verification code to phone number
  const handleSendVerificationCode = async () => {
    if (!phoneNumber) {
      Alert.alert("Error", "Please enter a phone number");
      return;
    }
    try {
      setLoading(true);
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });
      if (error) throw error;
      setVerificationSent(true);
      Alert.alert("Success", "Verification code sent to your phone");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  // Verify code and login
  const handleLogin = async () => {
    if (!phoneNumber || !smsCode) {
      Alert.alert("Error", "Please enter phone number and verification code");
      return;
    }
    if (!username) {
      Alert.alert("Error", "Please enter a username");
      return;
    }
    try {
      setLoading(true);
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: smsCode,
        type: "sms",
      });
      if (error) throw error;

      const user = data.user;
      if (user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            user_id: user.id,
            display_name: username,
          });
        if (profileError) throw profileError;

        // router.push("/");
        console.log("User logged in:", username);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      // Ocean-like colors
      colors={["#36D1DC", "#5B86E5"]}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue with your account
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter your phone number (+1234567890)"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              editable={!verificationSent || !loading}
            />
          </View>

          {verificationSent && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>SMS Code</Text>
                <TextInput
                  style={styles.input}
                  value={smsCode}
                  onChangeText={setSMSCode}
                  placeholder="Enter verification code"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUserName}
                  placeholder="Enter your username"
                  placeholderTextColor="#999"
                  editable={!loading}
                />
              </View>
            </>
          )}

          <View style={styles.buttonContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#5E72E4" />
            ) : verificationSent ? (
              <>
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.resendButton]}
                  onPress={handleSendVerificationCode}
                >
                  <Text style={styles.buttonText}>Resend Code</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={handleSendVerificationCode}
              >
                <Text style={styles.buttonText}>Send Verification Code</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Styles
const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#f5f5f5",
  },
  // Here we add margins so the card doesn’t fill the entire screen:
  formCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,

    // Add margin to show more gradient around the card
    marginVertical: 20,
    marginHorizontal: 10,

    // Subtle shadow/elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    color: "#333",
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    backgroundColor: "#5E72E4",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  resendButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
