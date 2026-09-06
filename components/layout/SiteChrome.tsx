"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import SplashScreen from "@/components/SplashScreen";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const SPLASH_MS = 3000;

/**
 * Client boundary for the site chrome.
 *
 * `children` arrives as an already-rendered React node from the Server
 * Component layout, so page content is present in the initial HTML. The splash
 * is layered *over* it and fades out; it must never gate `children`, or the
 * server-rendered markup disappears from the response and ISR has nothing to
 * cache.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Header />
      <div className="flex-1 flex flex-col">{children}</div>
      <Footer />
      <AnimatePresence>{showSplash && <SplashScreen />}</AnimatePresence>
    </>
  );
}
