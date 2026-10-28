"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCaptionStyle } from "@/lib/caption-styles";
import {
  generateObserved,
  finishGeneration,
  type GeneratedDraft,
} from "@/lib/generation-runtime";
export async function createCaption(
  _state: { error: string | null },
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      error: "Your session ended. Sign in again before creating a take.",
    };
  const scene = String(formData.get("scene") ?? "").trim(),
    style = String(formData.get("style") ?? ""),
    withImage = formData.get("withImage") === "on";
  if (scene.length < 10 || scene.length > 300)
    return { error: "Describe the NYC moment in 10 to 300 characters." };
  if (!isCaptionStyle(style))
    return { error: "Choose one of the three caption vibes." };
  const { count, error: countError } = await supabase
    .from("generation_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", new Date(Date.now() - 3600000).toISOString());
  if (countError)
    return {
      error: "Could not connect to your collection. Try again in a moment.",
    };
  if ((count ?? 0) >= 10)
    return {
      error:
        "You've made 10 requests this hour. Come back in a little while for more.",
    };
  const id = randomUUID();
  let imagePath: string | null = null;
  let draft: GeneratedDraft | undefined;
  try {
    draft = await generateObserved(
      supabase,
      user.id,
      scene,
      style,
      withImage,
      "rating-app",
    );
    if (draft.imageSvg) {
      imagePath = `${user.id}/${id}.svg`;
      const { error } = await supabase.storage
        .from("caption-images")
        .upload(imagePath, Buffer.from(draft.imageSvg), {
          contentType: "image/svg+xml",
          upsert: false,
        });
      if (error) throw Error("The illustration could not be saved.");
    }
    const { error } = await supabase
      .from("generations")
      .insert({
        id,
        created_by: user.id,
        scene,
        style,
        prompt: draft.prompt,
        caption: draft.caption,
        model: draft.model,
        image_path: imagePath,
        image_description: imagePath ? draft.imageDescription : null,
        image_prompt: draft.imagePrompt || null,
      });
    if (error) throw Error("Your take could not be saved.");
  } catch (error) {
    if (imagePath)
      await supabase.storage.from("caption-images").remove([imagePath]);
    if (draft)
      await finishGeneration(
        supabase,
        draft.requestId,
        "failed",
        draft.startedAt,
        undefined,
        "The generated take could not be saved to the database or image storage.",
      ).catch(() => {});
    return {
      error:
        error instanceof Error
          ? error.message
          : "AI generation could not finish. Please try again.",
    };
  }
  await finishGeneration(
    supabase,
    draft.requestId,
    "succeeded",
    draft.startedAt,
    id,
  );
  if (imagePath)
    await supabase.rpc("register_own_image", {
      p_bucket: "caption-images",
      p_path: imagePath,
      p_alt: draft.imageDescription,
      p_prompt: draft.imagePrompt,
    });
  revalidatePath("/");
  revalidatePath("/studio");
  redirect(`/#caption-${id}`);
}
