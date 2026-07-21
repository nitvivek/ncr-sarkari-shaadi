import { env } from 'cloudflare:workers';

type Database = {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      first<T = Record<string, unknown>>(): Promise<T | null>;
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
      run(): Promise<unknown>;
    };
  };
};

const db = () => (env as unknown as { DB: Database }).DB;
const textEncoder = new TextEncoder();

// Accounts registered with these emails are granted the admin role.
export const ADMIN_EMAILS = ['vivek.ajnifm@gmail.com'];

function toBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function digest(value: string) {
  return toBase64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', textEncoder.encode(value))));
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', textEncoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  return `pbkdf2$100000$${toBase64Url(salt)}$${toBase64Url(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algorithm, iterationsValue, saltValue, expected] = stored.split('$');
  if (algorithm !== 'pbkdf2' || !iterationsValue || !saltValue || !expected) return false;
  const key = await crypto.subtle.importKey('raw', textEncoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: fromBase64Url(saltValue), iterations: Number(iterationsValue), hash: 'SHA-256' }, key, 256);
  return toBase64Url(new Uint8Array(bits)) === expected;
}

export async function createSession(userId: string) {
  const rawToken = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + 60 * 60 * 24 * 30;
  await db().prepare('INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').bind(await digest(rawToken), userId, expiresAt, now).run();
  return { rawToken, expiresAt };
}

export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie') ?? '';
  const match = cookie.match(/(?:^|;\s*)ncr_session=([^;]+)/);
  if (!match) return null;
  const session = await db().prepare('SELECT s.user_id, s.expires_at, u.login, u.email, u.phone, u.full_name, u.status, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?').bind(await digest(match[1]), Math.floor(Date.now() / 1000)).first<{ user_id: string; expires_at: number; login: string; email: string | null; phone: string | null; full_name: string; status: string; role: string }>();
  return session;
}

export function sessionCookie(token: string, maxAge = 60 * 60 * 24 * 30) {
  return `ncr_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), { ...init, headers: { 'content-type': 'application/json; charset=utf-8', ...(init.headers ?? {}) } });
}

export { db };
