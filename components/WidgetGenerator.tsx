"use client";

// F10 — Widget generator UI. Picks city + format, displays live preview iframe
// and copy-pastable snippet for the third-party site.

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";

type CityLite = { slug: string; name: string; region: string };
type Format = "badge" | "criteres" | "compare";

const FORMATS: Array<{ id: Format; label: string; desc: string; w: number; h: number }> = [
  { id: "badge", label: "🏅 Badge score", desc: "Le score global de la ville en grand, lisible en 1 s.", w: 320, h: 160 },
  { id: "criteres", label: "📊 Top 3 critères", desc: "Les 3 axes les plus forts de la ville (avec barres).", w: 340, h: 240 },
  { id: "compare", label: "⚔️ Comparatif 2 villes", desc: "Score global côte à côte (utile pour annonces immo).", w: 360, h: 200 },
];

const ORIGIN =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";

export function WidgetGenerator({ cities }: { cities: CityLite[] }) {
  const [format, setFormat] = useState<Format>("badge");
  const [city, setCity] = useState<string>("annecy");
  const [city2, setCity2] = useState<string>("lyon");
  const [copied, setCopied] = useState(false);

  const formatMeta = FORMATS.find((f) => f.id === format)!;

  const embedUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("format", format);
    params.set("city", city);
    if (format === "compare") params.set("city2", city2);
    return `${ORIGIN}/widget/embed?${params.toString()}`;
  }, [format, city, city2]);

  const snippet = useMemo(() => {
    return `<iframe src="${embedUrl}" width="${formatMeta.w}" height="${formatMeta.h}" loading="lazy" frameborder="0" style="border:0;max-width:100%" title="MeilleurVille — ${city}"></iframe>`;
  }, [embedUrl, formatMeta, city]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // no-op
    }
  };

  return (
    <div className="space-y-6">
      {/* Format picker */}
      <Card>
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">1. Choisissez le format</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {FORMATS.map((f) => {
            const selected = format === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFormat(f.id)}
                className={`text-left rounded-xl border p-3 transition-colors ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border)] hover:border-[var(--accent)]/40"
                }`}
                aria-pressed={selected}
              >
                <p className="text-sm font-semibold text-[var(--text-primary)]">{f.label}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{f.desc}</p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-1 font-mono-data">
                  {f.w} × {f.h} px
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* City picker */}
      <Card>
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">2. Choisissez la ville</p>
        <label className="block text-xs text-[var(--text-secondary)] mb-1">
          Ville {format === "compare" ? "1" : ""}
        </label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
        >
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name} — {c.region}
            </option>
          ))}
        </select>
        {format === "compare" && (
          <>
            <label className="block text-xs text-[var(--text-secondary)] mt-3 mb-1">
              Ville 2
            </label>
            <select
              value={city2}
              onChange={(e) => setCity2(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              {cities.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name} — {c.region}
                </option>
              ))}
            </select>
          </>
        )}
      </Card>

      {/* Preview */}
      <Card>
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">3. Aperçu</p>
        <div className="rounded-xl bg-[var(--bg-canvas)] p-4 flex justify-center">
          <iframe
            src={embedUrl}
            width={formatMeta.w}
            height={formatMeta.h}
            loading="lazy"
            frameBorder={0}
            style={{ border: 0, maxWidth: "100%" }}
            title="Aperçu du widget"
          />
        </div>
      </Card>

      {/* Snippet */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[var(--text-primary)]">4. Code à intégrer</p>
          <button
            type="button"
            onClick={copy}
            className="rounded-full bg-[var(--accent)] text-white px-4 py-1.5 text-sm font-semibold shadow-sm hover:opacity-90"
          >
            {copied ? "✓ Copié" : "📋 Copier"}
          </button>
        </div>
        <pre className="overflow-x-auto rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] p-3 text-xs font-mono-data text-[var(--text-primary)]">
          <code>{snippet}</code>
        </pre>
        <p className="text-[11px] text-[var(--text-tertiary)] mt-2">
          Copiez ce snippet dans l&apos;HTML de votre page. L&apos;iframe pèse moins de 10 KB et
          ne fait aucun appel tiers (pas de cookies, pas de tracking).
        </p>
      </Card>
    </div>
  );
}
