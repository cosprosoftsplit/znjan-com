import type { D1Database } from './db';
import { ensureCommunitySchema } from './community-schema';
import { checkBadges } from './gamification';

export const COMMUNITY_POST_TYPES = ['meetup', 'event-idea', 'partner-search', 'discussion'] as const;
export const COMMUNITY_POST_CATEGORIES = ['sports', 'social', 'culture', 'food-drink', 'other'] as const;

export type CommunityPostType = (typeof COMMUNITY_POST_TYPES)[number];
export type CommunityPostCategory = (typeof COMMUNITY_POST_CATEGORIES)[number];

export interface CommunityViewer {
  id: string;
  role: string;
}

export interface CommunityAuthor {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
}

export interface CommunityPostSummary {
  id: string;
  userId: string;
  type: string;
  category: string;
  title: string;
  body: string;
  lang: string;
  location: string | null;
  lat: number | null;
  lng: number | null;
  eventDate: string | null;
  eventTime: string | null;
  maxParticipants: number | null;
  status: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  joinCount: number;
  commentCount: number;
  author: CommunityAuthor;
}

export interface CommunityComment {
  id: string;
  userId: string;
  body: string;
  createdAt: string;
  author: CommunityAuthor;
}

export interface CommunityJoiner {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface CommunityPostDetail extends CommunityPostSummary {
  comments: CommunityComment[];
  joiners: CommunityJoiner[];
  hasJoined: boolean;
  viewerCanEdit: boolean;
  viewerCanDelete: boolean;
}

export interface CommunityListResult {
  posts: CommunityPostSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface CommunityListFilters {
  type: string | null;
  category: string | null;
  page: number;
  limit: number;
}

type CommunityPostRow = Record<string, unknown> & {
  id: string;
  user_id: string;
  type: string;
  category: string;
  title: string;
  body: string;
  lang: string;
  location: string | null;
  lat: number | null;
  lng: number | null;
  event_date: string | null;
  event_time: string | null;
  max_participants: number | null;
  status: string;
  views: number | null;
  created_at: string;
  updated_at: string;
  join_count: number | null;
  comment_count: number | null;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  author_level: number | null;
};

type CommunityCommentRow = {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  author_level: number | null;
};

type CommunityJoinerRow = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
};

function toPositiveInteger(value: number, fallback: number, max: number): number {
  if (!Number.isFinite(value) || value < 1) {
    return fallback;
  }

  return Math.min(Math.floor(value), max);
}

export function normalizeCommunityListFilters(input: {
  type?: string | null;
  category?: string | null;
  page?: number;
  limit?: number;
}): CommunityListFilters {
  return {
    type: COMMUNITY_POST_TYPES.includes(input.type as CommunityPostType) ? input.type ?? null : null,
    category: COMMUNITY_POST_CATEGORIES.includes(input.category as CommunityPostCategory) ? input.category ?? null : null,
    page: toPositiveInteger(input.page ?? 1, 1, 10_000),
    limit: toPositiveInteger(input.limit ?? 20, 20, 50),
  };
}

function serializeCommunityAuthor(row: {
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  author_level: number | null;
}): CommunityAuthor {
  return {
    id: row.author_id,
    displayName: row.author_name,
    avatarUrl: row.author_avatar,
    level: Number(row.author_level ?? 1),
  };
}

function serializeCommunityPost(row: CommunityPostRow): CommunityPostSummary {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    category: row.category,
    title: row.title,
    body: row.body,
    lang: row.lang,
    location: row.location,
    lat: row.lat,
    lng: row.lng,
    eventDate: row.event_date,
    eventTime: row.event_time,
    maxParticipants: row.max_participants,
    status: row.status,
    views: Number(row.views ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    joinCount: Number(row.join_count ?? 0),
    commentCount: Number(row.comment_count ?? 0),
    author: serializeCommunityAuthor(row),
  };
}

export async function listCommunityPosts(
  db: D1Database,
  filters: CommunityListFilters,
): Promise<CommunityListResult> {
  await ensureCommunitySchema(db);

  const offset = (filters.page - 1) * filters.limit;
  let where = "WHERE p.status = 'approved'";
  const params: unknown[] = [];

  if (filters.type) {
    where += ' AND p.type = ?';
    params.push(filters.type);
  }

  if (filters.category) {
    where += ' AND p.category = ?';
    params.push(filters.category);
  }

  const result = await db
    .prepare(
      `SELECT
        p.*,
        u.id as author_id,
        u.display_name as author_name,
        u.avatar_url as author_avatar,
        u.level as author_level,
        (SELECT COUNT(*) FROM responses r WHERE r.post_id = p.id AND r.type = 'join') as join_count,
        (SELECT COUNT(*) FROM responses r WHERE r.post_id = p.id AND r.type = 'comment') as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
    )
    .bind(...params, filters.limit, offset)
    .all<CommunityPostRow>();

  const totalRow = await db
    .prepare(`SELECT COUNT(*) as cnt FROM posts p ${where}`)
    .bind(...params)
    .first<{ cnt: number }>();

  const total = Number(totalRow?.cnt ?? 0);
  const totalPages = total > 0 ? Math.ceil(total / filters.limit) : 0;

  return {
    posts: result.results.map(serializeCommunityPost),
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages,
    hasNextPage: filters.page * filters.limit < total,
  };
}

export async function getCommunityPostDetail(
  db: D1Database,
  postId: string,
  viewer?: CommunityViewer | null,
): Promise<CommunityPostDetail | null> {
  await ensureCommunitySchema(db);

  const post = await db
    .prepare(
      `SELECT
        p.*,
        u.id as author_id,
        u.display_name as author_name,
        u.avatar_url as author_avatar,
        u.level as author_level,
        (SELECT COUNT(*) FROM responses r WHERE r.post_id = p.id AND r.type = 'join') as join_count,
        (SELECT COUNT(*) FROM responses r WHERE r.post_id = p.id AND r.type = 'comment') as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?`,
    )
    .bind(postId)
    .first<CommunityPostRow>();

  if (!post) {
    return null;
  }

  const canViewUnapproved = !!viewer && (post.user_id === viewer.id || viewer.role === 'admin');
  if (post.status !== 'approved' && !canViewUnapproved) {
    return null;
  }

  const currentViews = Number(post.views ?? 0);
  let updatedViews = currentViews;

  if (post.status === 'approved') {
    await db
      .prepare('UPDATE posts SET views = views + 1 WHERE id = ?')
      .bind(postId)
      .run();

    updatedViews = currentViews + 1;

    if (currentViews < 100 && updatedViews >= 100) {
      await checkBadges(db, post.user_id);
    }
  }

  const [commentsResult, joinersResult, viewerJoin] = await Promise.all([
    db
      .prepare(
        `SELECT
          r.id,
          r.user_id,
          r.body,
          r.created_at,
          u.id as author_id,
          u.display_name as author_name,
          u.avatar_url as author_avatar,
          u.level as author_level
        FROM responses r
        JOIN users u ON r.user_id = u.id
        WHERE r.post_id = ? AND r.type = 'comment'
        ORDER BY r.created_at ASC`,
      )
      .bind(postId)
      .all<CommunityCommentRow>(),
    db
      .prepare(
        `SELECT
          r.user_id,
          u.display_name,
          u.avatar_url
        FROM responses r
        JOIN users u ON r.user_id = u.id
        WHERE r.post_id = ? AND r.type = 'join'
        ORDER BY r.created_at ASC`,
      )
      .bind(postId)
      .all<CommunityJoinerRow>(),
    viewer
      ? db
        .prepare("SELECT id FROM responses WHERE post_id = ? AND user_id = ? AND type = 'join'")
        .bind(postId, viewer.id)
        .first()
      : Promise.resolve(null),
  ]);

  const summary = serializeCommunityPost({
    ...post,
    views: updatedViews,
  });

  return {
    ...summary,
    comments: commentsResult.results.map((comment) => ({
      id: comment.id,
      userId: comment.user_id,
      body: comment.body,
      createdAt: comment.created_at,
      author: serializeCommunityAuthor(comment),
    })),
    joiners: joinersResult.results.map((joiner) => ({
      userId: joiner.user_id,
      displayName: joiner.display_name,
      avatarUrl: joiner.avatar_url,
    })),
    hasJoined: !!viewerJoin,
    viewerCanEdit: !!viewer && (viewer.id === post.user_id || viewer.role === 'admin'),
    viewerCanDelete: !!viewer && (viewer.id === post.user_id || viewer.role === 'admin'),
  };
}
