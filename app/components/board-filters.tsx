import type { BoardParams } from "@/lib/board";
export function BoardFilters({ params, collection = false }: { params: BoardParams; collection?: boolean }) {
  return <form className="board-filters" action={collection ? "/studio" : "/"}>
    {collection && <input type="hidden" name="tab" value={params.tab === "mine" ? "mine" : "saved"} />}
    <label className="search-field"><span className="sr-only">Search captions and moments</span><input type="search" name="q" placeholder="Search a caption or city moment…" defaultValue={params.q ?? ""} maxLength={100} /></label>
    <label><span className="sr-only">Filter by vibe</span><select name="vibe" defaultValue={params.vibe ?? "all"}><option value="all">All vibes</option><option value="dry">Dry</option><option value="chaotic">Chaotic</option><option value="wholesome">Wholesome</option></select></label>
    <label><span className="sr-only">Sort captions</span><select name="sort" defaultValue={params.sort ?? "new"}><option value="new">{collection && params.tab !== "mine" ? "Recently saved" : "Newest first"}</option><option value="top">Top rated</option></select></label>
    <button className="button secondary-button" type="submit">Find takes</button>
  </form>;
}
