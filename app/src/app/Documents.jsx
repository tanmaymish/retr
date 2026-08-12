import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, EmptyState, Icon, Spinner } from '../components/ui';
import { useApi } from '../lib/useApi';
import { CATEGORY_LIST } from '../lib/categories';
import { DocumentCard } from './DocumentCard';

export default function Documents() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? '';
  const search = params.get('search') ?? '';

  const query = useMemo(() => {
    const parts = [];
    if (category) parts.push(`category=${encodeURIComponent(category)}`);
    if (search) parts.push(`search=${encodeURIComponent(search)}`);
    return parts.length ? `?${parts.join('&')}` : '';
  }, [category, search]);

  const { data: counts } = useApi('/categories');
  const { data, loading, error } = useApi(`/documents${query}`);

  function setFilter(next) {
    const updated = new URLSearchParams(params);
    if (next) updated.set('category', next);
    else updated.delete('category');
    setParams(updated, { replace: true });
  }

  const documents = data?.documents ?? [];

  return (
    <div className="stack stack-md enter">
      <div className="row-between wrap" style={{ gap: 16 }}>
        <div className="stack" style={{ gap: 6 }}>
          <h1 style={{ fontSize: 32 }}>Documents</h1>
          <p className="muted small">
            {search ? `Results for “${search}”` : 'Everything in the vault, organised by what it is.'}
          </p>
        </div>
        <Link to="/vault/add" className="btn">
          <Icon name="add" size={18} /> Secure new asset
        </Link>
      </div>

      <div className="row wrap" style={{ gap: 8 }}>
        <Chip active={!category} onClick={() => setFilter('')} label="All" count={counts ? countAll(counts) : null} />
        {CATEGORY_LIST.map((entry) => {
          const count = counts?.categories?.find((c) => c.key === entry.key)?.count ?? 0;
          return (
            <Chip
              key={entry.key}
              active={category === entry.key}
              onClick={() => setFilter(entry.key)}
              label={entry.label}
              icon={entry.icon}
              count={count}
            />
          );
        })}
      </div>

      {search && (
        <button className="btn btn-ghost btn-sm" onClick={() => setParams({}, { replace: true })} style={{ alignSelf: 'flex-start' }}>
          <Icon name="close" size={16} /> Clear search
        </button>
      )}

      {loading ? (
        <Spinner />
      ) : error ? (
        <EmptyState icon="cloud_off" title="Could not load documents">{error.message}</EmptyState>
      ) : documents.length === 0 ? (
        <Card flat>
          <EmptyState
            icon="folder_open"
            title={category || search ? 'Nothing here yet' : 'Your vault is empty'}
            action={<Link to="/vault/add" className="btn">Add a document</Link>}
          >
            {category
              ? 'No documents in this category. Adding one also switches on its reminders.'
              : search
                ? 'Nothing matched that search.'
                : 'Start with the document your family would look for first — usually an insurance policy or an ID.'}
          </EmptyState>
        </Card>
      ) : (
        <div className="grid grid-3">
          {documents.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      )}
    </div>
  );
}

function countAll(counts) {
  return counts.categories.reduce((total, c) => total + c.count, 0);
}

function Chip({ active, onClick, label, icon, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '8px 14px',
        borderRadius: 'var(--radius-full)',
        border: `1px solid ${active ? 'var(--primary)' : 'var(--outline-variant)'}`,
        background: active ? 'var(--primary)' : 'var(--surface-lowest)',
        color: active ? 'var(--on-primary)' : 'var(--on-surface-variant)',
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      {icon && <Icon name={icon} size={16} />}
      {label}
      {count !== null && count !== undefined && (
        <span style={{ opacity: 0.7, fontSize: 12 }}>{count}</span>
      )}
    </button>
  );
}
