# TODO — DUC Essen Website

Stand: Astro v6 Multi-Page-Site mit Cookie-Banner (Klaro), lokalen Fonts (Inter), lokalen Bildern, History-API fuer teilbare URLs und 10 Seiten live unter https://duc-essen.github.io/duc-website/. Hier die noch offene Liste.

---

## Hoch — Production-Readiness

### Custom Domain `duc-essen.de` umziehen

DNS-Zugriff beim Provider steht aktuell aus. Schritt-fuer-Schritt sobald da:

- [ ] DNS-Records setzen:
  - Apex `A`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  - Optional `www`-`CNAME`: `<gh-user>.github.io`
- [ ] `mv public/CNAME.disabled public/CNAME`
- [ ] `astro.config.mjs`: `site: 'https://duc-essen.de'`, `base` entfernen
- [ ] Repo-Settings → Pages → Custom domain auf `duc-essen.de`, „Enforce HTTPS" sobald TLS-Zertifikat steht
- [ ] Commit + push

### Video extern hosten oder Git LFS einrichten

- [ ] `public/media/widdauen-2023.mp4` ist 91 MB (knapp unter GitHubs Hard-Limit). Optionen:
  - Bei weiteren Videos: `git lfs install` + `git lfs track "*.mp4"` (Git LFS hat 1 GB Free-Quota auf GitHub)
  - Oder Video extern lassen (wo es jetzt im Original auf s3.tmhart.de lag) und nur einbetten
  - Heute kein akutes Problem, aber bei waeiteren grossen Files relevant.

---

## Mittel — SEO + Robustheit

### Datenschutz-Text mit Vorstand nochmal abgleichen

Der Text ist beim Umzug auf Astro + Klaro durchstrukturiert worden (Cookies-Sektion ist jetzt akkurat: kein Real-Cookie-Banner, sondern Klaro; Google Maps + Vereinsplaner sind opt-in). Sollte vor Custom-Domain-Live nochmal vom Vorstand abgenommen werden.

### Live-Verifikation im Browser

- [ ] Manuelles Smoke-Testing nach jedem groesseren Refactor: Klick auf „Angebote" auf Hauptseite → URL wird `/duc-website/angebote`, ohne Page-Reload. Detail-Seite direkt aufrufen → laedt statisch. Cookie-Banner abweisen → Google Maps bleibt geblockt. Akzeptieren → Map laedt.

---

## Refactor-Backlog (separates Doku-Dokument)

Eine systematische Code-Review hat 10 Refactor-Vorschlaege identifiziert (Inline-Styles, Icon-Komponenten generalisieren, BaseLayout aufteilen, etc.) — mit Aufwandsschaetzungen und Code-Beispielen. Siehe **[REFACTOR.md](./REFACTOR.md)**.

Pakete:
- **Quick Wins** (~1 h): SectionRenderer-Map, CtaButton-Komponente, Non-Null-Assertions, JSON-LD aus verein.json
- **Tiefes Aufraeumen** (~3 h): + Inline-Styles, Icon-Generalisierung, Icon-Enums, CSS-Module
- **Komplettpaket** (~5 h): + BaseLayout-Split, Astro `<Image />`

---

## Niedrig — Polish + Markdown-Ausbau

### Stats-Counter-Animation

- [ ] Aktuell statische Zahlen. Optional: IntersectionObserver-basierter Counter (Animation von 0 bis Zielwert beim Scrollen in den Viewport). `Stats.astro` muesste `target`-Feld aus Schema unterstuetzen und JS im BaseLayout erweitern.

### `.fade-in`-Animation

- [ ] Aktuell pro Karte → Karten flackern beim Scroll asynchron. Stattdessen pro Container-Sektion observieren.

### Navigation Hint auf Detail-Seiten

- [ ] Aktuell keine Visual-Cue, dass man auf einer Detail-Seite ist (nur Navbar verhaelt sich anders). Optional: Breadcrumb oder „Zurueck zur Uebersicht"-Link unterhalb der Sektion.

### View Transitions ausprobieren

- [ ] `<ClientRouter />` (Astro v6) — smooth animierte Uebergaenge zwischen Detail-Seiten und One-Pager. Nice-to-have, kein Muss.

### Zod-Imports modernisieren

- [ ] LSP zeigt `'z' is deprecated` (info-level) bei jedem Astro-Sync. Funktioniert weiter, aber sauberer: `import { z } from 'astro/zod'` statt `import { z } from 'astro:content'` in `content.config.ts`.

### Gallery-Seite aus den neuen Bildern bauen

- [ ] In `public/images/gallery/` liegen 5 Bilder (Bild-5-v, IMG_1070, Clubfahrt-2018, Home-1-b, Weihnachten-2019) + 1 Video. Aktuell ungenutzt. Idee: separate Galerie-Sektion oder Detail-Seite `/galerie`, die diese rendert (eigene Collection + Komponente).

