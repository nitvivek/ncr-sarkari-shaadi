'use client';

import { useEffect, useMemo, useState } from 'react';
import { ministryNames, organisationsForMinistry } from './serviceData';
import { ncrDistrictGroups, serviceCadres } from './ncrData';

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
};

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'M';
  return ((parts[0][0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '')).toUpperCase();
}

function firstNameOf(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
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
      {step === 2 && <><h2 id="onboard-title">What should your match know?</h2><p className="modal-copy">Share only what feels right. You control who sees every detail.</p><div className="choice-grid"><button className={`choice-card ${postingOutlook === 'Stay in NCR' ? 'choice-card--selected' : ''}`} onClick={() => setPostingOutlook('Stay in NCR')}><span>🏡</span><strong>Stay in NCR</strong><small>My priority is a shared NCR home</small></button><button className={`choice-card ${postingOutlook === 'Open to movement' ? 'choice-card--selected' : ''}`} onClick={() => setPostingOutlook('Open to movement')}><span>↔</span><strong>Open to movement</strong><small>We can discuss future postings</small></button></div><label className="field"><span>Preferred NCR hubs</span><input value={preferredHubs} onChange={(event) => setPreferredHubs(event.target.value)} /></label><button className="button button--primary button--full" onClick={() => setStep(3)}>Next: verification <Icon name="arrow" size={16} /></button></>}
      {step === 3 && <><div className="success-orb"><Icon name="shield" size={28} /></div><h2 id="onboard-title">A trusted profile starts here</h2><p className="modal-copy">Verify your mobile today. Add service and identity documents when you’re ready; our team reviews them privately.</p><div className="verify-list"><div><span className="verify-number">1</span><span><strong>Mobile OTP</strong><small>Confirms you own the number</small></span><Icon name="check" size={16} /></div><div><span className="verify-number">2</span><span><strong>Service proof</strong><small>Visible only as a trust badge</small></span><Icon name="clock" size={16} /></div><div><span className="verify-number">3</span><span><strong>Photo + ID</strong><small>Encrypted and never public</small></span><Icon name="clock" size={16} /></div></div>{saveError && <p className="form-error" role="alert">{saveError}</p>}<button className="button button--primary button--full" onClick={finish} disabled={saving}>{saving ? 'Saving your details…' : 'Open my dashboard'} {!saving && <Icon name="arrow" size={16} />}</button></>}
      <p className="microcopy">Completely free. No paid tiers, no hidden contact fees.</p>
    </div>
  </div>;
}

