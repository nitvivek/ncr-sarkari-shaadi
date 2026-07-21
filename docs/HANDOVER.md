# NCRSarkariShaadi — Build Handover & Progress Log

> **Read this first if you are a new Claude/agent session picking up this project.**
> This file lives in the repo so it travels with the code. Keep it updated as you work.
> Last updated: 2026-07-21.

## 1. What this is
A matrimony website for **government employees permanently posted in Delhi NCR**. Owner: Vivek.
Live (production): **https://v2.ncrsarkarishaadi.workers.dev**

## 2. Stack & where things are
- **Framework:** Next.js 16 App Router built with **vinext** + Vite (NOT plain Next — `npm run dev/build` go through `vinext`).
- **Runtime:** Cloudflare **Worker** (`worker/index.ts` is the entry).
- **DB:** Cloudflare **D1** (SQLite). Name `ncrsarkariishaadi-db`, id `6fc2c188-023e-461a-9583-d942ee188ac2`, bound as **`DB`** (see `wrangler.jsonc`).
- **Whole UI:** single file `app/page.tsx` (landing + member app + admin + modals). ~600+ lines.
- **Styles:** single hand-rolled vanilla CSS file `app/globals.css` (no Tailwind). Design system = "Royal Heritage Modern": maroon `--maroon-deep #4a1220`, gold-foil, ivory `--paper`, green accents. Fonts: Fraunces (display, variable) + Satoshi (body, Fontshare), loaded in `app/layout.tsx`.
- **Data files:** `app/serviceData.ts` (ministries), `app/ncrData.ts` (NCR districts + `serviceCadres` + `coreNcrHubs`).
- **Auth/DB helpers:** `app/api/_lib/auth.ts` — exports `db()`, `getSession(request)`, `json()`, `hashPassword`/`verifyPassword`, `createSession`, `sessionCookie`, `ADMIN_EMAILS`.
- **API routes:** `app/api/**/route.ts` (App Router handlers). Existing: `auth/{register,login,logout,me}`, `profile`.
- **Schema:** `db/schema.sql` is the mirror-of-record. **Also apply every change to remote D1** (see §4).
- **Static assets:** `public/` → served at site root (e.g. `public/stories/*.jpg`).

## 3. Build, deploy, verify
```bash
cd "C:/Users/vivek/Documents/Codex/2026-07-18/sites-plugin-sites-openai-bundled-create-2"
npm run build                 # vinext build
npx wrangler deploy           # publishes to v2.ncrsarkarishaadi.workers.dev
```
Wrangler is already authenticated (OAuth) as **vivek.ajnifm@gmail.com** on this machine.
Verify: `curl -s -o /dev/null -w "%{http_code}" https://v2.ncrsarkarishaadi.workers.dev/`.
Browser screenshots via the preview tool have been flaky (infinite CSS animations block stable-frame capture) — verify via live DOM/`javascript_tool` and by driving controls instead.

## 4. Working with the database
```bash
# Read/inspect (remote = production D1):
npx wrangler d1 execute ncrsarkariishaadi-db --remote --command "SELECT name FROM sqlite_master WHERE type='table';"
# Apply a migration to remote:
npx wrangler d1 execute ncrsarkariishaadi-db --remote --command "ALTER TABLE users ADD COLUMN ...;"
```
**Rule:** any schema change → (a) run against `--remote`, AND (b) update `db/schema.sql` to match.
**Test-user convention:** register throwaway accounts as `claude-test@example.com`, then DELETE from `users` afterwards so prod stays clean.

## 5. Git & the remote (IMPORTANT)
- Commits are **local only**. The origin remote (`git.chatgpt-team.site`, a Codex-managed server) returns **401** and can't be pushed from here (Git Credential Manager can't do the interactive auth in this environment).
- Do **not** hard-reset / re-clone / discard local changes — local `main` is ahead of origin and is the source of truth.
- When Vivek's Codex usage resumes, HE pushes with:
  ```bash
  cd "C:/Users/vivek/Documents/Codex/2026-07-18/sites-plugin-sites-openai-bundled-create-2"
  git push origin main
  ```

