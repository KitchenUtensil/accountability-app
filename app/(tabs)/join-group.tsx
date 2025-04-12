import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

import { useRouter } from "expo-router";

export default function JoinGroupScreen() {
  const [inviteCode, setInviteCode] = useState("");

  const navigation = useRouter();

  const handleJoinGroup = () => {
    // In a real app, this would call an API to join the group
    console.log("Joining group with code:", inviteCode);
    navigation.navigate("/dashboard");
  };

  // Mock data for suggested groups
  const suggestedGroups = [
    { id: "1", name: "Morning Workout Crew", members: 8 },
    { id: "2", name: "Coding Challenge Group", members: 12 },
    { id: "3", name: "Daily Meditation", members: 5 },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
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
            inviteCode.length < 6 ? styles.buttonDisabled : null,
          ]}
          onPress={handleJoinGroup}
          disabled={inviteCode.length < 6}
        >
          <Text style={styles.buttonText}>Join Group</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
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
  formContainer: {
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
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
  button: {
    backgroundColor: "#5E72E4",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#a0aaf0",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  suggestedContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  suggestedTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  groupCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 14,
    color: "#666",
  },
  joinButton: {
    backgroundColor: "#5E72E4",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  joinButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
