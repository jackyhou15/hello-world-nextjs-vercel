import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { CaptionForm } from "./caption-form";

export default async function CreatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return (
    <main className="page-shell compact-shell">
      <nav className="top-nav" aria-label="Primary navigation">
        <Link className="wordmark text-link" href="/">Sidewalk Takes</Link>
        <div className="nav-actions">
          <Link className="text-link" href="/profile">Profile</Link>
          <form action={signOut}>
            <button className="button secondary-button" type="submit">Sign out</button>
          </form>
        </div>
      </nav>

      <section className="generator-panel" aria-labelledby="generator-title">
        <p className="eyebrow">AI caption studio</p>
        <h1 className="section-title" id="generator-title">
          Turn a city moment into a take.
        </h1>
        <p className="intro">
          Give Gemini one oddly specific NYC scene. We save both the prompt and
          its caption so the crowd can decide whether it lands.
        </p>
        <CaptionForm />
      </section>
    </main>
  );
}
