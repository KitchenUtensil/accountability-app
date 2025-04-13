import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { CountryPicker } from "react-native-country-codes-picker";
import styles from '../styles/login-screen.styles';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsCode, setSMSCode] = useState("");
  const [username, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [countryCode, setCountryCode] = useState("+1");
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
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
        : `${countryCode}${phoneNumber}`;

      const { data, error } = await supabase.auth.signInWithOtp({
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

  // Verify SMS code
  const handleVerifyCode = async () => {
    if (!phoneNumber || !smsCode) {
      Alert.alert("Error", "Please enter phone number and verification code");
      return;
    }

    try {
      setLoading(true);
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `${countryCode}${phoneNumber}`;

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: smsCode,
        type: "sms",
      });

      if (error) throw error;

      // Check if user is available
      if (!data.user) {
        throw new Error("Verification successful but no user data returned");
      }

      // Successfully verified code - now check if profile exists
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", data.user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        // PGRST116 is "not found" error
        console.error("Error checking profile:", profileError);
        throw profileError;
      }

      setIsExistingUser(!!profileData);
      setVerificationComplete(true);

      // If user profile already exists, continue to dashboard
      if (profileData) {
        router.push("/dashboard");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  // Complete profile and login
  const handleCompleteProfile = async () => {
    if (!username) {
      Alert.alert("Error", "Please enter a username");
      return;
    }

    try {
      setLoading(true);

      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!data.session || !data.session.user) {
        throw new Error("No authenticated user found");
      }

      // Create user profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        user_id: data.session.user.id,
        display_name: username,
      });

      if (profileError) throw profileError;

      // Navigate to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create profile");
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
          {/* Step 1: Phone Input */}
          {!verificationSent && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.phoneInputContainer}>
                  <TouchableOpacity
                    style={styles.countryCodeButton}
                    onPress={() => setShowPicker(true)}
                  >
                    <Text style={styles.countryCodeText}>{countryCode}</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.phoneInput}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    editable={!loading}
                  />
                </View>
                <CountryPicker
                  show={showPicker}
                  pickerButtonOnPress={(item) => {
                    setCountryCode(item.dial_code);
                    setShowPicker(false);
                  }}
                  lang="en"
                  // Pass a properly typed style prop to CountryPicker
                  // @ts-ignore - The CountryPicker library may have incompatible typings
                  style={{
                    modal: {
                      height: 400,
                      backgroundColor: "#fff",
                    },
                  }}
                />
              </View>

              <View style={styles.buttonContainer}>
                {loading ? (
                  <ActivityIndicator size="large" color="#5E72E4" />
                ) : (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleSendVerificationCode}
                  >
                    <Text style={styles.buttonText}>
                      Send Verification Code
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {verificationSent && !verificationComplete && (
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

              <View style={styles.buttonContainer}>
                {loading ? (
                  <ActivityIndicator size="large" color="#5E72E4" />
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleVerifyCode}
                    >
                      <Text style={styles.buttonText}>Verify Code</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.button, styles.resendButton]}
                      onPress={handleSendVerificationCode}
                    >
                      <Text style={styles.buttonText}>Resend Code</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </>
          )}

          {/* Step 3: Profile Creation (only for new users) */}
          {verificationComplete && !isExistingUser && (
            <>
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

              <View style={styles.buttonContainer}>
                {loading ? (
                  <ActivityIndicator size="large" color="#5E72E4" />
                ) : (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleCompleteProfile}
                  >
                    <Text style={styles.buttonText}>Complete Profile</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Define types for styles
interface Styles {
  gradientBackground: ViewStyle;
  container: ViewStyle;
  headerContainer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  formCard: ViewStyle;
  inputContainer: ViewStyle;
  inputLabel: TextStyle;
  phoneInputContainer: ViewStyle;
  countryCodeButton: ViewStyle;
  countryCodeText: TextStyle;
  phoneInput: TextStyle;
  input: TextStyle;
  buttonContainer: ViewStyle;
  button: ViewStyle;
  resendButton: ViewStyle;
  buttonText: TextStyle;
}


