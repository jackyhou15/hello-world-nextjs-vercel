"use server";

import { GoogleGenAI } from "@google/genai";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedStyles = new Set(["dry", "chaotic", "wholesome"]);
const model = "gemini-3.5-flash-lite";

export async function createCaption(
  _previousState: { error: string | null },
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const scene = String(formData.get("scene") ?? "").trim();
  const style = String(formData.get("style") ?? "");

  if (scene.length < 10 || scene.length > 300) {
    return { error: "Describe the NYC moment in 10 to 300 characters." };
  }
  if (!allowedStyles.has(style)) {
    return { error: "Choose one of the available caption styles." };
  }
  if (!process.env.GEMINI_API_KEY) {
    return { error: "AI generation is not configured yet." };
  }

  const prompt = `Write one original social caption about this New York City moment.

Audience: A chronically online college student who is new to NYC and explores the city on weekends.
Moment: ${scene}
Tone: ${style}

Requirements:
- One sentence, no more than 24 words.
- Be specific, surprising, and easy to rate.
- Keep it PG-13 and avoid stereotypes, slurs, or claims about real people.
- Do not use hashtags, quotation marks, or an explanation.

Return only the caption.`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { temperature: 1.1, maxOutputTokens: 80 },
    });

    const caption = response.text?.trim().replace(/^["“]|["”]$/g, "");
    if (!caption) {
      return { error: "The AI did not return a caption. Please try again." };
    }

    const { data, error } = await supabase
      .from("generations")
      .insert({
        created_by: user.id,
        scene,
        style,
        prompt,
        caption,
        model,
      })
      .select("id")
      .single();

    if (error) {
      return { error: "The caption was generated but could not be saved." };
    }

    redirect(`/#caption-${data.id}`);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "NEXT_REDIRECT" || error.message.includes("NEXT_REDIRECT"))
    ) {
      throw error;
    }
    return { error: "Gemini could not generate a caption. Please try again." };
  }
}
