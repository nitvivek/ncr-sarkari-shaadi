import { db, getSession, json, sessionCookie } from '../../_lib/auth';

export async function POST(request: Request) {
  const session = await getSession(request);
  if (session) {
    const cookie = request.headers.get('Cookie') ?? '';
    const token = cookie.match(/(?:^|;\s*)ncr_session=([^;]+)/)?.[1];
    if (token) {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
      let binary = '';
      for (const byte of new Uint8Array(digest)) binary += String.fromCharCode(byte);
      const tokenHash = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
      await db().prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
    }
  }
  return json({ ok: true }, { headers: { 'set-cookie': sessionCookie('', 0) } });
}
