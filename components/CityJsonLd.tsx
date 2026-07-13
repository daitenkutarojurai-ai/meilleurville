import type { CitySeed } from "@/data/cities-seed";
import type { CityPhoto } from "@/lib/city-images";
import type { FaqItem } from "@/lib/city-faq";

export function CityJsonLd({ city, faq, photo }: { city: CitySeed & { reviewCount?: number }; faq: FaqItem[]; photo?: CityPhoto | null }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";

  // Image-licence metadata (license + acquireLicensePage + creditText) is what
  // makes the photo eligible for Google Images' "Licensable" treatment — and it
  // is the same attribution the CC licence requires anyway.
  const image = photo
    ? {
        "@type": "ImageObject",
        contentUrl: `${baseUrl}${photo.hero.src}`,
        url: `${baseUrl}${photo.hero.src}`,
        width: photo.hero.width,
        height: photo.hero.height,
        caption: `${city.name}, ${city.department}`,
        creditText: `${photo.author ?? "Wikimedia Commons"} / ${photo.license}`,
        copyrightNotice: photo.author ?? undefined,
        creator: photo.author ? { "@type": "Person", name: photo.author } : undefined,
        license: photo.licenseUrl ?? undefined,
        acquireLicensePage: photo.commonsUrl,
      }
    : undefined;

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
        image,
        description: `${city.name} (${city.department}, ${city.region}) — Score de qualité de vie ${city.scores.global}/10. ${city.characterTags.join(", ")}.`,
      },
      {
        "@type": "ItemPage",
        "@id": `${baseUrl}/villes/${city.slug}#webpage`,
        url: `${baseUrl}/villes/${city.slug}`,
        primaryImageOfPage: image,
        name: `Avis sur ${city.name} · Qualité de vie ${city.scores.global}/10`,
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
            { "@type": "ListItem", position: 1, name: "MaVilleIdeal", item: baseUrl },
            { "@type": "ListItem", position: 2, name: "Villes", item: `${baseUrl}/villes` },
            { "@type": "ListItem", position: 3, name: city.name, item: `${baseUrl}/villes/${city.slug}` },
          ],
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map(({ q, a }) => ({
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
