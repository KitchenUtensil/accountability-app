import { useEffect, useState } from "react";
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
  Trash2,
  MoreVertical,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkUserInGroup } from "@/lib/services/groupService";
import { useRouter } from "expo-router";
import { Task, GroupMember } from "@/types/dashboard";
import styles from "../styles/dashboard.styles";
import {
  addHabitTask,
  deleteHabitTask,
  getHabitTasks,
  markHabitComplete,
} from "@/lib/services/taskService";

// Mock data for group members
const groupMembers: GroupMember[] = [
  {
    id: "1",
    name: "You",
    avatar: "https://placeholder.svg?height=50&width=50",
    tasks: [],
    lastCheckin: "",
  },
];

export default function DashboardScreen() {
  const [userInGroup, setUserInGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

  const nav = useRouter();

  const [showJoinCreateModal, setShowJoinCreateModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [showTaskOptionsModal, setShowTaskOptionsModal] = useState(false);

  // Check if user is already in a group when component mounts
  useEffect(() => {
    async function checkGroupMembership() {
      try {
        setLoading(true);
        console.log("Checking group membership...");

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

  useEffect(() => {
    async function fetchAllGroupMembersAndTasks() {
      if (!userInGroup) return;

      try {
        const { members, error } = await getHabitTasks();

        if (error) {
          console.error("Failed to fetch group tasks:", error.message);
          return;
        }

        // Sort members so that current user ("You") appears first
        const sortedMembers = [...(members ?? [])].sort((a, b) => {
          if (a.name === "You") return -1;
          if (b.name === "You") return 1;
          return 0;
        });

        setGroupMembers(sortedMembers);
      } catch (err) {
        console.error("Unexpected error fetching group tasks", err);
      }
    }

    fetchAllGroupMembersAndTasks();
  }, [userInGroup]);

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
    nav.push("/join-group");
  };

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setSelectedTaskId(task.id);
    setShowCheckInModal(true);
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;

    try {
      setLoading(true);
      // Call the markHabitComplete function
      const { success, error } = await markHabitComplete(selectedTask.id);

      if (success) {
        // Update the local state to reflect the change
        setGroupMembers((prevMembers) =>
          prevMembers.map((member) => {
            if (member.name === "You") {
              return {
                ...member,
                tasks: member.tasks.map((t) =>
                  t.id === selectedTask.id ? { ...t, completed: true } : t,
                ),
              };
            }
            return member;
          }),
        );
        setShowCheckInModal(false);
      } else if (error) {
        Alert.alert("Error", error.message || "Failed to complete task");
      }
    } catch (e) {
      console.error("Unexpected error completing task:", e);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert("Task title is required");
      return;
    }

    try {
      const { success, id, error } = await addHabitTask(newTaskTitle.trim());

      if (!success) {
        console.log(error?.message);
        Alert.alert(error?.message ?? "Failed to add task");
        return;
      }

      const newTask: Task = {
        id: "" + id,
        title: newTaskTitle.trim(),
        completed: false,
      };

      // Update state
      setGroupMembers((prev) =>
        prev.map((member) =>
          member.name === "You"
            ? {
                ...member,
                tasks: [...member.tasks, newTask],
              }
            : member,
        ),
      );
      setNewTaskTitle("");
      setShowAddTaskModal(false);
    } catch (e) {
      console.error("Unexpected error inserting habit:", e);
      Alert.alert("Something went wrong");
    }
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setShowDeleteConfirmModal(true);
    setShowTaskOptionsModal(false);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const { success, error } = await deleteHabitTask(taskToDelete.id);

      if (success) {
        console.log("task deleted successfully");
      } else {
        console.error(error);
      }

      setGroupMembers((prevMembers) =>
        prevMembers.map((member) => {
          if (member.name === "You") {
            return {
              ...member,
              tasks: member.tasks.filter((t) => t.id !== taskToDelete.id),
            };
          }
          return member;
        }),
      );

      // Close the modal
      setShowDeleteConfirmModal(false);
      setTaskToDelete(null);
    } catch (e) {
      console.error("Error deleting task:", e);
      Alert.alert("Failed to delete task");
    }
  };

  const handleTaskOptions = (task: Task) => {
    setSelectedTask(task);
    setShowTaskOptionsModal(true);
  };

  // Render each group member
  const renderMemberCard = ({ item }: { item: GroupMember }) => {
    const tasks = item.tasks;

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
            <View key={task.id} style={styles.taskItemContainer}>
              <TouchableOpacity
                style={styles.taskItem}
                onPress={() =>
                  item.name === "You" ? handleTaskPress(task) : null
                }
                disabled={item.name !== "You" || task.completed}
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

              {item.name === "You" && (
                <TouchableOpacity
                  style={styles.taskOptionsButton}
                  onPress={() => handleTaskOptions(task)}
                >
                  <MoreVertical size={16} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {item.name === "You" && (
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
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                {loading ? (
                  <View style={[styles.modalButton, styles.completeButton]}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.modalButton, styles.completeButton]}
                    onPress={handleCompleteTask}
                  >
                    <Text style={styles.completeButtonText}>Complete</Text>
                  </TouchableOpacity>
                )}
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

        {/* Modal: Add Task */}
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

        {/* Modal: Task Options */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showTaskOptionsModal}
          onRequestClose={() => setShowTaskOptionsModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowTaskOptionsModal(false)}
          >
            <View style={styles.optionsModalContent}>
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => selectedTask && handleDeleteTask(selectedTask)}
              >
                <Trash2 size={20} color="#FF3B30" />
                <Text style={styles.deleteOptionText}>Delete Task</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal: Delete Confirmation */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showDeleteConfirmModal}
          onRequestClose={() => setShowDeleteConfirmModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Task</Text>
              {taskToDelete && (
                <View style={styles.modalTaskDetails}>
                  <Text style={styles.modalTaskTitle}>
                    {taskToDelete.title}
                  </Text>
                  <Text style={styles.modalTaskDescription}>
                    Are you sure you want to delete this task?
                  </Text>
                </View>
              )}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowDeleteConfirmModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={confirmDeleteTask}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}
