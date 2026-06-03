import type { Language, Localized } from './i18n';
import type { D1Database } from './db';
import { generateId, now } from './db';

export const RESERVATION_TIME_ZONE = 'Europe/Zagreb';

export const RESERVATION_POLICY = {
  bookingWindowDays: 7,
  slotDurationMinutes: 60,
  startHour: 8,
  endHour: 22,
  maxReservationsPerDay: 2,
  maxUpcomingReservations: 5,
} as const;

export const PUBLIC_SPORTS_ACCESS_MESSAGE =
  'All public sports activities at Znjan are free, there is no current reservation system, and the beach sports areas are open on a first-come, first-served basis.';

export type SportsResourceKind = 'court' | 'pitch' | 'activity';
export type SportsReservationMode = 'exclusive' | 'shared-session';
export type SlotStatus = 'available' | 'reserved' | 'mine' | 'closed' | 'past';
export type SportsCollisionSource =
  | 'reservation-followup'
  | 'admin-report'
  | 'ambassador-report';
export type SportsCollisionIssueType =
  | 'occupied-on-arrival'
  | 'double-booking'
  | 'closure-mismatch'
  | 'session-over-capacity'
  | 'other';
export type SportsPilotDistributionLocationType =
  | 'pavilion'
  | 'bar'
  | 'restaurant'
  | 'beach-touchpoint'
  | 'other';
export type SportsPilotDistributionMaterialType =
  | 'qr-sticker'
  | 'flyer'
  | 'poster'
  | 'table-card'
  | 'handout';
export type SportsPilotCoverageRole = 'founder' | 'ambassador' | 'helper';

export interface SportsResourceDefinition {
  id: string;
  slug: string;
  kind: SportsResourceKind;
  sortOrder: number;
  reservationMode: SportsReservationMode;
  capacity: number;
  availableSlotStarts?: readonly string[];
  titles: Localized<string>;
}

export interface SportsResource {
  id: string;
  slug: string;
  kind: SportsResourceKind;
  sortOrder: number;
  reservationMode: SportsReservationMode;
  capacity: number;
  availableSlotStarts: string[] | null;
  titles: Localized<string>;
  isActive: boolean;
}

export interface SportsScheduleSlot {
  start: string;
  end: string;
  status: SlotStatus;
  reservationId: string | null;
  isMine: boolean;
  reservationCount: number;
  spotsLeft: number;
  capacity: number;
}

export interface SportsScheduleResource extends SportsResource {
  slots: SportsScheduleSlot[];
}

export interface UpcomingSportsReservation {
  id: string;
  reservationDate: string;
  slotStart: string;
  slotEnd: string;
  resource: SportsResource;
  canCancel: boolean;
}

export interface RecentSportsReservationFollowUp extends UpcomingSportsReservation {
  alreadyReported: boolean;
}

export interface SportsBlackout {
  id: string;
  blackoutDate: string;
  slotStart: string;
  slotEnd: string;
  reason: string | null;
  createdAt: string;
  resource: SportsResource | null;
}

export interface SportsCollisionReport {
  id: string;
  reservationId: string | null;
  source: SportsCollisionSource;
  issueType: SportsCollisionIssueType;
  collisionDate: string;
  slotStart: string;
  slotEnd: string;
  notes: string | null;
  createdAt: string;
  resource: SportsResource;
}

export interface SportsPilotDistributionLog {
  id: string;
  distributionDate: string;
  locationName: string;
  locationType: SportsPilotDistributionLocationType;
  materialType: SportsPilotDistributionMaterialType;
  quantity: number;
  notes: string | null;
  createdAt: string;
}

export interface SportsPilotCoverageBlock {
  id: string;
  coverageDate: string;
  slotStart: string;
  slotEnd: string;
  role: SportsPilotCoverageRole;
  personName: string;
  focusArea: string | null;
  notes: string | null;
  createdAt: string;
}

export interface SportsTransparencyCollisionSourceSummary {
  source: SportsCollisionSource;
  count: number;
}

export interface SportsTransparencyResourceSummary {
  resource: SportsResource;
  totalSlots: number;
  openSlots: number;
  reservedSlots: number;
  closedSlots: number;
  occupancyPercent: number;
  totalReservations: number;
  cancelledReservations: number;
  collisionReports: number;
}

export interface SportsTransparencyDateSummary {
  date: string;
  totalSlots: number;
  openSlots: number;
  reservedSlots: number;
  closedSlots: number;
  occupancyPercent: number;
  collisionReports: number;
}

export interface SportsTransparencySnapshot {
  startDate: string;
  endDate: string;
  totalDays: number;
  totalResources: number;
  totalSlots: number;
  openSlots: number;
  reservedSlots: number;
  closedSlots: number;
  occupancyPercent: number;
  activeClosureCount: number;
  totalReservations: number;
  cancelledReservations: number;
  cancellationRatePercent: number;
  completedReservations: number;
  collisionReports: number;
  collisionRatePercent: number;
  busiestStartTime: string | null;
  collisionSourceSummaries: SportsTransparencyCollisionSourceSummary[];
  resourceSummaries: SportsTransparencyResourceSummary[];
  dateSummaries: SportsTransparencyDateSummary[];
}

type SportsResourceRow = {
  id: string;
  slug: string;
  kind: SportsResourceKind;
  reservation_mode: SportsReservationMode;
  capacity: number;
  is_active: number;
  sort_order: number;
};

type ReservationRow = {
  id: string;
  resource_id: string;
  resource_slug: string;
  user_id: string;
  reservation_date: string;
  slot_start: string;
  slot_end: string;
  status: string;
};

type BlackoutRow = {
  id?: string;
  resource_id: string | null;
  resource_slug?: string | null;
  blackout_date: string;
  slot_start: string;
  slot_end: string;
  reason?: string | null;
  is_active: number;
  created_at?: string;
};

type CollisionReportRow = {
  id: string;
  reservation_id: string | null;
  resource_id: string;
  resource_slug: string;
  reporter_user_id: string | null;
  source: SportsCollisionSource;
  issue_type: SportsCollisionIssueType;
  collision_date: string;
  slot_start: string;
  slot_end: string;
  notes: string | null;
  created_at: string;
};

type DistributionLogRow = {
  id: string;
  distribution_date: string;
  location_name: string;
  location_type: SportsPilotDistributionLocationType;
  material_type: SportsPilotDistributionMaterialType;
  quantity: number;
  notes: string | null;
  created_at: string;
};

type CoverageBlockRow = {
  id: string;
  coverage_date: string;
  slot_start: string;
  slot_end: string;
  role: SportsPilotCoverageRole;
  person_name: string;
  focus_area: string | null;
  notes: string | null;
  created_at: string;
};

export class SportsReservationError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = 'reservation-error') {
    super(message);
    this.name = 'SportsReservationError';
    this.status = status;
    this.code = code;
  }
}

