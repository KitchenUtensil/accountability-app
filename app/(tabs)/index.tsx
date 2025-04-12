import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function WelcomeScreen() {
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
          onPress={() => console.log("log in")}
        >
          <Text style={styles.buttonText}>Login using SMS</Text>s
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
