import { getPanelHtml } from '../data/screens';

const html = getPanelHtml('5d', 0); // "Your goals" panel — funding order & conflict

export default function AppGoals() {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
