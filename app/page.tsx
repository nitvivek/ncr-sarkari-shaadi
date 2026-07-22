'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ministryNames, organisationsForMinistry } from './serviceData';
import { coreNcrHubs, ncrDistrictGroups, serviceCadres } from './ncrData';
import { profileSections, profileCompletion, completionTier, backedKeys, prefKeys, type FieldDef } from './profileFields';

type View = 'home' | 'discover' | 'profile' | 'inbox' | 'settings' | 'admin';

type VisibilitySettings = {
  profile: boolean;
  photo: boolean;
  contact: boolean;
  viewed: boolean;
  ministry: boolean;
  organisation: boolean;
  hiddenFromSearch: boolean;
  searchWhileHidden: boolean;
};

type IconName =
  | 'arrow'
  | 'bell'
  | 'briefcase'
  | 'check'
  | 'chevron'
  | 'clock'
  | 'heart'
  | 'home'
  | 'lock'
  | 'mail'
  | 'menu'
  | 'pin'
  | 'search'
  | 'shield'
  | 'spark'
  | 'user'
  | 'users'
  | 'x';

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m7 9 5 5 5-5" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    heart: <path d="M20.8 8.6c0 5.1-8.8 10-8.8 10S3.2 13.7 3.2 8.6A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4Z" />,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    pin: <><path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z" /><path d="m8.8 12 2.1 2.1 4.5-4.5" /></>,
    spark: <><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3ZM19 16l.6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M4 20c.8-3.4 3.4-5 8-5s7.2 1.6 8 5" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M2.5 20c.5-3.1 2.6-4.5 6.5-4.5s6 1.4 6.5 4.5" /><path d="M16 5.5a3 3 0 0 1 0 5.5M17 15.8c2.9.4 4.4 1.7 4.8 4.2" /></>,
    x: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const matches = [
  { id: 1, initials: 'AS', name: 'Aditi S.', gender: 'female', role: 'Section Officer · CSS', city: 'New Delhi', fit: 96, tone: 'rose', note: 'Both prefer a stable NCR posting' },
  { id: 2, initials: 'RK', name: 'Rohan K.', gender: 'male', role: 'Assistant · DANICS', city: 'Noida', fit: 92, tone: 'sage', note: 'Aligned on NCR career plans' },
  { id: 3, initials: 'NM', name: 'Nisha M.', gender: 'female', role: 'Steno Grade B · CSSS', city: 'Gurugram', fit: 88, tone: 'sand', note: 'Similar family and work rhythm' },
  { id: 4, initials: 'VK', name: 'Vikram K.', gender: 'male', role: 'Under Secretary · CSS', city: 'New Delhi', fit: 85, tone: 'blue', note: 'Both open to a shared NCR home' },
];

const navItems: { id: View; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Overview', icon: 'home' },
  { id: 'discover', label: 'Discover', icon: 'search' },
  { id: 'inbox', label: 'Inbox', icon: 'mail' },
  { id: 'profile', label: 'My profile', icon: 'user' },
  { id: 'settings', label: 'Privacy & safety', icon: 'lock' },
];

function Logo({ inverse = false }: { inverse?: boolean }) {
  return <div className={`logo ${inverse ? 'logo--inverse' : ''}`}><span className="logo-mark">N</span><span>NCR<strong>Sarkari</strong>Shaadi</span></div>;
}

function VerifiedBadge({ label = 'Identity verified' }: { label?: string }) {
  return <span className="verified"><span className="verified-dot"><Icon name="check" size={11} /></span>{label}</span>;
}

function Avatar({ initials, tone, large = false }: { initials: string; tone: string; large?: boolean }) {
  return <div className={`avatar avatar--${tone} ${large ? 'avatar--large' : ''}`}>{initials}</div>;
}

// Render a profile photo with the owner's chosen crop (x/y zoom). The wrapper
// clips; the inner image is translated by (x, y) and scaled by `zoom` so the
// subject's face can be centered regardless of source aspect ratio.
function CroppedPhoto({ src, alt, x = 0.5, y = 0.3, zoom = 1, variant = 'card', loading }: { src: string; alt: string; x?: number; y?: number; zoom?: number; variant?: 'card' | 'modal' | 'profile'; loading?: 'lazy' | 'eager' }) {
  const wrapClass = `member-photo-wrap ${variant === 'modal' ? 'member-photo-wrap--modal' : variant === 'profile' ? 'member-photo-wrap--profile' : ''}`;
  // Translate the image so the focal point sits in the centre of the wrapper.
  // With zoom>1 the inner image is enlarged; offset compensates.
  const tx = (0.5 - x) * 100;
  const ty = (0.5 - y) * 100;
  return (
    <div className={wrapClass}>
      <img className="member-photo" src={src} alt={alt} loading={loading} style={{ transform: `translate(${tx}%, ${ty}%) scale(${zoom})` }} />
    </div>
  );
}

// Circular cropper for the profile-photo card. Drag to pan, slider to zoom.
// Returns a CroppedPhoto preview plus the slider; persistence is the parent's
// responsibility (debounced PUT /api/profile).
function PhotoCropper({ src, x, y, zoom, onChange }: { src: string; x: number; y: number; zoom: number; onChange: (next: { x: number; y: number; zoom: number }) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const onMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Convert pointer position (px) to focus point (0..1) in source-image space.
    // When zoom=1, the focus point's inverse-translate = pointer/rect.
    // For arbitrary zoom, we still want the click to mean "centre my view here".
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const nx = Math.min(1, Math.max(0, px));
    const ny = Math.min(1, Math.max(0, py));
    onChange({ x: nx, y: ny, zoom });
  };
  const tx = (0.5 - x) * 100;
  const ty = (0.5 - y) * 100;
  return (
    <div>
      <div className="photo-cropper" ref={wrapRef}
        onPointerDown={(e) => { draggingRef.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); onMove(e); }}
        onPointerMove={onMove}
        onPointerUp={() => { draggingRef.current = false; }}
        onPointerLeave={() => { draggingRef.current = false; }}
      >
        <img src={src} alt="Crop preview" draggable={false} style={{ transform: `translate(${tx}%, ${ty}%) scale(${zoom})` }} />
      </div>
      <div className="photo-cropper-controls">
        <span className="label">Zoom</span>
        <input type="range" min={1} max={2} step={0.02} value={zoom}
          onChange={(e) => onChange({ x, y, zoom: Number(e.target.value) })} />
        <button type="button" className="button button--ghost button--small" onClick={() => onChange({ x: 0.5, y: 0.3, zoom: 1 })}>Reset</button>
      </div>
    </div>
  );
}

type AuthUser = { id: string; fullName: string; email?: string | null; phone?: string | null; status?: string; role?: string };

type ProfileData = {
  gender: string | null;
  created_for: string | null;
  ministry: string | null;
  organisation: string | null;
  service: string | null;
  posting_outlook: string | null;
  preferred_hubs: string | null;
  about: string | null;
  residence_city: string | null;
  verified_at: number | null;
  family_notes?: string | null;
  // Phase B: index signature covers the expanded field set.
  [key: string]: unknown;
};

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'M';
  return ((parts[0][0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '')).toUpperCase();
}

function firstNameOf(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

function profileStrength(p: ProfileData | null, hasPhoto: boolean, verified: boolean) {
  let s = 0;
  if (p?.service) s += 15;
  if (p?.residence_city) s += 10;
  if (p?.posting_outlook) s += 10;
  if (p?.ministry || p?.organisation) s += 10;
  if (p?.about) s += 20;
  if (hasPhoto) s += 20;
  if (verified) s += 15;
  return Math.min(100, s);
}

/** View Transitions API wrapper — cross-fades state changes where supported. */
function withViewTransition(update: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
  if (typeof doc.startViewTransition === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    doc.startViewTransition(() => flushSync(update));
  } else {
    update();
  }
}

/** Primary CTA that subtly gravitates toward the cursor (fine pointers only). */
function MagneticButton({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const onMove = (event: React.MouseEvent) => {
    const el = ref.current;
    if (!el || !window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${x * 0.16}px, ${y * 0.22}px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ''; };
  return <button ref={ref} className={className} onClick={onClick} onMouseMove={onMove} onMouseLeave={onLeave}>{children}</button>;
}

/** Animated number — counts up on mount, preserving formatting like "04", "1,284", "98%". */
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = parseInt(value.replace(/[^0-9]/g, ''), 10);
    if (Number.isNaN(target) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = value; return; }
    const digits = value.replace(/[^0-9]/g, '').length;
    const leadingZero = /^0/.test(value.replace(/[^0-9].*$/, '') || value);
    const format = (n: number) => value.replace(/[0-9][0-9,]*/, leadingZero ? String(n).padStart(digits, '0') : n.toLocaleString('en-IN'));
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1100);
      el.textContent = format(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span ref={ref}>{value}</span>;
}

/** Gold gota-ribbon section divider. */
function GotaDivider() {
  return <div className="gota-divider" aria-hidden>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 0.8 13.2 7 7 13.2 0.8 7Z" stroke="currentColor" strokeWidth="1" /><path d="M7 4 10 7 7 10 4 7Z" fill="currentColor" /></svg>
  </div>;
}

/** Hand-drawn-style paisley accent for the hero. */
function Paisley({ size = 54 }: { size?: number }) {
  return <svg className="paisley-float" width={size} height={size} viewBox="0 0 54 54" fill="none" aria-hidden>
    <path d="M38 8C25 2 10 10 8 24c-2 12 7 22 19 22 9 0 15-6 15-13 0-6-5-11-11-11-5 0-8 4-8 8 0 3 2 5 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="28" cy="30" r="1.6" fill="currentColor" />
  </svg>;
}

function AuthModal({ onClose, onAuthenticated, initialMode = 'login' }: { onClose: () => void; onAuthenticated: (user: AuthUser, mode: 'login' | 'signup') => void; initialMode?: 'login' | 'signup' }) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true); setError('');
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const response = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ identifier, password, fullName, email }) });
    const data = await response.json().catch(() => null) as { error?: string; user?: AuthUser } | null;
    setBusy(false);
    if (!response.ok || !data?.user) { setError(data?.error ?? 'Something went wrong. Please try again.'); return; }
    onAuthenticated(data.user, mode);
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <div className="modal auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={(e) => e.stopPropagation()}>
      <button className="icon-button modal-close" aria-label="Close" onClick={onClose}><Icon name="x" /></button>
      <div className="modal-kicker"><Icon name="shield" size={16} /> Private by design</div>
      <h2 id="auth-title">{mode === 'login' ? 'Welcome back' : 'Create your free profile'}</h2>
      <p className="modal-copy">Your account is visible only to people you choose. We never sell member data.</p>
      {mode === 'signup' && <label className="field"><span>Full name</span><input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name" /></label>}
      <label className="field"><span>Email or mobile number</span><input value={identifier} onChange={(event) => setIdentifier(event.target.value)} type="text" placeholder="you@example.com or +91 98••• •••••" /></label>
      {mode === 'signup' && <label className="field"><span>Recovery email <small>(optional)</small></span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="For password recovery" /></label>}
      <label className="field"><span>Password</span><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="At least 8 characters" /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button--primary button--full" onClick={submit} disabled={busy}>{busy ? 'Securing your account…' : mode === 'login' ? 'Continue securely' : 'Create profile'} {!busy && <Icon name="arrow" size={16} />}</button>
      <p className="modal-foot">{mode === 'login' ? 'New to NCRSarkariShaadi?' : 'Already have an account?'} <button className="text-button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Create a profile' : 'Sign in'}</button></p>
      <p className="microcopy">By continuing, you agree to our Terms and Privacy Policy.</p>
    </div>
  </div>;
}

function OnboardModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [step, setStep] = useState(1);
  const [createdFor, setCreatedFor] = useState('Myself');
  const [selectedMinistry, setSelectedMinistry] = useState('');
  const [selectedOrganisation, setSelectedOrganisation] = useState('');
  const [service, setService] = useState('');
  const [otherService, setOtherService] = useState('');
  const [ncrBase, setNcrBase] = useState('Delhi (NCT)');
  const [postingOutlook, setPostingOutlook] = useState('Stay in NCR');
  const [preferredHubs, setPreferredHubs] = useState('Delhi, Noida, Gurugram');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const organisations = selectedMinistry ? organisationsForMinistry(selectedMinistry) : [];
  const finish = async () => {
    setSaving(true); setSaveError('');
    const resolvedService = service === 'Other' ? otherService.trim() : service;
    const response = await fetch('/api/profile', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ created_for: createdFor, ministry: selectedMinistry, organisation: selectedOrganisation, service: resolvedService, residence_city: ncrBase, posting_outlook: postingOutlook, preferred_hubs: preferredHubs }) }).catch(() => null);
    setSaving(false);
    if (!response?.ok) { setSaveError('We could not save your details. Please try again.'); return; }
    onDone();
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <div className="modal onboard-modal" role="dialog" aria-modal="true" aria-labelledby="onboard-title" onMouseDown={(e) => e.stopPropagation()}>
      <button className="icon-button modal-close" aria-label="Close" onClick={onClose}><Icon name="x" /></button>
      <div className="onboard-head"><span className="modal-kicker">Step {step} of 3</span><div className="step-line"><span style={{ width: `${step * 33.33}%` }} /></div></div>
      {step === 1 && <><h2 id="onboard-title">Start with what keeps you here</h2><p className="modal-copy">Your posting plan matters more than a pin on a map.</p><label className="field"><span>Profile created for</span><select value={createdFor} onChange={(event) => setCreatedFor(event.target.value)}><option>Myself</option><option>My daughter</option><option>My son</option><option>My sibling</option><option>A relative or friend</option></select></label><label className="field"><span>Ministry</span><select value={selectedMinistry} onChange={(event) => { setSelectedMinistry(event.target.value); setSelectedOrganisation(''); }}><option value="">Select your ministry</option>{ministryNames.map((ministry) => <option key={ministry} value={ministry}>{ministry}</option>)}</select></label><label className="field"><span>Department / organisation</span><select value={selectedOrganisation} onChange={(event) => setSelectedOrganisation(event.target.value)} disabled={!selectedMinistry}><option value="">{selectedMinistry ? 'Select department or organisation' : 'Select a ministry first'}</option>{organisations.map((entry) => <option key={`${entry.type}-${entry.name}`} value={entry.name}>{entry.name} · {entry.type}</option>)}</select></label><label className="field"><span>Service / cadre</span><select value={service} onChange={(event) => setService(event.target.value)}><option value="" disabled>Select your service</option>{serviceCadres.map((cadre) => <option key={cadre} value={cadre}>{cadre}</option>)}</select></label>{service === 'Other' && <label className="field"><span>Name your service / cadre</span><input value={otherService} onChange={(event) => setOtherService(event.target.value)} placeholder="Type your service or cadre" /></label>}<label className="field"><span>Current NCR base</span><select value={ncrBase} onChange={(event) => setNcrBase(event.target.value)}>{ncrDistrictGroups.map((group) => <optgroup key={group.state} label={group.state}>{group.districts.map((district) => <option key={district} value={district}>{district}</option>)}</optgroup>)}</select></label><button className="button button--primary button--full" onClick={() => setStep(2)}>Next: your preferences <Icon name="arrow" size={16} /></button></>}
      {step === 2 && <><h2 id="onboard-title">What should your match know?</h2><p className="modal-copy">Share only what feels right. You control who sees every detail.</p><div className="choice-grid"><button className={`choice-card ${postingOutlook === 'Stay in NCR' ? 'choice-card--selected' : ''}`} onClick={() => setPostingOutlook('Stay in NCR')}><span><Icon name="home" size={16} /></span><strong>Stay in NCR</strong><small>My priority is a shared NCR home</small></button><button className={`choice-card ${postingOutlook === 'Open to movement' ? 'choice-card--selected' : ''}`} onClick={() => setPostingOutlook('Open to movement')}><span><Icon name="arrow" size={16} /></span><strong>Open to movement</strong><small>We can discuss future postings</small></button></div><label className="field"><span>Preferred NCR hubs</span><input value={preferredHubs} onChange={(event) => setPreferredHubs(event.target.value)} /></label><button className="button button--primary button--full" onClick={() => setStep(3)}>Next: verification <Icon name="arrow" size={16} /></button></>}
      {step === 3 && <><div className="success-orb"><Icon name="shield" size={28} /></div><h2 id="onboard-title">A trusted profile starts here</h2><p className="modal-copy">Verify your mobile today. Add service and identity documents when you’re ready; our team reviews them privately.</p><div className="verify-list"><div><span className="verify-number">1</span><span><strong>Mobile OTP</strong><small>Confirms you own the number</small></span><Icon name="check" size={16} /></div><div><span className="verify-number">2</span><span><strong>Service proof</strong><small>Visible only as a trust badge</small></span><Icon name="clock" size={16} /></div><div><span className="verify-number">3</span><span><strong>Photo + ID</strong><small>Encrypted and never public</small></span><Icon name="clock" size={16} /></div></div>{saveError && <p className="form-error" role="alert">{saveError}</p>}<button className="button button--primary button--full" onClick={finish} disabled={saving}>{saving ? 'Saving your details…' : 'Open my dashboard'} {!saving && <Icon name="arrow" size={16} />}</button></>}
      <p className="microcopy">Completely free. No paid tiers, no hidden contact fees.</p>
    </div>
  </div>;
}

