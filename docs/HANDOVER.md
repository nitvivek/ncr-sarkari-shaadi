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
**Gotcha:** if an API-route change doesn't seem to take effect after deploy, do a CLEAN rebuild — `rm -rf dist/server && npm run build && npx wrangler deploy` (vinext can keep a stale server bundle).
**R2 cleanup:** deleting a user in D1 does NOT remove their R2 objects — also `npx wrangler r2 object delete ncrsarkarishaadi-media/photos/<uid>` when cleaning test data.
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
| F14 | `f7afe29` | Photo-privacy access layer: `profiles.photo_mode` + `photo_access` table + `/api/photo-access`. Image storage awaits R2. |
| F15 | `797c9c8` | Hidden-profile mode (`profiles.hidden_profile`) + members directory `GET /api/members` (masks names, excludes hidden). |
| F16 | `d96a6d1` | Contact masking: `contact_share` table + `/api/contact` mutual-consent reveal (revocable). |
| F17 | `1ae6f7f` | Block (`blocks`, hides both ways in `/api/members`) + Report (`reports`, admin-only queue) via `/api/block` + `/api/report`. |
| UI wiring | `04a1fdc` | Member app wired to F13–F17: real Discover/Inbox/Settings/Member-modal/Admin-reports for logged-in users (demo mode unchanged). Emotional calc copy rewrite earlier: `fa1bfcc`. |
| Handshake UI | `327fae8` | Photo-request + contact-share connect panel in member modal + owner-side photo-request approvals in Inbox. |
| D12 pages | `ed4eb83` | Real /verification /privacy /safety /faq routes (server-rendered, `app/docShell.tsx` shell, per-page SEO metadata). Footer + feature CTAs wired to them. |
| W25/polish | `69e4777` | Benefits Explorer (client-side) + real profile-strength % + sidebar unread/admin badges. |
| Stats/Insights | `75d2b20` | `/api/stats` (public aggregate counts) + landing CommunityStats strip (shows only at total>=10) + `/insights` hub (3 articles). |
| Parents Mode | `254b88b` | `profiles.family_notes` (private) + editable created_for + `managedByFamily` signal in directory/cards. |
| Chat | `69a3a90` | Real messaging: `messages` table + `/api/messages` (convos/thread/send) with open-model safeguards (block 403, 3-msg unreplied cap, 10 new convos/day, 2000 chars). RealInboxView two-pane chat + Interests tab; "Message" button in member modal; 10s polling. API curl-tested; UI bundle-verified. |
| F19 + R2 | `12ad7d0` | R2 bucket `ncrsarkarishaadi-media` (binding `MEDIA`). Real photo upload/serve (`/api/photo`, gated by F14 rules) + verification doc upload/review (`/api/verify`, `/api/verify/doc`) with docs **deleted from R2 on decision**; approve sets `profiles.verified_at` (badge). ProfileView photo+verify cards; AdminView real verification queue. Backend curl-tested; UI bundle-verified — interactive UI click-through pending (browser tool was down). |
| Phase A frontend | this session | Expanded `ProfileEditor` with 8 sections (basics / lifestyle / faith / career / location / family / horoscope / preferences), tiered completion meter, lock tags, localStorage draft + autosave for backed keys, HomeView nudge banner. Strength metric unified to schema-based `profileCompletion` (editor + sidebar + nudge agree); 700ms debounce on autosave. No schema/API changes — Phase B remains. Deployed to prod. |
| Phase B backend | this session | Schema migration `db/migrations/0015_phase_b_profile.sql` (47 new objects) applied to remote D1. `/api/profile` accepts all 38 new fields + enforces set-once immutables (gender/dob/height/mother_tongue/religion → 409). New endpoints: `/api/preferences` (JSON-array fields), `/api/photos` (R2 gallery, max 6, F14-gated), `/api/horoscope-image` (R2, owner-only). `ProfileEditor` migrates localStorage draft on first authed mount and clears it. End-to-end curl-verified; test user + R2 objects cleaned. |
| Photo crop + Looking For | this session | Three migrations (0016 photo_x/y/zoom + 0017/0018 partner_preferences column rename to `pref_*` keys). `/api/profile` accepts numeric photo_x/photo_y/photo_zoom (REAL columns); `/api/members` returns them so cards can apply transform. New `CroppedPhoto` + `PhotoCropper` components: drag-to-pan + zoom-slider, debounced PUT to `/api/profile`. New `pref_looking_for` field (Female / Male / Any / All Genders) with validation. Seed script updated to send `pref_*` keys + `pref_looking_for`. The 0017 rename also fixes a Phase B bug: preference PUTs were silently ignored because the route expected bare column names while the client sent `pref_*` prefixed keys. |

