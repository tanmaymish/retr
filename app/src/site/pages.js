/**
 * The site, in the order a visitor should meet it.
 *
 * One list, read by three things that used to disagree with each other: the
 * header nav, the footer, and the pager at the foot of every page. A page added
 * here appears in all three, in this order, and nowhere has to be kept in sync
 * by hand.
 *
 * The order is an argument. Run your own numbers before you trust anyone; find
 * out where you stand; then read what we do, what we think, who we are — and
 * only then, talk to us.
 */
export const journey = [
  {
    path: '/',
    label: 'Home',
    nav: null, // The wordmark is the home link; a second one would be clutter.
    blurb: 'Two questions, and the numbers behind them.',
  },
  {
    path: '/calculators',
    label: 'Calculators',
    nav: 'Calculators',
    blurb: 'Thirteen of them. Nothing stored, nothing behind a signup.',
  },
  {
    path: '/preparedness-check',
    label: 'Preparedness check',
    nav: 'Preparedness check',
    blurb: 'Six questions, scored, in about two minutes.',
  },
  {
    path: '/services',
    label: 'What we do',
    nav: 'What we do',
    blurb: 'The advice, how an engagement runs, and what you can hold us to.',
  },
  {
    path: '/insights',
    label: 'Insights',
    nav: 'Insights',
    blurb: 'What we would tell you in the meeting.',
  },
  {
    path: '/about',
    label: 'About',
    nav: 'About',
    blurb: 'Why two people left the industry to do this instead.',
  },
  {
    path: '/contact',
    label: 'Contact',
    nav: 'Contact',
    blurb: 'A conversation that names no product and costs nothing.',
  },
];

/** The links the header shows, in journey order. */
export const navLinks = journey.filter((page) => page.nav).map((page) => ({ to: page.path, label: page.nav }));

/** What comes before and after a page, for the pager at the foot of it. */
export function neighbours(path) {
  const index = journey.findIndex((page) => page.path === path);
  if (index < 0) return { previous: null, next: null };
  return {
    previous: index > 0 ? journey[index - 1] : null,
    next: index < journey.length - 1 ? journey[index + 1] : null,
  };
}
