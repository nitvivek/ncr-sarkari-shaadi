import { ADMIN_EMAILS, createSession, db, hashPassword, json, sessionCookie } from '../../_lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { identifier?: string; email?: string; fullName?: string; password?: string } | null;
    const identifier = body?.identifier?.trim().toLowerCase();
    const fullName = body?.fullName?.trim();
    const password = body?.password ?? '';
    const email = body?.email?.trim().toLowerCase() || (identifier?.includes('@') ? identifier : null);
    if (!identifier || !fullName || password.length < 8) return json({ error: 'Enter your email or mobile number, name, and a password of at least 8 characters.' }, { status: 400 });
    if (!/^\+?[0-9 ()-]{8,20}$/.test(identifier) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) return json({ error: 'Enter a valid email address or mobile number.' }, { status: 400 });
    const existing = await db().prepare('SELECT id FROM users WHERE login = ?').bind(identifier).first();
    if (existing) return json({ error: 'An account already exists with those details.' }, { status: 409 });
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const phone = identifier.includes('@') ? null : identifier;
    const role = email && ADMIN_EMAILS.includes(email) ? 'admin' : 'member';
    await db().prepare('INSERT INTO users (id, login, email, phone, password_hash, full_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, identifier, email, phone, await hashPassword(password), fullName, role, now, now).run();
    await db().prepare('INSERT INTO profiles (user_id, created_at, updated_at) VALUES (?, ?, ?)').bind(id, now, now).run();
    const session = await createSession(id);
    return json({ ok: true, user: { id, fullName, email, phone, status: 'pending', role } }, { headers: { 'set-cookie': sessionCookie(session.rawToken) } });
  } catch (error) {
    console.error('register_error', error instanceof Error ? error.message : String(error));
    return json({ error: 'Registration is temporarily unavailable. Please try again.' }, { status: 500 });
  }
}
