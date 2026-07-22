import type { Metadata } from 'next';
import { DocPage, DocIcon } from '../../docShell';

export const metadata: Metadata = {
  title: 'Two government incomes: planning together — NCRSarkariShaadi',
  description: 'How a dual-government household in Delhi NCR can plan around CGHS, LTC, NPS and pensions, and home loans — general, honest guidance.',
};

export default function Article() {
  return <DocPage eyebrow="Government Life Insights" title="Two government incomes: planning together" lede="Two stable, inflation-linked salaries are a rare foundation. Here’s how dual-government couples typically make the most of the benefits ecosystem — treat this as a starting map, not tax advice.">
    <div className="doc-section"><h2>Medical: one seamless cover</h2><p>Where both partners fall under CGHS (or an equivalent scheme), family medical cover becomes comprehensive rather than pieced together from two different employers. It’s worth understanding whose scheme covers dependants and parents, and how empanelled hospitals near your NCR base work.</p></div>
    <div className="doc-section"><h2>Housing: HRA, quarters, and loans</h2><ul className="doc-list"><li><DocIcon name="check" /> Two predictable incomes make banks view you favourably for a home loan in Delhi’s expensive market.</li><li><DocIcon name="check" /> Government quarters or HRA can materially change the maths of buying vs renting — compare honestly for your posting.</li><li><DocIcon name="check" /> Keep one income’s worth of EMI headroom so a single disruption never destabilises the household.</li></ul></div>
    <div className="doc-section"><h2>Travel: LTC</h2><p>Leave Travel Concession, used well, funds family travel that would otherwise come out of savings. Rules on block years, home-town vs anywhere-in-India, and eligibility change — confirm the current circulars before you plan.</p></div>
    <div className="doc-section"><h2>Retirement: two streams</h2><p>Most newer entrants are under NPS; some older cadres retain pension. Either way, a dual-government couple usually retires with two structured streams plus accumulated savings — and can often spend retirement in the same city without one partner chasing a post-retirement job to stay co-located.</p></div>
    <div className="doc-callout">Every cadre and scheme differs, and rules evolve. Use this as a checklist of conversations to have — then verify specifics with your department and a qualified advisor.</div>
    <div className="doc-section"><a className="button button--primary" href="/insights">More insights <DocIcon name="arrow" size={15} /></a></div>
  </DocPage>;
}
