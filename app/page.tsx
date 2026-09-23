type FavoriteThing = {
  id: number;
  name: string;
  category: string;
  note: string;
};

async function getFavoriteThings(): Promise<FavoriteThing[]> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/favorite_things?select=id,name,category,note&order=id.asc`,
    {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Supabase request failed with status ${response.status}.`);
  }

  return response.json() as Promise<FavoriteThing[]>;
}

export default async function Home() {
  const favoriteThings = await getFavoriteThings();

  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">A tiny Supabase collection</p>
        <h1 id="page-title">Things that spark ideas</h1>
        <p className="intro">
          A live list fetched from my Supabase database and rendered by Next.js.
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
        <span>Vercel</span>
      </footer>
    </main>
  );
}