Landing/content is DONE. The member app is now **wired to real APIs for logged-in users** (see UI-wiring row + §9). "Explore the member experience" (demo mode, no login) still shows the showcase data intentionally.

## 9. Functional roadmap — F13–F17 (IN PROGRESS)
Building the real interaction layer, one at a time. Status tracked here:

- [x] **F13 — Interests** (send / accept / decline / withdraw). Schema `interests`, API `/api/interests`. DONE `b95d170` — API live & tested. UI wiring pending members-directory.
- [x] **F14 — Photo privacy** (on-request, per-viewer approval, revocable). DONE `f7afe29` — `profiles.photo_mode` (on_request|verified|hidden) + `photo_access` table + `/api/photo-access` (POST request, PATCH grant/deny/revoke, GET box=requests|mine or ?owner=X→canView). Image bytes still await R2 (F19).
- [x] **F15 — Hidden-profile mode** + members directory. DONE `797c9c8` — `profiles.hidden_profile` (0/1, settable via `/api/profile`) + `GET /api/members` (masked names, excludes hidden, hidden users still browse, optional `?gender=`). This is the real discovery endpoint F13/F14/F16 UI can build on.
- [x] **F16 — Contact masking** (phone/email never rendered; mutual-consent "Share" exchange). DONE `d96a6d1` — `contact_share` table (one row/pair, lo/hi agreement) + `/api/contact`: POST agree (agree:false to revoke), GET ?with=X → contact revealed only when both agreed. Member endpoints never return phone/email.
- [x] **F17 — Report / block** (confidential admin queue; block hides both ways). DONE `1ae6f7f` — `blocks` + `reports` tables; `/api/block` (POST block/unblock, GET my blocks); `/api/report` (POST any member, GET+PATCH admin-only via `session.role==='admin'`). `/api/members` now also excludes blocked users both directions.

**F13–F17 API layer is COMPLETE and tested.**

### UI wiring — DONE `04a1fdc`
The member app is now real for logged-in users (demo mode via "Explore the member experience" still shows the showcase). In `app/page.tsx`, `AppShell` fetches real data and switches on `user`:
- **Discover** (`RealDiscoverView`) → `GET /api/members` with gender filter; cards show masked name/service/city/verified.
- **Send interest** → `POST /api/interests`; button reflects pending/accepted; toast feedback.
- **Inbox** (`InterestsInbox`) → received (accept/decline via PATCH) + sent (status).
- **Member modal** (`MemberModal`) → send interest + **Block** (`/api/block`) + **Report** (`/api/report`, reason picker).
- **Settings** → hidden-profile & photo toggles persist via `PUT /api/profile` (`hidden_profile`, `photo_mode`).
- **Home** → shows up to 3 real members when available.
- **Admin → Reports tab** (`AdminView`) → real `/api/report` queue with status dropdown (admin only). Verification queue stays demo (F19/R2).
- Verified live end-to-end in-browser: discover renders real members, send-interest updates + persists, inbox shows it, settings hidden-toggle writes `hidden_profile=1`.

### Photo/contact handshake UI — DONE `327fae8`
- Member modal "connect panel": Photo Request→Requested→Available (`/api/photo-access`); Contact Share/Undo/Stop with inline reveal on mutual (`/api/contact`).
- Inbox "Photo requests" section (owner): Approve/Decline → PATCH grant/deny.
- Verified live in-browser both sides.

