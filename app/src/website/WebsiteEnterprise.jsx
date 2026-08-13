import DvCard from '../components/DvCard';
import PageHeader from './PageHeader';
import { getPanelHtml } from '../data/screens';
import useDocumentTitle from '../hooks/useDocumentTitle';

const html = getPanelHtml('6e', 0); // Enterprise console panel

export default function WebsiteEnterprise() {
  useDocumentTitle('Enterprise console');
  return (
    <div>
      <PageHeader
        kicker="ADMIN"
        title="Enterprise console"
        description="Scoring weights, roles, audit — commission is locked at 0% at the platform level and a tenant cannot raise it."
      />
      <DvCard width={880}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </DvCard>
    </div>
  );
}
