/**
 * Shared label maps for znjan.com
 * Extracted from duplicated inline maps across 10+ files.
 */

import type { Language } from './i18n';

// Core languages carry full labels; fr/es/pl/nl are filled in incrementally
// (callers access via optional chaining with an English/key fallback).
type LabelMap = Record<string, Partial<Record<Language, string>>>;

/** Labels for place categories (restaurant, bar, beach-club, etc.) */
export const placeCategoryLabels: LabelMap = {
  restaurant: { en: 'Restaurant', hr: 'Restoran', de: 'Restaurant', it: 'Ristorante', fr: 'Restaurant', es: 'Restaurante', pl: 'Restauracja', nl: 'Restaurant' },
  bar: { en: 'Bar', hr: 'Bar', de: 'Bar', it: 'Bar', fr: 'Bar', es: 'Bar', pl: 'Bar', nl: 'Bar' },
  'beach-club': { en: 'Beach Club', hr: 'Beach Club', de: 'Beach Club', it: 'Beach Club', fr: 'Beach club', es: 'Club de playa', pl: 'Klub plażowy', nl: 'Beachclub' },
  cafe: { en: 'Café', hr: 'Kafić', de: 'Café', it: 'Caffè', fr: 'Café', es: 'Cafetería', pl: 'Kawiarnia', nl: 'Café' },
  shop: { en: 'Shop', hr: 'Trgovina', de: 'Geschäft', it: 'Negozio', fr: 'Boutique', es: 'Tienda', pl: 'Sklep', nl: 'Winkel' },
  hotel: { en: 'Hotel', hr: 'Hotel', de: 'Hotel', it: 'Hotel', fr: 'Hôtel', es: 'Hotel', pl: 'Hotel', nl: 'Hotel' },
  other: { en: 'Other', hr: 'Ostalo', de: 'Sonstiges', it: 'Altro', fr: 'Autre', es: 'Otro', pl: 'Inne', nl: 'Overig' },
};

/** Labels for activity categories (water-sports, beach-sports, etc.) */
export const activityCategoryLabels: LabelMap = {
  'water-sports': { en: 'Water Sports', hr: 'Vodeni sportovi', de: 'Wassersport', it: 'Sport acquatici', fr: 'Sports nautiques', es: 'Deportes acuáticos', pl: 'Sporty wodne', nl: 'Watersport' },
  'beach-sports': { en: 'Beach Sports', hr: 'Sportovi na plaži', de: 'Strandsport', it: 'Sport da spiaggia', fr: 'Sports de plage', es: 'Deportes de playa', pl: 'Sporty plażowe', nl: 'Strandsport' },
  fitness: { en: 'Fitness', hr: 'Fitness', de: 'Fitness', it: 'Fitness', fr: 'Fitness', es: 'Fitness', pl: 'Fitness', nl: 'Fitness' },
  relaxation: { en: 'Relaxation', hr: 'Opuštanje', de: 'Entspannung', it: 'Relax', fr: 'Détente', es: 'Relajación', pl: 'Relaks', nl: 'Ontspanning' },
  tours: { en: 'Tours', hr: 'Ture', de: 'Touren', it: 'Tour', fr: 'Excursions', es: 'Excursiones', pl: 'Wycieczki', nl: 'Tochten' },
  other: { en: 'Other', hr: 'Ostalo', de: 'Sonstiges', it: 'Altro', fr: 'Autre', es: 'Otro', pl: 'Inne', nl: 'Overig' },
};

/** Labels for event categories (concert, festival, sports, etc.) */
export const eventCategoryLabels: LabelMap = {
  concert: { en: 'Concert', hr: 'Koncert', de: 'Konzert', it: 'Concerto', fr: 'Concert', es: 'Concierto', pl: 'Koncert', nl: 'Concert' },
  festival: { en: 'Festival', hr: 'Festival', de: 'Festival', it: 'Festival', fr: 'Festival', es: 'Festival', pl: 'Festiwal', nl: 'Festival' },
  sports: { en: 'Sports', hr: 'Sport', de: 'Sport', it: 'Sport', fr: 'Sport', es: 'Deportes', pl: 'Sport', nl: 'Sport' },
  market: { en: 'Market', hr: 'Tržnica', de: 'Markt', it: 'Mercato', fr: 'Marché', es: 'Mercado', pl: 'Targ', nl: 'Markt' },
  community: { en: 'Community', hr: 'Zajednica', de: 'Gemeinschaft', it: 'Comunità', fr: 'Communauté', es: 'Comunidad', pl: 'Społeczność', nl: 'Gemeenschap' },
  other: { en: 'Event', hr: 'Događaj', de: 'Veranstaltung', it: 'Evento', fr: 'Événement', es: 'Evento', pl: 'Wydarzenie', nl: 'Evenement' },
};

