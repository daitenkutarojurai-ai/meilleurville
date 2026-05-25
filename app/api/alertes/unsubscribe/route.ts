import { NextRequest, NextResponse } from "next/server";
import { deactivateAlerte, findByUnsubscribeToken } from "@/lib/alertes-store";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return new NextResponse(
      `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Lien invalide</title></head><body><p>Lien de désabonnement invalide ou expiré.</p></body></html>`,
      { headers: { "content-type": "text/html; charset=utf-8" }, status: 400 }
    );
  }

  const alerte = await findByUnsubscribeToken(token);
  if (!alerte || !alerte.active) {
    return new NextResponse(
      `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Déjà désabonné</title></head><body><p>Cette alerte est déjà désactivée ou le lien est invalide.</p></body></html>`,
      { headers: { "content-type": "text/html; charset=utf-8" }, status: 200 }
    );
  }

  await deactivateAlerte(token);

  const cityPath = alerte.locale === "fr" ? `/villes/${alerte.citySlug}` : `/cities/${alerte.citySlug}`;
  const origin = alerte.locale === "fr" ? "https://mavilleideale.fr" : "https://bestcitiesinfrance.com";

  return new NextResponse(
    `<!DOCTYPE html><html lang="${alerte.locale}"><head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="4;url=${origin}${cityPath}">
<title>Désabonné</title>
</head><body>
<p>Vous avez été désabonné·e des alertes pour <strong>${alerte.cityName}</strong>.</p>
<p>Redirection dans 4 secondes...</p>
<p><a href="${origin}${cityPath}">Retour à la fiche de ${alerte.cityName}</a></p>
</body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" }, status: 200 }
  );
}