const marqueeCadres = ['CSS', 'CSSS', 'RBSS', 'AFHQCS', 'IFS · MEA', 'Lok Sabha Sectt.', 'Rajya Sabha Sectt.', 'DANICS', 'DANIPS', 'DDA', 'DASS', 'GNCTDSS', 'MCD', 'NDMC', 'DTC', 'DMRC', 'DTL'];

/* Representative couples for the launch preview. When real photographs arrive
   (with written permission), place files in public/stories/ and set
   e.g. photo: '/stories/couple-1.jpg' — the card upgrades automatically. */
type Story = { id: number; names: string; married: string; place: string; tone: string; photo?: string };
const successStories: Story[] = [
  { id: 1, names: 'Arjun & Meera', married: 'March 2025', place: 'New Delhi', tone: 'rose', photo: '/stories/delhi.jpg' },
  { id: 2, names: 'Kabir & Ananya', married: 'November 2024', place: 'Gurugram', tone: 'sand', photo: '/stories/gurugram.jpg' },
  { id: 3, names: 'Rohit & Saanvi', married: 'February 2025', place: 'Noida', tone: 'sage', photo: '/stories/noida.jpg' },
  { id: 4, names: 'Vikram & Ishita', married: 'December 2024', place: 'New Delhi', tone: 'sand', photo: '/stories/delhi-parliament.jpg' },
  { id: 5, names: 'Karan & Diya', married: 'January 2025', place: 'Faridabad', tone: 'rose', photo: '/stories/faridabad.jpg' },
  { id: 6, names: 'Aditya & Neha', married: 'April 2025', place: 'Ghaziabad', tone: 'sage', photo: '/stories/ghaziabad.jpg' },
  { id: 7, names: 'Nikhil & Riya', married: 'October 2024', place: 'Greater Noida', tone: 'sand', photo: '/stories/greaternoida.jpg' },
];

/** Illustrated wedding-couple art (silhouette style) for cards without a photograph yet. */
function CoupleArt({ tone }: { tone: string }) {
  const palettes: Record<string, { groom: string; bride: string }> = {
    rose: { groom: '#4a1220', bride: '#a03040' },
    sand: { groom: '#43121f', bride: '#8a5f14' },
    sage: { groom: '#2f5744', bride: '#6b2233' },
  };
  const p = palettes[tone] ?? palettes.rose;
  return <svg className="couple-art" viewBox="0 0 300 360" role="img" aria-label="Illustration of a wedding couple">
    {/* marigold garland swags */}
    <path d="M20 14 Q150 84 280 14" fill="none" stroke="#a8790f" strokeWidth="1.4" strokeDasharray="1 7" strokeLinecap="round" opacity="0.75" />
    <path d="M52 8 Q150 60 248 8" fill="none" stroke="#c99f3f" strokeWidth="1.2" strokeDasharray="1 6" strokeLinecap="round" opacity="0.6" />
    <circle cx="150" cy="52" r="4" fill="#c99f3f" opacity="0.8" /><circle cx="96" cy="40" r="3" fill="#a8790f" opacity="0.7" /><circle cx="204" cy="40" r="3" fill="#a8790f" opacity="0.7" />
    {/* groom */}
    <circle cx="128" cy="176" r="27" fill={p.groom} />
    <path d="M104 158 q24-20 48 0 l-4-16 q-20-12-40 0 Z" fill={p.groom} opacity="0.85" />
    <path d="M86 360 V254 q0-48 42-48 q42 0 42 48 V360 Z" fill={p.groom} />
    <path d="M120 214 l8 14 8-14" fill="none" stroke="#e6c36a" strokeWidth="1.6" strokeLinecap="round" />
    {/* bride */}
    <circle cx="196" cy="198" r="23" fill={p.bride} />
    <path d="M162 236 q6-64 68-42 q14 26 2 44" fill="none" stroke="#c99f3f" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
    <path d="M162 360 V270 q0-42 36-42 q36 0 36 42 V360 Z" fill={p.bride} />
    <circle cx="196" cy="188" r="2.4" fill="#e6c36a" />
    <path d="M188 232 q8 8 16 0" fill="none" stroke="#e6c36a" strokeWidth="1.6" strokeLinecap="round" />
    {/* joined hands garland dot */}
    <circle cx="160" cy="286" r="5" fill="#c99f3f" opacity="0.9" />
  </svg>;
}

function StoriesSection() {
  const railRef = useRef<HTMLDivElement>(null);
  const scrollRail = (dir: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>('.story-card');
    rail.scrollBy({ left: dir * ((card?.offsetWidth ?? 320) + 22), behavior: 'smooth' });
  };
  return <section className="section shell stories-section" aria-label="Happy couples of Delhi NCR">
    <div className="section-intro reveal"><div className="eyebrow">Happy couples of Delhi NCR</div><h2>Lives that stayed <em className="stories-em">close to home.</em></h2><p>Real couples who married and built their life together in the NCR — shared here with their permission. Your story could join them.</p></div>
    <blockquote className="stories-quote reveal" data-reveal-delay="1"><Icon name="spark" size={18} /><p>“We both worked in different ministries and never imagined we’d meet — the big apps kept showing people from across the country. Here, every profile already understood the life we were trying to build.”</p><cite>Representative of the couples NCRSarkariShaadi is built for</cite></blockquote>
    <div className="stories-rail-wrap reveal" data-reveal-delay="2">
      <button className="rail-nav rail-nav--prev" aria-label="Previous stories" onClick={() => scrollRail(-1)}><Icon name="chevron" size={18} /></button>
      <div className="stories-rail" ref={railRef}>
        {successStories.map((story) => <article className="story-card" key={story.id}>
          <div className={`story-photo story-photo--${story.tone}`}>{story.photo ? <img src={story.photo} alt={`${story.names}, married in ${story.place}`} loading="lazy" /> : <CoupleArt tone={story.tone} />}</div>
          <div className="story-meta"><h3>{story.names}</h3><span className="story-rule" /><small>{story.married} · {story.place}</small></div>
        </article>)}
      </div>
      <button className="rail-nav rail-nav--next" aria-label="More stories" onClick={() => scrollRail(1)}><Icon name="chevron" size={18} /></button>
    </div>
    <p className="stories-note reveal" data-reveal-delay="2"><Icon name="shield" size={14} /> Representative visuals for the launch preview. Member photographs appear only with written consent, and are never part of public profiles.</p>
  </section>;
}

// ---- Emotion-first landing sections (research-driven) ----

const routineSteps: { icon: IconName; time: string; label: string }[] = [
  { icon: 'clock', time: 'Morning', label: 'Chai and breakfast together before the day begins' },
  { icon: 'briefcase', time: 'Day', label: 'Both leave for office — and both come home to the same city' },
  { icon: 'home', time: 'Evening', label: 'Dinner together, not a video call across two cities' },
  { icon: 'users', time: 'Weekend', label: 'Parents, children, a trip — one shared life, not two' },
];

function SpineSection({ onOnboard }: { onOnboard: () => void }) {
  return <section className="section shell spine-section" aria-label="Two careers, one city, one life">
    <div className="section-intro reveal"><div className="eyebrow">Why a shared government life</div><h2>Two careers. One city. <em className="stories-em">One life.</em></h2><p>Marrying another permanently Delhi-posted government professional isn’t only about matching biodata. It aligns two whole lives — the rule-books, the leave calendars, the postings, and the home you build around both. These are real advantages, not guarantees; compatibility still matters most.</p></div>
    <div className="stat-tiles reveal" data-reveal-delay="1">
      <div className="stat-tile"><strong>2</strong><span>pensions &amp; CGHS covers — one secure household</span></div>
      <div className="stat-tile"><strong>1</strong><span>city, one home — no second rent, no two kitchens</span></div>
      <div className="stat-tile"><strong>0</strong><span>long-distance — the biggest stressor, removed by design</span></div>
      <div className="stat-tile stat-tile--accent"><strong>Same</strong><span>rule-book — fewer arguments about “why I’m on election duty”</span></div>
    </div>
    <div className="routine-strip reveal" data-reveal-delay="2">{routineSteps.map((step, i) => <div className="routine-step" key={step.time}><span className="routine-icon"><Icon name={step.icon} size={20} /></span><strong>{step.time}</strong><small>{step.label}</small>{i < routineSteps.length - 1 && <i className="routine-arrow"><Icon name="arrow" size={15} /></i>}</div>)}</div>
    <div className="spine-cta reveal"><button className="button button--dark" onClick={onOnboard}>Start with what keeps you here <Icon name="arrow" size={15} /></button></div>
  </section>;
}

function SameCitySection() {
  const away = ['Flights and trains, again and again', 'Two rents, two kitchens, duplicate bills', 'Lonely weekends and missed dinners', 'One parent carrying most days alone', 'A quiet ₹8+ lakh drained every year'];
  const together = ['One home you actually share', 'Daily dinners, ordinary evenings together', 'Shared parenting — both present', 'One budget, stronger savings', 'Together for the small moments that matter'];
  return <section className="section section--soft same-city" aria-label="Why same city matters">
    <div className="shell"><div className="section-intro reveal"><div className="eyebrow">Why same-city matters</div><h2>The difference a shared postal code makes.</h2><p>Even two government careers can drift apart when they sit in different cities. Delhi NCR, by design, removes the single biggest structural stress of a service marriage.</p></div>
    <div className="split-grid reveal" data-reveal-delay="1">
      <div className="split-card split-card--away"><div className="split-head"><Icon name="clock" size={18} /> Different cities</div><ul>{away.map((t) => <li key={t}><span className="split-x"><Icon name="x" size={12} /></span>{t}</li>)}</ul></div>
      <div className="split-versus" aria-hidden><Icon name="heart" size={18} /></div>
      <div className="split-card split-card--together"><div className="split-head"><Icon name="home" size={18} /> Delhi NCR, together</div><ul>{together.map((t) => <li key={t}><span className="split-check"><Icon name="check" size={12} /></span>{t}</li>)}</ul></div>
    </div>
    <p className="split-note reveal" data-reveal-delay="2"><Icon name="spark" size={14} /> Cost figures are illustrative — every posting and family is different.</p></div>
  </section>;
}

function FreeMessagingBand({ onOnboard }: { onOnboard: () => void }) {
  return <section className="shell free-band reveal" aria-label="Free two-way messaging">
    <div className="free-band-icon"><Icon name="mail" size={26} /></div>
    <div className="free-band-copy"><h3>Free two-way messaging. No premium tier, ever.</h3><p>No “men pay, women free” divide. No upgrade to unlock a conversation, view a number, or be taken seriously. Government salaries are public — we won’t gatekeep connection behind a fee. Every verified member has identical access.</p></div>
    <button className="button button--outline" onClick={onOnboard}>Join free <Icon name="arrow" size={15} /></button>
  </section>;
}

const verifySteps: { icon: IconName; label: string }[] = [
  { icon: 'mail', label: 'Mobile OTP' },
  { icon: 'briefcase', label: 'Government ID' },
  { icon: 'user', label: 'Human review' },
  { icon: 'check', label: 'Photo match' },
  { icon: 'shield', label: 'Live badge' },
  { icon: 'clock', label: 'Ongoing watch' },
];

function VerificationPipeline() {
  return <section className="section shell verify-section" aria-label="How verification works">
    <div className="section-intro reveal"><div className="eyebrow">Trust as a system, not a badge</div><h2>Verified before visible.</h2><p>In a community of public servants, a fake profile is a reputational risk — so trust here is a pipeline, not a tick-mark. Your documents are reviewed privately and never displayed. Other members only ever see the badge.</p></div>
    <div className="pipeline reveal" data-reveal-delay="1">{verifySteps.map((s, i) => <div className="pipeline-step" key={s.label}><span className="pipeline-node"><Icon name={s.icon} size={18} /></span><small>{s.label}</small>{i < verifySteps.length - 1 && <i className="pipeline-line" aria-hidden />}</div>)}</div>
  </section>;
}

const compareRows: { promise: string; deliver: string }[] = [
  { promise: '“Verified profiles”', deliver: 'Human-reviewed government-service verification with visible badges' },
  { promise: '“Free messaging”', deliver: 'Truly free two-way chat — no premium tiers, no unlock fees' },
  { promise: '“Privacy settings”', deliver: 'Granular, women-first controls: hidden profiles, photo-on-request, contact masking' },
  { promise: '“Local matches”', deliver: 'Strict Delhi NCR focus — every profile is current and geographically real' },
  { promise: '“Serious intentions”', deliver: 'Community limited to government professionals and their families' },
];

function ComparisonTable() {
  return <section className="section shell compare-section" aria-label="What others promise versus what we deliver">
    <div className="section-intro reveal"><div className="eyebrow">The honest comparison</div><h2>What others promise. What we actually deliver.</h2></div>
    <div className="compare-table reveal" data-reveal-delay="1"><div className="compare-head"><span>What others promise</span><span>What we deliver</span></div>{compareRows.map((r) => <div className="compare-row" key={r.promise}><span className="compare-promise">{r.promise}</span><span className="compare-deliver"><Icon name="check" size={14} />{r.deliver}</span></div>)}</div>
  </section>;
}

const womenControls: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'lock', title: 'Hidden by default', desc: 'Stay invisible to general browsing — appear only to members you approve.' },
  { icon: 'mail', title: 'Review before contact', desc: 'Screen interest requests first. No unsolicited detail-sharing.' },
  { icon: 'shield', title: 'Documents stay confidential', desc: 'Service and identity papers are reviewed privately, never shown on your profile.' },
  { icon: 'search', title: 'No “recently viewed” trail', desc: 'Browse profiles without appearing in anyone’s viewed list unless you engage.' },
];

function WomenPrivacySection() {
  return <section className="section shell women-section" aria-label="Built with women in government in mind">
    <div className="section-intro reveal"><div className="eyebrow">Built with women in government in mind</div><h2>Anonymity isn’t a luxury. It’s a necessity.</h2><p>For women in visible government roles, privacy is a foundational expectation — not an add-on. Every control here is granular and reversible, so you decide who sees what, and when.</p></div>
    <div className="women-grid reveal" data-reveal-delay="1">{womenControls.map((c) => <div className="women-card" key={c.title}><span className="women-icon"><Icon name={c.icon} size={18} /></span><strong>{c.title}</strong><small>{c.desc}</small></div>)}</div>
  </section>;
}

// ---- Client-side interactive tools (no backend; honest — they compute on the user's own input) ----

function inr(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} crore`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} lakh`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

const awayCities = ['Bengaluru', 'Mumbai', 'Pune', 'Kolkata', 'Chennai', 'Hyderabad'];
const cityAirfare: Record<string, number> = { Bengaluru: 12000, Mumbai: 10000, Pune: 11000, Kolkata: 9000, Chennai: 12000, Hyderabad: 10000 };
const tripsPerYear: Record<string, number> = { 'Every month': 12, 'Every fortnight': 24, 'Once a quarter': 4 };

