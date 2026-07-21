import type { ReactNode } from 'react';

// Shared chrome for the static content pages (verification / privacy / safety / faq).
// Server components — no client JS. Icons inlined; styling from globals.css.

const paths: Record<string, ReactNode> = {
  shield: <><path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z" /><path d="m8.8 12 2.1 2.1 4.5-4.5" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M4 20c.8-3.4 3.4-5 8-5s7.2 1.6 8 5" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  spark: <path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" />,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
};

export function DocIcon({ name, size = 16 }: { name: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>;
}

function Brand() {
  return <a className="logo" href="/"><span className="logo-mark">N</span><span>NCR<strong>Sarkari</strong>Shaadi</span></a>;
}

export function DocPage({ eyebrow, title, lede, children }: { eyebrow: string; title: string; lede: string; children: ReactNode }) {
  return <main className="landing doc-page">
    <nav className="landing-nav shell"><Brand /><div className="nav-actions"><a className="button button--outline button--small" href="/">← Back to home</a></div></nav>
    <article className="doc shell">
      <div className="doc-head"><div className="eyebrow">{eyebrow}</div><h1 className="doc-title">{title}</h1><p className="doc-lede">{lede}</p></div>
      {children}
    </article>
    <footer className="landing-footer shell"><Brand /><div className="footer-note">Independent platform for NCR government professionals · Not affiliated with any government department</div><div className="footer-links"><a href="/verification">Verification</a><a href="/privacy">Privacy</a><a href="/safety">Safety</a><a href="/faq">FAQ</a></div></footer>
  </main>;
}
