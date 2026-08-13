/**
 * A URL for a file in `public/`.
 *
 * The site is served from a domain root in the application build and from
 * `/<repo>/` on GitHub Pages. Vite rewrites the paths it can see in HTML and in
 * imports, but not strings built at runtime — these are those strings.
 */
export function asset(path) {
  const url = `${import.meta.env.BASE_URL}${String(path).replace(/^\//, '')}`;
  /* The single-file preview has no server to fetch these from, so it registers
     every one of them as a data URI before the bundle runs. Nothing sets this
     in a real build, and the lookup costs one property read. */
  return globalThis.__INLINE_ASSETS__?.[url] ?? url;
}
