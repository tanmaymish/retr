import PageHeader from './PageHeader';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { UploadCloud, Folder, FileText, Lock, Settings, Users, Download } from 'lucide-react';

const VAULT_CATEGORIES = [
  {
    title: 'Protection & Insurance',
    type: 'folder',
    files: [
      { name: 'Max Life Smart Secure Plus.pdf', size: '2.4 MB', date: '12 Oct 2025' },
      { name: 'HDFC Ergo Optima Restore.pdf', size: '1.1 MB', date: '04 Jun 2025' }
    ]
  },
  {
    title: 'Tax & Compliance',
    type: 'folder',
    files: [
      { name: 'ITR-V Acknowledgement FY24-25.pdf', size: '480 KB', date: '22 Jul 2025' },
      { name: 'Form 16 Part A & B.pdf', size: '1.8 MB', date: '10 Jun 2025' }
    ]
  },
  {
    title: 'Estate Planning',
    type: 'locked',
    files: [
      { name: 'Registered Will & Testament.pdf', size: 'Encrypted', date: '01 Jan 2026' }
    ]
  }
];

export default function WebsiteDocuments() {
  useDocumentTitle('Vault');
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <PageHeader
          kicker="VAULT"
          title="Document Vault"
          description="A secure, encrypted repository for all your critical financial paperwork."
        />
        <button className="btn btn-primary" style={{ marginTop: '16px' }}><UploadCloud size={16} style={{ marginRight: '8px' }} /> Upload File</button>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {VAULT_CATEGORIES.map(category => (
              <div key={category.title} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 24px', background: 'color-mix(in srgb, var(--color-surface) 50%, transparent)', borderBottom: '1px solid var(--color-divider-subtle)' }}>
                    {category.type === 'locked' ? <Lock size={18} color="var(--color-accent)" /> : <Folder size={18} color="var(--color-primary)" />}
                    <h3 style={{ margin: 0, fontSize: '15px' }}>{category.title}</h3>
                 </div>
                 
                 <div>
                    {category.files.map((file, i) => (
                      <div key={file.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: i < category.files.length - 1 ? '1px solid var(--color-divider-subtle)' : 'none' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                           <FileText size={16} color="color-mix(in srgb, var(--color-text) 40%, transparent)" />
                           <div>
                             <div style={{ fontSize: '14px', fontWeight: 600 }}>{file.name}</div>
                             <div style={{ fontSize: '12px', color: 'color-mix(in srgb, var(--color-text) 50%, transparent)', marginTop: '4px' }}>Added {file.date}</div>
                           </div>
                         </div>
                         
                         <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                           <div style={{ fontSize: '12px', color: 'color-mix(in srgb, var(--color-text) 50%, transparent)' }}>{file.size}</div>
                           <button className="btn-icon btn-ghost"><Download size={14} /></button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            ))}
         </div>

         <div style={{ width: '320px', flex: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ padding: '24px' }}>
               <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={16} /> Vault Security</h4>
               <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'color-mix(in srgb, var(--color-text) 80%, transparent)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 <li>End-to-End AES-256 Encryption</li>
                 <li>Zero-knowledge architecture</li>
                 <li>Biometric access enabled</li>
               </ul>
            </div>
            
            <div className="card" style={{ padding: '24px' }}>
               <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={16} /> Shared Nominees</h4>
               <p style={{ fontSize: '13px', color: 'color-mix(in srgb, var(--color-text) 60%, transparent)', margin: '0 0 16px 0' }}>Assign family members who can access the vault in case of emergencies.</p>
               <button className="btn btn-secondary btn-block" style={{ justifyContent: 'center' }}>Manage Access</button>
            </div>
         </div>
      </div>

    </div>
  );
}
