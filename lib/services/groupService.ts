import { supabase } from "@/lib/supabase";
import { Group, GroupMember } from "@/types/database";

/**
 * Error type for group operations
 */
export class GroupError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "GroupError";
  }
}

/**
 * Response object for group operations
 */
interface GroupResponse {
  group?: Group;
  member?: GroupMember;
  error?: GroupError;
}

/**
 * Creates a new accountability group with the current user as creator
 * 
 * @param groupName Name of the group to create
 * @returns Object containing the created group and member information or error
 */
export async function createGroup(groupName: string): Promise<GroupResponse> {
  try {
    // Step 1: Get the current user's session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new GroupError("Authentication error: " + sessionError.message, "AUTH_ERROR");
    }
    
    if (!sessionData.session) {
      throw new GroupError("You must be logged in to create a group", "NOT_AUTHENTICATED");
    }
    
    const userId = sessionData.session.user.id;
    
    // Step 2: Get the user's profile to ensure they exist
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();
    
    if (profileError || !profileData) {
      throw new GroupError("User profile not found", "PROFILE_NOT_FOUND");
    }
    
    // Step 3: Create the group
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert({
        name: groupName,
        created_by: userId
      })
      .select()
      .single();
    
    if (groupError) {
      throw new GroupError("Failed to create group: " + groupError.message, "GROUP_CREATE_ERROR");
    }
    
    // Step 4: Add the current user as a group member
    const { data: memberData, error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: groupData.id,
        user_id: userId
      })
      .select()
      .single();
    
    if (memberError) {
      // If adding the member fails, attempt to clean up by deleting the created group
      await supabase.from('groups').delete().eq('id', groupData.id);
      throw new GroupError("Failed to add you to the group: " + memberError.message, "MEMBER_ADD_ERROR");
    }
    
    return {
      group: groupData,
      member: memberData
    };
  } catch (error) {
    if (error instanceof GroupError) {
      return { error };
    }
    
    // Handle unexpected errors
    console.error("Unexpected error in createGroup:", error);
    return { 
      error: new GroupError(
        "An unexpected error occurred while creating the group", 
        "UNKNOWN_ERROR"
      ) 
    };
  }
}

/**
 * Get all groups that the current user is a member of
 * 
 * @returns List of groups the user is a member of
 */
export async function getUserGroups(): Promise<{groups?: Group[], error?: GroupError}> {
  try {
    // Get current user
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new GroupError("Authentication error: " + sessionError.message, "AUTH_ERROR");
    }
    
    if (!sessionData.session) {
      throw new GroupError("You must be logged in to fetch groups", "NOT_AUTHENTICATED");
    }
    
    const userId = sessionData.session.user.id;
    
    // Get all groups the user is a member of
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select(`
        *,
        group_members!inner(user_id)
      `)
      .eq('group_members.user_id', userId);
    
    if (groupsError) {
      throw new GroupError("Failed to fetch groups: " + groupsError.message, "GROUPS_FETCH_ERROR");
    }
    
    return { groups };
  } catch (error) {
    if (error instanceof GroupError) {
      return { error };
    }
    
    console.error("Unexpected error in getUserGroups:", error);
    return { 
      error: new GroupError(
        "An unexpected error occurred while fetching groups", 
        "UNKNOWN_ERROR"
      ) 
    };
  }
}

/**
 * Check if the current user is a member of any group
 * 
 * @returns Boolean indicating if user is in a group and group information if applicable
 */
export async function checkUserInGroup(): Promise<{isInGroup: boolean, group?: Group, error?: GroupError}> {
  try {
    const { groups, error } = await getUserGroups();
    
    if (error) {
      throw error;
    }
    
    const isInGroup = Array.isArray(groups) && groups.length > 0;
    const group = isInGroup ? groups[0] : undefined;
    
    return { isInGroup, group };
  } catch (error) {
    if (error instanceof GroupError) {
      return { isInGroup: false, error };
    }
    
    console.error("Unexpected error in checkUserInGroup:", error);
    return { 
      isInGroup: false,
      error: new GroupError(
        "An unexpected error occurred while checking group membership", 
        "UNKNOWN_ERROR"
      ) 
    };
  }
} 