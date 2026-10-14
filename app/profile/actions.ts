"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { avatarExtensions, avatarFileError } from "@/lib/profile-upload";

type UploadResult = { error: string; path?: never; signedUrl?: never } | { error: null; path: string; signedUrl: string };

export async function prepareAvatarUpload(type: string, size: number): Promise<UploadResult> {
  const validationError = avatarFileError(type, size);
  if (validationError) return { error: validationError };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again before uploading a photo." };
  // The signed URL can upload only this one new object in the current user's folder.
  const path = `${user.id}/${randomUUID()}.${avatarExtensions[type]}`;
  const { data, error } = await supabase.storage.from("avatars").createSignedUploadUrl(path);
  if (error || !data) return { error: "Photo upload couldn't start. Please try again." };
  return { error: null, path, signedUrl: data.signedUrl };
}

export async function updateProfile(formData: FormData): Promise<{ error: string | null; message: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again to save your profile.", message: null };
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  if (!firstName || !lastName || firstName.length > 100 || lastName.length > 100) {
    return { error: "Enter a first and last name, each up to 100 characters.", message: null };
  }
  const avatarPath = String(formData.get("avatarPath") ?? "");
  if (avatarPath) {
    const filename = avatarPath.slice(user.id.length + 1);
    if (!avatarPath.startsWith(`${user.id}/`) || !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}\.(?:jpg|png|webp|gif)$/i.test(filename)) {
      return { error: "Please choose your photo again before saving.", message: null };
    }
    // Verify the actual Storage object, not the size/type supplied by the browser.
    const { data, error } = await supabase.storage.from("avatars").info(avatarPath);
    if (error || !data || avatarFileError(data.contentType ?? "", data.size ?? 0)) {
      return { error: "Your photo hasn't finished uploading or isn't a supported image. Please choose it again.", message: null };
    }
  }
  const { error } = await supabase.from("profiles").upsert({
    id: user.id, first_name: firstName, last_name: lastName,
    updated_at: new Date().toISOString(), ...(avatarPath ? { avatar_path: avatarPath } : {}),
  }, { onConflict: "id" });
  if (error) return { error: "Your profile couldn't be saved. Please try again.", message: null };
  revalidatePath("/"); revalidatePath("/profile"); revalidatePath("/studio");
  return { error: null, message: "Profile saved." };
}
