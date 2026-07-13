import type { CityPhoto as Photo } from "@/lib/city-images";

// Type-only import above: pulling a *value* out of lib/city-images would drag
// data/city-images.json (540 records) into the client bundle of every page that
// renders a photo. The alt text is trivial enough to keep local.
const photoAlt = (city: string, locale: "fr" | "en") =>
  locale === "en" ? `View of ${city}, France` : `Vue de ${city}`;

// Attribution is a licence condition on every CC BY / BY-SA file, so the credit
// is not optional chrome — it ships with the pixels. `linked` is false inside a
// card, where the whole tile is already an <a> and nesting anchors is invalid.
export function PhotoCredit({
  photo,
  locale = "fr",
  linked = true,
  className = "",
}: {
  photo: Photo;
  locale?: "fr" | "en";
  linked?: boolean;
  className?: string;
}) {
  const author = photo.author ?? (locale === "en" ? "unknown author" : "auteur inconnu");
  const label = locale === "en" ? "Photo" : "Photo";

  if (!linked) {
    return (
      <span className={className}>
        {label} : {author} · {photo.license}
      </span>
    );
  }

  return (
    <span className={className}>
      {label} :{" "}
      {photo.authorUrl ? (
        <a href={photo.authorUrl} target="_blank" rel="noopener nofollow" className="underline underline-offset-2 hover:text-[var(--text-primary)]">
          {author}
        </a>
      ) : (
        author
      )}{" "}
      ·{" "}
      {photo.licenseUrl ? (
        <a href={photo.licenseUrl} target="_blank" rel="noopener nofollow license" className="underline underline-offset-2 hover:text-[var(--text-primary)]">
          {photo.license}
        </a>
      ) : (
        photo.license
      )}{" "}
      ·{" "}
      <a href={photo.commonsUrl} target="_blank" rel="noopener nofollow" className="underline underline-offset-2 hover:text-[var(--text-primary)]">
        Wikimedia Commons
      </a>
    </span>
  );
}

/**
 * City hero band. `priority` marks the LCP image on the city page: eager +
 * fetchpriority=high, everything else stays lazy. Width/height are baked in so
 * the box is reserved before decode (no CLS), and `color` (the file's dominant
 * colour) fills it in the meantime.
 */
export function CityPhotoHero({
  photo,
  cityName,
  locale = "fr",
  priority = false,
  className = "",
}: {
  photo: Photo;
  cityName: string;
  locale?: "fr" | "en";
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={`relative overflow-hidden rounded-2xl border border-[var(--border)] ${className}`}>
      <img
        src={photo.hero.src}
        width={photo.hero.width}
        height={photo.hero.height}
        alt={photoAlt(cityName, locale)}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        style={{ backgroundColor: photo.color }}
        className="w-full h-[220px] sm:h-[320px] lg:h-[380px] object-cover"
      />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-2 pt-8 text-[11px] text-white/70">
        <PhotoCredit photo={photo} locale={locale} />
      </figcaption>
    </figure>
  );
}

/** Photo band for a city sub-page (climat, quartiers, à faire…). Shorter than
 *  the hero and never the LCP candidate. */
export function CityPhotoBand({
  photo,
  cityName,
  locale = "fr",
  className = "",
}: {
  photo: Photo;
  cityName: string;
  locale?: "fr" | "en";
  className?: string;
}) {
  return (
    <figure className={`relative overflow-hidden rounded-2xl border border-[var(--border)] ${className}`}>
      <img
        src={photo.hero.src}
        width={photo.hero.width}
        height={photo.hero.height}
        alt={photoAlt(cityName, locale)}
        loading="lazy"
        decoding="async"
        style={{ backgroundColor: photo.color }}
        className="w-full h-[160px] sm:h-[240px] object-cover"
      />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-2 pt-8 text-[11px] text-white/70">
        <PhotoCredit photo={photo} locale={locale} />
      </figcaption>
    </figure>
  );
}
