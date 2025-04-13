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
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function CreateGroupScreen() {
  const [groupName, setGroupName] = useState("");
  const navigation = useRouter();

  const handleCreateGroup = () => {
    // In a real app, this would call an API to create the group
    navigation.push("/dashboard");
  };

  return (
    <LinearGradient
      colors={["#36D1DC", "#5B86E5"]} // The ocean gradient
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* White card container */}
          <View style={styles.card}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.push("/dashboard")}
              >
                <ArrowLeft size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.title}>Create a Group</Text>
              <Text style={styles.subtitle}>
                Set up your accountability group and invite members
              </Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Group Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Morning Workout Crew"
                value={groupName}
                onChangeText={setGroupName}
              />

              <TouchableOpacity
                style={[styles.button, !groupName && styles.buttonDisabled]}
                onPress={handleCreateGroup}
                disabled={!groupName}
              >
                <Text style={styles.buttonText}>Create Group</Text>
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
  scrollContent: {
    // Center the card if content is smaller than screen
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: "100%",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    // Subtle shadow (iOS & Android)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
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
  },

  // BUTTON
  button: {
    backgroundColor: "#5E72E4",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
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
