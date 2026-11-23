import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Urban Air Quality Assistant",
  description: "GenAI-powered assistant helping families navigate urban air pollution with low-emission routines, indoor air quality hacks, and sustainable alternatives.",
  keywords: ["air quality", "pollution", "sustainability", "GenAI", "health", "environment"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-green-600 focus:text-white focus:px-4 focus:py-2 focus:rounded">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}