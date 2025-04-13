import { supabase } from "@/lib/supabase";

/**
 * Error type for invite code operations
 */
export class InviteError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "InviteError";
  }
}

/**
 * Response object for invite code operations
 */
interface InviteResponse {
  inviteCode?: string;
  error?: InviteError;
}

/**
 * Generate or refresh an invite code for a group
 * 
 * This function calls the secure-invite-code Edge Function to generate
 * a new invite code or refresh an existing one for a group
 * 
 * @param groupId The ID of the group to generate an invite code for
 * @returns An object containing the invite code or an error
 */
export async function generateInviteCode(groupId: string): Promise<InviteResponse> {
  try {
    // Call the Edge Function using Supabase SDK
    const { data, error } = await supabase.functions.invoke('secure-invite-code', {
      body: { groupId }
    });
    
    if (error) {
      throw new InviteError(`Edge function error: ${error.message}`, "EDGE_FUNCTION_ERROR");
    }
    
    if (!data || !data.inviteCode) {
      throw new InviteError("Invite code was not returned", "INVALID_RESPONSE");
    }
    
    return { inviteCode: data.inviteCode };
  } catch (error) {
    if (error instanceof InviteError) {
      return { error };
    }
    
    // Handle unexpected errors
    console.error("Unexpected error in generateInviteCode:", error);
    return { 
      error: new InviteError(
        "An unexpected error occurred while generating the invite code", 
        "UNKNOWN_ERROR"
      ) 
    };
  }
}

/**
 * Join a group using an invite code
 * 
 * @param inviteCode The invite code to use
 * @returns An object containing the success status or an error
 */
export async function joinGroupWithInviteCode(inviteCode: string): Promise<{ success?: boolean; error?: InviteError }> {
  try {
    // First, get the user's session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new InviteError(`Authentication error: ${sessionError.message}`, "AUTH_ERROR");
    }
    
    if (!sessionData.session) {
      throw new InviteError("You must be logged in to join a group", "NOT_AUTHENTICATED");
    }
    
    const userId = sessionData.session.user.id;
    
    // Step 1: Find the invite code and check if it's valid
    const { data: inviteData, error: inviteError } = await supabase
      .from('invites')
      .select('group_id, expires_at')
      .eq('invite_code', inviteCode)
      .gt('expires_at', new Date().toISOString()) // Check if not expired
      .single();
    
    if (inviteError || !inviteData) {
      throw new InviteError("Invalid or expired invite code", "INVALID_INVITE");
    }
    
    // Step 2: Check if the user is already a member of the group
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('group_members')
      .select('id')
      .eq('user_id', userId)
      .eq('group_id', inviteData.group_id)
      .single();
    
    if (existingMember) {
      throw new InviteError("You are already a member of this group", "ALREADY_MEMBER");
    }
    
    // Step 3: Add the user to the group
    const { error: addMemberError } = await supabase
      .from('group_members')
      .insert({
        user_id: userId,
        group_id: inviteData.group_id,
        invite_code: inviteCode
      });
    
    if (addMemberError) {
      throw new InviteError(`Failed to join group: ${addMemberError.message}`, "JOIN_ERROR");
    }
    
    return { success: true };
  } catch (error) {
    if (error instanceof InviteError) {
      return { error };
    }
    
    // Handle unexpected errors
    console.error("Unexpected error in joinGroupWithInviteCode:", error);
    return { 
      error: new InviteError(
        "An unexpected error occurred while joining the group", 
        "UNKNOWN_ERROR"
      )
    };
  }
} 