import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

// Fully static. proxy.ts already bounces an already-signed-in visitor to /admin,
// so there is no session read here — which keeps the page out of the dynamic
// path entirely.
export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <h1 className="text-3xl font-light tracking-wide">Sign in</h1>
      <LoginForm />
    </main>
  );
}
