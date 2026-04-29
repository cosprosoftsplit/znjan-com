/**
 * Gamification system — points, levels, badges
 */

import type { D1Database } from './db';
import { generateId, now } from './db';

/** Point values per action */
export const POINT_VALUES: Record<string, number> = {
  'create-post': 10,
  'post-approved': 5,
  'leave-comment': 3,
  'join-meetup': 5,
  'organize-meetup': 15,
  'first-post': 20,
  'daily-login': 1,
  'complete-profile': 10,
};

/** Level thresholds */
export const LEVELS = [
  { level: 1, name: 'Beach Newbie', minPoints: 0 },
  { level: 2, name: 'Sand Walker', minPoints: 25 },
  { level: 3, name: 'Wave Rider', minPoints: 75 },
  { level: 4, name: 'Beach Regular', minPoints: 150 },
  { level: 5, name: 'Seaside Explorer', minPoints: 300 },
  { level: 6, name: 'Ocean Lover', minPoints: 500 },
  { level: 7, name: 'Beach Ambassador', minPoints: 800 },
  { level: 8, name: 'Žnjan Legend', minPoints: 1200 },
] as const;

/** Badge definitions */
export const BADGES = {
  'first-post': { name: 'First Post', description: 'Created your first post', icon: '📝' },
  'first-meetup': { name: 'First Meetup', description: 'Joined your first meetup', icon: '🤝' },
  organizer: { name: 'Organizer', description: 'Organized 3+ meetups', icon: '🎯' },
  connector: { name: 'Connector', description: 'Received 10+ responses', icon: '🔗' },
  multilingual: { name: 'Multilingual', description: 'Posted in 2+ languages', icon: '🌍' },
  regular: { name: 'Regular', description: '7-day activity streak', icon: '🔥' },
  helpful: { name: 'Helpful', description: 'Left 20+ comments', icon: '💬' },
  popular: { name: 'Popular', description: 'Post reached 100 views', icon: '⭐' },
} as const;

export type BadgeId = keyof typeof BADGES;

function isUniqueConstraintError(err: unknown): boolean {
  return err instanceof Error && /unique/i.test(err.message);
}

/** Award points to a user */
export async function awardPoints(
  db: D1Database,
  userId: string,
  action: string,
  referenceId?: string,
): Promise<{ newPoints: number; newLevel: number } | null> {
  const points = POINT_VALUES[action];
  if (!points) return null;

  const txId = generateId();
  const timestamp = now();

  try {
    await db
      .prepare(
        'INSERT INTO point_transactions (id, user_id, action, points, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .bind(txId, userId, action, points, referenceId ?? null, timestamp)
      .run();
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      const existingUser = await db
        .prepare('SELECT points, level FROM users WHERE id = ?')
        .bind(userId)
        .first<{ points: number; level: number }>();

      if (!existingUser) return null;

      return {
        newPoints: existingUser.points,
        newLevel: existingUser.level,
      };
    }

    throw err;
  }

  await db
    .prepare('UPDATE users SET points = points + ?, updated_at = ? WHERE id = ?')
    .bind(points, timestamp, userId)
    .run();

  // Recalculate level
  const user = await db
    .prepare('SELECT points FROM users WHERE id = ?')
    .bind(userId)
    .first<{ points: number }>();

  if (!user) return null;

  const newLevel = calculateLevel(user.points);
  await db
    .prepare('UPDATE users SET level = ?, updated_at = ? WHERE id = ?')
    .bind(newLevel, timestamp, userId)
    .run();

  return { newPoints: user.points, newLevel };
}

/** Calculate level from points */
export function calculateLevel(points: number): number {
  let level = 1;
  for (const l of LEVELS) {
    if (points >= l.minPoints) {
      level = l.level;
    }
  }
  return level;
}

/** Get level info for a point total */
export function getLevelInfo(points: number) {
  const level = calculateLevel(points);
  const currentLevel = LEVELS.find((l) => l.level === level)!;
  const nextLevel = LEVELS.find((l) => l.level === level + 1);
  return {
    level,
    name: currentLevel.name,
    minPoints: currentLevel.minPoints,
    nextLevelPoints: nextLevel?.minPoints ?? null,
    nextLevelName: nextLevel?.name ?? null,
  };
}

