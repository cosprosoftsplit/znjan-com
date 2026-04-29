import type { Language } from './mobileTypes';

type Labels = {
  tagline: string;
  apiTarget: string;
  tabs: Record<'discover' | 'reservations' | 'community' | 'account', string>;
  sections: {
    overview: string;
    featuredAreas: string;
    featuredActivities: string;
    featuredPlaces: string;
    commonQuestions: string;
    reservationPolicy: string;
    reservationResources: string;
    upcomingReservations: string;
    communityFeed: string;
    authStatus: string;
    nextMilestone: string;
    connectedEndpoints: string;
  };
  metrics: {
    beachAreas: string;
    activities: string;
    places: string;
    faqs: string;
  };
  states: {
    loading: string;
    emptyPosts: string;
    emptyReservations: string;
    emptyFaq: string;
    signedIn: string;
    signedOut: string;
    nativeNotReady: string;
  };
  labels: {
    available: string;
    reserved: string;
    mine: string;
    closed: string;
    past: string;
    spotsLeft: string;
    noOpenSlots: string;
    loginOnWeb: string;
    bookingWindow: string;
    slotLength: string;
    dayLimit: string;
    upcomingLimit: string;
    comments: string;
    joins: string;
    views: string;
    readOnWeb: string;
    openWebsite: string;
  };
};