function FinancialCalculator() {
  const [city, setCity] = useState('Bengaluru');
  const [freq, setFreq] = useState('Every month');
  const [housing, setHousing] = useState('Rented flat');
  const travel = tripsPerYear[freq] * cityAirfare[city];
  const secondHome = (housing === 'Rented flat' ? 216000 : 78000) + 96000; // rent/licence fee + duplicate utilities & help
  const yearly = travel + secondHome;
  const invested = yearly * 45.76; // annual amount compounded ~8% p.a. over 20 years
  return <section className="section shell calc-section" aria-label="Cost of a long-distance government marriage">
    <div className="section-intro reveal"><div className="eyebrow">The quiet cost of two cities</div><h2>What does living apart really cost?</h2><p>Marriage is not meant to be lived between phone calls, weekend flights and countdowns to the next meeting.</p><p>It is the morning tea together. Coming home to each other after a difficult day. Sharing dinner, raising children, caring for parents, celebrating ordinary moments — and simply knowing that your partner is there.</p><p>When two careers keep a couple in different cities, the cost isn’t only two homes and endless travel. Togetherness suffers. The bond gets less everyday time. And years meant to be lived together can quietly become years spent waiting to be together.</p><p>There is a financial cost too. Use the calculator below to see a rough estimate of what maintaining two lives may cost — but remember, the most valuable things lost to distance can never be calculated in rupees.</p></div>
    <p className="calc-lead reveal" data-reveal-delay="1">You aren’t choosing between two cities. You may be choosing how much of your married life you actually get to live together.</p>
    <div className="calc-grid reveal" data-reveal-delay="1">
      <div className="calc-inputs">
        <label className="field"><span>If your spouse were posted in</span><select value={city} onChange={(e) => setCity(e.target.value)}>{awayCities.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="field"><span>You’d meet</span><select value={freq} onChange={(e) => setFreq(e.target.value)}>{Object.keys(tripsPerYear).map((f) => <option key={f}>{f}</option>)}</select></label>
        <label className="field"><span>Second household is a</span><select value={housing} onChange={(e) => setHousing(e.target.value)}><option>Rented flat</option><option>Government quarter</option></select></label>
      </div>
      <div className="calc-result">
        <div className="calc-figure"><span>Rough cost, every year</span><strong>{inr(yearly)}</strong></div>
        <div className="calc-sub"><div><span>Over 20 years</span><strong>{inr(yearly * 20)}</strong></div><div><span>If invested instead (8% p.a.)</span><strong>{inr(invested)}</strong></div></div>
        <p className="calc-note"><Icon name="spark" size={13} /> Illustrative estimate only — travel, rent and habits vary widely. The point isn’t the exact figure; it’s the shape of the trade-off.</p>
      </div>
    </div>
    <p className="calc-closing reveal" data-reveal-delay="2">Some costs appear in your bank account. Others appear in the moments you never got to share.</p>
  </section>;
}

function CompatibilityDemo() {
  const [base, setBase] = useState('Delhi');
  const [outlook, setOutlook] = useState('Stay in NCR');
  const [parents, setParents] = useState('In Delhi NCR');
  const stay = outlook === 'Stay in NCR';
  const parentsNcr = parents === 'In Delhi NCR';
  const rows: { label: string; score: number }[] = [
    { label: 'Daily-commute compatibility', score: stay ? 94 : 82 },
    { label: 'Transfer compatibility', score: stay ? 96 : 79 },
    { label: 'Family alignment', score: parentsNcr ? 91 : 76 },
    { label: 'Children’s stability', score: stay ? 93 : 81 },
  ];
  const overall = Math.round(rows.reduce((a, r) => a + r.score, 0) / rows.length);
  return <section className="section shell demo-section" aria-label="See career-aware matching in action">
    <div className="section-intro reveal"><div className="eyebrow">See it, don’t just read it</div><h2>Career-aware matching, made visible.</h2><p>Generic sites match on age and photos. We weigh the life you actually live. Adjust these and watch the signals change — this is the logic behind every recommendation.</p></div>
    <div className="demo-grid reveal" data-reveal-delay="1">
      <div className="demo-inputs">
        <label className="field"><span>Your NCR base</span><select value={base} onChange={(e) => setBase(e.target.value)}>{coreNcrHubs.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="field"><span>Posting outlook</span><select value={outlook} onChange={(e) => setOutlook(e.target.value)}><option>Stay in NCR</option><option>Open to movement</option></select></label>
        <label className="field"><span>Your parents are</span><select value={parents} onChange={(e) => setParents(e.target.value)}><option>In Delhi NCR</option><option>In another state</option></select></label>
      </div>
      <div className="demo-result">
        <div className="demo-overall"><span className="demo-ring" style={{ '--pct': overall } as React.CSSProperties}><strong>{overall}%</strong></span><div><strong>Overall NCR alignment</strong><small>A weighted read of real-life fit — not a biodata tick-box.</small></div></div>
        <div className="demo-bars">{rows.map((r) => <div className="demo-bar" key={r.label}><div className="demo-bar-top"><span>{r.label}</span><strong>{r.score}%</strong></div><div className="demo-track"><i style={{ width: `${r.score}%` }} /></div></div>)}</div>
        <p className="calc-note"><Icon name="spark" size={13} /> An illustrative preview — real matches also weigh service, age, family and preferences.</p>
      </div>
    </div>
  </section>;
}

function PrivacyPlayground() {
  const [photoPublic, setPhotoPublic] = useState(false);
  const [profilePublic, setProfilePublic] = useState(false);
  return <section className="section shell playground-section" aria-label="See exactly what others can view">
    <div className="section-intro reveal"><div className="eyebrow">Nothing to take on faith</div><h2>See exactly what another member can view.</h2><p>Before you register, try the controls. The panel on the right updates live to show precisely what a stranger sees — because trust should be demonstrable, not promised.</p></div>
    <div className="playground-grid reveal" data-reveal-delay="1">
      <div className="playground-controls">
        <div className="pg-row"><span className="setting-symbol"><Icon name="user" size={17} /></span><span><strong>Your photo</strong><small>{photoPublic ? 'Visible to verified members' : 'On request — you approve each viewer'}</small></span><button className={`toggle ${photoPublic ? 'toggle--on' : ''}`} aria-pressed={photoPublic} aria-label="Toggle photo visibility" onClick={() => setPhotoPublic(!photoPublic)}><i /></button></div>
        <div className="pg-row"><span className="setting-symbol"><Icon name="briefcase" size={17} /></span><span><strong>Detailed profile</strong><small>{profilePublic ? 'Visible to verified members' : 'Matches only — a limited preview otherwise'}</small></span><button className={`toggle ${profilePublic ? 'toggle--on' : ''}`} aria-pressed={profilePublic} aria-label="Toggle profile visibility" onClick={() => setProfilePublic(!profilePublic)}><i /></button></div>
        <div className="pg-row pg-row--locked"><span className="setting-symbol"><Icon name="mail" size={17} /></span><span><strong>Phone &amp; email</strong><small>Never public — shared only by mutual consent</small></span><span className="pg-lock"><Icon name="lock" size={15} /></span></div>
        <div className="pg-row pg-row--locked"><span className="setting-symbol"><Icon name="shield" size={17} /></span><span><strong>Verification documents</strong><small>Reviewed privately — only the badge is ever shown</small></span><span className="pg-lock"><Icon name="lock" size={15} /></span></div>
      </div>
      <div className="playground-preview">
        <div className="pg-preview-label">What a stranger sees</div>
        <div className="pg-preview-card">
          <div className={`pg-photo ${photoPublic ? 'pg-photo--on' : ''}`}>{photoPublic ? <Icon name="user" size={26} /> : <><Icon name="lock" size={18} /><small>Photo on request</small></>}</div>
          <div className="pg-fields">
            <div><span>Name</span><strong>{profilePublic ? 'Priya S.' : 'P•••• S.'}</strong></div>
            <div><span>Service</span><strong>{profilePublic ? 'CSS · Group B' : 'Government (verified)'}</strong></div>
            <div><span>Phone</span><strong className="pg-masked">+91 ••••• •••••</strong></div>
            <div><span>Documents</span><strong className="pg-badge"><Icon name="check" size={11} /> Verified</strong></div>
          </div>
        </div>
        <p className="calc-note"><Icon name="lock" size={13} /> Contact and documents stay protected no matter which switches you flip.</p>
      </div>
    </div>
  </section>;
}

const neighbourhoods: Record<string, { commute: number; schools: number; quarters: number; metro: number; value: number }> = {
  'Dwarka': { commute: 78, schools: 88, quarters: 82, metro: 90, value: 84 },
  'R.K. Puram / Central Delhi': { commute: 96, schools: 90, quarters: 95, metro: 92, value: 60 },
  'Noida': { commute: 74, schools: 86, quarters: 70, metro: 88, value: 80 },
  'Gurugram': { commute: 70, schools: 90, quarters: 58, metro: 78, value: 64 },
  'Ghaziabad': { commute: 68, schools: 76, quarters: 56, metro: 80, value: 88 },
  'Faridabad': { commute: 66, schools: 74, quarters: 55, metro: 76, value: 90 },
};
const neighSignals: { key: keyof (typeof neighbourhoods)[string]; label: string }[] = [
  { key: 'commute', label: 'Commute to central secretariat' },
  { key: 'schools', label: 'Schools & coaching nearby' },
  { key: 'quarters', label: 'Government quarters' },
  { key: 'metro', label: 'Metro connectivity' },
  { key: 'value', label: 'Value for money' },
];

const benefitFactors = ['Job security', 'Location stability', 'Overlapping holidays', 'Retirement planning', 'Everyday togetherness', 'Shared service understanding'];
const benefitScenarios: { label: string; scores: number[]; note: string }[] = [
  { label: 'Both in government, same NCR city', scores: [92, 95, 90, 90, 96, 94], note: 'Two secure careers, one household, and everyday life actually lived together — the configuration this platform is built around.' },
  { label: 'Government + private-sector spouse', scores: [72, 68, 62, 66, 78, 64], note: 'Often higher peak pay, but with more volatility, differing calendars, and less shared understanding of service life.' },
  { label: 'Both government, different cities', scores: [90, 55, 86, 88, 46, 92], note: 'Two stable careers — but two homes, heavy travel, and years spent waiting to be together.' },
];

function BenefitsExplorer() {
  const [idx, setIdx] = useState(0);
  const s = benefitScenarios[idx];
  return <section className="section shell demo-section" aria-label="Compare marriage scenarios">
    <div className="section-intro reveal"><div className="eyebrow">See the difference for yourself</div><h2>Which future are you building?</h2><p>The advantage isn’t simply that both people are government employees — it’s the combination of two stable careers, one city, and a life you can actually share. Compare the scenarios below.</p></div>
    <div className="demo-grid reveal" data-reveal-delay="1">
      <div className="demo-inputs"><label className="field"><span>A marriage where you are…</span><select value={idx} onChange={(e) => setIdx(Number(e.target.value))}>{benefitScenarios.map((sc, i) => <option key={sc.label} value={i}>{sc.label}</option>)}</select></label><p className="calc-note"><Icon name="spark" size={13} /> {s.note} Illustrative — every couple is different; compatibility matters more than profession.</p></div>
      <div className="demo-result"><div className="demo-bars">{benefitFactors.map((f, i) => <div className="demo-bar" key={f}><div className="demo-bar-top"><span>{f}</span><strong>{s.scores[i]}%</strong></div><div className="demo-track"><i style={{ width: `${s.scores[i]}%` }} /></div></div>)}</div></div>
    </div>
  </section>;
}

function NeighbourhoodCompat() {
  const [place, setPlace] = useState('Dwarka');
  const data = neighbourhoods[place];
  return <section className="section shell demo-section" aria-label="Neighbourhood compatibility across Delhi NCR">
    <div className="section-intro reveal"><div className="eyebrow">Where in the NCR fits you both?</div><h2>Every neighbourhood is a different trade-off.</h2><p>Commute, schools, quarters, metro, cost — the right base depends on both careers. Compare NCR hubs at a glance.</p></div>
    <div className="demo-grid reveal" data-reveal-delay="1">
      <div className="demo-inputs"><label className="field"><span>Consider living in</span><select value={place} onChange={(e) => setPlace(e.target.value)}>{Object.keys(neighbourhoods).map((n) => <option key={n}>{n}</option>)}</select></label><p className="calc-note"><Icon name="spark" size={13} /> A broad, illustrative comparison — actual fit depends on your two specific offices and family.</p></div>
      <div className="demo-result"><div className="demo-bars">{neighSignals.map((s) => <div className="demo-bar" key={s.key}><div className="demo-bar-top"><span>{s.label}</span><strong>{data[s.key]}%</strong></div><div className="demo-track"><i style={{ width: `${data[s.key]}%` }} /></div></div>)}</div></div>
    </div>
  </section>;
}

const milestones: { year: string; label: string; desc: string; icon: IconName }[] = [
  { year: 'Year 1', label: 'Marriage', desc: 'Two verified careers, one shared NCR home from day one.', icon: 'heart' },
  { year: 'Year 3', label: 'A home', desc: 'Buy or settle into a place you both actually commute from.', icon: 'home' },
  { year: 'Year 5', label: 'Children', desc: 'One school, one neighbourhood — continuity from the start.', icon: 'users' },
  { year: 'Year 10', label: 'Both promoted', desc: 'Careers progress without one chasing the other city to city.', icon: 'briefcase' },
  { year: 'Retirement', label: 'Still together', desc: 'Two pensions, one city, a life built side by side.', icon: 'spark' },
];

function MarriageTimeline() {
  return <section className="section shell timeline-section" aria-label="A life you can plan for">
    <div className="section-intro reveal"><div className="eyebrow">A future you can actually plan</div><h2>Not just a match. A shared trajectory.</h2><p>When both careers stay in the NCR, the years ahead stop being a negotiation over whose posting wins. They become a plan you build together.</p></div>
    <div className="timeline reveal" data-reveal-delay="1">{milestones.map((m, i) => <div className="timeline-node" key={m.year} data-reveal-delay={String(Math.min(3, i))}><span className="timeline-dot"><Icon name={m.icon} size={18} /></span><span className="timeline-year">{m.year}</span><strong>{m.label}</strong><small>{m.desc}</small></div>)}</div>
  </section>;
}

function CommunityStats() {
  const [s, setS] = useState<{ total: number; male: number; female: number; verified: number } | null>(null);
  useEffect(() => { fetch('/api/stats').then((r) => r.json()).then(setS).catch(() => undefined); }, []);
  if (!s || s.total < 10) return null; // honest: appears only once the numbers are real
  return <section className="shell community-stats reveal" aria-label="Community at a glance">
    <div className="cstat"><strong><CountUp value={String(s.total)} /></strong><span>members in Delhi NCR</span></div>
    <div className="cstat"><strong><CountUp value={String(s.verified)} /></strong><span>verified profiles</span></div>
    <div className="cstat"><strong><CountUp value={String(s.female)} /></strong><span>women</span></div>
    <div className="cstat"><strong><CountUp value={String(s.male)} /></strong><span>men</span></div>
  </section>;
}

function Landing({ onAuth, onOnboard, onDemo }: { onAuth: () => void; onOnboard: () => void; onDemo: () => void }) {
  useEffect(() => {
    document.documentElement.classList.add('js');
    const targets = Array.from(document.querySelectorAll('.reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return <main className="landing">
    <nav className="landing-nav shell"><Logo /><div className="landing-links"><a href="#why">Why NCR</a><a href="#how">How it works</a><a href="#safety">Trust & privacy</a></div><div className="nav-actions"><button className="button button--ghost" onClick={onAuth}>Sign in</button><button className="button button--dark" onClick={onOnboard}>Create free profile <Icon name="arrow" size={15} /></button><button className="mobile-menu" aria-label="Open menu"><Icon name="menu" /></button></div></nav>
    <section className="hero shell"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot" /> The NCR’s verified matrimony community</div><h1><span className="reveal-line"><span>Two careers. One home.</span></span><span className="reveal-line"><span>One <em>future.</em></span></span></h1><p className="hero-lede">Finding someone attractive is easy. Finding someone whose career, postings, family expectations and future actually fit yours is hard. That’s why NCRSarkariShaadi exists.</p><div className="hero-chips"><span><Icon name="pin" size={14} /> Delhi NCR only</span><span><Icon name="shield" size={14} /> Verified government professionals</span><span><Icon name="lock" size={14} /> Women-first privacy</span><span><Icon name="spark" size={14} /> Free forever</span></div><div className="hero-actions"><MagneticButton className="button button--primary button--large" onClick={onOnboard}>Create free profile <Icon name="arrow" size={17} /></MagneticButton><button className="button button--text button--large" onClick={onDemo}>Browse matches <Icon name="arrow" size={17} /></button></div><p className="hero-cadres">For CSS · DANICS · IPS · IFS · DANIPS · DASS · RBSS · AFHQCS — and 15+ more central &amp; state services posted in Delhi NCR (National Capital Region).</p></div><div className="hero-visual"><div className="hero-glow" /><div className="match-art-card match-art-card--back"><span className="art-label">Posting compatibility</span><strong>Same city, same season</strong><div className="art-route"><span>Delhi</span><i>→</i><span>NCR</span></div></div><div className="match-art-card match-art-card--front"><div className="art-card-top"><span className="art-label">Today’s alignment</span><span className="art-score">94%</span></div><div className="art-people"><div className="art-person"><div className="portrait portrait--one">AS</div><span>Aditi</span><small>CSS · New Delhi</small></div><div className="art-heart"><Icon name="heart" size={20} /></div><div className="art-person"><div className="portrait portrait--two">RK</div><span>Rohan</span><small>DANICS · Noida</small></div></div><div className="art-tags"><span>Stay in NCR</span><span>Verified</span><span>Family-minded</span></div></div><div className="floating-note"><span className="note-icon"><Icon name="check" size={13} /></span><span><strong>Both are verified</strong><small>Documents reviewed privately</small></span></div><Paisley /></div></section>
    <section className="marquee" aria-label="Delhi's permanent government cadres"><div className="marquee-track">{[0, 1].map((copy) => marqueeCadres.map((cadre) => <span className="marquee-item" key={`${copy}-${cadre}`} aria-hidden={copy === 1}><svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden><path d="M5 0 10 5 5 10 0 5Z" /></svg>{cadre}</span>))}</div></section>
    <SpineSection onOnboard={onOnboard} />
    <BenefitsExplorer />
    <GotaDivider />
    <SameCitySection />
    <FinancialCalculator />
    <FreeMessagingBand onOnboard={onOnboard} />
    <section id="why" className="section shell why-section"><div className="section-intro reveal"><div className="eyebrow">The right first filter</div><h2>Compatibility is more than a checklist.</h2><p>For serving professionals, a good match has to work in real life—commutes, postings, parents, and a home you can share.</p></div><div className="feature-grid"><div className="feature-card feature-card--accent reveal"><span className="feature-number">01</span><Icon name="briefcase" size={23} /><h3>Career-aware matching</h3><p>We put service, posting flexibility, and your preferred NCR hubs at the centre of every recommendation.</p><em className="why-matters">A DANICS officer in Noida and a CSS officer in New Delhi share a commute reality a generic site simply can’t see.</em><a href="#how">See the matching logic <Icon name="arrow" size={14} /></a></div><div className="feature-card reveal" data-reveal-delay="1"><span className="feature-number">02</span><Icon name="shield" size={23} /><h3>Trust you can understand</h3><p>Identity, mobile, and service proof become clear, useful badges—not documents sitting in a dark folder.</p><em className="why-matters">In a community of public servants, identity fraud is a reputational risk — so we treat verification as seriously as you treat your service record.</em><a href="/verification">How verification works <Icon name="arrow" size={14} /></a></div><div className="feature-card reveal" data-reveal-delay="2"><span className="feature-number">03</span><Icon name="lock" size={23} /><h3>Privacy at every step</h3><p>Hide your photo, contact details, and detailed profile until you are comfortable. You decide who gets closer.</p><em className="why-matters">You share information in stages — basic first, details after interest, contact only when it feels right.</em><a href="/privacy">Explore privacy controls <Icon name="arrow" size={14} /></a></div></div></section>
    <CompatibilityDemo />
    <NeighbourhoodCompat />
    <GotaDivider />
    <section id="how" className="section section--soft"><div className="shell flow-section"><div className="section-intro reveal"><div className="eyebrow">A simple beginning</div><h2>Meet with more context, less noise.</h2><p>Familiar matchmaking patterns, shaped around the practical realities of NCR government life.</p></div><div className="flow-grid"><div className="flow-step reveal"><span>1</span><h3>Make a private profile</h3><p>Tell us your service, NCR base, and what a shared future looks like.</p></div><div className="flow-step reveal" data-reveal-delay="1"><span>2</span><h3>See aligned profiles</h3><p>Browse relevant recommendations with clear compatibility signals.</p></div><div className="flow-step reveal" data-reveal-delay="2"><span>3</span><h3>Connect at your pace</h3><p>Shortlist, send an interest, and share details only when it feels right.</p></div></div><div className="pattern-callout reveal"><div><Icon name="spark" size={20} /><strong>Inspired by what works. Focused on what’s missing.</strong><p>Search, shortlists, privacy settings, and safe chat are familiar. Career stability is the signal that makes them more useful here.</p></div><button className="button button--dark" onClick={onDemo}>See the member home <Icon name="arrow" size={15} /></button></div></div></section>
    <GotaDivider />
    <VerificationPipeline />
    <section id="safety" className="section shell safety-section"><div className="safety-visual reveal"><div className="privacy-card"><div className="privacy-top"><span className="privacy-icon"><Icon name="lock" size={18} /></span><span><strong>Your privacy, your pace</strong><small>Control who sees what</small></span><span className="privacy-toggle"><i /></span></div><div className="privacy-row"><span>Detailed profile</span><strong>Matches only</strong><Icon name="chevron" size={15} /></div><div className="privacy-row"><span>Photo</span><strong>On request</strong><Icon name="chevron" size={15} /></div><div className="privacy-row"><span>Contact details</span><strong>Hidden</strong><Icon name="chevron" size={15} /></div></div></div><div className="safety-copy reveal" data-reveal-delay="1"><div className="eyebrow">A considered way to connect</div><h2>Trust is not a badge. It’s a system.</h2><p>We borrow the best safety habits from leading matrimony platforms and make them default: mobile verification, document review, photo controls, private contact details, and clear reporting.</p><div className="safety-list"><div><span><Icon name="check" size={14} /></span><p><strong>Verified before visible</strong><br /><small>Every profile starts with mobile verification and moves through a human review queue.</small></p></div><div><span><Icon name="check" size={14} /></span><p><strong>Private until mutual</strong><br /><small>Your phone and documents are never part of a public profile.</small></p></div><div><span><Icon name="check" size={14} /></span><p><strong>One free community</strong><br /><small>No premium tier to see contact details or be treated seriously.</small></p></div></div><button className="button button--text" onClick={onOnboard}>Create a profile with care <Icon name="arrow" size={15} /></button></div></section>
    <WomenPrivacySection />
    <PrivacyPlayground />
    <ComparisonTable />
    <GotaDivider />
    <StoriesSection />
    <MarriageTimeline />
    <CommunityStats />
    <GotaDivider />
    <section className="cta-band"><div className="shell cta-inner"><div><div className="eyebrow eyebrow--light">For a life that fits</div><h2>Your next chapter can share the same map.</h2></div><button className="button button--light button--large" onClick={onOnboard}>Join NCRSarkariShaadi free <Icon name="arrow" size={17} /></button></div></section>
    <footer className="landing-footer shell"><Logo /><div className="footer-note">Independent platform for NCR government professionals · Not affiliated with any government department</div><div className="footer-links"><a href="/verification">Verification</a><a href="/privacy">Privacy</a><a href="/safety">Safety</a><a href="/insights">Insights</a><a href="/faq">FAQ</a></div></footer>
  </main>;
}

function Sidebar({ view, setView, onAdmin, displayName, initials, showAdmin, strength, unread, adminCount }: { view: View; setView: (v: View) => void; onAdmin: () => void; displayName: string; initials: string; showAdmin: boolean; strength: number; unread: number; adminCount: number }) {
  return <aside className="sidebar"><Logo /><div className="sidebar-label">Member home</div><div className="sidebar-nav">{navItems.map((item) => <button key={item.id} className={`side-link ${view === item.id ? 'side-link--active' : ''}`} onClick={() => setView(item.id)}><Icon name={item.icon} size={18} /><span>{item.label}</span>{item.id === 'inbox' && unread > 0 && <span className="side-count">{unread}</span>}</button>)}</div><div className="sidebar-bottom">{showAdmin && <button className="side-link side-link--admin" onClick={onAdmin}><Icon name="shield" size={18} /><span>Admin review</span>{adminCount > 0 && <span className="admin-count">{adminCount}</span>}</button>}<div className="sidebar-user"><Avatar initials={initials} tone="navy" /><span><strong>{displayName}</strong><small>Profile {strength}% complete</small></span><Icon name="chevron" size={15} /></div></div></aside>;
}

function Topbar({ view, onLogout, firstName, initials }: { view: View; onLogout: () => void; firstName: string; initials: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const title = view === 'home' ? `${greeting}, ${firstName}` : view === 'discover' ? 'Discover your aligned circle' : view === 'profile' ? 'My profile' : view === 'inbox' ? 'Your conversations' : view === 'settings' ? 'Privacy & safety' : 'Admin review';
  const sub = view === 'home' ? 'A few thoughtful matches are waiting for you.' : view === 'discover' ? 'Search by the life you want to build in NCR.' : view === 'profile' ? 'The more context you share, the more useful your matches become.' : view === 'inbox' ? 'A quiet space to take the next step.' : view === 'settings' ? 'You are in control of every detail.' : 'Keep the community trusted and useful.';
  return <header className="app-topbar"><div><div className="app-title">{title}</div><p>{sub}</p></div><div className="topbar-actions"><button className="icon-button notification-button" aria-label="Notifications"><Icon name="bell" size={19} /><i /></button><button className="topbar-avatar" onClick={onLogout}><Avatar initials={initials} tone="navy" /><Icon name="chevron" size={14} /></button></div></header>;
}

function MatchCard({ match, onOpen }: { match: typeof matches[number]; onOpen: () => void }) {
  return <article className="match-card" style={{ '--fit': match.fit } as React.CSSProperties}><div className="match-card-head"><Avatar initials={match.initials} tone={match.tone} large /><div className="match-score"><strong>{match.fit}%</strong><small>aligned</small></div></div><div className="match-card-body"><div className="match-name-row"><h3>{match.name}</h3><VerifiedBadge /></div><p className="match-role">{match.role}</p><p className="match-city"><span className="city-pin"><Icon name="pin" size={13} /></span>{match.city} · NCR</p><div className="match-note"><Icon name="spark" size={14} />{match.note}</div><div className="match-actions"><button className="button button--outline button--small" onClick={onOpen}>View profile</button><button className="round-action" aria-label={`Like ${match.name}`}><Icon name="heart" size={17} /></button><button className="round-action" aria-label={`More options for ${match.name}`}><Icon name="chevron" size={17} /></button></div></div></article>;
}

function HomeView({ setView, onOpenProfile, members, onOpenMember, onSend, statusFor, strength = 72 }: { setView: (v: View) => void; onOpenProfile: () => void; members?: Member[]; onOpenMember?: (m: Member) => void; onSend?: (id: string) => void; statusFor?: (id: string) => string | undefined; strength?: number }) {
  const real = members && members.length > 0;
  const [nudgeHidden, setNudgeHidden] = useState(false);
  return <div className="view-body view-body--home">{real && strength < 90 && !nudgeHidden && <div className="complete-nudge"><Icon name="spark" size={16} /><span><strong>Your profile is {strength}% complete.</strong> Members with fuller profiles get far better responses — add your details section by section.</span><button className="button button--primary button--small" onClick={() => setView('profile')}>Complete profile <Icon name="arrow" size={13} /></button><button className="icon-button" aria-label="Dismiss" onClick={() => setNudgeHidden(true)}><Icon name="x" size={14} /></button></div>}<div className="welcome-banner"><div><span className="banner-kicker"><Icon name="spark" size={14} /> Your NCR circle</span><h2>{real ? 'Government professionals near you.' : 'People who understand the NCR life.'}</h2><p>{real ? 'Verified members building a life in the Delhi NCR.' : 'Based on your preference for a stable NCR posting and a thoughtful pace.'}</p><button className="button button--dark button--small" onClick={() => setView('discover')}>{real ? 'Browse everyone' : 'See all recommendations'} <Icon name="arrow" size={14} /></button></div><div className="banner-orbit"><div className="orbit orbit--one"><Avatar initials="AS" tone="rose" /></div><div className="orbit orbit--two"><Avatar initials="NM" tone="sand" /></div><div className="orbit orbit--three"><Avatar initials="RK" tone="sage" /></div><div className="orbit-core"><Icon name="heart" size={25} /></div></div></div><div className="section-heading-row"><div><h2>Good-fit profiles</h2><p>Career and life signals that line up with yours.</p></div><button className="button button--text button--small" onClick={() => setView('discover')}>View all <Icon name="arrow" size={14} /></button></div><div className="match-grid match-grid--six">{real ? members!.slice(0, 6).map((m, i) => <RealMemberCard key={m.id} member={m} idx={i} status={statusFor?.(m.id)} onOpen={onOpenMember!} onSend={onSend!} />) : matches.slice(0, 6).map((m) => <MatchCard key={m.id} match={m} onOpen={onOpenProfile} />)}</div><div className="home-lower-grid"><div className="completion-card"><div className="completion-head"><span><Icon name="user" size={17} /> Your profile</span><strong>{strength}%</strong></div><div className="progress-track"><span style={{ width: `${strength}%` }} /></div><p>{strength < 100 ? 'Add a photo, your story, and your verification to strengthen your matches.' : 'Your profile is complete — you’re putting your best foot forward.'}</p><button className="button button--text button--small" onClick={() => setView('profile')}>Complete profile <Icon name="arrow" size={14} /></button></div><div className="safety-mini"><span className="safety-mini-icon"><Icon name="shield" size={18} /></span><div><strong>Safety check-in</strong><p>Your contact details are hidden from everyone until you accept an interest.</p><button className="button button--text button--small" onClick={() => setView('settings')}>Review privacy <Icon name="arrow" size={14} /></button></div></div></div></div>;
}

function DiscoverView({ onOpenProfile, hiddenFromSearch, searchWhileHidden }: { onOpenProfile: () => void; hiddenFromSearch: boolean; searchWhileHidden: boolean }) {
  const [active, setActive] = useState('All aligned');
  const filters = ['All aligned', 'Stay in NCR', 'CSS / CSSS', 'DANICS / DDA', 'New this week'];
  const filtered = useMemo(() => {
    const searchableMatches = hiddenFromSearch && searchWhileHidden ? matches.filter((match) => match.gender === 'male') : matches;
    return active === 'CSS / CSSS' ? searchableMatches.filter((m) => m.role.includes('CSS')) : active === 'DANICS / DDA' ? searchableMatches.filter((m) => m.role.includes('DANICS') || m.role.includes('DDA')) : active === 'New this week' ? searchableMatches.slice(1) : searchableMatches;
  }, [active, hiddenFromSearch, searchWhileHidden]);
  return <div className="view-body"><div className="discover-toolbar"><div className="filter-scroll">{filters.map((f) => <button key={f} className={`filter-pill ${active === f ? 'filter-pill--active' : ''}`} onClick={() => setActive(f)}>{f}</button>)}</div><button className="button button--outline button--small"><Icon name="search" size={14} /> Advanced filters</button></div><div className="discover-intro"><div><h2>{filtered.length} profiles, thoughtfully narrowed</h2><p>{hiddenFromSearch && searchWhileHidden ? 'Your profile is hidden from discovery. You can still privately search male profiles.' : 'Career compatibility is weighted first. The rest is yours to explore.'}</p></div><button className="sort-button">Best aligned <Icon name="chevron" size={15} /></button></div><div className="match-grid match-grid--four">{filtered.map((m) => <MatchCard key={m.id} match={m} onOpen={onOpenProfile} />)}</div><div className="discover-footer"><Icon name="spark" size={16} /> {hiddenFromSearch && searchWhileHidden ? 'Private search is on. Your profile is not shown to other members.' : 'New profiles are added after our review queue. Check back tomorrow for a fresh circle.'}</div></div>;
}

const demoStory = 'I like early morning walks, old Hindi films, and a home where both people can pursue meaningful work. Looking for someone who sees a shared NCR life as an opportunity, not a compromise.';

// ---- Expanded profile editor (Phase A: new fields held in a localStorage draft) ----
type ProfileValues = Record<string, string | string[]>;
const DRAFT_KEY = 'ncr-profile-draft';

function ProfileField({ field, value, onChange, locked }: { field: FieldDef; value: string | string[] | undefined; onChange: (v: string | string[]) => void; locked: boolean }) {
  const v = value ?? (field.type === 'multiselect' ? [] : '');
  const lockNote = field.lock && locked;
  return <label className={`pf-field ${field.type === 'textarea' ? 'pf-field--wide' : ''}`}>
    <span className="pf-label">{field.label}{field.optional && <small> · optional</small>}{field.lock && <small className="pf-lock-tag"><Icon name="lock" size={10} /> set once</small>}</span>
    {lockNote ? <div className="pf-locked">{Array.isArray(v) ? v.join(', ') : v || '—'} <em>Locked — contact support to change</em></div>
      : field.type === 'textarea' ? <textarea className="pf-input" value={v as string} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
      : field.type === 'select' ? <select className="pf-input" value={v as string} onChange={(e) => onChange(e.target.value)}><option value="">Select…</option>{field.options!.map((o) => <option key={o} value={o}>{o}</option>)}</select>
      : field.type === 'radio' ? <div className="pf-radio">{field.options!.map((o) => <button type="button" key={o} className={`pf-chip ${v === o ? 'pf-chip--on' : ''}`} onClick={() => onChange(o)}>{o}</button>)}</div>
      : field.type === 'multiselect' ? <div className="pf-radio">{field.options!.map((o) => { const arr = (v as string[]); const on = arr.includes(o); return <button type="button" key={o} className={`pf-chip ${on ? 'pf-chip--on' : ''}`} onClick={() => onChange(on ? arr.filter((x) => x !== o) : [...arr, o])}>{o}</button>; })}</div>
      : field.type === 'date' ? <input type="date" className="pf-input" value={v as string} onChange={(e) => onChange(e.target.value)} />
      : <input type={field.type === 'number' ? 'number' : 'text'} className="pf-input" value={v as string} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />}
    {field.hint && !lockNote && <small className="pf-hint">{field.hint}</small>}
  </label>;
}

function ProfileEditor({ profile, user, onProfileSaved }: { profile: ProfileData | null; user: AuthUser | null; onProfileSaved: (profile: ProfileData) => void }) {
  const [values, setValues] = useState<ProfileValues>({});
  const [open, setOpen] = useState<string>('basics');
  const [saved, setSaved] = useState('');
  const [prefs, setPrefs] = useState<Record<string, unknown>>({});
  // hydrate from server-backed profile + partner_preferences + localStorage draft
  useEffect(() => {
    let draft: ProfileValues = {};
    try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}'); } catch { draft = {}; }
    const server: ProfileValues = {};
    if (profile) for (const k of backedKeys) { const val = (profile as unknown as Record<string, unknown>)[k]; if (val != null) server[k] = String(val); }
    setValues({ ...draft, ...server });
  }, [profile]);
  // fetch partner_preferences once
  useEffect(() => {
    if (!user) return;
    fetch('/api/preferences').then(async (r) => {
      if (!r.ok) return;
      const d = await r.json().catch(() => null) as { preferences?: Record<string, unknown> } | null;
      if (d?.preferences) setPrefs(d.preferences);
    }).catch(() => undefined);
  }, [user]);
  // One-time draft migration: flush non-server-backed draft values to their
  // real endpoints. Runs after profile hydration. Clears the draft on success.
  const migratedRef = useRef(false);
  useEffect(() => {
    if (!user || !profile || migratedRef.current) return;
    let draft: ProfileValues = {};
    try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}'); } catch { draft = {}; }
    if (Object.keys(draft).length === 0) { migratedRef.current = true; return; }
    const profileKeys = Object.keys(draft).filter((k) => backedKeys.includes(k));
    const prefDraftKeys = Object.keys(draft).filter((k) => prefKeys.includes(k));
    const tasks: Promise<unknown>[] = [];
    // profile keys already auto-save on next edit, but flush now so the
    // draft can be cleared.
    for (const k of profileKeys) {
      const v = draft[k];
      if (typeof v === 'string' && v.trim()) tasks.push(fetch('/api/profile', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ [k]: v }) }).catch(() => null));
    }
    if (prefDraftKeys.length) {
      const body: Record<string, unknown> = {};
      for (const k of prefDraftKeys) {
        const v = draft[k];
        if (Array.isArray(v) ? v.length > 0 : !!(v && String(v).trim())) body[k] = v;
      }
      if (Object.keys(body).length) tasks.push(fetch('/api/preferences', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null));
    }
    if (tasks.length === 0) { migratedRef.current = true; try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } return; }
    Promise.all(tasks).then(async () => {
      migratedRef.current = true;
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      // re-pull profile + prefs to refresh in-memory state
      const pr = await fetch('/api/profile').catch(() => null);
      if (pr?.ok) { const d = await pr.json().catch(() => null) as { profile?: ProfileData } | null; if (d?.profile) onProfileSaved(d.profile); }
      const pf = await fetch('/api/preferences').catch(() => null);
      if (pf?.ok) { const d = await pf.json().catch(() => null) as { preferences?: Record<string, unknown> } | null; if (d?.preferences) setPrefs(d.preferences); }
    });
  }, [user, profile, onProfileSaved]);
  // Debounce server autosave for backed fields (700ms).
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);
  const setField = (key: string, val: string | string[]) => {
    setValues((cur) => {
      const next = { ...cur, [key]: val };
      // Skip draft writes after migration — server is the source of truth now.
      if (!migratedRef.current) try { localStorage.setItem(DRAFT_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      if (user && typeof val === 'string') {
        const endpoint = backedKeys.includes(key) ? '/api/profile' : prefKeys.includes(key) ? '/api/preferences' : null;
        if (endpoint) {
          if (saveTimer.current) clearTimeout(saveTimer.current);
          saveTimer.current = setTimeout(() => {
            const body = backedKeys.includes(key) ? { [key]: val } : { [key]: val };
            fetch(endpoint, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
              .then(async (r) => {
                if (r.ok) {
                  if (endpoint === '/api/profile') { const d = await r.json().catch(() => null) as { profile?: ProfileData } | null; if (d?.profile) onProfileSaved(d.profile); }
                  else { const d = await r.json().catch(() => null) as { preferences?: Record<string, unknown> } | null; if (d?.preferences) setPrefs(d.preferences); }
                  setSaved('Saved'); window.setTimeout(() => setSaved(''), 1500);
                } else { setSaved('Could not save'); window.setTimeout(() => setSaved(''), 2500); }
              }).catch(() => { setSaved('Offline'); window.setTimeout(() => setSaved(''), 2500); });
          }, 700);
        }
      }
      return next;
    });
  };
  const pct = profileCompletion(values);
  const tier = completionTier(pct);
  const lockedSet = (key: string) => {
    // profile-backed fields: locked when the profile row already has a value.
    if ((profile as unknown as Record<string, unknown> | null)?.[key]) return true;
    // pref_looking_for lives in partner_preferences — also locked once set.
    if (key === 'pref_looking_for' && (prefs as Record<string, unknown>).pref_looking_for) return true;
    return false;
  };
  const sectionDone = (fields: FieldDef[]) => fields.filter((f) => !f.optional).every((f) => { const x = values[f.key]; return Array.isArray(x) ? x.length > 0 : !!(x && String(x).trim()); });
  // Merge server-side partner_preferences into the values the editor renders.
  // JSON-array pref fields (marital_status/education/diet) are decoded here.
  const merged: ProfileValues = { ...values };
  for (const k of prefKeys) {
    const raw = prefs[k];
    if (raw == null) continue;
    try { if (Array.isArray(raw)) { merged[k] = raw as string[]; continue; } } catch { /* ignore */ }
    const s = String(raw);
    if (s.startsWith('[')) {
      try { const parsed = JSON.parse(s); if (Array.isArray(parsed)) { merged[k] = parsed as string[]; continue; } } catch { /* ignore */ }
    }
    merged[k] = s;
  }
  return <div className="profile-editor">
    <div className="pe-meter"><div className="pe-meter-top"><div><strong>Profile strength</strong><span className={`pe-tier ${tier.cls}`}>{tier.label}</span></div><strong className="pe-pct">{pct}%</strong></div><div className="progress-track"><span style={{ width: `${pct}%` }} /></div><p className="pe-hint">A fuller profile gets far better responses. All fields save securely to your profile.{saved && <em> · {saved}</em>}</p></div>
    {profileSections.map((s) => { const isOpen = open === s.id; const done = sectionDone(s.fields); return <div className={`pe-section ${isOpen ? 'pe-section--open' : ''}`} key={s.id}>
      <button type="button" className="pe-head" onClick={() => setOpen(isOpen ? '' : s.id)}><span className="pe-head-icon"><Icon name={s.icon as IconName} size={17} /></span><span className="pe-head-text"><strong>{s.title}</strong><small>{s.desc}</small></span><span className={`pe-head-state ${done ? 'pe-head-state--done' : ''}`}>{done ? <><Icon name="check" size={13} /> Done</> : 'Add'}</span><Icon name="chevron" size={16} /></button>
      {isOpen && <div className="pe-body">{s.fields.map((f) => <ProfileField key={f.key} field={f} value={merged[f.key]} locked={!!f.lock && lockedSet(f.key)} onChange={(val) => setField(f.key, val)} />)}</div>}
    </div>; })}
  </div>;
}

type VerifyState = { status: string; note: string | null } | null;

// ProfileView-only: owner can drag/zoom their photo. The 3 numeric columns
// (photo_x/y/zoom) persist via PUT /api/profile, debounced ~600ms.

function ProfilePhotoCard({ user, profile, hasPhoto, photoBust, photoMsg, uploadPhoto, removePhoto, onProfileSaved }: { user: AuthUser; profile: ProfileData | null; hasPhoto: boolean; photoBust: number; photoMsg: string; uploadPhoto: (f?: File | null) => Promise<void>; removePhoto: () => Promise<void>; onProfileSaved: (p: ProfileData) => void }) {
  const [x, setX] = useState<number>(profile?.photo_x != null ? Number(profile.photo_x) : 0.5);
  const [y, setY] = useState<number>(profile?.photo_y != null ? Number(profile.photo_y) : 0.3);
  const [zoom, setZoom] = useState<number>(profile?.photo_zoom != null ? Number(profile.photo_zoom) : 1);
  useEffect(() => { if (profile) { setX(Number(profile.photo_x ?? 0.5)); setY(Number(profile.photo_y ?? 0.3)); setZoom(Number(profile.photo_zoom ?? 1)); } }, [profile]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCrop = (next: { x: number; y: number; zoom: number }) => {
    setX(next.x); setY(next.y); setZoom(next.zoom);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch('/api/profile', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ photo_x: next.x, photo_y: next.y, photo_zoom: next.zoom }) })
        .then(async (r) => { if (r.ok) { const d = await r.json().catch(() => null) as { profile?: ProfileData } | null; if (d?.profile) onProfileSaved(d.profile); } }).catch(() => undefined);
    }, 600);
  };
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);
  const src = hasPhoto ? `/api/photo?b=${photoBust}` : '';
  return (
    <div className="profile-card">
      <div className="card-heading"><div><span className="eyebrow">Your photo</span><h3>Seen only on your terms</h3></div></div>
      {hasPhoto ? (
        <>
          <PhotoCropper src={src} x={x} y={y} zoom={zoom} onChange={onCrop} />
          <p className="photo-msg">Drag to recentre · slide to zoom. Saved automatically.</p>
        </>
      ) : (
        <div className="profile-photo-empty"><Icon name="user" size={22} /><small>No photo yet</small></div>
      )}
      <div className="photo-actions">
        <label className="button button--outline button--small photo-upload-label">{hasPhoto ? 'Replace' : 'Upload photo'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => uploadPhoto(e.target.files?.[0])} /></label>
        {hasPhoto && <button className="button button--ghost button--small" onClick={removePhoto}>Remove</button>}
      </div>
      {photoMsg && <p className="photo-msg">{photoMsg}</p>}
    </div>
  );
}

