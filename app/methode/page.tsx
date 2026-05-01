import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { CheckCircle, Database, Bot, Shield, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Méthodologie — Comment sont calculés les scores ? | MeilleurVille",
  description:
    "Transparence totale : sources, formules, biais et limites. Aucune ville ne paie pour son classement.",
};

const AXES = [
  { key: "Vie / Bien-être", weight: 0.18, sources: ["Palmarès L'Express + Le Figaro 2023-24", "Avis communauté"] },
  { key: "Sécurité", weight: 0.18, sources: ["SSMSI — atteintes aux personnes par 1 000 hab.", "Données ouvertes Min. Intérieur 2024"] },
  { key: "Coût de la vie", weight: 0.16, sources: ["Clameur — observatoire des loyers 2024", "SeLoger / Meilleurs Agents (€/m²)"] },
  { key: "Nature", weight: 0.12, sources: ["OpenStreetMap parcs/forêts", "Open-Meteo ensoleillement annuel"] },
  { key: "Transport", weight: 0.10, sources: ["GTFS SNCF + RATP", "OpenStreetMap réseau cyclable"] },
  { key: "Culture", weight: 0.10, sources: ["Open Data culture (musées, salles)", "Densité de patrimoine"] },
  { key: "Écoles", weight: 0.08, sources: ["Open Data Éducation Nationale", "Taux réussite Bac académie"] },
  { key: "Télétravail", weight: 0.08, sources: ["Arcep — couverture fibre", "Inventaire coworking OSM"] },
];

const PRINCIPLES = [
  {
    icon: Database,
    title: "Données ouvertes",
    desc: "100% des sources institutionnelles sont publiques et auditables : Insee, SSMSI (Ministère de l'Intérieur), Arcep, Éducation Nationale, OpenStreetMap. Aucune donnée achetée à un fournisseur opaque.",
  },
  {
    icon: Shield,
    title: "Aucun classement payant",
    desc: "Aucune ville, aucun agent immobilier, aucun acteur ne peut payer pour modifier un score. Pas de pub, pas de partenariats commerciaux affectant l'éditorial.",
  },
  {
    icon: Bot,
    title: "IA limitée et signalée",
    desc: "Claude (Anthropic) est utilisé uniquement pour générer le résumé éditorial des fiches villes. Il n'influence aucun score. Tous les contenus IA sont étiquetés.",
  },
  {
    icon: AlertTriangle,
    title: "Calibration humaine, pas magique",
    desc: "Les ~120 villes les plus connues ont des scores ajustés à la main contre les données de référence. Les autres reçoivent un ajustement statistique par département. Voir 'Limites' ci-dessous.",
  },
];

const LIMITS = [
  "Cette V1 publique fonctionne sur un dataset statique. Les classements ne sont pas (encore) recalculés automatiquement à chaque nouvelle donnée publiée.",
  "Les ~220 villes hors calibration manuelle reçoivent un ajustement par département (basé sur la moyenne SSMSI / Clameur). Elles peuvent dévier de la réalité hyper-locale d'un quartier.",
  "Le score sécurité reflète les atteintes aux personnes au niveau département puis ville ; il ne capture pas la perception subjective d'un quartier précis.",
  "Le coût de la vie utilise des médianes communales : les micro-quartiers varient fortement, surtout en grandes métropoles.",
  "Les avis postés en commentaire ne sont pas encore agrégés dans les scores. Ils servent de témoignages bruts pour la communauté.",
  "Modération des commentaires : automatique uniquement (rate-limit, honeypot, filtre liens / mots-clés). Pas encore de revue humaine.",
];

