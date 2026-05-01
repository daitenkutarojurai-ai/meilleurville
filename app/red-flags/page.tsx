import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ContributionStats } from "@/components/ContributionStats";
import { AlertTriangle, Volume2, Droplets, Wind, Shield, Flame, Zap, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Red Flag Radar — Signalements communautaires | MeilleurVille",
  description:
    "Découvrez les alertes et signalements communautaires : bruit, inondation, pollution, insécurité. Ce que l'annonce immobilière ne vous dit jamais.",
};

const FLAG_CATEGORIES = [
  {
    id: "bruit",
    label: "Bruit",
    icon: Volume2,
    color: "text-orange-600",
    bg: "bg-orange-400/10 border-orange-400/20",
    examples: ["Couloir aérien", "Autoroute proche", "Voie ferrée", "Bar / discothèque"],
    count: 412,
  },
  {
    id: "inondation",
    label: "Inondation & Eau",
    icon: Droplets,
    color: "text-blue-600",
    bg: "bg-blue-400/10 border-blue-400/20",
    examples: ["Zone inondable PPRi", "Sous-sol humide récurrent", "Cave inondée", "Ruissellement urbain"],
    count: 287,
  },
  {
    id: "pollution",
    label: "Pollution",
    icon: Wind,
    color: "text-purple-600",
    bg: "bg-purple-400/10 border-purple-400/20",
    examples: ["PM2.5 élevé", "Zone industrielle proche", "Site pollué BASIAS", "Pesticides agricoles"],
    count: 198,
  },
  {
    id: "securite",
    label: "Sécurité",
    icon: Shield,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-400/20",
    examples: ["Cambriolages fréquents", "Dégradations récurrentes", "Squat identifié", "Éclairage insuffisant"],
    count: 341,
  },
  {
    id: "construction",
    label: "Construction & Chantier",
    icon: Flame,
    color: "text-amber-500",
    bg: "bg-amber-400/10 border-yellow-400/20",
    examples: ["Chantier ≥ 2 ans prévu", "Démolition programmée", "PLU modification", "Promoteur actif"],
    count: 156,
  },
  {
    id: "infrastructure",
    label: "Infrastructures",
    icon: Zap,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10 border-emerald-400/20",
    examples: ["Fibre non disponible", "Coupures électricité", "Réseau eau dégradé", "Route défoncée"],
    count: 89,
  },
];

const RECENT_FLAGS = [
  { city: "Lyon 7e", type: "Bruit", severity: 4, desc: "Couloir de bruit autoroutier A7 — mesures acoustiques confirmées par la Métropole", date: "il y a 2 jours", confirmed: 14 },
  { city: "Bordeaux Bastide", type: "Inondation", severity: 5, desc: "Zone rouge PPRi Garonne. Caves inondées à chaque crue > 6m à la station de Bordeaux", date: "il y a 5 jours", confirmed: 31 },
  { city: "Montpellier Nord", type: "Pollution", severity: 3, desc: "Pic PM10 régulier lors des inversions thermiques estivales. Alertes Atmo Occitanie fréquentes.", date: "il y a 1 semaine", confirmed: 8 },
  { city: "Nice Pasteur", type: "Sécurité", severity: 4, desc: "Série de cambriolages en journée signalée par les habitants. Commissariat informé.", date: "il y a 1 semaine", confirmed: 22 },
  { city: "Rennes Centre", type: "Construction", severity: 2, desc: "ZAC en cours de révision. Densification importante prévue d'ici 2028, enquête publique en cours.", date: "il y a 2 semaines", confirmed: 5 },
];

function SeverityBar({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-2 w-4 rounded-sm ${
            i <= level
              ? level >= 4
                ? "bg-red-500"
                : level >= 3
                ? "bg-amber-400"
                : "bg-emerald-500"
              : "bg-[var(--bg-elevated)]"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-[var(--text-secondary)]">
        {level >= 4 ? "Élevé" : level >= 3 ? "Modéré" : "Faible"}
      </span>
    </div>
  );
}

export default function RedFlagsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-b from-red-950/20 to-[var(--bg-canvas)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm text-red-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            Red Flag Radar
          </div>
          <h1 className="mb-3 text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
            Ce que l'annonce immobilière ne vous dira jamais.
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)] text-lg">
            Les habitants signalent. L'IA agrège et vérifie. Vous êtes informé
            avant l'achat ou la signature du bail. Plus de{" "}
            <span className="text-red-500 font-semibold">2 400 signalements</span>{" "}
            vérifiés sur 850 villes.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-14">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Signalements actifs", value: "2 483", color: "text-red-500" },
            { label: "Villes couvertes", value: "312", color: "text-[var(--text-primary)]" },
            { label: "Signalements confirmés", value: "78%", color: "text-emerald-600" },
            { label: "Utilisateurs contributeurs", value: "4 200+", color: "text-[var(--accent)]" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 text-center">
              <div className={`text-2xl font-bold font-mono-data mb-1 ${color}`}>{value}</div>
              <div className="text-xs text-[var(--text-secondary)]">{label}</div>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
            Catégories de signalements
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FLAG_CATEGORIES.map(({ id, label, icon: Icon, color, bg, examples, count }) => (
              <Card key={id} className={`border ${bg.split(" ")[1]}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <Badge variant="subtle">{count} signalements</Badge>
                </div>
                <h3 className={`font-semibold ${color} mb-2`}>{label}</h3>
                <ul className="space-y-1">
                  {examples.map((ex) => (
                    <li key={ex} className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-[var(--border)] flex-shrink-0" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent flags */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
            Signalements récents
          </h2>
          <div className="space-y-3">
            {RECENT_FLAGS.map((flag) => (
              <div
                key={flag.city + flag.type}
                className="flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-[var(--text-primary)]">{flag.city}</span>
                    <Badge variant="danger">{flag.type}</Badge>
                    <span className="text-xs text-[var(--text-secondary)]">{flag.date}</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-2">
                    {flag.desc}
                  </p>
                  <div className="flex items-center gap-4">
                    <SeverityBar level={flag.severity} />
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <Eye className="h-3 w-3" />
                      {flag.confirmed} confirmations
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community stats */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
            La communauté en action
          </h2>
          <ContributionStats />
        </div>

        {/* Contribute CTA */}
        <div className="rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/20 via-[var(--bg-surface)] to-[var(--bg-elevated)] p-8 sm:p-10 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
            Vous connaissez un problème non signalé ?
          </h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Aidez des milliers de personnes à éviter une mauvaise surprise.
            Les signalements vérifiés par 3+ utilisateurs sont publiés.
          </p>
          <button className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 px-6 py-3 font-semibold hover:bg-red-500/20 transition-colors">
            <AlertTriangle className="h-4 w-4" />
            Signaler un problème
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
}