function ProfileView({ visibility, user, profile, onProfileSaved }: { visibility: VisibilitySettings; user: AuthUser | null; profile: ProfileData | null; onProfileSaved: (profile: ProfileData) => void }) {
  const [editing, setEditing] = useState(false);
  const [story, setStory] = useState(profile?.about ?? '');
  const [photoBust, setPhotoBust] = useState(0);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoMsg, setPhotoMsg] = useState('');
  const [verify, setVerify] = useState<VerifyState>(null);
  const [verifyMsg, setVerifyMsg] = useState('');
  const [verifyBusy, setVerifyBusy] = useState(false);
  const govtRef = useRef<HTMLInputElement>(null);
  const photoIdRef = useRef<HTMLInputElement>(null);
  const [createdFor, setCreatedFor] = useState(profile?.created_for ?? 'Myself');
  const [familyNotes, setFamilyNotes] = useState(profile?.family_notes ?? '');
  const [famMsg, setFamMsg] = useState('');
  useEffect(() => { setStory(profile?.about ?? ''); }, [profile?.about]);
  useEffect(() => { setCreatedFor(profile?.created_for ?? 'Myself'); setFamilyNotes(profile?.family_notes ?? ''); }, [profile?.created_for, profile?.family_notes]);
  const saveFamily = async () => {
    setFamMsg('Saving…');
    const r = await fetch('/api/profile', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ created_for: createdFor, family_notes: familyNotes }) }).catch(() => null);
    if (r?.ok) { const d = await r.json().catch(() => null) as { profile?: ProfileData } | null; if (d?.profile) onProfileSaved(d.profile); setFamMsg('Saved.'); }
    else setFamMsg('Could not save — please try again.');
  };
  useEffect(() => {
    if (!user) return;
    fetch('/api/photo').then((r) => setHasPhoto(r.ok)).catch(() => undefined);
    fetch('/api/verify?mine=1').then((r) => r.json()).then((d) => setVerify(d.verification ?? null)).catch(() => undefined);
  }, [user]);
  const uploadPhoto = async (file: File | undefined) => {
    if (!file) return;
    setPhotoMsg('Uploading…');
    const fd = new FormData(); fd.append('file', file);
    const r = await fetch('/api/photo', { method: 'POST', body: fd }).catch(() => null);
    if (r?.ok) { setPhotoBust((b) => b + 1); setHasPhoto(true); setPhotoMsg('Photo saved. Who sees it follows your privacy setting.'); }
    else { const d = await r?.json().catch(() => null) as { error?: string } | null; setPhotoMsg(d?.error ?? 'Upload failed — please try a JPEG/PNG under 5 MB.'); }
  };
  const removePhoto = async () => { await fetch('/api/photo', { method: 'DELETE' }).catch(() => null); setHasPhoto(false); setPhotoMsg('Photo removed.'); };
  const submitVerification = async () => {
    const g = govtRef.current?.files?.[0]; const p = photoIdRef.current?.files?.[0];
    if (!g && !p) { setVerifyMsg('Attach at least one document.'); return; }
    setVerifyBusy(true); setVerifyMsg('Uploading for review…');
    const fd = new FormData(); if (g) fd.append('govt_id', g); if (p) fd.append('photo_id', p);
    const r = await fetch('/api/verify', { method: 'POST', body: fd }).catch(() => null);
    setVerifyBusy(false);
    if (r?.ok) { setVerify({ status: 'pending', note: null }); setVerifyMsg('Submitted. Our team reviews documents privately, then deletes them.'); }
    else { const d = await r?.json().catch(() => null) as { error?: string } | null; setVerifyMsg(d?.error ?? 'Upload failed — JPEG/PNG/PDF under 5 MB.'); }
  };
  const displayName = user?.fullName ?? 'Priya Sharma';
  const isVerified = verify?.status === 'approved' || !!profile?.verified_at;
  const strength = user ? profileStrength(profile, hasPhoto, isVerified) : 72;
  const todos: { done: boolean; label: string }[] = [
    { done: !!profile?.service, label: 'Service & cadre added' },
    { done: !!profile?.about, label: 'Your story written' },
    { done: hasPhoto, label: 'Profile photo added' },
    { done: isVerified, label: 'Verified badge earned' },
  ];
  const roleLine = profile?.service ?? 'Senior Assistant · Central Secretariat Service';
  const cityLine = `${profile?.residence_city ?? 'New Delhi'} · ${profile?.posting_outlook === 'Open to movement' ? 'Open to movement' : 'Open to NCR'}`;
  const memberId = user ? `NCR-${user.id.slice(0, 5).toUpperCase()}` : 'NCR-04821';
  const shownStory = story || (user ? 'Add a few lines about your life outside work — it helps your matches understand you.' : demoStory);
  const toggleEditing = async () => {
    if (editing && user) {
      const response = await fetch('/api/profile', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ about: story }) }).catch(() => null);
      if (response?.ok) { const data = await response.json().catch(() => null) as { profile?: ProfileData } | null; if (data?.profile) onProfileSaved(data.profile); }
    }
    setEditing(!editing);
  };
  return <div className="view-body profile-view"><div className="profile-cover"><div className="profile-cover-pattern" /><div className="profile-cover-content"><Avatar initials={user ? initialsOf(user.fullName) : 'PS'} tone="navy" large /><div><span className="profile-id">{memberId} · <VerifiedBadge label={profile?.verified_at ? 'Identity verified' : user ? 'Verification pending' : 'Mobile verified'} /></span><h2>{displayName}</h2><p>{roleLine}</p><p className="match-city"><span className="city-pin"><Icon name="pin" size={13} /></span> {cityLine}</p></div><button className="button button--light button--small" onClick={toggleEditing}>{editing ? 'Done editing' : 'Edit profile'} <Icon name="arrow" size={14} /></button></div></div><div className="profile-grid"><div className="profile-main">{user ? <ProfileEditor profile={profile} user={user} onProfileSaved={onProfileSaved} /> : <><div className="profile-card"><div className="card-heading"><div><span className="eyebrow">Your story</span><h3>A little more than a designation</h3></div><span className="edit-label">{editing ? 'Editing' : 'Visible to matches'}</span></div>{editing ? <textarea className="profile-textarea" value={story} onChange={(event) => setStory(event.target.value)} placeholder="Tell your match about your life beyond the designation…" /> : <p className="profile-story">{shownStory}</p>}<div className="story-tags"><span>Family-minded</span><span>Curious</span><span>Weekend explorer</span></div></div><div className="profile-card"><div className="card-heading"><div><span className="eyebrow">Career compatibility</span><h3>What you want your match to know</h3></div><span className="signal-badge"><Icon name="spark" size={13} /> Strong signal</span></div><div className="career-rows"><div><span>Preferred geography</span><strong>{profile?.preferred_hubs ?? 'Delhi NCR'}</strong></div><div><span>Posting outlook</span><strong>{profile?.posting_outlook ?? 'Prefer stability in NCR'}</strong></div><div><span>Service</span><strong>{profile?.service ?? 'CSS · Group B'}</strong></div>{visibility.ministry && <div><span>Ministry</span><strong>{profile?.ministry ?? 'Ministry of Personnel, Public Grievances & Pensions'}</strong></div>}{visibility.organisation && <div><span>Department / organisation</span><strong>{profile?.organisation ?? 'Department of Personnel & Training (DoPT)'}</strong></div>}<div><span>Work rhythm</span><strong>Mostly weekdays</strong></div></div></div></>}</div><aside className="profile-side">{!user && <div className="profile-card completion-card--side"><div className="completion-head"><span>Profile strength</span><strong>{strength}%</strong></div><div className="progress-track"><span style={{ width: `${strength}%` }} /></div><ul className="profile-todos">{todos.map((t) => <li key={t.label} className={t.done ? 'done' : ''}><Icon name={t.done ? 'check' : 'clock'} size={14} /> {t.label}</li>)}</ul></div>}{user && <ProfilePhotoCard user={user} profile={profile} hasPhoto={hasPhoto} photoBust={photoBust} photoMsg={photoMsg} uploadPhoto={uploadPhoto} removePhoto={removePhoto} onProfileSaved={onProfileSaved} />}{user && <div className="profile-card verify-card"><div className="card-heading"><div><span className="eyebrow">Verification</span><h3>Earn your badge</h3></div>{verify?.status === 'approved' ? <span className="signal-badge"><Icon name="check" size={13} /> Verified</span> : verify?.status === 'pending' ? <span className="interest-badge interest-badge--pending">Pending</span> : verify?.status === 'rejected' ? <span className="interest-badge">Rejected</span> : null}</div>{verify?.status === 'approved' ? <p className="photo-msg">Your profile carries the verified badge. Documents were deleted after review.</p> : verify?.status === 'pending' ? <p className="photo-msg">Under review. Our team checks documents privately, then deletes them.</p> : <><p className="photo-msg">{verify?.status === 'rejected' ? (verify.note ? `Not approved: ${verify.note}. You can resubmit.` : 'Not approved — you can resubmit clearer documents.') : 'Upload your government service ID and a photo ID. Reviewed privately by a person, never shown to members, deleted after review.'}</p><label className="verify-file"><span>Government service ID</span><input ref={govtRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" /></label><label className="verify-file"><span>Photo ID (Aadhaar / PAN / DL)</span><input ref={photoIdRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" /></label><button className="button button--primary button--small" disabled={verifyBusy} onClick={submitVerification}>{verifyBusy ? 'Uploading…' : 'Submit for review'}</button></>}{verifyMsg && verify?.status !== 'approved' && verify?.status !== 'pending' && <p className="photo-msg">{verifyMsg}</p>}{verifyMsg && (verify?.status === 'pending') && <p className="photo-msg">{verifyMsg}</p>}</div>}{!user && <div className="profile-card"><div className="card-heading"><div><span className="eyebrow">Family &amp; management</span><h3>Who’s managing this profile</h3></div><Icon name="users" size={18} /></div><label className="field"><span>Profile created for</span><select value={createdFor} onChange={(e) => setCreatedFor(e.target.value)}><option>Myself</option><option>My daughter</option><option>My son</option><option>My sibling</option><option>A relative or friend</option></select></label><label className="field"><span>Private family notes <small>(only you can see this)</small></span><textarea className="profile-textarea" style={{ minHeight: 84, marginTop: 0 }} value={familyNotes} onChange={(e) => setFamilyNotes(e.target.value)} placeholder="For your own reference — shortlists, preferences, things to discuss with the family…" /></label><button className="button button--outline button--small" onClick={saveFamily}>Save</button>{famMsg && <p className="photo-msg">{famMsg}</p>}</div>}<div className="profile-card trust-card"><Icon name="shield" size={20} /><h3>Trust centre</h3><p>Verification details stay private. Only the badge is visible on your profile.</p><a className="button button--text button--small" href="/verification">How verification works <Icon name="arrow" size={14} /></a></div></aside></div></div>;
}

