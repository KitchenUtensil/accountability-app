import { supabase } from "../supabase";
import { GroupError } from "./groupService";
import { Task, GroupMember } from "@/types/dashboard";

/**
 * Error type for habit operations
 */
export class HabitError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "HabitError";
  }
}

/**
 * Add a new habit task for the current user in their group
 */
export async function addHabitTask(
  taskName: string,
): Promise<{ success: boolean; id?: string; error?: HabitError | GroupError }> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      throw new HabitError("User not authenticated", "AUTH_ERROR");
    }

    const userId = userData.user.id;

    const { data: userProfileData, error: userProfileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    const userIdBigInt = userProfileData?.id;

    const { data: groupData, error: groupError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId);

    if (groupError || !groupData || groupData.length === 0) {
      throw new GroupError("No group found for user", "NO_GROUP");
    }

    const groupId = groupData[0].group_id;

    const { data: habitData, error: habitError } = await supabase
      .from("habits")
      .insert({
        group_id: groupId,
        user_id: userId,
        name: taskName.trim(),
      })
      .select() // <-- This tells Supabase to return the inserted row(s)
      .single(); // <-- If inserting just one row

    if (habitError || !habitData) {
      throw new HabitError("Failed to insert task", "TASK_INSERT_ERROR");
    }

    return { success: true, id: habitData.id };
  } catch (e) {
    if (e instanceof HabitError || e instanceof GroupError) {
      return { success: false, error: e };
    }

    console.error("Unexpected error inserting habit:", e);
    return {
      success: false,
      error: new HabitError("Unexpected error occurred", "UNKNOWN"),
    };
  }
}

export async function deleteHabitTask(
  taskId: string,
): Promise<{ success: boolean; error?: HabitError }> {
  try {
    console.log("attempting to delete task: ", taskId);
    const { data, error } = await supabase
      .from("habits")
      .delete()
      .eq("id", Number(taskId));
    if (error) {
      throw new HabitError("Failed to delete task", "TASK_DELETE_ERROR");
    }
    return { success: true };
  } catch (e) {
    if (e instanceof HabitError) {
      return { success: false, error: e };
    }
    console.error("unexpected error deleting habit", e);
    return {
      success: false,
      error: new HabitError("Unexpected error occured", "UNKNOWN"),
    };
  }
}

export async function getHabitTasks(): Promise<{
  members?: GroupMember[];
  error?: HabitError | GroupError;
}> {
  try {
    // Step 1: Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      throw new HabitError("User not authenticated", "AUTH_ERROR");
    }

    const currentUserId = userData.user.id;

    // Step 2: Find user's group_id
    const { data: groupRow, error: groupError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", currentUserId)
      .maybeSingle();

    if (groupError || !groupRow?.group_id) {
      throw new GroupError("User is not in a group", "NO_GROUP");
    }

    const groupId = groupRow.group_id;

    // Step 3: Get all members in the group (and their profiles)
    const { data: memberRows, error: memberError } = await supabase
      .from("group_members")
      .select("user_id, profiles(display_name)")
      .eq("group_id", groupId);
    if (memberError || !memberRows) {
      throw new GroupError(
        "Failed to fetch group members",
        "MEMBERS_FETCH_ERROR",
      );
    }

    console.log("fetching from: ", groupId);
    console.log(memberRows);
    // Step 4: Get all tasks in the group
    const { data: taskRows, error: taskError } = await supabase
      .from("habits")
      .select("id, name, user_id")
      .eq("group_id", groupId);

    if (taskError || !taskRows) {
      throw new HabitError("Failed to fetch habit tasks", "TASK_FETCH_ERROR");
    }

    //get all profiles in a group
    const { data: profileRows, error: profileError } = await supabase
      .from("group_members")
      .select("user_id, profiles(id, display_name)")
      .eq("group_id", groupId);

    if (profileError || !profileRows) {
      throw new GroupError(
        "Failed to fetch group profiles ",
        "GROUP_FETCH_ERROR",
      );
    }

    // Step 5: Group tasks by user (synchronously)
    const members: GroupMember[] = memberRows.map((member) => {
      console.log(member);
      const userId = member.user_id;
      const profile = member.profiles;

      const name =
        userId === currentUserId ? "You" : (profile?.display_name ?? "Unknown");
      const avatar =
        profile?.avatar ?? "https://placeholder.svg?height=50&width=50";

      const tasks: Task[] = taskRows
        .filter((task) => task.user_id === userId)
        .map((task) => ({
          id: task.id.toString(),
          title: task.name,
          completed: task.completed,
        }));

      return {
        id: userId,
        name,
        avatar,
        tasks,
        lastCheckin: "", // Replace this if you track activity
      };
    });

    return { members };
  } catch (e) {
    if (e instanceof HabitError || e instanceof GroupError) {
      return { error: e };
    }

    console.error("Unexpected error in getHabitTasks:", e);
    return {
      error: new HabitError("Unexpected error occurred", "UNKNOWN"),
    };
  }
}
