import { Link } from 'react-router-dom';
import { faqContent } from '../data/aiContent';
import { IOSDevice } from '../components/frames/IOSFrame';
import FaqList from '../components/FaqList';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Ask() {
  useDocumentTitle('Ask about your money');
  const isAI = Boolean(faqContent?.items?.length);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '16px 24px',
          borderBottom: '2px solid var(--color-divider)',
        }}
      >
        <Link to="/app/home" style={{ color: 'var(--color-accent)', font: '600 11px Archivo, sans-serif' }}>
          ← APP
        </Link>
        <div>
          <div style={{ font: '600 10px ui-monospace, monospace', color: 'rgba(0,0,0,.5)' }}>
            {isAI ? 'AI-GENERATED · REFRESHED WEEKLY' : 'AWAITING FIRST PIPELINE RUN'}
          </div>
          <div style={{ font: '600 14px Archivo, sans-serif', marginTop: 2 }}>Ask about your money</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, padding: '32px 24px', alignItems: 'flex-start' }}>
        <IOSDevice title="Ask">
          <FaqList />
        </IOSDevice>

        <div style={{ maxWidth: 420, font: '400 12px/1.6 Archivo, sans-serif', color: 'rgba(0,0,0,.6)' }}>
          <p style={{ marginTop: 0 }}>
            This screen wasn't part of the original wireframe set — it's the "free-form chat
            assistant" AI feature, implemented as a curated, pre-generated FAQ rather than live
            chat, because a real GitHub Models token can't safely be called from browser
            JavaScript. A GitHub Action (<code>.github/workflows/ai-pipeline.yml</code>) runs the
            model weekly (or on demand) against <code>ai/profile.json</code> and commits the
            answers to <code>app/src/data/ai/faq.json</code>, which this screen reads.
          </p>
          {faqContent?.generated_at && (
            <p style={{ font: '500 10px/1.6 ui-monospace, monospace', color: '#8a8785' }}>
              GENERATED {new Date(faqContent.generated_at).toISOString()} · MODEL {faqContent.model}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