function InboxView() {
  const [selected, setSelected] = useState(0);
  const conversations = [{ initials: 'AS', tone: 'rose', name: 'Aditi S.', role: 'Section Officer · CSS', text: 'I also think a shared NCR base…', time: '10:42 AM', unread: true }, { initials: 'NM', tone: 'sand', name: 'Nisha M.', role: 'Steno Grade B · CSSS', text: 'Your note about old films made me smile.', time: 'Yesterday', unread: false }, { initials: 'RK', tone: 'sage', name: 'Rohan K.', role: 'Assistant · DANICS', text: 'Sent you an interest', time: 'Tue', unread: false }];
  return <div className="view-body inbox-view"><div className="inbox-list"><div className="inbox-list-head"><span>Messages <strong>2</strong></span><button className="icon-button"><Icon name="search" size={17} /></button></div>{conversations.map((c, i) => <button key={c.name} className={`conversation ${selected === i ? 'conversation--selected' : ''}`} onClick={() => setSelected(i)}><Avatar initials={c.initials} tone={c.tone} /><span><strong>{c.name}</strong><small>{c.role}</small><em>{c.text}</em></span><time>{c.time}</time>{c.unread && <i className="conversation-unread" />}</button>)}</div><div className="chat-panel"><div className="chat-head"><Avatar initials={conversations[selected].initials} tone={conversations[selected].tone} /><div><strong>{conversations[selected].name}</strong><small><span className="online-dot" /> Safe chat · Contact details hidden</small></div><button className="icon-button"><Icon name="shield" size={18} /></button></div><div className="chat-context"><Icon name="spark" size={15} /><span><strong>94% career alignment</strong> · Both prefer a stable NCR posting</span></div><div className="chat-messages"><div className="day-divider"><span>Today</span></div><div className="message message--them">Hi Priya, I liked what you wrote about a shared NCR life. <time>10:38 AM</time></div><div className="message message--me">Thank you, Aditi. It’s a big part of how I think about a partnership. <time>10:41 AM</time></div><div className="message message--them">I also think a shared NCR base can give both people room to do meaningful work. <time>10:42 AM</time></div></div><div className="chat-compose"><input placeholder="Write a thoughtful message…" aria-label="Write a message" /><button aria-label="Send message"><Icon name="arrow" size={17} /></button></div><p className="chat-note"><Icon name="lock" size={12} /> Your conversation is private and contact details stay hidden.</p></div></div>;
}

