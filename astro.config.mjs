// @ts-check
import { defineConfig } from 'astro/config';

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
});
