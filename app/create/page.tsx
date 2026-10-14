import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteNav } from "@/app/components/site-nav";
import { CaptionForm } from "./caption-form";
export const maxDuration = 60;
export default async function CreatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  return <main className="page-shell">
    <SiteNav signedIn active="create" />
    <section className="generator-panel" aria-labelledby="generator-title"><p className="eyebrow">The city gives you material</p><h1 className="section-title" id="generator-title">Find your angle.</h1><p className="intro">One scene. Your vibe. A caption and an illustration worth keeping.</p><CaptionForm /></section>
  </main>;
}
