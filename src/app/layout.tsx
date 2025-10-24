import type React from "react";
import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"; // updated import
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] }); // replaces sans/GeistSans
const robotoMono = Roboto_Mono({ subsets: ["latin"] }); // replaces mono

export const metadata: Metadata = {
  title: "NexBazaar",
  description: "Your Next Stop Shop",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className={robotoMono.className}>
        <Suspense fallback={null}>
          {children}
          <SpeedInsights />
          <Toaster />
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
