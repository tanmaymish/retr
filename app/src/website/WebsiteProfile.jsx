import DvCard from '../components/DvCard';
import PageHeader from './PageHeader';
import { getPanelHtml } from '../data/screens';
import useDocumentTitle from '../hooks/useDocumentTitle';

const twinHtml = getPanelHtml('5a', 2); // "Your twin" summary panel
const emergencyHtml = getPanelHtml('2a', 1); // "Emergency access" panel

export default function WebsiteProfile() {
  useDocumentTitle('Profile');
  return (
    <div>
      <PageHeader
        kicker="YOU"
        title="Profile & family"
        description="What the engine understands about your money, and who can reach it if you can't."
      />
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <DvCard width={420}>
          <div dangerouslySetInnerHTML={{ __html: twinHtml }} />
        </DvCard>
        <DvCard width={420}>
          <div dangerouslySetInnerHTML={{ __html: emergencyHtml }} />
        </DvCard>
      </div>
    </div>
  );
}
