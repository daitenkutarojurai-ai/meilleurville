# n8n — Automatisation réseaux sociaux MaVilleIdeale

## Ce qui est inclus

| Workflow | Description | Statut aujourd'hui |
|----------|-------------|-------------------|
| `social-media-daily.json` | Post quotidien (ville du jour) à 9h, 15h, 19h | FB + Threads actifs |
| `podcast-new-episode.json` | Poste automatiquement quand un nouvel épisode sort | FB + Threads actifs |

---

## Étape 1 — Configurer les variables d'environnement

Trouver le fichier `.env` de n8n (souvent `~/.n8n/.env` ou là où vous lancez n8n) et y ajouter le contenu du fichier `.env.n8n` de ce dossier.

Puis redémarrer n8n :
```bash
# Si lancé avec npx
pkill -f n8n && npx n8n start

# Si service systemd
sudo systemctl restart n8n
```

---

## Étape 2 — Importer les workflows dans n8n

1. Ouvrir http://localhost:5678
2. Menu hamburger → **Import from File**
3. Importer `workflows/social-media-daily.json`
4. Importer `workflows/podcast-new-episode.json`

---

## Étape 3 — Tester Facebook + Threads (disponibles aujourd'hui)

1. Ouvrir le workflow **MaVilleIdeale — Réseaux Sociaux Quotidien**
2. Cliquer **Execute Workflow** (bouton play)
3. Vérifier que les nodes Facebook et Threads s'exécutent en vert
4. Si erreur sur "FB — Récupérer pages" : le token a expiré → regénérer un token longue durée (voir ci-dessous)
5. Une fois validé, activer le workflow (toggle en haut)

### Token Facebook longue durée (60 jours)

Le token fourni est probablement un token court (1-2 h). Pour le prolonger :

```
GET https://graph.facebook.com/v20.0/oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id=1508512297660714
  &client_secret=08bc540abca8101e4412dbd3dd88fc0c
  &fb_exchange_token=EAAVbZBZBOkMS...
```

Copier le nouveau token dans `FB_ACCESS_TOKEN` dans `.env`.

---

## Étape 4 — Activer LinkedIn (OAuth 2.0)

LinkedIn ne permet pas de poster avec juste le client_id/secret — il faut un access token utilisateur.

1. Aller sur https://www.linkedin.com/developers/apps → votre app
2. Onglet **Auth** → ajouter `http://localhost:5678/rest/oauth2-credential/callback` en redirect URI
3. Dans n8n → Settings → Credentials → Add Credential → **LinkedIn OAuth2 API**
   - Client ID : `78duwlkj2hhwqx`
   - Client Secret : `WPL_AP1.ojpTVrzudA7TzeM7.MocdXA=`
4. Cliquer Connect → autoriser l'app
5. Récupérer votre URN LinkedIn :
   ```
   GET https://api.linkedin.com/v2/userinfo
   Authorization: Bearer {votre_access_token}
   ```
   Copier le `sub` dans `LI_PERSON_URN`
6. Dans le workflow, activer le node **LinkedIn — Publier** (toggle disabled)

---

## Étape 5 — Activer Twitter/X (OAuth 2.0 PKCE)

Le Bearer token d'app (`NXN2Zmh5...`) est en lecture seule. Pour poster des tweets il faut un **User Access Token** via OAuth 2.0 PKCE.

1. Aller sur https://developer.twitter.com/en/portal → votre app
2. Onglet **Auth settings** → activer OAuth 2.0, type **Web App**
3. Callback URL : `http://localhost:5678/rest/oauth2-credential/callback`
4. Dans n8n → Settings → Credentials → Add Credential → **Twitter OAuth2 API**
   - Client ID : `NXN2Zmh5VHdTM2I2dUVrR2dhMXk6MTpjaQ`
   - Client Secret : `XaJR5CWdEGnbX-fLIT1o3Ewtvr4PlvWEHqb8MRdfX0WQA8Flay`
5. Connecter → autoriser → copier l'access token dans `TWITTER_USER_TOKEN`
6. Dans le workflow, activer le node **Twitter/X — Publier**

---

## Étape 6 — Ajouter les photos Google Drive (optionnel)

Le dossier Drive `13MmPWX-T12MjUCyyKVkspha7fDpxcT84` contient les visuels.

1. Dans n8n → Credentials → **Google Drive OAuth2 API** → connecter votre compte Google
2. Ajouter un node **Google Drive → List Files** avec le folder ID ci-dessus, avant les posts
3. Ajouter un node **Google Drive → Download File** pour récupérer un fichier aléatoire
4. Passer le binaire au node Facebook via `POST /photos` au lieu de `/feed`

---

## Fréquence de publication

Le workflow quotidien poste à **9h, 15h et 19h du lundi au samedi**.

Pour modifier, éditer le champ **Cron Expression** du node "Déclencheur 3x/jour" :
- `0 9 * * 1-5` → une fois/jour semaine à 9h
- `0 9,19 * * *` → deux fois/jour tous les jours
- `0 9,15,19 * * 1-6` → actuel (3x/jour lun-sam)

---

## Rotation du contenu

Le workflow fait tourner 30 villes françaises en se basant sur le jour de l'année (`dayOfYear % 30`). Pour ajouter des villes, éditer le tableau `cities` dans le node **Générer le contenu**.

---

## Sécurité — actions urgentes

- **Rotater le App Secret Facebook** sur https://developers.facebook.com (il a été exposé dans une conversation)
- **Rotater le Client Secret LinkedIn** sur developers.linkedin.com
- **Rotater le Client Secret Twitter** sur developer.twitter.com
- Ne jamais commiter `.env.n8n` dans git (il est dans `.gitignore` si vous l'ajoutez)
