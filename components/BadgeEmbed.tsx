"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface Props {
  html: string;
  preview: string;
  label: string;
}

/**
 * Renders the badge preview (rendered SVG, inlined via dangerouslySetInnerHTML),
 * and a "copier le code d'intégration" button. Client-only because it needs the
 * clipboard API and the copy feedback state.
 */
export function BadgeEmbed({ html, preview, label }: Props) {
  const [copied, setCopied] = useState<"html" | "svg" | null>(null);

  const copy = async (kind: "html" | "svg", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      // Fallback: select the pre so the user can Ctrl+C
      const pre = document.getElementById(`badge-${kind}-code`);
      if (pre) {
        const range = document.createRange();
        range.selectNode(pre);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] p-6">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)] mb-3">
          Aperçu — {label}
        </div>
        <div className="flex justify-center" dangerouslySetInnerHTML={{ __html: preview }} />
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
            Code HTML à coller
          </div>
          <button
            type="button"
            onClick={() => copy("html", html)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors px-3 py-1 text-xs font-semibold"
          >
            {copied === "html" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied === "html" ? "Copié" : "Copier"}
          </button>
        </div>
        <pre
          id="badge-html-code"
          className="text-[11px] leading-relaxed text-[var(--text-secondary)] p-4 whitespace-pre-wrap break-all overflow-x-auto max-h-56"
        >
          {html}
        </pre>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
            SVG seul (si vous préférez héberger l&apos;image)
          </div>
          <button
            type="button"
            onClick={() => copy("svg", preview)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-canvas)] transition-colors px-3 py-1 text-xs font-semibold"
          >
            {copied === "svg" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied === "svg" ? "Copié" : "Copier"}
          </button>
        </div>
        <pre
          id="badge-svg-code"
          className="text-[11px] leading-relaxed text-[var(--text-secondary)] p-4 whitespace-pre-wrap break-all overflow-x-auto max-h-56"
        >
          {preview}
        </pre>
      </div>
    </div>
  );
}
