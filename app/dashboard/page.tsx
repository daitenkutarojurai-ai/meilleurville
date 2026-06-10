import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { RedirectToAccount } from "./RedirectToAccount";

// /dashboard is the legacy account URL. The real account home is /mes-villes;
// keep this path working with a client-side redirect (static export can't 301).
export const metadata: Metadata = {
  title: "Mon espace",
  alternates: { canonical: "/mes-villes" },
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />
      <RedirectToAccount />
      <Footer />
    </main>
  );
}
