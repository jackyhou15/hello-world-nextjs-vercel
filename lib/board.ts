import { createClient } from "@/lib/supabase/server";
export type Generation = {
  id: string; created_by: string; scene: string; style: string; prompt: string;
  caption: string; model: string; image_path: string | null;
  image_description: string | null; image_prompt: string | null; created_at: string;
};
export type Score = { generation_id: string; upvotes: number; downvotes: number; score: number };
export type BoardData = {
  captions: Generation[]; scores: Score[]; votes: { generation_id: string; value: number }[];
  savedIds: string[]; signedIn: boolean; error: string | null;
};
export type BoardParams = { q?: string; vibe?: string; sort?: string; tab?: string };
export async function loadBoard(collection?: "saved" | "mine"): Promise<BoardData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [voteResult, savedResult, scoreResult] = await Promise.all([
    user ? supabase.from("votes").select("generation_id,value") : Promise.resolve({ data: [], error: null }),
    user ? supabase.from("saved_captions").select("generation_id,created_at").order("created_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
    supabase.rpc("get_generation_scores"),
  ]);
  const savedIds = (savedResult.data ?? []).map((row) => row.generation_id as string);
  const base: BoardData = {
    captions: [], scores: scoreResult.data ?? [], votes: voteResult.data ?? [], savedIds, signedIn: !!user,
    error: scoreResult.error || voteResult.error || savedResult.error ? "The board could not load completely. Please refresh in a moment." : null,
  };
  if (collection && !user) return base;
  if (collection === "saved" && savedIds.length === 0) return base;
  let query = supabase.from("generations").select("id,created_by,scene,style,prompt,caption,model,image_path,image_description,image_prompt,created_at").order("created_at", { ascending: false });
  if (collection === "mine") query = query.eq("created_by", user!.id);
  if (collection === "saved") query = query.in("id", savedIds);
  const { data, error } = await query;
  base.captions = data ?? [];
  if (error) base.error = "Captions could not load. Please refresh in a moment.";
  if (collection === "saved") base.captions.sort((a, b) => savedIds.indexOf(a.id) - savedIds.indexOf(b.id));
  return base;
}
export function filterBoard(data: BoardData, params: BoardParams): Generation[] {
  const search = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";
  const captions = data.captions.filter((item) =>
    (!search || `${item.scene} ${item.caption}`.toLowerCase().includes(search)) &&
    (!params.vibe || params.vibe === "all" || item.style === params.vibe),
  );
  if (params.sort === "top") {
    const scores = new Map(data.scores.map((score) => [score.generation_id, score.score]));
    captions.sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0) || b.created_at.localeCompare(a.created_at));
  }
  return captions;
}
