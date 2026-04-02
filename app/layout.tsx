import type { Metadata } from "next";
import { SupabaseProvider } from "@/components/SupabaseProvider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Meridian Project",
  description: "Reopening the most credible cold cases in UAP history",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&family=Oswald:wght@400;500&family=Playfair+Display:ital,wght@1,400;1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
