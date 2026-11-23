import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://urban-air-quality-assistant-xi.vercel.app"),
  title: {
    default: "Urban Air Quality Assistant",
    template: "%s · Urban Air Quality Assistant",
  },
  description:
    "A GenAI-style assistant that helps urban households navigate winter smog with air quality guidance, indoor air hacks, and sustainable alternatives.",
  keywords: [
    "air quality",
    "AQI",
    "PM2.5",
    "smog",
    "indoor air quality",
    "sustainability",
    "carbon footprint",
  ],
  authors: [{ name: "Abinivesh M" }],
  openGraph: {
    title: "Urban Air Quality Assistant",
    description:
      "Navigate winter smog with air quality guidance, indoor air hacks, and sustainable alternatives.",
    type: "website",
    locale: "en_GB",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#047857",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
