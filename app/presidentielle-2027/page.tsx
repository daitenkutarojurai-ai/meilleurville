import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Vote, ArrowRight, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { PoliticalMap } from "@/components/PoliticalMap";
import { PollTracker } from "@/components/PollTracker";
import { PoliticalNewsFeed } from "@/components/PoliticalNewsFeed";
import { ElectionCountdown } from "@/components/ElectionCountdown";
import { ReportCTA } from "@/components/ReportCTA";
import { ShareLinks } from "@/components/ShareLinks";
import { CITIES_SEED } from "@/data/cities-seed";
import { allPoliticalLeans, getPoliticalLean } from "@/lib/political-lean";
import { politicalMapDots } from "@/lib/political-map-dots";
import { BLOC_COLORS, BLOC_LABEL, BLOC_ORDER } from "@/lib/political-lean-meta";
import { POLL_AVERAGE_BLOCS, pollAverageCandidates, project2027 } from "@/lib/presidential-2027";
import { BLOC_2027, CANDIDATE_2027_NAME, POLLS_2027, NATIONAL_2022_BLOCS } from "@/data/presidential-2027-polls";
import { POLITICAL_NEWS } from "@/data/political-news";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const dynamic = "force-static";

// Volume de recherche le plus fort du sujet jusqu'en mai 2027 : « sondage
// présidentielle 2027 », « date présidentielle 2027 », « candidats 2027 ».
// Cette page les réunit et renvoie vers la projection de chaque ville.
export const metadata: Metadata = {
  title: "Présidentielle 2027 : sondages, dates, candidats et votre ville",
  description:
    `1er tour le 18 avril 2027 : moyenne des sondages, candidats, calendrier, actualité et projection du vote dans ${allPoliticalLeans().length} villes.`,
  alternates: { canonical: "/presidentielle-2027" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Présidentielle 2027 : sondages, dates et projection ville par ville",
    description: "Moyenne des sondages, calendrier officiel et projection du 1er tour dans votre ville.",
  },
};

// Candidatures officialisées, chacune adossée à une entrée datée et sourcée
// du fil (`data/political-news.ts`). Les autres candidats sont « testés dans
// les sondages » : on n'affirme pas une candidature qu'on n'a pas sourcée.
const DECLARED: Partial<Record<keyof typeof CANDIDATE_2027_NAME, string>> = {
  lepen: "le-pen-appel-eligible-2026-07-07",
  glucksmann: "primaire-gauche-glucksmann-2026-10-11",
  retailleau: "retailleau-candidat-lr-2026-04-19",
};

