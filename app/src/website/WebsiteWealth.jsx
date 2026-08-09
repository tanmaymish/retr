import DvCard from '../components/DvCard';
import PageHeader from './PageHeader';
import { getPanelHtml } from '../data/screens';
import useDocumentTitle from '../hooks/useDocumentTitle';

const html = getPanelHtml('2a', 0); // "Wealth" panel

export default function WebsiteWealth() {
  useDocumentTitle('Wealth');
  return (
    <div>
      <PageHeader
        kicker="ASSETS"
        title="Wealth"
        description="Total net worth, by asset class, with what's missing a nominee flagged before anything else."
      />
      <DvCard width={460}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </DvCard>
    </div>
  );
}