function Landing({ onAuth, onOnboard, onDemo }: { onAuth: () => void; onOnboard: () => void; onDemo: () => void }) {
  return <main className="landing">
    <nav className="landing-nav shell"><Logo /><div className="landing-links"><a href="#why">Why NCR</a><a href="#how">How it works</a><a href="#safety">Trust & privacy</a></div><div className="nav-actions"><button className="button button--ghost" onClick={onAuth}>Sign in</button><button className="button button--dark" onClick={onOnboard}>Create free profile <Icon name="arrow" size={15} /></button><button className="mobile-menu" aria-label="Open menu"><Icon name="menu" /></button></div></nav>
    <section className="hero shell"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot" /> The NCR’s verified matrimony community</div><h1>A career that stays close to <em>home.</em></h1><p className="hero-lede">NCRSarkariShaadi is a calmer way for government professionals to meet someone who understands the work, the transfers, and the life you’re building around both.</p><div className="hero-actions"><button className="button button--primary button--large" onClick={onOnboard}>Create your free profile <Icon name="arrow" size={17} /></button><button className="button button--text button--large" onClick={onDemo}>Explore the member experience <Icon name="arrow" size={17} /></button></div><div className="hero-proof"><span><Icon name="shield" size={16} /> Identity reviewed</span><span><Icon name="lock" size={16} /> Privacy you control</span><span><Icon name="spark" size={16} /> Always free</span></div></div><div className="hero-visual"><div className="hero-glow" /><div className="match-art-card match-art-card--back"><span className="art-label">Posting compatibility</span><strong>Same city, same season</strong><div className="art-route"><span>Delhi</span><i>→</i><span>NCR</span></div></div><div className="match-art-card match-art-card--front"><div className="art-card-top"><span className="art-label">Today’s alignment</span><span className="art-score">94%</span></div><div className="art-people"><div className="art-person"><div className="portrait portrait--one">AS</div><span>Aditi</span><small>CSS · New Delhi</small></div><div className="art-heart"><Icon name="heart" size={20} /></div><div className="art-person"><div className="portrait portrait--two">RK</div><span>Rohan</span><small>DANICS · Noida</small></div></div><div className="art-tags"><span>Stay in NCR</span><span>Verified</span><span>Family-minded</span></div></div><div className="floating-note"><span className="note-icon"><Icon name="check" size={13} /></span><span><strong>Both are verified</strong><small>Documents reviewed privately</small></span></div></div></section>
    <section className="proof-bar"><div className="shell proof-inner"><span className="proof-intro">Built for Delhi's permanent government cadres</span><span>CSS</span><span>CSSS</span><span>DANICS / DANIPS</span><span>DDA · MCD · NDMC</span><span>DMRC · DTC</span></div></section>
    <section id="why" className="section shell why-section"><div className="section-intro"><div className="eyebrow">The right first filter</div><h2>Compatibility is more than a checklist.</h2><p>For serving professionals, a good match has to work in real life—commutes, postings, parents, and a home you can share.</p></div><div className="feature-grid"><div className="feature-card feature-card--accent"><span className="feature-number">01</span><Icon name="briefcase" size={23} /><h3>Career-aware matching</h3><p>We put service, posting flexibility, and your preferred NCR hubs at the centre of every recommendation.</p><a href="#how">See the matching logic <Icon name="arrow" size={14} /></a></div><div className="feature-card"><span className="feature-number">02</span><Icon name="shield" size={23} /><h3>Trust you can understand</h3><p>Identity, mobile, and service proof become clear, useful badges—not documents sitting in a dark folder.</p><a href="#safety">How verification works <Icon name="arrow" size={14} /></a></div><div className="feature-card"><span className="feature-number">03</span><Icon name="lock" size={23} /><h3>Privacy at every step</h3><p>Hide your photo, contact details, and detailed profile until you are comfortable. You decide who gets closer.</p><a href="#safety">Explore privacy controls <Icon name="arrow" size={14} /></a></div></div></section>
    <section id="how" className="section section--soft"><div className="shell flow-section"><div className="section-intro"><div className="eyebrow">A simple beginning</div><h2>Meet with more context, less noise.</h2><p>Familiar matchmaking patterns, shaped around the practical realities of NCR government life.</p></div><div className="flow-grid"><div className="flow-step"><span>1</span><h3>Make a private profile</h3><p>Tell us your service, NCR base, and what a shared future looks like.</p></div><div className="flow-step"><span>2</span><h3>See aligned profiles</h3><p>Browse relevant recommendations with clear compatibility signals.</p></div><div className="flow-step"><span>3</span><h3>Connect at your pace</h3><p>Shortlist, send an interest, and share details only when it feels right.</p></div></div><div className="pattern-callout"><div><Icon name="spark" size={20} /><strong>Inspired by what works. Focused on what’s missing.</strong><p>Search, shortlists, privacy settings, and safe chat are familiar. Career stability is the signal that makes them more useful here.</p></div><button className="button button--dark" onClick={onDemo}>See the member home <Icon name="arrow" size={15} /></button></div></div></section>
    <section id="safety" className="section shell safety-section"><div className="safety-visual"><div className="privacy-card"><div className="privacy-top"><span className="privacy-icon"><Icon name="lock" size={18} /></span><span><strong>Your privacy, your pace</strong><small>Control who sees what</small></span><span className="privacy-toggle"><i /></span></div><div className="privacy-row"><span>Detailed profile</span><strong>Matches only</strong><Icon name="chevron" size={15} /></div><div className="privacy-row"><span>Photo</span><strong>On request</strong><Icon name="chevron" size={15} /></div><div className="privacy-row"><span>Contact details</span><strong>Hidden</strong><Icon name="chevron" size={15} /></div></div></div><div className="safety-copy"><div className="eyebrow">A considered way to connect</div><h2>Trust is not a badge. It’s a system.</h2><p>We borrow the best safety habits from leading matrimony platforms and make them default: mobile verification, document review, photo controls, private contact details, and clear reporting.</p><div className="safety-list"><div><span><Icon name="check" size={14} /></span><p><strong>Verified before visible</strong><br /><small>Every profile starts with mobile verification and moves through a human review queue.</small></p></div><div><span><Icon name="check" size={14} /></span><p><strong>Private until mutual</strong><br /><small>Your phone and documents are never part of a public profile.</small></p></div><div><span><Icon name="check" size={14} /></span><p><strong>One free community</strong><br /><small>No premium tier to see contact details or be treated seriously.</small></p></div></div><button className="button button--text" onClick={onOnboard}>Create a profile with care <Icon name="arrow" size={15} /></button></div></section>
    <section className="cta-band"><div className="shell cta-inner"><div><div className="eyebrow eyebrow--light">For a life that fits</div><h2>Your next chapter can share the same map.</h2></div><button className="button button--light button--large" onClick={onOnboard}>Join NCRSarkariShaadi free <Icon name="arrow" size={17} /></button></div></section>
    <footer className="landing-footer shell"><Logo /><div className="footer-note">Independent platform for NCR government professionals · Not affiliated with any government department</div><div className="footer-links"><a href="#safety">Privacy</a><a href="#safety">Safety</a><a href="#how">How it works</a></div></footer>
  </main>;
}

