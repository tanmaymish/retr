import AdvisorCoPilot from '../screens/AdvisorCoPilot';
import PageHeader from './PageHeader';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function WebsiteAdvisor() {
  useDocumentTitle('Advisor co-pilot');
  return (
    <div>
      <PageHeader
        kicker="ADVISOR VIEW"
        title="Advisor co-pilot"
        description="The same twin, prepared for a meeting — read-only, and every screen opened is logged and visible to the client."
      />
      <AdvisorCoPilot />
    </div>
  );
}
