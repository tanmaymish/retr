import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

/** Material Symbols, matching the icon set the design uses throughout. */
export function Icon({ name, size = 20, fill = false, style, className = '' }) {
  return (
    <span
      className={`material-symbols-rounded ${className}`}
      aria-hidden="true"
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}

export function Button({ variant = 'primary', size, icon, iconAfter, loading, children, className = '', ...rest }) {
  const classes = ['btn'];
  if (variant !== 'primary') classes.push(`btn-${variant}`);
  if (size === 'sm') classes.push('btn-sm');
  if (className) classes.push(className);

  return (
    <button className={classes.join(' ')} disabled={loading || rest.disabled} {...rest}>
      {loading ? <Icon name="progress_activity" size={18} className="spin" /> : icon ? <Icon name={icon} size={18} /> : null}
      {children}
      {iconAfter && <Icon name={iconAfter} size={18} />}
    </button>
  );
}

export function Card({ as: Tag = 'div', flat, className = '', children, ...rest }) {
  return (
    <Tag className={`card${flat ? ' card-flat' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export function Field({ label, hint, error, children, id }) {
  return (
    <div className="field">
      {label && <label htmlFor={id}>{label}</label>}
      {children}
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

export function Input({ error, ...rest }) {
  return <input className="input" aria-invalid={error ? 'true' : undefined} {...rest} />;
}

export function Select({ error, children, ...rest }) {
  return (
    <div style={{ position: 'relative' }}>
      <select className="input" aria-invalid={error ? 'true' : undefined} {...rest}>
        {children}
      </select>
      <Icon
        name="expand_more"
        size={20}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--on-surface-variant)' }}
      />
    </div>
  );
}

export function Badge({ tone = 'neutral', icon, children }) {
  const map = {
    neutral: '',
    verified: ' badge-verified',
    ai: ' badge-ai',
    pending: ' badge-pending',
    danger: ' badge-danger',
    primary: ' badge-primary',
  };
  return (
    <span className={`badge${map[tone] ?? ''}`}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}

export function EmptyState({ icon = 'inbox', title, children, action }) {
  return (
    <div className="empty">
      <Icon name={icon} size={40} />
      <h3>{title}</h3>
      {children && <p style={{ maxWidth: 420 }}>{children}</p>}
      {action}
    </div>
  );
}

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="empty" role="status" aria-live="polite">
      <Icon name="progress_activity" size={32} className="spin" />
      <span className="small muted">{label}…</span>
    </div>
  );
}

export function Skeleton({ height = 16, width = '100%', radius = 8 }) {
  return <div className="skeleton" style={{ height, width, borderRadius: radius }} />;
}

/**
 * A dialog that traps focus, closes on Escape, and returns focus where it came
 * from — the accessibility floor for anything that covers the page.
 */
export function Modal({ open, onClose, title, description, children, footer, width = 520 }) {
  const ref = useRef(null);
  const restoreTo = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    restoreTo.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.();
        return;
      }
      if (event.key !== 'Tab' || !ref.current) return;
      const focusable = ref.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    const timer = setTimeout(() => {
      ref.current?.querySelector('input, button, select, textarea')?.focus();
    }, 30);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      clearTimeout(timer);
      restoreTo.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(27, 28, 28, 0.45)',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
        zIndex: 60,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="enter"
        style={{
          background: 'var(--surface-lowest)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--elev-2)',
          width: `min(${width}px, 100%)`,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 28,
        }}
      >
        <div className="row-between" style={{ marginBottom: description ? 8 : 20 }}>
          <h3>{title}</h3>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        {description && <p className="muted small" style={{ marginBottom: 20 }}>{description}</p>}
        {children}
        {footer && <div className="row" style={{ justifyContent: 'flex-end', marginTop: 24 }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ── Toasts ───────────────────────────────────────────────────────────────
   Feedback for anything that succeeded silently, and the fallback surface for
   errors that have nowhere better to appear. */

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (message, tone = 'info') => {
      const id = Math.random().toString(36).slice(2);
      setToasts((list) => [...list, { id, message, tone }]);
      setTimeout(() => dismiss(id), tone === 'error' ? 7000 : 4000);
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      success: (message) => push(message, 'success'),
      error: (message) => push(message, 'error'),
      info: (message) => push(message, 'info'),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        style={{ position: 'fixed', bottom: 24, right: 24, display: 'grid', gap: 10, zIndex: 80, maxWidth: 380 }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="enter"
            style={{
              background: toast.tone === 'error' ? 'var(--error-container)' : 'var(--surface-lowest)',
              color: toast.tone === 'error' ? 'var(--on-error-container)' : 'var(--on-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 18px',
              boxShadow: 'var(--elev-2)',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              fontSize: 14,
            }}
          >
            <Icon
              name={toast.tone === 'error' ? 'error' : toast.tone === 'success' ? 'check_circle' : 'info'}
              size={18}
              style={{ color: toast.tone === 'success' ? 'var(--sage)' : undefined, flex: 'none', marginTop: 1 }}
            />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider.');
  return context;
}

/** Confirmation for anything irreversible. Destructive actions get the red button. */
export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', danger, onConfirm, onClose, busy }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      width={440}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}

/** A meter used for readiness and category progress. */
export function Meter({ value, tone = 'primary', height = 8, label }) {
  const colour = { primary: 'var(--primary)', sage: 'var(--sage)', amber: 'var(--amber)', error: 'var(--error)' }[tone];
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      style={{ background: 'var(--surface-high)', borderRadius: 999, height, overflow: 'hidden' }}
    >
      <div
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          height: '100%',
          background: colour,
          borderRadius: 999,
          transition: 'width 0.6s var(--spring)',
        }}
      />
    </div>
  );
}
