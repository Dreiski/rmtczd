"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import SplashScreen from "@/components/SplashScreen";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AppProvider } from "./AppContext";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && <SplashScreen />}
      </AnimatePresence>
      {!loading && (
        <>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </>
      )}
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProvider>
          <LayoutContent>{children}</LayoutContent>
        </AppProvider>
      </body>
    </html>
  );
}
