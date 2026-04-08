export type Sponsor = {
  name: string
  url: string
  description: string
  initials: string
  color: string
  textColor: string
  category: string
}

export const sponsors: Sponsor[] = [
  // Bike & Gear
  {
    name: 'Breakaway Bikes',
    url: 'https://www.breakawaybikes.co/',
    description: 'Refer to the Breakaway Team Benefits 2026 Season in the Documents for some amazing discounts!',
    initials: 'BB',
    color: '#047499',
    textColor: '#ffffff',
    category: 'Bike & Gear',
  },
  {
    name: 'Trek of Santa Rosa',
    url: 'https://www.trekbikes.com/us/en_US/retail/santa_rosa_downtown/',
    description: 'For current TREK/NICA benefits, refer to the Benefits Form.',
    initials: 'TR',
    color: '#1d4ed8',
    textColor: '#ffffff',
    category: 'Bike & Gear',
  },
  {
    name: 'Bike Monkey',
    url: 'https://www.bikemonkey.net/',
    description: 'Bike Monkey is a top-notch event management company. Bike Monkey supplies the team with endless water bottles, snacks and gels.',
    initials: 'BM',
    color: '#65a30d',
    textColor: '#ffffff',
    category: 'Bike & Gear',
  },

  // Technology & Finance
  {
    name: 'Sonic.',
    url: 'https://www.sonic.com/',
    description: "California's fastest internet provider and long time supporter of the A-Team.",
    initials: 'SN',
    color: '#7c3aed',
    textColor: '#ffffff',
    category: 'Technology & Finance',
  },
  {
    name: 'Caffeinated Capital',
    url: 'https://caffeinatedcapital.com/',
    description: 'We believe there are certain people in this world who are truly extraordinary. Caffeinated exists to find these rare individuals and catalyze their success.',
    initials: 'CC',
    color: '#b45309',
    textColor: '#ffffff',
    category: 'Technology & Finance',
  },
  {
    name: 'Charles Schwab',
    url: 'https://www.schwab.com/',
    description: 'Manage your wealth, your way. Invest on your own, trade with thinkorswim®, and get full-service wealth management all in one place.',
    initials: 'CS',
    color: '#2563eb',
    textColor: '#ffffff',
    category: 'Technology & Finance',
  },

  // Construction & Engineering
  {
    name: 'GMH Builders',
    url: 'https://www.gmhbuild.com/',
    description: 'GMH Builders was conceived to serve the construction management and general contracting needs of Northern California communities.',
    initials: 'GMH',
    color: '#c2410c',
    textColor: '#ffffff',
    category: 'Construction & Engineering',
  },
  {
    name: 'Annadel Builders',
    url: 'http://annadelbuildersinc.com/',
    description: 'Sonoma County Fine Home Builders specializing in finely built homes in Sonoma, Napa, Mendocino, and Marin counties.',
    initials: 'AB',
    color: '#15803d',
    textColor: '#ffffff',
    category: 'Construction & Engineering',
  },
  {
    name: 'M3 Integrated Services',
    url: 'https://www.m3-co.com/',
    description: 'Public Infrastructure Construction Experts in Northern California. A design-build construction company managing projects from conception to completion.',
    initials: 'M3',
    color: '#475569',
    textColor: '#ffffff',
    category: 'Construction & Engineering',
  },
  {
    name: 'Cinquini & Passarino',
    url: 'http://www.cinquinipassarino.com/',
    description: 'A professional land surveying firm headquartered in Santa Rosa. Founded in 1954, one of the premier firms in the Bay Area.',
    initials: 'C&P',
    color: '#4f46e5',
    textColor: '#ffffff',
    category: 'Construction & Engineering',
  },
  {
    name: '15000 Inc.',
    url: 'https://www.15000inc.com/',
    description: 'Building Information Modeling, Commissioning, Energy Modeling, Mechanical & Plumbing Design. We respond, collaborate, and take ownership.',
    initials: '15K',
    color: '#0891b2',
    textColor: '#ffffff',
    category: 'Construction & Engineering',
  },

  // Health & Wellness
  {
    name: 'Redwood Orthopedic',
    url: 'https://www.redwoodorthopaedic.com/',
    description: 'Our mission is to deliver sub-specialized orthopaedic care in a caring and friendly environment.',
    initials: 'RO',
    color: '#dc2626',
    textColor: '#ffffff',
    category: 'Health & Wellness',
  },

  // Food & Beverage
  {
    name: "Mac's Deli & Cafe",
    url: 'https://macsdeliandcafe.com/',
    description: 'Feeding Santa Rosa since 1952. Come be a part of the tradition!',
    initials: 'MD',
    color: '#ca8a04',
    textColor: '#ffffff',
    category: 'Food & Beverage',
  },
  {
    name: 'Land and Water Coffee',
    url: 'https://landandwater.coffee/',
    description: 'A specialty coffee roasting company in Santa Rosa, CA. All coffees are ethically and sustainably sourced, and meticulously roasted for balance.',
    initials: 'LW',
    color: '#78350f',
    textColor: '#ffffff',
    category: 'Food & Beverage',
  },

  // Arts & Design
  {
    name: 'Dom Chi Designs',
    url: 'https://www.domchidesigns.com/',
    description: 'Local artist and creative partner of the Annadel Composite team.',
    initials: 'DC',
    color: '#db2777',
    textColor: '#ffffff',
    category: 'Arts & Design',
  },

  // Trails & NICA
  {
    name: 'Redwood Trails Alliance',
    url: 'https://mountainbikealliance.org/',
    description: 'A highly respected organization known as a leader in the creation and stewardship of trails. Building unity among all outdoor enthusiasts through conservation and education.',
    initials: 'RTA',
    color: '#166534',
    textColor: '#ffffff',
    category: 'Trails & NICA',
  },
  {
    name: 'NorCal League',
    url: 'https://www.norcalmtb.org/',
    description: 'The Northern California Interscholastic Cycling League — our home league for racing and competition.',
    initials: 'NC',
    color: '#047499',
    textColor: '#ffffff',
    category: 'Trails & NICA',
  },
  {
    name: 'NICA PitZone',
    url: 'https://pitzone.nationalmtb.org/',
    description: 'Official NICA PitZone — the hub for race day logistics and team management.',
    initials: 'PZ',
    color: '#9a3412',
    textColor: '#ffffff',
    category: 'Trails & NICA',
  },
  {
    name: 'NICA',
    url: 'https://www.nationalmtb.org/',
    description: 'The National Interscholastic Cycling Association — building strong minds, bodies, and character through the sport of mountain biking.',
    initials: 'NICA',
    color: '#023546',
    textColor: '#ffffff',
    category: 'Trails & NICA',
  },
]

export const sponsorCategories = [
  'Bike & Gear',
  'Technology & Finance',
  'Construction & Engineering',
  'Health & Wellness',
  'Food & Beverage',
  'Arts & Design',
  'Trails & NICA',
]
