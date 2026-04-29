import type { D1Database } from './db';
import { generateId, now } from './db';

export type VenueValidationOutcome = 'interested' | 'conditional' | 'not-now' | 'no-fit';
export type VenueValidationOfferFocus =
  | 'verified-listing'
  | 'feature-placement'
  | 'event-visibility'
  | 'pilot-story';
export type VenueValidationVenueType =
  | 'restaurant'
  | 'beach-club'
  | 'unknown-hospitality'
  | 'mini-market'
  | 'kiosk';

export interface VenueValidationSignal {
  id: string;
  venueKey: string;
  venueLabel: string;
  venueType: VenueValidationVenueType;
  walkDate: string;
  outcome: VenueValidationOutcome;
  offerFocus: VenueValidationOfferFocus;
  contactName: string | null;
  notes: string | null;
  createdAt: string;
}

type VenueValidationSignalRow = {
  id: string;
  venue_key: string;
  venue_label: string;
  venue_type: VenueValidationVenueType;
  walk_date: string;
  outcome: VenueValidationOutcome;
  offer_focus: VenueValidationOfferFocus;
  contact_name: string | null;
  notes: string | null;
  created_at: string;
};

export class VenueValidationError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = 'venue-validation-error') {
    super(message);
    this.name = 'VenueValidationError';
    this.status = status;
    this.code = code;
  }
}

const VENUE_VALIDATION_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS venue_validation_logs (
    id TEXT PRIMARY KEY,
    venue_key TEXT NOT NULL,
    venue_label TEXT NOT NULL,
    venue_type TEXT NOT NULL,
    walk_date TEXT NOT NULL,
    outcome TEXT NOT NULL,
    offer_focus TEXT NOT NULL,
    contact_name TEXT,
    notes TEXT,
    created_by_user_id TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_venue_validation_logs_walk_date
    ON venue_validation_logs(walk_date DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_venue_validation_logs_venue_key
    ON venue_validation_logs(venue_key)`,
  `CREATE INDEX IF NOT EXISTS idx_venue_validation_logs_outcome
    ON venue_validation_logs(outcome)`,
];

let venueValidationSchemaPromise: Promise<void> | null = null;

const VALID_OUTCOMES = new Set<VenueValidationOutcome>([
  'interested',
  'conditional',
  'not-now',
  'no-fit',
]);

const VALID_OFFER_FOCUSES = new Set<VenueValidationOfferFocus>([
  'verified-listing',
  'feature-placement',
  'event-visibility',
  'pilot-story',
]);

const VALID_VENUE_TYPES = new Set<VenueValidationVenueType>([
  'restaurant',
  'beach-club',
  'unknown-hospitality',
  'mini-market',
  'kiosk',
]);

function normalizeOptionalText(value: string | null | undefined, maxLength: number): string | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function isIsoDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function mapVenueValidationSignal(row: VenueValidationSignalRow): VenueValidationSignal {
  return {
    id: row.id,
    venueKey: row.venue_key,
    venueLabel: row.venue_label,
    venueType: row.venue_type,
    walkDate: row.walk_date,
    outcome: row.outcome,
    offerFocus: row.offer_focus,
    contactName: row.contact_name,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

async function initializeVenueValidationSchema(db: D1Database): Promise<void> {
  for (const statement of VENUE_VALIDATION_SCHEMA_STATEMENTS) {
    await db.prepare(statement).run();
  }
}

export async function ensureVenueValidationSchema(db: D1Database): Promise<void> {
  if (!venueValidationSchemaPromise) {
    venueValidationSchemaPromise = initializeVenueValidationSchema(db).catch((error) => {
      venueValidationSchemaPromise = null;
      throw error;
    });
  }

  await venueValidationSchemaPromise;
}

export async function listVenueValidationSignals(
  db: D1Database,
  limit = 32,
): Promise<VenueValidationSignal[]> {
  await ensureVenueValidationSchema(db);

  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const { results } = await db
    .prepare(
      `SELECT
        id,
        venue_key,
        venue_label,
        venue_type,
        walk_date,
        outcome,
        offer_focus,
        contact_name,
        notes,
        created_at
      FROM venue_validation_logs
      ORDER BY walk_date DESC, created_at DESC
      LIMIT ?`,
    )
    .bind(safeLimit)
    .all<VenueValidationSignalRow>();

  return results.map(mapVenueValidationSignal);
}

export async function createVenueValidationSignal(
  db: D1Database,
  input: {
    createdByUserId: string;
    venueKey: string;
    venueLabel: string;
    venueType: VenueValidationVenueType;
    walkDate: string;
    outcome: VenueValidationOutcome;
    offerFocus: VenueValidationOfferFocus;
    contactName?: string | null;
    notes?: string | null;
  },
): Promise<VenueValidationSignal> {
  await ensureVenueValidationSchema(db);

  const venueKey = input.venueKey.trim();
  const venueLabel = input.venueLabel.trim();
  const walkDate = input.walkDate.trim();
  const contactName = normalizeOptionalText(input.contactName, 120);
  const notes = normalizeOptionalText(input.notes, 600);

  if (!input.createdByUserId) {
    throw new VenueValidationError('User is required.', 400, 'user-required');
  }
  if (!venueKey) {
    throw new VenueValidationError('Venue is required.', 400, 'venue-required');
  }
  if (!venueLabel) {
    throw new VenueValidationError('Venue label is required.', 400, 'venue-label-required');
  }
  if (!VALID_VENUE_TYPES.has(input.venueType)) {
    throw new VenueValidationError('Venue type is invalid.', 400, 'invalid-venue-type');
  }
  if (!isIsoDateString(walkDate)) {
    throw new VenueValidationError('Walk date is invalid.', 400, 'invalid-walk-date');
  }
  if (!VALID_OUTCOMES.has(input.outcome)) {
    throw new VenueValidationError('Outcome is invalid.', 400, 'invalid-outcome');
  }
  if (!VALID_OFFER_FOCUSES.has(input.offerFocus)) {
    throw new VenueValidationError('Offer focus is invalid.', 400, 'invalid-offer-focus');
  }

  const signal: VenueValidationSignal = {
    id: generateId(),
    venueKey,
    venueLabel,
    venueType: input.venueType,
    walkDate,
    outcome: input.outcome,
    offerFocus: input.offerFocus,
    contactName,
    notes,
    createdAt: now(),
  };

  await db
    .prepare(
      `INSERT INTO venue_validation_logs (
        id,
        venue_key,
        venue_label,
        venue_type,
        walk_date,
        outcome,
        offer_focus,
        contact_name,
        notes,
        created_by_user_id,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      signal.id,
      signal.venueKey,
      signal.venueLabel,
      signal.venueType,
      signal.walkDate,
      signal.outcome,
      signal.offerFocus,
      signal.contactName,
      signal.notes,
      input.createdByUserId,
      signal.createdAt,
    )
    .run();

  return signal;
}
