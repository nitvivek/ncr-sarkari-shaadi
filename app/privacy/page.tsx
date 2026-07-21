import type { Metadata } from 'next';
import { DocPage, DocIcon } from '../docShell';

export const metadata: Metadata = {
  title: 'Privacy controls — NCRSarkariShaadi',
  description: 'How privacy works on NCRSarkariShaadi: hidden-profile mode, photo-on-request, contact masking with mutual consent, and selective disclosure. You decide who sees what, and when.',
};

export default function PrivacyPage() {
  return <DocPage eyebrow="Your privacy, your pace" title="Privacy controls" lede="For anyone in a visible government role — and especially for women — anonymity is a necessity, not an add-on. Every control here is granular and reversible. You decide who sees what, and when.">
    <div className="doc-section">
      <h2>Profile visibility</h2>
      <p>Your detailed profile is visible to matches by default — not the whole platform. You can go further and switch on <strong>Hidden-profile mode</strong>: you disappear from all search and recommendations, yet you can still browse, shortlist and send interests. Your profile reappears only to members you approve, and no one is notified when you hide or unhide.</p>
    </div>

    <div className="doc-section">
      <h2>Photos, on your terms</h2>
      <ul className="doc-list">
        <li><DocIcon name="eye" /> <span><strong>On request</strong> — your photo stays private; each viewer must ask, and you approve one at a time.</span></li>
        <li><DocIcon name="user" /> <span><strong>Visible to verified members</strong> — if you prefer to be seen openly.</span></li>
        <li><DocIcon name="lock" /> <span><strong>Revocable</strong> — you can withdraw photo access at any time, even after granting it.</span></li>
      </ul>
    </div>

    <div className="doc-section">
      <h2>Contact stays masked</h2>
      <p>Your phone number and email are <strong>never shown</strong> on your profile and never returned by search. They are revealed to another member only when <strong>both of you</strong> agree to share — and either side can stop sharing afterwards. Receiving an interest, or even chatting, never exposes your number.</p>
    </div>

    <div className="doc-section">
      <h2>Selective disclosure</h2>
      <p>You reveal information in stages: basic details first, more after you accept an interest, photos on approval, and contact only when it feels right. Trust builds step by step — you are never asked to disclose everything at once.</p>
      <div className="doc-callout"><strong>What we never do:</strong> we never sell member data, never display your verification documents, and never put your contact details on a public profile.</div>
      <a className="button button--primary" href="/">Create a private profile <DocIcon name="lock" size={15} /></a>
    </div>
  </DocPage>;
}
