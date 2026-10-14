import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sidewalk Takes",
  description: "Turn NYC moments into AI captions and illustrations. Vote for your favorites and save a personal collection.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
