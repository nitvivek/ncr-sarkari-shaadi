import { db, json } from '../_lib/auth';

// Public aggregate counts only (no PII). Used for the landing community
// strip, which itself only renders once the numbers are meaningful.
export async function GET() {
  const row = await db().prepare(
    `SELECT COUNT(*) AS total,
      SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) AS male,
      SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) AS female,
      SUM(CASE WHEN verified_at IS NOT NULL THEN 1 ELSE 0 END) AS verified
     FROM profiles`
  ).bind().first<{ total: number; male: number; female: number; verified: number }>();
  return json({ total: row?.total ?? 0, male: row?.male ?? 0, female: row?.female ?? 0, verified: row?.verified ?? 0 });
}
