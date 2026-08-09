import { getPanelHtml } from '../data/screens';

const html = getPanelHtml('2a', 0); // "Wealth" panel

export default function AppWealth() {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