export const SPORTS_RESOURCE_DEFINITIONS: SportsResourceDefinition[] = [
  {
    id: 'sports-resource-beach-volleyball-1',
    slug: 'beach-volleyball-1',
    kind: 'court',
    sortOrder: 10,
    reservationMode: 'exclusive',
    capacity: 1,
    titles: {
      en: 'Beach Volleyball Court 1',
      hr: 'Teren za odbojku na pijesku 1',
      de: 'Beachvolleyballfeld 1',
      it: 'Campo da beach volley 1',
    },
  },
  {
    id: 'sports-resource-beach-volleyball-2',
    slug: 'beach-volleyball-2',
    kind: 'court',
    sortOrder: 20,
    reservationMode: 'exclusive',
    capacity: 1,
    titles: {
      en: 'Beach Volleyball Court 2',
      hr: 'Teren za odbojku na pijesku 2',
      de: 'Beachvolleyballfeld 2',
      it: 'Campo da beach volley 2',
    },
  },
  {
    id: 'sports-resource-beach-volleyball-3',
    slug: 'beach-volleyball-3',
    kind: 'court',
    sortOrder: 30,
    reservationMode: 'exclusive',
    capacity: 1,
    titles: {
      en: 'Beach Volleyball Court 3',
      hr: 'Teren za odbojku na pijesku 3',
      de: 'Beachvolleyballfeld 3',
      it: 'Campo da beach volley 3',
    },
  },
  {
    id: 'sports-resource-tennis-court-1',
    slug: 'tennis-court-1',
    kind: 'court',
    sortOrder: 40,
    reservationMode: 'exclusive',
    capacity: 1,
    titles: {
      en: 'Tennis Court',
      hr: 'Teniski teren',
      de: 'Tennisplatz',
      it: 'Campo da tennis',
    },
  },
  {
    id: 'sports-resource-basketball-court-1',
    slug: 'basketball-court-1',
    kind: 'court',
    sortOrder: 50,
    reservationMode: 'exclusive',
    capacity: 1,
    titles: {
      en: 'Basketball Court',
      hr: 'Košarkaški teren',
      de: 'Basketballplatz',
      it: 'Campo da basket',
    },
  },
  {
    id: 'sports-resource-cage-football-1',
    slug: 'cage-football-1',
    kind: 'pitch',
    sortOrder: 60,
    reservationMode: 'exclusive',
    capacity: 1,
    titles: {
      en: 'Cage Football Pitch',
      hr: 'Kavez za nogomet',
      de: 'Käfig-Fußballfeld',
      it: 'Campo di calcetto in gabbia',
    },
  },
  {
    id: 'sports-resource-skate-session-beginner',
    slug: 'skate-session-beginner',
    kind: 'activity',
    sortOrder: 70,
    reservationMode: 'shared-session',
    capacity: 8,
    availableSlotStarts: ['09:00'],
    titles: {
      en: 'Skate Park Beginner Session',
      hr: 'Skate Park početna sesija',
      de: 'Skatepark Anfängersession',
      it: 'Sessione principianti skate park',
    },
  },
  {
    id: 'sports-resource-skate-session-open',
    slug: 'skate-session-open',
    kind: 'activity',
    sortOrder: 80,
    reservationMode: 'shared-session',
    capacity: 12,
    availableSlotStarts: ['17:00'],
    titles: {
      en: 'Skate Park Open Session',
      hr: 'Skate Park open sesija',
      de: 'Skatepark Open Session',
      it: 'Sessione open skate park',
    },
  },
  {
    id: 'sports-resource-skate-session-sunset',
    slug: 'skate-session-sunset',
    kind: 'activity',
    sortOrder: 90,
    reservationMode: 'shared-session',
    capacity: 12,
    availableSlotStarts: ['19:00'],
    titles: {
      en: 'Skate Park Sunset Session',
      hr: 'Skate Park sunset sesija',
      de: 'Skatepark Sunset Session',
      it: 'Sessione tramonto skate park',
    },
  },
];

const SPORTS_RESOURCE_MAP = new Map(
  SPORTS_RESOURCE_DEFINITIONS.map((resource) => [resource.slug, resource]),
);

