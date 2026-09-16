import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hello World",
  description: "A simple Next.js Hello World app deployed on Vercel.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
