"use client";
import { useState } from "react";
import { X, Star, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface ReviewModalProps {
  citySlug: string;
  cityName: string;
  onClose: () => void;
}

const SCORE_FIELDS: Array<{ key: string; label: string }> = [
  { key: "scoreGlobal", label: "Note globale" },
  { key: "scoreSafety", label: "Sécurité" },
  { key: "scoreTransport", label: "Transport" },
  { key: "scoreCost", label: "Rapport qualité/prix" },
  { key: "scoreNature", label: "Nature & Environnement" },
];

const LIFESTYLE_TAGS = [
  "famille",
  "remote_worker",
  "étudiant",
  "retraité",
  "locataire",
  "propriétaire",
  "nouveau_arrivant",
  "de_toujours",
];

function StarRating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            className={cn(
              "h-6 w-6 rounded text-xs font-bold font-mono-data transition-all cursor-pointer",
              n <= (hovered || value)
                ? value >= 8 || hovered >= 8
                  ? "bg-emerald-400 text-black"
                  : value >= 6 || hovered >= 6
                  ? "bg-yellow-400 text-black"
                  : "bg-red-400 text-black"
                : "bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReviewModal({ citySlug, cityName, onClose }: ReviewModalProps) {
  const [scores, setScores] = useState<Record<string, number>>({ scoreGlobal: 0 });
  const [body, setBody] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [livedHere, setLivedHere] = useState(true);
  const [durationMonths, setDurationMonths] = useState<number | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [step, setStep] = useState<"form" | "loading" | "success">("form");
  const [error, setError] = useState<string | null>(null);

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 5)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!scores.scoreGlobal) { setError("Veuillez donner une note globale."); return; }
    if (body.length < 50) { setError("Votre avis doit comporter au moins 50 caractères."); return; }
    setError(null);
    setStep("loading");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citySlug,
          ...scores,
          body,
          pros: pros || undefined,
          cons: cons || undefined,
          livedHere,
          durationMonths,
          lifestyleTags: tags,
        }),
      });
      if (res.ok) {
        setStep("success");
      } else {
        const d = await res.json();
        setError(d.error ?? "Erreur inconnue");
        setStep("form");
      }
    } catch {
      setError("Problème de connexion. Réessayez.");
      setStep("form");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div>
            <h2 className="font-bold text-[var(--text-primary)]">
              Écrire un avis sur {cityName}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Votre expérience aidera des milliers de personnes
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "success" ? (
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 border border-emerald-400/30">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              Merci pour votre avis !
            </h3>
            <p className="text-[var(--text-secondary)] max-w-sm">
              Votre contribution sera visible après modération (généralement sous
              24h). Vous gagnez des points vers le badge{" "}
              <span className="text-[var(--accent)]">Cartographe</span>.
            </p>
            <Button onClick={onClose}>Fermer</Button>
          </div>
        ) : step === "loading" ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16">
            <Loader2 className="h-8 w-8 text-[var(--accent)] animate-spin" />
            <p className="text-[var(--text-secondary)]">Envoi en cours...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* Scores */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Vos notes
              </h3>
              {SCORE_FIELDS.map(({ key, label }) => (
                <StarRating
                  key={key}
                  label={label}
                  value={scores[key] ?? 0}
                  onChange={(v) => setScores((prev) => ({ ...prev, [key]: v }))}
                />
              ))}
            </div>

            {/* Lived here toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLivedHere(!livedHere)}
                className={cn(
                  "relative h-6 w-10 rounded-full transition-colors",
                  livedHere ? "bg-[var(--accent)]" : "bg-[var(--bg-elevated)]"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 h-4 w-4 rounded-full bg-white transition-all",
                    livedHere ? "left-5" : "left-1"
                  )}
                />
              </button>
              <span className="text-sm text-[var(--text-secondary)]">
                J'ai habité / j'habite à {cityName}
              </span>
            </div>

            {livedHere && (
              <div>
                <label className="text-sm text-[var(--text-secondary)] block mb-2">
                  Durée de résidence (mois)
                </label>
                <input
                  type="number"
                  min={1}
                  max={600}
                  value={durationMonths ?? ""}
                  onChange={(e) => setDurationMonths(Number(e.target.value) || undefined)}
                  placeholder="ex. 24"
                  className="w-32 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/50 transition-colors"
                />
              </div>
            )}

            {/* Body */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-[var(--text-primary)]">
                  Votre avis *
                </label>
                <span className={cn("text-xs", body.length < 50 ? "text-[var(--text-secondary)]" : "text-emerald-400")}>
                  {body.length}/2000 (min. 50)
                </span>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="Partagez votre expérience : ambiance, voisinage, qualité de vie au quotidien..."
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[var(--accent)]/50 resize-none transition-colors"
              />
            </div>

            {/* Pros / Cons */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-emerald-400 font-medium block mb-1.5">
                  ✓ Points positifs
                </label>
                <input
                  type="text"
                  value={pros}
                  onChange={(e) => setPros(e.target.value)}
                  placeholder="Nature, transports..."
                  maxLength={300}
                  className="w-full rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:border-emerald-400/40 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-red-400 font-medium block mb-1.5">
                  ✗ Points négatifs
                </label>
                <input
                  type="text"
                  value={cons}
                  onChange={(e) => setCons(e.target.value)}
                  placeholder="Trafic, prix..."
                  maxLength={300}
                  className="w-full rounded-xl border border-red-400/20 bg-red-400/5 px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:border-red-400/40 transition-colors"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-semibold text-[var(--text-primary)] block mb-2">
                Votre profil (max 5)
              </label>
              <div className="flex flex-wrap gap-2">
                {LIFESTYLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
                      tags.includes(tag)
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                    )}
                  >
                    {tag.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-xl border border-red-400/30 bg-red-400/5 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}

            {/* Submit */}
            <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit">
                <Star className="h-4 w-4" />
                Publier mon avis
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
