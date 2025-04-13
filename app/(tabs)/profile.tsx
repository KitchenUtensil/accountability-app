import {              // Importing chunks of named code from a library..
  View,               // A container for layout (like a <div>)
  Text,               // Displays text (like <p> or <span>)
  StyleSheet,         // Used to define styles in JavaScript
  TextInput,          // Input field for user text (like <input>)
  TouchableOpacity,   // Pressable component with fade effect
  Switch,             // Toggle switch (on/off)
  Alert,              // Popup alert dialog (like an alert box)
  ScrollView,         // Scrollable container for long content
  Modal,              // Overlays content like a popup or dialog
} from "react-native"; //react library.
import { useRouter } from "expo-router";   // Hook for navigating between screens using Expo Router (e.g., router.push("/home"))
import {
  ArrowLeft,   // Icon: left-facing arrow (often used for "back" buttons)
  Check,       // Icon: checkmark (commonly used for confirm/save)
  Edit2,       // Icon: pencil/edit (used to indicate editing something)
  LogOut       // Icon: logout/exit (used for sign-out buttons)
} from "lucide-react-native"; // Importing icons from Lucide(open-source icon library) for React Native

import { useState } from "react"; 
// 'Hook that lets you add and manage local state inside a component'

export default function Profile() {                                   //MAIN FUNCTION, no inputs, outputs profile screen UI
  const [username, setUsername] = useState("vincent ngo");            // 'const [stateValue, setStateValue] = useState(initialValue);'
  const [editingUsername, setEditingUsername] = useState(false);      //
  const [newUsername, setNewUsername] = useState(username);           //
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);  //

  const handleSaveUsername = () => {
    if (newUsername.trim()) {
      setUsername(newUsername.trim());
      setEditingUsername(false);
      Alert.alert("Success", "Username updated successfully");
    } else {
      Alert.alert("Error", "Username cannot be empty");
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    router.push("/");
  };

  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f8f9fa",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 60,
      paddingBottom: 16,
      backgroundColor: "#fff",
      borderBottomWidth: 1,
      borderBottomColor: "#eaeaea",
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#333",
    },
    content: {
      flex: 1,
    },
    profileSection: {
      backgroundColor: "#fff",
      padding: 24,
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#eaeaea",
    },
    editUsernameContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    usernameInput: {
      fontSize: 20,
      borderBottomWidth: 2,
      borderBottomColor: "#5E72E4",
      paddingVertical: 4,
      paddingHorizontal: 8,
      minWidth: 150,
      textAlign: "center",
      marginRight: 8,
    },
    saveButton: {
      backgroundColor: "#5E72E4",
      borderRadius: 20,
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    },
    usernameContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    editButton: {
      padding: 4,
    },
    username: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#333",
      marginRight: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 24,
      width: "80%",
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#333",
      marginBottom: 16,
    },
    modalMessage: {
      fontSize: 16,
      color: "#666",
      textAlign: "center",
      marginBottom: 24,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    modalButton: {
      borderRadius: 8,
      padding: 12,
      flex: 0.48,
      alignItems: "center",
    },
    cancelButton: {
      backgroundColor: "#f5f5f5",
    },
    logoutConfirmButton: {
      backgroundColor: "#FF3B30",
    },
    cancelButtonText: {
      color: "#333",
      fontSize: 16,
      fontWeight: "500",
    },
    logoutConfirmText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "500",
    },
    accountSection: {
      backgroundColor: "#fff",
      padding: 16,
      marginTop: 16,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: "#eaeaea",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#333",
      marginBottom: 16,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
    },
    logoutText: {
      fontSize: 16,
      color: "#FF3B30",
      marginLeft: 12,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/dashboard")}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          {editingUsername ? (
            <View style={styles.editUsernameContainer}>
              <TextInput
                style={styles.usernameInput}
                value={newUsername}
                onChangeText={setNewUsername}
                autoFocus
                selectTextOnFocus
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveUsername}
              >
                <Check size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.usernameContainer}>
              <Text style={styles.username}>{username}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setNewUsername(username);
                  setEditingUsername(true);
                }}
              >
                <Edit2 size={16} color="#5E72E4" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setShowLogoutConfirm(true)}
          >
            <LogOut size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogoutConfirm}
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to log out?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.logoutConfirmButton]}
                onPress={handleLogout}
              >
                <Text style={styles.logoutConfirmText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
