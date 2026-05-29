"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// The palette pulls in the full city + guide index, so it's code-split into its
// own chunk and only loaded on the first search trigger (Cmd/Ctrl+K, "/", or the
// nav search button). Pages where the user never searches never download it.
const SearchPalette = dynamic(
  () => import("@/components/SearchPalette").then((m) => m.SearchPalette),
  { ssr: false }
);

export function SearchPaletteLauncher() {
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function openSearch() {
      setLoaded(true);
      setOpen(true);
    }
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inField =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setLoaded(true);
        setOpen((v) => !v);
      } else if (e.key === "/" && !inField) {
        e.preventDefault();
        openSearch();
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("meilleurville:open-search", openSearch);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("meilleurville:open-search", openSearch);
    };
  }, []);

  if (!loaded) return null;
  return <SearchPalette open={open} onOpenChange={setOpen} />;
}
