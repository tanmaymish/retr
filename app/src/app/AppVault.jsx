import { getPanelHtml } from '../data/screens';
import useDocumentTitle from '../hooks/useDocumentTitle';

const html = getPanelHtml('2a', 2); // "Vault" panel

export default function AppVault() {
  useDocumentTitle('Vault');
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
