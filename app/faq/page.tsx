import type { Metadata } from 'next';
import { DocPage } from '../docShell';

export const metadata: Metadata = {
  title: 'FAQ — NCRSarkariShaadi',
  description: 'Answers about NCRSarkariShaadi: who can join, whether it is really free, how privacy and verification work, and family-managed profiles.',
};

const faqs: { q: string; a: string }[] = [
  { q: 'Is it really free?', a: 'Yes — completely. Creating a profile and two-way messaging are free for everyone, with no premium tier to unlock conversations, view a number, or be taken seriously. There is no “men pay, women free” divide.' },
  { q: 'Who can join?', a: 'Serving (and retired) government employees based in the Delhi NCR — across cadres such as CSS, CSSS, RBSS, AFHQCS, IFS/MEA, Lok Sabha and Rajya Sabha secretariats, DANICS, DANIPS, DDA, DASS, GNCTDSS, MCD, NDMC, DTC, DMRC, DTL, and more. If your cadre isn’t listed, choose “Other”.' },
  { q: 'What counts as Delhi NCR?', a: 'The full official National Capital Region — Delhi, Gurugram, Noida, Greater Noida, Ghaziabad, Faridabad and the wider NCR districts across Haryana, Uttar Pradesh and Rajasthan.' },
  { q: 'Are my photo and contact details private?', a: 'Always, by default. Your phone and email are never shown and never revealed until both members agree to share. Your photo stays on request — each viewer must ask, and you approve one at a time. See the Privacy page for details.' },
  { q: 'How do you verify members?', a: 'Through a multi-step pipeline: mobile OTP, a human review of your government service proof, and an identity check — resulting in a badge. Your documents are never displayed to anyone. See the Verification page.' },
  { q: 'Can my family create or manage a profile?', a: 'Yes. Family-managed profiles are welcome — a parent or sibling can create and look after a profile with the same privacy and verification standards. A dedicated family view is on the way.' },
  { q: 'Can I hide my profile while I look around?', a: 'Yes. Hidden-profile mode removes you from search and recommendations while still letting you browse, shortlist and send interests. You reappear only to members you approve, and no one is notified.' },
  { q: 'Is this an official government platform?', a: 'No. NCRSarkariShaadi is an independent platform for government professionals. It is not affiliated with, endorsed by, or operated by any government ministry, department, or authority.' },
];

export default function FaqPage() {
  return <DocPage eyebrow="Good questions" title="Frequently asked" lede="The things people ask most before they join. Still unsure about something? The Privacy, Safety and Verification pages go deeper.">
    <div className="faq-list">
      {faqs.map((f) => <details className="faq-item" key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
    </div>
    <div className="doc-section"><a className="button button--primary" href="/">Create your free profile →</a></div>
  </DocPage>;
}
