"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { prepareAvatarUpload, updateProfile } from "./actions";
import { avatarFileError } from "@/lib/profile-upload";

export function ProfileForm({ firstName, lastName }: { firstName: string; lastName: string }) {
  const router = useRouter();
  const [first, setFirst] = useState(firstName);
  const [last, setLast] = useState(lastName);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarPath, setAvatarPath] = useState("");
  const [preview, setPreview] = useState("");
  const [hasSelectedPhoto, setHasSelectedPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const pending = uploading || saving;
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function clearPhoto() {
    setAvatarPath(""); setPreview(""); setHasSelectedPhoto(false); setMessage(null); setError(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setHasSelectedPhoto(!!file);
    setError(null); setMessage(null); setAvatarPath(""); setPreview("");
    if (!file) return;
    const validationError = avatarFileError(file.type, file.size);
    if (validationError) { setError(validationError); return; }
    setUploading(true);
    try {
      const upload = await prepareAvatarUpload(file.type, file.size);
      if (upload.error !== null) { setError(upload.error); return; }
      const body = new FormData(); body.append("cacheControl", "3600"); body.append("", file);
      // Send image bytes straight to Storage. Vercel receives metadata only.
      const response = await fetch(upload.signedUrl, { method: "PUT", body });
      if (!response.ok) { setError("Your photo couldn't upload. Check your connection and choose the photo again."); return; }
      setPreview(URL.createObjectURL(file));
      setAvatarPath(upload.path);
      setMessage("Photo uploaded privately. Click Save profile to apply it.");
    } catch { setError("Your photo couldn't upload. Check your connection and choose the photo again."); }
    finally { setUploading(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (fileInput.current?.files?.length && !avatarPath) {
      setError("Choose a supported photo and wait for the upload to finish, or cancel the photo selection."); return;
    }
    setSaving(true); setError(null); setMessage(null);
    try {
      const data = new FormData(); data.set("firstName", first); data.set("lastName", last);
      if (avatarPath) data.set("avatarPath", avatarPath);
      const result = await updateProfile(data);
      if (result.error) { setError(result.error); return; }
      setAvatarPath(""); setPreview(""); setHasSelectedPhoto(false);
      if (fileInput.current) fileInput.current.value = "";
      setMessage(result.message); router.refresh();
    } catch { setError("Your profile couldn't be saved. Check your connection and try again."); }
    finally { setSaving(false); }
  }

  return <form className="profile-form" onSubmit={save}>
    <label>First name<input name="firstName" value={first} onChange={event => setFirst(event.target.value)} autoComplete="given-name" maxLength={100} required disabled={pending} /></label>
    <label>Last name<input name="lastName" value={last} onChange={event => setLast(event.target.value)} autoComplete="family-name" maxLength={100} required disabled={pending} /></label>
    <label className="full-field">Profile photo<input ref={fileInput} name="avatar" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={choosePhoto} disabled={pending} /><span className="field-help">JPG, PNG, WebP, or GIF up to 5 MB. Selecting a photo uploads it privately; Save profile applies it.</span></label>
    {preview && <div className="photo-preview full-field"><img className="avatar" src={preview} alt="Selected photo preview" /><span>Ready to save as your profile photo.</span></div>}
    {hasSelectedPhoto && !pending && <button className="button secondary-button" type="button" onClick={clearPhoto}>Cancel photo selection</button>}
    {error && <p className="form-error full-field" role="alert">{error}</p>}
    {message && <p className="action-status full-field" role="status">{message}</p>}
    {uploading && <p className="field-help full-field" role="status">Uploading photo… Keep this page open.</p>}
    <button className="button primary-button" type="submit" disabled={pending}>{uploading ? "Uploading photo…" : saving ? "Saving…" : "Save profile"}</button>
  </form>;
}
