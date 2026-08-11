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

## What needs sign-off before it happens

Per policy, I haven't contacted anyone. Before wave 1 goes out I need:
- Confirmation to proceed with the research pass (harmless — no outbound)
- Review of the actual target list once built
- Explicit go-ahead on the send, same as any outreach — this is messaging
  third parties on your behalf

Let me know if you want me to start the research pass.
