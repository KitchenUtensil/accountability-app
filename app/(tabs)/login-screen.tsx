import React, { useState } from "react";
import { View, Text, TextInput, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { StyleSheet } from "react-native";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'expo-router';

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
      
      // Format phone number to include + if not already
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
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
      
      // Format phone number to include + if not already
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: smsCode,
        type: 'sms',
      });

      if (error) throw error;
      
      // Successfully logged in - now create/update profile
      const user = data.user;
      
      if (user) {
        //r Insert or update the user's profile in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            display_name: username,
          });

        if (profileError) throw profileError;
        
        // Navigate to home screen or dashboard
        // router.push('/');
        console.log("User logged in:", username);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      padding: 20,
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
      marginBottom: 30,
    },
    inputContainer: {
      marginBottom: 24,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "#333",
      marginBottom: 8,
    },
    input: {
      backgroundColor: "#f5f5f5",
      borderRadius: 8,
      padding: 16,
      fontSize: 16,
      borderWidth: 1,
      borderColor: "#e0e0e0",
    },
    button: {
      backgroundColor: "#5E72E4",
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      marginTop: 20,
    },
    secondaryButton: {
      backgroundColor: "#6c757d",
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      marginTop: 12,
    },
    buttonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    buttonContainer: {
      marginTop: 12,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue with your account</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter your phone number (e.g. +1234567890)"
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
              editable={!loading}
            />
          </View>
        </>
      )}

      <View style={styles.buttonContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#5E72E4" />
        ) : verificationSent ? (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSendVerificationCode}>
            <Text style={styles.buttonText}>Send Verification Code</Text>
          </TouchableOpacity>
        )}
        
        {verificationSent && !loading && (
          <TouchableOpacity style={styles.secondaryButton} onPress={handleSendVerificationCode}>
            <Text style={styles.buttonText}>Resend Code</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
