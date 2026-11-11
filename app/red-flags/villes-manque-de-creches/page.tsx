import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RedFlagThemePage } from "@/components/RedFlagThemePage";
import { getRedFlagTheme } from "@/lib/red-flag-themes";
import { clampMeta } from "@/lib/brand";
import { redFlagThemeAlternates } from "@/lib/red-flag-theme-twins";

const theme = getRedFlagTheme("villes-manque-de-creches");

export const metadata: Metadata = theme
  ? {
      title: theme.metaTitle,
      description: clampMeta(theme.metaDescription),
      alternates: redFlagThemeAlternates(theme.slug),
      openGraph: { title: theme.metaTitle, description: theme.metaDescription, images: ["/opengraph-image"] },
    }
  : {};

export default function VillesManqueDeCreches() {
  if (!theme) notFound();
  return <RedFlagThemePage theme={theme} />;
}
