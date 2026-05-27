# TODO — Migration auf Astro + GitHub Pages

Stand der Migration des Single-File-Entwurfs (`index.html`) auf Astro mit Deployment via GitHub Actions nach GitHub Pages auf die Custom Domain `duc-essen.de`.

---

## Erledigt (initialer Aufbau)

- [x] **Astro v6 aufgesetzt** — `package.json` mit `astro@^6` (installiert: 6.3.8), `astro.config.mjs` mit `site: 'https://duc-essen.de'`, `tsconfig.json` (`strict`), `.gitignore`.
- [x] **CSS extrahiert** — kompletter `<style>`-Block in `src/styles/global.css` (1122 Zeilen), wird im Layout via `import` eingebunden.
- [x] **BaseLayout** (`src/layouts/BaseLayout.astro`) mit komplettem `<head>` (SEO-Meta, Open-Graph, Twitter-Card, JSON-LD `SportsClub`, Favicon-SVG, Theme-Color, Poppins-Font), Bubbles-Background, Skip-Link, `<slot/>`, Back-to-Top-Button und allen Inline-Scripts (Mobile-Menue, Navbar-Scroll, Fade-In-Observer, Smooth-Scroll, Active-Section, Back-to-Top, Year).
- [x] **DucLogo-Komponente** — grosses Vereins-SVG einmalig in `src/components/DucLogo.astro`, mit `class`-Prop, wird in Navbar und Hero verwendet.
- [x] **Sektionen als Komponenten** — Navbar, Hero, Angebote, Training, Geschichte, Stats, Veranstaltungen, Preise, Kontakt, Mitgliedschaften, Footer. Inhalte unveraendert aus `index.html` uebernommen.
- [x] **`src/pages/index.astro`** komponiert alle Sektionen im `BaseLayout`.
- [x] **`public/CNAME`** mit `duc-essen.de`.
- [x] **GitHub Actions Workflow** `.github/workflows/deploy.yml` mit `actions/checkout@v6`, `withastro/action@v6` (Node 22 default) + `actions/deploy-pages@v5` — entspricht dem aktuellen Snippet aus den [offiziellen Astro-Docs](https://docs.astro.build/en/guides/deploy/github/).
- [x] **Lokaler Build verifiziert** — `npm run build` erzeugt ~70 KB `dist/index.html`, alle Sektionen, CNAME, JSON-LD enthalten. Preview unter `http://127.0.0.1:4322/` getestet.

---

## Offen

### A. GitHub Pages aktivieren

- [ ] In Repo **Settings → Pages**: Source auf **„GitHub Actions"** stellen.
- [ ] Workflow `deploy.yml` einmal pushen, Lauf in Actions-Tab pruefen.
- [ ] DNS fuer `duc-essen.de` setzen (siehe [GitHub-Doku Custom Domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)):
  - Apex: `A`-Records auf `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  - Optional: `CNAME` `www.duc-essen.de` → `<gh-user>.github.io`
- [ ] **„Enforce HTTPS"** aktivieren, sobald GitHub das TLS-Zertifikat ausgestellt hat.
- [ ] Nach erstem Deploy: pruefen, dass die Custom-Domain unter Settings → Pages eingetragen ist und erhalten bleibt.

### B. Migration finalisieren

- [ ] **`index.html` aus dem Repo entfernen**, sobald die Astro-Version live ist und vom Vorstand abgenommen wurde.
- [ ] **`README.md`** anpassen: lokale Preview-Befehle auf `npm run dev` umstellen, Verweis auf Astro-Setup ergaenzen.

### C. Inhalte in Markdown-Content-Collections ueberfuehren (Astro v6)

Damit Vereinsmitglieder Inhalte ohne Astro-Kenntnisse pflegen koennen (LLM-Workflow). Astro v6 nutzt die neue Content-Loader-API:

- [ ] `src/content.config.ts` (neue Location, **nicht** `src/content/config.ts`) mit `defineCollection({ loader: glob({ pattern: "**/*.md", base: "./src/data/veranstaltungen" }), schema: z.object({...}) })`. Siehe [Content Collections Docs](https://docs.astro.build/en/guides/content-collections/).
- [ ] Markdown-Eintraege unter `src/data/veranstaltungen/*.md` mit Frontmatter (`titel`, `datum`, `ort`, `link`, `body`). Aktuelle Eintraege aus `Veranstaltungen.astro` migrieren.
- [ ] In den Komponenten via `getCollection('veranstaltungen')` + `render(entry)` rendern.

### D. Assets / Bilder

- [ ] Aktuell extern verlinkt: `duc-essen.de/wp-content/uploads/...` (Hero-OG-Bild, Training-Bilder). Pruefen, ob sie ins Repo unter `public/images/` wandern sollen — entkoppelt von WordPress, aber Repo-Groesse steigt.
- [ ] Falls lokal: Astro `<Image />` aus `astro:assets` fuer Lazy/AVIF/WebP einsetzen.

### E. SEO / Performance

- [ ] `@astrojs/sitemap` integrieren: `npx astro add sitemap`, dann `sitemap-index.xml` automatisch generiert.
- [ ] `robots.txt` in `public/` ergaenzen.
- [ ] Nach Go-Live: [Rich-Results-Test](https://search.google.com/test/rich-results) fuer JSON-LD, [opengraph.xyz](https://www.opengraph.xyz/) fuer OG-Tags, Lighthouse vor/nach Migration vergleichen.

### F. Aufraeumarbeiten in den Komponenten

Bekannte „Quick-and-Dirty"-Punkte aus der 1:1-Uebernahme:

- [ ] Inline-`style="..."`-Attribute reduzieren (besonders in `Veranstaltungen.astro`, `Preise.astro`, `Kontakt.astro`, `Mitgliedschaften.astro`) — in CSS-Klassen ueberfuehren.
- [ ] Inline-`onmouseover`/`onmouseout` in `Mitgliedschaften.astro` durch CSS-`:hover` ersetzen.
- [ ] Die `.fade-in`-Markierung an `<div class="feature-card fade-in">` auf den Container-Wrapper verschieben, sonst flackern die einzelnen Karten unkoordiniert.
- [ ] Stats-Counter-Animation (das `data-target`-Attribut in `Stats.astro`) ist im aktuellen Script nicht angebunden — entweder Animation hinzufuegen oder Attribut entfernen.

---

## Referenzen

- [Astro Docs — Deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
- [withastro/action (GitHub)](https://github.com/withastro/action)
- [Astro Deploy auf GitHub Marketplace](https://github.com/marketplace/actions/astro-deploy)
- [GitHub Docs: Custom Domains fuer Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
