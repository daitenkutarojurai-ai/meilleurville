"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3.5 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-all"
    >
      <LogOut className="h-4 w-4" />
      Se déconnecter
    </button>
  );
}
