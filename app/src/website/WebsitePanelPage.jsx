import DvCard from '../components/DvCard';
import PageHeader from './PageHeader';
import { getPanelHtml } from '../data/screens';
import useDocumentTitle from '../hooks/useDocumentTitle';

// Generic page for reusing a wireframe panel's markup directly as a website
// page — same content, just a page header instead of phone/device chrome.
export default function WebsitePanelPage({ kicker, title, description, screenId, panelIndices = [0], width = 460 }) {
  useDocumentTitle(title);
  return (
    <div>
      <PageHeader kicker={kicker} title={title} description={description} />
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {panelIndices.map((i) => (
          <DvCard key={i} width={width}>
            <div dangerouslySetInnerHTML={{ __html: getPanelHtml(screenId, i) }} />
          </DvCard>
        ))}
      </div>
    </div>
  );
}
