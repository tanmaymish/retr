import { Link } from 'react-router-dom';
import { Icon } from '../components/ui';
import { SitePage } from './SiteChrome';
import { useSeo } from '../lib/seo';
import { brand } from './content';

/**
 * Privacy, terms and the 404.
 *
 * The privacy notice describes what this application actually does — the data
 * it holds, where it is encrypted, what leaves the server (nothing) — rather
 * than boilerplate copied from elsewhere. It is written to be reviewed by a
 * lawyer before launch, not to replace one.
 */
export function Privacy() {
  useSeo({
    title: 'Privacy notice',
    description: 'What Akshay Vriddhi stores, how it is protected, and what we do not collect.',
    path: '/privacy',
  });

  return (
    <LegalPage title="Privacy notice" updated="Draft — review before launch">
      <Callout>
        This describes how the software behaves today. It has not yet been reviewed by a lawyer, and
        it should be before the site is published.
      </Callout>

      <Section title="What we hold">
        <p>Three separate things, kept apart on purpose:</p>
        <ul>
          <li>
            <strong>Your account</strong> — name, email address, a hash of your password (never the
            password itself), and the security settings you choose.
          </li>
          <li>
            <strong>Your vault</strong> — the documents you upload and the details you record about
            them. Every file is encrypted with its own key before it is written to disk.
          </li>
          <li>
            <strong>Enquiries</strong> — if you contact us, the details you send. These are never
            joined to a vault.
          </li>
        </ul>
      </Section>

      <Section title="What we do not collect">
        <ul>
          <li>The preparedness check stores nothing. Answers are scored and discarded.</li>
          <li>We do not collect financial amounts, account numbers or identity numbers except where you choose to put a document containing them into your own encrypted vault.</li>
          <li>No third-party analytics runs unless the operator of this deployment configures one, and none is configured by default.</li>
        </ul>
      </Section>

      <Section title="Who can see your documents">
        <p>
          Only you, and the people you explicitly grant access to. Access is checked on every single
          read from three sources: your ownership, a share or category grant you created, or a
          completed emergency-access request held by a trustee you designated. Revoking access takes
          effect on the next click, not the next login.
        </p>
        <p>
          Every access by someone other than you — including a trustee — is written to your activity
          log with their name on it.
        </p>
      </Section>

      <Section title="How long we keep it">
        <p>
          For as long as you keep your account. Deleting your vault removes every document, every
          encrypted file, every share and the activity log in one transaction. There is no
          soft-delete holding area.
        </p>
        <p>Enquiries are kept until we no longer need them to respond to you.</p>
      </Section>

      <Section title="Your rights">
        <p>
          You can export or delete your data at any time from the security settings inside your
          vault. If you would like a copy of what an enquiry contains, or want it deleted, ask us and
          we will do it.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          Two, both strictly necessary and neither used for tracking: one holds your session, one
          carries the token that protects forms from cross-site submission. Signing out clears both.
        </p>
      </Section>
    </LegalPage>
  );
}

export function Terms() {
  useSeo({
    title: 'Terms of use',
    description: 'The terms under which the Akshay Vriddhi vault is provided.',
    path: '/terms',
  });

  return (
    <LegalPage title="Terms of use" updated="Draft — review before launch">
      <Callout>
        A working draft describing how the service behaves. Have it reviewed by a lawyer before the
        site goes live, particularly the sections touching regulated activity.
      </Callout>

      <Section title="What this service is">
        <p>
          {brand.name} provides a secure vault for storing and sharing your own documents, together
          with reminders derived from the dates on them.
        </p>
      </Section>

      <Section title="What it is not">
        <p>
          Nothing in this application is financial, insurance, tax or legal advice, and nothing here
          is a recommendation to buy any product. The preparedness check is an indicative
          self-assessment based on six answers. Decisions about cover belong in a conversation with a
          qualified person.
        </p>
      </Section>

      <Section title="Your responsibilities">
        <ul>
          <li>Keep your password and your second factor to yourself.</li>
          <li>Only upload documents you have the right to hold.</li>
          <li>Choose trustees carefully. A trustee can, after the waiting period and without your response, open the categories you designated.</li>
          <li>Keep your recovery codes somewhere that is not this vault.</li>
        </ul>
      </Section>

      <Section title="Availability and liability">
        <p>
          We work to keep the service available and your documents safe, but no service is immune to
          failure. Keep your own copies of anything irreplaceable. Nothing here limits liability that
          cannot lawfully be limited.
        </p>
      </Section>

      <Section title="Ending it">
        <p>
          You can delete your vault at any time from the security settings, which removes everything
          in it immediately.
        </p>
      </Section>
    </LegalPage>
  );
}

export function NotFound() {
  useSeo({
    title: 'Page not found',
    description: 'That page does not exist.',
    path: '/404',
    noIndex: true,
  });

  return (
    <SitePage>
      <section style={{ padding: '120px 0' }}>
        <div className="container center stack stack-md" style={{ maxWidth: 520 }}>
          <span
            style={{
              width: 72,
              height: 72,
              borderRadius: 'var(--radius-full)',
              background: 'var(--surface-container)',
              color: 'var(--primary)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto',
            }}
          >
            <Icon name="explore_off" size={34} />
          </span>
          <h1 style={{ fontSize: 34 }}>We could not find that page.</h1>
          <p className="muted">
            The link may be out of date, or the page may have moved. Nothing has gone wrong with your
            vault.
          </p>
          <div className="row wrap" style={{ gap: 10, justifyContent: 'center' }}>
            <Link to="/" className="btn">Back to home</Link>
            <Link to="/contact" className="btn btn-secondary">Get in touch</Link>
          </div>
        </div>
      </section>
    </SitePage>
  );
}

function LegalPage({ title, updated, children }) {
  return (
    <SitePage>
      <section style={{ padding: '72px 0 96px' }}>
        <div className="container stack stack-md" style={{ maxWidth: 720 }}>
          <header className="stack" style={{ gap: 8 }}>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>{title}</h1>
            <span className="tiny caps muted">{updated}</span>
          </header>
          {children}
        </div>
      </section>
    </SitePage>
  );
}

function Section({ title, children }) {
  return (
    <section className="stack stack-sm" style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 22 }}>{title}</h2>
      <div className="stack stack-sm legal-body">{children}</div>
    </section>
  );
}

function Callout({ children }) {
  return (
    <div
      className="row"
      style={{
        gap: 12,
        alignItems: 'flex-start',
        padding: 16,
        background: 'var(--amber-surface)',
        color: 'var(--amber)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <Icon name="gavel" size={20} style={{ marginTop: 2, flex: 'none' }} />
      <p className="small">{children}</p>
    </div>
  );
}
