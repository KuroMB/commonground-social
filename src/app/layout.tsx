import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SupportWidget from "@/components/SupportWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CommonGround Social",
  description: "Share tools, space, and skills with your neighbors. No ads, no algorithm, no noise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        {children}
        <footer className="mt-auto border-t border-stone-200 px-6 py-4">
          <div className="max-w-2xl mx-auto flex flex-wrap gap-x-6 gap-y-1 text-xs text-stone-400">
            <a href="/about" className="hover:text-stone-600 transition-colors">About</a>
            <a href="/docs/philosophy" className="hover:text-stone-600 transition-colors">Philosophy</a>
            <a href="https://github.com/KuroMB/commonground-social" className="hover:text-stone-600 transition-colors" target="_blank" rel="noopener noreferrer">Source (AGPL)</a>
          </div>
        </footer>
        <SupportWidget />
      </body>
    </html>
  );
}
