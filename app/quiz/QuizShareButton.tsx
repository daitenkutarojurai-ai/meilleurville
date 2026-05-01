"use client";
import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { MatchResult } from "@/lib/types";

export function QuizShareButton({ results }: { results: MatchResult[] }) {
  const [copied, setCopied] = useState(false);

  const top = results[0];
  const shareText = `Mon match IA MeilleurVille : ${top?.city.name} (${Math.round(top?.score ?? 0)}% compatible) 🗺️\nTrouvez votre ville idéale →`;
  const shareUrl = typeof window !== "undefined" ? window.location.origin + "/quiz" : "https://meilleurville.fr/quiz";

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareOnTwitter() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener");
  }

  return (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      <Button variant="secondary" size="sm" onClick={copyLink} className="gap-2">
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
        {copied ? "Lien copié !" : "Partager mon résultat"}
      </Button>
      <Button variant="secondary" size="sm" onClick={shareOnTwitter} className="gap-2">
        <span className="text-sky-400 font-bold text-xs">𝕏</span>
        Partager sur X
      </Button>
    </div>
  );
}
