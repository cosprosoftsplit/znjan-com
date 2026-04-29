/**
 * Authentication utilities — Google OAuth + session-based auth
 */

import type { D1Database } from './db';
import { generateId, now } from './db';

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
  google_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: string;
}

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getCookieSecurityAttribute(requestUrl: URL | string): string {
  const url = typeof requestUrl === 'string' ? new URL(requestUrl) : requestUrl;
  return url.protocol === 'https:' ? '; Secure' : '';
}

/** Find or create a user from Google OAuth data */
export async function findOrCreateGoogleUser(
  db: D1Database,
  googleId: string,
  email: string,
  name: string,
  avatarUrl: string | null,
): Promise<User> {
  // 1. Try to find by google_id
  let user = await db
    .prepare('SELECT * FROM users WHERE google_id = ?')
    .bind(googleId)
    .first<User>();

  if (user) return user;

  // 2. Fallback: find by email (links existing magic-link accounts)
  user = await db
    .prepare('SELECT * FROM users WHERE email = ?')
    .bind(email.toLowerCase().trim())
    .first<User>();

  if (user) {
    // Link Google account to existing user
    await db
      .prepare('UPDATE users SET google_id = ?, avatar_url = COALESCE(avatar_url, ?), display_name = CASE WHEN display_name = ? THEN ? ELSE display_name END, updated_at = ? WHERE id = ?')
      .bind(googleId, avatarUrl, email.split('@')[0], name, now(), user.id)
      .run();

    return (await db.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first<User>())!;
  }

  // 3. Create new user
  const userId = generateId();
  const timestamp = now();
  await db
    .prepare(
      'INSERT INTO users (id, email, display_name, avatar_url, locale, points, level, role, google_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, 1, ?, ?, ?, ?)',
    )
    .bind(userId, email.toLowerCase().trim(), name, avatarUrl, 'en', 'user', googleId, timestamp, timestamp)
    .run();

  return (await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<User>())!;
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

/** Create a session for a user */
export async function createSession(db: D1Database, userId: string): Promise<string> {
  const sessionId = generateId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  await db
    .prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(sessionId, userId, expiresAt)
    .run();
  return sessionId;
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
export function createSessionCookie(sessionId: string, requestUrl: URL | string): string {
  const expires = new Date(Date.now() + SESSION_DURATION_MS).toUTCString();
  return `znjan_session=${sessionId}; Path=/; HttpOnly${getCookieSecurityAttribute(requestUrl)}; SameSite=Lax; Expires=${expires}`;
}

/** Create Set-Cookie header to clear session */
export function clearSessionCookie(requestUrl: URL | string): string {
  return `znjan_session=; Path=/; HttpOnly${getCookieSecurityAttribute(requestUrl)}; SameSite=Lax; Max-Age=0`;
}

/** Create Set-Cookie header for OAuth state */
export function createOauthStateCookie(nonce: string, requestUrl: URL | string): string {
  return `oauth_state=${nonce}; Path=/; HttpOnly${getCookieSecurityAttribute(requestUrl)}; SameSite=Lax; Max-Age=600`;
}

/** Create Set-Cookie header to clear OAuth state */
export function clearOauthStateCookie(requestUrl: URL | string): string {
  return `oauth_state=; Path=/; HttpOnly${getCookieSecurityAttribute(requestUrl)}; SameSite=Lax; Max-Age=0`;
}
