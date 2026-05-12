"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem 1rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
            color: "#0f172a",
            background: "#fafaf9",
          }}
        >
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            Une erreur s&apos;est produite
          </h1>
          <p style={{ maxWidth: "32rem", marginBottom: "1.5rem", color: "#475569" }}>
            Le site n&apos;a pas pu démarrer correctement. Réessayez dans un instant ou rechargez la page.
          </p>
          {error.digest && (
            <p style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#94a3b8", marginBottom: "1rem" }}>
              Code : {error.digest}
            </p>
          )}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={reset}
              style={{
                background: "#16a34a",
                color: "white",
                border: "none",
                padding: "0.625rem 1.25rem",
                borderRadius: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Réessayer
            </button>
            <a
              href="/"
              style={{
                background: "white",
                color: "#0f172a",
                border: "1px solid #e2e8f0",
                padding: "0.625rem 1.25rem",
                borderRadius: "0.75rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Accueil
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
