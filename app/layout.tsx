import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Things That Spark Ideas",
  description: "A Next.js list powered by Supabase and deployed on Vercel.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