function Sidebar({ view, setView, onAdmin, displayName, initials, showAdmin }: { view: View; setView: (v: View) => void; onAdmin: () => void; displayName: string; initials: string; showAdmin: boolean }) {
  return <aside className="sidebar"><Logo /><div className="sidebar-label">Member home</div><div className="sidebar-nav">{navItems.map((item) => <button key={item.id} className={`side-link ${view === item.id ? 'side-link--active' : ''}`} onClick={() => setView(item.id)}><Icon name={item.icon} size={18} /><span>{item.label}</span>{item.id === 'inbox' && <i className="unread-dot" />}</button>)}</div><div className="sidebar-bottom">{showAdmin && <button className="side-link side-link--admin" onClick={onAdmin}><Icon name="shield" size={18} /><span>Admin review</span><span className="admin-count">4</span></button>}<div className="sidebar-user"><Avatar initials={initials} tone="navy" /><span><strong>{displayName}</strong><small>Profile 72% complete</small></span><Icon name="chevron" size={15} /></div></div></aside>;
}

function Topbar({ view, onLogout, firstName, initials }: { view: View; onLogout: () => void; firstName: string; initials: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const title = view === 'home' ? `${greeting}, ${firstName}` : view === 'discover' ? 'Discover your aligned circle' : view === 'profile' ? 'My profile' : view === 'inbox' ? 'Your conversations' : view === 'settings' ? 'Privacy & safety' : 'Admin review';
  const sub = view === 'home' ? 'A few thoughtful matches are waiting for you.' : view === 'discover' ? 'Search by the life you want to build in NCR.' : view === 'profile' ? 'The more context you share, the more useful your matches become.' : view === 'inbox' ? 'A quiet space to take the next step.' : view === 'settings' ? 'You are in control of every detail.' : 'Keep the community trusted and useful.';
  return <header className="app-topbar"><div><div className="app-title">{title}</div><p>{sub}</p></div><div className="topbar-actions"><button className="icon-button notification-button" aria-label="Notifications"><Icon name="bell" size={19} /><i /></button><button className="topbar-avatar" onClick={onLogout}><Avatar initials={initials} tone="navy" /><Icon name="chevron" size={14} /></button></div></header>;
}

function MatchCard({ match, onOpen }: { match: typeof matches[number]; onOpen: () => void }) {
  return <article className="match-card"><div className="match-card-head"><Avatar initials={match.initials} tone={match.tone} large /><div className="match-score"><strong>{match.fit}%</strong><small>aligned</small></div></div><div className="match-card-body"><div className="match-name-row"><h3>{match.name}</h3><VerifiedBadge /></div><p className="match-role">{match.role}</p><p className="match-city"><span className="city-pin">⌖</span>{match.city} · NCR</p><div className="match-note"><Icon name="spark" size={14} />{match.note}</div><div className="match-actions"><button className="button button--outline button--small" onClick={onOpen}>View profile</button><button className="round-action" aria-label={`Like ${match.name}`}><Icon name="heart" size={17} /></button><button className="round-action" aria-label={`More options for ${match.name}`}><Icon name="chevron" size={17} /></button></div></div></article>;
}

function HomeView({ setView, onOpenProfile }: { setView: (v: View) => void; onOpenProfile: () => void }) {
  return <div className="view-body view-body--home"><div className="welcome-banner"><div><span className="banner-kicker"><Icon name="spark" size={14} /> Your weekly alignment</span><h2>Three people who understand the NCR life.</h2><p>Based on your preference for a stable NCR posting and a thoughtful pace.</p><button className="button button--dark button--small" onClick={() => setView('discover')}>See all recommendations <Icon name="arrow" size={14} /></button></div><div className="banner-orbit"><div className="orbit orbit--one"><Avatar initials="AS" tone="rose" /></div><div className="orbit orbit--two"><Avatar initials="NM" tone="sand" /></div><div className="orbit orbit--three"><Avatar initials="RK" tone="sage" /></div><div className="orbit-core"><Icon name="heart" size={25} /></div></div></div><div className="section-heading-row"><div><h2>Good-fit profiles</h2><p>Career and life signals that line up with yours.</p></div><button className="button button--text button--small" onClick={() => setView('discover')}>View all <Icon name="arrow" size={14} /></button></div><div className="match-grid">{matches.slice(0, 3).map((m) => <MatchCard key={m.id} match={m} onOpen={onOpenProfile} />)}</div><div className="home-lower-grid"><div className="completion-card"><div className="completion-head"><span><Icon name="user" size={17} /> Your profile</span><strong>72%</strong></div><div className="progress-track"><span style={{ width: '72%' }} /></div><p>Add your preferred NCR hubs and one line about your life outside work to improve your matches.</p><button className="button button--text button--small" onClick={() => setView('profile')}>Complete profile <Icon name="arrow" size={14} /></button></div><div className="safety-mini"><span className="safety-mini-icon"><Icon name="shield" size={18} /></span><div><strong>Safety check-in</strong><p>Your contact details are hidden from everyone until you accept an interest.</p><button className="button button--text button--small" onClick={() => setView('settings')}>Review privacy <Icon name="arrow" size={14} /></button></div></div></div></div>;
}

function DiscoverView({ onOpenProfile, hiddenFromSearch, searchWhileHidden }: { onOpenProfile: () => void; hiddenFromSearch: boolean; searchWhileHidden: boolean }) {
  const [active, setActive] = useState('All aligned');
  const filters = ['All aligned', 'Stay in NCR', 'CSS / CSSS', 'DANICS / DDA', 'New this week'];
  const filtered = useMemo(() => {
    const searchableMatches = hiddenFromSearch && searchWhileHidden ? matches.filter((match) => match.gender === 'male') : matches;
    return active === 'CSS / CSSS' ? searchableMatches.filter((m) => m.role.includes('CSS')) : active === 'DANICS / DDA' ? searchableMatches.filter((m) => m.role.includes('DANICS') || m.role.includes('DDA')) : active === 'New this week' ? searchableMatches.slice(1) : searchableMatches;
  }, [active, hiddenFromSearch, searchWhileHidden]);
  return <div className="view-body"><div className="discover-toolbar"><div className="filter-scroll">{filters.map((f) => <button key={f} className={`filter-pill ${active === f ? 'filter-pill--active' : ''}`} onClick={() => setActive(f)}>{f}</button>)}</div><button className="button button--outline button--small"><Icon name="search" size={14} /> Advanced filters</button></div><div className="discover-intro"><div><h2>{filtered.length * 18 + 20} profiles, thoughtfully narrowed</h2><p>{hiddenFromSearch && searchWhileHidden ? 'Your profile is hidden from discovery. You can still privately search male profiles.' : 'Career compatibility is weighted first. The rest is yours to explore.'}</p></div><button className="sort-button">Best aligned <Icon name="chevron" size={15} /></button></div><div className="match-grid match-grid--four">{filtered.map((m) => <MatchCard key={m.id} match={m} onOpen={onOpenProfile} />)}</div><div className="discover-footer"><Icon name="spark" size={16} /> {hiddenFromSearch && searchWhileHidden ? 'Private search is on. Your profile is not shown to other members.' : 'New profiles are added after our review queue. Check back tomorrow for a fresh circle.'}</div></div>;
}

const demoStory = 'I like early morning walks, old Hindi films, and a home where both people can pursue meaningful work. Looking for someone who sees a shared NCR life as an opportunity, not a compromise.';

function ProfileView({ visibility, user, profile, onProfileSaved }: { visibility: VisibilitySettings; user: AuthUser | null; profile: ProfileData | null; onProfileSaved: (profile: ProfileData) => void }) {
  const [editing, setEditing] = useState(false);
  const [story, setStory] = useState(profile?.about ?? '');
  useEffect(() => { setStory(profile?.about ?? ''); }, [profile?.about]);
  const displayName = user?.fullName ?? 'Priya Sharma';
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
  return <div className="view-body profile-view"><div className="profile-cover"><div className="profile-cover-pattern" /><div className="profile-cover-content"><Avatar initials={user ? initialsOf(user.fullName) : 'PS'} tone="navy" large /><div><span className="profile-id">{memberId} · <VerifiedBadge label={profile?.verified_at ? 'Identity verified' : user ? 'Verification pending' : 'Mobile verified'} /></span><h2>{displayName}</h2><p>{roleLine}</p><p className="match-city"><span className="city-pin">⌖</span> {cityLine}</p></div><button className="button button--light button--small" onClick={toggleEditing}>{editing ? 'Done editing' : 'Edit profile'} <Icon name="arrow" size={14} /></button></div></div><div className="profile-grid"><div className="profile-main"><div className="profile-card"><div className="card-heading"><div><span className="eyebrow">Your story</span><h3>A little more than a designation</h3></div><span className="edit-label">{editing ? 'Editing' : 'Visible to matches'}</span></div>{editing ? <textarea className="profile-textarea" value={story} onChange={(event) => setStory(event.target.value)} placeholder="Tell your match about your life beyond the designation…" /> : <p className="profile-story">{shownStory}</p>}<div className="story-tags"><span>Family-minded</span><span>Curious</span><span>Weekend explorer</span></div></div><div className="profile-card"><div className="card-heading"><div><span className="eyebrow">Career compatibility</span><h3>What you want your match to know</h3></div><span className="signal-badge"><Icon name="spark" size={13} /> Strong signal</span></div><div className="career-rows"><div><span>Preferred geography</span><strong>{profile?.preferred_hubs ?? 'Delhi NCR'}</strong></div><div><span>Posting outlook</span><strong>{profile?.posting_outlook ?? 'Prefer stability in NCR'}</strong></div><div><span>Service</span><strong>{profile?.service ?? 'CSS · Group B'}</strong></div>{visibility.ministry && <div><span>Ministry</span><strong>{profile?.ministry ?? 'Ministry of Personnel, Public Grievances & Pensions'}</strong></div>}{visibility.organisation && <div><span>Department / organisation</span><strong>{profile?.organisation ?? 'Department of Personnel & Training (DoPT)'}</strong></div>}<div><span>Work rhythm</span><strong>Mostly weekdays</strong></div></div></div></div><aside className="profile-side"><div className="profile-card completion-card--side"><div className="completion-head"><span>Profile strength</span><strong>72%</strong></div><div className="progress-track"><span style={{ width: '72%' }} /></div><ul className="profile-todos"><li className="done"><Icon name="check" size={14} /> Mobile verified</li><li className="done"><Icon name="check" size={14} /> NCR base added</li><li><Icon name="clock" size={14} /> Add service proof</li><li><Icon name="clock" size={14} /> Add a profile photo</li></ul></div><div className="profile-card trust-card"><Icon name="shield" size={20} /><h3>Trust centre</h3><p>Verification details stay private. Only the badge is visible on your profile.</p><button className="button button--text button--small">Open trust centre <Icon name="arrow" size={14} /></button></div></aside></div></div>;
}

function InboxView() {
  const [selected, setSelected] = useState(0);
  const conversations = [{ initials: 'AS', tone: 'rose', name: 'Aditi S.', role: 'Section Officer · CSS', text: 'I also think a shared NCR base…', time: '10:42 AM', unread: true }, { initials: 'NM', tone: 'sand', name: 'Nisha M.', role: 'Steno Grade B · CSSS', text: 'Your note about old films made me smile.', time: 'Yesterday', unread: false }, { initials: 'RK', tone: 'sage', name: 'Rohan K.', role: 'Assistant · DANICS', text: 'Sent you an interest', time: 'Tue', unread: false }];
  return <div className="view-body inbox-view"><div className="inbox-list"><div className="inbox-list-head"><span>Messages <strong>2</strong></span><button className="icon-button"><Icon name="search" size={17} /></button></div>{conversations.map((c, i) => <button key={c.name} className={`conversation ${selected === i ? 'conversation--selected' : ''}`} onClick={() => setSelected(i)}><Avatar initials={c.initials} tone={c.tone} /><span><strong>{c.name}</strong><small>{c.role}</small><em>{c.text}</em></span><time>{c.time}</time>{c.unread && <i className="conversation-unread" />}</button>)}</div><div className="chat-panel"><div className="chat-head"><Avatar initials={conversations[selected].initials} tone={conversations[selected].tone} /><div><strong>{conversations[selected].name}</strong><small><span className="online-dot" /> Safe chat · Contact details hidden</small></div><button className="icon-button"><Icon name="shield" size={18} /></button></div><div className="chat-context"><Icon name="spark" size={15} /><span><strong>94% career alignment</strong> · Both prefer a stable NCR posting</span></div><div className="chat-messages"><div className="day-divider"><span>Today</span></div><div className="message message--them">Hi Priya, I liked what you wrote about a shared NCR life. <time>10:38 AM</time></div><div className="message message--me">Thank you, Aditi. It’s a big part of how I think about a partnership. <time>10:41 AM</time></div><div className="message message--them">I also think a shared NCR base can give both people room to do meaningful work. <time>10:42 AM</time></div></div><div className="chat-compose"><input placeholder="Write a thoughtful message…" aria-label="Write a message" /><button aria-label="Send message"><Icon name="arrow" size={17} /></button></div><p className="chat-note"><Icon name="lock" size={12} /> Your conversation is private and contact details stay hidden.</p></div></div>;
}

function SettingsView({ settings, onToggle }: { settings: VisibilitySettings; onToggle: (key: keyof VisibilitySettings) => void }) {
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
  return <div className="view-body settings-view"><div className="settings-intro"><div className="privacy-large-icon"><Icon name="lock" size={28} /></div><div><h2>Privacy that follows your pace</h2><p>Choose separately whether your Ministry and Department/Organisation appear on your profile. Your service remains visible as a required trust signal.</p></div><span className="settings-saved"><Icon name="check" size={14} /> Saved</span></div><div className="settings-grid"><div className="settings-card"><div className="card-heading"><div><span className="eyebrow">Visibility</span><h3>Choose what feels comfortable</h3></div></div>{rows.map((row) => <div className="setting-row" key={row.key}><span className="setting-symbol"><Icon name={row.key === 'contact' ? 'lock' : row.key === 'viewed' || row.key === 'photo' ? 'user' : row.key === 'ministry' || row.key === 'organisation' ? 'briefcase' : 'shield'} size={17} /></span><span><strong>{row.title}</strong><small>{row.desc}</small></span><button className={`toggle ${settings[row.key] ? 'toggle--on' : ''}`} aria-label={`Toggle ${row.title}`} aria-pressed={settings[row.key]} onClick={() => onToggle(row.key)}><i /></button></div>)}<div className="card-heading" style={{ marginTop: 22 }}><div><span className="eyebrow">Female profile controls</span><h3>Stay private, keep exploring</h3></div></div>{femaleRows.map((row) => <div className="setting-row" key={row.key}><span className="setting-symbol"><Icon name={row.key === 'hiddenFromSearch' ? 'lock' : 'search'} size={17} /></span><span><strong>{row.title}</strong><small>{row.desc}</small></span><button className={`toggle ${settings[row.key] ? 'toggle--on' : ''}`} aria-label={`Toggle ${row.title}`} aria-pressed={settings[row.key]} onClick={() => onToggle(row.key)}><i /></button></div>)}</div><div className="settings-card safety-rules"><div className="card-heading"><div><span className="eyebrow">Safety centre</span><h3>Small habits, real protection</h3></div><Icon name="shield" size={20} /></div><ul><li><Icon name="check" size={14} /> Never share financial details</li><li><Icon name="check" size={14} /> Keep first meetings public</li><li><Icon name="check" size={14} /> Report anything uncomfortable</li></ul><button className="button button--outline button--small">Read safety guide <Icon name="arrow" size={14} /></button></div></div></div>;
}

function AdminView() {
  const [tab, setTab] = useState<'review' | 'members' | 'reports'>('review');
  const queue = [{ initials: 'RM', tone: 'rose', name: 'Rahul M.', role: 'Assistant Section Officer · CSS', location: 'Noida · NCR', status: 'Service proof uploaded', time: '12 min ago' }, { initials: 'SK', tone: 'sage', name: 'Shreya K.', role: 'Stenographer Grade C · CSSS', location: 'Gurugram · NCR', status: 'Photo + ID uploaded', time: '38 min ago' }, { initials: 'AD', tone: 'sand', name: 'Ankit D.', role: 'Assistant · DASS', location: 'Faridabad · NCR', status: 'Mobile verified', time: '1 hr ago' }, { initials: 'PS', tone: 'blue', name: 'Poonam S.', role: 'Section Officer · CSS', location: 'Delhi · NCR', status: 'Address proof uploaded', time: '2 hrs ago' }];
  return <div className="view-body admin-view"><div className="admin-top"><div><div className="eyebrow">Trust operations</div><h2>Keep the circle considered.</h2><p>Review documentation, respond to reports, and keep every match worthy of trust.</p></div><div className="admin-date"><Icon name="clock" size={15} /> Saturday, 18 July 2026</div></div><div className="admin-stats"><div><span>Pending review</span><strong>04</strong><small>Needs attention</small></div><div><span>Verified members</span><strong>1,284</strong><small>+38 this month</small></div><div><span>Open reports</span><strong>02</strong><small>Respond today</small></div><div><span>Community health</span><strong>98%</strong><small>Excellent</small></div></div><div className="admin-tabs">{[['review','Verification queue'],['members','All members'],['reports','Reports']].map(([id, label]) => <button key={id} className={tab === id ? 'admin-tab--active' : ''} onClick={() => setTab(id as typeof tab)}>{label}{id === 'review' && <span>4</span>}</button>)}</div>{tab === 'review' && <div className="review-table"><div className="review-table-head"><span>Member</span><span>Documents</span><span>Submitted</span><span>Action</span></div>{queue.map((member) => <div className="review-row" key={member.name}><div><Avatar initials={member.initials} tone={member.tone} /><span><strong>{member.name}</strong><small>{member.role}</small><em>{member.location}</em></span></div><span className="document-status"><Icon name="shield" size={15} />{member.status}</span><time>{member.time}</time><div className="review-actions"><button className="button button--outline button--small">Review</button><button className="round-action" aria-label={`More actions for ${member.name}`}><Icon name="chevron" size={16} /></button></div></div>)}</div>}{tab === 'members' && <div className="empty-admin"><span><Icon name="users" size={28} /></span><h3>Member directory</h3><p>Search verified members, update review status, and manage visibility settings from one place.</p><button className="button button--dark button--small">Open directory <Icon name="arrow" size={14} /></button></div>}{tab === 'reports' && <div className="empty-admin"><span><Icon name="shield" size={28} /></span><h3>No urgent reports</h3><p>Two low-priority reports are in the queue. Both are within the 24-hour review window.</p><button className="button button--outline button--small">View reports <Icon name="arrow" size={14} /></button></div>}</div>;
}

function AppShell({ user, onLogout }: { user: AuthUser | null; onLogout: () => void }) {
  const [view, setView] = useState<View>('home');
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [visibility, setVisibility] = useState<VisibilitySettings>({ profile: true, photo: false, contact: false, viewed: false, ministry: true, organisation: true, hiddenFromSearch: false, searchWhileHidden: true });
  const toggleVisibility = (key: keyof VisibilitySettings) => setVisibility((current) => ({ ...current, [key]: !current[key] }));
  useEffect(() => { if (!user) return; fetch('/api/profile').then(async (response) => { if (!response.ok) return; const data = await response.json().catch(() => null) as { profile?: ProfileData } | null; if (data?.profile) setProfile(data.profile); }).catch(() => undefined); }, [user]);
  const displayName = user?.fullName ?? 'Priya S.';
  const initials = user ? initialsOf(user.fullName) : 'PS';
  const showAdmin = !user || user.role === 'admin';
  return <div className="app-shell"><Sidebar view={view} setView={setView} onAdmin={() => setView('admin')} displayName={displayName} initials={initials} showAdmin={showAdmin} /><div className="app-main"><Topbar view={view} onLogout={onLogout} firstName={firstNameOf(displayName)} initials={initials} />{view === 'home' && <HomeView setView={setView} onOpenProfile={() => setProfileOpen(true)} />}{view === 'discover' && <DiscoverView onOpenProfile={() => setProfileOpen(true)} hiddenFromSearch={visibility.hiddenFromSearch} searchWhileHidden={visibility.searchWhileHidden} />}{view === 'profile' && <ProfileView visibility={visibility} user={user} profile={profile} onProfileSaved={setProfile} />}{view === 'inbox' && <InboxView />}{view === 'settings' && <SettingsView settings={visibility} onToggle={toggleVisibility} />}{view === 'admin' && <AdminView />}</div>{profileOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setProfileOpen(false)}><div className="modal quick-profile" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}><button className="icon-button modal-close" aria-label="Close" onClick={() => setProfileOpen(false)}><Icon name="x" /></button><div className="quick-profile-head"><Avatar initials="AS" tone="rose" large /><div><VerifiedBadge /><h2>Aditi S.</h2><p>Section Officer · CSS</p><span className="match-city"><span className="city-pin">⌖</span> New Delhi · NCR</span></div><div className="quick-score"><strong>96%</strong><small>aligned</small></div></div><div className="quick-signal"><Icon name="spark" size={16} /><span><strong>Strong career alignment</strong><small>Both prefer to build a shared home in the NCR.</small></span></div><p className="profile-story">I value a calm, curious life and believe two careers can make a home more interesting when the geography works for both.</p><div className="quick-tags"><span>Stay in NCR</span><span>Family-minded</span><span>Weekend explorer</span></div><div className="quick-actions"><button className="button button--primary button--full">Send interest <Icon name="heart" size={16} /></button><button className="button button--outline button--full" onClick={() => setProfileOpen(false)}>Maybe later</button></div><p className="microcopy"><Icon name="lock" size={12} /> Contact details remain hidden until interest is mutual.</p></div></div>}</div>;
}

