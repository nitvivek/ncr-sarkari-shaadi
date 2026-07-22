import type { Metadata } from 'next';
import { DocPage, DocIcon } from '../docShell';

export const metadata: Metadata = {
  title: 'Government Life Insights — NCRSarkariShaadi',
  description: 'Practical, honest notes on building a life in the Delhi NCR as a government professional — where to live, planning two incomes, and conversations worth having early.',
};

const articles: { slug: string; title: string; blurb: string; icon: string }[] = [
  { slug: 'where-to-live-in-ncr', title: 'Choosing where to live in Delhi NCR', blurb: 'Dwarka, Noida, Gurugram, Ghaziabad, Faridabad — commute, schools, quarters and cost, weighed for two careers.', icon: 'home' },
  { slug: 'two-government-incomes', title: 'Two government incomes: planning together', blurb: 'CGHS, LTC, NPS and pensions, and home loans — how a dual-government household can plan with confidence.', icon: 'briefcase' },
  { slug: 'talk-about-early', title: 'Marrying within the service: what to discuss early', blurb: 'Postings, transfers, family expectations, and the practical conversations worth having before you commit.', icon: 'spark' },
];

export default function InsightsPage() {
  return <DocPage eyebrow="Useful before marriage" title="Government Life Insights" lede="Practical, honest notes on building a life in the Delhi NCR — the things two serving professionals actually plan around.">
    <div className="insight-grid">{articles.map((a) => <a className="insight-card" href={`/insights/${a.slug}`} key={a.slug}><span className="insight-icon"><DocIcon name={a.icon} size={20} /></span><strong>{a.title}</strong><small>{a.blurb}</small><span className="insight-more">Read <DocIcon name="arrow" size={13} /></span></a>)}</div>
    <div className="doc-callout">These notes are general and educational. Rules for schemes like CGHS, LTC and NPS change over time — always confirm current eligibility and circulars before acting.</div>
  </DocPage>;
}
