// National Geographic's "Best of the World 2026" — 25 destinations,
// published Oct/Nov 2025. Names and locations are factual and verified
// against the actual published list; descriptions below are written in
// our own words, not copied from National Geographic's article, per
// standard copyright practice. This is static editorial content, not
// TripNest's own data — it doesn't come from the database, and clicking
// through leads to a destination page built from OUR real listings/
// hotels/restaurants/reviews for that location, not National Geographic
// content.
export interface NatGeoDestination {
  slug: string;
  name: string;
  location: string;
  blurb: string;
  imageUrl: string;
}

export const NAT_GEO_SOURCE_URL =
  "https://www.nationalgeographic.com/travel/article/best-of-the-world-2026";

export const natGeoDestinations: NatGeoDestination[] = [
  {
    slug: "dolomites-italy",
    name: "The Dolomites",
    location: "Italy",
    blurb: "Jagged limestone peaks and alpine trails in the Italian Alps.",
    imageUrl:
      "https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "vancouver-canada",
    name: "Vancouver",
    location: "British Columbia, Canada",
    blurb: "A coastal city where rainforest, mountains, and skyline meet.",
    imageUrl:
      "https://images.unsplash.com/photo-1560814304-4f05b62af116?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "beijing-china",
    name: "Beijing",
    location: "China",
    blurb: "Imperial history and a fast-modernizing capital side by side.",
    imageUrl:
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "rabat-morocco",
    name: "Rabat",
    location: "Morocco",
    blurb: "A quieter, walkable capital with medina charm and Atlantic coast.",
    imageUrl:
      "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "hull-england",
    name: "Hull",
    location: "Yorkshire, England",
    blurb: "A revitalized port city with a growing arts and culture scene.",
    imageUrl:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "manila-philippines",
    name: "Manila",
    location: "Philippines",
    blurb: "A dense, food-forward capital on Manila Bay.",
    imageUrl:
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "akagera-rwanda",
    name: "Akagera National Park",
    location: "Rwanda",
    blurb: "Savanna wildlife and a major conservation success story.",
    imageUrl:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "oulu-finland",
    name: "Oulu",
    location: "Finland",
    blurb: "A bike-friendly Arctic Circle city with northern lights.",
    imageUrl:
      "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "route-66-oklahoma",
    name: "Route 66",
    location: "Oklahoma, USA",
    blurb: "The classic American road trip through small-town roadside history.",
    imageUrl:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "oaxaca-coast-mexico",
    name: "Coastal Oaxaca",
    location: "Mexico",
    blurb: "Laid-back surf towns along Mexico's Costa Chica.",
    imageUrl:
      "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "medellin-colombia",
    name: "Medellín",
    location: "Colombia",
    blurb: "A once-troubled city reinvented around innovation and green space.",
    imageUrl:
      "https://images.unsplash.com/photo-1583531352515-8884af319dc1?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "north-dakota-badlands",
    name: "North Dakota Badlands",
    location: "USA",
    blurb: "Dramatic eroded terrain and Theodore Roosevelt National Park.",
    imageUrl:
      "https://images.unsplash.com/photo-1527489377706-5bf97e608852?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "pittsburgh-usa",
    name: "Pittsburgh",
    location: "Pennsylvania, USA",
    blurb: "A former steel city turned tech and culture hub of three rivers.",
    imageUrl:
      "https://images.unsplash.com/photo-1577086664693-894d8405334a?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "quebec-canada",
    name: "Québec",
    location: "Canada",
    blurb: "Fortified old-world streets and French-Canadian culture.",
    imageUrl:
      "https://images.unsplash.com/photo-1519178614-68673b201f36?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "rio-de-janeiro-brazil",
    name: "Rio de Janeiro",
    location: "Brazil",
    blurb: "Mountains, beaches, and Carnival energy on Guanabara Bay.",
    imageUrl:
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "dongseo-trail-south-korea",
    name: "Dongseo Trail",
    location: "South Korea",
    blurb: "A new coast-to-coast hiking route across the Korean peninsula.",
    imageUrl:
      "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "uluru-australia",
    name: "Uluru-Kata Tjuta",
    location: "Australia",
    blurb: "Sacred red-desert monoliths at the heart of the Outback.",
    imageUrl:
      "https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "yamagata-japan",
    name: "Yamagata",
    location: "Japan",
    blurb: "Mountain onsen towns and dramatic seasonal landscapes.",
    imageUrl:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "dominica",
    name: "Dominica",
    location: "Caribbean",
    blurb: "The Caribbean's \"Nature Island\" — rainforest over beaches.",
    imageUrl:
      "https://images.unsplash.com/photo-1580541631950-7282082b53ce?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "basque-country-spain",
    name: "Basque Country",
    location: "Spain",
    blurb: "A distinct culture, coastline, and some of Europe's best food.",
    imageUrl:
      "https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "black-sea-coast-turkiye",
    name: "Black Sea Coast",
    location: "Türkiye",
    blurb: "Misty green mountains meeting the sea, away from the usual coast.",
    imageUrl:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "fiji",
    name: "Fiji",
    location: "South Pacific",
    blurb: "Coral reefs and island culture across 300-plus islands.",
    imageUrl:
      "https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "guimaraes-portugal",
    name: "Guimarães",
    location: "Portugal",
    blurb: "The medieval birthplace of Portugal, remarkably well preserved.",
    imageUrl:
      "https://images.unsplash.com/photo-1555881981-8db5efbd1c22?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "khiva-uzbekistan",
    name: "Khiva",
    location: "Uzbekistan",
    blurb: "A walled Silk Road city frozen in mudbrick and tilework.",
    imageUrl:
      "https://images.unsplash.com/photo-1596386461350-326ccb383e9f?auto=format&fit=crop&w=900&q=80"
  },
  {
    slug: "maui-usa",
    name: "Maui",
    location: "Hawaii, USA",
    blurb: "Volcanic coastline and rainforest valleys in the Hawaiian Islands.",
    imageUrl:
      "https://images.unsplash.com/photo-1542259009477-d625272157b7?auto=format&fit=crop&w=900&q=80"
  }
];
