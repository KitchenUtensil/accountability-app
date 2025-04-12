import { SetStateAction, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
} from "react-native";
import {
  CheckCircle,
  PlusCircle,
  Users,
  Bell,
  Settings,
} from "lucide-react-native";
import { Task, GroupMember } from "@/types/dashboard";

// Mock data for group members and their tasks
const groupMembers: GroupMember[] = [
  {
    id: "1",
    name: "You",
    avatar: "https://placeholder.svg?height=50&width=50",
    tasks: [
      {id: "1", title: "Morning workout", completed: false},
      {id: "2", title: "Read for 30 minutes", completed: false},
    ],
    lastCheckin: "2 hours ago",
  },
  {
    id: "2",
    name: "Sarah",
    avatar: "https://placeholder.svg?height=50&width=50",
    tasks: [
      {id: "1", title: "Meditation", completed: true},
      {id: "2", title: "Coding practice", completed: true},
    ],
    lastCheckin: "30 minutes ago",
  },
  {
    id: "3",
    name: "Mike",
    avatar: "https://placeholder.svg?height=50&width=50",
    tasks: [{id: "1", title: "Run 5k", completed: true}],
    lastCheckin: "1 hour ago",
  },
  {
    id: "4",
    name: "Jessica",
    avatar: "https://placeholder.svg?height=50&width=50",
    tasks: [
      {id: "1", title: "Study Spanish", completed: false},
      {id: "2", title: "Yoga session", completed: true},
    ],
    lastCheckin: "3 hours ago",
  },
];

const DashboardScreen = () => {
  const userInGroup = false; //replace this later with real logic

  const [showJoinCreateModal, setShowJoinCreateModal] = useState(!userInGroup);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [myTasks, setMyTasks] = useState<Task[]>(groupMembers[0].tasks);

  const handleCreateGroup = () => {
    console.log("User creates a group");
    setShowJoinCreateModal(false);
  };

  const handleJoinGroup = () => {
    console.log("User joins a group");
    setShowJoinCreateModal(false);
  };

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setShowCheckInModal(true);
  };

  const handleCompleteTask = () => {
    if (!selectedTask) return;
    
    setMyTasks(
      myTasks.map((task) =>
        task.id === selectedTask.id ? { ...task, completed: true } : task,
      ),
    );
    setShowCheckInModal(false);
  };

  const renderMemberCard = ({ item }: { item: GroupMember }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View>
          <Text style={styles.memberName}>{item.name}</Text>
          <Text style={styles.lastCheckin}>{item.lastCheckin}</Text>
        </View>
      </View>

      <View style={styles.taskList}>
        {item.tasks.map((task) => (
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
          <TouchableOpacity style={styles.addTaskButton}>
            <PlusCircle size={16} color="#5E72E4" />
            <Text style={styles.addTaskText}>Add task</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.groupName}>Morning Workout Crew</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Settings size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.groupActions}>
        <TouchableOpacity
          style={styles.groupActionButton}
          onPress={() => console.log("create group")}
        >
          <PlusCircle size={18} color="#5E72E4" />
          <Text style={styles.groupActionText}>Create Group</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.groupActionButton}
          onPress={() => console.log("join group")}
        >
          <Users size={18} color="#5E72E4" />
          <Text style={styles.groupActionText}>Join Group</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groupMembers}
        renderItem={renderMemberCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.membersList}
      />

      {/* Check-in Confirmation Modal */}
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
                <Text style={styles.modalTaskTitle}>{selectedTask.title}</Text>
                <Text style={styles.modalTaskDescription}>
                  Mark this task as completed for today?
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
              You are not currently in a group. Would you like to create or join
              a group?
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  groupName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  groupInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  groupMembers: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  headerIcons: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 16,
  },
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
  membersList: {
    padding: 16,
  },
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
  },
  modalTaskDescription: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
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
    marginRight: 8,
  },
  completeButton: {
    backgroundColor: "#5E72E4",
    marginLeft: 8,
  },
  createButton: {
    backgroundColor: "#5E72E4",
  },
  joinButton: {
    backgroundColor: "#4CAF50",
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
});

export default DashboardScreen;
