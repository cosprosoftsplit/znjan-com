/**
 * Authentication utilities — magic link + session-based auth
 */

import type { D1Database } from './db';
import { generateId, generateToken, now } from './db';

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  locale: string;
  bio: string | null;
  points: number;
  level: number;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: string;
}

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAGIC_LINK_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const MAX_MAGIC_LINKS_PER_HOUR = 5;

/** Create a magic link for email login */
export async function createMagicLink(
  db: D1Database,
  email: string,
): Promise<{ token: string } | { error: string }> {
  // Rate limiting: max 5 unused links per email
  const recentCount = await db
    .prepare('SELECT COUNT(*) as cnt FROM magic_links WHERE email = ? AND used = 0')
    .bind(email)
    .first<{ cnt: number }>();

  if (recentCount && recentCount.cnt >= MAX_MAGIC_LINKS_PER_HOUR) {
    return { error: 'Too many login attempts. Please try again later.' };
  }

  const id = generateId();
  const token = generateToken();
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MS).toISOString();

  await db
    .prepare('INSERT INTO magic_links (id, email, token, expires_at, used) VALUES (?, ?, ?, ?, 0)')
    .bind(id, email.toLowerCase().trim(), token, expiresAt)
    .run();

  return { token };
}

/** Verify a magic link token and create a session */
export async function verifyMagicLink(
  db: D1Database,
  token: string,
): Promise<{ sessionId: string; user: User } | { error: string }> {
  const link = await db
    .prepare('SELECT * FROM magic_links WHERE token = ? AND used = 0')
    .bind(token)
    .first<{ id: string; email: string; token: string; expires_at: string; used: number }>();

  if (!link) {
    return { error: 'Invalid or expired link.' };
  }

  if (new Date(link.expires_at) < new Date()) {
    await db.prepare('UPDATE magic_links SET used = 1 WHERE id = ?').bind(link.id).run();
    return { error: 'This link has expired. Please request a new one.' };
  }

  // Mark as used
  await db.prepare('UPDATE magic_links SET used = 1 WHERE id = ?').bind(link.id).run();

  // Find or create user
  let user = await db
    .prepare('SELECT * FROM users WHERE email = ?')
    .bind(link.email)
    .first<User>();

  if (!user) {
    const userId = generateId();
    const timestamp = now();
    const displayName = link.email.split('@')[0];
    await db
      .prepare(
        'INSERT INTO users (id, email, display_name, locale, points, level, role, created_at, updated_at) VALUES (?, ?, ?, ?, 0, 1, ?, ?, ?)',
      )
      .bind(userId, link.email, displayName, 'en', 'user', timestamp, timestamp)
      .run();

    user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<User>();
  }

  if (!user) {
    return { error: 'Failed to create user.' };
  }

  // Create session
  const sessionId = generateId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  await db
    .prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(sessionId, user.id, expiresAt)
    .run();

  return { sessionId, user };
}

/** Get user from session cookie */
export async function getUserFromSession(
  db: D1Database,
  sessionId: string | undefined,
): Promise<User | null> {
  if (!sessionId) return null;

  const session = await db
    .prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > ?')
    .bind(sessionId, now())
    .first<Session>();

  if (!session) return null;

  return db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user_id).first<User>();
}

/** Delete a session (logout) */
export async function deleteSession(db: D1Database, sessionId: string): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
}

/** Parse session ID from cookie header */
export function getSessionIdFromCookie(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(/znjan_session=([^;]+)/);
  return match?.[1];
}

/** Create Set-Cookie header for session */
export function createSessionCookie(sessionId: string): string {
  const expires = new Date(Date.now() + SESSION_DURATION_MS).toUTCString();
  return `znjan_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expires}`;
}

/** Create Set-Cookie header to clear session */
export function clearSessionCookie(): string {
  return 'znjan_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
}
