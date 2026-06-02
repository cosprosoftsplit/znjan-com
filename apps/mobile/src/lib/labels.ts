import type { Language } from './mobileTypes';

type Labels = {
  tagline: string;
  apiTarget: string;
  tabs: Record<'discover' | 'sports' | 'community' | 'account', string>;
  sections: {
    overview: string;
    featuredAreas: string;
    featuredActivities: string;
    featuredPlaces: string;
    commonQuestions: string;
    publicAccessNote: string;
    sportsAreas: string;
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
    sharedPublicArea: string;
    sharedSession: string;
    resources: string;
    daysInView: string;
    accessDate: string;
    loginOnWeb: string;
    comments: string;
    joins: string;
    views: string;
    readOnWeb: string;
    openWebsite: string;
  };
};

const LABELS: Record<Language, Labels> = {
  en: {
    tagline: 'Verified beach information, public sports access, and community updates for Znjan.',
    apiTarget: 'API target',
    tabs: {
      discover: 'Discover',
      sports: 'Sports Access',
      community: 'Community',
      account: 'Account',
    },
    sections: {
      overview: 'Overview',
      featuredAreas: 'Featured beach areas',
      featuredActivities: 'Activities',
      featuredPlaces: 'Places',
      commonQuestions: 'Common questions',
      publicAccessNote: 'Public access note',
      sportsAreas: 'Sports areas',
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
      emptyFaq: 'No FAQ highlights available yet.',
      signedIn: 'Signed in',
      signedOut: 'Signed out',
      nativeNotReady: 'Native auth is documented, but not implemented yet.',
    },
    labels: {
      available: 'Open',
      reserved: 'Busy',
      mine: 'Mine',
      closed: 'Closed',
      past: 'Past',
      spotsLeft: 'spots left',
      noOpenSlots: 'No live access blocks on this date',
      sharedPublicArea: 'Shared public area',
      sharedSession: 'Shared session',
      resources: 'Resources',
      daysInView: 'Days in view',
      accessDate: 'Access date',
      loginOnWeb: 'Open web login',
      comments: 'Comments',
      joins: 'Joins',
      views: 'Views',
      readOnWeb: 'Read on web',
      openWebsite: 'Open website',
    },
  },
  hr: {
    tagline: 'Provjerene informacije o plazi, javnom sportskom pristupu i novostima zajednice za Znjan.',
    apiTarget: 'API okruzenje',
    tabs: {
      discover: 'Otkrij',
      sports: 'Sportski pristup',
      community: 'Zajednica',
      account: 'Racun',
    },
    sections: {
      overview: 'Pregled',
      featuredAreas: 'Istaknute zone plaze',
      featuredActivities: 'Aktivnosti',
      featuredPlaces: 'Mjesta',
      commonQuestions: 'Cesta pitanja',
      publicAccessNote: 'Napomena o javnom pristupu',
      sportsAreas: 'Sportske zone',
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
      emptyFaq: 'Jos nema izdvojenih FAQ stavki.',
      signedIn: 'Prijavljen',
      signedOut: 'Niste prijavljeni',
      nativeNotReady: 'Nativna prijava je definirana, ali jos nije implementirana.',
    },
    labels: {
      available: 'Otvoreno',
      reserved: 'Zauzeto',
      mine: 'Moje',
      closed: 'Zatvoreno',
      past: 'Proslo',
      spotsLeft: 'slobodnih mjesta',
      noOpenSlots: 'Nema aktivnih blokova za ovaj datum',
      sharedPublicArea: 'Dijeljeni javni prostor',
      sharedSession: 'Zajednicki termin',
      resources: 'Resursi',
      daysInView: 'Dani u prikazu',
      accessDate: 'Datum pristupa',
      loginOnWeb: 'Otvori web prijavu',
      comments: 'Komentari',
      joins: 'Pridruzivanja',
      views: 'Pregledi',
      readOnWeb: 'Otvori na webu',
      openWebsite: 'Otvori stranicu',
    },
  },
  de: {
    tagline: 'Verifizierte Strandinfos, Hinweise zum offentlichen Sportzugang und Community-Updates fur Znjan.',
    apiTarget: 'API-Ziel',
    tabs: {
      discover: 'Entdecken',
      sports: 'Sportzugang',
      community: 'Community',
      account: 'Konto',
    },
    sections: {
      overview: 'Uberblick',
      featuredAreas: 'Ausgewahlte Strandbereiche',
      featuredActivities: 'Aktivitaten',
      featuredPlaces: 'Orte',
      commonQuestions: 'Haufige Fragen',
      publicAccessNote: 'Hinweis zum offentlichen Zugang',
      sportsAreas: 'Sportbereiche',
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
      emptyFaq: 'Noch keine FAQ-Highlights verfugbar.',
      signedIn: 'Angemeldet',
      signedOut: 'Nicht angemeldet',
      nativeNotReady: 'Native Anmeldung ist dokumentiert, aber noch nicht umgesetzt.',
    },
    labels: {
      available: 'Offen',
      reserved: 'Belegt',
      mine: 'Mein',
      closed: 'Geschlossen',
      past: 'Vergangen',
      spotsLeft: 'freie Platze',
      noOpenSlots: 'Keine aktiven Zeitblocke fur dieses Datum',
      sharedPublicArea: 'Geteilter offentlicher Bereich',
      sharedSession: 'Gemeinsame Session',
      resources: 'Ressourcen',
      daysInView: 'Tage im Blick',
      accessDate: 'Zugangsdatum',
      loginOnWeb: 'Web-Login offnen',
      comments: 'Kommentare',
      joins: 'Teilnahmen',
      views: 'Aufrufe',
      readOnWeb: 'Im Web lesen',
      openWebsite: 'Website offnen',
    },
  },
  it: {
    tagline: 'Informazioni verificate sulla spiaggia, accesso pubblico allo sport e aggiornamenti della community per Znjan.',
    apiTarget: 'Destinazione API',
    tabs: {
      discover: 'Scopri',
      sports: 'Accesso sport',
      community: 'Community',
      account: 'Account',
    },
    sections: {
      overview: 'Panoramica',
      featuredAreas: 'Aree spiaggia in evidenza',
      featuredActivities: 'Attivita',
      featuredPlaces: 'Luoghi',
      commonQuestions: 'Domande frequenti',
      publicAccessNote: 'Nota di accesso pubblico',
      sportsAreas: 'Aree sportive',
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
      emptyFaq: 'Nessuna FAQ evidenziata disponibile.',
      signedIn: 'Accesso effettuato',
      signedOut: 'Non autenticato',
      nativeNotReady: 'L accesso nativo e documentato ma non ancora implementato.',
    },
    labels: {
      available: 'Aperto',
      reserved: 'Occupato',
      mine: 'Mio',
      closed: 'Chiuso',
      past: 'Passato',
      spotsLeft: 'posti liberi',
      noOpenSlots: 'Nessun blocco attivo in questa data',
      sharedPublicArea: 'Area pubblica condivisa',
      sharedSession: 'Sessione condivisa',
      resources: 'Risorse',
      daysInView: 'Giorni visibili',
      accessDate: 'Data accesso',
      loginOnWeb: 'Apri login web',
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
