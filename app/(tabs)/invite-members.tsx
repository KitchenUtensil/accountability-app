import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Share,
  Alert,
  ScrollView,
  Clipboard,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import {
  Copy,
  Share as ShareIcon,
  ArrowLeft,
  RefreshCw,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { generateInviteCode } from "@/lib/services";
import { checkUserInGroup } from "@/lib/services";

// Mock data for existing members
const existingMembers = [
  { id: "1", name: "You", phoneNumber: "+1 (555) 123-4567", isAdmin: true },
  { id: "2", name: "Sarah", phoneNumber: "+1 (555) 234-5678", isAdmin: false },
  { id: "3", name: "Mike", phoneNumber: "+1 (555) 345-6789", isAdmin: false },
];

export default function InviteMembersScreen() {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  
  const navigation = useRouter();

  // Check user's group on component mount
  useEffect(() => {
    checkUserGroup();
  }, []);
  
  // Function to check if user is in a group and get group ID
  const checkUserGroup = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await checkUserInGroup();
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      if (!result.isInGroup || !result.group) {
        navigation.push("/dashboard"); // Redirect if not in a group
        return;
      }
      
      setGroupId(result.group.id.toString());
      fetchInviteCode(result.group.id.toString());
    } catch (err: any) {
      setError(err.message || "Failed to check group membership");
      setLoading(false);
    }
  };

  // Function to fetch invite code
  const fetchInviteCode = async (gid: string) => {
    try {
      setError(null);
      if (refreshing) setRefreshing(true);
      else setLoading(true);
      
      const response = await generateInviteCode(gid);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setInviteCode(response.inviteCode || null);
    } catch (err: any) {
      setError(err.message || "Failed to generate invite code");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Function to refresh invite code
  const handleRefreshInviteCode = () => {
    if (!groupId) return;
    setRefreshing(true);
    fetchInviteCode(groupId);
  };

  const handleCopyInviteCode = () => {
    if (!inviteCode) return;
    
    Clipboard.setString(inviteCode);
    Alert.alert("Copied", "Invite code copied to clipboard");
  };

  const handleShareInvite = async () => {
    if (!inviteCode) return;
    
    try {
      await Share.share({
        message: `Join my accountability group on Accountable! Use invite code: ${inviteCode}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderMember = ({ item }: { item: (typeof existingMembers)[0] }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberPhone}>{item.phoneNumber}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={["#36D1DC", "#5B86E5"]} // Ocean gradient background
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* HEADER BAR */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.push("/dashboard")}
          >
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invite Members</Text>
          <View style={styles.placeholder} />
        </View>

        {/* MAIN CONTENT SCROLL */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* SECTION: Invite by Code */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Group Invite Code</Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5E72E4" />
                <Text style={styles.loadingText}>Loading invite code...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  style={styles.retryButton} 
                  onPress={() => groupId && fetchInviteCode(groupId)}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.inviteCodeContainer}>
                  <Text style={styles.inviteCode}>{inviteCode}</Text>
                  <View style={styles.inviteCodeActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleCopyInviteCode}
                    >
                      <Copy size={20} color="#5E72E4" />
                      <Text style={styles.actionButtonText}>Copy</Text>
                    </TouchableOpacity>
                  
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleShareInvite}
                    >
                      <ShareIcon size={20} color="#5E72E4" />
                      <Text style={styles.actionButtonText}>Share</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleRefreshInviteCode}
                      disabled={refreshing}
                    >
                      <RefreshCw size={20} color={refreshing ? "#999" : "#5E72E4"} />
                      <Text style={[
                        styles.actionButtonText, 
                        refreshing && {color: "#999"}
                      ]}>
                        {refreshing ? "Refreshing..." : "Refresh"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.inviteInstructions}>
                  Share this code with people you want to invite to your group. The code expires after 24 hours.
                </Text>
              </>
            )}
          </View>

          {/* SPACER / DIVIDER */}
          <View style={{ height: 12 }} />

          {/* SECTION: Current Members */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Current Members</Text>
              <View style={styles.memberCountBadge}>
                <Text style={styles.memberCountText}>
                  {existingMembers.length}
                </Text>
              </View>
            </View>
            <FlatList
              data={existingMembers}
              renderItem={renderMember}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ===================
//       STYLES
// ===================
const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  // ---------------------
  // HEADER BAR
  // ---------------------
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    // Subtle shadow for the header
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 32, // keeps the title centered
  },

  // ---------------------
  // SCROLL CONTENT
  // ---------------------
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // ---------------------
  // CARD-LIKE SECTION
  // ---------------------
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    // Subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  memberCountBadge: {
    backgroundColor: "#5E72E4",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  memberCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // ---------------------
  // INVITE CODE
  // ---------------------
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    color: "#e53e3e",
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#5E72E4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  inviteCodeContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    marginVertical: 12,
    alignItems: "center",
  },
  inviteCode: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#5E72E4",
    marginBottom: 16,
  },
  inviteCodeActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  actionButton: {
    alignItems: "center",
    padding: 8,
  },
  actionButtonText: {
    color: "#5E72E4",
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  inviteInstructions: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
  },

  // ---------------------
  // MEMBERS
  // ---------------------
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  memberPhone: {
    fontSize: 14,
    color: "#666",
  },
});