---

## Erledigt (Referenz)

- **Inline-Styles eliminiert:** 36 `style="..."`-Attribute aus 9 Komponenten in scoped `<style>`-Bloecke ueberfuehrt. Markup ist jetzt sauber, dev-tools-friendly.
- **Icon-System konsolidiert:** Slug-Enums in `src/types/icons.ts`, alle SVGs in `src/components/icons.ts` (Map), eine generische `Icon.astro` ersetzt 5 spezialisierte Icon-Komponenten. ~110 Zeilen Duplikation entfernt.
- **Non-Null-Assertions** in Training/Kontakt durch defensive Checks ersetzt — bei falscher Verkabelung schlaegt der Build mit klarer Meldung fehl statt zur Render-Zeit mit „undefined is not an object".
- **`<CtaButton />`-Komponente** ersetzt alle 6 direkten `<a class="btn btn-primary">`-Stellen in Hero, Angebote, Training, Geschichte, Preise. Inklusive ctaHref()-Logik intern, externe URLs (http/mailto/tel) werden 1:1 durchgereicht.
- **SectionRenderer auf Map-Dispatch** umgestellt (statt 7 if/else-Zeilen ein typsicheres COMPONENTS-Mapping). Bei unbekannter section.id wirft die Komponente einen klaren Error mit Hinweis was zu tun ist.
- **Hero (Titel + Tagline + CTAs)** liest aus `src/data/hero.json`. Damit ist kein Inhalt mehr hartcodiert ausser den Bubbles im BaseLayout.
- **JSON-LD `SportsClub`** liest jetzt komplett aus `verein.json` (Name, Adresse, Geo, Sportarten, VDST-Mitgliedschaft, Trainingszeiten). Single source of truth funktioniert auch fuer Strukturdaten.
- **Sitemap + robots.txt** via `@astrojs/sitemap` — `sitemap-index.xml`, `sitemap-0.xml` und Alias `sitemap.xml` (via Custom Astro-Integration in `astro.config.mjs`).
- **Stats sind aus `src/data/stats.json` pflegbar** (vorher hartcodiert).
- **Termine-Sektion** zeigt jetzt max. 6 Eintraege als kombinierte Liste (zukuenftige + ggf. vergangene). Vergangene visuell markiert (graue Kachel + „vergangen"-Badge). `Training TSV` faellt aus der Trainings-Liste raus (kein DUC-Termin).
- **Veranstaltungen kommen jetzt LIVE aus dem Vereinsplaner-iCal-Feed.** Vorstand pflegt nur dort, Astro-Build holt + filtert, taegliches Cron-Rebuild.
- Astro-Setup + komplette Komponenten-Migration aus dem urspruenglichen Single-File-Entwurf
- GitHub Pages Deployment via `withastro/action@v6`
- Multi-Page-Architektur (One-Pager `/` + 7 Detail-Seiten + Impressum + Datenschutz, gesamt 10 statische Pages)
- Markdown/JSON-Pflege fuer alle Sektionen + Items (7 Collections + verein.json)
- Icon-Komponenten mit Slug-Enum-Validierung
- History API fuer teilbare URLs im One-Pager (pushState + replaceState + popstate)
- Impressum (§ 5 TMG) + Datenschutz als `.astro`-Seiten mit dynamischen Vereins-/Vorstandsdaten
- Klaro! Cookie-Consent (BSD-3, lokal gehostet, kein CDN-Call) mit Google Maps + Vereinsplaner als opt-in-Services
- Google Fonts raus → Inter Variable lokal via `@fontsource-variable/inter`
- Externe Bilder lokalisiert: Training-Bilder, OG-Image, Mitgliedschafts-Logos
- `assetUrl()`-Helper fuer URL-Resolution (lokal vs. extern)
- `verein.json` zentralisiert Vereinsstammdaten (Single Source of Truth)
- Navbar auf Detail-Seiten immer solid (kein unsichtbares Logo)
- Klaro-Theme an Site-Palette (gold/blau) angepasst, Banner unten links, kein Konflikt mit Back-to-Top
- README.md / AGENTS.md / TODO.md als Onboarding-Doku, `index.html` entfernt

---

## Referenzen

- [AGENTS.md](./AGENTS.md) — vollstaendiges Briefing inkl. Schema-Cheat-Sheet
- [Astro Docs — Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Docs — Routing](https://docs.astro.build/en/guides/routing/)
- [Astro Docs — Deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
- [GitHub Docs — Custom Domains fuer Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Klaro! Documentation](https://klaro.org/docs/integration/overview)
- [Git LFS](https://git-lfs.github.com/) (fuer den Fall der grossen Videos)
