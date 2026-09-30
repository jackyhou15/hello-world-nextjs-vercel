import Link from "next/link";
import { signInWithGoogle, signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

type FavoriteThing = {
  id: number;
  name: string;
  category: string;
  note: string;
};

async function getFavoriteThings(): Promise<FavoriteThing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorite_things")
    .select("id,name,category,note")
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as FavoriteThing[];
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const favoriteThings = await getFavoriteThings();

  return (
    <main className="page-shell">
      <nav className="top-nav" aria-label="Primary navigation">
        <span className="wordmark">Idea Cabinet</span>
        {user ? (
          <div className="nav-actions">
            <Link className="text-link" href="/studio">
              Private studio
            </Link>
            <Link className="text-link" href="/profile">
              Profile
            </Link>
            <form action={signOut}>
              <button className="button secondary-button" type="submit">
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <form action={signInWithGoogle}>
            <button className="button primary-button" type="submit">
              Sign in with Google
            </button>
          </form>
        )}
      </nav>

      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">Supabase collection + authentication</p>
        <h1 id="page-title">Things that spark ideas</h1>
        <p className="intro">
          A live list fetched from my Supabase database. Sign in with Google to
          open your private studio and profile.
        </p>

        <div className="status" role="status">
          <span className="status-dot" aria-hidden="true" />
          Connected · {favoriteThings.length} records
        </div>
      </section>

      <section className="collection" aria-label="Favorite things">
        {favoriteThings.map((thing, index) => (
          <article className="card" key={thing.id}>
            <div className="card-number" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div>
              <p className="category">{thing.category}</p>
              <h2>{thing.name}</h2>
              <p className="note">{thing.note}</p>
            </div>
          </article>
        ))}
      </section>

      <footer>
        <span>Next.js</span>
        <span aria-hidden="true">×</span>
        <span>Supabase</span>
        <span aria-hidden="true">×</span>
        <span>Google OAuth</span>
        <span aria-hidden="true">×</span>
        <span>Vercel</span>
      </footer>
    </main>
  );
}
