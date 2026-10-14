import Link from "next/link";
import { signInWithGoogle, signOut } from "@/app/actions";
export function SiteNav({ signedIn, active }: { signedIn: boolean; active?: string }) {
  return <nav className="top-nav" aria-label="Primary navigation">
    <Link className="wordmark text-link" href="/">Sidewalk Takes<span className="brand-dot">.</span></Link>
    <div className="nav-actions">
      <Link className="text-link" aria-current={active === "board" ? "page" : undefined} href="/">Explore</Link>
      {signedIn ? <>
        <Link className="text-link" aria-current={active === "collection" ? "page" : undefined} href="/studio">My collection</Link>
        <Link className="text-link" aria-current={active === "profile" ? "page" : undefined} href="/profile">Profile</Link>
        <Link className="button primary-button" aria-current={active === "create" ? "page" : undefined} href="/create">+ Create</Link>
        <form action={signOut}><button className="button quiet-button" type="submit">Sign out</button></form>
      </> : <form action={signInWithGoogle}><button className="button primary-button" type="submit">Sign in with Google</button></form>}
    </div>
  </nav>;
}
