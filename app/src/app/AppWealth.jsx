import { getPanelHtml } from '../data/screens';
import useDocumentTitle from '../hooks/useDocumentTitle';

const html = getPanelHtml('2a', 0); // "Wealth" panel

export default function AppWealth() {
  useDocumentTitle('Wealth');
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
