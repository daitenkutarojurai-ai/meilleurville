import { MapPin, ExternalLink } from "lucide-react";
import type { GuidePoi } from "@/lib/guide-pois";
import { mapsUrl } from "@/lib/guide-pois";

/**
 * The landmark a guide section is about: photo, name, and the two links a reader
 * actually wants next — "where is it" (Google Maps) and "tell me more"
 * (Wikipedia). The Commons credit ships with the photo; it is a licence
 * condition on CC BY-SA, not a nicety.
 */
export function GuidePoiCard({ poi, cityName }: { poi: GuidePoi; cityName: string }) {
  return (
    <figure className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]">
      <img
        src={poi.src}
        width={poi.width}
        height={poi.height}
        alt={poi.name}
        loading="lazy"
        decoding="async"
        style={{ backgroundColor: poi.color }}
        className="h-48 w-full object-cover sm:h-56"
      />
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
          <MapPin className="h-4 w-4 flex-shrink-0 text-cyan-400" aria-hidden />
          {poi.name}
        </span>

        <a
          href={mapsUrl(poi, cityName)}
          target="_blank"
          rel="noopener nofollow"
          className="text-xs font-medium text-cyan-400 hover:underline underline-offset-2"
        >
          Voir sur Google Maps
        </a>

        {poi.wiki && (
          <a
            href={poi.wiki}
            target="_blank"
            rel="noopener nofollow"
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline underline-offset-2"
          >
            Wikipédia
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        )}

        <span className="ml-auto text-[10px] text-[var(--text-tertiary)]">
          Photo :{" "}
          {poi.authorUrl ? (
            <a href={poi.authorUrl} target="_blank" rel="noopener nofollow" className="hover:underline">
              {poi.author ?? "auteur inconnu"}
            </a>
          ) : (
            poi.author ?? "auteur inconnu"
          )}{" "}
          ·{" "}
          {poi.licenseUrl ? (
            <a href={poi.licenseUrl} target="_blank" rel="noopener nofollow license" className="hover:underline">
              {poi.license}
            </a>
          ) : (
            poi.license
          )}{" "}
          ·{" "}
          <a href={poi.commonsUrl} target="_blank" rel="noopener nofollow" className="hover:underline">
            Commons
          </a>
        </span>
      </figcaption>
    </figure>
  );
}
