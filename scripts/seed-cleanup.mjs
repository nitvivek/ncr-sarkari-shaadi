// Counter-sweep for the dummy test profiles seeded by seed-profiles.mjs.
// Run:    node scripts/seed-cleanup.mjs         (dry-run)
//         node scripts/seed-cleanup.mjs --yes   (actually delete)
//
// Cleans D1 rows (users CASCADE → profiles/verifications/messages/interests/blocks/photo_access/contact_share/profile_photos/partner_preferences)
// and R2 objects at photos/, horoscope/, verify/ under each seeded user id.
import { spawnSync } from 'node:child_process';

const APPLY = process.argv.includes('--yes');
const DOMAIN = 'ncr-tests.in';
const DB = 'ncrsarkariishaadi-db';
const BUCKET = 'ncrsarkarishaadi-media';

function wrangler(args) {
  const r = spawnSync('npx', ['wrangler', ...args], { encoding: 'utf8', shell: true });
  if (r.status !== 0) {
    console.error(`wrangler ${args.join(' ')} → ${r.status}\n${r.stderr ?? r.stdout ?? ''}`);
    return null;
  }
  return r.stdout;
}

// 1. Find seeded user ids.
const d1Out = wrangler(['d1', 'execute', DB, '--remote', '--json',
  '--command', `SELECT id, email FROM users WHERE email LIKE '%@${DOMAIN}'`]);
if (!d1Out) process.exit(1);

// wrangler --json output is an array of {meta:[], results:[...]}
let rows = [];
try {
  // Find a "results" substring with users — wrangler prints the full JSON output.
  const m = d1Out.match(/\{"results":\s*(\[[^\]]*\])\s*\}/);
  const arr = m ? JSON.parse(m[1]) : [];
  rows = arr;
} catch (e) {
  console.error('Failed to parse wrangler output:', e.message, '\n', d1Out.slice(0, 500));
  process.exit(1);
}

if (rows.length === 0) {
  console.log('No seeded users found in D1. Nothing to do.');
  process.exit(0);
}

console.log(`Found ${rows.length} seeded users:`);
for (const r of rows) console.log(`  ${r.email}  (id=${r.id})`);

// 2. Enumerate R2 objects for each user.
const r2ByPrefix = {};
for (const u of rows) {
  const prefix = `photos/${u.id}`;
  const out = wrangler(['r2', 'object', 'list', BUCKET, '--prefix', prefix, '--json']);
  if (!out) continue;
  try {
    const m = out.match(/\{"objects":\s*(\[[^\]]*\])\s*\}/);
    const objects = m ? JSON.parse(m[1]) : [];
    r2ByPrefix[u.id] = (r2ByPrefix[u.id] ?? []).concat(objects.map((o) => o.key));
  } catch (e) { /* ignore — could be no objects */ }

  const prefix2 = `horoscope/${u.id}`;
  const out2 = wrangler(['r2', 'object', 'list', BUCKET, '--prefix', prefix2, '--json']);
  if (!out2) continue;
  try {
    const m = out2.match(/\{"objects":\s*(\[[^\]]*\])\s*\}/);
    const objects = m ? JSON.parse(m[1]) : [];
    r2ByPrefix[u.id] = (r2ByPrefix[u.id] ?? []).concat(objects.map((o) => o.key));
  } catch (e) { /* ignore */ }

  const prefix3 = `verify/${u.id}`;
  const out3 = wrangler(['r2', 'object', 'list', BUCKET, '--prefix', prefix3, '--json']);
  if (!out3) continue;
  try {
    const m = out3.match(/\{"objects":\s*(\[[^\]]*\])\s*\}/);
    const objects = m ? JSON.parse(m[1]) : [];
    r2ByPrefix[u.id] = (r2ByPrefix[u.id] ?? []).concat(objects.map((o) => o.key));
  } catch (e) { /* ignore */ }
}

let totalR2 = 0;
for (const u of rows) {
  const keys = r2ByPrefix[u.id] ?? [];
  console.log(`  ${u.email}: ${keys.length} R2 objects`);
  for (const k of keys) console.log(`    - ${k}`);
  totalR2 += keys.length;
}

if (!APPLY) {
  console.log(`\nDRY RUN — pass --yes to actually delete ${rows.length} users + ${totalR2} R2 objects.`);
  process.exit(0);
}

// 3. Delete R2 objects.
let r2Deleted = 0;
for (const u of rows) {
  for (const k of r2ByPrefix[u.id] ?? []) {
    const o = wrangler(['r2', 'object', 'delete', `${BUCKET}/${k}`]);
    if (o !== null) r2Deleted++;
  }
}
console.log(`\nDeleted ${r2Deleted} R2 objects.`);

// 4. Delete D1 users. Cascade handles everything else.
const ids = rows.map((r) => `'${r.id}'`).join(',');
const delOut = wrangler(['d1', 'execute', DB, '--remote',
  '--command', `DELETE FROM users WHERE id IN (${ids});`]);
if (!delOut) {
  console.error('D1 delete failed.');
  process.exit(1);
}
console.log(`Deleted ${rows.length} users. CASCADE removed profiles/verifications/messages/interests/blocks/photo_access/contact_share/profile_photos/partner_preferences.`);
console.log('\n✓ cleanup complete');