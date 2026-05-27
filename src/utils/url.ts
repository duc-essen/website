const BASE = import.meta.env.BASE_URL;

/**
 * Joint den Site-Base-Path mit einem Pfad-Segment. Toleriert fehlende oder
 * doppelte Slashes auf beiden Seiten.
 *
 *   pathTo('angebote')   // '/duc-website/angebote'
 *   pathTo('/angebote')  // '/duc-website/angebote'
 *   pathTo('')           // '/duc-website/'
 */
export function pathTo(path: string): string {
  const base = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  if (!path) return base + '/';
  const clean = path.startsWith('/') ? path : '/' + path;
  return base + clean;
}

/**
 * Loest einen Section-CTA-Link kontextabhaengig auf:
 * - Auf One-Pager (isStandalone=false): Anchor-Link "#slug" fuer Smooth-Scroll.
 * - Auf Detail-Seite (isStandalone=true): Pfad-Link "/<base>/slug" zur Detail-Seite.
 *
 * Markdown-Konvention: cta.href ist ein Section-Slug, optional mit "#" oder "/"
 * praefixiert (alles wird normalisiert).
 */
export function ctaHref(
  href: string | undefined,
  isStandalone: boolean
): string | undefined {
  if (!href) return undefined;
  // Externe Links / Mail / Telefon werden 1:1 durchgereicht.
  if (/^(https?:|mailto:|tel:)/.test(href)) return href;
  const slug = href.replace(/^[#/]+/, '');
  return isStandalone ? pathTo(slug) : `#${slug}`;
}

/**
 * Loest einen Asset-Pfad (Bild, Logo, etc.) so auf, dass externe URLs
 * (http/https/data) durchgereicht werden, lokale Pfade aber mit dem Site-Base
 * praefixiert werden. Damit kann man im Markdown "/images/foo.jpg" schreiben
 * und es funktioniert sowohl auf `/duc-website/...` als auch spaeter auf einer
 * Custom Domain (`/...`).
 */
export function assetUrl(src: string): string {
  if (/^(https?:|data:|mailto:)/.test(src)) return src;
  const clean = src.startsWith('/') ? src.slice(1) : src;
  return pathTo(clean);
}
