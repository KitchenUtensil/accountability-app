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
} from "react-native";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { CountryPicker } from "react-native-country-codes-picker";

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
                  style={styles.countryPicker}
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
  formCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    marginHorizontal: 10,
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
  phoneInputContainer: {
    flexDirection: "row",
    height: 50,
  },
  countryCodeButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    width: 80,
    marginRight: 8,
  },
  countryCodeText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#dcdcdc",
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
    height: 50,
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
  countryPicker: {
    modal: {
      height: 400,
      backgroundColor: "#fff",
    },
  },
});