function SettingsView({ settings, onToggle, profile, prefLookingFor }: { settings: VisibilitySettings; onToggle: (key: keyof VisibilitySettings) => void; profile: ProfileData | null; prefLookingFor: string | null }) {
  const rows: { key: keyof VisibilitySettings; title: string; desc: string }[] = [
    { key: 'ministry', title: 'Ministry', desc: 'Show your selected ministry on your profile' },
    { key: 'organisation', title: 'Department / organisation', desc: 'Show your selected department or organisation' },
    { key: 'profile', title: 'Detailed profile', desc: 'Visible to registered members who pass your filters' },
    { key: 'photo', title: 'Profile photo', desc: 'Visible only to people you accept or contact' },
    { key: 'contact', title: 'Contact details', desc: 'Hidden until you choose to share them' },
    { key: 'viewed', title: 'Profile views', desc: 'Let people know when you view their profile' },
  ];
  const femaleRows: { key: 'hiddenFromSearch' | 'searchWhileHidden'; title: string; desc: string }[] = [
    { key: 'hiddenFromSearch', title: 'Hide my profile from discovery', desc: 'Stay private while keeping your account active' },
    { key: 'searchWhileHidden', title: 'Search male profiles while hidden', desc: 'Continue browsing male profiles without appearing in search' },
  ];
  const genderLabel = profile?.gender === 'male' ? 'Male' : profile?.gender === 'female' ? 'Female' : 'Not declared yet';
  return <div className="view-body settings-view"><div className="settings-intro"><div className="privacy-large-icon"><Icon name="lock" size={28} /></div><div><h2>Privacy that follows your pace</h2><p>Choose separately whether your Ministry and Department/Organisation appear on your profile. Your service remains visible as a required trust signal.</p></div><span className="settings-saved"><Icon name="check" size={14} /> Saved</span></div><div className="settings-grid"><div className="settings-card identity-card"><div className="card-heading"><div><span className="eyebrow">Verified identity</span><h3>Your account-level details</h3></div><Icon name="lock" size={18} /></div><div className="identity-rows"><div className="identity-row"><span className="identity-label">Gender</span><span className="identity-value"><strong>{genderLabel}</strong><small>Verified from your government ID at signup</small></span><span className="identity-lock"><Icon name="lock" size={11} /> set once</span></div><div className="identity-row"><span className="identity-label">Looking for</span><span className="identity-value"><strong>{prefLookingFor ?? 'Any / All Genders'}</strong><small>Set once in your profile under Partner preferences</small></span><span className="identity-lock"><Icon name="lock" size={11} /> set once</span></div></div><p className="identity-note">Gender, date of birth, and <em>Looking for</em> are set from your verified ID and your orientation choice at signup. They cannot be changed by you. If any are wrong, <a href="/contact">contact support</a> — we will re-verify.</p></div><div className="settings-card"><div className="card-heading"><div><span className="eyebrow">Visibility</span><h3>Choose what feels comfortable</h3></div></div>{rows.map((row) => <div className="setting-row" key={row.key}><span className="setting-symbol"><Icon name={row.key === 'contact' ? 'lock' : row.key === 'viewed' || row.key === 'photo' ? 'user' : row.key === 'ministry' || row.key === 'organisation' ? 'briefcase' : 'shield'} size={17} /></span><span><strong>{row.title}</strong><small>{row.desc}</small></span><button className={`toggle ${settings[row.key] ? 'toggle--on' : ''}`} aria-label={`Toggle ${row.title}`} aria-pressed={settings[row.key]} onClick={() => onToggle(row.key)}><i /></button></div>)}<div className="card-heading" style={{ marginTop: 22 }}><div><span className="eyebrow">Female profile controls</span><h3>Stay private, keep exploring</h3></div></div>{femaleRows.map((row) => <div className="setting-row" key={row.key}><span className="setting-symbol"><Icon name={row.key === 'hiddenFromSearch' ? 'lock' : 'search'} size={17} /></span><span><strong>{row.title}</strong><small>{row.desc}</small></span><button className={`toggle ${settings[row.key] ? 'toggle--on' : ''}`} aria-label={`Toggle ${row.title}`} aria-pressed={settings[row.key]} onClick={() => onToggle(row.key)}><i /></button></div>)}</div><div className="settings-card safety-rules"><div className="card-heading"><div><span className="eyebrow">Safety centre</span><h3>Small habits, real protection</h3></div><Icon name="shield" size={20} /></div><ul><li><Icon name="check" size={14} /> Never share financial details</li><li><Icon name="check" size={14} /> Keep first meetings public</li><li><Icon name="check" size={14} /> Report anything uncomfortable</li></ul><button className="button button--outline button--small">Read safety guide <Icon name="arrow" size={14} /></button></div></div></div>;
}

type ReportItem = { id: string; reason: string; detail: string | null; status: string; created_at: number; reported_name: string; reporter_name: string };
type PendingVerification = { user_id: string; status: string; created_at: number; govt_id_key: string | null; photo_id_key: string | null; full_name: string };