/** Labels for difficulty levels */
export const difficultyLabels: LabelMap = {
  easy: { en: 'Easy', hr: 'Lako', de: 'Leicht', it: 'Facile', fr: 'Facile', es: 'Fácil', pl: 'Łatwy', nl: 'Makkelijk' },
  moderate: { en: 'Moderate', hr: 'Umjereno', de: 'Mittel', it: 'Moderato', fr: 'Modéré', es: 'Moderado', pl: 'Średni', nl: 'Gemiddeld' },
  hard: { en: 'Hard', hr: 'Teško', de: 'Schwer', it: 'Difficile', fr: 'Difficile', es: 'Difícil', pl: 'Trudny', nl: 'Moeilijk' },
};

/** Labels for seasons */
export const seasonLabels: LabelMap = {
  summer: { en: 'Summer only', hr: 'Samo ljeti', de: 'Nur im Sommer', it: 'Solo estate', fr: "En été uniquement", es: 'Solo en verano', pl: 'Tylko latem', nl: 'Alleen in de zomer' },
  'year-round': { en: 'Year-round', hr: 'Cijele godine', de: 'Ganzjährig', it: "Tutto l'anno", fr: "Toute l'année", es: 'Todo el año', pl: 'Cały rok', nl: 'Het hele jaar' },
  'spring-autumn': { en: 'Spring to Autumn', hr: 'Proljeće do jesen', de: 'Frühling bis Herbst', it: 'Primavera-Autunno', fr: "Du printemps à l'automne", es: 'De primavera a otoño', pl: 'Od wiosny do jesieni', nl: 'Lente tot herfst' },
};

