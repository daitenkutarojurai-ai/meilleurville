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
  {
    slug: "healthcare-in-france-newcomers-2026",
    title: "How healthcare works in France: a newcomer's guide",
    metaTitle: "Healthcare in France — A Newcomer's Guide (2026)",
    metaDesc:
      "How the French health system works, how to get into it, what it costs, and the one healthcare question that should shape where you choose to live.",
    category: "moving",
    emoji: "🏥",
    readMinutes: 8,
    publishedAt: "2026-05-21",
    updatedAt: "2026-05-21",
    intro:
      "France's healthcare system has a strong international reputation, and mostly it earns it. But 'good healthcare' as a national average and 'a doctor who will actually take you as a patient' in your specific town are two very different things. This guide explains how the system works, what you're entitled to, what it costs, and the question that should quietly shape where you decide to live.",
    sections: [
      {
        heading: "How the system is structured",
        body: "French healthcare runs on a reimbursement model, not a free-at-the-point-of-use one. You typically pay the doctor, and the state health insurance (Assurance Maladie, part of the Sécurité sociale) reimburses most of it afterwards via your carte Vitale. A standard GP visit costs around €30; the state covers roughly 70%, and the rest is usually picked up by a private top-up insurance called a mutuelle. So 'free healthcare' is a simplification: the system is excellent and heavily subsidised, but it expects you to hold a mutuelle and to register a regular GP, your médecin traitant.",
      },
      {
        heading: "Getting into the system as a newcomer",
        body: "If you live in France stably and legally, you can join the public system through residence-based affiliation (PUMA) — broadly, after about three months of residence. EU citizens can bridge that gap with a European Health Insurance Card; everyone else should budget for private insurance to cover the first few months, because the affiliation paperwork and the carte Vitale take time to arrive. Start the process the week you get your address. The single most common newcomer mistake is assuming coverage is instant — it is not, and the gap is exactly when an unexpected bill hurts most.",
      },
      {
        heading: "The médecin traitant and why it matters",
        body: "France runs a 'coordinated care pathway' (parcours de soins). You're expected to declare one GP as your médecin traitant, who acts as your first point of contact and refers you to specialists. Skip this step and you're still treated — but reimbursed at a lower rate, so you pay more out of pocket. Registering is a simple form signed by the doctor. The catch is finding a GP taking new patients at all, which brings us to the part of this guide that should actually influence your move.",
      },
      {
        heading: "Medical deserts are real — and often where you'd least expect",
        body: "France has genuine 'medical deserts' (déserts médicaux): areas where the density of GPs has fallen so low that newcomers struggle to register with anyone. They are not only remote mountain villages. Plenty of pretty, sought-after small towns — the kind retirees and remote workers are drawn to — have one overstretched doctor and a months-long wait for a slot. The national average hides this completely. Before you commit to a town, check GP density on its city profile here, and where possible phone a couple of local practices and ask the blunt question: are you taking new patients?",
      },
      {
        heading: "What it actually costs",
        body: "For most residents the real monthly healthcare cost is the mutuelle, typically €30–80 per person depending on age and cover, sometimes subsidised by an employer. Consultations, prescriptions and hospital stays are then largely reimbursed. People with a recognised long-term condition (affection de longue durée) get that condition's care covered at 100%. Compared with healthcare costs in the US, the UK private system, or many other countries, the total burden in France is low and, importantly, predictable — which matters enormously if you're on a fixed income.",
      },
      {
        heading: "How to factor healthcare into your city choice",
        body: "Turn healthcare into two concrete checks for every city on your shortlist. First, GP and specialist density — a city with a teaching hospital (CHU) and a healthy supply of doctors is a different proposition from a charming town with one. Second, distance to a hospital with the specialties you're realistically likely to need. The healthcare-related scores on this site surface both. A place can be beautiful, affordable and sunny, and still be the wrong choice if you can't register with a doctor — so make this a deciding factor, not an afterthought.",
      },
    ],
    relatedCities: ["montpellier", "rennes", "nantes", "grenoble", "tours"],
    tags: ["healthcare", "carte vitale", "moving to france", "medical"],
  },
  {
    slug: "renting-an-apartment-in-france-2026",
    title: "Renting an apartment in France: the dossier, the deposit, the catches",
    metaTitle: "Renting an Apartment in France (2026)",
    metaDesc:
      "How renting works in France: the dossier, the guarantor problem, furnished vs unfurnished leases, deposits, fees and the costs newcomers miss.",
    category: "moving",
    emoji: "🔑",
    readMinutes: 8,
    publishedAt: "2026-05-21",
    updatedAt: "2026-05-21",
    intro:
      "Renting in France is less a transaction than an exam. Landlords in the desirable cities can be selective, and they choose tenants on paperwork. Newcomers who understand the process land a flat in weeks; those who improvise lose months and the nicest listings. Here's how it actually works, and where the costs hide.",
    sections: [
      {
        heading: "The dossier is everything",
        body: "A French rental application is a file — the dossier — and a strong one wins the flat. Expect to provide ID, your last three payslips or proof of income, your most recent tax notice (avis d'imposition), proof of your current address and, often, your employment contract. The unwritten rule landlords apply is the 'three times rent' guideline: your monthly net income should be roughly three times the rent. Have the whole dossier scanned into a single tidy PDF before you start viewing. In a competitive city, the flat goes to whoever can hand over a complete file first, not to whoever liked it most.",
      },
      {
        heading: "The guarantor problem — and how to solve it",
        body: "Many landlords also want a garant: a guarantor, usually a French resident with strong income, who agrees to cover the rent if you can't. Newcomers rarely have one. The fix is Visale, a free state-backed guarantee scheme run by Action Logement that plays the garant role for eligible tenants — particularly useful for under-30s and people new to a job. Apply for the Visale visa before you house-hunt, so you can show it as part of your dossier. Alternatively some landlords accept private rent-guarantee insurance (GLI) instead of a personal garant.",
      },
      {
        heading: "Furnished vs unfurnished — a real decision",
        body: "France draws a sharp legal line between furnished (meublé) and unfurnished (vide) lets, and it changes your life. A furnished lease typically runs one year (nine months for students), is more flexible to leave, and costs a little more per month. An unfurnished lease runs three years, is harder for the landlord to end, and is usually cheaper — but you arrive with nothing, down to the light fittings. If you're testing a city, rent furnished. If you're settling, unfurnished almost always wins on cost and stability.",
      },
      {
        heading: "Deposit, fees and what's actually legal",
        body: "The security deposit (dépôt de garantie) is capped: one month's rent excluding charges for an unfurnished let, two months for a furnished one. Agency fees charged to the tenant are also capped by law and scale with the property's size and location — and crucially, if you rent directly from an owner with no agency involved, there are no agency fees at all. Know these limits: they protect you from being overcharged, and a landlord asking for a six-month deposit is a landlord to walk away from.",
      },
      {
        heading: "Charges, taxes and the real monthly cost",
        body: "Headline rent is not your real cost. On top sits charges — a monthly provision for building upkeep, sometimes water and heating — often €30–200 depending on the building. The good news for renters: the taxe d'habitation on a main residence has been abolished, so as a primary-residence tenant you no longer pay it. Energy is the variable to watch: an old, poorly insulated flat with electric heating can cost far more to run than a slightly dearer but efficient one. Always ask for the DPE energy rating before signing.",
      },
      {
        heading: "Practical tips for newcomers",
        body: "Move fast: good flats in Rennes, Lyon, Nantes or Montpellier are gone within days. View in person where you can — photos flatter, and a winter visit reveals damp, noise and the real walk to the métro. Read the DPE: anything rated F or G will be cold and expensive, and the worst ratings are being phased out of the rental market entirely. And once you're in, apply for the CAF housing benefit (APL) — it's income-tested, available to many renters including students, and quietly takes a real bite out of the monthly cost.",
      },
    ],
    relatedCities: ["lyon", "nantes", "rennes", "montpellier", "lille"],
    tags: ["renting", "apartment", "lease", "dossier"],
  },
  {
    slug: "warmest-sunniest-cities-france-2026",
    title: "The warmest and sunniest cities in France",
    metaTitle: "Warmest & Sunniest Cities in France (2026)",
    metaDesc:
      "Where the sun and warmth really are in France, the heat trade-offs nobody mentions, and how to pick your spot on the warmth spectrum.",
    category: "lifestyle",
    emoji: "☀️",
    readMinutes: 7,
    publishedAt: "2026-05-21",
    updatedAt: "2026-05-21",
    intro:
      "Plenty of people move to France chasing sun, and France has plenty to give. But 'warm' has become a more complicated wish than it used to be: the sunniest corners of the country are also the ones where summer is turning genuinely harsh. This guide maps where the warmth and light actually are — and what comes attached.",
    sections: [
      {
        heading: "Where the sun actually is",
        body: "The undisputed sun belt is the Mediterranean arc: the coast and near-inland of Provence-Alpes-Côte d'Azur and eastern Occitanie. Cities like Marseille, Toulon, Nice and Perpignan record well over 2,500 hours of sunshine a year — among the highest in mainland France — with hot, dry summers and mild winters. If raw sunshine hours are your single priority, this strip is the answer, and nowhere else in the country really competes with it.",
      },
      {
        heading: "Warm but calmer — the inland south",
        body: "Step a row inland from the coast and you keep most of the sun while easing the crowds and the coastal prices. Aix-en-Provence and the inland cities of Occitanie still get long, bright summers and gentle winters, with a bit more day-night temperature swing than the coast. For many people this is the sweet spot: a southern climate and a southern light, without paying a seafront premium or queuing behind the entire country's holidaymakers every August.",
      },
      {
        heading: "The Atlantic south-west: mild more than scorching",
        body: "If you want warmth without the Mediterranean's increasingly brutal summers, look to the Atlantic south-west — Pau, Bayonne, the Basque coast, up towards La Rochelle. Winters are mild, summers are warm rather than punishing, and the ocean keeps the worst heat off. The price is more cloud and more rain than the Med, and the famous Basque-coast greenery exists for a reason. For heat-sensitive people, and especially for older residents, this milder version of 'warm' is often the smarter long-term bet.",
      },
      {
        heading: "The heat trade-off nobody puts on the postcard",
        body: "Here's the part the sunshine brochures skip. The same Mediterranean cities that top the sunshine table now also lead the heatwave table. Summer spells above 38–40 °C are no longer rare; tropical nights that never drop below 20 °C make sleep hard; and the region routinely faces water restrictions and elevated wildfire risk. None of this means 'don't move south'. It means move south with open eyes — and prioritise a home you can actually keep cool, with shade, insulation and ideally not a top-floor sun-trap.",
      },
      {
        heading: "Sunniest is not the same as best",
        body: "It's worth saying plainly: the sunniest cities are not automatically the best places to live, and treating sunshine as the only axis is how people end up disappointed. The Mediterranean coast is also where housing is most expensive, summer crowding most intense, and water stress most acute. A city two notches less sunny but cheaper, calmer and easier to live in year-round can deliver more actual quality of life. Sunshine is one ingredient, not the whole recipe.",
      },
      {
        heading: "How to choose your spot on the warmth spectrum",
        body: "Be honest about your own heat tolerance, because it's the deciding variable. If you genuinely thrive in intense heat and have the budget for a well-built, coolable home, the Mediterranean arc will make you happy. If you want warmth and light but find 40 °C miserable — or you're choosing for the next twenty years and the next decade of climate matters — the inland south or the Atlantic south-west give you most of the upside with far less of the risk. Use the climate figures on each city profile to place your shortlist precisely.",
      },
    ],
    relatedCities: ["marseille", "nice", "perpignan", "aix-en-provence", "pau"],
    tags: ["climate", "warm", "sunshine", "mediterranean"],
  },
  {
    slug: "best-french-cities-for-students-2026",
    title: "The best French cities for students",
    metaTitle: "Best French Cities for Students (2026)",
    metaDesc:
      "Where to study in France on a real budget: the cities that balance affordable rent, student life and good universities, plus the aid you should claim.",
    category: "budget",
    emoji: "🎓",
    readMinutes: 7,
    publishedAt: "2026-05-21",
    updatedAt: "2026-05-21",
    intro:
      "France is one of the most affordable countries in Europe to be a student — public university tuition is famously low — but where you study changes the experience far more than which course you pick. The gap between a well-chosen student city and a badly chosen one is measured in hundreds of euros a month and in whether you actually have a social life.",
    sections: [
      {
        heading: "Rent is the student budget",
        body: "Tuition at French public universities is low, so the real cost of being a student is housing. There are three routes. CROUS student residences are the cheapest by far but heavily oversubscribed — apply early and have a backup. A private studio is the most independent but the most expensive option. A colocation (flatshare) usually lands in between and is, for most students, the best mix of cost and company. Whichever route you take, the city you pick sets the price floor — and that's where the leverage is.",
      },
      {
        heading: "The cities that give the most for the least",
        body: "Avoid the instinct to default to Paris. Paris rent will dominate a student budget and leave little for anything else. France's mid-size university cities deliver the same low tuition, comparable degrees, and a fraction of the housing cost. A studio that costs a small fortune in central Paris can cost less than half that in a lively, well-equipped university city elsewhere — and the saved money is the difference between scraping by and actually enjoying the years.",
      },
      {
        heading: "The classic student cities",
        body: "A few cities have a deserved reputation as great places to be a student. Toulouse and Montpellier are large, young, sunny and packed with students, with a social scene that runs all year. Rennes is a compact, genuinely student-shaped city in the west — affordable, walkable, lively. Grenoble pairs strong science and engineering faculties with the Alps on the doorstep. Lille is big, warm-spirited and famous for its student nightlife. Each has a real university ecosystem, not just a campus bolted onto a town.",
      },
      {
        heading: "Student life beyond the lecture hall",
        body: "A degree is three to five years of your life, so weigh the things that fill the evenings and weekends. Is the city walkable and cyclable, so you don't need a car? Is there a real cultural calendar, cheap cinema, sport, a music scene? Is the student population big enough that you'll find your people? Mid-size cities with a large student share tend to win here precisely because students set the rhythm of the place — cheap eats, late venues and events are built around them.",
      },
      {
        heading: "The aid you should actually claim",
        body: "Do not leave money on the table. The CAF housing benefit (APL) is income-tested and available to many students, including international ones, and it meaningfully cuts monthly rent — apply as soon as you have a lease. A student card unlocks reduced rates on transport, museums, cinemas and more. CROUS canteens serve subsidised meals at a low fixed price. Stacked together, these supports change the budget maths enough that they should factor into your planning from the start, not be discovered halfway through the year.",
      },
      {
        heading: "How to shortlist",
        body: "Build your shortlist from two lists and overlap them: the cities that offer your course at a university you'd be happy at, and the cities that score well for budget and student life on this site. Where those overlap is your real list. Then check median rent for a studio or a room, confirm CROUS availability, and — if you can — visit. A weekend in term-time tells you in an afternoon whether a city feels like somewhere you'd want to spend the next few years.",
      },
    ],
    relatedCities: ["toulouse", "montpellier", "rennes", "grenoble", "lille"],
    tags: ["students", "university", "budget", "crous"],
  },
  {
    slug: "best-coastal-cities-france-2026",
    title: "Living by the sea: the best coastal cities in France",
    metaTitle: "Best Coastal Cities in France (2026)",
    metaDesc:
      "France's three coasts compared for full-time living: Atlantic, Mediterranean and Channel, the seasonal-town trap, and what living by the sea really costs.",
    category: "lifestyle",
    emoji: "🌊",
    readMinutes: 8,
    publishedAt: "2026-05-21",
    updatedAt: "2026-05-21",
    intro:
      "Living by the sea is a near-universal daydream, and France has three very different coasts to make it real. But a coast you'd love for a fortnight in July is not always a coast you'd love in February, and the gap between holiday and home is exactly where coastal moves go wrong. Here's how the three coastlines compare for a full-time life.",
    sections: [
      {
        heading: "Three coasts, three different lives",
        body: "France's coastlines are not interchangeable. The Atlantic coast is wild, green and weather-driven — big skies, real surf, mild but wet. The Mediterranean is the postcard: hot, bright, dry summers, and the highest prices and crowds in the country. The Channel coast in the north is cooler, far cheaper, and quietly underrated. Before you fix on 'a coastal city', decide which of these three climates and rhythms you actually want, because the choice shapes everything from your heating bill to your social calendar.",
      },
      {
        heading: "The Atlantic: room to breathe",
        body: "The Atlantic coast is the strongest all-rounder for living, not just holidaying. La Rochelle is the standout — a genuine year-round city, walkable, cyclable, with a real economy and not merely a seafront. Further south, the Basque coast around Bayonne and Biarritz blends ocean, mountains and a strong local identity. The honest trade-off is the weather: this is oceanic France, mild but grey and wet for chunks of the year. People who love the Atlantic accept the rain as the price of the space and the light.",
      },
      {
        heading: "The Mediterranean: sun, but do the maths",
        body: "The Med coast delivers exactly what it promises — heat, light, that particular blue — and the whole country knows it, which is the problem. Housing along the desirable stretch is among the most expensive in France, summer crowding is intense, and the climate pressures (heatwaves, water restrictions, wildfire risk) are sharpest here. It can absolutely be a wonderful place to live; just go in knowing you're paying a premium for a coast that's busiest exactly when it's hottest. Looking slightly inland often buys back a lot of value.",
      },
      {
        heading: "The Channel coast: the underrated option",
        body: "The northern coast — Normandy and the Hauts-de-France shoreline — gets unfairly overlooked. It's cooler and greyer, yes, but it's also dramatically more affordable, well connected by rail, and within easy reach of both Paris and the UK. Cities like Le Havre and Cherbourg, and the coast around Caen and Brest on the western edge, offer a real maritime life at a fraction of the southern price. If your dream is the sea rather than specifically the sun, this coast deserves a serious look.",
      },
      {
        heading: "The seasonal-town trap",
        body: "The single biggest mistake in a coastal move is choosing a resort town rather than a coastal city. Many gorgeous seaside spots are built around summer: in July they hum, and in January the restaurants are shuttered, the population collapses, and the nearest open pharmacy is a drive away. A coastal city — somewhere with a year-round economy, a hospital, schools and a population that doesn't evaporate after August — gives you the sea without the winter ghost-town. Always visit your shortlist in the off-season.",
      },
      {
        heading: "What living by the sea really costs",
        body: "Coastal living carries some specific costs worth pricing in. Sea air is hard on buildings, cars and outdoor everything — maintenance is higher. Property near the water commands a premium almost everywhere, and a true sea view commands a steep one. On exposed coasts, factor in wind, and increasingly, check coastal-erosion and flood-risk maps before you buy. None of this should kill the dream — it should just be in the spreadsheet, so the sea stays a joy rather than becoming a slow, salty surprise.",
      },
    ],
    relatedCities: ["la-rochelle", "biarritz", "brest", "nice", "caen"],
    tags: ["coastal", "sea", "atlantic", "mediterranean"],
  },
];

export function getEnGuide(slug: string): EnGuide | undefined {
  return EN_GUIDES.find((g) => g.slug === slug);
}
