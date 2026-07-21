import type { Metadata } from 'next';
import { DocPage, DocIcon } from '../docShell';

export const metadata: Metadata = {
  title: 'How verification works — NCRSarkariShaadi',
  description: 'How NCRSarkariShaadi verifies government professionals: mobile, government ID, human review, and clear badges. Documents are reviewed privately and never displayed.',
};

const steps: { icon: string; label: string }[] = [
  { icon: 'mail', label: 'Mobile OTP' },
  { icon: 'briefcase', label: 'Government ID' },
  { icon: 'user', label: 'Human review' },
  { icon: 'check', label: 'Photo match' },
  { icon: 'shield', label: 'Live badge' },
  { icon: 'clock', label: 'Ongoing watch' },
];

export default function VerificationPage() {
  return <DocPage eyebrow="Trust as a system, not a badge" title="How verification works" lede="In a community of public servants, a fake profile is a reputational risk. So verification here is a pipeline, not a tick-mark — and your documents are never shown to anyone.">
    <div className="doc-section">
      <h2>The pipeline</h2>
      <div className="pipeline">{steps.map((s, i) => <div className="pipeline-step" key={s.label}><span className="pipeline-node"><DocIcon name={s.icon} size={18} /></span><small>{s.label}</small>{i < steps.length - 1 && <i className="pipeline-line" aria-hidden />}</div>)}</div>
    </div>

    <div className="doc-section">
      <h2>What we check</h2>
      <ul className="doc-list">
        <li><DocIcon name="check" /> <span><strong>Mobile number</strong> — confirmed by OTP before a profile goes live.</span></li>
        <li><DocIcon name="check" /> <span><strong>Government employment</strong> — a service ID card, joining letter, or equivalent proof, reviewed by a person on our team.</span></li>
        <li><DocIcon name="check" /> <span><strong>Identity</strong> — a government photo ID (Aadhaar, PAN, driving licence, or passport) to confirm you are who you say.</span></li>
        <li><DocIcon name="check" /> <span><strong>Photo match</strong> — optional but encouraged, so your profile photo matches your ID.</span></li>
      </ul>
    </div>

    <div className="doc-section">
      <h2>What stays private</h2>
      <p>Your documents are used only to verify you. They are <strong>never displayed on your profile</strong> and never shared with other members. Everyone else sees a simple badge — not the paperwork behind it.</p>
      <div className="doc-callout"><strong>What a badge means:</strong> a verified badge tells other members that the information on a profile has been reviewed by a human. It is a strong signal of good faith — but always communicate carefully and make your own judgement before meeting anyone.</div>
    </div>

    <div className="doc-section">
      <h2>Honest status</h2>
      <p>Verification is currently completed manually by our team. Secure in-app document upload — with encrypted, time-limited storage and automatic deletion after review — is being rolled out. Until then, no document you send is ever made public, and only the resulting badge is shown.</p>
      <a className="button button--primary" href="/">Create your free profile <DocIcon name="check" size={15} /></a>
    </div>
  </DocPage>;
}