### F19 + R2 — DONE `12ad7d0`
Photos and verification docs are real now. Schema adds: `profiles.photo_key`, `verifications` table. R2 layout: `photos/<uid>`, `verify/<uid>/<govt_id|photo_id>`. Privacy invariants: photos served only via authed `/api/photo` (never public/listed); verification docs admin-only and deleted from R2 the moment a decision is made. Test cleanup must delete R2 objects too (`wrangler r2 object delete ncrsarkarishaadi-media/photos/<uid>`) — D1 cascade doesn't touch R2.

### Profile-fields upgrade (IN PROGRESS — frontend first)
Expanding the profile from the govt-niche set to the full Indian-matrimony field set (DOB/age, height, marital status, faith/community, lifestyle, family depth, horoscope, partner preferences), delivered as a **progressive completion** experience (light onboarding → completion % + tier → prompts to fill more). Source analysis: `C:\Users\vivek\Downloads\matrimonial_profile_fields_final.md`. Full plan (field taxonomy + phases): `C:\Users\vivek\.claude\plans\the-site-looks-very-linked-feather.md`.
- **Phase A (frontend, this work):** data-driven sectioned `ProfileEditor` in `app/page.tsx` + `app/profileFields.ts` (option lists + field/section schema + weights). NEW fields held in a **localStorage draft** (`ncr-profile-draft`) — no schema/API changes yet. Backed fields (about/service/ministry/organisation/residence_city/posting_outlook/preferred_hubs/gender/created_for/family_notes) still save to `/api/profile`. Tiered completion (Incomplete/Fair/Good/Excellent). Decisions: horoscope = medium (no Kundli engine), sensitive fields (complexion/body-type/caste) included but NEVER as filters, caste offers "No bar".
- **Phase A polish (this session):** HomeView strength number now comes from `profileCompletion()` (new schema) instead of the old `profileStrength()` heuristic, so the nudge banner and the editor's "Profile strength" meter agree. `ProfileEditor` autosave to `/api/profile` for backed text fields is debounced (700ms) — no more PUT per keystroke. Draft is hydrated into `AppShell` on mount so the sidebar/profile-card numbers stay in sync with the editor.
- **Phase B (backend, this session — DONE):** extended the single-table `profiles` schema with 38 new columns (DOB, height, marital_status, mother_tongue, lifestyle, faith, family depth, horoscope, etc.) and added two new tables (`partner_preferences`, `profile_photos`). Three new API routes: `/api/preferences` (GET/PUT, JSON-array fields for marital_status/education/diet), `/api/photos` (POST/GET/DELETE — multi-photo gallery up to 6, gated by F14 photo_mode rules), `/api/horoscope-image` (POST/GET/DELETE — kundli image, private to owner). `/api/profile` now accepts every Phase A field and enforces set-once immutables server-side (`gender`, `dob`, `height`, `mother_tongue`, `religion` — 409 on conflict). Migration: `db/migrations/0015_phase_b_profile.sql` applied to remote D1 (47 new objects, +20KB). The `ProfileEditor` migrates the localStorage draft to server on first authenticated mount, then clears the draft. End-to-end curl-verified with `claude-test@example.com`: PUT profile (200, all fields round-trip), PUT dob conflict (409, immutable), same-value PUT (200), preferences PUT/GET with arrays (200), photo upload + list (200), horoscope upload + fetch (200, PNG bytes round-trip). Test user + R2 objects cleaned up.

### Still to do (remaining roadmap)
The full roadmap is now **built**. What's genuinely left is polish/ops, not features:
- **Interactive UI click-through** of F19 upload, admin approve, chat send, photo/contact handshake — once the browser preview tool recovers (it was down repeatedly). All backend paths are curl-verified and UI is bundle-verified; this is final visual QA, not new work.
- Real **M/F member counters** already wired (`/api/stats` + CommunityStats) — auto-activates at 10+ members.
- Optional later: chat notifications/push, message pagination beyond 200, richer admin (member directory/search), rate-limit tuning, email (register/forgot-password) via a mail provider, custom domain.
- **Push commits to origin** (still blocked — Vivek does this from Codex; see §5).

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
