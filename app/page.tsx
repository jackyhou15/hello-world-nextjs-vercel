import Link from "next/link";
import { signInWithGoogle, signOut } from "@/app/actions";
import { rateCaption } from "@/app/votes/actions";
import { createClient } from "@/lib/supabase/server";

type Generation = {
  id: string;
  scene: string;
  style: string;
  prompt: string;
  caption: string;
  model: string;
  created_at: string;
};

type Score = {
  generation_id: string;
  upvotes: number;
  downvotes: number;
  score: number;
};

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: generations, error }, { data: scores }] = await Promise.all([
    supabase
      .from("generations")
      .select("id,scene,style,prompt,caption,model,created_at")
      .order("created_at", { ascending: false }),
    supabase.rpc("get_generation_scores"),
  ]);

  if (error) throw new Error(error.message);

  const { data: ownVotes } = user
    ? await supabase.from("votes").select("generation_id,value")
    : { data: [] };

  const scoreMap = new Map(
    ((scores ?? []) as Score[]).map((score) => [score.generation_id, score]),
  );
  const voteMap = new Map(
    (ownVotes ?? []).map((vote) => [vote.generation_id, vote.value]),
  );
  const captions = (generations ?? []) as Generation[];

  return (
    <main className="page-shell">
      <nav className="top-nav" aria-label="Primary navigation">
        <Link className="wordmark text-link" href="/">Sidewalk Takes</Link>
        {user ? (
          <div className="nav-actions">
            <Link className="button primary-button nav-button" href="/create">
              Make a caption
            </Link>
            <Link className="text-link" href="/studio">Private studio</Link>
            <Link className="text-link" href="/profile">Profile</Link>
            <form action={signOut}>
              <button className="button secondary-button" type="submit">Sign out</button>
            </form>
          </div>
        ) : (
          <form action={signInWithGoogle}>
            <button className="button primary-button" type="submit">Sign in with Google</button>
          </form>
        )}
      </nav>

      <section className="rating-hero" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">NYC captions · judged by locals</p>
          <h1 id="page-title">Did that take land?</h1>
          <p className="intro">
            Turn the strange little moments of city life into AI captions, then
            let the crowd decide what deserves another stop on the feed.
          </p>
          {user ? (
            <Link className="button primary-button hero-cta" href="/create">
              Generate today&apos;s take
            </Link>
          ) : (
            <p className="login-note">Sign in to generate and vote.</p>
          )}
        </div>
        <aside className="persona-card">
          <span className="persona-kicker">Built for Sam</span>
          <strong>New to NYC. Extremely online.</strong>
          <p>
            Specific city moments, quick reactions, and a fresh leaderboard
            make the feed worth checking between classes.
          </p>
        </aside>
      </section>

      <section className="feed-heading" aria-labelledby="feed-title">
        <div>
          <p className="eyebrow">Fresh from the five boroughs</p>
          <h2 id="feed-title">The caption board</h2>
        </div>
        <span className="status">{captions.length} AI generations</span>
      </section>

      {captions.length === 0 ? (
        <section className="empty-feed">
          <p>No captions yet. Be the first person to give the crowd a take.</p>
          {user && (
            <Link className="button primary-button" href="/create">
              Generate the first caption
            </Link>
          )}
        </section>
      ) : (
        <section className="caption-feed" aria-label="AI generated captions">
          {captions.map((generation, index) => {
            const score = scoreMap.get(generation.id) ?? {
              upvotes: 0,
              downvotes: 0,
              score: 0,
            };
            const ownVote = voteMap.get(generation.id);

            return (
              <article className="caption-card" id={`caption-${generation.id}`} key={generation.id}>
                <div className="caption-meta">
                  <span>#{String(captions.length - index).padStart(2, "0")}</span>
                  <span>{generation.style} mode</span>
                  <time dateTime={generation.created_at}>
                    {new Intl.DateTimeFormat("en-US", {
                      timeZone: "America/New_York",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(new Date(generation.created_at))}
                  </time>
                </div>

                <p className="scene">The moment: {generation.scene}</p>
                <blockquote>{generation.caption}</blockquote>

                <div className="rating-row">
                  {user ? (
                    <div className="vote-controls" aria-label="Rate this caption">
                      <form action={rateCaption}>
                        <input type="hidden" name="generationId" value={generation.id} />
                        <input type="hidden" name="value" value="1" />
                        <button
                          className={`vote-button ${ownVote === 1 ? "active" : ""}`}
                          type="submit"
                          aria-label="Upvote caption"
                          aria-pressed={ownVote === 1}
                        >
                          ↑ {score.upvotes}
                        </button>
                      </form>
                      <form action={rateCaption}>
                        <input type="hidden" name="generationId" value={generation.id} />
                        <input type="hidden" name="value" value="-1" />
                        <button
                          className={`vote-button ${ownVote === -1 ? "active down" : ""}`}
                          type="submit"
                          aria-label="Downvote caption"
                          aria-pressed={ownVote === -1}
                        >
                          ↓ {score.downvotes}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <span className="rating-hint">Sign in to rate</span>
                  )}
                  <strong className="score">Score {score.score}</strong>
                </div>

                <details className="prompt-details">
                  <summary>See the saved AI prompt</summary>
                  <pre>{generation.prompt}</pre>
                  <span>Generated with {generation.model}</span>
                </details>
              </article>
            );
          })}
        </section>
      )}

      <footer>
        <span>Next.js</span><span aria-hidden="true">×</span>
        <span>Supabase RLS</span><span aria-hidden="true">×</span>
        <span>Gemini</span><span aria-hidden="true">×</span>
        <span>Vercel</span>
      </footer>
    </main>
  );
}
