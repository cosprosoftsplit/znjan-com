/**
 * Shared label maps for znjan.com
 * Extracted from duplicated inline maps across 10+ files.
 */

import type { Language } from './i18n';

type LabelMap = Record<string, Record<Language, string>>;

/** Labels for place categories (restaurant, bar, beach-club, etc.) */
export const placeCategoryLabels: LabelMap = {
  restaurant: { en: 'Restaurant', hr: 'Restoran', de: 'Restaurant', it: 'Ristorante' },
  bar: { en: 'Bar', hr: 'Bar', de: 'Bar', it: 'Bar' },
  'beach-club': { en: 'Beach Club', hr: 'Beach Club', de: 'Beach Club', it: 'Beach Club' },
  cafe: { en: 'Café', hr: 'Kafić', de: 'Café', it: 'Caffè' },
  shop: { en: 'Shop', hr: 'Trgovina', de: 'Geschäft', it: 'Negozio' },
  hotel: { en: 'Hotel', hr: 'Hotel', de: 'Hotel', it: 'Hotel' },
  other: { en: 'Other', hr: 'Ostalo', de: 'Sonstiges', it: 'Altro' },
};

/** Labels for activity categories (water-sports, beach-sports, etc.) */
export const activityCategoryLabels: LabelMap = {
  'water-sports': { en: 'Water Sports', hr: 'Vodeni sportovi', de: 'Wassersport', it: 'Sport acquatici' },
  'beach-sports': { en: 'Beach Sports', hr: 'Sportovi na plaži', de: 'Strandsport', it: 'Sport da spiaggia' },
  fitness: { en: 'Fitness', hr: 'Fitness', de: 'Fitness', it: 'Fitness' },
  relaxation: { en: 'Relaxation', hr: 'Opuštanje', de: 'Entspannung', it: 'Relax' },
  tours: { en: 'Tours', hr: 'Ture', de: 'Touren', it: 'Tour' },
  other: { en: 'Other', hr: 'Ostalo', de: 'Sonstiges', it: 'Altro' },
};

/** Labels for event categories (concert, festival, sports, etc.) */
export const eventCategoryLabels: LabelMap = {
  concert: { en: 'Concert', hr: 'Koncert', de: 'Konzert', it: 'Concerto' },
  festival: { en: 'Festival', hr: 'Festival', de: 'Festival', it: 'Festival' },
  sports: { en: 'Sports', hr: 'Sport', de: 'Sport', it: 'Sport' },
  market: { en: 'Market', hr: 'Tržnica', de: 'Markt', it: 'Mercato' },
  community: { en: 'Community', hr: 'Zajednica', de: 'Gemeinschaft', it: 'Comunità' },
  other: { en: 'Event', hr: 'Događaj', de: 'Veranstaltung', it: 'Evento' },
};

/** Labels for difficulty levels */
export const difficultyLabels: LabelMap = {
  easy: { en: 'Easy', hr: 'Lako', de: 'Leicht', it: 'Facile' },
  moderate: { en: 'Moderate', hr: 'Umjereno', de: 'Mittel', it: 'Moderato' },
  hard: { en: 'Hard', hr: 'Teško', de: 'Schwer', it: 'Difficile' },
};

/** Labels for seasons */
export const seasonLabels: LabelMap = {
  summer: { en: 'Summer only', hr: 'Samo ljeti', de: 'Nur im Sommer', it: 'Solo estate' },
  'year-round': { en: 'Year-round', hr: 'Cijele godine', de: 'Ganzjährig', it: "Tutto l'anno" },
  'spring-autumn': { en: 'Spring to Autumn', hr: 'Proljeće do jesen', de: 'Frühling bis Herbst', it: 'Primavera-Autunno' },
};

