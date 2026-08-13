/**
 * A URL for a file in `public/`.
 *
 * The site is served from a domain root in the application build and from
 * `/<repo>/` on GitHub Pages. Vite rewrites the paths it can see in HTML and in
 * imports, but not strings built at runtime — these are those strings.
 */
export function asset(path) {
  return `${import.meta.env.BASE_URL}${String(path).replace(/^\//, '')}`;
}
