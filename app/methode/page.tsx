import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CheckCircle, Database, Users, Bot, RefreshCw, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Méthodologie — Comment sont calculés les scores ? | MeilleurVille",
  description:
    "Transparence totale : découvrez comment MeilleurVille calcule ses scores de qualité de vie, classe les villes et protège l'intégrité des avis.",
};

const SCORE_SOURCES = [
  {
    key: "Qualité de vie",
    sources: ["Avis habitants (poids 60%)", "INSEE — données sociales", "Géorisques — risques naturels"],
    update: "Hebdomadaire",
  },
  {
    key: "Transport",
    sources: ["GTFS SNCF & RATP", "OpenStreetMap réseau vélo", "Avis transports habitants"],
    update: "Mensuelle",
  },
  {
    key: "Nature",
    sources: ["Copernicus Land Cover", "OpenStreetMap parcs/forêts", "Ensoleillement Open-Meteo"],
    update: "Annuelle",
  },
  {
    key: "Coût de vie",
    sources: ["Indices de loyer OLAP", "Données SeLoger (médiane)", "Avis budget habitants"],
    update: "Mensuelle",
  },
  {
    key: "Sécurité",
    sources: ["Statistiques délinquance SSMSI", "Avis sécurité habitants", "Red Flag Radar (pondéré)"],
    update: "Mensuelle",
  },
  {
    key: "Écoles",
    sources: ["Open Data Éducation Nationale", "Taux réussite Bac (académie)", "Avis familles"],
    update: "Annuelle",
  },
  {
    key: "Télétravail",
    sources: ["Arcep — couverture fibre/5G", "Inventaire coworking OSM", "Avis remote workers"],
    update: "Trimestrielle",
  },
];

const TRUST_STEPS = [
  { step: 1, title: "Soumission", desc: "L'avis est soumis et mis en file de modération." },
  { step: 2, title: "Détection automatique", desc: "Notre IA (Claude) vérifie les contenus abusifs, spam, faux avis et incohérences." },
  { step: 3, title: "Validation humaine", desc: "Les avis suspects sont examinés par un modérateur sous 24–48h." },
  { step: 4, title: "Publication", desc: "L'avis approuvé est publié. Le contributeur gagne des points de réputation." },
  { step: 5, title: "Votes communautaires", desc: "La communauté vote 'Utile / Non utile'. Les avis peu utiles voient leur poids réduit." },
  { step: 6, title: "Révision périodique", desc: "Les avis de plus de 3 ans sont demarchés pour vérification. Les signalés sont réexaminés." },
];

export default function MethodePage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Transparence</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Comment nous calculons les scores
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            MeilleurVille s'engage à une transparence totale sur ses sources, ses
            formules et ses limites. Aucune ville ne paie pour améliorer son
            classement.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 space-y-14">
        {/* Principles */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            Nos 4 principes
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Users, title: "Communauté d'abord", desc: "60–70% du score vient des avis vérifiés d'habitants réels. Les données statistiques enrichissent, elles ne supplantent pas." },
              { icon: Database, title: "Sources ouvertes", desc: "Toutes nos sources de données institutionnelles sont publiques (INSEE, Éducation Nationale, ARCEP). Zéro donnée achetée à des fournisseurs opaques." },
              { icon: Bot, title: "IA transparente", desc: "L'IA (Claude) est utilisée pour la modération, le résumé d'avis et le matching. Elle ne modifie jamais un score manuellement." },
              { icon: Shield, title: "Intégrité des scores", desc: "Aucune ville, aucun agent immobilier, aucun acteur institutionnel ne peut payer pour modifier un score. Les classements ne sont pas sponsorisés." },
            ].map(({ icon: Icon, title, desc }) => (
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

        {/* Score formula */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
            Formule de score global
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Chaque critère est noté de 1 à 10. Le score global est une moyenne
            pondérée, les poids variant selon le classement consulté (famille,
            télétravail, etc.).
          </p>
          <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
            <div className="bg-[var(--bg-elevated)] px-6 py-3 text-xs font-mono text-[var(--text-secondary)] border-b border-[var(--border)]">
              Formule — Score global standard
            </div>
            <div className="bg-[var(--bg-canvas)] px-6 py-4 font-mono text-sm text-[var(--text-primary)]">
              <p className="text-[var(--accent)]">score_global = Σ(score_critère × poids) / Σ(poids)</p>
              <p className="mt-2 text-[var(--text-secondary)] text-xs">
                avec poids_avis = 0.6, poids_données = 0.4 pour chaque critère<br />
                et score_avis = moyenne(avis_habitants_approuvés, pondéré par votes_utiles)
              </p>
            </div>
          </div>
        </section>

        {/* Sources table */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            Sources par critère
          </h2>
          <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-surface)] border-b border-[var(--border)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--text-secondary)]">Critère</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--text-secondary)]">Sources</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--text-secondary)]">Mise à jour</th>
                </tr>
              </thead>
              <tbody>
                {SCORE_SOURCES.map(({ key, sources, update }, i) => (
                  <tr key={key} className={`border-b border-[var(--border)] last:border-0 ${i % 2 === 0 ? "bg-[var(--bg-canvas)]" : "bg-[var(--bg-surface)]"}`}>
                    <td className="px-5 py-4 font-medium text-[var(--text-primary)] whitespace-nowrap">{key}</td>
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
                    <td className="px-5 py-4 text-right">
                      <Badge variant="subtle" className="text-xs">{update}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Trust pipeline */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
            Pipeline de confiance des avis
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Chaque avis passe par 6 étapes avant d'influencer un score.
          </p>
          <div className="relative space-y-4">
            {TRUST_STEPS.map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white text-sm font-bold z-10">
                  {step}
                </div>
                <div className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                  <div className="font-semibold text-[var(--text-primary)] mb-1">{title}</div>
                  <p className="text-sm text-[var(--text-secondary)]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Limitations */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Limites connues
          </h2>
          <Card>
            <ul className="space-y-3">
              {[
                "Les petites communes (< 5 000 hab.) ont peu d'avis : les scores sont moins fiables.",
                "Certaines données institutionnelles ont 1–2 ans de décalage (INSEE, Éducation Nationale).",
                "Le coût de l'immobilier est une médiane agrégée : les micro-quartiers varient fortement.",
                "Le score sécurité reflète la perception des habitants autant que les statistiques officielles.",
                "Les villes touristiques ont un biais : les avis de touristes sont filtrés mais pas toujours détectables.",
              ].map((limit) => (
                <li key={limit} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  {limit}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* Update cadence */}
        <section>
          <div className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-6">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="h-5 w-5 text-[var(--accent)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Cadence de mise à jour</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              {[
                { freq: "Temps réel", items: "Nouveaux avis, signalements Red Flag" },
                { freq: "Hebdomadaire", items: "Recalcul des scores agrégés, classements" },
                { freq: "Mensuel / Annuel", items: "Intégration nouvelles données institutionnelles" },
              ].map(({ freq, items }) => (
                <div key={freq} className="rounded-xl bg-[var(--bg-canvas)] border border-[var(--border)] p-3">
                  <div className="text-[var(--accent)] font-semibold mb-1">{freq}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{items}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