function AdminView({ reports, onSetStatus, pendingVerifications, onVerifyDecision }: { reports: ReportItem[]; onSetStatus: (id: string, status: string) => void; pendingVerifications: PendingVerification[]; onVerifyDecision: (userId: string, action: 'approve' | 'reject') => void }) {
  const [tab, setTab] = useState<'reports' | 'review'>('review');
  const openReports = reports.filter((r) => r.status === 'open').length;
  return <div className="view-body admin-view"><div className="admin-top"><div><div className="eyebrow">Trust operations</div><h2>Keep the circle considered.</h2><p>Review verification documents, respond to reports, and keep every profile worthy of trust.</p></div></div><div className="admin-stats"><div><span>Verification queue</span><strong>{pendingVerifications.length}</strong><small>Awaiting review</small></div><div><span>Open reports</span><strong>{openReports}</strong><small>Awaiting review</small></div><div><span>Total reports</span><strong>{reports.length}</strong><small>All time</small></div><div><span>Review model</span><strong>Manual</strong><small>Human-checked, docs deleted after</small></div></div><div className="admin-tabs">{([['review', 'Verification queue'], ['reports', 'Reports']] as [typeof tab, string][]).map(([id, label]) => <button key={id} className={tab === id ? 'admin-tab--active' : ''} onClick={() => setTab(id)}>{label}{id === 'review' && pendingVerifications.length > 0 && <span>{pendingVerifications.length}</span>}{id === 'reports' && openReports > 0 && <span>{openReports}</span>}</button>)}</div>{tab === 'reports' && (reports.length === 0 ? <div className="empty-admin"><span><Icon name="shield" size={28} /></span><h3>No reports in the queue</h3><p>When a member reports a profile, it appears here for confidential review. Reporter identity is never shown to the reported member.</p></div> : <div className="review-table"><div className="review-table-head"><span>Reported member</span><span>Reason</span><span>From</span><span>Status</span></div>{reports.map((r) => <div className="review-row" key={r.id}><div><Avatar initials={initialsOf(r.reported_name)} tone="rose" /><span><strong>{maskLast(r.reported_name)}</strong><em>{r.detail || 'No detail provided'}</em></span></div><span className="document-status"><Icon name="shield" size={15} />{r.reason.replace(/_/g, ' ')}</span><em style={{ fontStyle: 'normal', fontSize: 11, color: 'var(--ink-muted)' }}>{maskLast(r.reporter_name)}</em><div className="review-actions"><select className="report-status-select" value={r.status} onChange={(e) => onSetStatus(r.id, e.target.value)}>{['open', 'reviewed', 'actioned', 'dismissed'].map((s) => <option key={s} value={s}>{s}</option>)}</select></div></div>)}</div>)}{tab === 'review' && (pendingVerifications.length === 0 ? <div className="empty-admin"><span><Icon name="shield" size={28} /></span><h3>No verifications waiting</h3><p>When members submit their service ID and photo ID, they appear here. Documents are visible only to admins and are deleted the moment you decide.</p></div> : <div className="review-table"><div className="review-table-head"><span>Member</span><span>Documents</span><span>Submitted</span><span>Action</span></div>{pendingVerifications.map((v) => <div className="review-row" key={v.user_id}><div><Avatar initials={initialsOf(v.full_name)} tone="sage" /><span><strong>{maskLast(v.full_name)}</strong><em>Awaiting decision</em></span></div><span className="document-status"><Icon name="shield" size={15} />{v.govt_id_key && <a href={`/api/verify/doc?user=${v.user_id}&type=govt_id`} target="_blank" rel="noreferrer">Service ID</a>}{v.govt_id_key && v.photo_id_key && ' · '}{v.photo_id_key && <a href={`/api/verify/doc?user=${v.user_id}&type=photo_id`} target="_blank" rel="noreferrer">Photo ID</a>}</span><time>{new Date(v.created_at * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</time><div className="review-actions"><button className="button button--primary button--small" onClick={() => onVerifyDecision(v.user_id, 'approve')}>Approve</button><button className="button button--outline button--small" onClick={() => onVerifyDecision(v.user_id, 'reject')}>Reject</button></div></div>)}</div>)}</div>;
}

// ---- Real member-app data layer (wired to F13–F17 APIs) ----
type Member = { id: string; name: string; service: string | null; city: string | null; gender: string | null; postingOutlook: string | null; verified: boolean; photoMode: string; hasPhoto?: boolean; managedByFamily?: boolean; photoX?: number; photoY?: number; photoZoom?: number };
type InterestItem = { id: string; status: string; user_id: string; full_name: string; created_at: number };

const memberTones = ['rose', 'sage', 'sand', 'blue', 'navy'];
function maskLast(name: string) { const p = name.trim().split(/\s+/).filter(Boolean); return p.length > 1 ? `${p[0]} ${p[p.length - 1][0].toUpperCase()}.` : (p[0] ?? 'Member'); }
const reportReasons: { value: string; label: string }[] = [
  { value: 'fake_profile', label: 'Fake or impersonated profile' },
  { value: 'harassment', label: 'Harassment or abusive behaviour' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'spam', label: 'Spam or solicitation' },
  { value: 'other', label: 'Something else' },
];

function RealMemberCard({ member, idx, status, onOpen, onSend }: { member: Member; idx: number; status?: string; onOpen: (m: Member) => void; onSend: (id: string) => void }) {
  const tone = memberTones[idx % memberTones.length];
  const label = status === 'accepted' ? 'Matched' : status === 'pending' ? 'Interest sent' : 'Send interest';
  const showPhoto = member.hasPhoto && member.photoMode === 'verified';
  return <article className="match-card"><div className="match-card-head">{showPhoto ? <CroppedPhoto src={`/api/photo?owner=${member.id}`} alt={`${member.name}'s photo`} x={member.photoX ?? 0.5} y={member.photoY ?? 0.3} zoom={member.photoZoom ?? 1} variant="card" loading="lazy" /> : <Avatar initials={initialsOf(member.name)} tone={tone} large />}</div><div className="match-card-body"><div className="match-name-row"><h3>{member.name}</h3>{member.verified && <VerifiedBadge />}</div>{member.managedByFamily && <span className="family-chip"><Icon name="users" size={11} /> Family-managed</span>}<p className="match-role">{member.service ?? 'Government professional'}</p><p className="match-city"><span className="city-pin"><Icon name="pin" size={13} /></span>{member.city ?? 'Delhi NCR'} · NCR</p><div className="match-actions"><button className="button button--outline button--small" onClick={() => onOpen(member)}>View</button><button className="button button--primary button--small" disabled={status === 'pending' || status === 'accepted'} onClick={() => onSend(member.id)}>{label}{!status && <Icon name="heart" size={14} />}</button></div></div></article>;
}

function RealDiscoverView({ members, statusFor, gender, setGender, prefLookingFor, onOpen, onSend }: { members: Member[]; statusFor: (id: string) => string | undefined; gender: string; setGender: (g: string) => void; prefLookingFor: string | null; onOpen: (m: Member) => void; onSend: (id: string) => void }) {
  const filters: [string, string][] = [['all', 'Everyone'], ['female', 'Women'], ['male', 'Men']];
  // Pills are shown only when the viewer's orientation leaves a real choice
  // open (pref_looking_for = 'Any / All Genders'). Conventional orientations
  // (Female / Male) hide the pills since the server is already doing the
  // matching — there's nothing to toggle.
  const showPills = prefLookingFor === 'Any / All Genders' || prefLookingFor === null;
  const headline = prefLookingFor === 'Female' ? 'Women who want men like you.'
                  : prefLookingFor === 'Male'   ? 'Men who want women like you.'
                  : 'Members whose orientation matches yours.';
  return <div className="view-body"><div className="discover-toolbar">{showPills && <div className="filter-scroll">{filters.map(([g, label]) => <button key={g} className={`filter-pill ${gender === g ? 'filter-pill--active' : ''}`} onClick={() => setGender(g)}>{label}</button>)}</div>}</div><p className="discover-hint">{showPills ? 'Showing members whose orientation matches yours. You can override above.' : `Looking for ${prefLookingFor === 'Female' ? 'women' : 'men'} — changeable only by support.`}</p><div className="discover-intro"><div><h2>{members.length} verified {members.length === 1 ? 'match' : 'matches'}</h2><p>{headline} Everyone here is a government professional building a life in the Delhi NCR.</p></div></div>{members.length === 0 ? <div className="empty-admin"><span><Icon name="users" size={28} /></span><h3>No matches in this view</h3><p>This could be the community is still small — or no one's stated orientation matches yours yet. If you chose <em>Looking for</em> in your profile, contact support if it was set wrong.</p></div> : <div className="match-grid match-grid--four">{members.map((m, i) => <RealMemberCard key={m.id} member={m} idx={i} status={statusFor(m.id)} onOpen={onOpen} onSend={onSend} />)}</div>}<div className="discover-footer"><Icon name="lock" size={16} /> Photos and contact details stay private until each member chooses to share them.</div></div>;
}

type PhotoRequest = { id: string; status: string; user_id: string; full_name: string };

function InterestsInbox({ received, sent, photoRequests, onRespond, onPhotoRespond, embedded }: { received: InterestItem[]; sent: InterestItem[]; photoRequests: PhotoRequest[]; onRespond: (id: string, action: string) => void; onPhotoRespond: (id: string, action: string) => void; embedded?: boolean }) {
  const badge = (s: string) => s === 'accepted' ? 'Matched' : s === 'declined' ? 'Declined' : s === 'withdrawn' ? 'Withdrawn' : s;
  const pendingPhoto = photoRequests.filter((p) => p.status === 'requested');
  return <div className={embedded ? 'interests-embed' : 'view-body interests-view'}>{pendingPhoto.length > 0 && <><div className="section-heading-row"><div><h2>Photo requests</h2><p>Members asking to view your photo. Approve one at a time.</p></div></div>{pendingPhoto.map((p) => <div className="interest-row" key={p.id}><Avatar initials={initialsOf(p.full_name)} tone="sand" /><span className="interest-who"><strong>{maskLast(p.full_name)}</strong><small>Requested to view your photo</small></span><div className="interest-actions"><button className="button button--primary button--small" onClick={() => onPhotoRespond(p.id, 'grant')}>Approve</button><button className="button button--outline button--small" onClick={() => onPhotoRespond(p.id, 'deny')}>Decline</button></div></div>)}</>}<div className="section-heading-row" style={pendingPhoto.length > 0 ? { marginTop: 34 } : undefined}><div><h2>Interests received</h2><p>People who’d like to connect — you decide who gets closer.</p></div></div>{received.length === 0 ? <div className="interest-empty">No interests yet. They’ll appear here as members reach out.</div> : received.map((i) => <div className="interest-row" key={i.id}><Avatar initials={initialsOf(i.full_name)} tone="rose" /><span className="interest-who"><strong>{maskLast(i.full_name)}</strong><small>Sent you an interest</small></span>{i.status === 'pending' ? <div className="interest-actions"><button className="button button--primary button--small" onClick={() => onRespond(i.id, 'accept')}>Accept</button><button className="button button--outline button--small" onClick={() => onRespond(i.id, 'decline')}>Decline</button></div> : <span className={`interest-badge interest-badge--${i.status}`}>{badge(i.status)}</span>}</div>)}<div className="section-heading-row" style={{ marginTop: 34 }}><div><h2>Interests you sent</h2><p>Where your outreach stands.</p></div></div>{sent.length === 0 ? <div className="interest-empty">You haven’t sent any interests yet — browse Discover to begin.</div> : sent.map((i) => <div className="interest-row" key={i.id}><Avatar initials={initialsOf(i.full_name)} tone="sage" /><span className="interest-who"><strong>{maskLast(i.full_name)}</strong><small>You sent an interest</small></span><span className={`interest-badge interest-badge--${i.status}`}>{badge(i.status)}</span></div>)}</div>;
}

type Convo = { partner_id: string; full_name: string; last_at: number; unread: number; last_body: string | null };
type ChatMsg = { id: string; mine: boolean; body: string; at: number };

function fmtClock(ts: number) { return new Date(ts * 1000).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }); }

function RealInboxView({ initialPartner, received, sent, photoRequests, onRespond, onPhotoRespond }: { initialPartner: { id: string; name: string } | null; received: InterestItem[]; sent: InterestItem[]; photoRequests: PhotoRequest[]; onRespond: (id: string, action: string) => void; onPhotoRespond: (id: string, action: string) => void }) {
  const [tab, setTab] = useState<'chats' | 'interests'>('chats');
  const [convos, setConvos] = useState<Convo[]>([]);
  const [active, setActive] = useState<{ id: string; name: string } | null>(initialPartner);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState('');
  const [sendErr, setSendErr] = useState('');
  const loadConvos = () => fetch('/api/messages').then((r) => r.json()).then((d) => setConvos(d.conversations ?? [])).catch(() => undefined);
  const loadThread = (id: string) => fetch(`/api/messages?with=${id}`).then((r) => r.json()).then((d) => setMsgs(d.messages ?? [])).catch(() => undefined);
  useEffect(() => { loadConvos(); }, []);
  useEffect(() => { if (active) { setMsgs([]); setSendErr(''); loadThread(active.id); } }, [active?.id]);
  useEffect(() => {
    const t = window.setInterval(() => { loadConvos(); if (active) loadThread(active.id); }, 10000);
    return () => window.clearInterval(t);
  }, [active?.id]);
  const send = async () => {
    const text = draft.trim();
    if (!text || !active) return;
    setSendErr('');
    const r = await fetch('/api/messages', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ toUser: active.id, body: text }) }).catch(() => null);
    const d = await r?.json().catch(() => null) as { ok?: boolean; id?: string; at?: number; error?: string } | null;
    if (r?.ok && d?.id) { setDraft(''); setMsgs((m) => [...m, { id: d.id!, mine: true, body: text, at: d.at ?? Math.floor(Date.now() / 1000) }]); loadConvos(); }
    else setSendErr(d?.error ?? 'Could not send. Please try again.');
  };
  const pendingPhoto = photoRequests.filter((p) => p.status === 'requested').length;
  const pendingInterest = received.filter((i) => i.status === 'pending').length;
  const interestCount = pendingPhoto + pendingInterest;
  return <div className="view-body inbox-real">
    <div className="admin-tabs inbox-tabs">{([['chats', 'Messages'], ['interests', 'Interests']] as ['chats' | 'interests', string][]).map(([id, label]) => <button key={id} className={tab === id ? 'admin-tab--active' : ''} onClick={() => setTab(id)}>{label}{id === 'interests' && interestCount > 0 && <span>{interestCount}</span>}</button>)}</div>
    {tab === 'interests' && <div className="interests-scroll"><InterestsInbox embedded received={received} sent={sent} photoRequests={photoRequests} onRespond={onRespond} onPhotoRespond={onPhotoRespond} /></div>}
    {tab === 'chats' && <div className="inbox-view inbox-view--real">
      <div className="inbox-list"><div className="inbox-list-head"><span>Messages {convos.reduce((a, c) => a + (c.unread > 0 ? 1 : 0), 0) > 0 && <strong>{convos.filter((c) => c.unread > 0).length}</strong>}</span></div>{convos.length === 0 ? <div className="interest-empty" style={{ margin: 14 }}>No conversations yet. Open a member’s profile and press Message.</div> : convos.map((c) => <button key={c.partner_id} className={`conversation ${active?.id === c.partner_id ? 'conversation--selected' : ''}`} onClick={() => setActive({ id: c.partner_id, name: maskLast(c.full_name) })}><Avatar initials={initialsOf(c.full_name)} tone={memberTones[c.partner_id.charCodeAt(0) % memberTones.length]} /><span><strong>{maskLast(c.full_name)}</strong><em>{c.last_body ?? ''}</em></span><time>{fmtClock(c.last_at)}</time>{c.unread > 0 && <i className="conversation-unread" />}</button>)}</div>
      <div className="chat-panel">{active ? <><div className="chat-head"><Avatar initials={initialsOf(active.name)} tone="rose" /><div><strong>{active.name}</strong><small><span className="online-dot" /> Safe chat · Contact details stay hidden</small></div></div><div className="chat-messages">{msgs.length === 0 ? <div className="day-divider"><span>Say hello — kindly and briefly</span></div> : msgs.map((m) => <div key={m.id} className={`message ${m.mine ? 'message--me' : 'message--them'}`}>{m.body} <time>{fmtClock(m.at)}</time></div>)}</div>{sendErr && <p className="chat-send-err">{sendErr}</p>}<div className="chat-compose"><input placeholder="Write a thoughtful message…" aria-label="Write a message" value={draft} maxLength={2000} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} /><button aria-label="Send message" onClick={send}><Icon name="arrow" size={17} /></button></div><p className="chat-note"><Icon name="lock" size={12} /> Your conversation is private and contact details stay hidden until you both share.</p></> : <div className="chat-empty"><Icon name="mail" size={26} /><p>Select a conversation, or open a member’s profile and press <strong>Message</strong>.</p></div>}</div>
    </div>}
  </div>;
}

type ContactState = { mutual: boolean; youAgreed?: boolean; theyAgreed?: boolean; contact?: { email: string | null; phone: string | null } };

