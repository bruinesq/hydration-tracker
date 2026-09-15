import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HydrationTracker",
  description: "Track daily fluid intake for your household - drinks and food, converted to fluid oz.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gradient-to-b from-sky-50 via-white to-white text-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
