"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function SearchShortcut() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const isSlash = e.key === "/" && !inField;

      if (!isCmdK && !isSlash) return;

      e.preventDefault();

      const search = document.querySelector<HTMLInputElement>(
        "input[data-search-shortcut]"
      );
      if (search) {
        search.focus();
        search.select();
        return;
      }
      if (pathname !== "/villes") {
        router.push("/villes#search");
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, pathname]);

  return null;
}
