import type { D1Database } from './db';
import { generateId, now } from './db';

export type PilotSupportSignalType =
  | 'local-intro'
  | 'on-site-help'
  | 'venue-connection'
  | 'pilot-feedback';

export type PilotSupportSignalStatus = 'new' | 'followed-up' | 'handled';

export interface PilotSupportSignal {
  id: string;
  signalType: PilotSupportSignalType;
  status: PilotSupportSignalStatus;
  name: string;
  contact: string;
  availability: string | null;
  notes: string;
  followUpNote: string | null;
  createdAt: string;
  triageUpdatedAt: string;
}

export interface PilotSupportSignalSummary {
  total: number;
  newCount: number;
  followedUpCount: number;
  handledCount: number;
}

type PilotSupportSignalRow = {
  id: string;
  signal_type: PilotSupportSignalType;
  triage_status: PilotSupportSignalStatus;
  name: string;
  contact: string;
  availability: string | null;
  notes: string;
  follow_up_note: string | null;
  created_at: string;
  triage_updated_at: string | null;
};

type PilotSupportSchemaColumnRow = {
  name: string;
};

type PilotSupportSignalSummaryRow = {
  triage_status: PilotSupportSignalStatus;
  total: number;
};

const PILOT_SUPPORT_TABLE_STATEMENT = `CREATE TABLE IF NOT EXISTS pilot_support_signals (
  id TEXT PRIMARY KEY,
  signal_type TEXT NOT NULL,
  triage_status TEXT NOT NULL DEFAULT 'new',
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  availability TEXT,
  notes TEXT NOT NULL,
  follow_up_note TEXT,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  triage_updated_at TEXT
)`;

const PILOT_SUPPORT_INDEX_STATEMENTS = [
  `CREATE INDEX IF NOT EXISTS idx_pilot_support_signals_created
    ON pilot_support_signals(created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_pilot_support_signals_type
    ON pilot_support_signals(signal_type)`,
  `CREATE INDEX IF NOT EXISTS idx_pilot_support_signals_status
    ON pilot_support_signals(triage_status, is_archived, created_at DESC)`,
] as const;

let pilotSupportSchemaPromise: Promise<void> | null = null;

function isValidPilotSupportSignalType(value: string): value is PilotSupportSignalType {
  return (
    value === 'local-intro' ||
    value === 'on-site-help' ||
    value === 'venue-connection' ||
    value === 'pilot-feedback'
  );
}

function isValidPilotSupportSignalStatus(value: string): value is PilotSupportSignalStatus {
  return value === 'new' || value === 'followed-up' || value === 'handled';
}

export async function ensurePilotSupportSchema(db: D1Database): Promise<void> {
  if (!pilotSupportSchemaPromise) {
    pilotSupportSchemaPromise = (async () => {
      await db.prepare(PILOT_SUPPORT_TABLE_STATEMENT).run();

      const columnRows = await db
        .prepare(`PRAGMA table_info(pilot_support_signals)`)
        .all<PilotSupportSchemaColumnRow>();
      const columns = new Set(columnRows.results.map((row) => row.name));

      if (!columns.has('triage_status')) {
        await db
          .prepare(
            `ALTER TABLE pilot_support_signals
             ADD COLUMN triage_status TEXT NOT NULL DEFAULT 'new'`,
          )
          .run();
      }

      if (!columns.has('triage_updated_at')) {
        await db
          .prepare(`ALTER TABLE pilot_support_signals ADD COLUMN triage_updated_at TEXT`)
          .run();
      }

      if (!columns.has('follow_up_note')) {
        await db
          .prepare(`ALTER TABLE pilot_support_signals ADD COLUMN follow_up_note TEXT`)
          .run();
      }

      await db
        .prepare(
          `UPDATE pilot_support_signals
           SET triage_updated_at = COALESCE(triage_updated_at, created_at)
           WHERE triage_updated_at IS NULL`,
        )
        .run();

      for (const statement of PILOT_SUPPORT_INDEX_STATEMENTS) {
        await db.prepare(statement).run();
      }
    })().catch((error) => {
      pilotSupportSchemaPromise = null;
      throw error;
    });
  }

  await pilotSupportSchemaPromise;
}

export async function listPilotSupportSignals(
  db: D1Database,
  options?: { limit?: number },
): Promise<PilotSupportSignal[]> {
  await ensurePilotSupportSchema(db);

  const limit = Math.max(options?.limit ?? 12, 1);
  const rows = await db
    .prepare(
      `SELECT id, signal_type, triage_status, name, contact, availability, notes, follow_up_note, created_at, triage_updated_at
       FROM pilot_support_signals
       WHERE is_archived = 0
       ORDER BY
         CASE triage_status
           WHEN 'new' THEN 0
           WHEN 'followed-up' THEN 1
           WHEN 'handled' THEN 2
           ELSE 3
         END,
         created_at DESC
       LIMIT ?`,
    )
    .bind(limit)
    .all<PilotSupportSignalRow>();

  return rows.results.map((row) => ({
    id: row.id,
    signalType: row.signal_type,
    status: row.triage_status,
    name: row.name,
    contact: row.contact,
    availability: row.availability ?? null,
    notes: row.notes,
    followUpNote: row.follow_up_note ?? null,
    createdAt: row.created_at,
    triageUpdatedAt: row.triage_updated_at ?? row.created_at,
  }));
}

