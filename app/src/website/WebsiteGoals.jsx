import DvCard from '../components/DvCard';
import PageHeader from './PageHeader';
import { getPanelHtml } from '../data/screens';
import useDocumentTitle from '../hooks/useDocumentTitle';

const html = getPanelHtml('5d', 0); // "Your goals" panel — funding order & conflict

export default function WebsiteGoals() {
  useDocumentTitle('Goals');
  return (
    <div>
      <PageHeader
        kicker="GOALS"
        title="Funding order"
        description="Goals are funded top-down from one surplus. The order is your call — the consequence of that order is ours to state."
      />
      <DvCard width={460}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </DvCard>
    </div>
  );
}