export default function Page() {
  const [mode, setMode] = useState<'landing' | 'app'>('landing');
  const [authOpen, setAuthOpen] = useState(false);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => { fetch('/api/auth/me').then(async (response) => { if (!response.ok) return; const data = await response.json().catch(() => null) as { user?: AuthUser | null } | null; if (data?.user) { setUser(data.user); setMode('app'); } }).catch(() => undefined); }, []);
  const openAuth = (nextMode: 'login' | 'signup') => { setAuthMode(nextMode); setAuthOpen(true); };
  const enterDemo = () => { setAuthOpen(false); setOnboardOpen(false); setUser(null); setMode('app'); };
  const handleAuthenticated = (nextUser: AuthUser, completedMode: 'login' | 'signup') => { setUser(nextUser); setAuthOpen(false); if (completedMode === 'signup') setOnboardOpen(true); else setMode('app'); };
  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined); setUser(null); setMode('landing'); };
  if (mode === 'app') return <AppShell user={user} onLogout={logout} />;
  return <><Landing onAuth={() => openAuth('login')} onOnboard={() => openAuth('signup')} onDemo={enterDemo} />{authOpen && <AuthModal initialMode={authMode} onClose={() => setAuthOpen(false)} onAuthenticated={handleAuthenticated} />}{onboardOpen && <OnboardModal onClose={() => setOnboardOpen(false)} onDone={() => { setOnboardOpen(false); setMode('app'); }} />}</>;
}
