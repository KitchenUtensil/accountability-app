"use client"

import { useState, useEffect } from "react"
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
} from "react-native"
import { Copy, Share as ShareIcon, ArrowLeft, RefreshCw } from "lucide-react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { generateInviteCode, checkUserInGroup } from "@/lib/services"
import { supabase } from "@/lib/supabase"

interface GroupMember {
  id: string
  name: string
  isAdmin: boolean
}

export default function InviteMembersScreen() {
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [groupId, setGroupId] = useState<string | null>(null)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])

  const navigation = useRouter()

  useEffect(() => {
    checkUserGroup()
  }, [])

  const checkUserGroup = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await checkUserInGroup()

      if (result.error) {
        throw new Error(result.error.message)
      }

      if (!result.isInGroup || !result.group) {
        navigation.push("/dashboard")
        return
      }

      setGroupId(result.group.id.toString())
      await fetchGroupMembers(result.group.id.toString())
      fetchInviteCode(result.group.id.toString())
    } catch (err: any) {
      setError(err.message || "Failed to check group membership")
      setLoading(false)
    }
  }

  const fetchInviteCode = async (gid: string) => {
    try {
      setError(null)
      if (refreshing) setRefreshing(true)
      else setLoading(true)

      const response = await generateInviteCode(gid)

      if (response.error) {
        throw new Error(response.error.message)
      }

      setInviteCode(response.inviteCode || null)
    } catch (err: any) {
      setError(err.message || "Failed to generate invite code")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefreshInviteCode = () => {
    if (!groupId) return
    setRefreshing(true)
    fetchInviteCode(groupId)
  }

  const handleCopyInviteCode = () => {
    if (!inviteCode) return

    Clipboard.setString(inviteCode)
    Alert.alert("Copied", "Invite code copied to clipboard")
  }

  const handleShareInvite = async () => {
    if (!inviteCode) return

    try {
      await Share.share({
        message: `Join my accountability group on Accountable! Use invite code: ${inviteCode}`,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const fetchGroupMembers = async (groupId: string) => {
    try {
      setLoading(true)

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) throw new Error(sessionError.message)
      if (!session) throw new Error("No active session")

      const currentUserId = session.user.id

      // Updated query to properly join with profiles table
      const { data, error } = await supabase
        .from("group_members")
        .select(`
        id,
        user_id,
        group_id,
        profiles:user_id(display_name),
        groups!inner(created_by)
      `)
        .eq("group_id", groupId)

      if (error) throw error

      // Process the data with proper profile information
      const members: GroupMember[] = data.map((member: any) => {
        // If it's the current user, display "You", otherwise use their display name
        const name = member.user_id === currentUserId ? "You" : member.profiles?.display_name || "Unknown User"

        // Check if this user is the group admin (creator)
        const isAdmin = member.groups?.created_by === member.user_id

        return {
          id: member.id.toString(),
          name,
          isAdmin,
        }
      })

      setGroupMembers(members)
    } catch (err: any) {
      console.error("Error fetching group members:", err)
      setError(err.message || "Failed to fetch group members")
    } finally {
      setLoading(false)
    }
  }

  const renderMember = ({ item }: { item: GroupMember }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {item.name} {item.isAdmin ? "(Admin)" : ""}
        </Text>
      </View>
    </View>
  )

  return (
    <LinearGradient colors={["#36D1DC", "#5B86E5"]} style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.push("/dashboard")}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invite Members</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                <TouchableOpacity style={styles.retryButton} onPress={() => groupId && fetchInviteCode(groupId)}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.inviteCodeContainer}>
                  <Text style={styles.inviteCode}>{inviteCode}</Text>
                  <View style={styles.inviteCodeActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleCopyInviteCode}>
                      <Copy size={20} color="#5E72E4" />
                      <Text style={styles.actionButtonText}>Copy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleShareInvite}>
                      <ShareIcon size={20} color="#5E72E4" />
                      <Text style={styles.actionButtonText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleRefreshInviteCode}
                      disabled={refreshing}
                    >
                      <RefreshCw size={20} color={refreshing ? "#999" : "#5E72E4"} />
                      <Text style={[styles.actionButtonText, refreshing && { color: "#999" }]}>
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

          <View style={{ height: 12 }} />

          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Current Members</Text>
              <View style={styles.memberCountBadge}>
                <Text style={styles.memberCountText}>{groupMembers.length}</Text>
              </View>
            </View>
            <FlatList
              data={groupMembers}
              renderItem={renderMember}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={<Text style={styles.emptyListText}>No members found</Text>}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  safeArea: { flex: 1 },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  placeholder: { width: 32 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
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
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  memberCountBadge: {
    backgroundColor: "#5E72E4",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  memberCountText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  loadingContainer: { alignItems: "center", justifyContent: "center", padding: 20 },
  loadingText: { marginTop: 10, color: "#666", fontSize: 14 },
  errorContainer: { alignItems: "center", justifyContent: "center", padding: 20 },
  errorText: { color: "#e53e3e", marginBottom: 12, textAlign: "center" },
  retryButton: {
    backgroundColor: "#5E72E4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: { color: "#fff", fontWeight: "600" },
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
  actionButton: { alignItems: "center", padding: 8 },
  actionButtonText: { color: "#5E72E4", marginTop: 4, fontSize: 12, fontWeight: "600" },
  inviteInstructions: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
  },
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 },
  emptyListText: {
    textAlign: "center",
    color: "#666",
    padding: 16,
    fontStyle: "italic",
  },
})
