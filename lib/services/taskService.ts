import { supabase } from "../supabase";
import { GroupError } from "./groupService";

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
): Promise<{ success: boolean; error?: HabitError | GroupError }> {
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

    const { data: habitData, error: habitError } = await supabase
      .from("habits")
      .insert({
        group_id: groupData[0].group_id,
        user_id: userIdBigInt,
        name: taskName.trim(),
      });

    if (habitError) {
      throw new HabitError("Failed to insert task", "TASK_INSERT_ERROR");
    }

    return { success: true };
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
