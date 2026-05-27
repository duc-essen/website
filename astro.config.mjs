// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { copyFileSync } from 'node:fs';

// Kleine Integration: nach dem Build kopiert sie sitemap-index.xml zu
// sitemap.xml. Crawler erwarten den klassischen Pfad /sitemap.xml.
const sitemapAlias = {
  name: 'sitemap-alias',
  hooks: {
    'astro:build:done': ({ dir }) => {
      copyFileSync(
        new URL('sitemap-index.xml', dir),
        new URL('sitemap.xml', dir)
      );
    },
  },
};

// https://astro.build/config
//
// Solange die Custom Domain duc-essen.de noch nicht via DNS auf GitHub Pages
// zeigt, deployen wir auf die Default-URL https://duc-essen.github.io/duc-website/.
// Sobald DNS gesetzt + public/CNAME aktiviert ist:
//   - site auf 'https://duc-essen.de' aendern
//   - base entfernen
export default defineConfig({
  site: 'https://duc-essen.github.io',
  base: '/duc-website',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  integrations: [sitemap(), sitemapAlias],
});