## 6. Locked product decisions (do not silently change)
- Eligibility: all govt employees in Delhi NCR; **service cadre list** = the 17 Delhi-permanent cadres + "Other" in `app/ncrData.ts` (`serviceCadres`).
- NCR scope: full official NCRPB districts (`ncrDistrictGroups`).
- **Messaging = OPEN** (any verified member can message anyone). Chosen against research advice → this makes block/report + rate-limits + hidden-profile mode + photo/contact gating **mandatory** safeguards.
- Verification: govt ID + photo ID, manual admin review. Admin auto-granted to `vivek.ajnifm@gmail.com` via `ADMIN_EMAILS`.
- Design: keep maroon/gold "Royal Heritage" (NOT navy/green). Arch/jharokha shapes were removed in favour of rounded-rectangles + circles.
- Honesty rules: NO fabricated counters, NO fake testimonials, NO synthetic "member" photos. Success-story photos are illustrative/consented; testimonial is labelled "representative". Real member counts (Male/Female) only once real members exist.

## 7. The full plan
Strategic plan with numbered items (C = content, D = design, F = functional, W = interactive):
**`D:\Projects\NCRSarkariShaadi\MODIFICATION-PLAN.md`** (on Vivek's machine, alongside the source research PDFs). Read it for the full rationale and item list.

## 8. Progress so far (newest first)
| Wave | Commit | What |
|---|---|---|
| Auth+profiles | `ecaf7e4` | Real D1 auth (register/login/logout/me, PBKDF2, sessions), `/api/profile`, users.role, extended profiles cols. Worker renamed `n`→`v2`. |
| Cadres | `6fc2287` | 17 Delhi-permanent service cadres + "Other" everywhere. |
| Redesign | `58e3043`, `de70006`, `fba0df2`, `9342ce6` | "Royal Heritage Modern" visual system; success-stories carousel w/ 7 illustrative couple photos in `public/stories/`. |
| Wave 1 | `5f72ee5` | Emotion-first landing rebuild + dropped arch shape. New sections: two-careers-one-life spine, same-city split-screen, free-messaging band, verification pipeline, women-in-govt, comparison table, why-it-matters lines, SEO meta. |
| Wave 2 | `6baaae0`, `a1bf85c` | Client-side interactive tools: Financial Advantage Calculator, Compatibility Demo, Privacy Playground, Neighbourhood Compatibility, Marriage-Readiness Timeline, representative testimonial. |
| F13 | `b95d170` | Interests API (send/accept/decline/withdraw) + `interests` table + `.all()` on Database type + this handover doc. |

Everything above **landing/content** is DONE. The member app (discover/profile/inbox/settings/admin) still shows **hardcoded demo data** — making it real is the functional work below.

## 9. Functional roadmap — F13–F17 (IN PROGRESS)
Building the real interaction layer, one at a time. Status tracked here:

- [x] **F13 — Interests** (send / accept / decline / withdraw). Schema `interests`, API `/api/interests`. DONE `b95d170` — API live & tested. UI wiring pending members-directory.
- [ ] **F14 — Photo privacy** (on-request, per-viewer approval, revocable).
- [ ] **F15 — Hidden-profile mode** (functional; hidden ⇒ not discoverable; owner still browses).
- [ ] **F16 — Contact masking** (phone/email never rendered; mutual-consent "Share" exchange).
- [ ] **F17 — Report / block** (confidential admin queue; block hides both ways).

Companion needed for the above to be usable in UI: a real **members directory** (`GET /api/members`, respecting hidden mode + visibility). Note if/when built.

### API conventions to follow (match existing routes)
- Every route: `import { getSession, db, json } from '../_lib/auth'` (adjust depth). Gate with `const s = await getSession(request); if (!s) return json({error:'…'},{status:401});`.
- Return shapes: `{ ok:true, ... }` on success, `{ error:'…' }` with a status on failure.
- D1 access: `db().prepare('…').bind(…).first<T>()` / `.run()` / `.all<T>()`.
- Keep everything server-side ownership-checked (a user can only act as themselves).

## 10. After finishing an item
1. Apply schema to remote D1 + update `db/schema.sql`.
2. `npm run build && npx wrangler deploy`.
3. Test via curl against the live URL with a `claude-test@example.com` user; delete the test user after.
4. Tick the box in §9, add a row to §8 with the commit hash.
5. `git add` + commit (local). Remind Vivek it's unpushed.
