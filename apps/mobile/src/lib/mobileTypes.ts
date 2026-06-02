export type Language = 'en' | 'hr' | 'de' | 'it';

export interface MobileEnvelope<T> {
  version: string;
  generatedAt: string;
  lang: Language;
  data: T;
}

export interface MobileErrorEnvelope {
  version: string;
  generatedAt: string;
  error: {
    code: string;
    message: string;
    authRequired?: boolean;
    retryable?: boolean;
  };
}

export interface MobileViewer {
  isAuthenticated: boolean;
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    level: number;
    role: string;
  } | null;
}

export interface DiscoverItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string | null;
  category?: string;
  featured?: boolean;
  order?: number;
  webUrl?: string;
  website?: string | null;
}

export interface MobileBootstrapData {
  site: {
    name: string;
    url: string;
    defaultLanguage: Language;
    supportedLanguages: Language[];
    contactEmail: string | null;
  };
  capabilities: {
    publicContent: boolean;
    communityRead: boolean;
    communityWriteRequiresSession: boolean;
    reservationsRead: boolean;
    reservationsWriteEnabled: boolean;
    reservationsWriteRequiresSession: boolean;
    nativeAuthReady: boolean;
    authMode: string;
  };
  endpoints: Record<string, string>;
  counts: {
    beachAreas: number;
    activities: number;
    places: number;
    faq: number;
  };
  featured: {
    beachAreas: DiscoverItem[];
    activities: DiscoverItem[];
    places: DiscoverItem[];
  };
}

export interface MobileDiscoverData {
  beachAreas: DiscoverItem[];
  activities: DiscoverItem[];
  places: DiscoverItem[];
  faq: {
    id: string;
    question: string;
    answer: string;
    category: string;
    order: number;
  }[];
}

export interface MobileReservationSlot {
  start: string;
  end: string;
  status: 'available' | 'reserved' | 'mine' | 'closed' | 'past';
  reservationId: string | null;
  isMine: boolean;
  reservationCount: number;
  spotsLeft: number;
  capacity: number;
}

export interface MobileReservationResource {
  id: string;
  slug: string;
  kind: 'court' | 'pitch' | 'activity';
  sortOrder: number;
  reservationMode: 'exclusive' | 'shared-session';
  capacity: number;
  availableSlotStarts: string[] | null;
  titles: Record<Language, string>;
  isActive: boolean;
  slots: MobileReservationSlot[];
}

export interface MobileUpcomingReservation {
  id: string;
  reservationDate: string;
  slotStart: string;
  slotEnd: string;
  canCancel: boolean;
  resource: Omit<MobileReservationResource, 'slots'>;
}

export interface MobileReservationsData {
  viewer: MobileViewer;
  reservationsEnabled: boolean;
  publicAccessMessage: string;
  reservationDate: string;
  dateOptions: string[];
  policy: {
    bookingWindowDays: number;
    slotDurationMinutes: number;
    startHour: number;
    endHour: number;
    maxReservationsPerDay: number;
    maxUpcomingReservations: number;
  };
  resources: MobileReservationResource[];
  upcomingReservations: MobileUpcomingReservation[];
  actions: {
    createReservation: string | null;
    cancelReservation: string | null;
  };
}

export interface MobileCommunityPost {
  id: string;
  type: string;
  category: string;
  title: string;
  body: string;
  location: string | null;
  eventDate: string | null;
  eventTime: string | null;
  joinCount: number;
  commentCount: number;
  views: number;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    level: number;
  };
}

export interface MobileCommunityFeedData {
  viewer: MobileViewer;
  filters: {
    type: string | null;
    category: string | null;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
  posts: MobileCommunityPost[];
}

export interface MobileAuthSessionData {
  authMode: string;
  nativeAuthReady: boolean;
  viewer: MobileViewer;
  web: {
    loginScreen: string;
    googleStart: string;
    logout: string;
  };
  nativePlan: {
    status: string;
    targetFlow: string;
  };
}
