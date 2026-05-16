import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OwnerRankingPage } from "@/components/OwnerRankingPage";
import { getOwnerRanking } from "@/lib/owner-rankings";

const ranking = getOwnerRanking("calme-sonore");

export const metadata: Metadata = ranking
  ? {
      title: ranking.metaTitle,
      description: ranking.metaDescription,
      alternates: { canonical: `/classements/${ranking.slug}` },
      openGraph: { title: ranking.metaTitle, description: ranking.metaDescription },
    }
  : {};

export default function Page() {
  if (!ranking) notFound();
  return <OwnerRankingPage ranking={ranking} />;
}
