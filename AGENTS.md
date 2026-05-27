# AGENTS.md — DUC Essen Website

Briefing fuer KI-Agenten (Claude Code, Codex, Cursor) **und** menschliche Mitarbeitende, die in diesem Repo arbeiten. `CLAUDE.md` ist ein Symlink hierhin.

Ziel dieser Datei: **wer das hier in 60 Sekunden liest, kann sofort sinnvoll Aenderungen machen** — ohne den Quellcode durchsuchen oder Astro-Docs lesen zu muessen.

---

## TL;DR (60-Sekunden-Brief)

- **Was:** Statische Vereinswebsite, Astro v6, deployed auf GitHub Pages.
- **Live:** [duc-essen.github.io/duc-website](https://duc-essen.github.io/duc-website/). Custom Domain `duc-essen.de` ist geplant, aber DNS steht aus (siehe „Custom-Domain umziehen" unten).
- **Architektur:** Hybrid — `/` ist One-Pager mit allen Sektionen scrollbar; zusaetzlich gibt es **eigene Detail-Seiten pro Sektion** (`/angebote`, `/training`, ...).
- **Inhalte:** Liegen als **Markdown + JSON** unter `src/content/` und `src/data/`. Pflege ohne Astro-Code anfassen zu muessen.
- **Schema-Validierung:** Zod-Schemas in [`src/content.config.ts`](./src/content.config.ts). Falsches Frontmatter = Build-Fehler in GitHub Actions = Site geht NICHT kaputt online.
- **Deploy:** Push auf `main` → GitHub Actions ([`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)) → fertig in ~30 s.
- **Lokal:** `npm install && npm run dev` (auf http://localhost:4321).

---

## Wo aendere ich was?

Quick-Lookup. **Erste Anlaufstelle**, bevor du Code suchst.

| Aenderung | Datei(en) |
|---|---|
| **Vereinsdaten** (Name, Anschrift, E-Mail, Registergericht/-nummer) | [`src/data/verein.json`](./src/data/verein.json) — wird in Footer + Impressum + Datenschutz gelesen |
| Vorstandsbesetzung | [`src/data/vorstand.json`](./src/data/vorstand.json) — wird in Footer + Impressum gelesen |
| Mitgliedsbeitraege (Preise) | [`src/data/preise.json`](./src/data/preise.json) |
| Veranstaltung hinzufuegen / aendern | **Im Vereinsplaner** anlegen — die Website holt den Feed automatisch (siehe Abschnitt „Bevorstehende Termine" weiter unten). |
| Timeline-Eintrag (Geschichte) | [`src/content/geschichte/*.md`](./src/content/geschichte/) |
| Angebot-Karte | [`src/content/angebote/*.md`](./src/content/angebote/) |
| Mitgliedschafts-Card (CMAS/VDST/TSV) | [`src/content/mitgliedschaften/*.md`](./src/content/mitgliedschaften/) |
| Section-Titel/Subtitle/Navbar-Label/CTA | [`src/content/sections/<slug>.md`](./src/content/sections/) (Frontmatter) |
| Trainings-Adresse, Schedule, Bilder, Map | `src/content/sections/training.md` (Frontmatter `training:`) |
| Kontaktdaten + Formular-URL | `src/content/sections/kontakt.md` (Frontmatter `kontakt:`) |
| Impressum-Text | [`src/pages/impressum.astro`](./src/pages/impressum.astro) (Vorstand kommt aus `vorstand.json`, Adresse aus `verein.json`) |
| Datenschutz-Text | [`src/pages/datenschutz.astro`](./src/pages/datenschutz.astro) (Adresse + E-Mail aus `verein.json`) |
| Hero-Tagline | [`src/components/Hero.astro`](./src/components/Hero.astro) (hartcodiert) |
| Stats-Zahlen (60 Jahre, 45 Mitglieder, ...) | [`src/data/stats.json`](./src/data/stats.json) |
| **Cookie-Banner-Konfiguration** | [`public/klaro/klaro-config.js`](./public/klaro/klaro-config.js) (Services, deutsche Texte) |
| Cookie-Banner-Styling | `src/styles/global.css` — Block „Klaro Privacy Manager – Theme" |
| **Bilder/Medien** | [`public/images/`](./public/images/) — neue Bilder hier ablegen, im Markdown als `/images/...` referenzieren (`assetUrl()` macht den Rest) |
| Globales Design / CSS | [`src/styles/global.css`](./src/styles/global.css) |
| SEO `<head>`, JSON-LD, Favicon, OG-Image | [`src/layouts/BaseLayout.astro`](./src/layouts/BaseLayout.astro) |
| GitHub-Actions-Workflow | [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) |
| Astro-Routing/Site/Base | [`astro.config.mjs`](./astro.config.mjs) |
| Erlaubte Icon-Slugs erweitern | Schema in `content.config.ts` **und** entsprechende `*Icon.astro`-Komponente in [`src/components/icons/`](./src/components/icons/) |

**Nach Aenderung:** lokal `npm run dev` oder direkt `git commit && git push` — Action validiert + deployt.

---

## Architektur in einem Bild

```
┌──────────────────────────────────────────────────────────────────────┐
│  Markdown / JSON unter src/content/ + src/data/                      │
│                                                                      │
│   src/content/sections/<slug>.md   ← Section-Metadaten (7 Files)     │
│        + optional Section-spezifische Strukturdaten im Frontmatter   │
│   src/content/<items>/*.md         ← Items-Listen (angebote, etc.)   │
│   src/data/<file>.json             ← Reine Daten (vorstand, preise)  │
└─────────────────────────┬────────────────────────────────────────────┘
                          │ (Zod-Schemas validieren beim Build)
                          ▼
┌──────────────────────────────────────────────────────────────────────┐
│  src/content.config.ts                                               │
│  Definiert 7 Collections: sections, angebote, mitgliedschaften,      │
│  veranstaltungen, geschichte, vorstand, preise                       │
└─────────────────────────┬────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Astro-Komponenten lesen via getCollection() + render()              │
│                                                                      │
│   SectionRenderer.astro  ← dispatched section.id → richtige Komp.    │
│   {Angebote,Training,...}.astro  ← rendert eine Section              │
│   Navbar.astro / Footer.astro  ← liest sections-Collection           │
│                                                                      │
│  Props-Konvention: `section: CollectionEntry<'sections'>`            │
│                    `isStandalone?: boolean`                          │
└─────────────────────────┬────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Pages — generieren statische HTML-Routen                            │
│                                                                      │
│   src/pages/index.astro       → /                (One-Pager)         │
│   src/pages/[slug].astro      → /angebote, ...   (Detail je Sect.)   │
│   src/pages/impressum.astro   → /impressum       (LegalLayout)       │
│   src/pages/datenschutz.md    → /datenschutz     (LegalLayout)       │
└──────────────────────────────────────────────────────────────────────┘
```

**Eintrittspunkte beim Build:** `index.astro` (rendert alle Sections inline) und `[slug].astro` (`getStaticPaths` ueber sections-Collection → eine HTML-Seite pro Section).

---

## URL-/Routing-Modell

- **`base: '/duc-website'`** in `astro.config.mjs`, weil Project-Site (kein User-Site-Repo). Alle Pfade haben dieses Prefix.
- **`import.meta.env.BASE_URL`** ist im Build `'/duc-website'` (**ohne** trailing slash). Deshalb gibt es drei Helper in [`src/utils/url.ts`](./src/utils/url.ts):
  - `pathTo(slug)` — baut absolute Pfade wie `/duc-website/angebote` korrekt zusammen.
  - `ctaHref(href, isStandalone)` — loest CTA-Links kontextabhaengig auf: `#angebote` im One-Pager (smooth scroll), `/duc-website/angebote` auf Detail-Seite.
  - `assetUrl(src)` — resolved Asset-Pfade. Externe URLs (`https://...`, `mailto:`, `data:`) werden durchgereicht, lokale Pfade (`/images/foo.jpg`) bekommen den Site-Base praefigiert (`/duc-website/images/foo.jpg`). Damit kann man im Markdown immer `/images/...` schreiben und der Helper macht den Rest.

**Teilbare URLs im One-Pager (History API):** Beim Klick auf einen Section-Anchor (`#angebote`) auf `/` aktualisiert ein JS-Handler die URL via `history.pushState` auf `/duc-website/angebote`. Scroll-Spy synchronisiert URL passiv mit `replaceState`. Wer die URL teilt, landet auf der statischen Detail-Seite. Astro hat dafuer kein built-in Pattern — Plain JS in `BaseLayout.astro` ist der von der Doku empfohlene Weg.

**`isStandalone`-Prop-Konvention:** jede Sektion-Komponente und die Navbar bekommen optional `isStandalone={true}`. Default ist `false` (One-Pager-Mode).
- On `/` (One-Pager): `isStandalone=false`. Navbar nutzt Anchor-Links, CTAs scrollen.
- On `/[slug]` (Detail-Seite): `isStandalone=true`. Navbar zeigt Pfad-Links, CTAs sind echte Navigation.

**NIE direkt `import.meta.env.BASE_URL` mit String-Concat zusammenkleben** — immer `pathTo()` benutzen, sonst gibt es `/duc-websiteangebote`-Bugs.

---

## Content-Collections-Schema (Cheat-Sheet)

Alle Schemas: [`src/content.config.ts`](./src/content.config.ts). Quick-Reference:

### `sections` (`src/content/sections/*.md`)
Gemeinsame Metadaten pro Top-Level-Sektion + section-spezifische Sub-Objekte.

```yaml
title: string                       # Sichtbare Ueberschrift
subtitle?: string                   # Subline unter dem Titel
navLabel?: string                   # Wenn gesetzt → erscheint in Navbar
order: number                       # Reihenfolge im One-Pager + Navbar
cta?:                               # Optionaler Call-to-Action-Button
  text: string
  href: string                      # Slug, "#kontakt" oder "/kontakt"

# Sektion-spezifisch (nur dort befuellen wo passend):
training?:                          # nur in training.md
  ort, beschreibung, schedule[], bilder[], mapEmbedUrl
kontakt?:                           # nur in kontakt.md
  items[] (icon: pin|pool|mail|clock, label, text), formEmbedUrl
mitgliedschaften_footer?: string    # nur in mitgliedschaften.md
```

### `angebote` (`src/content/angebote/*.md`)
```yaml
titel: string
icon: 'freitauchen'|'hallenbad'|'freiwasser'|'wettkampf'|'clubfahrten'|'app'
order: number
# Body: Markdown-Beschreibung (rendert in der Karte)
```

### Termine + Trainings — Live-Feed aus dem Vereinsplaner

Drei separate Collections mit demselben Schema, siehe weiter unten unter „Schemas: veranstaltungen + vergangene-termine + trainings" und „Bevorstehende Termine".

### `geschichte` (`src/content/geschichte/*.md`)
```yaml
jahr: string                        # "1961" oder "18. Mai 2025"
titel: string
icon: 'diver'|'document'|'trophy'|'compass'|'star'|'medal'
highlight?: boolean                 # true → goldener Hintergrund
order: number
# Body: Karten-Text (inline HTML erlaubt, z.B. Medaillen-SVGs)
```

### `mitgliedschaften` (`src/content/mitgliedschaften/*.md`)
```yaml
name: string                        # CMAS, VDST, TSV NRW
untertitel: string
url: string                         # Web-URL zum Verband
logoUrl: string                     # lokal "/images/mitgliedschaften/cmas.ico" oder externe URL
order: number
```

### `vorstand` (`src/data/vorstand.json`)
JSON-Array, jedes Objekt: `{ id, rolle, name, order }`.

### `preise` (`src/data/preise.json`)
JSON-Array, jedes Objekt: `{ id, gruppe, preis_monat, preis_quartal, icon: 'erwachsene'|'familie'|'jugend', order }`.

### `stats` (`src/data/stats.json`)
JSON-Array fuer die Kennzahlen-Sektion. Jedes Objekt: `{ id, wert, label, order }`. `wert` ist string (statt number), damit auch „60+" oder „ca. 45" gehen.

### `veranstaltungen` + `vergangene-termine` + `trainings` — live aus Vereinsplaner
Drei Collections, alle mit dem gleichen Loader `vereinsplanerLoader({ mode, limit? })`:
- `veranstaltungen` — alle zukuenftigen oeffentlichen Termine (kein Training/Vorstand/Papnoe)
- `vergangene-termine` — letzte 6 vergangenen oeffentlichen Termine (sortiert neueste zuerst, dient als Fuellmaterial in der Liste)
- `trainings` — naechste 6 DUC-Trainings (kein TSV)

Schema einheitlich:
```yaml
summary: string
start: Date
end?: Date
location?: string
description: string
url?: string
```

Filter-Logik in [`src/loaders/vereinsplaner.ts`](./src/loaders/vereinsplaner.ts) anpassen.

### `verein` (`src/data/verein.json`) — kein Schema, direkter Import
Einzelnes JSON-Objekt mit `name`, `shortName`, `anschrift {postfach, plzOrt, land}`, `email`, `emailDatenschutz`, `registergericht`, `registernummer`, `traegervereinHinweis`. Wird per `import verein from '../data/verein.json'` aus Footer, Impressum und Datenschutz gelesen. Single source of truth fuer Vereinsstammdaten.

---

## Wenn du eine neue Icon-Variante brauchst

Icons sind nicht beliebig — sie sind als Slug-Enum im Schema validiert und gemappt in `src/components/icons/<X>Icon.astro`. Um z.B. einen neuen Angebot-Icon `unterwasserhockey` hinzuzufuegen:

1. In [`src/content.config.ts`](./src/content.config.ts) den `z.enum([...])` der entsprechenden Collection erweitern.
2. In [`src/components/icons/AngebotIcon.astro`](./src/components/icons/AngebotIcon.astro) (oder dem passenden) einen neuen `{name === 'unterwasserhockey' && (<svg>...)}`-Block hinzufuegen.
3. Im Markdown `icon: unterwasserhockey` setzen.

Reihenfolge ist wichtig: Schema zuerst, sonst Build-Fehler im Markdown.

---

## Komponenten-Konventionen

### Section-Komponenten (Angebote, Training, Geschichte, Veranstaltungen, Preise, Kontakt, Mitgliedschaften)

Alle haben dieselbe Signatur:

```ts
interface Props {
  section: CollectionEntry<'sections'>;
  isStandalone?: boolean;       // default false
}
```

Sie rendern eine `<section id={section.id}>...</section>` mit konsistentem Section-Titel-Block. Sektion-spezifische Strukturdaten kommen aus `section.data.training` / `section.data.kontakt` etc. Items-Collections werden per `getCollection('xyz')` geladen.

### `SectionRenderer.astro`
Dispatcher. Bekommt `section` und `isStandalone`, rendert die passende konkrete Komponente nach `section.id`. **Wenn du eine neue Sektion hinzufuegst, hier den Switch erweitern.**

### Hero + Stats
Hartcodiert in eigenen Komponenten, **nicht** in sections-Collection. Stats wird im One-Pager nach Geschichte eingefuegt (siehe `index.astro`). Hero erscheint nur auf `/`, nicht auf Detail-Seiten.

### Pages/Detail-Layout
`src/pages/[slug].astro` macht `getStaticPaths` ueber alle sections-Eintraege. Standalone-Pages bekommen `padding-top: 6rem` damit Inhalt nicht hinter der Fixed-Navbar verschwindet.

### Impressum + Datenschutz (Astro-Pages)
`src/pages/impressum.astro` und `src/pages/datenschutz.astro` nutzen `LegalLayout.astro` als Wrapper. Inhalte werden als HTML in Astro (nicht Markdown) geschrieben, damit dynamische Daten aus `verein.json` + `vorstand.json` per `getCollection`/`import` eingebunden werden koennen. **Adressaenderungen → `verein.json` editieren, beides spiegelt automatisch.**

### Cookie-Banner (Klaro!)
`public/klaro/klaro.js` (lokal gehostet, kein CDN-Call) + `public/klaro/klaro-config.js` definieren das Banner. In `BaseLayout.astro` werden beide per `<script is:inline defer>` eingebunden — Reihenfolge wichtig: Config zuerst, dann Klaro. Drittanbieter-Iframes (Google Maps in Training, Vereinsplaner in Kontakt) sind als `<iframe data-name="..." data-src="...">` markiert und werden nur nach Consent geladen. Theme (gold/blau) in `src/styles/global.css` unter „Klaro Privacy Manager – Theme". Footer hat einen „Cookie-Einstellungen"-Link der `klaro.show()` aufruft.

**Neuen Drittanbieter-Service hinzufuegen:**
1. In `klaro-config.js` einen neuen Eintrag in `services[]` mit eindeutigem `name` + deutscher Beschreibung in `translations.de` ergaenzen.
2. Das einzubindende `<iframe>` oder `<script>` umstellen auf `<iframe data-name="<name>" data-src="...">` bzw. `<script type="text/plain" data-name="<name>" data-src="...">`.

### Fonts
**Keine Google-Fonts.** Inter Variable kommt als NPM-Paket `@fontsource-variable/inter` (SIL Open Font License, von Rasmus Andersson) und wird in `BaseLayout.astro` lokal importiert. Damit fliesst nichts an Google.

### Bevorstehende Termine (Vereinsplaner-Feed)

Die Veranstaltungen-Sektion wird **nicht manuell** gepflegt. Sie kommt aus dem oeffentlichen iCal-Feed des Vereinsplaners:

```
https://api.vereinsplaner.at/v1/public/ical/3b22bae6-cb37-4e7c-8da4-f69f4563fd82.ics
```

Workflow:
1. Vorstand legt Events im Vereinsplaner an (Datum, Titel, Beschreibung, Ort).
2. Astro holt den Feed beim Build via [`src/loaders/vereinsplaner.ts`](./src/loaders/vereinsplaner.ts) (Custom Loader, nutzt `node-ical`).
3. Drei Collections mit Filter-Modi:
   - **`veranstaltungen`** (`mode: 'public'`) — alle zukuenftigen oeffentlichen Termine (kein „Training"/„Vorstand"/„Papnoe" im Titel).
   - **`vergangene-termine`** (`mode: 'public-past'`, limit 6) — die letzten oeffentlichen Termine als Fuellmaterial.
   - **`trainings`** (`mode: 'training'`, limit 6) — naechste DUC-Trainings. „Training TSV" wird ausgefiltert (gehoert zum TSV NRW).
4. **`Veranstaltungen.astro`** rendert beides:
   - Block 1: max. 6 Termine kombiniert — zuerst zukuenftige, dann mit vergangenen aufgefuellt. Vergangene haben graue Datums-Kachel + „vergangen"-Badge.
   - Block 2: „Naechste Trainings" — 6 Trainings als kompakte Liste.
5. **Aktualitaet:** GitHub Action laeuft **taeglich um 04:00 UTC** (Cron in `.github/workflows/deploy.yml`). Manuell via `gh workflow run "Deploy to GitHub Pages"`.

**Wenn der Feed nicht erreichbar ist** → leere Collection, Seite zeigt „Aktuell keine Termine eingetragen", deploy laeuft weiter (alte Site bleibt sonst live).

**Filter erweitern/anpassen:** in `src/loaders/vereinsplaner.ts` die Funktion `matchesTitle()` editieren.

---

## Lokale Entwicklung

```bash
npm install
npm run dev          # http://localhost:4321/duc-website/
npm run build        # → dist/ (statische Dateien)
npm run preview      # serviert dist/ lokal
npx astro sync       # types fuer Collections regenerieren (selten noetig)
```

**Wichtig:** Nach Aenderung an `src/content.config.ts` muss der dev-server manchmal neu gestartet werden, sonst sind die Types stale.

### Markdown live editieren
`npm run dev` hat Hot Reload — Markdown-Aenderungen sind sofort sichtbar.

---

## Deployment (Status & Workflow)

**Aktueller Live-Stand:**
- URL: https://duc-essen.github.io/duc-website/
- Source: GitHub Actions (Repo Settings → Pages → Source = „GitHub Actions")
- HTTPS: enforced (automatisch)
- Custom Domain `duc-essen.de`: **noch nicht aktiv** (DNS steht aus). `public/CNAME.disabled` haelt die Datei dokumentiert.

**Workflow ([`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)):**
- Triggert auf Push nach `main`.
- `actions/checkout@v6` → `withastro/action@v6` (build, Node 22) → `actions/deploy-pages@v5`.
- Typische Laufzeit: ~30 s.

**Build-Validation rettet die Live-Site:** Wenn z.B. ein Markdown-Frontmatter ungueltig ist, schlaegt der Build in der Action fehl, deploy wird nicht ausgefuehrt, alte Version bleibt live. Lokaler `npm run build` reproduziert das.

### Custom-Domain umziehen (wenn DNS bereit)

1. DNS bei Provider von `duc-essen.de` setzen:
   - Apex `A`-Records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Optional `www`-`CNAME`: `<gh-user>.github.io`
2. `mv public/CNAME.disabled public/CNAME`
3. In `astro.config.mjs`:
   - `site: 'https://duc-essen.de'`
   - `base` entfernen (oder auf `'/'` setzen)
4. Repo-Settings → Pages → „Custom domain" auf `duc-essen.de` setzen, „Enforce HTTPS" einschalten (sobald TLS-Zertifikat steht).
5. Commit + push. Erste Stunden nach DNS-Aenderung kann es zickig sein.

---

## Konventionen

- **Sprache:** Inhalte und Commit-Messages auf Deutsch. Code-Identifier auf Englisch.
- **Umlaute in Doku/Code-Kommentaren vermeiden** (ASCII-freundlich, weil Terminal/Diff lesbarer). In Website-Inhalten selbstverstaendlich Umlaute verwenden.
- **Schema first:** Neue Felder/Werte immer erst in `content.config.ts` deklarieren, sonst Build-Fehler.
- **Keine externen Tracker / Analytics** ohne explizite Vorstands-Freigabe (Vereinsdatenschutz).
- **SEO erhalten:** Meta-Tags, Open Graph, JSON-LD `SportsClub` aus `BaseLayout.astro` muessen erhalten bleiben.
- **Keine destruktiven Git-Aktionen** (force-push, reset --hard) ohne Rueckfrage.

### LSP-Warnings die man ignorieren kann

Beim Editieren tauchen ueblicherweise diese Diagnose-Meldungen auf, die **harmlos** sind (Build laeuft):

- `content.config.ts: 'z' is deprecated` (★, info-level) — Zod 4 Soft-Deprecation, funktional irrelevant.
- `url.ts: 'import.meta' meta-property is only allowed when...` — LSP-tsconfig-Mismatch, Astro's tatsaechlicher Build nutzt die richtige Konfig.
- `Cannot find module 'astro/loaders'` (gelegentlich nach `npm install`) — verschwindet sobald die Astro-Types in `node_modules/.astro` neu generiert sind (z.B. via `npx astro sync`).

Wenn man trotzdem aufraeumen will: Zod-Import auf `import { z } from 'astro/zod'` umstellen.

---

## Known Limitations / Kleine Schulden

- **Hero** ist eine hartcodierte Komponente — wenn die Tagline pflegbar werden soll, in eine Section/Collection ziehen (siehe TODO.md).
- **Inline-Styles** sind in vielen Komponenten noch reichlich vorhanden (1:1 aus dem Single-File-Entwurf uebernommen). Refactor in CSS-Klassen ist „nice to have", aber funktional irrelevant.
- **Stats-Counter-Animation** (`data-target`-Attribut) wird im aktuellen JS nicht angesprochen — Zahlen sind statisch.
- **`mitgliedschaften`** ist in der `sections`-Collection und hat eine eigene Detail-Seite, taucht aber bewusst nicht in der Navbar auf (`navLabel` ist nicht gesetzt). Wenn das doch erwuenscht ist: `navLabel: Mitgliedschaften` in `sections/mitgliedschaften.md` setzen.
- **`widdauen-2023.mp4`** in `public/media/` ist 91 MB. Funktioniert (unter GitHubs 100-MB-Hard-Limit), aber das Repo waechst dauerhaft. Bei weiteren grossen Videos: Git LFS einrichten oder externes Hosting (z.B. tmhart.de wo das Video herkam) verwenden.

---

## Naechste Schritte

Aktueller Stand und offene Punkte: [TODO.md](./TODO.md).

## Externe Referenzen

- [Astro Docs — Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Docs — Routing](https://docs.astro.build/en/guides/routing/)
- [Astro Docs — Deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
- [withastro/action](https://github.com/withastro/action)
- [Interner Wiki-Artikel (nur Vereinsmitglieder)](https://github.com/martjn-net/deutscher_unterwasserclub_essen/blob/main/wiki/concepts/website-migration-astro-github-pages.md)
