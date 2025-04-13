import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function JoinGroupScreen() {
  const [inviteCode, setInviteCode] = useState("");
  const navigation = useRouter();

  const handleJoinGroup = () => {
    // In a real app, this would call an API to join the group
    console.log("Joining group with code:", inviteCode);
    navigation.navigate("/dashboard");
  };

  // Mock data for suggested groups (not used in the UI below,
  // but included if you want to display them)
  const suggestedGroups = [
    { id: "1", name: "Morning Workout Crew", members: 8 },
    { id: "2", name: "Coding Challenge Group", members: 12 },
    { id: "3", name: "Daily Meditation", members: 5 },
  ];

  return (
    <LinearGradient
      colors={["#36D1DC", "#5B86E5"]} // Ocean gradient
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* ScrollView allows vertical scrolling if needed */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Card container for header & form */}
          <View style={styles.card}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.push("/dashboard")}
              >
                <ArrowLeft size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.title}>Join a Group</Text>
              <Text style={styles.subtitle}>
                Enter an invite code to join an existing accountability group
              </Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Invite Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="characters"
                maxLength={6}
              />

              <TouchableOpacity
                style={[
                  styles.button,
                  inviteCode.length < 6 && styles.buttonDisabled,
                ]}
                onPress={handleJoinGroup}
                disabled={inviteCode.length < 6}
              >
                <Text style={styles.buttonText}>Join Group</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  // The ScrollView’s content container
  scrollContent: {
    // Center card if content is smaller than screen
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    // Extra minHeight to ensure there's room for the card
    minHeight: "100%",
  },

  // White card container with drop shadow
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    // Shadow on iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    // Elevation on Android
    elevation: 3,
  },

  // HEADER
  header: {
    marginBottom: 30,
  },
  backButton: {
    padding: 4,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },

  // FORM
  formContainer: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 8,
  },

  // BUTTON
  button: {
    backgroundColor: "#5E72E4",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#a0aaf0",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