export default function Presidentielle2027Page() {
  const builtAt = Date.now();
  const cands = pollAverageCandidates();
  const leader = cands[0];
  const dots = politicalMapDots();
  const newsIds = new Set(POLITICAL_NEWS.map((n) => n.id));

  const bigCities = CITIES_SEED.filter((c) => c.population >= 100_000 && getPoliticalLean(c.slug))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"))
    .map((c) => {
      const p = project2027(getPoliticalLean(c.slug)!.blocs);
      return { slug: c.slug, name: c.name, lead: p.lead, pct: p.blocs[p.lead], close: p.close };
    });

  const faq = [
    {
      q: "Quand a lieu l'élection présidentielle 2027 ?",
      a: "Le 1er tour est fixé au dimanche 18 avril 2027 et le second tour au dimanche 2 mai 2027. Aux Antilles, en Guyane, à Saint-Pierre-et-Miquelon, Saint-Barthélemy, Saint-Martin et en Polynésie française, on vote la veille.",
    },
    {
      q: "Qui est en tête des sondages pour 2027 ?",
      a: `Sur la moyenne des ${POLLS_2027.length} dernières enquêtes publiées, ${CANDIDATE_2027_NAME[leader.key]} arrive en tête du 1er tour avec ${leader.pct.toLocaleString("fr-FR")} % des intentions de vote, devant ${CANDIDATE_2027_NAME[cands[1].key]} (${cands[1].pct.toLocaleString("fr-FR")} %) et ${CANDIDATE_2027_NAME[cands[2].key]} (${cands[2].pct.toLocaleString("fr-FR")} %). Un sondage mesure une intention à une date, pas un résultat.`,
    },
    {
      q: "Jusqu'à quand peut-on s'inscrire sur les listes électorales ?",
      a: "Selon la règle du code électoral (6e vendredi avant le scrutin), jusqu'au vendredi 12 mars 2027 en mairie ou par courrier, et jusqu'au mercredi 10 mars en ligne. Après un déménagement, il faut s'inscrire dans sa nouvelle commune. Date à confirmer sur service-public.fr.",
    },
    {
      q: "Comment est calculée la projection par ville ?",
      a: "On part du résultat réel de chaque commune au 1er tour 2022 (ministère de l'Intérieur), puis on applique à chaque famille politique l'évolution entre son score national de 2022 et sa moyenne dans les sondages actuels. C'est une projection mécanique, pas un sondage local : elle suppose que chaque ville bouge comme le pays.",
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Présidentielle 2027", path: "/presidentielle-2027" },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faqJsonLd)} />
      <Navbar />

      <section className="relative overflow-hidden border-b border-[var(--border)] topo-bg py-10 sm:py-14">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <p className="plaque plaque-small mb-4">
            <Vote className="h-3.5 w-3.5" aria-hidden /> Élection présidentielle · 18 avril &amp; 2 mai 2027
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            Présidentielle 2027 : <span className="ink-underline">sondages, dates</span> et votre ville
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-secondary)] sm:text-lg">
            La moyenne des derniers sondages, le calendrier officiel, les candidatures et l&apos;actualité, puis la
            projection du 1ᵉʳ tour dans {dots.length} villes de métropole, à partir de leur vote réel de 2022.
          </p>
          <div className="mt-5">
            <ShareLinks path="/presidentielle-2027" text="Présidentielle 2027 : sondages, dates et projection du vote dans votre ville" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-12 px-4 py-10 sm:px-6">
        <section aria-labelledby="calendrier">
          <h2 id="calendrier" className="mb-3 text-xl font-bold text-[var(--text-primary)]">Le calendrier</h2>
          <ElectionCountdown builtAt={builtAt} />
        </section>

        <section aria-labelledby="sondages">
          <h2 id="sondages" className="mb-1 text-xl font-bold text-[var(--text-primary)]">Les sondages du 1ᵉʳ tour</h2>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">
            En tête de la moyenne : <strong>{CANDIDATE_2027_NAME[leader.key]}</strong> ({leader.pct.toLocaleString("fr-FR")} %).
            Par famille, l&apos;extrême droite est à {POLL_AVERAGE_BLOCS.extreme_droite.toLocaleString("fr-FR")} % contre{" "}
            {NATIONAL_2022_BLOCS.extreme_droite.toLocaleString("fr-FR")} % en 2022, la gauche à{" "}
            {POLL_AVERAGE_BLOCS.gauche.toLocaleString("fr-FR")} % contre {NATIONAL_2022_BLOCS.gauche.toLocaleString("fr-FR")} %,
            le centre à {POLL_AVERAGE_BLOCS.centre.toLocaleString("fr-FR")} % contre {NATIONAL_2022_BLOCS.centre.toLocaleString("fr-FR")} %.
          </p>
          <PollTracker />
        </section>

        <section aria-labelledby="candidats">
          <h2 id="candidats" className="mb-1 text-xl font-bold text-[var(--text-primary)]">Les candidats</h2>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">
            Les noms testés par les instituts. Le badge ne s&apos;affiche que pour une candidature officialisée et sourcée dans notre fil.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {cands.map(({ key, pct }) => {
              const bloc = BLOC_2027[key];
              const newsId = DECLARED[key];
              return (
                <li key={key} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                  <span className="h-10 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: BLOC_COLORS[bloc] }} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[var(--text-primary)]">{CANDIDATE_2027_NAME[key]}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">{BLOC_LABEL.fr[bloc]}</p>
                    {newsId && newsIds.has(newsId) && (
                      <a href={`#${newsId}`} className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)]">
                        <CheckCircle2 className="h-3 w-3" aria-hidden /> Candidature officialisée
                      </a>
                    )}
                  </div>
                  <span className="text-lg font-bold tabular-nums text-[var(--text-primary)]">{pct.toLocaleString("fr-FR")} %</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="carte">
          <h2 id="carte" className="mb-1 text-xl font-bold text-[var(--text-primary)]">La France en relief</h2>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">
            Chaque colonne est une ville : sa hauteur dit le score de la famille en tête, sa couleur dit laquelle. Basculez
            entre la projection 2027 et le vote réel de 2022, ou isolez une famille pour voir où elle pèse.
          </p>
          <PoliticalMap dots={dots} />
        </section>

        <section aria-labelledby="villes">
          <h2 id="villes" className="mb-1 text-xl font-bold text-[var(--text-primary)]">Projection dans les grandes villes</h2>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">
            Les {bigCities.length} villes de plus de 100 000 habitants. Toutes les autres sont sur{" "}
            <Link href="/orientation-politique" className="text-[var(--accent)] hover:underline">la page orientation politique</Link>.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {bigCities.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/villes/${c.slug}/presidentielle-2027`}
                  className="group flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 transition-colors hover:border-[var(--accent)]/50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                      {c.name}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                      <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: BLOC_COLORS[c.lead] }} aria-hidden />
                      {BLOC_LABEL.fr[c.lead]} {c.pct.toLocaleString("fr-FR")} %{c.close ? " · serré" : ""}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--accent)]" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <PoliticalNewsFeed limit={10} />

        <section aria-labelledby="faq">
          <h2 id="faq" className="mb-3 text-xl font-bold text-[var(--text-primary)]">Questions fréquentes</h2>
          <div className="space-y-2">
            {faq.map((f) => (
              <details key={f.q} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]">{f.q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-[var(--text-tertiary)]">
            Familles politiques : {BLOC_ORDER.map((b) => BLOC_LABEL.fr[b]).join(", ")}, regroupées comme pour 2022. Nous ne
            soutenons aucun candidat ; ces chiffres décrivent des intentions de vote, pas des préférences de la rédaction.
          </p>
        </section>

        <ReportCTA
          kinds={["politique", "erreur"]}
          title="Un sondage, une candidature ou une erreur à signaler ?"
          text="Envoyez le lien de la source : chaque ajout au fil est vérifié et daté."
        />
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-10 sm:px-6">
        <FeedbackWidget />
      </div>
      <Footer />
    </main>
  );
}
