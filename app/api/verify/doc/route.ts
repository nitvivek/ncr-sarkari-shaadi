import { db, r2, getSession, json } from '../../_lib/auth';

// F19 — admin-only serving of a pending verification document.
export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  if (session.role !== 'admin') return json({ error: 'Admins only.' }, { status: 403 });
  const url = new URL(request.url);
  const user = url.searchParams.get('user');
  const type = url.searchParams.get('type');
  if (!user || (type !== 'govt_id' && type !== 'photo_id')) return json({ error: 'Bad request.' }, { status: 400 });
  const v = await db().prepare('SELECT govt_id_key, photo_id_key FROM verifications WHERE user_id = ?').bind(user).first<{ govt_id_key: string | null; photo_id_key: string | null }>();
  const key = type === 'govt_id' ? v?.govt_id_key : v?.photo_id_key;
  if (!key) return json({ error: 'Not found.' }, { status: 404 });
  const obj = await r2().get(key);
  if (!obj) return json({ error: 'Not found.' }, { status: 404 });
  return new Response(obj.body, { headers: { 'content-type': obj.httpMetadata?.contentType ?? 'application/octet-stream', 'cache-control': 'private, no-store' } });
}