/** Labels for beach area facilities (union of all keys from index + detail pages) */
export const facilityLabels: LabelMap = {
  sunbeds: { en: 'Sunbeds', hr: 'Ležaljke', de: 'Liegen', it: 'Lettini', fr: 'Transats', es: 'Tumbonas', pl: 'Leżaki', nl: 'Ligbedden' },
  showers: { en: 'Showers', hr: 'Tuševi', de: 'Duschen', it: 'Docce', fr: 'Douches', es: 'Duchas', pl: 'Prysznice', nl: 'Douches' },
  'changing-rooms': { en: 'Changing Rooms', hr: 'Svlačionice', de: 'Umkleiden', it: 'Spogliatoi', fr: 'Vestiaires', es: 'Vestuarios', pl: 'Przebieralnie', nl: 'Kleedkamers' },
  lifeguard: { en: 'Lifeguard', hr: 'Spasilac', de: 'Rettungsschwimmer', it: 'Bagnino', fr: 'Maître-nageur', es: 'Socorrista', pl: 'Ratownik', nl: 'Strandwacht' },
  parking: { en: 'Parking', hr: 'Parking', de: 'Parkplatz', it: 'Parcheggio', fr: 'Parking', es: 'Aparcamiento', pl: 'Parking', nl: 'Parkeren' },
  'wheelchair-access': { en: 'Wheelchair Access', hr: 'Pristup za kolica', de: 'Rollstuhlzugang', it: 'Accesso disabili', fr: 'Accès handicapés', es: 'Acceso para sillas de ruedas', pl: 'Dostęp dla wózków', nl: 'Rolstoeltoegankelijk' },
  playground: { en: 'Playground', hr: 'Igralište', de: 'Spielplatz', it: 'Parco giochi', fr: 'Aire de jeux', es: 'Parque infantil', pl: 'Plac zabaw', nl: 'Speeltuin' },
  'water-slide': { en: 'Water Slide', hr: 'Tobogan', de: 'Wasserrutsche', it: "Scivolo d'acqua", fr: 'Toboggan aquatique', es: 'Tobogán acuático', pl: 'Zjeżdżalnia wodna', nl: 'Waterglijbaan' },
  'baby-pool': { en: 'Baby Pool', hr: 'Dječji bazen', de: 'Babybecken', it: 'Piscina per bambini', fr: 'Pataugeoire', es: 'Piscina para bebés', pl: 'Brodzik', nl: 'Kinderbad' },
  restaurants: { en: 'Restaurants', hr: 'Restorani', de: 'Restaurants', it: 'Ristoranti', fr: 'Restaurants', es: 'Restaurantes', pl: 'Restauracje', nl: 'Restaurants' },
  cafes: { en: 'Cafés', hr: 'Kafići', de: 'Cafés', it: 'Caffè', fr: 'Cafés', es: 'Cafeterías', pl: 'Kawiarnie', nl: 'Cafés' },
  'public-restrooms': { en: 'Restrooms', hr: 'Javni WC', de: 'Toiletten', it: 'Servizi igienici', fr: 'Toilettes', es: 'Aseos', pl: 'Toalety', nl: 'Toiletten' },
  'volleyball-courts': { en: 'Volleyball Courts', hr: 'Tereni za odbojku', de: 'Volleyballplätze', it: 'Campi da pallavolo', fr: 'Terrains de volley', es: 'Pistas de voleibol', pl: 'Boiska do siatkówki', nl: 'Volleybalvelden' },
  'tennis-court': { en: 'Tennis Court', hr: 'Teniski teren', de: 'Tennisplatz', it: 'Campo da tennis', fr: 'Court de tennis', es: 'Pista de tenis', pl: 'Kort tenisowy', nl: 'Tennisbaan' },
  'basketball-courts': { en: 'Basketball Courts', hr: 'Košarkaški tereni', de: 'Basketballplätze', it: 'Campi da basket', fr: 'Terrains de basket', es: 'Canchas de baloncesto', pl: 'Boiska do koszykówki', nl: 'Basketbalvelden' },
  'cage-football': { en: 'Cage Football', hr: 'Kavez za nogomet', de: 'Käfig-Fußball', it: 'Calcetto in gabbia', fr: 'Football en cage', es: 'Fútbol en jaula', pl: 'Piłka nożna w klatce', nl: 'Kooivoetbal' },
  'skate-park': { en: 'Skate Park', hr: 'Skate Park', de: 'Skatepark', it: 'Skate Park', fr: 'Skatepark', es: 'Skatepark', pl: 'Skatepark', nl: 'Skatepark' },
  'water-sports-rental': { en: 'Water Sports', hr: 'Vodeni sportovi', de: 'Wassersport', it: 'Sport acquatici', fr: 'Sports nautiques', es: 'Deportes acuáticos', pl: 'Sporty wodne', nl: 'Watersport' },
  'fitness-equipment': { en: 'Fitness Equipment', hr: 'Fitness oprema', de: 'Fitnessgeräte', it: 'Attrezzi fitness', fr: 'Équipement de fitness', es: 'Equipo de fitness', pl: 'Sprzęt do fitnessu', nl: 'Fitnessapparatuur' },
  'cycling-path': { en: 'Cycling Path', hr: 'Biciklistička staza', de: 'Radweg', it: 'Pista ciclabile', fr: 'Piste cyclable', es: 'Carril bici', pl: 'Ścieżka rowerowa', nl: 'Fietspad' },
  'beach-bars': { en: 'Beach Bars', hr: 'Beach barovi', de: 'Strandbars', it: 'Bar sulla spiaggia', fr: 'Bars de plage', es: 'Bares de playa', pl: 'Bary plażowe', nl: 'Strandbars' },
  shops: { en: 'Shops', hr: 'Trgovine', de: 'Geschäfte', it: 'Negozi', fr: 'Boutiques', es: 'Tiendas', pl: 'Sklepy', nl: 'Winkels' },
  amphitheater: { en: 'Amphitheater', hr: 'Amfiteatar', de: 'Amphitheater', it: 'Anfiteatro', fr: 'Amphithéâtre', es: 'Anfiteatro', pl: 'Amfiteatr', nl: 'Amfitheater' },
  'event-space': { en: 'Event Space', hr: 'Prostor za events', de: 'Veranstaltungsort', it: 'Spazio eventi', fr: "Espace événementiel", es: 'Espacio para eventos', pl: 'Przestrzeń eventowa', nl: 'Evenementenruimte' },
  'shallow-water': { en: 'Shallow Water', hr: 'Plitka voda', de: 'Flaches Wasser', it: 'Acqua bassa', fr: 'Eau peu profonde', es: 'Aguas poco profundas', pl: 'Płytka woda', nl: 'Ondiep water' },
  benches: { en: 'Benches', hr: 'Klupe', de: 'Bänke', it: 'Panchine', fr: 'Bancs', es: 'Bancos', pl: 'Ławki', nl: 'Banken' },
  lighting: { en: 'Lighting', hr: 'Rasvjeta', de: 'Beleuchtung', it: 'Illuminazione', fr: 'Éclairage', es: 'Iluminación', pl: 'Oświetlenie', nl: 'Verlichting' },
  seating: { en: 'Seating', hr: 'Sjedenje', de: 'Sitzplätze', it: 'Posti a sedere', fr: 'Places assises', es: 'Asientos', pl: 'Miejsca siedzące', nl: 'Zitplaatsen' },
  stage: { en: 'Stage', hr: 'Pozornica', de: 'Bühne', it: 'Palcoscenico', fr: 'Scène', es: 'Escenario', pl: 'Scena', nl: 'Podium' },
};

