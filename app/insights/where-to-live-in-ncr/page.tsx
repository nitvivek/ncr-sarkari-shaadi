import type { Metadata } from 'next';
import { DocPage, DocIcon } from '../../docShell';

export const metadata: Metadata = {
  title: 'Choosing where to live in Delhi NCR — NCRSarkariShaadi',
  description: 'A practical look at Dwarka, Noida, Gurugram, Ghaziabad and Faridabad for a dual-government household — commute, schools, government quarters and cost.',
};

export default function Article() {
  return <DocPage eyebrow="Government Life Insights" title="Choosing where to live in Delhi NCR" lede="When both careers stay in the NCR, where you live becomes a shared decision — balancing two commutes, schools, quarters and cost. Here’s how the main hubs compare.">
    <div className="doc-section"><h2>Central Delhi (R.K. Puram, Chanakyapuri, Lodhi area)</h2><p>Closest to the central secretariat and most ministries, with the strongest access to government quarters and CGHS facilities. The trade-off is cost and space — private housing here is expensive, so quarters availability often decides it.</p></div>
    <div className="doc-section"><h2>Dwarka</h2><p>A popular middle ground for central-government families: good metro connectivity to the secretariat, a dense cluster of schools and coaching, and more space per rupee than central Delhi. Commutes are manageable, and there’s a large community of serving officers.</p></div>
    <div className="doc-section"><h2>Noida & Greater Noida</h2><p>Strong for those with a UP-cadre or PSU posting, or one partner working in the tech corridor. Excellent schools and newer housing; the Aqua and Blue lines help, but a secretariat commute can be long in peak hours.</p></div>
    <div className="doc-section"><h2>Gurugram</h2><p>Best when at least one career leans corporate or one partner values proximity to Cyber City. Premium housing and schools, but government-quarter options are limited and cost of living is high.</p></div>
    <div className="doc-section"><h2>Ghaziabad & Faridabad</h2><p>The value picks. Noticeably lower cost of living and rents, with improving metro links. The commute to central Delhi is the main consideration — workable for many, tiring for some.</p></div>
    <div className="doc-callout"><strong>The dual-career rule of thumb:</strong> pick a base that keeps <em>both</em> commutes reasonable rather than optimising one. A slightly longer commute for both often beats a very short one for one and a punishing one for the other. Try the Neighbourhood Compatibility tool on the home page to compare.</div>
    <div className="doc-section"><a className="button button--primary" href="/insights">More insights <DocIcon name="arrow" size={15} /></a></div>
  </DocPage>;
}
