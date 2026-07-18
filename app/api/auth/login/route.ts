import { createSession, db, json, sessionCookie, verifyPassword } from '../../_lib/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { identifier?: string; password?: string } | null;
  const identifier = body?.identifier?.trim().toLowerCase();
  const password = body?.password ?? '';
  if (!identifier || !password) return json({ error: 'Enter your email or mobile number and password.' }, { status: 400 });
  const user = await db().prepare('SELECT id, email, phone, full_name, password_hash, status, role FROM users WHERE login = ?').bind(identifier).first<{ id: string; email: string | null; phone: string | null; full_name: string; password_hash: string; status: string; role: string }>();
  if (!user || !(await verifyPassword(password, user.password_hash))) return json({ error: 'Those details do not match an account.' }, { status: 401 });
  const session = await createSession(user.id);
  return json({ ok: true, user: { id: user.id, fullName: user.full_name, email: user.email, phone: user.phone, status: user.status, role: user.role } }, { headers: { 'set-cookie': sessionCookie(session.rawToken) } });
}