/** Labels for beach area activity types */
export const activityLabels: LabelMap = {
  swimming: { en: 'Swimming', hr: 'Plivanje', de: 'Schwimmen', it: 'Nuoto', fr: 'Baignade', es: 'Natación', pl: 'Pływanie', nl: 'Zwemmen' },
  paddleboarding: { en: 'Paddleboarding', hr: 'SUP', de: 'Paddleboarding', it: 'Paddleboarding', fr: 'Paddleboard', es: 'Paddle surf', pl: 'Paddleboarding', nl: 'Paddleboarden' },
  kayaking: { en: 'Kayaking', hr: 'Kajakaštvo', de: 'Kajakfahren', it: 'Kayak', fr: 'Kayak', es: 'Kayak', pl: 'Kajakarstwo', nl: 'Kajakken' },
  snorkeling: { en: 'Snorkeling', hr: 'Ronjenje s maskom', de: 'Schnorcheln', it: 'Snorkeling', fr: 'Snorkeling', es: 'Esnórquel', pl: 'Snorkeling', nl: 'Snorkelen' },
  'beach-volleyball': { en: 'Beach Volleyball', hr: 'Odbojka na pijesku', de: 'Beachvolleyball', it: 'Beach Volley', fr: 'Beach-volley', es: 'Vóley playa', pl: 'Siatkówka plażowa', nl: 'Beachvolleybal' },
  tennis: { en: 'Tennis', hr: 'Tenis', de: 'Tennis', it: 'Tennis', fr: 'Tennis', es: 'Tenis', pl: 'Tenis', nl: 'Tennis' },
  basketball: { en: 'Basketball', hr: 'Košarka', de: 'Basketball', it: 'Basket', fr: 'Basket-ball', es: 'Baloncesto', pl: 'Koszykówka', nl: 'Basketbal' },
  skateboarding: { en: 'Skateboarding', hr: 'Skateboarding', de: 'Skateboarding', it: 'Skateboard', fr: 'Skateboard', es: 'Skateboard', pl: 'Jazda na deskorolce', nl: 'Skateboarden' },
  cycling: { en: 'Cycling', hr: 'Bicikliranje', de: 'Radfahren', it: 'Ciclismo', fr: 'Vélo', es: 'Ciclismo', pl: 'Jazda na rowerze', nl: 'Fietsen' },
  concerts: { en: 'Concerts', hr: 'Koncerti', de: 'Konzerte', it: 'Concerti', fr: 'Concerts', es: 'Conciertos', pl: 'Koncerty', nl: 'Concerten' },
  festivals: { en: 'Festivals', hr: 'Festivali', de: 'Festivals', it: 'Festival', fr: 'Festivals', es: 'Festivales', pl: 'Festiwale', nl: 'Festivals' },
  dining: { en: 'Dining', hr: 'Gastronomija', de: 'Gastronomie', it: 'Gastronomia', fr: 'Gastronomie', es: 'Gastronomía', pl: 'Gastronomia', nl: 'Gastronomie' },
  shopping: { en: 'Shopping', hr: 'Kupovina', de: 'Einkaufen', it: 'Shopping', fr: 'Shopping', es: 'Compras', pl: 'Zakupy', nl: 'Winkelen' },
};

