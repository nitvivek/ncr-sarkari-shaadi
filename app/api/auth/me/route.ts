import { getSession, json } from '../../_lib/auth';

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ user: null }, { status: 401 });
  return json({ user: { id: session.user_id, fullName: session.full_name, login: session.login, email: session.email, phone: session.phone, status: session.status, role: session.role } });
}
