import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CITIES_SEED } from "@/data/cities-seed";

export const metadata: Metadata = {
  title: "Données & Sources — MeilleurVille",
  description:
    "Transparence totale sur les sources de données MeilleurVille : INSEE, Open Data, avis habitants. Tout est documenté et téléchargeable.",
};

const SOURCES = [
  {
    name: "INSEE — Recensement",
    category: "Données démographiques",
    description: "Population, structure d'âge, catégories socio-professionnelles, taux de chômage.",
    update: "Annuel",
    format: "CSV / API",
    status: "live" as const,
    url: "https://www.insee.fr",
  },
  {
    name: "data.gouv.fr — DVF",
    category: "Immobilier",
    description: "Demandes de valeurs foncières : prix de vente des biens immobiliers par commune.",
    update: "Semestriel",
    format: "CSV",
    status: "live" as const,
    url: "https://data.gouv.fr",
  },
  {
    name: "OpenStreetMap",
    category: "Géographie & Équipements",
    description: "Densité des commerces, cafés, coworking, parcs, pistes cyclables, accès transports.",
    update: "Continu",
    format: "OSM / Overpass API",
    status: "live" as const,
    url: "https://openstreetmap.org",
  },
  {
    name: "data.education.gouv.fr",
    category: "Écoles",
    description: "Résultats du baccalauréat par établissement, taux de réussite, options disponibles.",
    update: "Annuel",
    format: "CSV",
    status: "live" as const,
    url: "https://data.education.gouv.fr",
  },
  {
    name: "Open-Meteo",
    category: "Météo & Climat",
    description: "Températures moyennes historiques, précipitations, jours de soleil par commune.",
    update: "Quotidien",
    format: "JSON API",
    status: "live" as const,
    url: "https://open-meteo.com",
  },
  {
    name: "Préfectures — État 4001",
    category: "Sécurité",
    description: "Statistiques de criminalité par type d'acte et par commune (crimes et délits enregistrés).",
    update: "Annuel",
    format: "XLSX / data.gouv.fr",
    status: "live" as const,
    url: "https://data.gouv.fr",
  },
  {
    name: "RPPS — Répertoire médecins",
    category: "Santé",
    description: "Densité de médecins généralistes et spécialistes par commune.",
    update: "Mensuel",
    format: "API / CSV",
    status: "partial" as const,
    url: "https://esante.gouv.fr",
  },
  {
    name: "Avis habitants MeilleurVille",
    category: "Expérience vécue",
    description: "Avis vérifiés de résidents actuels et anciens. Modération humaine + IA anti-spam.",
    update: "Temps réel",
    format: "Interne",
    status: "live" as const,
    url: "/villes",
  },
  {
    name: "Airparif / ATMO",
    category: "Qualité de l'air",
    description: "Indice de qualité de l'air, PM2.5, PM10, NO2 par zone géographique.",
    update: "Quotidien",
    format: "API",
    status: "coming" as const,
    url: "https://www.airparif.fr",
  },
];

