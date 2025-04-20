import { StyleSheet } from "react-native";

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
  taskItemContainer: {
    flexDirection: "column",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 8,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    flex: 1,
  },
  taskItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
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
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  taskOptionsButton: {
    padding: 8,
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

  // TASK PHOTOS
  taskPhotoContainer: {
    marginTop: 12,
    marginBottom: 8,
    width: "100%",
    alignItems: "center", // Center the image horizontally
    justifyContent: "center",
  },
  taskPhoto: {
    width: 200, // Larger square dimensions
    height: 200, // Same as width for square aspect ratio
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  photoPreviewContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 16,
  },
  photoPreview: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  retakePhotoButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  retakePhotoText: {
    color: "#5E72E4",
    fontSize: 14,
    fontWeight: "500",
  },
  cameraButton: {
    backgroundColor: "#5E72E4",
    padding: 16,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 8,
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
    maxHeight: "80%",
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
    width: "100%",
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
  optionsModalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 8,
    width: "60%",
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
  },
  deleteOptionText: {
    fontSize: 16,
    color: "#FF3B30",
    marginLeft: 12,
  },
  takePhotoText: {
    color: "#5E72E4",
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
});

export default styles;
