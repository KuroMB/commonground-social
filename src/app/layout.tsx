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
  other: {
    "viewport": "width=device-width, initial-scale=1, viewport-fit=cover",
  },
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
        <SupportWidget />
      </body>
    </html>
  );
}
