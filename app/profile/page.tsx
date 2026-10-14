/* eslint-disable @next/next/no-img-element */
import { redirect } from "next/navigation";
import { SiteNav } from "@/app/components/site-nav";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name,last_name,avatar_path")
    .eq("id", user.id)
    .maybeSingle();

  let avatarUrl: string | null = null;
  if (profile?.avatar_path) {
    const { data } = await supabase.storage
      .from("avatars")
      .createSignedUrl(profile.avatar_path, 60 * 60);
    avatarUrl = data?.signedUrl ?? null;
  }

  const needsName = !profile?.first_name || !profile?.last_name;

  return (
    <main className="page-shell compact-shell">
      <SiteNav signedIn active="profile" />

      <section className="profile-panel" aria-labelledby="profile-title">
        <div className="profile-heading">
          {avatarUrl ? (
            <img className="avatar" src={avatarUrl} alt="Profile photo" />
          ) : (
            <div className="avatar avatar-placeholder" aria-hidden="true">
              {(profile?.first_name?.[0] ?? user.email?.[0] ?? "U").toUpperCase()}
            </div>
          )}
          <div>
            <p className="eyebrow">Profile</p>
            <h1 className="section-title" id="profile-title">
              Make it yours
            </h1>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>

        {needsName && (
          <div className="prompt" role="status">
            Welcome! Add your first and last name to finish setting up your
            profile.
          </div>
        )}

        <ProfileForm firstName={profile?.first_name ?? ""} lastName={profile?.last_name ?? ""} />
      </section>
    </main>
  );
}
