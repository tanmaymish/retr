import { getPanelHtml } from '../data/screens';
import useDocumentTitle from '../hooks/useDocumentTitle';

const html = getPanelHtml('5d', 0); // "Your goals" panel — funding order & conflict

export default function AppGoals() {
  useDocumentTitle('Goals');
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
