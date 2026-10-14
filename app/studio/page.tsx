import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteNav } from "@/app/components/site-nav";
import { CaptionFeed } from "@/app/components/caption-feed";
import { BoardFilters } from "@/app/components/board-filters";
import { loadBoard, filterBoard, type BoardParams } from "@/lib/board";
export default async function CollectionPage({ searchParams }: { searchParams: Promise<BoardParams> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  const params = await searchParams;
  const mine = params.tab === "mine";
  const board = await loadBoard(mine ? "mine" : "saved");
  const captions = filterBoard(board, params);
  return <main className="page-shell">
    <SiteNav signedIn active="collection" />
    <header className="collection-heading"><p className="eyebrow">Your corner of the city</p><h1 className="section-title">My collection</h1><p className="intro">A home for your favorite takes and everything you&apos;ve created. Your saved list is only visible to you.</p></header>
    <nav className="collection-tabs" aria-label="Collection views"><Link href="/studio" aria-current={!mine ? "page" : undefined}>Saved takes</Link><Link href="/studio?tab=mine" aria-current={mine ? "page" : undefined}>My creations</Link></nav>
    <BoardFilters params={params} collection />
    {board.error ? <p className="form-error" role="alert">{board.error}</p> : captions.length ? <CaptionFeed captions={captions} board={board} /> : <section className="empty-feed"><h2>{board.captions.length ? "Nothing matches that search." : mine ? "Your next city moment belongs here." : "Good takes are worth keeping."}</h2><p>{board.captions.length ? "Try another search or clear your filters." : mine ? "Create your first caption with an AI illustration, then find it here anytime." : "Tap Save on any caption to start your collection. It will be here when you return."}</p><Link className="button primary-button" href={board.captions.length ? (mine ? "/studio?tab=mine" : "/studio") : mine ? "/create" : "/"}>{board.captions.length ? "Reset filters" : mine ? "Create a take" : "Explore the board"}</Link></section>}
  </main>;
}
