"use client";

import { useActionState } from "react";
import { createCaption } from "./actions";

const initialState = { error: null as string | null };

export function CaptionForm() {
  const [state, formAction, pending] = useActionState(createCaption, initialState);

  return (
    <form className="generator-form" action={formAction}>
      <label className="full-field">
        What happened?
        <textarea
          name="scene"
          minLength={10}
          maxLength={300}
          placeholder="Example: I carried a desk lamp onto the 1 train during rush hour."
          required
        />
        <span className="field-help">
          Describe one specific NYC moment. The exact generation prompt will be
          saved with the caption.
        </span>
      </label>

      <fieldset>
        <legend>Caption vibe</legend>
        <label className="style-option">
          <input name="style" type="radio" value="dry" defaultChecked />
          <span><strong>Dry</strong><small>Understated and observant</small></span>
        </label>
        <label className="style-option">
          <input name="style" type="radio" value="chaotic" />
          <span><strong>Chaotic</strong><small>Fast, online, slightly unhinged</small></span>
        </label>
        <label className="style-option">
          <input name="style" type="radio" value="wholesome" />
          <span><strong>Wholesome</strong><small>Warm without getting corny</small></span>
        </label>
      </fieldset>

      {state.error && <p className="form-error" role="alert">{state.error}</p>}

      <button className="button primary-button" type="submit" disabled={pending}>
        {pending ? "Generating…" : "Generate caption"}
      </button>
    </form>
  );
}
