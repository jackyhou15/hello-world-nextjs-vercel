"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();

  if (!firstName || !lastName) {
    throw new Error("First name and last name are required.");
  }

  let avatarPath: string | undefined;
  const avatar = formData.get("avatar");

  if (avatar instanceof File && avatar.size > 0) {
    if (!allowedImageTypes.has(avatar.type)) {
      throw new Error("Upload a JPG, PNG, WebP, or GIF image.");
    }

    if (avatar.size > 5 * 1024 * 1024) {
      throw new Error("Profile photos must be 5 MB or smaller.");
    }

    avatarPath = `${user.id}/avatar`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(avatarPath, await avatar.arrayBuffer(), {
        contentType: avatar.type,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }
  }

  const profile = {
    id: user.id,
    first_name: firstName,
    last_name: lastName,
    updated_at: new Date().toISOString(),
    ...(avatarPath ? { avatar_path: avatarPath } : {}),
  };

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" });

  if (profileError) {
    throw new Error(profileError.message);
  }

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/studio");
  redirect("/profile");
}
