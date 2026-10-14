"use client";
import { useActionState, useState } from "react";
import { rateCaption } from "@/app/votes/actions";
import { saveCaption, type MutationState } from "@/app/saved/actions";
import { signInWithGoogle } from "@/app/actions";
const initialState: MutationState = { error: null, message: null };
export function CaptionControls({ id, caption, signedIn, vote, saved, upvotes, downvotes }: {
  id: string; caption: string; signedIn: boolean; vote?: number; saved: boolean; upvotes: number; downvotes: number;
}) {
  const [voteState, voteAction, voting] = useActionState(rateCaption, initialState);
  const [saveState, saveAction, saving] = useActionState(saveCaption, initialState);
  const [copyStatus, setCopyStatus] = useState("");
  async function copyCaption() {
    try { await navigator.clipboard.writeText(caption); setCopyStatus("Caption copied."); }
    catch { setCopyStatus("Could not copy. Select the caption text to copy it."); }
  }
  return <>
    <div className="caption-actions">
      {signedIn ? <>
        <form action={voteAction} className="vote-controls" aria-label="Rate this caption">
          <input type="hidden" name="generationId" value={id} />
          <button name="value" value={vote === 1 ? "0" : "1"} className={`vote-button ${vote === 1 ? "active" : ""}`} disabled={voting} aria-label="Upvote caption" aria-pressed={vote === 1}>↑ <span>{upvotes}</span></button>
          <button name="value" value={vote === -1 ? "0" : "-1"} className={`vote-button ${vote === -1 ? "active down" : ""}`} disabled={voting} aria-label="Downvote caption" aria-pressed={vote === -1}>↓ <span>{downvotes}</span></button>
        </form>
        <form action={saveAction}>
          <input type="hidden" name="generationId" value={id} />
          <input type="hidden" name="save" value={saved ? "false" : "true"} />
          <button className={`button save-button ${saved ? "saved" : ""}`} disabled={saving} aria-pressed={saved} type="submit">{saving ? "Saving…" : saved ? "✓ Saved" : "+ Save"}</button>
        </form>
      </> : <form action={signInWithGoogle}><button className="button secondary-button" type="submit">Sign in to vote & save</button></form>}
      <button className="button quiet-button copy-button" type="button" onClick={copyCaption}>Copy caption</button>
    </div>
    <p className={`action-status ${voteState.error || saveState.error ? "error-text" : ""}`} role={voteState.error || saveState.error ? "alert" : "status"} aria-live="polite">{voteState.error || saveState.error || copyStatus || saveState.message || voteState.message}</p>
  </>;
}
