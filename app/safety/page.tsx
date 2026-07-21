import type { Metadata } from 'next';
import { DocPage, DocIcon } from '../docShell';

export const metadata: Metadata = {
  title: 'Staying safe — NCRSarkariShaadi',
  description: 'Safety on NCRSarkariShaadi: block and report any member, confidential human review of reports, women-first safeguards, and simple habits to protect yourself.',
};

export default function SafetyPage() {
  return <DocPage eyebrow="A considered way to connect" title="Staying safe" lede="A trusted community needs more than good intentions. These are the tools and habits that keep NCRSarkariShaadi safe — and the ones we ask you to use.">
    <div className="doc-section">
      <h2>Block and report — anytime</h2>
      <p>You can <strong>block</strong> any member instantly; a block hides both of you from each other in discovery. You can also <strong>report</strong> a profile in one step, choosing a reason. Reports enter a confidential queue reviewed by a person — not just an algorithm — and your identity as the reporter is never revealed to the member you reported.</p>
    </div>

    <div className="doc-section">
      <h2>Built with women in government in mind</h2>
      <ul className="doc-list">
        <li><DocIcon name="lock" /> <span><strong>Hidden by default</strong> — stay invisible to general browsing; appear only to members you approve.</span></li>
        <li><DocIcon name="mail" /> <span><strong>Review before contact</strong> — screen interest requests first; no unsolicited detail-sharing.</span></li>
        <li><DocIcon name="shield" /> <span><strong>Documents stay confidential</strong> — reviewed privately, never shown on your profile.</span></li>
      </ul>
    </div>

    <div className="doc-section">
      <h2>Simple habits that protect you</h2>
      <ul className="doc-list">
        <li><DocIcon name="check" /> <span>Never share financial details, OTPs, or money — no genuine match will ask.</span></li>
        <li><DocIcon name="check" /> <span>Keep first meetings in a public place, and tell a family member where you’ll be.</span></li>
        <li><DocIcon name="check" /> <span>Share your phone number only when you’re ready — the platform’s chat works without it.</span></li>
        <li><DocIcon name="check" /> <span>Report anything that feels off. It’s confidential, and it helps everyone.</span></li>
      </ul>
      <div className="doc-callout">If you ever feel unsafe or pressured, stop, block, and report. When in doubt, involve your family — this platform is built to support careful, family-aware introductions.</div>
      <a className="button button--primary" href="/">Create a profile with care <DocIcon name="shield" size={15} /></a>
    </div>
  </DocPage>;
}
