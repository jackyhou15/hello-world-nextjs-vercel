import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const authOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? origin;
  // PKCE cookies and the registered callback must belong to the same domain.
  if (origin !== authOrigin) {
    return NextResponse.redirect(new URL("/auth/sign-in", authOrigin));
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/?authError=oauth", origin));
  }

  return NextResponse.redirect(data.url);
}
