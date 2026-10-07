import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

export default async function StudioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name,last_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="page-shell compact-shell">
      <nav className="top-nav" aria-label="Primary navigation">
        <Link className="text-link" href="/">
          Home
        </Link>
        <Link className="text-link" href="/profile">
          Profile
        </Link>
        <Link className="text-link" href="/create">
          Make a caption
        </Link>
        <form action={signOut}>
          <button className="button secondary-button" type="submit">
            Sign out
          </button>
        </form>
      </nav>

      <section className="gated-panel" aria-labelledby="studio-title">
        <p className="eyebrow">Members only</p>
        <h1 className="section-title" id="studio-title">
          Private idea studio
        </h1>
        <p className="intro">
          Welcome{profile?.first_name ? `, ${profile.first_name}` : ""}. This
          route is only rendered after Supabase verifies your signed-in user.
        </p>
        <div className="gated-note">
          <span className="status-dot" aria-hidden="true" />
          Authenticated as {user.email}
        </div>
      </section>
    </main>
  );
}
