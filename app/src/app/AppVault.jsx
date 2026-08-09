import { getPanelHtml } from '../data/screens';

const html = getPanelHtml('2a', 2); // "Vault" panel

export default function AppVault() {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
