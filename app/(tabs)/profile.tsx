"use client"

import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Modal,  StatusBar, SafeAreaView , ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { ArrowLeft, Check, Edit2, LogOut } from "lucide-react-native"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { LinearGradient } from 'expo-linear-gradient';

export default function Profile() {
  const [username, setUsername] = useState("")
  const [editingUsername, setEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savingUsername, setSavingUsername] = useState(false)

  const router = useRouter()

  // Fetch user profile when component mounts
  useEffect(() => {
    fetchUserProfile()
  }, [])

  // Function to fetch user profile from Supabase
  const fetchUserProfile = async () => {
    try {
      setLoading(true)

      // Get the current user's session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        throw sessionError
      }

      if (!session) {
        // No active session, redirect to login
        router.push("/")
        return
      }

      // Fetch the user's profile from the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", session.user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        // PGRST116 is the "not found" error code
        throw profileError
      }

      // Update the username state with the fetched display_name
      if (profileData && profileData.display_name) {
        setUsername(profileData.display_name)
        setNewUsername(profileData.display_name)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      Alert.alert("Error", "Failed to load profile information")
    } finally {
      setLoading(false)
    }
  }

  // Function to save username changes to Supabase
  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      Alert.alert("Error", "Username cannot be empty")
      return
    }

    try {
      setSavingUsername(true)

      // Get current user session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        throw sessionError
      }

      if (!session) {
        Alert.alert("Error", "You must be logged in to update your profile")
        return
      }

      // Update the profile in Supabase
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ display_name: newUsername.trim() })
        .eq("user_id", session.user.id)

      if (updateError) {
        throw updateError
      }

      // Update local state
      setUsername(newUsername.trim())
      setEditingUsername(false)
      Alert.alert("Success", "Username updated successfully")
    } catch (error) {
      console.error("Error updating username:", error)
      Alert.alert("Error", "Failed to update username")
    } finally {
      setSavingUsername(false)
    }
  }

  // Function to handle logout
  const handleLogout = async () => {
    try {
      setShowLogoutConfirm(false)

      // Call Supabase to sign out the user
      const { error } = await supabase.auth.signOut()

      if (error) {
        Alert.alert("Error", "Failed to log out: " + error.message)
        return
      }

      // Navigate to the welcome screen after successful logout
      router.push("/")
    } catch (err) {
      console.error("Logout error:", err)
      Alert.alert("Error", "An unexpected error occurred during logout")
    }
  }

  const styles = StyleSheet.create({

    statusBarCover: {
      flex: 0,
      backgroundColor: 'transparent',
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff', // or any background color that fits your app
    },
    topOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: StatusBar.currentHeight || 20, // space for battery/time
      backgroundColor: "transparent",
      zIndex: 1000, // stays above all scrolling content
      pointerEvents: "none", // doesn't block touches or scroll                          // stays on top
    },
    gradientBackground: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginHorizontal: 24,
      marginBottom: 16,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#fff",
    },
    content: {
      flex: 1,
    },
    profileSection: {
      backgroundColor: "transparent",
      alignItems: "center",
      marginBottom: 16,
    },
    editUsernameContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 24,
      padding: 12,
      borderRadius: 12,
      backgroundColor: "#fff",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    usernameInput: {
      fontSize: 20,
      borderBottomWidth: 2,
      borderBottomColor: "#5E72E4",
      paddingVertical: 4,
      paddingHorizontal: 8,
      flex: 1,
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
      marginHorizontal: 24,
      padding: 12,
      borderRadius: 12,
      backgroundColor: "#fff",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
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
      marginHorizontal: 24,
      borderRadius: 12,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
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
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: "#666",
    },
  })

  // Show loading indicator when initially loading the profile
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#5E72E4" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    )
  }

  return (
    <LinearGradient colors={["#36D1DC", "#5B86E5"]} style={styles.gradientBackground}>
      <SafeAreaView style={styles.statusBarCover} />
   
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push("/dashboard")}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
  
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
              {savingUsername ? (
                <ActivityIndicator size="small" color="#5E72E4" style={{ marginLeft: 8 }} />
              ) : (
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveUsername}>
                  <Check size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.usernameContainer}>
              <Text style={styles.username}>{username || "Set your name"}</Text>
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
          <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutConfirm(true)}>
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
            <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
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
    </LinearGradient>
  );
}
