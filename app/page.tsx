import Link from "next/link";
import { SiteNav } from "./components/site-nav";
import { CaptionFeed } from "./components/caption-feed";
import { BoardFilters } from "./components/board-filters";
import { loadBoard, filterBoard, type BoardParams } from "@/lib/board";
export default async function Home({ searchParams }: { searchParams: Promise<BoardParams> }) {
  const [board, params] = await Promise.all([loadBoard(), searchParams]);
  const captions = filterBoard(board, params);
  return <main className="page-shell">
    <SiteNav signedIn={board.signedIn} active="board" />
    <section className="rating-hero" aria-labelledby="page-title">
      <div><p className="eyebrow">Little city moments. Big main character energy.</p><h1 id="page-title">Your city.<br />Your kind of <em>take.</em></h1><p className="intro">Turn your NYC moments into AI captions and illustrations. Vote for the ones that land. Save the ones you want to come back to.</p><Link className="button primary-button hero-cta" href={board.signedIn ? "/create" : "/auth/sign-in"}>Make a take <span aria-hidden="true">↗</span></Link><span className="hero-footnote">Three vibes. One city. Your judgment.</span></div>
      <aside className="city-ticket"><span className="ticket-kicker">Your next take starts here</span><div className="ticket-station">NYC</div><p>That delayed train.<br />That tiny apartment.<br />That surprisingly good dollar slice.</p><span className="ticket-rule" /><span className="ticket-bottom">Notice it. Caption it. Keep it.</span></aside>
    </section>
    <section className="feed-section" aria-labelledby="feed-title">
      <div className="feed-heading"><div><p className="eyebrow">The city, through your feed</p><h2 id="feed-title">The take board</h2></div><span className="status">{captions.length} {captions.length === 1 ? "take" : "takes"}</span></div>
      <BoardFilters params={params} />
      {!board.signedIn && <p className="board-note">Everyone can explore. Sign in to create, vote, and keep a personal collection.</p>}
      {board.error ? <p className="form-error" role="alert">{board.error}</p> : captions.length ? <CaptionFeed captions={captions} board={board} /> : <section className="empty-feed"><h3>{board.captions.length ? "No takes match yet." : "The first take is yours."}</h3><p>{board.captions.length ? "Try another search or explore all vibes." : "Describe one little NYC moment and let AI find the angle."}</p><Link className="button secondary-button" href={board.captions.length ? "/" : "/create"}>{board.captions.length ? "Reset filters" : "Create a take"}</Link></section>}
    </section>
    <footer><span>Sidewalk Takes</span><span>A little perspective on a very big city.</span></footer>
  </main>;
}
