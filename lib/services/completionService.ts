import { supabase } from "../supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

const BUCKET_NAME = "habit-photos";

export class CompletionError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "CompletionError";
  }
}

export async function handleImageUpload(
  imageUri: string,
  userId: string,
): Promise<{ publicUrl: string | null; error: Error | null }> {
  try {
    // Step 1: Read image as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Step 2: Convert to binary buffer
    const fileBuffer = decode(base64);

    // Step 3: Build a file path
    const fileName = `${userId}-${Date.now()}.jpg`;
    const filePath = `proofs/${fileName}`;

    // Step 4: Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME) // your bucket name
      .upload(filePath, fileBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      return { publicUrl: null, error: uploadError };
    }

    // Step 5: Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return { publicUrl, error: null };
  } catch (error) {
    return { publicUrl: null, error: new Error() };
  }
}

export async function addCompletion(
  taskId: string,
  publicUri: string,
): Promise<{ success: boolean; error?: CompletionError }> {
  try {
    console.log("attempting to add completion: ", publicUri);
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      throw new CompletionError("User not authenticated");
    }

    const userId = userData.user.id;

    const { data: completionData, error: completionError } = await supabase
      .from("habit_completions")
      .insert({
        habit_id: taskId,
        user_id: userId,
        image_uri: publicUri,
      });

    if (completionError) {
      throw new CompletionError(completionError.message, "INSERT_FAILED");
    }

    return { success: true };
  } catch (e) {
    if (e instanceof CompletionError) {
      return { success: false, error: e };
    }
    console.error("unexpected error adding completion");
    return {
      success: false,
      error: new CompletionError("Unexpected Error occured", "UNKNOWN"),
    };
  }
}
