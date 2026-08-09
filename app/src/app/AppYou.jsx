import { Link } from 'react-router-dom';
import { getPanelHtml } from '../data/screens';

const twinHtml = getPanelHtml('5a', 2); // "Your twin" summary panel
const emergencyHtml = getPanelHtml('2a', 1); // "Emergency access" panel

export default function AppYou() {
  return (
    <div style={{ background: '#fff', fontFamily: 'Archivo, sans-serif', color: '#201e1d' }}>
      <div dangerouslySetInnerHTML={{ __html: twinHtml }} />

      <div
        style={{
          padding: '10px 20px',
          background: '#201e1d',
          color: '#fff',
          font: '600 10px Archivo, sans-serif',
          letterSpacing: '.12em',
        }}
      >
        FAMILY & EMERGENCY ACCESS
      </div>
      <div dangerouslySetInnerHTML={{ __html: emergencyHtml }} />

      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ font: '600 10px Archivo, sans-serif', letterSpacing: '.12em', color: '#8a8785' }}>
          OTHER VIEWS
        </div>
        <Link to="/screen/4c" className="btn btn-secondary btn-block" style={{ justifyContent: 'flex-start' }}>
          ADVISOR CO-PILOT VIEW
        </Link>
        <Link to="/screen/6e" className="btn btn-secondary btn-block" style={{ justifyContent: 'flex-start' }}>
          ENTERPRISE CONSOLE
        </Link>
        <Link to="/gallery" className="btn btn-ghost btn-block" style={{ justifyContent: 'flex-start' }}>
          ALL 27 DESIGN SCREENS →
        </Link>
      </div>
    </div>
  );
}
