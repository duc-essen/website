# AGENTS.md — DUC Essen Website

Hinweise fuer KI-Agenten (Claude Code, Codex, Cursor, etc.) und menschliche Mitarbeitende, die in diesem Repo arbeiten. `CLAUDE.md` ist ein Symlink auf diese Datei.

## Projektkontext

- **Repository:** Quellcode der Vereinswebsite **[duc-essen.de](https://duc-essen.de)** des Deutschen Unterwasserclub Essen e.V.
- **Aktueller Stand:** Astro-Projekt, gebaut aus dem urspruenglichen Single-File-Entwurf `index.html` (~1800 Zeilen). Komponenten unter `src/components/`, Layout in `src/layouts/BaseLayout.astro`, globales CSS in `src/styles/global.css`. Build per `npm run build` erfolgreich (~70 KB statisches HTML).
- **Legacy:** Das urspruengliche `index.html` liegt noch im Repo als Referenz / Quelle. Sobald die Astro-Version live ist, kann es entfernt werden.
- **Hosting:** GitHub Pages mit Custom Domain `duc-essen.de` (`public/CNAME`).
- **Deployment:** GitHub Actions Workflow `.github/workflows/deploy.yml` mit `withastro/action`.
- **Inhaltspflege:** LLM-gestuetzt, Markdown-zentriert (Content Collections in `src/content/`). Vereinsmitglieder sollen Inhalte ueber Markdown-Dateien pflegen koennen, ohne Astro-Komponenten anzufassen.

Architektur- und Migrationskontext liegt im internen Verwaltungs-Repo: [Wiki-Artikel: Website-Migration Astro + GitHub Pages](https://github.com/martjn-net/deutscher_unterwasserclub_essen/blob/main/wiki/concepts/website-migration-astro-github-pages.md) (Zugriff nur fuer Vereinsmitglieder).

## Tech Stack (Ziel)

| Bereich | Wahl |
|---|---|
| Framework | Astro v6 (statisch, kein SSR) |
| Sprache | TypeScript fuer Komponenten/Configs, Markdown fuer Inhalte (geplant) |
| Styling | Globales CSS (`src/styles/global.css`), aus `index.html` uebernommen |
| Hosting | GitHub Pages mit Custom Domain `duc-essen.de` |
| CI/CD | GitHub Actions ([`withastro/action@v6`](https://github.com/withastro/action) + `actions/deploy-pages@v5`) |
| Node | 22 (Default der Action) |
| Paketmanager | npm (`package-lock.json` ist committet) |

## Verzeichnis-Layout (Ist-Stand)

```
.
├── AGENTS.md                  ← diese Datei (Quelle)
├── CLAUDE.md                  ← Symlink → AGENTS.md
├── README.md
├── TODO.md
├── index.html                 ← Legacy Single-File-Entwurf (Quelle der Migration)
├── astro.config.mjs
├── tsconfig.json
├── package.json / package-lock.json
├── public/
│   └── CNAME                  ← "duc-essen.de"
├── src/
│   ├── layouts/BaseLayout.astro    ← head, SEO, JSON-LD, Bubbles, Scripts
│   ├── components/
│   │   ├── DucLogo.astro           ← grosses SVG-Logo (Navbar + Hero)
│   │   ├── Navbar.astro
│   │   ├── Hero.astro
│   │   ├── Angebote.astro
│   │   ├── Training.astro
│   │   ├── Geschichte.astro
│   │   ├── Stats.astro
│   │   ├── Veranstaltungen.astro
│   │   ├── Preise.astro
│   │   ├── Kontakt.astro
│   │   ├── Mitgliedschaften.astro
│   │   └── Footer.astro
│   ├── pages/index.astro
│   └── styles/global.css
└── .github/workflows/deploy.yml    ← withastro/action → GitHub Pages
```

## Lokale Entwicklung

```bash
npm install
npm run dev          # Dev-Server auf http://localhost:4321
npm run build        # Production-Build nach dist/
npm run preview      # Production-Build lokal vorschauen
```

Legacy-Vorschau des Single-File-Entwurfs (`index.html`), solange er noch im Repo liegt:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Deployment

Push auf `main` ⇒ GitHub Action baut Astro ⇒ deployed auf GitHub Pages ⇒ `duc-essen.de` (via `public/CNAME` + DNS).

In den Repo-Settings unter **Pages** muss als Source **„GitHub Actions"** ausgewaehlt sein.

## Konventionen fuer Agenten

- **Sprache:** Inhalte und Commit-Messages auf Deutsch, Code-Identifier auf Englisch.
- **Umlaute in dieser Repo-Doku vermeiden** (ASCII-freundlich halten), in den oeffentlichen Website-Inhalten selbstverstaendlich verwenden.
- **Bestehende Inhalte aus `index.html` sind die Quelle der Wahrheit** fuer die Migration — Texte, Trainingszeiten, Adressen, JSON-LD-Strukturen unveraendert uebernehmen.
- **Keine externen Tracker / Analytics** ohne explizite Freigabe (Datenschutz Verein).
- **SEO erhalten:** Meta-Tags, Open Graph, JSON-LD `SportsClub` aus dem aktuellen `index.html` muessen in der Astro-Version erhalten bleiben.
- **Bilder von `duc-essen.de/wp-content/...`:** aktuell extern verlinkt; pruefen, ob sie lokal ins Repo wandern sollen.
- **Keine destruktiven Git-Aktionen** (force-push, reset --hard) ohne Rueckfrage.

## Naechste Schritte

Siehe [TODO.md](./TODO.md).