/** Labels for place tags */
export const tagLabels: LabelMap = {
  'beach-club': { en: 'Beach Club', hr: 'Beach Club', de: 'Beach Club', it: 'Beach Club', fr: 'Beach club', es: 'Club de playa', pl: 'Klub plażowy', nl: 'Beachclub' },
  'beach-bar': { en: 'Beach Bar', hr: 'Beach Bar', de: 'Strandbar', it: 'Bar sulla spiaggia', fr: 'Bar de plage', es: 'Bar de playa', pl: 'Bar plażowy', nl: 'Strandbar' },
  cocktails: { en: 'Cocktails', hr: 'Kokteli', de: 'Cocktails', it: 'Cocktail', fr: 'Cocktails', es: 'Cócteles', pl: 'Koktajle', nl: 'Cocktails' },
  'sea-view': { en: 'Sea View', hr: 'Pogled na more', de: 'Meerblick', it: 'Vista mare', fr: 'Vue sur mer', es: 'Vista al mar', pl: 'Widok na morze', nl: 'Zeezicht' },
  lounge: { en: 'Lounge', hr: 'Lounge', de: 'Lounge', it: 'Lounge', fr: 'Lounge', es: 'Lounge', pl: 'Lounge', nl: 'Lounge' },
  sunset: { en: 'Sunset', hr: 'Zalazak sunca', de: 'Sonnenuntergang', it: 'Tramonto', fr: 'Coucher de soleil', es: 'Atardecer', pl: 'Zachód słońca', nl: 'Zonsondergang' },
  luxury: { en: 'Luxury', hr: 'Luksuz', de: 'Luxus', it: 'Lusso', fr: 'Luxe', es: 'Lujo', pl: 'Luksus', nl: 'Luxe' },
  dj: { en: 'DJ', hr: 'DJ', de: 'DJ', it: 'DJ', fr: 'DJ', es: 'DJ', pl: 'DJ', nl: 'DJ' },
  vip: { en: 'VIP', hr: 'VIP', de: 'VIP', it: 'VIP', fr: 'VIP', es: 'VIP', pl: 'VIP', nl: 'VIP' },
  restaurant: { en: 'Restaurant', hr: 'Restoran', de: 'Restaurant', it: 'Ristorante', fr: 'Restaurant', es: 'Restaurante', pl: 'Restauracja', nl: 'Restaurant' },
  italian: { en: 'Italian', hr: 'Talijanski', de: 'Italienisch', it: 'Italiano', fr: 'Italien', es: 'Italiano', pl: 'Włoska', nl: 'Italiaans' },
  pizza: { en: 'Pizza', hr: 'Pizza', de: 'Pizza', it: 'Pizza', fr: 'Pizza', es: 'Pizza', pl: 'Pizza', nl: 'Pizza' },
  wine: { en: 'Wine', hr: 'Vino', de: 'Wein', it: 'Vino', fr: 'Vin', es: 'Vino', pl: 'Wino', nl: 'Wijn' },
  mediterranean: { en: 'Mediterranean', hr: 'Mediteranski', de: 'Mediterran', it: 'Mediterraneo', fr: 'Méditerranéen', es: 'Mediterráneo', pl: 'Śródziemnomorska', nl: 'Mediterraan' },
  sushi: { en: 'Sushi', hr: 'Sushi', de: 'Sushi', it: 'Sushi', fr: 'Sushi', es: 'Sushi', pl: 'Sushi', nl: 'Sushi' },
  'fine-dining': { en: 'Fine Dining', hr: 'Fine Dining', de: 'Gehobene Küche', it: 'Alta cucina', fr: 'Gastronomie raffinée', es: 'Alta cocina', pl: 'Wykwintna kuchnia', nl: 'Fine dining' },
  breakfast: { en: 'Breakfast', hr: 'Doručak', de: 'Frühstück', it: 'Colazione', fr: 'Petit-déjeuner', es: 'Desayuno', pl: 'Śniadanie', nl: 'Ontbijt' },
  'all-day-dining': { en: 'All-Day Dining', hr: 'Cijeli dan', de: 'Ganztägig', it: 'Tutto il giorno', fr: 'Restauration toute la journée', es: 'Comidas todo el día', pl: 'Posiłki przez cały dzień', nl: 'De hele dag eten' },
  cafe: { en: 'Café', hr: 'Kafić', de: 'Café', it: 'Caffè', fr: 'Café', es: 'Cafetería', pl: 'Kawiarnia', nl: 'Café' },
  music: { en: 'Music', hr: 'Glazba', de: 'Musik', it: 'Musica', fr: 'Musique', es: 'Música', pl: 'Muzyka', nl: 'Muziek' },
  promenade: { en: 'Promenade', hr: 'Šetnica', de: 'Promenade', it: 'Lungomare', fr: 'Promenade', es: 'Paseo marítimo', pl: 'Promenada', nl: 'Promenade' },
  waterfront: { en: 'Waterfront', hr: 'Na obali', de: 'Am Wasser', it: 'Lungomare', fr: 'Bord de mer', es: 'Frente al mar', pl: 'Nad wodą', nl: 'Aan het water' },
  reservations: { en: 'Reservations', hr: 'Rezervacije', de: 'Reservierungen', it: 'Prenotazioni', fr: 'Réservations', es: 'Reservas', pl: 'Rezerwacje', nl: 'Reserveringen' },
  cabanas: { en: 'Cabanas', hr: 'Kabane', de: 'Cabanas', it: 'Cabane', fr: 'Cabanes', es: 'Cabañas', pl: 'Kabany', nl: "Cabana's" },
};

/** Helper to get a label with fallback */
export function getLabel(map: LabelMap, key: string, lang: Language): string {
  return map[key]?.[lang] ?? key;
}