/** Labels for beach area facilities (union of all keys from index + detail pages) */
export const facilityLabels: LabelMap = {
  sunbeds: { en: 'Sunbeds', hr: 'Ležaljke', de: 'Liegen', it: 'Lettini' },
  showers: { en: 'Showers', hr: 'Tuševi', de: 'Duschen', it: 'Docce' },
  'changing-rooms': { en: 'Changing Rooms', hr: 'Svlačionice', de: 'Umkleiden', it: 'Spogliatoi' },
  lifeguard: { en: 'Lifeguard', hr: 'Spasilac', de: 'Rettungsschwimmer', it: 'Bagnino' },
  parking: { en: 'Parking', hr: 'Parking', de: 'Parkplatz', it: 'Parcheggio' },
  'wheelchair-access': { en: 'Wheelchair Access', hr: 'Pristup za kolica', de: 'Rollstuhlzugang', it: 'Accesso disabili' },
  playground: { en: 'Playground', hr: 'Igralište', de: 'Spielplatz', it: 'Parco giochi' },
  'water-slide': { en: 'Water Slide', hr: 'Tobogan', de: 'Wasserrutsche', it: "Scivolo d'acqua" },
  'baby-pool': { en: 'Baby Pool', hr: 'Dječji bazen', de: 'Babybecken', it: 'Piscina per bambini' },
  restaurants: { en: 'Restaurants', hr: 'Restorani', de: 'Restaurants', it: 'Ristoranti' },
  cafes: { en: 'Cafés', hr: 'Kafići', de: 'Cafés', it: 'Caffè' },
  'public-restrooms': { en: 'Restrooms', hr: 'Javni WC', de: 'Toiletten', it: 'Servizi igienici' },
  'volleyball-courts': { en: 'Volleyball Courts', hr: 'Tereni za odbojku', de: 'Volleyballplätze', it: 'Campi da pallavolo' },
  'basketball-courts': { en: 'Basketball Courts', hr: 'Košarkaški tereni', de: 'Basketballplätze', it: 'Campi da basket' },
  'cage-football': { en: 'Cage Football', hr: 'Kavez za nogomet', de: 'Käfig-Fußball', it: 'Calcetto in gabbia' },
  'skate-park': { en: 'Skate Park', hr: 'Skate Park', de: 'Skatepark', it: 'Skate Park' },
  'water-sports-rental': { en: 'Water Sports Rental', hr: 'Iznajmljivanje vodenih sportova', de: 'Wassersportverleih', it: 'Noleggio sport acquatici' },
  'fitness-equipment': { en: 'Fitness Equipment', hr: 'Fitness oprema', de: 'Fitnessgeräte', it: 'Attrezzi fitness' },
  'cycling-path': { en: 'Cycling Path', hr: 'Biciklistička staza', de: 'Radweg', it: 'Pista ciclabile' },
  'beach-bars': { en: 'Beach Bars', hr: 'Beach barovi', de: 'Strandbars', it: 'Bar sulla spiaggia' },
  shops: { en: 'Shops', hr: 'Trgovine', de: 'Geschäfte', it: 'Negozi' },
  amphitheater: { en: 'Amphitheater', hr: 'Amfiteatar', de: 'Amphitheater', it: 'Anfiteatro' },
  'event-space': { en: 'Event Space', hr: 'Prostor za events', de: 'Veranstaltungsort', it: 'Spazio eventi' },
  'shallow-water': { en: 'Shallow Water', hr: 'Plitka voda', de: 'Flaches Wasser', it: 'Acqua bassa' },
  benches: { en: 'Benches', hr: 'Klupe', de: 'Bänke', it: 'Panchine' },
  lighting: { en: 'Lighting', hr: 'Rasvjeta', de: 'Beleuchtung', it: 'Illuminazione' },
  seating: { en: 'Seating', hr: 'Sjedenje', de: 'Sitzplätze', it: 'Posti a sedere' },
  stage: { en: 'Stage', hr: 'Pozornica', de: 'Bühne', it: 'Palcoscenico' },
};

