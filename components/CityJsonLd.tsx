import type { CitySeed } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";

function qualityLabel(score: number): string {
  if (score >= 8.5) return "excellente";
  if (score >= 7.5) return "très bonne";
  if (score >= 6.5) return "bonne";
  return "correcte";
}

export function CityJsonLd({ city }: { city: CitySeed & { reviewCount?: number } }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://meilleurville.fr";
  const housing = getHousing(city.slug);

  const faqItems = [
    {
      q: `Quelle est la qualité de vie à ${city.name} ?`,
      a: `La qualité de vie à ${city.name} est ${qualityLabel(city.scores.global)}, avec un score global de ${city.scores.global}/10. La ville se distingue notamment sur : ${city.characterTags.slice(0, 3).join(", ")}.`,
    },
    {
      q: `Quel est le coût de la vie à ${city.name} ?`,
      a: housing
        ? `À ${city.name}, un appartement T2 coûte en moyenne ${housing.avgRentT2}€/mois et un T3 ${housing.avgRentT3}€/mois. Le prix d'achat moyen est de ${housing.avgBuyPriceM2}€/m². Le score coût de la vie est de ${city.scores.cost}/10.`
        : `Le coût de la vie à ${city.name} est noté ${city.scores.cost}/10 sur MeilleurVille.`,
    },
    {
      q: `${city.name} est-elle une bonne ville pour les familles ?`,
      a: `${city.name} obtient un score sécurité de ${city.scores.safety}/10 et écoles de ${city.scores.schools}/10. ${city.scores.safety >= 7.5 && city.scores.schools >= 7.5 ? "C'est une ville particulièrement recommandée pour les familles avec enfants." : "Elle convient aux familles selon leurs priorités spécifiques."}`,
    },
    {
      q: `Peut-on télétravailler à ${city.name} ?`,
      a: `${city.name} obtient un score télétravail de ${city.scores.remoteWork}/10. ${city.scores.remoteWork >= 8 ? "Excellente infrastructure numérique, espaces de coworking et réseau fibre." : city.scores.remoteWork >= 7 ? "Bonne infrastructure pour le télétravail avec une connectivité satisfaisante." : "Infrastructure correcte pour le télétravail, à confirmer selon vos besoins spécifiques."}`,
    },
    {
      q: `Quels sont les transports en commun à ${city.name} ?`,
      a: `Le score transport de ${city.name} est de ${city.scores.transport}/10. ${city.scores.transport >= 8 ? "Réseau de transport en commun très développé (tram, bus, vélo)." : city.scores.transport >= 6.5 ? "Réseau de transport en commun correct." : "Réseau de transport limité, une voiture peut être utile."}`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "City",
        "@id": `${baseUrl}/villes/${city.slug}`,
        name: city.name,
        url: `${baseUrl}/villes/${city.slug}`,
        containedInPlace: {
          "@type": "AdministrativeArea",
          name: city.region,
        },
        geo: city.latitude && city.longitude
          ? {
              "@type": "GeoCoordinates",
              latitude: city.latitude,
              longitude: city.longitude,
            }
          : undefined,
        population: city.population ?? undefined,
        description: `${city.name} (${city.department}, ${city.region}) — Score de qualité de vie ${city.scores.global}/10. ${city.characterTags.join(", ")}.`,
      },
      {
        "@type": "ItemPage",
        "@id": `${baseUrl}/villes/${city.slug}#webpage`,
        url: `${baseUrl}/villes/${city.slug}`,
        name: `Avis sur ${city.name} — Qualité de vie ${city.scores.global}/10`,
        description: `Découvrez ${city.name} : scores de qualité de vie, avis d'habitants, quartiers et classements.`,
        aggregateRating: (city.reviewCount ?? 0) > 0
          ? {
              "@type": "AggregateRating",
              ratingValue: city.scores.global.toFixed(1),
              bestRating: "10",
              worstRating: "1",
              ratingCount: city.reviewCount ?? 180,
            }
          : undefined,
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "MeilleurVille", item: baseUrl },
            { "@type": "ListItem", position: 2, name: "Villes", item: `${baseUrl}/villes` },
            { "@type": "ListItem", position: 3, name: city.name, item: `${baseUrl}/villes/${city.slug}` },
          ],
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
