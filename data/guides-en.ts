// English guides for bestcitiesinfrance.com.
//
// These are written natively in English for the "moving to / living in France"
// audience — NOT machine translations of data/guides.ts. The FR site has 359
// guides; this is a curated launch set. Add entries here and the EN /guides
// index + /guides/[slug] routes pick them up automatically.

export interface EnGuide {
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  category: "moving" | "remote-work" | "family" | "budget" | "lifestyle";
  emoji: string;
  readMinutes: number;
  publishedAt: string;
  updatedAt: string;
  intro: string;
  sections: Array<{ heading: string; body: string }>;
  relatedCities: string[];
  tags: string[];
}

export const EN_GUIDE_CATEGORIES: Record<EnGuide["category"], string> = {
  moving: "Moving to France",
  "remote-work": "Remote work",
  family: "Family",
  budget: "Budget",
  lifestyle: "Lifestyle",
};

export const EN_GUIDES: EnGuide[] = [
  {
    slug: "moving-to-france-where-to-live-2026",
    title: "Moving to France: how to actually choose where to live",
    metaTitle: "Moving to France — How to Choose Where to Live (2026)",
    metaDesc:
      "A practical, no-fluff guide to picking the right French city: climate, cost, jobs, healthcare and the trade-offs nobody mentions before you sign a lease.",
    category: "moving",
    emoji: "🧭",
    readMinutes: 9,
    publishedAt: "2026-05-20",
    updatedAt: "2026-05-20",
    intro:
      "Most people choose a French city the way they choose a holiday — they fall for a postcard. Then they discover that the postcard town has one GP for 4,000 residents, no evening trains, and a summer that now regularly tops 38 °C. This guide is the opposite of a postcard. It walks through how to weigh the factors that actually shape daily life, so the place you move to is the place you'd still choose two winters later.",
    sections: [
      {
        heading: "Start with the constraints, not the dream",
        body: "Before you look at a single city, write down your hard constraints. Do you need a job locally, or is your income remote/portable? Do you have school-age children (which ties you to the catchment of specific établissements)? Do you need an international airport within driving distance? Is a car realistic for you, financially and practically? These constraints eliminate 80% of the map instantly. A remote worker with no kids has 300 viable cities; a family needing a bilingual school and a hospital with a maternity ward has maybe 40. Knowing which group you're in saves months.",
      },
      {
        heading: "The five numbers that matter most",
        body: "For every shortlisted city, get five numbers: median T2 rent (your biggest fixed cost), GP density per 1,000 residents (the single best proxy for whether you'll get healthcare), crime rate per 1,000 (from SSMSI, not vibes), the July and January average temperatures (climate is now a 20-year decision), and the fibre coverage percentage. Every city page on this site gives you these. If a city scores badly on one of them, that's not a dealbreaker by itself — but it has to be a number you've consciously accepted, not a surprise.",
      },
      {
        heading: "Big city, mid-size city, or small town",
        body: "France's mid-size cities (100,000–300,000 residents) are the sweet spot for most newcomers, and it's not close. They have a hospital, a university, TGV access, a real cultural calendar and fibre — without the rent, crowding and commute of Paris, Lyon or Marseille. Small towns under 20,000 are wonderful if your income is portable and you genuinely like quiet; they punish you on healthcare access and transport if you don't drive. The big metros make sense mainly if your career truly requires the density. Be honest about which of these three you actually want.",
      },
      {
        heading: "Climate is now a long-term bet",
        body: "If you're buying, or planning to stay a decade, treat climate as a financial decision. The Mediterranean south is hot and getting hotter — water restrictions and 40 °C heatwaves are already routine in parts of Occitanie and PACA. The Atlantic coast and the west stay milder but wetter. The northeast has cold winters but is largely spared the worst summer extremes. None of this should stop you moving south if that's what you want — just go in with eyes open, and prioritise homes you can actually keep cool.",
      },
      {
        heading: "Visit in February, not August",
        body: "Every city is charming in August: the terraces are full, the light is golden, you're on holiday. February tells the truth. Is the city centre alive on a wet Tuesday evening, or shuttered? How grey is the sky, really? How long is the walk to a pharmacy in the cold? Are the trains running on time? Spend a normal week — not a holiday week — in your top one or two cities before you commit. It is the cheapest insurance you will ever buy.",
      },
      {
        heading: "How to use this site",
        body: "Start with the rankings if you have a clear priority (remote work, family, budget, retirement, climate). Use the city profiles to get the five key numbers. Use the comparison pages to settle a two-city shortlist. And read the relevant guides — they cover the trade-offs the score can't capture. The goal isn't to find a 'perfect' city; it doesn't exist. It's to find the city whose weaknesses you can live with and whose strengths you'll use.",
      },
    ],
    relatedCities: ["rennes", "nantes", "angers", "montpellier", "grenoble"],
    tags: ["moving to france", "relocation", "expat", "where to live"],
  },
  {
    slug: "best-french-cities-remote-work-2026",
    title: "The best French cities for remote work",
    metaTitle: "Best French Cities for Remote Work (2026)",
    metaDesc:
      "Fibre, coworking, cost of living vs salary, and the trade-offs that matter when you can live anywhere in France. An honest ranking for remote workers.",
    category: "remote-work",
    emoji: "💻",
    readMinutes: 8,
    publishedAt: "2026-05-20",
    updatedAt: "2026-05-20",
    intro:
      "Remote work rewrote the map. If your income no longer depends on a local office, the question stops being 'where are the jobs' and becomes 'where would I actually enjoy living'. France is an exceptional answer to that question — but the cities that look best on Instagram are rarely the ones that work best on a wet Wednesday with three video calls. Here's how to think about it.",
    sections: [
      {
        heading: "Fibre is table stakes — community is the differentiator",
        body: "Almost every French city of any size now has fibre; coverage above 90% is normal. So a fast connection no longer separates a good remote city from a bad one. What separates them is the things around the connection: affordable coworking (under €150/month for a fixed desk), a genuine community of other remote and tech workers, and easy rail access to wherever your main client or company is. A technically perfect city with no community is a slow path to isolation.",
      },
      {
        heading: "Rennes — the quiet favourite",
        body: "Rennes keeps winning this category and it's easy to see why. Strong fibre everywhere, an active tech scene (the French Tech label, hundreds of startups), coworking from around €80/month, and a 1h25 TGV to Paris when you do need to show your face. Median T2 rent sits well below the big metros, and the city is genuinely cyclable — which quietly removes a car from your budget. The weather is grey-ish and Atlantic, not Mediterranean. That's the price of admission.",
      },
      {
        heading: "Nantes — the balanced metropolis",
        body: "Nantes is what a well-rounded remote life looks like: a dense café culture, a real startup scene, the Atlantic coast 45 minutes away, and enough of a cultural calendar that Sunday evenings don't feel empty. It's larger and a little pricier than Rennes, with the upside of more options — more coworkings, more events, more people. If you want a city that can absorb a decade of your life without getting boring, Nantes is a strong bet.",
      },
      {
        heading: "Grenoble — for the mountain people",
        body: "Grenoble has the highest concentration of engineers and researchers in France outside Paris, which makes its tech community unusually deep. The coworking scene is excellent. And the Alps are 45 minutes away — you really can ski on a Wednesday. The honest caveats: winters feel long, and Grenoble sits in a valley prone to thermal inversions that trap air pollution. People who love it accept the air for the mountains. Decide if you're one of them.",
      },
      {
        heading: "The maths that changes lives",
        body: "Take a remote worker earning €3,500/month after tax. In Paris: a T2 at roughly €1,400 plus €200 charges plus €85 transport is about €1,685 in fixed costs. In a strong mid-size city: a T2 around €750 plus €150 charges plus €20 for a bike is about €920. The gap is roughly €765 a month — over €9,000 a year, more than €90,000 in a decade. That is, quite literally, a deposit on a flat. The calculation is mundane; doing it honestly is what's rare.",
      },
      {
        heading: "Cities that are hyped but harder than they look",
        body: "Some cities are fashionable without being genuinely remote-friendly. Bordeaux is beautiful, but gentrification pushed rents up sharply without the tech infrastructure keeping pace. Nice is expensive and its remote community clusters in a few neighbourhoods. Marseille is improving fast but connectivity and quality of life still vary a lot by district. None of these are bad — they just need more homework than their reputation suggests.",
      },
    ],
    relatedCities: ["rennes", "nantes", "grenoble", "bordeaux", "montpellier"],
    tags: ["remote work", "digital nomad", "coworking", "fibre"],
  },
  {
    slug: "best-french-cities-families-2026",
    title: "The best French cities to raise a family",
    metaTitle: "Best French Cities for Families (2026)",
    metaDesc:
      "Schools, safety, green space and housing — what actually matters when you're choosing a French city with children, and where to look first.",
    category: "family",
    emoji: "👨‍👩‍👧",
    readMinutes: 8,
    publishedAt: "2026-05-20",
    updatedAt: "2026-05-20",
    intro:
      "Choosing a city for a family is a different exercise from choosing one for yourself. Your tolerance for risk drops, your need for stability rises, and a dozen boring logistics — school catchments, paediatric care, a park within walking distance — suddenly outrank nightlife and restaurant scenes. This is a guide to getting those boring things right.",
    sections: [
      {
        heading: "Safety first, but read the actual numbers",
        body: "Safety is the axis families weigh most heavily, and rightly so. But weigh it with data, not reputation. France publishes crime statistics per 1,000 residents (SSMSI). A city's reputation often lags its real numbers by a decade in both directions — some 'rough' cities have quietly improved, some 'nice' ones have not. Use the figure on each city profile, and remember that within any city, neighbourhoods vary enormously. The city-level score is a starting point, not the final word.",
      },
      {
        heading: "How French schooling works",
        body: "A quick map for newcomers: maternelle (kindergarten, ages 3–6) is near-universal and free; école élémentaire runs 6–10; collège runs 11–14 and ends with the Brevet; lycée runs 15–17 and ends with the Baccalauréat. Public schooling is the default and is generally good. Placement is by catchment area (carte scolaire), so the specific address you choose matters — not just the city. If you need a bilingual or international section, that narrows your options to a few dozen cities; check before you fall in love with a place.",
      },
      {
        heading: "Green space and the 15-minute test",
        body: "Children need to be able to get outside without a car journey. When you shortlist a city, apply the 15-minute test: from a realistic home, can a child reach a park, a school and a sports facility within 15 minutes on foot or by bike? Mid-size French cities usually pass this comfortably; sprawling car-dependent suburbs often fail it. The 'nature' score on each city profile captures green-space access alongside air quality — both matter for kids.",
      },
      {
        heading: "Healthcare: find the maternity ward and the paediatrician",
        body: "Two healthcare questions matter most for families: is there a maternity ward (and how far), and can you actually register with a paediatrician or GP who's taking patients? France has real medical deserts — areas where GP density has fallen so low that new arrivals struggle to find a doctor at all. The healthcare-related scores on this site flag this. A beautiful town with no available GP is not a good place to raise small children.",
      },
      {
        heading: "Where to look first",
        body: "Mid-size cities in the west and along the Atlantic — think the Rennes, Nantes and Angers belt — consistently score well for families: solid schools, manageable housing costs, green space, and hospitals. University cities give teenagers a path that doesn't require leaving home. The Mediterranean cities are tempting but watch the combination of summer heat and housing cost. Use the family ranking on this site as your starting shortlist, then verify the specific neighbourhood.",
      },
      {
        heading: "The trade-off nobody admits",
        body: "The single most common family relocation regret is choosing a charming small town and underestimating how car-dependent it is. Two parents, two jobs, two children, two activities each — in a town with thin public transport, that becomes a logistics machine that eats every evening. Be ruthless about this. If you're not certain you want to organise life around a car, weight transport and walkability heavily, and lean towards cities rather than villages.",
      },
    ],
    relatedCities: ["rennes", "angers", "nantes", "la-rochelle", "annecy"],
    tags: ["family", "schools", "safety", "children"],
  },
  {
    slug: "cost-of-living-france-by-city-2026",
    title: "Cost of living in France, city by city",
    metaTitle: "Cost of Living in France by City (2026)",
    metaDesc:
      "What it really costs to live in a French city in 2026 — rent, utilities, groceries, transport — and how to find the places where your income goes furthest.",
    category: "budget",
    emoji: "💶",
    readMinutes: 7,
    publishedAt: "2026-05-20",
    updatedAt: "2026-05-20",
    intro:
      "'France is expensive' is one of those statements that's true and useless at the same time. Paris is expensive. Large parts of France are strikingly affordable by Western-European standards. The spread between the priciest and cheapest cities is enormous — and learning to read it is the difference between a stretched budget and a comfortable one.",
    sections: [
      {
        heading: "Rent is the number that decides everything",
        body: "For most people, rent is 30–50% of total spending, so it dominates the cost equation. A two-room flat (T2) that costs €1,400/month in central Paris can cost €550–800 in a perfectly pleasant mid-size city. Nothing else in your budget moves by that magnitude. When you compare cities, compare median T2 rent first — every city profile on this site lists it — and treat the rest of the budget as secondary.",
      },
      {
        heading: "What barely changes between cities",
        body: "Some costs are roughly national and won't reward you for moving. Utilities (electricity, gas, water) and internet land around €120–180/month almost everywhere. Groceries vary modestly — a little cheaper away from the big metros, a little dearer in tourist hotspots — but a single person should budget €300–450 regardless. Phone plans are cheap nationwide. Don't over-optimise these; the leverage is all in rent and transport.",
      },
      {
        heading: "The hidden cost: the car",
        body: "A car is the budget item people forget to compare. Fuel, insurance, maintenance, parking and depreciation easily add €250–400/month. A city where you genuinely don't need one — good public transport, real cycling infrastructure, shops within walking distance — can be 'more expensive' on rent and still leave you better off overall. When you compare two cities, ask honestly whether each one requires a car. It often flips the answer.",
      },
      {
        heading: "Property tax and the cost of buying",
        body: "If you buy, factor in the annual taxe foncière — a local property tax based on the cadastral value times a rate set by the commune. Rates vary widely: two towns 20 minutes apart can differ substantially. Purchase also carries notaire fees of roughly 7–8% on existing properties. None of this should deter buying; it should just be in your spreadsheet from day one, not discovered later.",
      },
      {
        heading: "Where your money goes furthest",
        body: "The best value in France today is concentrated in the mid-size cities of the north, the centre and the east — places with real amenities, hospitals and rail links, but without the rent pressure of the south and west coasts. The 'budget' and 'housing affordability' rankings on this site sort cities precisely on this. The catch is usually weather or a less famous name — rarely a lack of substance.",
      },
      {
        heading: "Build the comparison, don't guess",
        body: "Before deciding, build a simple side-by-side for your two or three finalists: median T2 rent, plus €150 utilities, plus a realistic grocery figure, plus transport (a monthly pass or the true cost of a car), plus a leisure allowance. The gap between cities is often €600–900/month — money that, redirected, becomes savings, travel, or a property deposit. The city pages and comparison tool here give you every input you need.",
      },
    ],
    relatedCities: ["limoges", "saint-etienne", "le-mans", "perpignan", "amiens"],
    tags: ["cost of living", "budget", "rent", "affordable"],
  },
  {
    slug: "leaving-paris-where-to-go-2026",
    title: "Leaving Paris: where Parisians actually move",
    metaTitle: "Leaving Paris — Where to Move in France (2026)",
    metaDesc:
      "Thinking of leaving Paris? The cities that draw the most ex-Parisians, why they work, and how to avoid swapping one set of problems for another.",
    category: "moving",
    emoji: "🚄",
    readMinutes: 8,
    publishedAt: "2026-05-20",
    updatedAt: "2026-05-20",
    intro:
      "Leaving Paris is a French national pastime and, for many, a genuinely good decision. But the move fails when it's driven purely by what you're escaping rather than what you're moving towards. A clear-eyed look at where ex-Parisians go, and why, beats a romantic one every time.",
    sections: [
      {
        heading: "Be honest about what you're leaving",
        body: "Parisians usually leave for some mix of four things: rent, commute time, crowding, and the sense that the city extracts more than it gives back. That's all valid. But notice that none of those are about what the next city offers — they're about what Paris costs. If your list of reasons is entirely negative, pause and write the positive version: what does the new place need to give you? A city chosen only as 'not-Paris' tends to disappoint.",
      },
      {
        heading: "Keep the TGV link if your work needs it",
        body: "The single best predictor of a successful Paris exit is a direct TGV line. If you'll still need to be in Paris occasionally — for work, clients, family — a city 1.5–3 hours away by direct train lets you have the lower cost of life without burning a relationship with your employer. Rennes, Nantes, Bordeaux, Lyon, Tours, Reims and Lille all qualify. A city that requires a connection or a long drive quietly makes 'popping back' a saga.",
      },
      {
        heading: "The west: Rennes, Nantes and the Atlantic belt",
        body: "The west coast corridor is the most popular destination for departing Parisians, and for good reason: strong TGV links, real economic dynamism, mid-size-city quality of life, and the Atlantic within reach. Rennes and Nantes anchor it. The honest trade-off is weather — this is oceanic France, milder but greyer and wetter than the south. Many ex-Parisians decide that's a fair price; some don't. Visit in winter to find out which you are.",
      },
      {
        heading: "The south: tempting, but do the housing maths",
        body: "Plenty of Parisians dream of swapping the métro for the Mediterranean. It can absolutely work — but the south is where the 'cheaper than Paris' assumption most often breaks. Aix-en-Provence, Nice and the desirable coastal towns carry serious housing costs, and summers are increasingly extreme. If you're set on the south, look one row inland from the postcard towns, where prices ease and the city still works year-round.",
      },
      {
        heading: "Don't skip the mid-size cities you've never considered",
        body: "Parisians tend to shortlist the same six famous cities. But Angers, Tours, Rennes's smaller neighbours, the cities of the Loire and the east — these are where the value genuinely sits: a hospital, a university, a TGV or fast TER link, a real centre, and rent that makes you recalculate your life. They lack the name recognition. That's exactly why they're not overpriced.",
      },
      {
        heading: "Give it eighteen months",
        body: "The first six months after leaving Paris are often a slump: you miss the density, the options, the friends, the late trains. This is normal and it passes. The people who regret leaving usually decided within that first dip. Give a new city eighteen months and a real social effort before you judge it. Most who do are quietly, permanently glad they left — they just don't post about it.",
      },
    ],
    relatedCities: ["rennes", "nantes", "tours", "angers", "reims"],
    tags: ["leaving paris", "relocation", "tgv", "ex-parisian"],
  },
  {
    slug: "retiring-in-france-best-cities-2026",
    title: "Retiring in France: choosing the right city",
    metaTitle: "Retiring in France — Best Cities to Choose (2026)",
    metaDesc:
      "Healthcare access, climate, calm and cost — the factors that should drive a retirement move in France, and the cities that balance them best.",
    category: "lifestyle",
    emoji: "🌅",
    readMinutes: 7,
    publishedAt: "2026-05-20",
    updatedAt: "2026-05-20",
    intro:
      "Retirement reshuffles your priorities. The commute stops mattering; the nightlife stops mattering. Healthcare, climate, calm and the cost of a fixed income move to the top of the list. Choosing a French city to retire in is largely about getting those four right — and resisting the pull of the holiday postcard.",
    sections: [
      {
        heading: "Healthcare access is the non-negotiable",
        body: "In retirement, proximity to healthcare moves from convenient to essential. The two numbers to check for any city are GP density per 1,000 residents and the distance to a hospital with the specialties you're likely to need. France has genuine medical deserts, and they are often the very rural, picturesque places retirees are drawn to. A mid-size city with a teaching hospital and a healthy supply of GPs and specialists beats a beautiful village with one overworked doctor — every time.",
      },
      {
        heading: "Climate: warmth is good, extreme heat is not",
        body: "Sunshine and mild winters are a real quality-of-life gain in retirement, which is why the south is so popular. But the calculation has shifted: parts of the Mediterranean now see summer heatwaves that are genuinely dangerous for older residents, plus water restrictions and wildfire risk. The smart move is to chase mildness without chasing extremes — the Atlantic south-west, inland Occitanie at altitude, and the milder pockets of the south-east offer warmth without the worst of the summer.",
      },
      {
        heading: "Calm without isolation",
        body: "Retirees want calm — but calm and isolation are different things, and the gap matters more with each passing year. A quiet neighbourhood in a real city keeps you near healthcare, shops, transport and social life. A remote hamlet offers silence and, eventually, a logistics problem: every appointment becomes a drive, and the day you can't drive, the silence turns into a trap. Aim for a calm street in a connected place, not the end of a country road.",
      },
      {
        heading: "Make a fixed income go further",
        body: "A pension is a fixed income, so cost of living matters more than it did when you were earning. The good news: France's mid-size cities are very affordable, and once you're settled, your big variable cost — rent or a mortgage — is stable. Watch the taxe foncière if you own, and favour cities where you can live well without a car. The 'retirement' and 'budget' rankings on this site are built around exactly this balance of cost, calm and quality of life.",
      },
      {
        heading: "Walkability is freedom",
        body: "The best gift you can give your future self is a city where daily life works on foot. Bakery, pharmacy, doctor, market, café — all within a short, flat walk — is not a small lifestyle perk; it's the infrastructure of independence in your eighties. When you assess a city for retirement, weight walkability and public transport heavily. It's the factor that determines how long you stay autonomous.",
      },
      {
        heading: "Where to start looking",
        body: "Mid-size cities with a hospital, a walkable centre and a mild-but-not-extreme climate are the core of any sensible retirement shortlist. The Atlantic south-west balances warmth and healthcare well; a number of inland southern cities offer sunshine without coastal prices; and the west's mid-size cities score consistently on calm and services. Use the retirement ranking here as your starting point, then verify the two things that matter most: a doctor taking patients, and a centre you can walk.",
      },
    ],
    relatedCities: ["pau", "la-rochelle", "angers", "perpignan", "vannes"],
    tags: ["retirement", "healthcare", "climate", "calm"],
  },
];

export function getEnGuide(slug: string): EnGuide | undefined {
  return EN_GUIDES.find((g) => g.slug === slug);
}