const LABELS: Record<Language, Labels> = {
  en: {
    tagline: 'Verified beach information, public reservations, and community updates for Znjan.',
    apiTarget: 'API target',
    tabs: {
      discover: 'Discover',
      reservations: 'Reservations',
      community: 'Community',
      account: 'Account',
    },
    sections: {
      overview: 'Overview',
      featuredAreas: 'Featured beach areas',
      featuredActivities: 'Activities',
      featuredPlaces: 'Places',
      commonQuestions: 'Common questions',
      reservationPolicy: 'Reservation policy',
      reservationResources: 'Resources',
      upcomingReservations: 'Upcoming reservations',
      communityFeed: 'Latest posts',
      authStatus: 'Auth status',
      nextMilestone: 'Next milestone',
      connectedEndpoints: 'Connected endpoints',
    },
    metrics: {
      beachAreas: 'Beach areas',
      activities: 'Activities',
      places: 'Places',
      faqs: 'FAQs',
    },
    states: {
      loading: 'Loading live data...',
      emptyPosts: 'No approved community posts yet.',
      emptyReservations: 'No upcoming reservations yet.',
      emptyFaq: 'No FAQ highlights available yet.',
      signedIn: 'Signed in',
      signedOut: 'Signed out',
      nativeNotReady: 'Native auth is documented, but not implemented yet.',
    },
    labels: {
      available: 'Available',
      reserved: 'Reserved',
      mine: 'Mine',
      closed: 'Closed',
      past: 'Past',
      spotsLeft: 'spots left',
      noOpenSlots: 'No open slots on this date',
      loginOnWeb: 'Open web login',
      bookingWindow: 'Booking window',
      slotLength: 'Slot length',
      dayLimit: 'Daily limit',
      upcomingLimit: 'Upcoming cap',
      comments: 'Comments',
      joins: 'Joins',
      views: 'Views',
      readOnWeb: 'Read on web',
      openWebsite: 'Open website',
    },
  },
  hr: {
    tagline: 'Provjerene informacije o plazi, javne rezervacije i novosti zajednice za Znjan.',
    apiTarget: 'API okruzenje',
    tabs: {
      discover: 'Otkrij',
      reservations: 'Rezervacije',
      community: 'Zajednica',
      account: 'Racun',
    },
    sections: {
      overview: 'Pregled',
      featuredAreas: 'Istaknute zone plaze',
      featuredActivities: 'Aktivnosti',
      featuredPlaces: 'Mjesta',
      commonQuestions: 'Cesta pitanja',
      reservationPolicy: 'Pravila rezervacija',
      reservationResources: 'Resursi',
      upcomingReservations: 'Nadolazece rezervacije',
      communityFeed: 'Najnovije objave',
      authStatus: 'Status prijave',
      nextMilestone: 'Sljedeci korak',
      connectedEndpoints: 'Povezani endpointi',
    },
    metrics: {
      beachAreas: 'Zone plaze',
      activities: 'Aktivnosti',
      places: 'Mjesta',
      faqs: 'FAQ',
    },
    states: {
      loading: 'Ucitavanje podataka...',
      emptyPosts: 'Jos nema odobrenih objava zajednice.',
      emptyReservations: 'Jos nema nadolazecih rezervacija.',
      emptyFaq: 'Jos nema izdvojenih FAQ stavki.',
      signedIn: 'Prijavljen',
      signedOut: 'Niste prijavljeni',
      nativeNotReady: 'Nativna prijava je definirana, ali jos nije implementirana.',
    },
    labels: {
      available: 'Dostupno',
      reserved: 'Rezervirano',
      mine: 'Moje',
      closed: 'Zatvoreno',
      past: 'Proslo',
      spotsLeft: 'slobodnih mjesta',
      noOpenSlots: 'Nema slobodnih termina za ovaj datum',
      loginOnWeb: 'Otvori web prijavu',
      bookingWindow: 'Rok rezervacije',
      slotLength: 'Trajanje termina',
      dayLimit: 'Dnevni limit',
      upcomingLimit: 'Ukupni limit',
      comments: 'Komentari',
      joins: 'Pridruzivanja',
      views: 'Pregledi',
      readOnWeb: 'Otvori na webu',
      openWebsite: 'Otvori stranicu',
    },
  },
  de: {
    tagline: 'Verifizierte Strandinfos, offentliche Reservierungen und Community-Updates fur Znjan.',
    apiTarget: 'API-Ziel',
    tabs: {
      discover: 'Entdecken',
      reservations: 'Reservierungen',
      community: 'Community',
      account: 'Konto',
    },
    sections: {
      overview: 'Uberblick',
      featuredAreas: 'Ausgewahlte Strandbereiche',
      featuredActivities: 'Aktivitaten',
      featuredPlaces: 'Orte',
      commonQuestions: 'Haufige Fragen',
      reservationPolicy: 'Reservierungsregeln',
      reservationResources: 'Ressourcen',
      upcomingReservations: 'Bevorstehende Reservierungen',
      communityFeed: 'Neueste Beitrage',
      authStatus: 'Anmeldestatus',
      nextMilestone: 'Nachster Meilenstein',
      connectedEndpoints: 'Verbundene Endpunkte',
    },
    metrics: {
      beachAreas: 'Strandbereiche',
      activities: 'Aktivitaten',
      places: 'Orte',
      faqs: 'FAQs',
    },
    states: {
      loading: 'Live-Daten werden geladen...',
      emptyPosts: 'Noch keine freigegebenen Community-Beitrage.',
      emptyReservations: 'Noch keine bevorstehenden Reservierungen.',
      emptyFaq: 'Noch keine FAQ-Highlights verfugbar.',
      signedIn: 'Angemeldet',
      signedOut: 'Nicht angemeldet',
      nativeNotReady: 'Native Anmeldung ist dokumentiert, aber noch nicht umgesetzt.',
    },
    labels: {
      available: 'Verfugbar',
      reserved: 'Reserviert',
      mine: 'Mein',
      closed: 'Geschlossen',
      past: 'Vergangen',
      spotsLeft: 'freie Platze',
      noOpenSlots: 'Keine offenen Zeitfenster an diesem Tag',
      loginOnWeb: 'Web-Login offnen',
      bookingWindow: 'Buchungsfenster',
      slotLength: 'Slot-Lange',
      dayLimit: 'Tageslimit',
      upcomingLimit: 'Gesamtlimit',
      comments: 'Kommentare',
      joins: 'Teilnahmen',
      views: 'Aufrufe',
      readOnWeb: 'Im Web lesen',
      openWebsite: 'Website offnen',
    },
  },
  it: {
    tagline: 'Informazioni verificate sulla spiaggia, prenotazioni pubbliche e aggiornamenti della community per Znjan.',
    apiTarget: 'Destinazione API',
    tabs: {
      discover: 'Scopri',
      reservations: 'Prenotazioni',
      community: 'Community',
      account: 'Account',
    },
    sections: {
      overview: 'Panoramica',
      featuredAreas: 'Aree spiaggia in evidenza',
      featuredActivities: 'Attivita',
      featuredPlaces: 'Luoghi',
      commonQuestions: 'Domande frequenti',
      reservationPolicy: 'Regole di prenotazione',
      reservationResources: 'Risorse',
      upcomingReservations: 'Prenotazioni future',
      communityFeed: 'Ultimi post',
      authStatus: 'Stato accesso',
      nextMilestone: 'Prossimo traguardo',
      connectedEndpoints: 'Endpoint collegati',
    },
    metrics: {
      beachAreas: 'Aree spiaggia',
      activities: 'Attivita',
      places: 'Luoghi',
      faqs: 'FAQ',
    },
    states: {
      loading: 'Caricamento dati in corso...',
      emptyPosts: 'Nessun post community approvato al momento.',
      emptyReservations: 'Nessuna prenotazione futura al momento.',
      emptyFaq: 'Nessuna FAQ evidenziata disponibile.',
      signedIn: 'Accesso effettuato',
      signedOut: 'Non autenticato',
      nativeNotReady: 'L accesso nativo e documentato ma non ancora implementato.',
    },
    labels: {
      available: 'Disponibile',
      reserved: 'Prenotato',
      mine: 'Mio',
      closed: 'Chiuso',
      past: 'Passato',
      spotsLeft: 'posti liberi',
      noOpenSlots: 'Nessuno slot libero in questa data',
      loginOnWeb: 'Apri login web',
      bookingWindow: 'Finestra prenotazioni',
      slotLength: 'Durata slot',
      dayLimit: 'Limite giornaliero',
      upcomingLimit: 'Limite totale',
      comments: 'Commenti',
      joins: 'Partecipanti',
      views: 'Visualizzazioni',
      readOnWeb: 'Apri sul web',
      openWebsite: 'Apri sito',
    },
  },
};

export function getLabels(lang: Language): Labels {
  return LABELS[lang];
}
