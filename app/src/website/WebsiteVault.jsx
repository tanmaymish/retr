import DvCard from '../components/DvCard';
import PageHeader from './PageHeader';
import { getPanelHtml } from '../data/screens';
import useDocumentTitle from '../hooks/useDocumentTitle';

const html = getPanelHtml('2a', 2); // "Vault" panel

export default function WebsiteVault() {
  useDocumentTitle('Vault');
  return (
    <div>
      <PageHeader
        kicker="DOCUMENTS"
        title="Vault"
        description="Search reads inside the documents, so a policy number finds the page it sits on."
      />
      <DvCard width={460}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </DvCard>
    </div>
  );
}
