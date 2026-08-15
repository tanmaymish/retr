import { Card, Icon } from '../components/ui';
import Leads from '../app/Leads';

/* The same base the API client uses, so an app served from a different origin
   than its API still downloads from the right place. */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

/**
 * The enquiry inbox, inside the portal.
 *
 * The table itself is the one that already existed behind the vault — the same
 * component, not a copy, so the two can never drift apart. What this adds is
 * the export, because at some point everything needs to leave for a CRM and
 * the honest interim answer is a file the founders can open.
 */
export default function AdminLeads() {
  return (
    <div className="stack stack-md enter">
      <Card flat className="row-between wrap" style={{ gap: 14 }}>
        <span className="stack" style={{ gap: 3 }}>
          <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 15 }}>Take it with you</strong>
          <span className="small muted">
            Every enquiry as a spreadsheet — names, contact details, source and status.
          </span>
        </span>
        {/* A real anchor, not a fetch: the browser's own download handling
            deals with the file, the filename from Content-Disposition and the
            save dialog, and it carries the session cookie as any request does.
            `Button` always renders a <button>, so this is written out. */}
        <a href={`${API_BASE}/api/admin/leads.csv`} className="btn btn-sm btn-secondary">
          <Icon name="download" size={18} />
          Download CSV
        </a>
      </Card>

      <Leads />
    </div>
  );
}
