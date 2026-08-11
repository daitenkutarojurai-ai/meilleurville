# Backlink plan — bestcitiesinfrance.com

Drafted 2026-08-11, in response to the EN traffic collapse investigation (see
memory `dead-internal-links-scan.md` context and the GSC data pulled this
session). **Nothing in this document has been sent.** It's a plan to review,
not an executed campaign — every send needs a separate go-ahead, same as the
FR outreach motion (`scripts/outreach-mairies.ts`).

## Why this exists

Live Search Console data (pulled 2026-08-11): bestcitiesinfrance.com got a
temporary ranking trial from mid-May to mid-June 2026 (peak ~24 clicks/day),
then collapsed to near-zero and stayed there — 165 clicks total over 3 months.
4.96K pages are indexed and growing; no manual action, no security issue. The
Links report shows why the trial didn't hold: **46 total external backlinks,
100% of them from mavilleideale.fr itself.** Zero independent third-party
validation. This is the standard new-domain sandbox pattern — Google trials
new sites, then drops them without external signals to justify continued
ranking.

The FR site has an active link-building motion; the EN site has never had one.
That gap is the fix.

## Lesson from the FR outreach history — don't repeat this

`docs/outreach-log.md` is blunt about what already failed once: **mairies
(town halls) pitched on "embed your city's ranking badge" got 90 sends and 0
replies.** The badge-first hook read as a favor being asked, not a resource
being offered. Journalist/press pitches on "your city ranks Nth" fared only
marginally better (32 sends, 1 reply). The wave that shifted the ask away from
"do something for us" toward something concretely useful is the pattern to
follow here, not the badge pitch verbatim — EN's audience (expat bloggers,
relocation-content sites, forums) has even less reason than a mairie to care
about a badge, and a cold "we made a ranking, please link it" email reads as
spam to anyone running a content site.

**What replaces it:** lead with an asset the target's own readers benefit
from — a specific data point, a tool their audience can use, or a genuinely
useful resource to route their readers to — not a request to promote us.

## What's actually linkable today

- **555 native EN guides** (`data/guides-en.ts`) — cost-of-living breakdowns,
  where-to-buy neighborhood guides, car-free-living guides, 170
  `things-to-do-in-[city]` guides, region overviews, ranking guides
  (best-cities-for-X). Not translations — written from FR source data with an
  expat framing.
- **Interactive tools**: `/people-like-you`, `/city-match`, `/future-you`,
  `/vibe`, `/copilot` — things a relocation blogger can point a reader to
  directly ("try this quiz") rather than just cite.
- **`/methodology`** — full transparency on the scoring model (SSMSI crime
  data, Insee rents, 8-axis composite). This is the citable asset for anyone
  writing "best places to live in France" and wanting a source that isn't a
  listicle.
- **`/glossary`** — French property/relocation terms explained in English;
  linkable from any expat forum thread where the jargon comes up (notaire,
  taxe foncière, PACS, etc.).
- **No EN badge yet** (`/badge` is FR-only, deliberately deferred per the
  roadmap — "doesn't translate cleanly to the expat audience"). Confirmed
  still true: don't resurrect the badge pitch for this audience.

## Target segments

### 1. Expat/relocation content sites and bloggers
Sites that already write "moving to France" content and would plausibly cite
or link a data source. Examples to identify and vet (not pre-verified contact
info — that's the first research step, mirroring how `outreach-mairies.ts`
resolves addresses by INSEE code rather than guessing):
- The Local France, FrenchEntrée, Complete France, France Today Magazine
- Individual expat bloggers with an established France-relocation niche
  (search "moving to France blog" + region-specific ones — Dordogne, Provence,
  Brittany expat blogs)
- Immigration/visa consultancy sites that publish "best cities" content as
  lead-gen (they need credible city data and often link sources)

**Hook**: "We built a free, sourced 8-axis city comparison tool covering 540
French cities — no signup. If you're already writing about [city], here's the
data page for it, might save you a paragraph of research." Offer the specific
guide/tool relevant to what they've already published, not a generic pitch.

### 2. Forums and communities (not email — direct participation)
- Reddit: r/IWantOut, r/expats, r/AskFrance, r/France (English threads),
  r/digitalnomad
- Expat.com and Internations France forums

**Mechanics differ here**: this isn't outreach email, it's answering real
questions where they come up, with a link when it's genuinely the best answer
— not link-dropping. Reddit in particular bans/shadow-bans obvious self-promo;
this only works as authentic participation over time, which means it's a
standing habit, not a one-off campaign. Flagging this as the segment least
suited to a scripted batch send.

