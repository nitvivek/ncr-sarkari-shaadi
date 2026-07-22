import type { Metadata } from 'next';
import { DocPage, DocIcon } from '../../docShell';

export const metadata: Metadata = {
  title: 'Marrying within the service: what to discuss early — NCRSarkariShaadi',
  description: 'The practical conversations two government professionals in Delhi NCR are wise to have before marriage — postings, transfers, family, and expectations.',
};

export default function Article() {
  return <DocPage eyebrow="Government Life Insights" title="Marrying within the service: what to discuss early" lede="Compatibility for serving professionals is as much about logistics as chemistry. A few honest conversations early can prevent a lot of friction later.">
    <div className="doc-section"><h2>Postings and transfer outlook</h2><p>Is one of you in a transferable All-India service and the other on a permanent Delhi posting? Are you both committed to staying in the NCR, or open to movement? Being explicit here avoids the classic strain of one career quietly being subordinated to the other.</p></div>
    <div className="doc-section"><h2>The everyday calendar</h2><p>Election duty, VIP visits, audits, parliamentary work, month-end pressure — service life has non-negotiable evenings and weekends. Two people who understand this instinctively argue about it far less. Talk about how you’ll handle the busy stretches together.</p></div>
    <div className="doc-section"><h2>Family and parents</h2><ul className="doc-list"><li><DocIcon name="check" /> Where do each of your parents live, and what care responsibilities might come?</li><li><DocIcon name="check" /> How do both families view a dual-career household, and shared domestic work?</li><li><DocIcon name="check" /> What does “settling down” mean to each of you — city, home, timeline?</li></ul></div>
    <div className="doc-section"><h2>Money and independence</h2><p>Two incomes bring independence and shared decisions from a position of equality. Agree early on how you’ll budget, save, and support each other’s careers — including who steps back, if ever, and when.</p></div>
    <div className="doc-callout">None of this is about testing each other. It’s about starting a partnership with the practical realities in the open — the same realities this platform is built to match you on.</div>
    <div className="doc-section"><a className="button button--primary" href="/">Create your free profile <DocIcon name="arrow" size={15} /></a></div>
  </DocPage>;
}
