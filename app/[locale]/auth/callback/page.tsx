import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CallbackClient } from "@/app/auth/callback/CallbackClient";

export const metadata: Metadata = {
  title: "Signing you in… · BestCitiesInFrance",
  robots: { index: false, follow: false },
};

export default function AuthCallbackPage() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />
      <section className="relative pt-28 pb-28">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <CallbackClient />
        </div>
      </section>
      <Footer />
    </main>
  );
}
