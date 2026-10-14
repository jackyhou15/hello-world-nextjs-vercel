"use client";
import { useActionState, useState } from "react";
import { createCaption } from "./actions";
import { captionStyles, type CaptionStyle } from "@/lib/caption-styles";
const starters = [
  "I carried a giant houseplant onto the 1 train during rush hour.",
  "A pigeon walked into the bodega like it was picking up its usual order.",
  "My apartment window looks directly into my neighbor's kitchen, so now we share a dinner schedule.",
];
export function CaptionForm() {
  const [state, formAction, pending] = useActionState(createCaption, { error: null as string | null });
  const [scene, setScene] = useState("");
  const [vibe, setVibe] = useState<CaptionStyle>("dry");
  const [withImage, setWithImage] = useState(true);
  return <form className="generator-form" action={formAction}>
    <div className="form-step"><span>01</span><h2>Tell us the moment</h2></div>
    <label className="full-field">What happened?<textarea name="scene" minLength={10} maxLength={300} placeholder="One specific NYC moment. The stranger, the subway, the dollar slice…" value={scene} onChange={(event) => setScene(event.target.value)} disabled={pending} required /><span className="field-help">Specific details make better takes. <span className="character-count">{scene.length}/300</span></span></label>
    <div className="starter-list"><span>Need a starting point?</span>{starters.map((starter, i) => <button className="starter-button" type="button" key={starter} disabled={pending} onClick={() => setScene(starter)}>{["The subway plant", "The bodega pigeon", "The tiny apartment"][i]} ↗</button>)}</div>
    <div className="form-step"><span>02</span><h2>Set the caption vibe</h2></div>
    <p className="field-explanation">Vibe changes how the caption sounds. Same city moment, three different perspectives.</p>
    <fieldset disabled={pending}><legend className="sr-only">Caption vibe</legend>{(Object.keys(captionStyles) as CaptionStyle[]).map((style) => <label className={`style-option ${vibe === style ? "selected" : ""}`} key={style}><input name="style" type="radio" value={style} checked={vibe === style} onChange={() => setVibe(style)} /><span><strong>{captionStyles[style].label}</strong><small>{captionStyles[style].description}</small></span></label>)}</fieldset>
    <aside className={`vibe-preview ${vibe}`} aria-live="polite"><span>Example · waiting for a delayed 1 train</span><blockquote>{captionStyles[vibe].example}</blockquote><p>Illustrative example. Your caption will be generated from your own scene.</p></aside>
    <div className="form-step"><span>03</span><h2>Give it a picture</h2></div>
    <label className="image-option"><input type="checkbox" name="withImage" checked={withImage} onChange={(event) => setWithImage(event.target.checked)} disabled={pending} /><span><strong>Add an AI illustration</strong><small>Gemini draws an original scene to go with your caption. Turn off for text only.</small></span></label>
    <p className="publish-note">Your take and AI prompts will appear on the public board. Your saved collection stays private.</p>
    {state.error && <p className="form-error" role="alert">{state.error}</p>}
    <button className="button primary-button generate-button" type="submit" disabled={pending}>{pending ? "Making your take…" : withImage ? "Generate caption + illustration ↗" : "Generate caption ↗"}</button>
    {pending && <p className="field-help" role="status">Finding the words{withImage ? " and drawing the scene" : ""}. This can take up to 45 seconds.</p>}
  </form>;
}
