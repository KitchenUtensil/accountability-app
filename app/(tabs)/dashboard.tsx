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
import styles from '../styles/dashboard.styles';
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
    console.log("User joins a group")
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

