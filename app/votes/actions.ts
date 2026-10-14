"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MutationState } from "@/app/saved/actions";
export async function rateCaption(_state: MutationState, formData: FormData): Promise<MutationState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in to vote.", message: null };
  const generationId = String(formData.get("generationId") ?? "");
  const value = Number(formData.get("value"));
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(generationId) || ![-1, 0, 1].includes(value)) return { error: "Choose an upvote or downvote.", message: null };
  const { error } = value === 0
    ? await supabase.from("votes").delete().eq("generation_id", generationId).eq("user_id", user.id)
    : await supabase.from("votes").upsert({ generation_id: generationId, user_id: user.id, value, updated_at: new Date().toISOString() }, { onConflict: "generation_id,user_id" });
  if (error) return { error: "Your vote could not be saved. Please try again.", message: null };
  revalidatePath("/"); revalidatePath("/studio");
  return { error: null, message: value === 0 ? "Vote removed." : "Vote saved." };
}