const SPORTS_RESERVATION_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS sports_resources (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    kind TEXT NOT NULL,
    reservation_mode TEXT NOT NULL DEFAULT 'exclusive',
    capacity INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sports_reservations (
    id TEXT PRIMARY KEY,
    resource_id TEXT NOT NULL REFERENCES sports_resources(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    reservation_date TEXT NOT NULL,
    slot_start TEXT NOT NULL,
    slot_end TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    cancelled_at TEXT,
    cancelled_by_user_id TEXT REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS sports_blackouts (
    id TEXT PRIMARY KEY,
    resource_id TEXT REFERENCES sports_resources(id),
    blackout_date TEXT NOT NULL,
    slot_start TEXT NOT NULL,
    slot_end TEXT NOT NULL,
    reason TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sports_reservation_audit_log (
    id TEXT PRIMARY KEY,
    reservation_id TEXT REFERENCES sports_reservations(id),
    resource_id TEXT REFERENCES sports_resources(id),
    user_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sports_collision_reports (
    id TEXT PRIMARY KEY,
    reservation_id TEXT REFERENCES sports_reservations(id),
    resource_id TEXT NOT NULL REFERENCES sports_resources(id),
    reporter_user_id TEXT REFERENCES users(id),
    source TEXT NOT NULL,
    issue_type TEXT NOT NULL,
    collision_date TEXT NOT NULL,
    slot_start TEXT NOT NULL,
    slot_end TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sports_pilot_distribution_logs (
    id TEXT PRIMARY KEY,
    distributed_by_user_id TEXT REFERENCES users(id),
    distribution_date TEXT NOT NULL,
    location_name TEXT NOT NULL,
    location_type TEXT NOT NULL,
    material_type TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sports_pilot_coverage_blocks (
    id TEXT PRIMARY KEY,
    scheduled_by_user_id TEXT REFERENCES users(id),
    coverage_date TEXT NOT NULL,
    slot_start TEXT NOT NULL,
    slot_end TEXT NOT NULL,
    role TEXT NOT NULL,
    person_name TEXT NOT NULL,
    focus_area TEXT,
    notes TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_sports_reservations_resource_date
    ON sports_reservations(resource_id, reservation_date)`,
  `CREATE INDEX IF NOT EXISTS idx_sports_reservations_user_date
    ON sports_reservations(user_id, reservation_date)`,
  `CREATE INDEX IF NOT EXISTS idx_sports_blackouts_date
    ON sports_blackouts(blackout_date)`,
  `CREATE INDEX IF NOT EXISTS idx_sports_audit_reservation
    ON sports_reservation_audit_log(reservation_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sports_collision_reports_date
    ON sports_collision_reports(collision_date)`,
  `CREATE INDEX IF NOT EXISTS idx_sports_collision_reports_resource_date
    ON sports_collision_reports(resource_id, collision_date)`,
  `CREATE INDEX IF NOT EXISTS idx_sports_collision_reports_reservation
    ON sports_collision_reports(reservation_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sports_pilot_distribution_logs_date
    ON sports_pilot_distribution_logs(distribution_date)`,
  `CREATE INDEX IF NOT EXISTS idx_sports_pilot_distribution_logs_material
    ON sports_pilot_distribution_logs(material_type)`,
  `CREATE INDEX IF NOT EXISTS idx_sports_pilot_coverage_blocks_date
    ON sports_pilot_coverage_blocks(coverage_date)`,
  `CREATE INDEX IF NOT EXISTS idx_sports_pilot_coverage_blocks_role
    ON sports_pilot_coverage_blocks(role)`,
  `CREATE INDEX IF NOT EXISTS idx_sports_pilot_coverage_blocks_active_date
    ON sports_pilot_coverage_blocks(coverage_date, slot_start)
    WHERE is_active = 1`,
  `DROP INDEX IF EXISTS idx_sports_reservations_active_slot`,
  `CREATE INDEX IF NOT EXISTS idx_sports_reservations_active_slot
    ON sports_reservations(resource_id, reservation_date, slot_start)
    WHERE status = 'active'`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_sports_reservations_user_slot
    ON sports_reservations(user_id, reservation_date, slot_start)
    WHERE status = 'active'`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_sports_collision_followup_unique
    ON sports_collision_reports(reservation_id, reporter_user_id, source)
    WHERE reservation_id IS NOT NULL AND source = 'reservation-followup'`,
] as const;

let sportsReservationSchemaPromise: Promise<void> | null = null;

function getNowParts(timeZone = RESERVATION_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const lookup = new Map(parts.map((part) => [part.type, part.value]));

  return {
    year: lookup.get('year') ?? '1970',
    month: lookup.get('month') ?? '01',
    day: lookup.get('day') ?? '01',
    hour: lookup.get('hour') ?? '00',
    minute: lookup.get('minute') ?? '00',
  };
}

function parseTimeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map((part) => Number(part));
  return hours * 60 + minutes;
}

function addDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function addMinutesToTime(start: string, minutesToAdd: number): string {
  const totalMinutes = parseTimeToMinutes(start) + minutesToAdd;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function getD1MetaNumber(meta: Record<string, unknown>, key: string): number {
  const value = meta[key];
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    return Number(value) || 0;
  }
  return 0;
}

function isTimeRangeBlocked(slotStart: string, blackoutStart: string, blackoutEnd: string): boolean {
  const slotMinutes = parseTimeToMinutes(slotStart);
  return slotMinutes >= parseTimeToMinutes(blackoutStart) && slotMinutes < parseTimeToMinutes(blackoutEnd);
}

function hydrateSportsResource(
  definition: SportsResourceDefinition,
  overrides?: Partial<Pick<SportsResource, 'capacity' | 'isActive' | 'reservationMode'>>,
): SportsResource {
  return {
    id: definition.id,
    slug: definition.slug,
    kind: definition.kind,
    sortOrder: definition.sortOrder,
    reservationMode: overrides?.reservationMode ?? definition.reservationMode,
    capacity: overrides?.capacity ?? definition.capacity,
    availableSlotStarts: definition.availableSlotStarts ? [...definition.availableSlotStarts] : null,
    titles: definition.titles,
    isActive: overrides?.isActive ?? true,
  };
}

function getSportsResourceBySlug(slug: string | null | undefined): SportsResource | null {
  if (!slug) return null;

  const definition = SPORTS_RESOURCE_MAP.get(slug);
  if (!definition) return null;

  return hydrateSportsResource(definition);
}

function isValidCollisionSource(value: string): value is SportsCollisionSource {
  return (
    value === 'reservation-followup' ||
    value === 'admin-report' ||
    value === 'ambassador-report'
  );
}

function isValidCollisionIssueType(value: string): value is SportsCollisionIssueType {
  return (
    value === 'occupied-on-arrival' ||
    value === 'double-booking' ||
    value === 'closure-mismatch' ||
    value === 'session-over-capacity' ||
    value === 'other'
  );
}

function isValidDistributionLocationType(
  value: string,
): value is SportsPilotDistributionLocationType {
  return (
    value === 'pavilion' ||
    value === 'bar' ||
    value === 'restaurant' ||
    value === 'beach-touchpoint' ||
    value === 'other'
  );
}

function isValidDistributionMaterialType(
  value: string,
): value is SportsPilotDistributionMaterialType {
  return (
    value === 'qr-sticker' ||
    value === 'flyer' ||
    value === 'poster' ||
    value === 'table-card' ||
    value === 'handout'
  );
}

function isValidCoverageRole(value: string): value is SportsPilotCoverageRole {
  return value === 'founder' || value === 'ambassador' || value === 'helper';
}

function isValidSlotBoundary(value: string, type: 'start' | 'end'): boolean {
  const slots = getTimeSlots();
  if (type === 'start') {
    return slots.some((slot) => slot.start === value);
  }

  return slots.some((slot) => slot.end === value);
}

export function getCollisionReportDateOptions(daysBack = 3): string[] {
  const today = getTodayInReservationTimezone();
  return Array.from({ length: Math.max(daysBack, 0) + 1 }, (_, index) => addDays(today, -index));
}

export function getPilotDistributionDateOptions(daysBack = 14): string[] {
  const today = getTodayInReservationTimezone();
  return Array.from({ length: Math.max(daysBack, 0) + 1 }, (_, index) => addDays(today, -index));
}

export function getPilotCoverageDateOptions(daysAhead = 14): string[] {
  const today = getTodayInReservationTimezone();
  return Array.from({ length: Math.max(daysAhead, 0) + 1 }, (_, index) => addDays(today, index));
}

async function logReservationAction(
  db: D1Database,
  reservationId: string,
  resourceId: string,
  userId: string,
  action: string,
): Promise<void> {
  await db
    .prepare(
      'INSERT INTO sports_reservation_audit_log (id, reservation_id, resource_id, user_id, action, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(generateId(), reservationId, resourceId, userId, action, now())
    .run();
}

export async function ensureSportsReservationSchema(db: D1Database): Promise<void> {
  if (!sportsReservationSchemaPromise) {
    sportsReservationSchemaPromise = (async () => {
      for (const statement of SPORTS_RESERVATION_SCHEMA_STATEMENTS) {
        await db.prepare(statement).run();
      }

      const timestamp = now();
      for (const resource of SPORTS_RESOURCE_DEFINITIONS) {
        await db
          .prepare(
            `INSERT OR IGNORE INTO sports_resources
             (id, slug, kind, reservation_mode, capacity, is_active, sort_order, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)`,
          )
          .bind(
            resource.id,
            resource.slug,
            resource.kind,
            resource.reservationMode,
            resource.capacity,
            resource.sortOrder,
            timestamp,
            timestamp,
          )
          .run();

        await db
          .prepare(
            `UPDATE sports_resources
             SET kind = ?, reservation_mode = ?, capacity = ?, is_active = 1, sort_order = ?, updated_at = ?
             WHERE id = ?`,
          )
          .bind(
            resource.kind,
            resource.reservationMode,
            resource.capacity,
            resource.sortOrder,
            timestamp,
            resource.id,
          )
          .run();
      }
    })().catch((error) => {
      sportsReservationSchemaPromise = null;
      throw error;
    });
  }

  await sportsReservationSchemaPromise;
}

export function getTodayInReservationTimezone(): string {
  const parts = getNowParts();
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getReservationDateOptions(): string[] {
  const today = getTodayInReservationTimezone();
  return Array.from({ length: RESERVATION_POLICY.bookingWindowDays }, (_, index) =>
    addDays(today, index),
  );
}

export function isReservationDate(value: string | null | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function resolveReservationDate(value: string | null | undefined): string {
  if (isReservationDate(value) && isWithinReservationWindow(value)) {
    return value;
  }
  return getTodayInReservationTimezone();
}

export function isWithinReservationWindow(dateString: string): boolean {
  const [firstDate, ...rest] = getReservationDateOptions();
  const lastDate = rest.at(-1) ?? firstDate;
  return dateString >= firstDate && dateString <= lastDate;
}

export function getTimeSlots(): Array<{ start: string; end: string }> {
  const slots: Array<{ start: string; end: string }> = [];
  for (let hour = RESERVATION_POLICY.startHour; hour < RESERVATION_POLICY.endHour; hour += 1) {
    const start = `${String(hour).padStart(2, '0')}:00`;
    slots.push({
      start,
      end: addMinutesToTime(start, RESERVATION_POLICY.slotDurationMinutes),
    });
  }
  return slots;
}

export function getTimeSlotsForResource(resource: {
  availableSlotStarts?: readonly string[] | string[] | null;
}): Array<{ start: string; end: string }> {
  const slots = getTimeSlots();
  if (!resource.availableSlotStarts?.length) {
    return slots;
  }

  const allowedSlotStarts = new Set(resource.availableSlotStarts);
  return slots.filter((slot) => allowedSlotStarts.has(slot.start));
}

export function isSlotStarted(dateString: string, slotStart: string): boolean {
  const today = getTodayInReservationTimezone();
  if (dateString < today) return true;
  if (dateString > today) return false;

  const { hour, minute } = getNowParts();
  const currentMinutes = Number(hour) * 60 + Number(minute);
  return parseTimeToMinutes(slotStart) <= currentMinutes;
}

export function isSlotFinished(dateString: string, slotEnd: string): boolean {
  const today = getTodayInReservationTimezone();
  if (dateString < today) return true;
  if (dateString > today) return false;

  const { hour, minute } = getNowParts();
  const currentMinutes = Number(hour) * 60 + Number(minute);
  return parseTimeToMinutes(slotEnd) <= currentMinutes;
}

export async function listSportsResources(db: D1Database): Promise<SportsResource[]> {
  await ensureSportsReservationSchema(db);

  const rows = await db
    .prepare(
      'SELECT id, slug, kind, reservation_mode, capacity, is_active, sort_order FROM sports_resources WHERE is_active = 1 ORDER BY sort_order ASC, slug ASC',
    )
    .all<SportsResourceRow>();

  return rows.results
    .map((row) => {
      const definition = SPORTS_RESOURCE_MAP.get(row.slug);
      if (!definition) return null;

      return hydrateSportsResource(definition, {
        capacity: Number(row.capacity ?? 1),
        isActive: Number(row.is_active ?? 0) === 1,
        reservationMode: row.reservation_mode,
      });
    })
    .filter((resource): resource is SportsResource => resource !== null);
}

export async function listActiveSportsBlackouts(
  db: D1Database,
  fromDate = getTodayInReservationTimezone(),
): Promise<SportsBlackout[]> {
  await ensureSportsReservationSchema(db);

  const rows = await db
    .prepare(
      `SELECT b.id, b.resource_id, s.slug AS resource_slug, b.blackout_date, b.slot_start, b.slot_end, b.reason, b.is_active, b.created_at
       FROM sports_blackouts b
       LEFT JOIN sports_resources s ON s.id = b.resource_id
       WHERE b.is_active = 1 AND b.blackout_date >= ?
       ORDER BY b.blackout_date ASC, b.slot_start ASC, s.sort_order ASC, s.slug ASC`,
    )
    .bind(fromDate)
    .all<BlackoutRow>();

  return rows.results.map((row) => ({
    id: row.id ?? '',
    blackoutDate: row.blackout_date,
    slotStart: row.slot_start,
    slotEnd: row.slot_end,
    reason: row.reason ?? null,
    createdAt: row.created_at ?? '',
    resource: getSportsResourceBySlug(row.resource_slug),
  }));
}

export async function getSportsScheduleForDate(
  db: D1Database,
  dateString: string,
  currentUserId?: string,
): Promise<SportsScheduleResource[]> {
  await ensureSportsReservationSchema(db);

  const [resources, reservations, blackouts] = await Promise.all([
    listSportsResources(db),
    db
      .prepare(
        `SELECT r.id, r.resource_id, s.slug AS resource_slug, r.user_id, r.reservation_date, r.slot_start, r.slot_end, r.status
         FROM sports_reservations r
         JOIN sports_resources s ON s.id = r.resource_id
         WHERE r.reservation_date = ? AND r.status = 'active'`,
      )
      .bind(dateString)
      .all<ReservationRow>(),
    db
      .prepare(
        `SELECT resource_id, blackout_date, slot_start, slot_end, is_active
         FROM sports_blackouts
         WHERE blackout_date = ? AND is_active = 1`,
      )
      .bind(dateString)
      .all<BlackoutRow>(),
  ]);

  const reservationMap = new Map<string, ReservationRow[]>();
  for (const reservation of reservations.results) {
    const key = `${reservation.resource_id}:${reservation.slot_start}`;
    const existing = reservationMap.get(key) ?? [];
    existing.push(reservation);
    reservationMap.set(key, existing);
  }

  return resources.map((resource) => ({
    ...resource,
    slots: getTimeSlotsForResource(resource).map((slot) => {
      const matchingReservations = reservationMap.get(`${resource.id}:${slot.start}`) ?? [];
      const myReservation = matchingReservations.find(
        (reservation) => reservation.user_id === currentUserId,
      );
      const reservationCount = matchingReservations.length;
      const spotsLeft = Math.max(resource.capacity - reservationCount, 0);
      const isBlocked = blackouts.results.some(
        (blackout) =>
          (!blackout.resource_id || blackout.resource_id === resource.id) &&
          isTimeRangeBlocked(slot.start, blackout.slot_start, blackout.slot_end),
      );

      let status: SlotStatus = 'available';
      if (isSlotStarted(dateString, slot.start)) {
        status = 'past';
      } else if (isBlocked) {
        status = 'closed';
      } else if (myReservation) {
        status = 'mine';
      } else if (resource.reservationMode === 'shared-session') {
        status = spotsLeft > 0 ? 'available' : 'reserved';
      } else if (reservationCount > 0) {
        status = 'reserved';
      }

      return {
        start: slot.start,
        end: slot.end,
        status,
        reservationId: myReservation?.id ?? matchingReservations[0]?.id ?? null,
        isMine: !!myReservation,
        reservationCount,
        spotsLeft,
        capacity: resource.capacity,
      } satisfies SportsScheduleSlot;
    }),
  }));
}

export async function listUpcomingSportsReservations(
  db: D1Database,
  userId: string,
): Promise<UpcomingSportsReservation[]> {
  await ensureSportsReservationSchema(db);

  const today = getTodayInReservationTimezone();
  const reservations = await db
    .prepare(
      `SELECT r.id, r.resource_id, s.slug AS resource_slug, r.user_id, r.reservation_date, r.slot_start, r.slot_end, r.status
       FROM sports_reservations r
       JOIN sports_resources s ON s.id = r.resource_id
       WHERE r.user_id = ? AND r.status = 'active' AND r.reservation_date >= ?
       ORDER BY r.reservation_date ASC, r.slot_start ASC`,
    )
    .bind(userId, today)
    .all<ReservationRow>();

  const upcomingReservations: UpcomingSportsReservation[] = [];

  for (const reservation of reservations.results) {
    if (isSlotFinished(reservation.reservation_date, reservation.slot_end)) {
      continue;
    }

    const definition = SPORTS_RESOURCE_MAP.get(reservation.resource_slug);
    if (!definition) {
      continue;
    }

    upcomingReservations.push({
      id: reservation.id,
      reservationDate: reservation.reservation_date,
      slotStart: reservation.slot_start,
      slotEnd: reservation.slot_end,
      resource: hydrateSportsResource(definition),
      canCancel: !isSlotStarted(reservation.reservation_date, reservation.slot_start),
    });
  }

  return upcomingReservations;
}

export async function listRecentSportsReservationsForFollowUp(
  db: D1Database,
  userId: string,
  daysBack = 3,
): Promise<RecentSportsReservationFollowUp[]> {
  await ensureSportsReservationSchema(db);

  const fromDate = addDays(getTodayInReservationTimezone(), -Math.max(daysBack, 0));
  const [reservations, reports] = await Promise.all([
    db
      .prepare(
        `SELECT r.id, r.resource_id, s.slug AS resource_slug, r.user_id, r.reservation_date, r.slot_start, r.slot_end, r.status
         FROM sports_reservations r
         JOIN sports_resources s ON s.id = r.resource_id
         WHERE r.user_id = ? AND r.status = 'active' AND r.reservation_date >= ?
         ORDER BY r.reservation_date DESC, r.slot_start DESC`,
      )
      .bind(userId, fromDate)
      .all<ReservationRow>(),
    db
      .prepare(
        `SELECT reservation_id
         FROM sports_collision_reports
         WHERE reporter_user_id = ? AND source = 'reservation-followup' AND reservation_id IS NOT NULL`,
      )
      .bind(userId)
      .all<{ reservation_id: string | null }>(),
  ]);

  const reportedReservationIds = new Set(
    reports.results
      .map((report) => report.reservation_id)
      .filter((reservationId): reservationId is string => !!reservationId),
  );

  const followUps: RecentSportsReservationFollowUp[] = [];

  for (const reservation of reservations.results) {
    if (!isSlotFinished(reservation.reservation_date, reservation.slot_end)) {
      continue;
    }

    const definition = SPORTS_RESOURCE_MAP.get(reservation.resource_slug);
    if (!definition) {
      continue;
    }

    followUps.push({
      id: reservation.id,
      reservationDate: reservation.reservation_date,
      slotStart: reservation.slot_start,
      slotEnd: reservation.slot_end,
      resource: hydrateSportsResource(definition),
      canCancel: false,
      alreadyReported: reportedReservationIds.has(reservation.id),
    });
  }

  return followUps.slice(0, 6);
}

export async function listSportsCollisionReports(
  db: D1Database,
  options?: {
    fromDate?: string;
    toDate?: string;
    limit?: number;
  },
): Promise<SportsCollisionReport[]> {
  await ensureSportsReservationSchema(db);

  const fromDate = options?.fromDate ?? addDays(getTodayInReservationTimezone(), -3);
  const toDate = options?.toDate ?? getTodayInReservationTimezone();
  const limit = Math.max(options?.limit ?? 20, 1);

  const rows = await db
    .prepare(
      `SELECT c.id, c.reservation_id, c.resource_id, s.slug AS resource_slug, c.reporter_user_id, c.source, c.issue_type, c.collision_date, c.slot_start, c.slot_end, c.notes, c.created_at
       FROM sports_collision_reports c
       JOIN sports_resources s ON s.id = c.resource_id
       WHERE c.collision_date >= ? AND c.collision_date <= ?
       ORDER BY c.collision_date DESC, c.slot_start DESC, c.created_at DESC
       LIMIT ?`,
    )
    .bind(fromDate, toDate, limit)
    .all<CollisionReportRow>();

  return rows.results
    .map((row) => {
      const resource = getSportsResourceBySlug(row.resource_slug);
      if (!resource) return null;

      return {
        id: row.id,
        reservationId: row.reservation_id,
        source: row.source,
        issueType: row.issue_type,
        collisionDate: row.collision_date,
        slotStart: row.slot_start,
        slotEnd: row.slot_end,
        notes: row.notes ?? null,
        createdAt: row.created_at,
        resource,
      } satisfies SportsCollisionReport;
    })
    .filter((report): report is SportsCollisionReport => report !== null);
}

export async function listSportsPilotDistributionLogs(
  db: D1Database,
  options?: {
    fromDate?: string;
    limit?: number;
  },
): Promise<SportsPilotDistributionLog[]> {
  await ensureSportsReservationSchema(db);

  const fromDate = options?.fromDate ?? addDays(getTodayInReservationTimezone(), -14);
  const limit = Math.max(options?.limit ?? 25, 1);

  const rows = await db
    .prepare(
      `SELECT id, distribution_date, location_name, location_type, material_type, quantity, notes, created_at
       FROM sports_pilot_distribution_logs
       WHERE distribution_date >= ?
       ORDER BY distribution_date DESC, created_at DESC
       LIMIT ?`,
    )
    .bind(fromDate, limit)
    .all<DistributionLogRow>();

  return rows.results.map((row) => ({
    id: row.id,
    distributionDate: row.distribution_date,
    locationName: row.location_name,
    locationType: row.location_type,
    materialType: row.material_type,
    quantity: Number(row.quantity ?? 1),
    notes: row.notes ?? null,
    createdAt: row.created_at,
  }));
}

export async function listSportsPilotCoverageBlocks(
  db: D1Database,
  options?: {
    fromDate?: string;
    toDate?: string;
    limit?: number;
  },
): Promise<SportsPilotCoverageBlock[]> {
  await ensureSportsReservationSchema(db);

  const today = getTodayInReservationTimezone();
  const fromDate = options?.fromDate ?? today;
  const toDate = options?.toDate ?? addDays(today, 14);
  const limit = Math.max(options?.limit ?? 24, 1);

  const rows = await db
    .prepare(
      `SELECT id, coverage_date, slot_start, slot_end, role, person_name, focus_area, notes, created_at
       FROM sports_pilot_coverage_blocks
       WHERE is_active = 1 AND coverage_date >= ? AND coverage_date <= ?
       ORDER BY coverage_date ASC, slot_start ASC, created_at ASC
       LIMIT ?`,
    )
    .bind(fromDate, toDate, limit)
    .all<CoverageBlockRow>();

  return rows.results.map((row) => ({
    id: row.id,
    coverageDate: row.coverage_date,
    slotStart: row.slot_start,
    slotEnd: row.slot_end,
    role: row.role,
    personName: row.person_name,
    focusArea: row.focus_area ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at,
  }));
}

export async function getSportsTransparencySnapshot(
  db: D1Database,
  windowDays = RESERVATION_POLICY.bookingWindowDays,
): Promise<SportsTransparencySnapshot> {
  await ensureSportsReservationSchema(db);

  const dates = getReservationDateOptions().slice(0, Math.max(windowDays, 1));
  const startDate = dates[0] ?? getTodayInReservationTimezone();
  const endDate = dates.at(-1) ?? startDate;

  const [resources, reservations, blackouts, collisionReportsResult] = await Promise.all([
    listSportsResources(db),
    db
      .prepare(
        `SELECT r.id, r.resource_id, s.slug AS resource_slug, r.user_id, r.reservation_date, r.slot_start, r.slot_end, r.status
         FROM sports_reservations r
         JOIN sports_resources s ON s.id = r.resource_id
         WHERE r.reservation_date >= ? AND r.reservation_date <= ?`,
      )
      .bind(startDate, endDate)
      .all<ReservationRow>(),
    db
      .prepare(
        `SELECT id, resource_id, blackout_date, slot_start, slot_end, is_active
         FROM sports_blackouts
         WHERE blackout_date >= ? AND blackout_date <= ? AND is_active = 1`,
      )
      .bind(startDate, endDate)
      .all<BlackoutRow>(),
    db
      .prepare(
        `SELECT c.id, c.reservation_id, c.resource_id, s.slug AS resource_slug, c.reporter_user_id, c.source, c.issue_type, c.collision_date, c.slot_start, c.slot_end, c.notes, c.created_at
         FROM sports_collision_reports c
         JOIN sports_resources s ON s.id = c.resource_id
         WHERE c.collision_date >= ? AND c.collision_date <= ?`,
      )
      .bind(startDate, endDate)
      .all<CollisionReportRow>(),
  ]);

  const collisionReports = collisionReportsResult.results;

  const activeReservationMap = new Map<string, number>();
  for (const reservation of reservations.results) {
    if (reservation.status !== 'active') continue;

    const key = `${reservation.resource_id}:${reservation.reservation_date}:${reservation.slot_start}`;
    activeReservationMap.set(key, (activeReservationMap.get(key) ?? 0) + 1);
  }

  const reservationsByResource = new Map<string, ReservationRow[]>();
  for (const reservation of reservations.results) {
    const existing = reservationsByResource.get(reservation.resource_id) ?? [];
    existing.push(reservation);
    reservationsByResource.set(reservation.resource_id, existing);
  }

  const resourceSummaries = resources.map((resource) => ({
    resource,
    totalSlots: 0,
    openSlots: 0,
    reservedSlots: 0,
    closedSlots: 0,
    occupancyPercent: 0,
    totalReservations: (reservationsByResource.get(resource.id) ?? []).length,
    cancelledReservations: (reservationsByResource.get(resource.id) ?? []).filter(
      (reservation) => reservation.status === 'cancelled',
    ).length,
    collisionReports: 0,
  }));

  const resourceSummaryMap = new Map(
    resourceSummaries.map((summary) => [summary.resource.id, summary]),
  );

  const collisionCountsByDate = new Map<string, number>();
  const collisionCountsByResource = new Map<string, number>();
  const collisionCountsBySource = new Map<SportsCollisionSource, number>();

  for (const report of collisionReports) {
    collisionCountsByDate.set(
      report.collision_date,
      (collisionCountsByDate.get(report.collision_date) ?? 0) + 1,
    );
    collisionCountsByResource.set(
      report.resource_id,
      (collisionCountsByResource.get(report.resource_id) ?? 0) + 1,
    );
    collisionCountsBySource.set(report.source, (collisionCountsBySource.get(report.source) ?? 0) + 1);
  }

  for (const summary of resourceSummaries) {
    summary.collisionReports = collisionCountsByResource.get(summary.resource.id) ?? 0;
  }

  const dateSummaries: SportsTransparencyDateSummary[] = [];

  for (const date of dates) {
    const dateSummary: SportsTransparencyDateSummary = {
      date,
      totalSlots: 0,
      openSlots: 0,
      reservedSlots: 0,
      closedSlots: 0,
      occupancyPercent: 0,
      collisionReports: collisionCountsByDate.get(date) ?? 0,
    };

    for (const resource of resources) {
      const resourceSummary = resourceSummaryMap.get(resource.id);
      if (!resourceSummary) continue;

      for (const slot of getTimeSlotsForResource(resource)) {
        if (isSlotStarted(date, slot.start)) {
          continue;
        }

        const slotCapacity = Math.max(resource.capacity, 1);

        const isBlocked = blackouts.results.some(
          (blackout) =>
            blackout.blackout_date === date &&
            (!blackout.resource_id || blackout.resource_id === resource.id) &&
            isTimeRangeBlocked(slot.start, blackout.slot_start, blackout.slot_end),
        );

        const reservationCount =
          activeReservationMap.get(`${resource.id}:${date}:${slot.start}`) ?? 0;
        const reservedPlaces = Math.min(reservationCount, slotCapacity);
        const openPlaces = Math.max(slotCapacity - reservedPlaces, 0);

        dateSummary.totalSlots += slotCapacity;
        resourceSummary.totalSlots += slotCapacity;

        if (isBlocked) {
          dateSummary.closedSlots += slotCapacity;
          resourceSummary.closedSlots += slotCapacity;
          continue;
        }

        dateSummary.reservedSlots += reservedPlaces;
        resourceSummary.reservedSlots += reservedPlaces;
        dateSummary.openSlots += openPlaces;
        resourceSummary.openSlots += openPlaces;
      }
    }

    const dateBookableSlots = dateSummary.openSlots + dateSummary.reservedSlots;
    dateSummary.occupancyPercent =
      dateBookableSlots > 0 ? Math.round((dateSummary.reservedSlots / dateBookableSlots) * 100) : 0;
    dateSummaries.push(dateSummary);
  }

  for (const summary of resourceSummaries) {
    const bookableSlots = summary.openSlots + summary.reservedSlots;
    summary.occupancyPercent =
      bookableSlots > 0 ? Math.round((summary.reservedSlots / bookableSlots) * 100) : 0;
  }

  const totalSlots = dateSummaries.reduce((sum, date) => sum + date.totalSlots, 0);
  const openSlots = dateSummaries.reduce((sum, date) => sum + date.openSlots, 0);
  const reservedSlots = dateSummaries.reduce((sum, date) => sum + date.reservedSlots, 0);
  const closedSlots = dateSummaries.reduce((sum, date) => sum + date.closedSlots, 0);
  const bookableSlots = openSlots + reservedSlots;
  const totalReservations = reservations.results.length;
  const cancelledReservations = reservations.results.filter(
    (reservation) => reservation.status === 'cancelled',
  ).length;
  const completedReservations = reservations.results.filter(
    (reservation) =>
      reservation.status === 'active' &&
      isSlotFinished(reservation.reservation_date, reservation.slot_end),
  ).length;
  const collisionReportsCount = collisionReports.length;
  const busiestSlotCounts = new Map<string, number>();

  for (const reservation of reservations.results) {
    if (reservation.status !== 'active') continue;
    if (isSlotStarted(reservation.reservation_date, reservation.slot_start)) continue;

    busiestSlotCounts.set(
      reservation.slot_start,
      (busiestSlotCounts.get(reservation.slot_start) ?? 0) + 1,
    );
  }

  let busiestStartTime: string | null = null;
  let busiestCount = -1;
  for (const [slotStart, count] of busiestSlotCounts.entries()) {
    if (count > busiestCount) {
      busiestCount = count;
      busiestStartTime = slotStart;
    }
  }

  return {
    startDate,
    endDate,
    totalDays: dates.length,
    totalResources: resources.length,
    totalSlots,
    openSlots,
    reservedSlots,
    closedSlots,
    occupancyPercent: bookableSlots > 0 ? Math.round((reservedSlots / bookableSlots) * 100) : 0,
    activeClosureCount: blackouts.results.length,
    totalReservations,
    cancelledReservations,
    cancellationRatePercent:
      totalReservations > 0 ? Math.round((cancelledReservations / totalReservations) * 100) : 0,
    completedReservations,
    collisionReports: collisionReportsCount,
    collisionRatePercent:
      completedReservations > 0
        ? Math.round((collisionReportsCount / completedReservations) * 100)
        : 0,
    busiestStartTime,
    collisionSourceSummaries: ([
      'reservation-followup',
      'ambassador-report',
      'admin-report',
    ] as SportsCollisionSource[]).map((source) => ({
      source,
      count: collisionCountsBySource.get(source) ?? 0,
    })),
    resourceSummaries,
    dateSummaries,
  };
}

export async function createSportsReservation(
  db: D1Database,
  userId: string,
  input: { resourceSlug: string; reservationDate: string; slotStart: string },
): Promise<{ id: string }> {
  await ensureSportsReservationSchema(db);

  const resource = getSportsResourceBySlug(input.resourceSlug);
  if (!resource) {
    throw new SportsReservationError('Resource not found', 404, 'resource-not-found');
  }

  if (!isWithinReservationWindow(input.reservationDate)) {
    throw new SportsReservationError('Date is outside the booking window', 400, 'outside-window');
  }

  const slot = getTimeSlotsForResource(resource).find((candidate) => candidate.start === input.slotStart);
  if (!slot) {
    throw new SportsReservationError('Invalid time slot', 400, 'invalid-slot');
  }

  if (isSlotStarted(input.reservationDate, input.slotStart)) {
    throw new SportsReservationError('That slot has already started', 409, 'slot-started');
  }

  const [sameDayCount, upcomingReservations, blocked] = await Promise.all([
    db
      .prepare(
        `SELECT COUNT(*) AS cnt
         FROM sports_reservations
         WHERE user_id = ? AND reservation_date = ? AND status = 'active'`,
      )
      .bind(userId, input.reservationDate)
      .first<{ cnt: number }>(),
    db
      .prepare(
        `SELECT reservation_date, slot_end
         FROM sports_reservations
         WHERE user_id = ? AND status = 'active' AND reservation_date >= ?`,
      )
      .bind(userId, getTodayInReservationTimezone())
      .all<{ reservation_date: string; slot_end: string }>(),
    db
      .prepare(
        `SELECT id
         FROM sports_blackouts
         WHERE blackout_date = ?
         AND is_active = 1
         AND (resource_id IS NULL OR resource_id = ?)
         AND ? >= slot_start
         AND ? < slot_end
         LIMIT 1`,
      )
      .bind(input.reservationDate, resource.id, input.slotStart, input.slotStart)
      .first(),
  ]);

  if (Number(sameDayCount?.cnt ?? 0) >= RESERVATION_POLICY.maxReservationsPerDay) {
    throw new SportsReservationError(
      'Daily reservation limit reached',
      409,
      'daily-limit-reached',
    );
  }

  const activeUpcomingCount = upcomingReservations.results.filter(
    (reservation) => !isSlotFinished(reservation.reservation_date, reservation.slot_end),
  ).length;

  if (activeUpcomingCount >= RESERVATION_POLICY.maxUpcomingReservations) {
    throw new SportsReservationError(
      'Upcoming reservation limit reached',
      409,
      'upcoming-limit-reached',
    );
  }

  if (blocked) {
    throw new SportsReservationError('That slot is closed', 409, 'slot-closed');
  }

  const reservationId = generateId();
  const timestamp = now();
  let insertResult;

  try {
    insertResult = await db
      .prepare(
        `INSERT INTO sports_reservations
         (id, resource_id, user_id, reservation_date, slot_start, slot_end, status, created_at, updated_at)
         SELECT ?, ?, ?, ?, ?, ?, 'active', ?, ?
         WHERE (
           SELECT COUNT(*)
           FROM sports_reservations
           WHERE resource_id = ? AND reservation_date = ? AND slot_start = ? AND status = 'active'
         ) < ?`,
      )
      .bind(
        reservationId,
        resource.id,
        userId,
        input.reservationDate,
        slot.start,
        slot.end,
        timestamp,
        timestamp,
        resource.id,
        input.reservationDate,
        slot.start,
        resource.capacity,
      )
      .run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('idx_sports_reservations_user_slot')) {
      throw new SportsReservationError(
        'You already have a reservation at that time',
        409,
        'user-slot-conflict',
      );
    }

    throw error;
  }

  if (!insertResult || getD1MetaNumber(insertResult.meta, 'changes') < 1) {
    throw new SportsReservationError(
      resource.reservationMode === 'shared-session'
        ? 'That session is already full'
        : 'That slot is already reserved',
      409,
      resource.reservationMode === 'shared-session' ? 'session-full' : 'slot-taken',
    );
  }

  await logReservationAction(db, reservationId, resource.id, userId, 'created');

  return { id: reservationId };
}

export async function createSportsCollisionReport(
  db: D1Database,
  input: {
    reporterUserId: string;
    source: SportsCollisionSource;
    issueType: SportsCollisionIssueType;
    reservationId?: string | null;
    resourceSlug?: string | null;
    collisionDate?: string | null;
    slotStart?: string | null;
    slotEnd?: string | null;
    notes?: string | null;
  },
): Promise<{ id: string }> {
  await ensureSportsReservationSchema(db);

  if (!isValidCollisionSource(input.source)) {
    throw new SportsReservationError('Invalid collision report source', 400, 'invalid-collision-source');
  }

  if (!isValidCollisionIssueType(input.issueType)) {
    throw new SportsReservationError('Invalid collision report type', 400, 'invalid-collision-type');
  }

  const trimmedNotes = input.notes?.trim() ?? '';
  if (trimmedNotes.length > 500) {
    throw new SportsReservationError('Notes must be 500 characters or fewer', 400, 'collision-notes-too-long');
  }

  const collisionReportId = generateId();
  const timestamp = now();
  const today = getTodayInReservationTimezone();

  if (input.source === 'reservation-followup') {
    const reservationId = input.reservationId?.trim() ?? '';
    if (!reservationId) {
      throw new SportsReservationError('Reservation is required', 400, 'collision-reservation-required');
    }

    const [reservation, existingReport] = await Promise.all([
      db
        .prepare(
          `SELECT r.id, r.resource_id, s.slug AS resource_slug, r.user_id, r.reservation_date, r.slot_start, r.slot_end, r.status
           FROM sports_reservations r
           JOIN sports_resources s ON s.id = r.resource_id
           WHERE r.id = ?`,
        )
        .bind(reservationId)
        .first<ReservationRow>(),
      db
        .prepare(
          `SELECT id
           FROM sports_collision_reports
           WHERE reservation_id = ? AND reporter_user_id = ? AND source = 'reservation-followup'
           LIMIT 1`,
        )
        .bind(reservationId, input.reporterUserId)
        .first<{ id: string }>(),
    ]);

    if (!reservation) {
      throw new SportsReservationError('Reservation not found', 404, 'reservation-not-found');
    }

    if (reservation.user_id !== input.reporterUserId) {
      throw new SportsReservationError('Not authorized', 403, 'not-authorized');
    }

    if (reservation.status !== 'active') {
      throw new SportsReservationError(
        'Only completed reservations can be used for collision follow-up',
        409,
        'collision-reservation-inactive',
      );
    }

    if (!isSlotFinished(reservation.reservation_date, reservation.slot_end)) {
      throw new SportsReservationError(
        'Collision follow-up opens after the reservation ends',
        409,
        'collision-reservation-not-finished',
      );
    }

    if (reservation.reservation_date < addDays(today, -3)) {
      throw new SportsReservationError(
        'Collision follow-up is limited to the last 3 days',
        409,
        'collision-report-window-closed',
      );
    }

    if (existingReport) {
      throw new SportsReservationError(
        'You already submitted follow-up for that reservation',
        409,
        'collision-already-reported',
      );
    }

    await db
      .prepare(
        `INSERT INTO sports_collision_reports
         (id, reservation_id, resource_id, reporter_user_id, source, issue_type, collision_date, slot_start, slot_end, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        collisionReportId,
        reservation.id,
        reservation.resource_id,
        input.reporterUserId,
        input.source,
        input.issueType,
        reservation.reservation_date,
        reservation.slot_start,
        reservation.slot_end,
        trimmedNotes || null,
        timestamp,
      )
      .run();

    return { id: collisionReportId };
  }

  const resourceSlug = input.resourceSlug?.trim() ?? '';
  const collisionDate = input.collisionDate?.trim() ?? '';
  const slotStart = input.slotStart?.trim() ?? '';
  const slotEnd = input.slotEnd?.trim() ?? '';
  const resource = getSportsResourceBySlug(resourceSlug);

  if (!resource) {
    throw new SportsReservationError('Resource not found', 404, 'resource-not-found');
  }

  if (!isReservationDate(collisionDate)) {
    throw new SportsReservationError('Invalid collision date', 400, 'invalid-collision-date');
  }

  const earliestDate = addDays(today, -3);
  if (collisionDate < earliestDate || collisionDate > today) {
    throw new SportsReservationError(
      'Collision date must be today or within the last 3 days',
      400,
      'collision-date-outside-window',
    );
  }

  if (!isValidSlotBoundary(slotStart, 'start') || !isValidSlotBoundary(slotEnd, 'end')) {
    throw new SportsReservationError('Invalid collision time range', 400, 'invalid-collision-range');
  }

  if (parseTimeToMinutes(slotStart) >= parseTimeToMinutes(slotEnd)) {
    throw new SportsReservationError('Collision end must be after start', 400, 'invalid-collision-range');
  }

  if (!isSlotStarted(collisionDate, slotStart)) {
    throw new SportsReservationError(
      'Collision logging is only for slots that have already started',
      409,
      'collision-slot-not-started',
    );
  }

  await db
    .prepare(
      `INSERT INTO sports_collision_reports
       (id, reservation_id, resource_id, reporter_user_id, source, issue_type, collision_date, slot_start, slot_end, notes, created_at)
       VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      collisionReportId,
      resource.id,
      input.reporterUserId,
      input.source,
      input.issueType,
      collisionDate,
      slotStart,
      slotEnd,
      trimmedNotes || null,
      timestamp,
    )
    .run();

  return { id: collisionReportId };
}

export async function createSportsPilotDistributionLog(
  db: D1Database,
  input: {
    distributedByUserId: string;
    distributionDate: string;
    locationName: string;
    locationType: SportsPilotDistributionLocationType;
    materialType: SportsPilotDistributionMaterialType;
    quantity: number;
    notes?: string | null;
  },
): Promise<{ id: string }> {
  await ensureSportsReservationSchema(db);

  if (!isReservationDate(input.distributionDate)) {
    throw new SportsReservationError(
      'Invalid distribution date',
      400,
      'invalid-distribution-date',
    );
  }

  const today = getTodayInReservationTimezone();
  const earliestDate = addDays(today, -14);
  if (input.distributionDate < earliestDate || input.distributionDate > today) {
    throw new SportsReservationError(
      'Distribution date must be today or within the last 14 days',
      400,
      'distribution-date-outside-window',
    );
  }

  if (!isValidDistributionLocationType(input.locationType)) {
    throw new SportsReservationError(
      'Invalid distribution location type',
      400,
      'invalid-distribution-location-type',
    );
  }

  if (!isValidDistributionMaterialType(input.materialType)) {
    throw new SportsReservationError(
      'Invalid distribution material type',
      400,
      'invalid-distribution-material-type',
    );
  }

  const locationName = input.locationName.trim();
  if (locationName.length < 2 || locationName.length > 120) {
    throw new SportsReservationError(
      'Location name must be between 2 and 120 characters',
      400,
      'distribution-location-name-invalid',
    );
  }

  const quantity = Math.trunc(Number(input.quantity));
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 500) {
    throw new SportsReservationError(
      'Quantity must be between 1 and 500',
      400,
      'distribution-quantity-invalid',
    );
  }

  const notes = input.notes?.trim() ?? '';
  if (notes.length > 300) {
    throw new SportsReservationError(
      'Notes must be 300 characters or fewer',
      400,
      'distribution-notes-too-long',
    );
  }

  const distributionLogId = generateId();
  await db
    .prepare(
      `INSERT INTO sports_pilot_distribution_logs
       (id, distributed_by_user_id, distribution_date, location_name, location_type, material_type, quantity, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      distributionLogId,
      input.distributedByUserId,
      input.distributionDate,
      locationName,
      input.locationType,
      input.materialType,
      quantity,
      notes || null,
      now(),
    )
    .run();

  return { id: distributionLogId };
}

export async function createSportsPilotCoverageBlock(
  db: D1Database,
  input: {
    scheduledByUserId: string;
    coverageDate: string;
    slotStart: string;
    slotEnd: string;
    role: SportsPilotCoverageRole;
    personName: string;
    focusArea?: string | null;
    notes?: string | null;
  },
): Promise<{ id: string }> {
  await ensureSportsReservationSchema(db);

  if (!isReservationDate(input.coverageDate)) {
    throw new SportsReservationError('Invalid coverage date', 400, 'invalid-coverage-date');
  }

  const today = getTodayInReservationTimezone();
  const latestDate = addDays(today, 14);
  if (input.coverageDate < today || input.coverageDate > latestDate) {
    throw new SportsReservationError(
      'Coverage date must be today or within the next 14 days',
      400,
      'coverage-date-outside-window',
    );
  }

  if (!isValidSlotBoundary(input.slotStart, 'start') || !isValidSlotBoundary(input.slotEnd, 'end')) {
    throw new SportsReservationError('Invalid coverage time range', 400, 'invalid-coverage-range');
  }

  if (parseTimeToMinutes(input.slotStart) >= parseTimeToMinutes(input.slotEnd)) {
    throw new SportsReservationError('Coverage end must be after start', 400, 'invalid-coverage-range');
  }

  if (!isValidCoverageRole(input.role)) {
    throw new SportsReservationError('Invalid coverage role', 400, 'invalid-coverage-role');
  }

  const personName = input.personName.trim();
  if (personName.length < 2 || personName.length > 80) {
    throw new SportsReservationError(
      'Person name must be between 2 and 80 characters',
      400,
      'coverage-person-name-invalid',
    );
  }

  const focusArea = input.focusArea?.trim() ?? '';
  if (focusArea.length > 140) {
    throw new SportsReservationError(
      'Focus area must be 140 characters or fewer',
      400,
      'coverage-focus-too-long',
    );
  }

  const notes = input.notes?.trim() ?? '';
  if (notes.length > 300) {
    throw new SportsReservationError(
      'Notes must be 300 characters or fewer',
      400,
      'coverage-notes-too-long',
    );
  }

  const overlappingBlock = await db
    .prepare(
      `SELECT id
       FROM sports_pilot_coverage_blocks
       WHERE is_active = 1
       AND coverage_date = ?
       AND lower(person_name) = lower(?)
       AND NOT (? >= slot_end OR ? <= slot_start)
       LIMIT 1`,
    )
    .bind(input.coverageDate, personName, input.slotStart, input.slotEnd)
    .first<{ id: string }>();

  if (overlappingBlock) {
    throw new SportsReservationError(
      'That person already has an overlapping coverage block',
      409,
      'coverage-overlap',
    );
  }

  const coverageId = generateId();
  await db
    .prepare(
      `INSERT INTO sports_pilot_coverage_blocks
       (id, scheduled_by_user_id, coverage_date, slot_start, slot_end, role, person_name, focus_area, notes, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    )
    .bind(
      coverageId,
      input.scheduledByUserId,
      input.coverageDate,
      input.slotStart,
      input.slotEnd,
      input.role,
      personName,
      focusArea || null,
      notes || null,
      now(),
    )
    .run();

  return { id: coverageId };
}

export async function createSportsBlackout(
  db: D1Database,
  input: {
    resourceSlug?: string | null;
    blackoutDate: string;
    slotStart: string;
    slotEnd: string;
    reason?: string | null;
  },
): Promise<{ id: string }> {
  await ensureSportsReservationSchema(db);

  if (!isWithinReservationWindow(input.blackoutDate)) {
    throw new SportsReservationError('Date is outside the booking window', 400, 'outside-window');
  }

  if (!isValidSlotBoundary(input.slotStart, 'start') || !isValidSlotBoundary(input.slotEnd, 'end')) {
    throw new SportsReservationError('Invalid blackout time range', 400, 'invalid-blackout-range');
  }

  if (parseTimeToMinutes(input.slotStart) >= parseTimeToMinutes(input.slotEnd)) {
    throw new SportsReservationError('Blackout end must be after start', 400, 'invalid-blackout-range');
  }

  if (isSlotFinished(input.blackoutDate, input.slotEnd)) {
    throw new SportsReservationError(
      'That blackout window has already ended',
      409,
      'blackout-window-ended',
    );
  }

  const trimmedReason = input.reason?.trim() ?? '';
  if (trimmedReason.length > 200) {
    throw new SportsReservationError('Reason must be 200 characters or fewer', 400, 'reason-too-long');
  }

  const normalizedResourceSlug =
    input.resourceSlug && input.resourceSlug !== 'all' ? input.resourceSlug : null;
  const resource = normalizedResourceSlug ? getSportsResourceBySlug(normalizedResourceSlug) : null;

  if (normalizedResourceSlug && !resource) {
    throw new SportsReservationError('Resource not found', 404, 'resource-not-found');
  }

  const resourceId = resource?.id ?? null;

  const [overlappingBlackout, conflictingReservation] = await Promise.all([
    db
      .prepare(
        `SELECT id
         FROM sports_blackouts
         WHERE blackout_date = ?
         AND is_active = 1
         AND (resource_id IS NULL OR ? IS NULL OR resource_id = ?)
         AND NOT (? >= slot_end OR ? <= slot_start)
         LIMIT 1`,
      )
      .bind(input.blackoutDate, resourceId, resourceId, input.slotStart, input.slotEnd)
      .first<{ id: string }>(),
    db
      .prepare(
        `SELECT id
         FROM sports_reservations
         WHERE reservation_date = ?
         AND status = 'active'
         AND (? IS NULL OR resource_id = ?)
         AND NOT (? >= slot_end OR ? <= slot_start)
         LIMIT 1`,
      )
      .bind(input.blackoutDate, resourceId, resourceId, input.slotStart, input.slotEnd)
      .first<{ id: string }>(),
  ]);

  if (overlappingBlackout) {
    throw new SportsReservationError(
      'That closure overlaps an existing blackout',
      409,
      'overlapping-blackout',
    );
  }

  if (conflictingReservation) {
    throw new SportsReservationError(
      'That closure overlaps existing reservations',
      409,
      'blackout-has-reservations',
    );
  }

  const blackoutId = generateId();
  await db
    .prepare(
      `INSERT INTO sports_blackouts
       (id, resource_id, blackout_date, slot_start, slot_end, reason, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
    )
    .bind(
      blackoutId,
      resourceId,
      input.blackoutDate,
      input.slotStart,
      input.slotEnd,
      trimmedReason || null,
      now(),
    )
    .run();

  return { id: blackoutId };
}

export async function cancelSportsReservation(
  db: D1Database,
  userId: string,
  reservationId: string,
): Promise<void> {
  await ensureSportsReservationSchema(db);

  const reservation = await db
    .prepare(
      `SELECT id, resource_id, user_id, reservation_date, slot_start, slot_end, status
       FROM sports_reservations
       WHERE id = ?`,
    )
    .bind(reservationId)
    .first<{
      id: string;
      resource_id: string;
      user_id: string;
      reservation_date: string;
      slot_start: string;
      slot_end: string;
      status: string;
    }>();

  if (!reservation) {
    throw new SportsReservationError('Reservation not found', 404, 'reservation-not-found');
  }

  if (reservation.user_id !== userId) {
    throw new SportsReservationError('Not authorized', 403, 'not-authorized');
  }

  if (reservation.status !== 'active') {
    throw new SportsReservationError(
      'Reservation is no longer active',
      409,
      'reservation-inactive',
    );
  }

  if (isSlotStarted(reservation.reservation_date, reservation.slot_start)) {
    throw new SportsReservationError(
      'This reservation can no longer be cancelled',
      409,
      'cancellation-closed',
    );
  }

  await db
    .prepare(
      `UPDATE sports_reservations
       SET status = 'cancelled', updated_at = ?, cancelled_at = ?, cancelled_by_user_id = ?
       WHERE id = ?`,
    )
    .bind(now(), now(), userId, reservationId)
    .run();

  await logReservationAction(db, reservationId, reservation.resource_id, userId, 'cancelled');
}

export async function deactivateSportsBlackout(
  db: D1Database,
  blackoutId: string,
): Promise<void> {
  await ensureSportsReservationSchema(db);

  const blackout = await db
    .prepare('SELECT id, is_active FROM sports_blackouts WHERE id = ?')
    .bind(blackoutId)
    .first<{ id: string; is_active: number }>();

  if (!blackout || Number(blackout.is_active ?? 0) !== 1) {
    throw new SportsReservationError('Blackout not found', 404, 'blackout-not-found');
  }

  await db
    .prepare('UPDATE sports_blackouts SET is_active = 0 WHERE id = ?')
    .bind(blackoutId)
    .run();
}

export async function deactivateSportsPilotCoverageBlock(
  db: D1Database,
  coverageId: string,
): Promise<void> {
  await ensureSportsReservationSchema(db);

  const coverageBlock = await db
    .prepare('SELECT id, is_active FROM sports_pilot_coverage_blocks WHERE id = ?')
    .bind(coverageId)
    .first<{ id: string; is_active: number }>();

  if (!coverageBlock || Number(coverageBlock.is_active ?? 0) !== 1) {
    throw new SportsReservationError('Coverage block not found', 404, 'coverage-block-not-found');
  }

  await db
    .prepare('UPDATE sports_pilot_coverage_blocks SET is_active = 0 WHERE id = ?')
    .bind(coverageId)
    .run();
}
