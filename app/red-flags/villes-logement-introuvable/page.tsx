import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RedFlagThemePage } from "@/components/RedFlagThemePage";
import { getRedFlagTheme } from "@/lib/red-flag-themes";

const theme = getRedFlagTheme("villes-logement-introuvable");

export const metadata: Metadata = theme
  ? {
      title: theme.metaTitle,
      description: theme.metaDescription,
      alternates: { canonical: `/red-flags/${theme.slug}` },
      openGraph: { title: theme.metaTitle, description: theme.metaDescription },
    }
  : {};

export default function VillesLogementIntrouvable() {
  if (!theme) notFound();
  return <RedFlagThemePage theme={theme} />;
}