export async function getPilotSupportSignalSummary(
  db: D1Database,
): Promise<PilotSupportSignalSummary> {
  await ensurePilotSupportSchema(db);

  const rows = await db
    .prepare(
      `SELECT triage_status, COUNT(*) as total
       FROM pilot_support_signals
       WHERE is_archived = 0
       GROUP BY triage_status`,
    )
    .all<PilotSupportSignalSummaryRow>();

  const summary: PilotSupportSignalSummary = {
    total: 0,
    newCount: 0,
    followedUpCount: 0,
    handledCount: 0,
  };

  for (const row of rows.results) {
    summary.total += row.total;
    if (row.triage_status === 'new') {
      summary.newCount = row.total;
    } else if (row.triage_status === 'followed-up') {
      summary.followedUpCount = row.total;
    } else if (row.triage_status === 'handled') {
      summary.handledCount = row.total;
    }
  }

  return summary;
}

export async function createPilotSupportSignal(
  db: D1Database,
  input: {
    signalType: PilotSupportSignalType;
    name: string;
    contact: string;
    availability?: string | null;
    notes: string;
  },
): Promise<{ id: string }> {
  await ensurePilotSupportSchema(db);

  if (!isValidPilotSupportSignalType(input.signalType)) {
    throw new Error('Invalid support signal type');
  }

  const name = input.name.trim();
  if (name.length < 2 || name.length > 80) {
    throw new Error('Name must be between 2 and 80 characters');
  }

  const contact = input.contact.trim();
  if (contact.length < 5 || contact.length > 160) {
    throw new Error('Contact must be between 5 and 160 characters');
  }

  const availability = input.availability?.trim() ?? '';
  if (availability.length > 140) {
    throw new Error('Availability must be 140 characters or fewer');
  }

  const notes = input.notes.trim();
  if (notes.length < 10 || notes.length > 600) {
    throw new Error('Notes must be between 10 and 600 characters');
  }

  const id = generateId();
  await db
    .prepare(
      `INSERT INTO pilot_support_signals
       (id, signal_type, triage_status, name, contact, availability, notes, is_archived, created_at, triage_updated_at)
       VALUES (?, ?, 'new', ?, ?, ?, ?, 0, ?, ?)`,
    )
    .bind(id, input.signalType, name, contact, availability || null, notes, now(), now())
    .run();

  return { id };
}

export async function updatePilotSupportSignalStatus(
  db: D1Database,
  id: string,
  status: PilotSupportSignalStatus,
): Promise<void> {
  await ensurePilotSupportSchema(db);

  if (!isValidPilotSupportSignalStatus(status)) {
    throw new Error('Invalid support signal status');
  }

  const existing = await db
    .prepare(
      `SELECT id
       FROM pilot_support_signals
       WHERE id = ?
         AND is_archived = 0`,
    )
    .bind(id)
    .first<{ id: string }>();

  if (!existing) {
    throw new Error('Support signal not found');
  }

  await db
    .prepare(
      `UPDATE pilot_support_signals
       SET triage_status = ?, triage_updated_at = ?
       WHERE id = ?`,
    )
    .bind(status, now(), id)
    .run();
}

export async function updatePilotSupportSignalFollowUpNote(
  db: D1Database,
  id: string,
  followUpNote: string,
): Promise<void> {
  await ensurePilotSupportSchema(db);

  const normalizedNote = followUpNote.trim();
  if (normalizedNote.length > 500) {
    throw new Error('Follow-up note must be 500 characters or fewer');
  }

  const existing = await db
    .prepare(
      `SELECT id
       FROM pilot_support_signals
       WHERE id = ?
         AND is_archived = 0`,
    )
    .bind(id)
    .first<{ id: string }>();

  if (!existing) {
    throw new Error('Support signal not found');
  }

  await db
    .prepare(
      `UPDATE pilot_support_signals
       SET follow_up_note = ?, triage_updated_at = ?
       WHERE id = ?`,
    )
    .bind(normalizedNote || null, now(), id)
    .run();
}

export async function archivePilotSupportSignal(db: D1Database, id: string): Promise<void> {
  await ensurePilotSupportSchema(db);

  const existing = await db
    .prepare(
      `SELECT id
       FROM pilot_support_signals
       WHERE id = ?
         AND is_archived = 0`,
    )
    .bind(id)
    .first<{ id: string }>();

  if (!existing) {
    throw new Error('Support signal not found');
  }

  await db
    .prepare(
      `UPDATE pilot_support_signals
       SET is_archived = 1, triage_updated_at = ?
       WHERE id = ?`,
    )
    .bind(now(), id)
    .run();
}
