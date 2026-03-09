/**
 * Database helpers for D1
 * Provides typed access to the D1 binding from Astro's locals.
 */

export type D1Database = {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
};

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown[]>(): Promise<T[]>;
};

type D1Result<T = unknown> = {
  results: T[];
  success: boolean;
  meta: Record<string, unknown>;
};

type D1ExecResult = {
  count: number;
  duration: number;
};

/** Extract D1 database from Astro runtime */
export function getDB(runtime: App.Locals['runtime']): D1Database {
  return (runtime.env as Record<string, unknown>).DB as D1Database;
}

/** Generate a crypto-random ID */
export function generateId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Generate a secure token (64 hex chars) */
export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Current ISO timestamp */
export function now(): string {
  return new Date().toISOString();
}
