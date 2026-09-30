import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const origin = request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(origin);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(origin);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(origin);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name,last_name")
    .eq("id", user.id)
    .maybeSingle();

  const destination =
    profile?.first_name && profile?.last_name ? "/studio" : "/profile";

  return NextResponse.redirect(new URL(destination, origin));
}