/** Labels for beach area activity types */
export const activityLabels: LabelMap = {
  swimming: { en: 'Swimming', hr: 'Plivanje', de: 'Schwimmen', it: 'Nuoto' },
  paddleboarding: { en: 'Paddleboarding', hr: 'SUP', de: 'Paddleboarding', it: 'Paddleboarding' },
  kayaking: { en: 'Kayaking', hr: 'Kajakaštvo', de: 'Kajakfahren', it: 'Kayak' },
  snorkeling: { en: 'Snorkeling', hr: 'Ronjenje s maskom', de: 'Schnorcheln', it: 'Snorkeling' },
  'beach-volleyball': { en: 'Beach Volleyball', hr: 'Odbojka na pijesku', de: 'Beachvolleyball', it: 'Beach Volley' },
  basketball: { en: 'Basketball', hr: 'Košarka', de: 'Basketball', it: 'Basket' },
  skateboarding: { en: 'Skateboarding', hr: 'Skateboarding', de: 'Skateboarding', it: 'Skateboard' },
  cycling: { en: 'Cycling', hr: 'Bicikliranje', de: 'Radfahren', it: 'Ciclismo' },
  concerts: { en: 'Concerts', hr: 'Koncerti', de: 'Konzerte', it: 'Concerti' },
  festivals: { en: 'Festivals', hr: 'Festivali', de: 'Festivals', it: 'Festival' },
  dining: { en: 'Dining', hr: 'Gastronomija', de: 'Gastronomie', it: 'Gastronomia' },
  shopping: { en: 'Shopping', hr: 'Kupovina', de: 'Einkaufen', it: 'Shopping' },
};

/** Labels for place tags */
export const tagLabels: LabelMap = {
  'beach-club': { en: 'Beach Club', hr: 'Beach Club', de: 'Beach Club', it: 'Beach Club' },
  'beach-bar': { en: 'Beach Bar', hr: 'Beach Bar', de: 'Strandbar', it: 'Bar sulla spiaggia' },
  cocktails: { en: 'Cocktails', hr: 'Kokteli', de: 'Cocktails', it: 'Cocktail' },
  'sea-view': { en: 'Sea View', hr: 'Pogled na more', de: 'Meerblick', it: 'Vista mare' },
  lounge: { en: 'Lounge', hr: 'Lounge', de: 'Lounge', it: 'Lounge' },
  sunset: { en: 'Sunset', hr: 'Zalazak sunca', de: 'Sonnenuntergang', it: 'Tramonto' },
  luxury: { en: 'Luxury', hr: 'Luksuz', de: 'Luxus', it: 'Lusso' },
  dj: { en: 'DJ', hr: 'DJ', de: 'DJ', it: 'DJ' },
  vip: { en: 'VIP', hr: 'VIP', de: 'VIP', it: 'VIP' },
  restaurant: { en: 'Restaurant', hr: 'Restoran', de: 'Restaurant', it: 'Ristorante' },
  italian: { en: 'Italian', hr: 'Talijanski', de: 'Italienisch', it: 'Italiano' },
  pizza: { en: 'Pizza', hr: 'Pizza', de: 'Pizza', it: 'Pizza' },
  wine: { en: 'Wine', hr: 'Vino', de: 'Wein', it: 'Vino' },
  mediterranean: { en: 'Mediterranean', hr: 'Mediteranski', de: 'Mediterran', it: 'Mediterraneo' },
  sushi: { en: 'Sushi', hr: 'Sushi', de: 'Sushi', it: 'Sushi' },
  'fine-dining': { en: 'Fine Dining', hr: 'Fine Dining', de: 'Gehobene Küche', it: 'Alta cucina' },
  breakfast: { en: 'Breakfast', hr: 'Doručak', de: 'Frühstück', it: 'Colazione' },
  'all-day-dining': { en: 'All-Day Dining', hr: 'Cijeli dan', de: 'Ganztägig', it: 'Tutto il giorno' },
  cafe: { en: 'Café', hr: 'Kafić', de: 'Café', it: 'Caffè' },
  music: { en: 'Music', hr: 'Glazba', de: 'Musik', it: 'Musica' },
  promenade: { en: 'Promenade', hr: 'Šetnica', de: 'Promenade', it: 'Lungomare' },
  waterfront: { en: 'Waterfront', hr: 'Na obali', de: 'Am Wasser', it: 'Lungomare' },
  reservations: { en: 'Reservations', hr: 'Rezervacije', de: 'Reservierungen', it: 'Prenotazioni' },
  cabanas: { en: 'Cabanas', hr: 'Kabane', de: 'Cabanas', it: 'Cabane' },
};

/** Helper to get a label with fallback */
export function getLabel(map: LabelMap, key: string, lang: Language): string {
  return map[key]?.[lang] ?? key;
}
