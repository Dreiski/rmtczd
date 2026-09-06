import type { Metadata } from "next";
import { Geist, Geist_Mono, EB_Garamond } from "next/font/google";
import { AppProvider } from "./AppContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Previously pulled at runtime by an @import inside an inline <style> tag in
// the Header. Self-hosting it here removes a render-blocking request to
// fonts.googleapis.com and lets the whole site use `font-serif`.
const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Romanticized",
    template: "%s — Romanticized",
  },
  description: "Photography and video work by Romuald Samson.",
};

// Deliberately thin: only the document shell and the theme provider. Chrome
// belongs to the route groups, since the public site and the admin need
// different ones.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