const STATUS_CONFIG = {
  live: { label: "Actif", color: "text-emerald-600 bg-emerald-500/10 border-emerald-400/20" },
  partial: { label: "Partiel", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  coming: { label: "Bientôt", color: "text-blue-600 bg-blue-400/10 border-blue-400/20" },
};

const SCORE_CRITERIA = [
  { key: "life", label: "Qualité de vie", description: "Composite : satisfaction globale des habitants, densité de commerces et services.", weight: 15 },
  { key: "transport", label: "Transport", description: "GTFS transports en commun, pistes cyclables, accès gare TGV, temps de trajet médian.", weight: 12 },
  { key: "nature", label: "Nature", description: "Accès espaces verts, ensoleillement annuel, qualité de l'air, proximité mer/montagne.", weight: 14 },
  { key: "cost", label: "Coût de vie", description: "Loyer médian, prix m², indice de prix consommation locale vs revenu médian.", weight: 15 },
  { key: "safety", label: "Sécurité", description: "Statistiques criminalité préfecture, sentiment de sécurité (avis), incivilités.", weight: 14 },
  { key: "culture", label: "Culture", description: "Théâtres, musées, festivals, restaurants, vie nocturne, offre universitaire.", weight: 10 },
  { key: "remoteWork", label: "Télétravail", description: "Couverture fibre, densité coworking, cafés WiFi, communauté tech, température coût/fibre.", weight: 10 },
  { key: "schools", label: "Écoles", description: "Taux bac, offre scolaire privé/public, résultats PISA locaux, décrochage scolaire.", weight: 10 },
];

export default function DonneesPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Transparence totale</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Nos données & sources
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            Tout ce que vous voyez sur MeilleurVille est construit sur des données vérifiables et publiques.
            Aucune "note magique", aucun résultat payant.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-12">
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Villes analysées", value: `${CITIES_SEED.length}` },
            { label: "Sources de données", value: `${SOURCES.length}` },
            { label: "Critères de score", value: "9" },
            { label: "Mise à jour", value: "Hebdo" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-center">
              <div className="text-2xl font-black font-mono-data text-[var(--accent)]">{value}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Score criteria */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5">
            Comment sont calculés les scores
          </h2>
          <div className="space-y-3">
            {SCORE_CRITERIA.map((c) => (
              <div key={c.key} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <span className="font-semibold text-[var(--text-primary)]">{c.label}</span>
                  <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">Poids : {c.weight}%</span>
                </div>
                <div className="h-1 bg-[var(--bg-elevated)] rounded-full mb-2">
                  <div
                    className="h-1 bg-[var(--accent)] rounded-full"
                    style={{ width: `${c.weight * 4}%` }}
                  />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{c.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sources table */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5">
            Sources utilisées
          </h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left text-xs uppercase tracking-wide text-[var(--text-tertiary)] pb-3 pr-4">Source</th>
                    <th className="text-left text-xs uppercase tracking-wide text-[var(--text-tertiary)] pb-3 pr-4 hidden sm:table-cell">Catégorie</th>
                    <th className="text-left text-xs uppercase tracking-wide text-[var(--text-tertiary)] pb-3 pr-4 hidden md:table-cell">Mise à jour</th>
                    <th className="text-left text-xs uppercase tracking-wide text-[var(--text-tertiary)] pb-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {SOURCES.map((s) => {
                    const st = STATUS_CONFIG[s.status];
                    return (
                      <tr key={s.name} className="hover:bg-[var(--bg-elevated)] transition-colors">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-[var(--text-primary)]">{s.name}</div>
                          <div className="text-xs text-[var(--text-tertiary)] mt-0.5 hidden sm:block">{s.description}</div>
                        </td>
                        <td className="py-3 pr-4 text-sm text-[var(--text-secondary)] hidden sm:table-cell">{s.category}</td>
                        <td className="py-3 pr-4 text-sm text-[var(--text-secondary)] hidden md:table-cell">{s.update}</td>
                        <td className="py-3">
                          <span className={`inline-flex text-xs font-medium border rounded-full px-2.5 py-0.5 ${st.color}`}>
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Download / API CTA */}
        <div className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-8">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            Export des données
          </h2>
          <p className="text-[var(--text-secondary)] mb-5">
            Les abonnés Pro peuvent exporter l'ensemble des scores en CSV pour leurs propres analyses.
            Journalistes et chercheurs : contactez-nous pour un accès dataset complet.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/quiz"
              className="rounded-xl bg-[var(--accent)] text-white font-semibold px-5 py-2.5 text-sm hover:opacity-90 transition-opacity"
            >
              ✨ Accès Pro — Export CSV
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium px-5 py-2.5 text-sm hover:text-[var(--text-primary)] transition-colors"
            >
              Demande académique / presse
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/methode" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Méthodologie détaillée →
          </Link>
          <Link href="/leaderboard" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Leaderboard →
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