export default function MethodePage() {
  return (
    <main className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20 pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🔍 Transparence
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
            Comment on calcule{" "}
            <span className="font-display gradient-text-anim italic">les scores</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Aucune ville ne paie pour son classement. Voici exactement les sources,
            la formule, et les limites que vous devez connaître avant d&apos;utiliser nos chiffres.
          </p>
        </div>
      </section>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pb-16 space-y-14">
        {/* Principles */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Nos 4 principes</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map(({ icon: Icon, title, desc }) => (
              <Card key={title} hover glow>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                    <Icon className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Formula */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Formule du score global</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Chaque ville reçoit 8 notes de 1 à 10. Le score global est leur moyenne pondérée.
            Les classements thématiques (famille, télétravail…) re-pondèrent ces axes.
          </p>
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] glass">
            <div className="bg-[var(--bg-elevated)]/60 px-6 py-3 text-xs font-mono text-[var(--text-secondary)] border-b border-[var(--border)]">
              Formule — Score global standard
            </div>
            <div className="px-6 py-4 font-mono text-sm text-[var(--text-primary)]">
              <p className="text-[var(--accent)]">score_global = Σ(score_axe × poids_axe)</p>
              <pre className="mt-3 text-xs text-[var(--text-secondary)] leading-relaxed">{`vie         × 0.18
sécurité    × 0.18
coût        × 0.16
nature      × 0.12
transport   × 0.10
culture     × 0.10
écoles      × 0.08
télétravail × 0.08
                  ─────
                  1.00`}</pre>
            </div>
          </div>
        </section>

        {/* Two-stage calibration */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Calibration en deux étapes</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            On part d&apos;une grille de base, puis on ajuste pour coller à la réalité.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <div className="text-xs uppercase tracking-wider text-[var(--accent)] font-semibold mb-2">Étape 1</div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">~120 overrides manuels</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                Pour les villes les plus connues, on fixe à la main les valeurs de chaque axe
                en s&apos;appuyant sur les sources publiques : SSMSI pour la sécurité, Clameur
                pour les loyers, palmarès Figaro/L&apos;Express, etc.
              </p>
              <div className="text-xs text-[var(--text-tertiary)] font-mono-data">
                Exemple : Marseille safety 4.0 (SSMSI : 13/1000),<br />
                Paris cost 2.6 (loyer médian 32 €/m²),<br />
                Annecy nature 9.8 (lac + Alpes).
              </div>
            </Card>
            <Card>
              <div className="text-xs uppercase tracking-wider text-[var(--accent)] font-semibold mb-2">Étape 2</div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Heuristique départementale</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                Pour les autres villes, on applique un biais par département (basé sur la moyenne
                SSMSI départementale et Clameur), plus un léger ajustement par taille de population.
              </p>
              <div className="text-xs text-[var(--text-tertiary)] font-mono-data">
                Exemple : Bouches-du-Rhône −1.4 sécurité,<br />
                Cantal +0.9 sécurité, Paris −2.5 coût,<br />
                pop &gt; 400 k → −0.6 coût et −0.3 sécurité.
              </div>
            </Card>
          </div>
        </section>

        {/* Sources table */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Sources par axe</h2>
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] glass">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-elevated)]/60 border-b border-[var(--border)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--text-secondary)]">Axe</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--text-secondary)]">Poids</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--text-secondary)]">Sources</th>
                </tr>
              </thead>
              <tbody>
                {AXES.map(({ key, weight, sources }, i) => (
                  <tr
                    key={key}
                    className={`border-b border-[var(--border)]/60 last:border-0 ${
                      i % 2 === 0 ? "bg-white/40" : "bg-transparent"
                    }`}
                  >
                    <td className="px-5 py-4 font-medium text-[var(--text-primary)] whitespace-nowrap">{key}</td>
                    <td className="px-5 py-4 text-right font-mono-data text-[var(--accent)] font-bold">
                      {weight.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <ul className="space-y-0.5">
                        {sources.map((s) => (
                          <li key={s} className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                            <CheckCircle className="h-3 w-3 flex-shrink-0 text-emerald-600" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Limits — explicit */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Limites connues</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            On préfère vous les dire clairement plutôt que vous les laisser découvrir.
          </p>
          <Card>
            <ul className="space-y-3">
              {LIMITS.map((limit) => (
                <li key={limit} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <span>{limit}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* CTA */}
        <section>
          <div className="rounded-2xl border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent-soft)] to-white p-6">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">
              Vous avez repéré un score qui colle pas ?
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              On corrige rapidement. Écrivez-nous via le formulaire de contact en précisant
              la ville, l&apos;axe concerné et la source qui contredit notre note.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] text-white px-5 py-2.5 text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              Signaler une erreur →
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
