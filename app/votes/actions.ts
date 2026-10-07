"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function rateCaption(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to rate captions.");

  const generationId = String(formData.get("generationId") ?? "");
  const value = Number(formData.get("value"));
  if (!generationId || (value !== 1 && value !== -1)) {
    throw new Error("Invalid vote.");
  }

  const { data: existing, error: readError } = await supabase
    .from("votes")
    .select("id,value")
    .eq("generation_id", generationId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (readError) throw new Error(readError.message);

  if (existing?.value === value) {
    const { error } = await supabase.from("votes").delete().eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("votes").upsert(
      {
        generation_id: generationId,
        user_id: user.id,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "generation_id,user_id" },
    );
    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
}
