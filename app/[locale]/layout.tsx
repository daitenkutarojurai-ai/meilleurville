// Layout for the English version. The root html lang attribute is set on
// app/layout.tsx, but Next 16 lets us scope route segments — here we just
// pass the locale down via the params helper. We don't re-render <html>;
// the root layout owns that.

import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "fr") notFound();
  const _locale: Locale = locale; // narrow + reserved for future use
  void _locale;
  return children;
}
