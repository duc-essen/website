# TODO — DUC Essen Website

Stand: aktuelle Multi-Page-Architektur (Astro v6) lebt unter https://duc-essen.github.io/duc-website/ mit 10 Seiten (One-Pager + 7 Detail-Seiten + Impressum + Datenschutz). Inhalte sind als Markdown / JSON in Content Collections pflegbar. Hier die offene Liste.

---

## Hoch — Production-Readiness

### Custom Domain `duc-essen.de` umziehen

DNS-Zugriff beim Provider steht aktuell aus. Schritt-fuer-Schritt, sobald da:

- [ ] DNS-Records setzen:
  - Apex `A`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  - Optional `www`-`CNAME`: `<gh-user>.github.io`
- [ ] `mv public/CNAME.disabled public/CNAME`
- [ ] `astro.config.mjs`: `site: 'https://duc-essen.de'`, `base` entfernen
- [ ] Repo-Settings → Pages → Custom domain auf `duc-essen.de`, „Enforce HTTPS" sobald TLS-Zertifikat steht
- [ ] Commit + push

### Datenschutz-Text mit Realitaet abgleichen

Der eingebaute Text hat Stand Mai 2018 (von duc-essen.de uebernommen) und beschreibt Dinge, die im aktuellen Astro-Setup gar nicht zutreffen:

- [ ] **Sektion 5 (Cookies):** Astro-Site setzt keine Cookies. „Real Cookie Banner" gibt es nicht.
- [ ] **Sektion 11 (Real Cookie Banner):** komplett raus oder durch realistische Beschreibung ersetzen.
- [ ] Cookie-Erwaehnung bei Sektion 6 (Google Maps) ueberdenken — wir laden Google Maps direkt im Iframe.
- [ ] Verbleibender Text mit Vorstand auf Aktualitaet pruefen.

---

## Mittel — SEO + Robustheit

### Sitemap + robots.txt

- [ ] `npx astro add sitemap` — generiert `sitemap-index.xml` automatisch fuer alle 10 Seiten.
- [ ] `public/robots.txt` ergaenzen (mit Hinweis auf Sitemap-URL).

### Externe Bilder lokalisieren

Trainings-Bilder kommen aktuell von `duc-essen.de/wp-content/...` (Quelle: `src/content/sections/training.md` Frontmatter `training.bilder`). Falls WordPress-Site abgeschaltet wird, brechen sie.

- [ ] Bilder in `public/images/training/` ziehen
- [ ] Frontmatter-URLs auf relative Pfade umstellen
- [ ] `astro:assets <Image />`-Komponente fuer Lazy/AVIF/WebP einsetzen
- [ ] Gilt auch fuer OG-Image in `BaseLayout.astro` (aktuell `Home-1-b.jpg` extern)

### Mitgliedschafts-Logos lokalisieren

CMAS / VDST / TSV NRW Logos kommen via Favicon-URL der jeweiligen Verbaende — brechen wenn Verbaende ihre Favicons aendern.

- [ ] Logos in `public/images/mitgliedschaften/` ziehen
- [ ] `src/content/mitgliedschaften/*.md` Frontmatter `logoUrl` auf relative Pfade

### Live-Verifikation der History-API

- [ ] Im Browser pruefen: Klick auf „Angebote" auf der Hauptseite → URL wird `/duc-website/angebote`. Scroll-Spy aktualisiert URL kontinuierlich (`replaceState`). Back-Button scrollt zurueck. Direct-Refresh auf `/duc-website/angebote` zeigt Detail-Seite.

---

## Niedrig — Polish + restlicher Markdown-Ausbau

### Hero + Stats in Collections holen

Beide aktuell als hartcodierte Komponenten (`src/components/Hero.astro`, `src/components/Stats.astro`). Wenn Tagline/Mitgliederzahlen pflegbar werden sollen:

- [ ] **Hero:** neue Section `src/content/sections/hero.md` mit `title`, `subtitle`, `cta1`, `cta2`. Hero-Komponente liest daraus.
- [ ] **Stats:** entweder neue Collection `src/data/stats.json` (4 Eintraege: Jahre, Mitglieder, Trainings, LLSP) — oder Stats-Block ins Frontmatter einer Section.

### Stats-Counter-Animation

- [ ] `data-target`-Attribute liegen brach. Entweder Counter-JS im BaseLayout schreiben (IntersectionObserver + numerischer Zaehler) oder Attribute entfernen.

### Inline-Styles in CSS-Klassen ziehen

Die Komponenten `Veranstaltungen`, `Preise`, `Kontakt`, `Mitgliedschaften` haben noch viele `style="..."`-Attribute (1:1 aus dem Single-File-Entwurf).

- [ ] Inline-Styles in CSS-Klassen ueberfuehren (entweder in `global.css` oder in `<style>`-Blocks der jeweiligen Komponente).
- [ ] Inline-`onmouseover`/`onmouseout` in Mitgliedschaften.astro durch CSS-`:hover` ersetzen (teilweise erledigt).

### `.fade-in`-Animation

- [ ] Aktuell pro Karte → Karten flackern beim Scroll asynchron. Stattdessen pro Container-Sektion observieren.

### Navigation Hint auf Detail-Seiten

- [ ] Aktuell keine Visual-Cue, dass man auf einer Detail-Seite ist (nur Navbar verhaelt sich anders). Optional: Breadcrumb oder „Zurueck zur Uebersicht"-Link unterhalb der Sektion.

### View Transitions ausprobieren

- [ ] `<ClientRouter />` einbauen (Astro v6) — smooth animierte Uebergaenge zwischen Detail-Seiten und One-Pager. Nice-to-have, kein Muss.

---

## Erledigt (Referenz)

Astro-Setup, Komponenten-Migration aus dem urspruenglichen Single-File-Entwurf, GitHub Pages-Deployment, Multi-Page-Architektur mit Detail-Seiten pro Sektion, vollstaendige Markdown/JSON-Pflege fuer alle Sektionen + Items, Icon-Komponenten mit Slug-Enum-Validierung, History API fuer teilbare URLs im One-Pager, Impressum (§ 5 TMG), Datenschutz (Vereins-Text Mai 2018), Legacy `index.html` entfernt, AGENTS.md / README.md als Onboarding-Doku.

---

## Referenzen

- [AGENTS.md](./AGENTS.md) — vollstaendiges Briefing inkl. Schema-Cheat-Sheet
- [Astro Docs — Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Docs — Routing](https://docs.astro.build/en/guides/routing/)
- [Astro Docs — Deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
- [GitHub Docs — Custom Domains fuer Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
