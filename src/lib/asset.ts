/**
 * Prefixes a root-relative public path (e.g. "/ikaw-at-ako.mp3") with the
 * deploy base at runtime, so the app works both at the domain root (local
 * dev) and inside a sub-path (GitHub Pages "/for-my-aya/").
 */
export function assetUrl(path: string): string {
  if (!path.startsWith('/')) return path
  const segments = window.location.pathname.split('/').filter(Boolean)
  const prefix = segments.length > 0 ? `/${segments[0]}/` : '/'
  return prefix + path.slice(1)
}
