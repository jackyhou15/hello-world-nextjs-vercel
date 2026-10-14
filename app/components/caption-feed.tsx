/* eslint-disable @next/next/no-img-element */
import { CaptionControls } from "./caption-controls";
import { createClient } from "@/lib/supabase/server";
import type { BoardData, Generation } from "@/lib/board";
import { captionStyles, isCaptionStyle } from "@/lib/caption-styles";
export async function CaptionFeed({ captions, board }: { captions: Generation[]; board: BoardData }) {
  const supabase = await createClient();
  const scores = new Map(board.scores.map((score) => [score.generation_id, score]));
  const votes = new Map(board.votes.map((vote) => [vote.generation_id, vote.value]));
  return <section className="caption-feed" aria-label="AI generated captions">
    {captions.map((item) => {
      const score = scores.get(item.id) ?? { upvotes: 0, downvotes: 0, score: 0 };
      const imageUrl = item.image_path ? supabase.storage.from("caption-images").getPublicUrl(item.image_path).data.publicUrl : null;
      return <article className="caption-card" id={`caption-${item.id}`} key={item.id}>
        {imageUrl && <div className="caption-art"><img src={imageUrl} alt={item.image_description ?? `AI illustration of ${item.scene}`} loading="lazy" width="800" height="600" /><span className="art-label">AI illustration</span></div>}
        <div className="caption-body">
          <div className="caption-meta"><span className={`vibe-badge ${item.style}`}>{isCaptionStyle(item.style) ? captionStyles[item.style].label : item.style}</span><time dateTime={item.created_at}>{new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" }).format(new Date(item.created_at))}</time><span className="score">{score.score} <span>{Math.abs(score.score) === 1 ? "point" : "points"}</span></span></div>
          <p className="scene">{item.scene}</p>
          <blockquote>{item.caption}</blockquote>
          <CaptionControls id={item.id} caption={item.caption} signedIn={board.signedIn} vote={votes.get(item.id)} saved={board.savedIds.includes(item.id)} upvotes={score.upvotes} downvotes={score.downvotes} />
          <details className="prompt-details"><summary>Behind the take · AI prompts</summary><p>Caption · {item.model}</p><pre>{item.prompt}</pre>{item.image_prompt && <><p>Illustration · {item.model}</p><pre>{item.image_prompt}</pre></>}</details>
        </div>
      </article>;
    })}
  </section>;
}
