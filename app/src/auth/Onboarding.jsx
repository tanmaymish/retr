import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Icon } from '../components/ui';
import { Mark } from '../site/Landing';
import { CATEGORY_LIST } from '../lib/categories';
import { api } from '../lib/api';
import { useAuth } from '../state/AuthContext';

const PROFILES = [
  { key: 'me', title: 'Just me', body: 'Securing your personal records and digital legacy.' },
  { key: 'me_partner', title: 'Me and my partner', body: 'A shared vault for joint assets and mutual security.' },
  { key: 'family', title: 'My family', body: 'Everything dependants would need, in one place.' },
  { key: 'parents', title: 'My parents', body: 'Managing affairs and critical care documents for elders.' },
];

/**
 * Three steps, each one saved as it completes, so closing the tab halfway
 * through resumes rather than restarts.
 */
export default function Onboarding() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(user?.onboardingStep === 'categories' ? 2 : 1);
  const [profile, setProfile] = useState(user?.vaultProfile ?? null);
  const [categories, setCategories] = useState(
    user?.categories?.length ? user.categories : CATEGORY_LIST.map((c) => c.key),
  );
  const [busy, setBusy] = useState(false);

  async function saveProfile() {
    setBusy(true);
    try {
      await api.patch('/account/onboarding', { vaultProfile: profile, step: 'categories' });
      setStep(2);
    } finally {
      setBusy(false);
    }
  }

  async function saveCategories() {
    setBusy(true);
    try {
      await api.patch('/account/onboarding', { categories, step: 'done' });
      await refresh();
      setStep(3);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      <header className="container row-between" style={{ height: 72 }}>
        <div className="row" style={{ gap: 10 }}>
          <Mark size={32} />
          <strong style={{ fontFamily: 'var(--font-heading)' }}>Heritage Ledger</strong>
        </div>
        {step < 3 && (
          <button
            className="btn btn-ghost"
            onClick={async () => {
              await api.patch('/account/onboarding', { step: 'done' });
              await refresh();
              navigate('/vault');
            }}
          >
            Skip
          </button>
        )}
      </header>

      <main className="container grow" style={{ display: 'grid', placeItems: 'center', padding: '32px 20px 64px' }}>
        <div style={{ width: 'min(720px, 100%)' }} className="stack stack-lg enter" key={step}>
          {step < 3 && (
            <div className="stack stack-sm">
              <span className="tiny muted">STEP {step} OF 2</span>
              <div style={{ height: 4, background: 'var(--surface-high)', borderRadius: 999 }}>
                <div
                  style={{
                    width: `${step * 50}%`,
                    height: '100%',
                    background: 'var(--primary)',
                    borderRadius: 999,
                    transition: 'width 0.5s var(--spring)',
                  }}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="stack stack-md">
              <div className="stack" style={{ gap: 8 }}>
                <h1 style={{ fontSize: 34 }}>Who are you organising for?</h1>
                <p className="muted">
                  We tailor the vault to the shape of your household. You can change this later.
                </p>
              </div>
              <div className="grid grid-2">
                {PROFILES.map((option) => {
                  const selected = profile === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setProfile(option.key)}
                      aria-pressed={selected}
                      className="card"
                      style={{
                        textAlign: 'left',
                        cursor: 'pointer',
                        border: `2px solid ${selected ? 'var(--primary)' : 'transparent'}`,
                        background: selected ? 'var(--primary-fixed)' : 'var(--surface-lowest)',
                      }}
                    >
                      <div className="row-between">
                        <h4>{option.title}</h4>
                        {selected && <Icon name="check_circle" size={20} fill style={{ color: 'var(--primary)' }} />}
                      </div>
                      <p className="small muted">{option.body}</p>
                    </button>
                  );
                })}
              </div>
              <div className="row" style={{ justifyContent: 'flex-end' }}>
                <Button onClick={saveProfile} disabled={!profile} loading={busy} iconAfter="arrow_forward">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="stack stack-md">
              <div className="stack" style={{ gap: 8 }}>
                <h1 style={{ fontSize: 34 }}>What would you like to keep safe?</h1>
                <p className="muted">
                  Pick the categories you want to organise. Nothing is locked — you can add the rest
                  whenever you need them.
                </p>
              </div>
              <div className="grid grid-3">
                {CATEGORY_LIST.map((category) => {
                  const selected = categories.includes(category.key);
                  return (
                    <button
                      key={category.key}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        setCategories((list) =>
                          list.includes(category.key)
                            ? list.filter((k) => k !== category.key)
                            : [...list, category.key],
                        )
                      }
                      className="card"
                      style={{
                        cursor: 'pointer',
                        textAlign: 'left',
                        border: `2px solid ${selected ? 'var(--primary)' : 'transparent'}`,
                        background: selected ? 'var(--primary-fixed)' : 'var(--surface-lowest)',
                      }}
                    >
                      <div className="row-between">
                        <Icon name={category.icon} size={22} style={{ color: 'var(--primary)' }} />
                        {selected && <Icon name="check" size={18} style={{ color: 'var(--primary)' }} />}
                      </div>
                      <h4 style={{ marginTop: 10 }}>{category.label}</h4>
                    </button>
                  );
                })}
              </div>
              <div className="row-between">
                <Button variant="ghost" onClick={() => setStep(1)} icon="arrow_back">Back</Button>
                <Button onClick={saveCategories} loading={busy} disabled={!categories.length} iconAfter="arrow_forward">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="stack stack-md center" style={{ alignItems: 'center' }}>
              <span
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--sage-surface)',
                  color: 'var(--sage)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Icon name="lock" size={40} fill />
              </span>
              <h1 style={{ fontSize: 34 }}>You’re ready.</h1>
              <p className="muted" style={{ maxWidth: 420 }}>
                Your family’s important things now have a home. Add the first document and the vault
                starts working — reminders, readiness and all.
              </p>
              <Button onClick={() => navigate('/vault')} iconAfter="arrow_forward">Open my vault</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