function MemberModal({ member, status, onClose, onSend, onBlock, onReport, onMessage }: { member: Member | null; status?: string; onClose: () => void; onSend: (id: string) => void; onBlock: (id: string) => void; onReport: (id: string, reason: string) => void; onMessage: (m: Member) => void }) {
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState('fake_profile');
  const [photoStatus, setPhotoStatus] = useState('none');
  const [contact, setContact] = useState<ContactState | null>(null);
  useEffect(() => {
    if (!member) return;
    let alive = true;
    fetch(`/api/photo-access?owner=${member.id}`).then((r) => r.json()).then((d) => { if (alive) setPhotoStatus(d.status || 'none'); }).catch(() => undefined);
    fetch(`/api/contact?with=${member.id}`).then((r) => r.json()).then((d) => { if (alive) setContact(d); }).catch(() => undefined);
    return () => { alive = false; };
  }, [member]);
  if (!member) {
    return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><div className="modal quick-profile" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}><button className="icon-button modal-close" aria-label="Close" onClick={onClose}><Icon name="x" /></button><div className="quick-profile-head"><Avatar initials="AS" tone="rose" large /><div><VerifiedBadge /><h2>Aditi S.</h2><p>Section Officer · CSS</p><span className="match-city"><span className="city-pin"><Icon name="pin" size={13} /></span> New Delhi · NCR</span></div><div className="quick-score"><strong>96%</strong><small>aligned</small></div></div><div className="quick-signal"><Icon name="spark" size={16} /><span><strong>Strong career alignment</strong><small>Both prefer to build a shared home in the NCR.</small></span></div><p className="profile-story">I value a calm, curious life and believe two careers can make a home more interesting when the geography works for both.</p><div className="quick-tags"><span>Stay in NCR</span><span>Family-minded</span><span>Weekend explorer</span></div><div className="quick-actions"><button className="button button--primary button--full">Send interest <Icon name="heart" size={16} /></button><button className="button button--outline button--full" onClick={onClose}>Maybe later</button></div><p className="microcopy"><Icon name="lock" size={12} /> Contact details remain hidden until interest is mutual.</p></div></div>;
  }
  const requestPhoto = () => fetch('/api/photo-access', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ownerUser: member.id }) }).then((r) => r.json()).then((d) => setPhotoStatus(d.status || 'requested')).catch(() => undefined);
  const refreshContact = () => fetch(`/api/contact?with=${member.id}`).then((r) => r.json()).then(setContact).catch(() => undefined);
  const shareContact = () => fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ withUser: member.id, agree: true }) }).then(refreshContact).catch(() => undefined);
  const revokeContact = () => fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ withUser: member.id, agree: false }) }).then(refreshContact).catch(() => undefined);
  const photoLabel = photoStatus === 'open' ? 'Visible to verified members' : photoStatus === 'granted' ? (member.hasPhoto ? 'Access granted' : 'Access granted — they haven’t added a photo yet') : photoStatus === 'requested' ? 'Awaiting their approval' : photoStatus === 'hidden' ? 'Kept private by this member' : 'Ask to view — they approve each request';
  const contactLabel = contact?.mutual ? 'Shared — you can reach each other' : contact?.youAgreed ? 'You’ve shared — waiting for them' : contact?.theyAgreed ? 'They’ve offered — share back to connect' : 'Hidden until you both agree';
  const label = status === 'accepted' ? 'Matched' : status === 'pending' ? 'Interest sent' : 'Send interest';
  const canSeePhoto = member.hasPhoto && (photoStatus === 'open' || photoStatus === 'granted');
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><div className="modal quick-profile" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}><button className="icon-button modal-close" aria-label="Close" onClick={onClose}><Icon name="x" /></button><div className="quick-profile-head">{canSeePhoto ? <CroppedPhoto src={`/api/photo?owner=${member.id}`} alt={`${member.name}'s photo`} x={member.photoX ?? 0.5} y={member.photoY ?? 0.3} zoom={member.photoZoom ?? 1} variant="modal" /> : <Avatar initials={initialsOf(member.name)} tone="rose" large />}<div>{member.verified && <VerifiedBadge />}<h2>{member.name}</h2><p>{member.service ?? 'Government professional'}</p><span className="match-city"><span className="city-pin"><Icon name="pin" size={13} /></span> {member.city ?? 'Delhi NCR'} · NCR</span></div></div><p className="profile-story">Contact details and photographs stay private until this member chooses to share them.</p>{(member.postingOutlook || member.managedByFamily) && <div className="quick-tags">{member.postingOutlook && <span>{member.postingOutlook}</span>}{member.managedByFamily && <span>Family-managed</span>}{member.verified && <span>Verified</span>}</div>}{reporting ? <div className="report-box"><label className="field"><span>Why are you reporting this member?</span><select value={reason} onChange={(e) => setReason(e.target.value)}>{reportReasons.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></label><div className="quick-actions"><button className="button button--primary button--full" onClick={() => onReport(member.id, reason)}>Submit report</button><button className="button button--outline button--full" onClick={() => setReporting(false)}>Cancel</button></div></div> : <><div className="connect-panel"><div className="connect-row"><span className="connect-icon"><Icon name="user" size={15} /></span><span className="connect-text"><strong>Photo</strong><small>{photoLabel}</small></span>{photoStatus === 'none' ? <button className="button button--outline button--small" onClick={requestPhoto}>Request</button> : photoStatus === 'requested' ? <span className="connect-state">Requested</span> : (photoStatus === 'granted' || photoStatus === 'open') ? <span className="connect-state connect-state--ok"><Icon name="check" size={12} /> Available</span> : <span className="connect-state">Private</span>}</div><div className="connect-row"><span className="connect-icon"><Icon name="mail" size={15} /></span><span className="connect-text"><strong>Contact</strong><small>{contactLabel}</small></span>{contact?.mutual || contact?.youAgreed ? <button className="button button--outline button--small" onClick={revokeContact}>{contact?.mutual ? 'Stop' : 'Undo'}</button> : <button className="button button--outline button--small" onClick={shareContact}>Share mine</button>}</div>{contact?.mutual && <div className="connect-reveal"><Icon name="check" size={13} /> {contact.contact?.phone || contact.contact?.email || 'Contact shared'}</div>}</div><div className="quick-actions"><button className="button button--primary button--full" disabled={status === 'pending' || status === 'accepted'} onClick={() => onSend(member.id)}>{label}{!status && <Icon name="heart" size={16} />}</button><button className="button button--outline button--full" onClick={() => onMessage(member)}>Message <Icon name="mail" size={15} /></button></div><div className="quick-secondary"><button className="text-button" onClick={() => onBlock(member.id)}>Block</button><span aria-hidden>·</span><button className="text-button" onClick={() => setReporting(true)}>Report</button></div></>}<p className="microcopy"><Icon name="lock" size={12} /> Contact details remain hidden until you both choose to share.</p></div></div>;
}

function AppShell({ user, onLogout }: { user: AuthUser | null; onLogout: () => void }) {
  const [view, setView] = useState<View>('home');
  const changeView = (v: View) => withViewTransition(() => setView(v));
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [visibility, setVisibility] = useState<VisibilitySettings>({ profile: true, photo: false, contact: false, viewed: false, ministry: true, organisation: true, hiddenFromSearch: false, searchWhileHidden: true });
  const [members, setMembers] = useState<Member[]>([]);
  const [sentInterests, setSentInterests] = useState<InterestItem[]>([]);
  const [receivedInterests, setReceivedInterests] = useState<InterestItem[]>([]);
  const [photoRequests, setPhotoRequests] = useState<PhotoRequest[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerification[]>([]);
  const [selected, setSelected] = useState<Member | null>(null);
  const [gender, setGender] = useState('all');
  const [prefs, setPrefs] = useState<Record<string, unknown>>({});
  const [chatWith, setChatWith] = useState<{ id: string; name: string } | null>(null);
  const [myHasPhoto, setMyHasPhoto] = useState(false);
  const [myVerified, setMyVerified] = useState(false);
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState('');
  const [draft, setDraft] = useState<ProfileValues>({});
  const isReal = !!user;
  const showToast = (msg: string) => { setToast(msg); window.setTimeout(() => setToast(''), 3200); };

  useEffect(() => {
    if (!user) return;
    fetch('/api/profile').then(async (response) => {
      if (!response.ok) return;
      const data = await response.json().catch(() => null) as { profile?: ProfileData & { hidden_profile?: number; photo_mode?: string } } | null;
      if (data?.profile) { setProfile(data.profile); setVisibility((v) => ({ ...v, hiddenFromSearch: !!data.profile!.hidden_profile, photo: data.profile!.photo_mode === 'verified' })); }
    }).catch(() => undefined);
  }, [user]);
  // Load localStorage draft once on mount (browser-only) so HomeView strength matches the editor.
  useEffect(() => {
    try { setDraft(JSON.parse(localStorage.getItem('ncr-profile-draft') || '{}')); } catch { /* ignore */ }
  }, []);

  // Fetch partner_preferences once so HomeView strength + Discover default
  // both have access to the orientation fields.
  useEffect(() => {
    if (!user) return;
    fetch('/api/preferences').then(async (r) => {
      if (!r.ok) return;
      const d = await r.json().catch(() => null) as { preferences?: Record<string, unknown> } | null;
      if (d?.preferences) setPrefs(d.preferences);
    }).catch(() => undefined);
  }, [user]);

  const refreshInterests = () => {
    fetch('/api/interests?box=sent').then((r) => r.json()).then((d) => setSentInterests(d.interests ?? [])).catch(() => undefined);
    fetch('/api/interests?box=received').then((r) => r.json()).then((d) => setReceivedInterests(d.interests ?? [])).catch(() => undefined);
  };
  const refreshPhotoRequests = () => fetch('/api/photo-access?box=requests').then((r) => r.json()).then((d) => setPhotoRequests(d.requests ?? [])).catch(() => undefined);
  useEffect(() => { if (user) { refreshInterests(); refreshPhotoRequests(); } }, [user]);
  useEffect(() => {
    if (!user) return;
    fetch('/api/photo').then((r) => setMyHasPhoto(r.ok)).catch(() => undefined);
    fetch('/api/verify?mine=1').then((r) => r.json()).then((d) => setMyVerified(d.verification?.status === 'approved')).catch(() => undefined);
  }, [user, profile]);
  useEffect(() => {
    if (!user) return;
    const load = () => fetch('/api/messages').then((r) => r.json()).then((d) => setUnread((d.conversations ?? []).reduce((a: number, c: { unread: number }) => a + (c.unread > 0 ? 1 : 0), 0))).catch(() => undefined);
    load();
    const t = window.setInterval(load, 15000);
    return () => window.clearInterval(t);
  }, [user, view]);
  const respondPhoto = async (id: string, action: string) => {
    await fetch('/api/photo-access', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, action }) }).catch(() => null);
    refreshPhotoRequests(); showToast(action === 'grant' ? 'Photo access granted.' : 'Photo request declined.');
  };
  // Auto-default the Discover gender pill from the viewer's own gender +
  // pref_looking_for. Runs once per login so the pill matches what they
  // actually want to see. The user can still override by clicking a pill.
  const defaultedPillRef = useRef(false);
  useEffect(() => {
    if (!user || !profile || defaultedPillRef.current) return;
    defaultedPillRef.current = true;
    const p = (profile as Record<string, unknown>).gender as string | null;
    const pf = (prefs as Record<string, unknown>).pref_looking_for as string | null;
    if (p === 'female') setGender('female');
    else if (p === 'male') setGender('male');
    else if (p === null && pf === 'Any / All Genders') setGender('all');
  }, [user, profile, prefs]);

  useEffect(() => {
    if (!user) return;
    const q = gender === 'male' || gender === 'female' ? `?gender=${gender}` : '';
    fetch(`/api/members${q}`).then((r) => r.json()).then((d) => setMembers(d.members ?? [])).catch(() => undefined);
  }, [user, gender]);
  useEffect(() => {
    if (user?.role === 'admin' && view === 'admin') {
      fetch('/api/report').then((r) => r.json()).then((d) => setReports(d.reports ?? [])).catch(() => undefined);
      fetch('/api/verify').then((r) => r.json()).then((d) => setPendingVerifications(d.pending ?? [])).catch(() => undefined);
    }
  }, [user, view]);
  const decideVerification = async (userId: string, action: 'approve' | 'reject') => {
    await fetch('/api/verify', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId, action }) }).catch(() => null);
    setPendingVerifications((vs) => vs.filter((v) => v.user_id !== userId));
    showToast(action === 'approve' ? 'Member verified — badge issued, documents deleted.' : 'Verification rejected — documents deleted.');
  };
  useEffect(() => {
    if (user && view === 'inbox') { refreshInterests(); refreshPhotoRequests(); }
  }, [user, view]);

  const statusFor = (id: string) => sentInterests.find((i) => i.user_id === id)?.status;
  const sendInterest = async (id: string) => {
    const r = await fetch('/api/interests', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ toUser: id }) }).catch(() => null);
    if (r && r.ok) { refreshInterests(); showToast('Interest sent.'); } else { showToast('Could not send interest.'); }
  };
  const respondInterest = async (id: string, action: string) => {
    await fetch('/api/interests', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, action }) }).catch(() => null);
    refreshInterests(); showToast(action === 'accept' ? 'Interest accepted.' : 'Interest declined.');
  };
  const blockMember = async (id: string) => {
    await fetch('/api/block', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ blockedUser: id }) }).catch(() => null);
    setMembers((ms) => ms.filter((m) => m.id !== id)); setProfileOpen(false); setSelected(null); showToast('Member blocked.');
  };
  const reportMember = async (id: string, reason: string) => {
    await fetch('/api/report', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ reportedUser: id, reason }) }).catch(() => null);
    setProfileOpen(false); setSelected(null); showToast('Report submitted — our team will review it privately.');
  };
  const setReportStatus = async (id: string, status: string) => {
    await fetch('/api/report', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, status }) }).catch(() => null);
    setReports((rs) => rs.map((r) => r.id === id ? { ...r, status } : r));
  };
  const toggleVisibility = (key: keyof VisibilitySettings) => setVisibility((current) => {
    const next = { ...current, [key]: !current[key] };
    if (user) {
      if (key === 'hiddenFromSearch') fetch('/api/profile', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ hidden_profile: next.hiddenFromSearch ? 1 : 0 }) }).catch(() => undefined);
      if (key === 'photo') fetch('/api/profile', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ photo_mode: next.photo ? 'verified' : 'on_request' }) }).catch(() => undefined);
    }
    return next;
  });

  const openMember = (m: Member) => { setSelected(m); setProfileOpen(true); };
  const openDemoModal = () => { setSelected(null); setProfileOpen(true); };
  const openChat = (m: Member) => { setChatWith({ id: m.id, name: m.name }); setProfileOpen(false); setSelected(null); changeView('inbox'); };
  const displayName = user?.fullName ?? 'Priya S.';
  const initials = user ? initialsOf(user.fullName) : 'PS';
  const showAdmin = !user || user.role === 'admin';
  const strength = user ? profileCompletion({ ...((profile ?? {}) as unknown as ProfileValues), ...draft }) : 72;
  const adminCount = user?.role === 'admin' ? pendingVerifications.length + reports.filter((r) => r.status === 'open').length : 4;

  return <div className="app-shell"><Sidebar view={view} setView={changeView} onAdmin={() => changeView('admin')} displayName={displayName} initials={initials} showAdmin={showAdmin} strength={strength} unread={isReal ? unread : 0} adminCount={adminCount} /><div className="app-main"><Topbar view={view} onLogout={onLogout} firstName={firstNameOf(displayName)} initials={initials} />{view === 'home' && <HomeView setView={changeView} onOpenProfile={openDemoModal} members={isReal ? members : undefined} onOpenMember={openMember} onSend={sendInterest} statusFor={statusFor} strength={strength} />}{view === 'discover' && (isReal ? <RealDiscoverView members={members} statusFor={statusFor} gender={gender} setGender={setGender} prefLookingFor={(prefs as Record<string, unknown>).pref_looking_for as string | null ?? null} onOpen={openMember} onSend={sendInterest} /> : <DiscoverView onOpenProfile={openDemoModal} hiddenFromSearch={visibility.hiddenFromSearch} searchWhileHidden={visibility.searchWhileHidden} />)}{view === 'profile' && <ProfileView visibility={visibility} user={user} profile={profile} onProfileSaved={setProfile} />}{view === 'inbox' && (isReal ? <RealInboxView key={chatWith?.id ?? 'none'} initialPartner={chatWith} received={receivedInterests} sent={sentInterests} photoRequests={photoRequests} onRespond={respondInterest} onPhotoRespond={respondPhoto} /> : <InboxView />)}{view === 'settings' && <SettingsView settings={visibility} onToggle={toggleVisibility} profile={profile} prefLookingFor={(prefs as Record<string, unknown>).pref_looking_for as string | null ?? null} />}{view === 'admin' && <AdminView reports={reports} onSetStatus={setReportStatus} pendingVerifications={pendingVerifications} onVerifyDecision={decideVerification} />}</div>{profileOpen && <MemberModal member={selected} status={selected ? statusFor(selected.id) : undefined} onClose={() => { setProfileOpen(false); setSelected(null); }} onSend={sendInterest} onBlock={blockMember} onReport={reportMember} onMessage={openChat} />}{toast && <div className="app-toast" role="status">{toast}</div>}</div>;
}

export default function Page() {
  const [mode, setMode] = useState<'landing' | 'app'>('landing');
  const [authOpen, setAuthOpen] = useState(false);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => { fetch('/api/auth/me').then(async (response) => { if (!response.ok) return; const data = await response.json().catch(() => null) as { user?: AuthUser | null } | null; if (data?.user) { setUser(data.user); setMode('app'); } }).catch(() => undefined); }, []);
  const openAuth = (nextMode: 'login' | 'signup') => { setAuthMode(nextMode); setAuthOpen(true); };
  const enterDemo = () => { setAuthOpen(false); setOnboardOpen(false); setUser(null); withViewTransition(() => setMode('app')); };
  const handleAuthenticated = (nextUser: AuthUser, completedMode: 'login' | 'signup') => { setUser(nextUser); setAuthOpen(false); if (completedMode === 'signup') setOnboardOpen(true); else withViewTransition(() => setMode('app')); };
  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined); setUser(null); withViewTransition(() => setMode('landing')); };
  if (mode === 'app') return <AppShell user={user} onLogout={logout} />;
  return <><Landing onAuth={() => openAuth('login')} onOnboard={() => openAuth('signup')} onDemo={enterDemo} />{authOpen && <AuthModal initialMode={authMode} onClose={() => setAuthOpen(false)} onAuthenticated={handleAuthenticated} />}{onboardOpen && <OnboardModal onClose={() => setOnboardOpen(false)} onDone={() => { setOnboardOpen(false); withViewTransition(() => setMode('app')); }} />}</>;
}