### 3. English-language French press & regional press with English editions
Smaller lift than the FR press campaign (which got 1 reply out of 32) because
the EN angle — "an English-language, sourced ranking tool for the expat
relocation wave" — is a more specific story hook than "your city ranks Nth."
Outlets: The Connexion France, France 24 (English desk), overseas-property
press (A Place in the Sun, PrimeLocation international).

### 4. Directories and resource lists
Static "resources for moving to France" pages run by relocation services, law
firms handling visas, international schools, or university study-abroad
offices. Lower individual value per link but low effort, and several already
maintain public link lists that accept submissions.

## Mechanics

Mirror the FR script's discipline, not its content:
- **Resolve real contacts, don't guess.** The FR script's #1 rule (INSEE-code
  address resolution, because guessing produced the only bounces in the
  campaign) has an EN equivalent: verify each blog/site is still active and
  find the actual author contact, not a generic `info@` that's more likely to
  be ignored or bounce.
- **Every figure in an email must come from the seed/data pipeline, never
  typed by hand** — same rule as `outreach-mairies.ts`, same reasoning (a
  wrong number sent to someone who'd notice is worse than no number).
- Track sends the same way: a `scripts/outreach-en.ts` mirroring the
  dry-run/`--send`/contacted-registry pattern, logged in a new
  `docs/outreach-log-en.md` rather than mixed into the FR log.

## Sequencing

1. **Research pass first** (no sends): build a real target list per segment
   above with verified contact info — this alone is a few hours of work and
   nothing goes out during it.
2. **Small first wave** (~10-15 sends) to the segment most likely to
   respond — individual bloggers already covering specific cities we have
   guides for, pitched with the specific matching guide, not a generic link.
   Measure reply rate before scaling, same lesson as the FR mairie wave (it
   took 90 sends to learn the hook wasn't working — start smaller here).
3. **Forum participation** starts in parallel as an ongoing habit, not a
   campaign with an end date.
4. **Press/directories** as a slower-burn parallel track.

## Research pass — completed 2026-08-11

Verified via direct fetch of each site's own contact page where possible
(not just search-snippet guesses — same discipline as resolving mairie
addresses by INSEE code rather than trusting a third-party directory). Emails
marked "unverified" came back redacted or ambiguous in search results and
need a direct visit before use. **Nothing below has been contacted.**

### Press (segment 3) — journalism angle: "a sourced, independent ranking tool for the expat wave," not "please link us"

| Outlet | Contact | Source | Notes |
|---|---|---|---|
| FrenchEntrée | editor@frenchentree.com | fetched directly from their contact page | Largest property/relocation outlet in this space; already covers regions we have `where-to-buy-in-[city]` guides for — pitch the specific city guide, not the whole site |
| The Local France | ben.mcpartland@thelocal.com (Managing Editor) | fetched directly from About Us page | Also has a general contact form at thelocal.fr/contact; journalist Emma Albright covers practical/lifestyle France stories |
| The Connexion | news@connexionfrance.com | search summary — verify on connexionfrance.com/Contact-Us before use | 31,000+ subscribers, explicitly solicits reader story tips |
| France Today Magazine | *unverified* — editor is Justin Postlethwaite, domain redacted in search results | needs direct visit to francetoday.com/contact-2/ | Lower priority — print-first, slower cycle |

### Bloggers (segment 1) — resource-for-your-readers angle, NOT a guest-post pitch

| Blog | Contact | Notes |
|---|---|---|
| FrenchEntrée (also a blog network) | see above | — |
| Oui In France (Diane) | ouiinfrance@gmail.com | **Explicitly states no unsolicited guest posts** — fine, our ask isn't a guest post. Large, established, covers practical living-in-France topics. |
| Annie André | contact form on annieandre.com/contact/ (email redacted) | **Also explicitly not accepting guest posts** — same note as above applies |
| French Moments (Pierre) | pierre@frenchmoments.eu *(search returned `.com`, but the site itself is `.eu` — use the contact form at frenchmoments.eu/contact-us/ instead of guessing the domain)* | Has a "Work with us" page, so partnership-shaped asks are explicitly welcome |
| Living Dordogne | contact form on living-dordogne.com | Regional focus fits our region-level content well |
| Expat on a Budget (Substack) | reply to newsletter / Substack "about" page | Newsletter format — a mention here reaches an engaged inbox list, not just a static page |

### Directories (segment 4) — self-serve, lowest effort, no cold email needed

- **FeedSpot "35 Best Living in France Blogs"** (bloggers.feedspot.com/living_in_france_blogs/) has a live "Submit Your Blog" form. Worth trying even though we're a tools/data site rather than a personal blog — FeedSpot lists mix in resource sites.
- **ExpatsBlog.com/blogs/france** — directory listing, likely has a submission path (not yet confirmed).
- Complete France's "useful blogs written by expats" roundup and Expat Focus's recommended-blogs article are both existing curated lists — the ask there is "consider adding us," aimed at the article's author/editor rather than a submission form.

### Forums/communities (segment 2) — not outreach, ongoing participation

Confirmed active: r/IWantOut, r/expats, r/AskFrance, r/France (English-language threads), InterNations city chapters (Paris, Lyon, Strasbourg/"Americans in Alsace," Montpellier), and a set of expat Facebook groups indexed at nextchapterfrance.com's roundup. No sends here — this is a standing habit to start whenever, not a wave.

## Wave 1 — drafted copy (DRAFT ONLY — nothing below has been sent)

Sender identity matches the site's existing transactional pattern
(`worker/index.ts`/`worker/crons.ts`): **hello@bestcitiesinfrance.com**,
display name "Best Cities in France," signed personally as Thomas — same
shape as the FR outreach script's `SENDER`/`REPLY_TO`. Each pitch leads with
a specific real page, not the homepage, and is explicit that it isn't a
guest-post ask (for Oui In France / Annie André, if added to a later wave,
that line needs to stay front and center — both explicitly decline guest
posts).

---

**To:** editor@frenchentree.com
**Subject:** A free, sourced city-data resource — not a guest-post pitch

> Hi FrenchEntrée team,
>
> I run BestCitiesInFrance.com, an independent ranking tool covering all 540
> French cities on 8 axes — safety from SSMSI crime data, cost from Insee and
> the observatoires des loyers, schools, transport, and more. Full
> methodology is published at bestcitiesinfrance.com/methodology; nothing on
> the site is sponsored by a commune or développeur.
>
> FrenchEntrée covers property and relocation region by region in real depth,
> so I thought a couple of pages might be worth linking from your own
> coverage where relevant — no ask beyond that:
>
> - bestcitiesinfrance.com/guides/living-in-the-dordogne-2026 — the four
>   Périgords, real property prices, the British community, the trade-offs
>   that don't make the brochure
> - bestcitiesinfrance.com/city-match — an interactive comparison tool, if
>   useful for readers weighing options between towns
>
> Happy to share the underlying city data or run a custom cut if that's ever
> useful for something you're working on.
>
> Thomas
> BestCitiesInFrance.com

---

**To:** ben.mcpartland@thelocal.com
**Subject:** Sourced city-ranking data, in case useful for a "best places to live" piece

> Hi Ben,
>
> I built BestCitiesInFrance.com — an independent ranking of all 540 French
> cities on 8 axes (safety, cost of living, schools, transport, etc.), each
> sourced back to SSMSI, Insee, or the relevant public dataset. Full
> methodology at bestcitiesinfrance.com/methodology, nothing sponsored.
>
> The Local runs "where to live in France" pieces from time to time, so
> flagging the data in case it's useful — happy to pull a custom cut (best
> cities under a given budget, ranked by a specific axis, whatever's useful
> for a story) at no cost and no strings attached.
>
> Thomas
> BestCitiesInFrance.com

---

**To:** Living Dordogne contact form (living-dordogne.com — no direct email found, form submission needed)
**Message:**

> Hi,
>
> I run BestCitiesInFrance.com and just published an honest, data-backed
> guide to living in the Dordogne — the four Périgords, real property prices,
> the British community, climate, and the trade-offs that don't make it into
> the brochure version: bestcitiesinfrance.com/guides/living-in-the-dordogne-2026
>
> Living Dordogne is the best resource I've found for people actually
> considering the move rather than just visiting, so thought this might be
> worth a look in case it's useful to link for readers doing the research. No
> ask beyond that — it's free, no signup, not sponsored by anyone.
>
> Thomas, BestCitiesInFrance.com

---

**To:** French Moments contact form (frenchmoments.eu/contact-us/) — *do not use the `pierre@frenchmoments.com` address from search results; the site's actual domain is `.eu`, use the form instead*
**Message:**

> Hi Pierre,
>
> I run BestCitiesInFrance.com — an independent, sourced tool ranking all 540
> French cities (safety, cost, transport, schools, full methodology
> published, nothing sponsored). Given how much depth French Moments has on
> Alsace, I thought this might be a useful companion for readers actually
> considering living there rather than visiting:
> bestcitiesinfrance.com/guides/alsace-strasbourg-living-guide-2026
>
> No ask beyond flagging it — happy to share the underlying city data if it's
> ever useful for anything else you're working on.
>
> Thomas
> BestCitiesInFrance.com

---

## What needs sign-off before anything goes out

**Drafts only — nothing above has been sent.** Sending these (or submitting
the FeedSpot form) is messaging/publishing on your behalf, which needs your
explicit go-ahead per send, not just approval of the plan. Say the word for
any or all of the four and I'll send them as-is, or flag edits first.