/** Award a badge if not already earned */
export async function awardBadge(
  db: D1Database,
  userId: string,
  badgeId: BadgeId,
): Promise<boolean> {
  const existing = await db
    .prepare('SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?')
    .bind(userId, badgeId)
    .first();

  if (existing) return false;

  const id = generateId();
  await db
    .prepare('INSERT INTO user_badges (id, user_id, badge_id, earned_at) VALUES (?, ?, ?, ?)')
    .bind(id, userId, badgeId, now())
    .run();

  return true;
}

/** Check and award applicable badges */
export async function checkBadges(db: D1Database, userId: string): Promise<BadgeId[]> {
  const earned: BadgeId[] = [];

  // first-post: user has at least 1 approved post
  const postCount = await db
    .prepare("SELECT COUNT(*) as cnt FROM posts WHERE user_id = ? AND status = 'approved'")
    .bind(userId)
    .first<{ cnt: number }>();
  if (postCount && postCount.cnt >= 1) {
    if (await awardBadge(db, userId, 'first-post')) earned.push('first-post');
  }

  // first-meetup: joined at least 1 meetup
  const joinCount = await db
    .prepare("SELECT COUNT(*) as cnt FROM responses WHERE user_id = ? AND type = 'join'")
    .bind(userId)
    .first<{ cnt: number }>();
  if (joinCount && joinCount.cnt >= 1) {
    if (await awardBadge(db, userId, 'first-meetup')) earned.push('first-meetup');
  }

  // organizer: 3+ meetups with 3+ joins each
  const organizedCount = await db
    .prepare(
      `SELECT COUNT(*) as cnt FROM posts p
       WHERE p.user_id = ? AND p.type = 'meetup' AND p.status = 'approved'
       AND (SELECT COUNT(*) FROM responses r WHERE r.post_id = p.id AND r.type = 'join') >= 3`,
    )
    .bind(userId)
    .first<{ cnt: number }>();
  if (organizedCount && organizedCount.cnt >= 3) {
    if (await awardBadge(db, userId, 'organizer')) earned.push('organizer');
  }

  // connector: 10+ responses on their posts
  const responseCount = await db
    .prepare(
      `SELECT COUNT(*) as cnt FROM responses r
       JOIN posts p ON r.post_id = p.id
       WHERE p.user_id = ?`,
    )
    .bind(userId)
    .first<{ cnt: number }>();
  if (responseCount && responseCount.cnt >= 10) {
    if (await awardBadge(db, userId, 'connector')) earned.push('connector');
  }

  // multilingual: posted in 2+ languages
  const langCount = await db
    .prepare('SELECT COUNT(DISTINCT lang) as cnt FROM posts WHERE user_id = ?')
    .bind(userId)
    .first<{ cnt: number }>();
  if (langCount && langCount.cnt >= 2) {
    if (await awardBadge(db, userId, 'multilingual')) earned.push('multilingual');
  }

  // helpful: 20+ comments
  const commentCount = await db
    .prepare("SELECT COUNT(*) as cnt FROM responses WHERE user_id = ? AND type = 'comment'")
    .bind(userId)
    .first<{ cnt: number }>();
  if (commentCount && commentCount.cnt >= 20) {
    if (await awardBadge(db, userId, 'helpful')) earned.push('helpful');
  }

  // popular: any post with 100+ views
  const popularPost = await db
    .prepare('SELECT id FROM posts WHERE user_id = ? AND views >= 100 LIMIT 1')
    .bind(userId)
    .first();
  if (popularPost) {
    if (await awardBadge(db, userId, 'popular')) earned.push('popular');
  }

  return earned;
}

/** Get leaderboard */
export async function getLeaderboard(
  db: D1Database,
  limit = 20,
): Promise<Array<{ id: string; display_name: string; points: number; level: number }>> {
  const result = await db
    .prepare('SELECT id, display_name, points, level FROM users ORDER BY points DESC LIMIT ?')
    .bind(limit)
    .all<{ id: string; display_name: string; points: number; level: number }>();

  return result.results;
}
