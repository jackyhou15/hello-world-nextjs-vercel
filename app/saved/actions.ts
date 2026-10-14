"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
export type MutationState = { error: string | null; message: string | null };
export async function saveCaption(_state: MutationState, formData: FormData): Promise<MutationState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in to save captions.", message: null };
  const generationId = String(formData.get("generationId") ?? "");
  const save = formData.get("save") === "true";
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(generationId)) return { error: "This caption could not be saved.", message: null };
  const { error } = save
    ? await supabase.from("saved_captions").upsert({ user_id: user.id, generation_id: generationId }, { onConflict: "user_id,generation_id", ignoreDuplicates: true })
    : await supabase.from("saved_captions").delete().eq("user_id", user.id).eq("generation_id", generationId);
  if (error) return { error: "Could not update your collection. Please try again.", message: null };
  revalidatePath("/"); revalidatePath("/studio");
  return { error: null, message: save ? "Saved to My collection." : "Removed from My collection." };
}
