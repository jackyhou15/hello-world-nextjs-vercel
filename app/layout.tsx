import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sidewalk Takes",
  description: "AI-generated NYC captions rated by the crowd.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
