import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Idea Cabinet",
  description:
    "A Next.js list and private profile powered by Supabase authentication.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
