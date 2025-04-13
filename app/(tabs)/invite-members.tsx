import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Share,
  Alert,
  ScrollView,
  Clipboard,
  SafeAreaView,
} from "react-native";
import {
  Copy,
  Share as ShareIcon,
  Plus,
  X,
  ArrowLeft,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// Mock data for existing members
const existingMembers = [
  { id: "1", name: "You", phoneNumber: "+1 (555) 123-4567", isAdmin: true },
  { id: "2", name: "Sarah", phoneNumber: "+1 (555) 234-5678", isAdmin: false },
  { id: "3", name: "Mike", phoneNumber: "+1 (555) 345-6789", isAdmin: false },
];

export default function InviteMembersScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [invitedNumbers, setInvitedNumbers] = useState<string[]>([]);
  const inviteCode = "ABC123"; // In a real app, this would be generated or fetched

  const navigation = useRouter();

  const handleAddNumber = () => {
    if (phoneNumber && !invitedNumbers.includes(phoneNumber)) {
      setInvitedNumbers([...invitedNumbers, phoneNumber]);
      setPhoneNumber("");
    }
  };

  const handleRemoveNumber = (number: string) => {
    setInvitedNumbers(invitedNumbers.filter((n) => n !== number));
  };

  const handleSendInvites = () => {
    // In a real app, this would call an API to send SMS invites
    Alert.alert(
      "Invites Sent",
      `Invitations sent to ${invitedNumbers.length} contacts`
    );
    setInvitedNumbers([]);
  };

  const handleCopyInviteCode = () => {
    Clipboard.setString(inviteCode);
    Alert.alert("Copied", "Invite code copied to clipboard");
  };

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: `Join my accountability group on Accountable! Use invite code: ${inviteCode}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderInvitedNumber = ({ item }: { item: string }) => (
    <View style={styles.invitedNumberContainer}>
      <Text style={styles.invitedNumber}>{item}</Text>
      <TouchableOpacity onPress={() => handleRemoveNumber(item)}>
        <X size={16} color="#999" />
      </TouchableOpacity>
    </View>
  );

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
          {/* SECTION: Invite by Phone */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Invite via Phone Number</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                style={[
                  styles.addButton,
                  !phoneNumber && styles.addButtonDisabled,
                ]}
                onPress={handleAddNumber}
                disabled={!phoneNumber}
              >
                <Plus size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {invitedNumbers.length > 0 && (
              <View style={styles.invitedNumbersContainer}>
                <FlatList
                  data={invitedNumbers}
                  renderItem={renderInvitedNumber}
                  keyExtractor={(item) => item}
                  scrollEnabled={false}
                />
                <TouchableOpacity
                  style={styles.sendInvitesButton}
                  onPress={handleSendInvites}
                >
                  <Text style={styles.sendInvitesText}>Send Invites</Text>
                </TouchableOpacity>
              </View>
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
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 0,
  },

  // *** The only changed line is here: ***
  memberCountBadge: {
    backgroundColor: "#5E72E4",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
    alignSelf: "center",
    // Slight negative top margin to raise the badge:
    marginTop: -4,
  },
  memberCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // ---------------------
  // INVITE MEMBERS
  // ---------------------
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: "#5E72E4",
    borderRadius: 8,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#a0aaf0",
  },
  invitedNumbersContainer: {
    marginTop: 16,
  },
  invitedNumberContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  invitedNumber: {
    fontSize: 14,
    color: "#333",
  },
  sendInvitesButton: {
    backgroundColor: "#5E72E4",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  sendInvitesText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
