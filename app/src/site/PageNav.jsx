import { Link } from 'react-router-dom';
import { Icon } from '../components/ui';
import { Reveal } from './Section';
import { journey, neighbours } from './pages';

/**
 * The foot of every page: where you are, and what comes next.
 *
 * Pages used to be sections of one very long scroll. Now each one ends, and
 * this is how it ends — a step counter and two doors, so the site reads as a
 * sequence rather than as a wall a visitor has to know when to stop climbing.
 */
export function PageNav({ path }) {
  const { previous, next } = neighbours(path);
  const step = journey.findIndex((page) => page.path === path) + 1;
  if (!previous && !next) return null;

  return (
    <nav className="pagenav" aria-label="Page">
      <div className="container stack stack-md">
        <Reveal className="pagenav-rule" role="separator">
          <span>
            {step > 0 ? `${String(step).padStart(2, '0')} / ${String(journey.length).padStart(2, '0')}` : '✦'}
          </span>
        </Reveal>

        <div className="pagenav-grid">
          {previous ? <Step page={previous} direction="back" /> : <span />}
          {next ? <Step page={next} direction="forward" /> : <span />}
        </div>
      </div>
    </nav>
  );
}

function Step({ page, direction }) {
  const back = direction === 'back';
  return (
    <Link to={page.path} className={`pagenav-step${back ? ' is-back' : ''}`}>
      <span className="tiny caps muted">{back ? 'Back to' : 'Next'}</span>
      <span className="pagenav-title">
        {back && <Icon name="arrow_back" size={19} />}
        {page.label}
        {!back && <Icon name="arrow_forward" size={19} />}
      </span>
      <span className="small muted">{page.blurb}</span>
    </Link>
  );
}
