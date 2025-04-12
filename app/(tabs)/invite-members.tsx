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
} from "react-native";
import {
  Copy,
  Share as ShareIcon,
  Plus,
  X,
  ArrowLeft,
} from "lucide-react-native";
import { useRouter } from "expo-router";

// Mock data for existing members
const existingMembers = [
  { id: "1", name: "You", phoneNumber: "+1 (555) 123-4567", isAdmin: true },
  { id: "2", name: "Sarah", phoneNumber: "+1 (555) 234-5678", isAdmin: false },
  { id: "3", name: "Mike", phoneNumber: "+1 (555) 345-6789", isAdmin: false },
];

const InviteMembersScreen = () => {
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
      `Invitations sent to ${invitedNumbers.length} contacts`,
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
    <View style={styles.container}>
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

      <ScrollView style={styles.content}>
        <View style={styles.section}>
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
                !phoneNumber ? styles.addButtonDisabled : null,
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

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
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
    </View>
  );
};

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
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  memberCountBadge: {
    backgroundColor: "#5E72E4",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  memberCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
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
  divider: {
    height: 8,
    backgroundColor: "#f8f9fa",
  },
  inviteCodeContainer: {
    alignItems: "center",
  },
  inviteCodeLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  inviteCodeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  inviteCode: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    letterSpacing: 2,
    marginRight: 16,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5E72E4",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
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
  adminBadge: {
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  adminText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
});

export default InviteMembersScreen;
