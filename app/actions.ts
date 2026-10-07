"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");

  if (!host) {
    throw new Error("Unable to determine the application URL.");
  }

  const requestOrigin = `${protocol}://${host}`;
  const callbackOrigin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? requestOrigin;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${callbackOrigin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    throw new Error(error?.message ?? "Unable to start Google sign-in.");
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
