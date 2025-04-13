import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  TextInput,
} from "react-native";
import {
  CheckCircle,
  PlusCircle,
  Users,
  User,
  UserPlus,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkUserInGroup } from "@/lib/services/groupService";
import { useRouter } from "expo-router";
import { Task, GroupMember } from "@/types/dashboard";
import { supabase } from "@/lib/supabase";
import { addHabitTask } from "@/lib/services/taskService";

// Mock data for group members
const groupMembers: GroupMember[] = [
  {
    id: "1",
    name: "You",
    avatar: "https://placeholder.svg?height=50&width=50",
    tasks: [
      { id: "1", title: "Morning workout", completed: false },
      { id: "2", title: "Read for 30 minutes", completed: false },
    ],
    lastCheckin: "2 hours ago",
  },
];

export default function DashboardScreen() {
  const [userInGroup, setUserInGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState<string | null>(null);

  const nav = useRouter();

  const [showJoinCreateModal, setShowJoinCreateModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [myTasks, setMyTasks] = useState<Task[]>(groupMembers[0].tasks);

  // Check if user is already in a group when component mounts
  useEffect(() => {
    async function checkGroupMembership() {
      try {
        setLoading(true);

        const result = await checkUserInGroup();

        if (result.error) {
          console.error("Error checking group membership:", result.error);
          setUserInGroup(false);
        } else {
          setUserInGroup(result.isInGroup);

          if (result.isInGroup && result.group) {
            setGroupName(result.group.name);
          }
        }
      } catch (error) {
        console.error("Unexpected error checking group membership:", error);
        setUserInGroup(false);
      } finally {
        setLoading(false);
      }
    }

    checkGroupMembership();
  }, []);

  // Show the join/create modal if user is not in a group

  useEffect(() => {
    if (!loading && !userInGroup) {
      setShowJoinCreateModal(true);
    } else {
      setShowJoinCreateModal(false);
    }
  }, [loading, userInGroup]);

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleCreateGroup = () => {
    console.log("User creates a group");
    setShowJoinCreateModal(false);
    nav.push("/create-group");
  };

  const handleJoinGroup = async () => {
    console.log("User joins a group");
    setShowJoinCreateModal(false);
    try {
      await AsyncStorage.clear();
    } catch (e) {
      // clear error
    }
    console.log("Cleared cache");
    nav.push("/join-group");
  };

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setShowCheckInModal(true);
  };

  const handleCompleteTask = () => {
    if (!selectedTask) return;
    setMyTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTask.id ? { ...t, completed: true } : t,
      ),
    );
    setShowCheckInModal(false);
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert("Task title is required");
      return;
    }

    try {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        completed: false,
      };

      const { success, error } = await addHabitTask(newTaskTitle.trim());

      if (!success) {
        Alert.alert(error?.message ?? "Failed to add task");
        return;
      }

      // Update state
      setMyTasks((prev) => [...prev, newTask]);
      setNewTaskTitle("");
      setShowAddTaskModal(false);
    } catch (e) {
      console.error("Unexpected error inserting habit:", e);
      Alert.alert("Something went wrong");
    }
  };
  // Render each group member
  const renderMemberCard = ({ item }: { item: GroupMember }) => {
    // Use updated tasks if it's the user
    const tasks = item.id === "1" ? myTasks : item.tasks;

    return (
      <View style={styles.memberCard}>
        <View style={styles.memberHeader}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.memberName}>{item.name}</Text>
            <Text style={styles.lastCheckin}>{item.lastCheckin}</Text>
          </View>
        </View>

        <View style={styles.taskList}>
          {tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskItem}
              onPress={() => (item.id === "1" ? handleTaskPress(task) : null)}
              disabled={item.id !== "1" || task.completed}
            >
              <View
                style={[
                  styles.taskStatus,
                  task.completed ? styles.taskCompleted : styles.taskPending,
                ]}
              >
                {task.completed && <CheckCircle size={16} color="#fff" />}
              </View>
              <Text
                style={[
                  styles.taskTitle,
                  task.completed && styles.taskTitleCompleted,
                ]}
              >
                {task.title}
              </Text>
            </TouchableOpacity>
          ))}

          {item.id === "1" && (
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={() => setShowAddTaskModal(true)}
            >
              <PlusCircle size={16} color="#5E72E4" />
              <Text style={styles.addTaskText}>Add task</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5E72E4" />
        <Text style={styles.loadingText}>
          Loading your group information...
        </Text>
      </View>
    );
  }

  return (
    // **Ocean gradient** as the background
    <LinearGradient
      colors={["#36D1DC", "#5B86E5"]}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Example "flushed" gradient header (rather than big white header) */}
        <View style={styles.headerContainer}>
          <View style={styles.headerOverlay}>
            <Text style={styles.groupName}>{groupName}</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => nav.push("/invite-members")}
              >
                <UserPlus size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => nav.push("/profile")}
              >
                <User size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* If user has no group: prompt them to create/join */}
        {!userInGroup && (
          <View style={styles.groupActions}>
            <TouchableOpacity
              style={styles.groupActionButton}
              onPress={handleCreateGroup}
            >
              <PlusCircle size={18} color="#5E72E4" />
              <Text style={styles.groupActionText}>Create Group</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.groupActionButton}
              onPress={handleJoinGroup}
            >
              <Users size={18} color="#5E72E4" />
              <Text style={styles.groupActionText}>Join Group</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Member List */}
        <FlatList
          data={groupMembers}
          renderItem={renderMemberCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.membersList}
        />
        {/* Modal: Mark task completed */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showCheckInModal}
          onRequestClose={() => setShowCheckInModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Complete Task</Text>
              {selectedTask && (
                <View style={styles.modalTaskDetails}>
                  <Text style={styles.modalTaskTitle}>
                    {selectedTask.title}
                  </Text>
                  <Text style={styles.modalTaskDescription}>
                    Mark this task as completed?
                  </Text>
                </View>
              )}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowCheckInModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.completeButton]}
                  onPress={handleCompleteTask}
                >
                  <Text style={styles.completeButtonText}>Complete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* Modal: Create or Join */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showJoinCreateModal}
          onRequestClose={() => setShowJoinCreateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>No Active Group</Text>
              <Text style={styles.modalTaskDescription}>
                You are not currently in a group. Would you like to create or
                join a group?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.createButton]}
                  onPress={handleCreateGroup}
                >
                  <Text style={styles.createButtonText}>Create Group</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.joinButton]}
                  onPress={handleJoinGroup}
                >
                  <Text style={styles.joinButtonText}>Join Group</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showAddTaskModal}
          onRequestClose={() => setShowAddTaskModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Task</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter task title"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowAddTaskModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.completeButton]}
                  onPress={handleAddTask}
                >
                  <Text style={styles.completeButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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

  // HEADER
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerOverlay: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  groupName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    maxWidth: "70%",
  },
  headerIcons: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 16,
  },

  // GROUP ACTIONS
  groupActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  groupActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 0.48,
    justifyContent: "center",
  },
  groupActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5E72E4",
    marginLeft: 8,
  },

  // LOADING

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },

  // LIST
  membersList: {
    padding: 16,
  },

  // MEMBER CARD
  memberCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  lastCheckin: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  taskList: {
    marginTop: 8,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  taskStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  taskPending: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  taskCompleted: {
    backgroundColor: "#5E72E4",
  },
  taskTitle: {
    fontSize: 15,
    color: "#333",
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  addTaskButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 8,
  },
  addTaskText: {
    fontSize: 14,
    color: "#5E72E4",
    marginLeft: 8,
  },

  // MODALS
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalTaskDetails: {
    alignItems: "center",
    marginBottom: 32,
  },
  modalTaskTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  modalTaskDescription: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
    color: "#666",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    borderRadius: 8,
    padding: 12,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  completeButton: {
    backgroundColor: "#5E72E4",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: "#5E72E4",
  },
  joinButton: {
    backgroundColor: "#4CAF50",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
    backgroundColor: "#f9f9f9",
  },
});
