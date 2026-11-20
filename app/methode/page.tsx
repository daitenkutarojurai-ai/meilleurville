import { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { CheckCircle, Database, Bot, Shield, AlertTriangle } from "lucide-react";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { StaticPageCrossLink } from "@/components/StaticPageCrossLink";
import { pathAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Méthodologie · Comment sont calculés les scores ?",
  description:
    "Transparence totale : sources, formules, biais et limites. Aucune ville ne paie pour son classement.",
  alternates: pathAlternates("/methode", "/methodology"),
};

const methodeBreadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Méthodologie", path: "/methode" },
]);

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

// F3 — Profils propriétaires : 10 scores additionnels par ville, exposés sur
// chaque fiche /villes/[slug]. v0 = dérivé du seed actuel. Le tag par score
// (Proxy v0 / Estimation régionale / Source réelle) reflète l'état réel de
// la donnée.
const OWNER_SCORES = [
  { key: "score_canicule", label: "Résistance canicule", source: "Météo-France (avg juillet 1991-2020, à compléter par ARPEGE 2040)" },
  { key: "score_solitude", label: "Lien social", source: "Insee — % ménages 1 personne par département (2020)" },
  { key: "score_bruit", label: "Calme sonore", source: "Proxy population + densité IDF (à enrichir Bruitparif + CBS Cerema)" },
  { key: "score_securite_nocturne", label: "Sécurité nocturne", source: "Dérivé SSMSI (atteintes aux personnes)" },
  { key: "score_sans_voiture", label: "Vie sans voiture", source: "GTFS multimodal + OpenStreetMap réseau cyclable" },
  { key: "score_teletravail", label: "Télétravail", source: "ARCEP — couverture FTTH (T4 2024 estimé)" },
  { key: "score_qualite_air", label: "Qualité air", source: "ATMO France — PM2.5 moyen annuel 2023" },
  { key: "score_securite_femme_seule", label: "Sécurité femme seule", source: "SSMSI (pondéré sécurité + densité transport)" },
  { key: "score_jeune_actif", label: "Jeune actif", source: "Composite culture + remote-work + coût + bonus métropole" },
  { key: "score_famille", label: "Famille", source: "Composite écoles + sécurité + nature, pénalité coût élevé" },
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
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(methodeBreadcrumb)} />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-aurora pt-20 pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <div className="flex justify-center mb-4">
            <EmojiBadge emoji="🔍" tone="indigo" size="lg" className="shadow-[0_12px_28px_-12px_rgba(79,70,229,0.55)]" />
          </div>
          <p className="text-xs uppercase tracking-widest text-[#4338CA] font-semibold mb-2">
            Transparence
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
            Comment on calcule{" "}
            <span className="font-display gradient-text italic">les scores</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Aucune ville ne paie pour son classement. Voici exactement les sources,
            la formule, et les limites que vous devez connaître avant d&apos;utiliser nos chiffres.
            Le résultat de ce calcul se lit ailleurs :{" "}
            <Link href="/avis" className="font-medium text-[#4338CA] underline underline-offset-2 hover:text-[#BE185D]">
              la note publiée de chaque ville et les avis de ses habitants
            </Link>
            .
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-3 py-1.5 text-[#3730A3] ring-1 ring-[#C7D2FE]"><span aria-hidden>📏</span>8 axes notés sur 10</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF2F8] px-3 py-1.5 text-[#9D174D] ring-1 ring-[#FBCFE8]"><span aria-hidden>🗂️</span>Sources publiques</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFEFF] px-3 py-1.5 text-[#155E75] ring-1 ring-[#A5F3FC]"><span aria-hidden>🚫</span>Aucun classement payant</span>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="band band-indigo py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <EmojiBadge emoji="🧭" tone="indigo" size="sm" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Nos 4 principes</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="rounded-2xl bg-white p-5 shadow-[0_12px_28px_-20px_rgba(79,70,229,0.6)] ring-1 ring-[#C7D2FE] transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${["grad-head-0", "grad-head-5", "grad-head-4", "grad-head-1"][i % 4]}`}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formula */}
      <section className="band band-sky py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <EmojiBadge emoji="🧮" tone="sky" size="sm" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Formule du score global</h2>
          </div>
          <p className="text-[var(--text-secondary)] mb-6">
            Chaque ville reçoit 8 notes de 1 à 10. Le score global est leur moyenne pondérée.
            Les classements thématiques (famille, télétravail…) re-pondèrent ces axes.
          </p>
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.55)] ring-1 ring-[#BFDBFE]">
            <div className="grad-head-0 px-6 py-3 text-xs font-mono font-semibold">
              Formule — Score global standard
            </div>
            <div className="px-6 py-4 font-mono text-sm text-[var(--text-primary)] overflow-x-auto">
              <p className="font-semibold text-[#4338CA]">score_global = Σ(score_axe × poids_axe)</p>
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
        </div>
      </section>

      {/* Two-stage calibration */}
      <section className="band band-pink py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <EmojiBadge emoji="🎚️" tone="pink" size="sm" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Calibration en deux étapes</h2>
          </div>
          <p className="text-[var(--text-secondary)] mb-6">
            On part d&apos;une grille de base, puis on ajuste pour coller à la réalité.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_28px_-20px_rgba(219,39,119,0.55)] ring-1 ring-[#FBCFE8]">
              <div className="grad-head-5 px-5 py-2 text-xs uppercase tracking-wider font-semibold">Étape 1</div>
              <div className="p-5">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">~120 overrides manuels</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                  Pour les villes les plus connues, on fixe à la main les valeurs de chaque axe
                  en s&apos;appuyant sur les sources publiques : SSMSI pour la sécurité, Clameur
                  pour les loyers, palmarès Figaro/L&apos;Express, etc.
                </p>
                <div className="rounded-xl bg-[#FDF2F8] px-3 py-2 text-xs text-[#831843] font-mono-data">
                  Exemple : Marseille safety 4.0 (SSMSI : 13/1000),<br />
                  Paris cost 2.6 (loyer médian 32 €/m²),<br />
                  Annecy nature 9.8 (lac + Alpes).
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_28px_-20px_rgba(124,58,237,0.55)] ring-1 ring-[#E9D5FF]">
              <div className="grad-head-4 px-5 py-2 text-xs uppercase tracking-wider font-semibold">Étape 2</div>
              <div className="p-5">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Heuristique départementale</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                  Pour les autres villes, on applique un biais par département (basé sur la moyenne
                  SSMSI départementale et Clameur), plus un léger ajustement par taille de population.
                </p>
                <div className="rounded-xl bg-[#F5F3FF] px-3 py-2 text-xs text-[#5B21B6] font-mono-data">
                  Exemple : Bouches-du-Rhône −1.4 sécurité,<br />
                  Cantal +0.9 sécurité, Paris −2.5 coût,<br />
                  pop &gt; 400 k → −0.6 coût et −0.3 sécurité.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sources table */}
      <section className="band band-aqua py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <EmojiBadge emoji="🗂️" tone="aqua" size="sm" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Sources par axe</h2>
          </div>
          <div className="overflow-x-auto rounded-2xl bg-white shadow-[0_18px_40px_-24px_rgba(8,145,178,0.55)] ring-1 ring-[#A5F3FC]">
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="grad-head-0">
                  <th className="px-5 py-3 text-left text-xs font-semibold">Axe</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold">Poids</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold">Sources</th>
                </tr>
              </thead>
              <tbody>
                {AXES.map(({ key, weight, sources }, i) => (
                  <tr
                    key={key}
                    className={`border-b border-[#CFFAFE] last:border-0 ${
                      i % 2 === 0 ? "bg-[#F0FDFF]" : "bg-white"
                    }`}
                  >
                    <td className="px-5 py-4 font-medium text-[var(--text-primary)] whitespace-nowrap">{key}</td>
                    <td className="px-5 py-4 text-right">
                      <span className="inline-block rounded-full bg-[#EEF2FF] px-2.5 py-0.5 font-mono-data text-xs font-bold text-[#3730A3] ring-1 ring-[#C7D2FE]">
                        {weight.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <ul className="space-y-0.5">
                        {sources.map((s) => (
                          <li key={s} className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                            <CheckCircle className="h-3 w-3 flex-shrink-0 text-[#0891B2]" aria-hidden />
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
        </div>
      </section>

      {/* Owner scores — F3 */}
      <section className="band band-lilac py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <EmojiBadge emoji="🏷️" tone="lilac" size="sm" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Profils propriétaires (10 scores complémentaires)
            </h2>
          </div>
          <p className="text-[var(--text-secondary)] mb-6">
            En plus des 8 axes officiels, chaque fiche ville expose 10 scores
            propriétaires sur des dimensions concrètes — visibles dans le bloc
            « Profils propriétaires » de la page ville. Chaque score affiche son
            origine&nbsp;: <strong>Source réelle</strong>, <strong>Proxy v0</strong> (dérivé
            du seed actuel), ou <strong>Estimation régionale</strong> (médiane utilisée
            quand la donnée commune manque). Aucune donnée silencieusement fabriquée.
          </p>
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_18px_40px_-24px_rgba(124,58,237,0.5)] ring-1 ring-[#E9D5FF]">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="grad-head-4">
                  <th className="text-left px-5 py-3 text-xs font-semibold">Score</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold">Source visée</th>
                </tr>
              </thead>
              <tbody>
                {OWNER_SCORES.map((s, i) => (
                  <tr key={s.key} className={`border-b border-[#F3E8FF] last:border-0 ${i % 2 === 0 ? "bg-[#FAF5FF]" : "bg-white"}`}>
                    <td className="px-5 py-2.5 pr-3">
                      <span className="font-medium text-[var(--text-primary)]">{s.label}</span>
                      <span className="ml-2 rounded-md bg-[#F3E8FF] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[#6B21A8]">
                        {s.key}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-xs text-[var(--text-secondary)]">{s.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <p className="px-5 py-4 text-xs text-[var(--text-tertiary)] border-t border-[#F3E8FF]">
              v0 : les feeds réels (Météo-France ARPEGE, Insee, Bruitparif, SSMSI VFFS,
              ATMO, ARCEP, DEPP, CAF, SIRENE) seront branchés itération par itération.
              Quand une source réelle remplace un proxy, le tag passe automatiquement
              à « Source réelle ».
            </p>
          </div>
        </div>
      </section>

      {/* Limits — explicit */}
      <section className="band band-indigo py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <EmojiBadge emoji="⚠️" tone="peach" size="sm" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Limites connues</h2>
          </div>
          <p className="text-[var(--text-secondary)] mb-6">
            On préfère vous les dire clairement plutôt que vous les laisser découvrir.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {LIMITS.map((limit, i) => (
              <li
                key={limit}
                className="flex items-start gap-3 rounded-2xl bg-white p-4 text-sm text-[var(--text-secondary)] shadow-[0_10px_24px_-18px_rgba(79,70,229,0.6)] ring-1 ring-[#C7D2FE]"
              >
                <EmojiBadge emoji={String(i + 1)} tone={toneFor(i)} size="sm" className="!h-7 !w-7 !text-xs font-bold text-[#3730A3] flex-shrink-0" />
                <span>{limit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="band band-bold py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-2">
            <span aria-hidden className="text-2xl">🛠️</span>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Vous avez repéré un score qui colle pas ?
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-5 max-w-2xl">
            On corrige rapidement. Écrivez-nous via le formulaire de contact en précisant
            la ville, l&apos;axe concerné et la source qui contredit notre note.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white text-[#4338CA] px-5 py-2.5 text-sm font-semibold shadow-[0_10px_24px_-12px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-transform"
          >
            Signaler une erreur →
          </Link>
        </div>
      </section>

      <StaticPageCrossLink exclude="/methode" />
      <Footer />
    </main>
  );
}
