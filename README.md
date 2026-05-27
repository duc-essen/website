# DUC Essen Website

Quellcode der Vereinswebsite des **Deutschen Unterwasserclub Essen e.V.**

- **Live:** [duc-essen.github.io/duc-website](https://duc-essen.github.io/duc-website/) (Default-URL bis DNS-Umzug auf [duc-essen.de](https://duc-essen.de))
- **Stack:** [Astro v6](https://astro.build/), statisches Hosting auf GitHub Pages, Deployment via GitHub Actions.

## Lokale Entwicklung

```bash
npm install
npm run dev          # Dev-Server auf http://localhost:4321
npm run build        # Production-Build nach dist/
npm run preview      # Production-Build lokal vorschauen
```

## Inhalte pflegen

Die meisten Vereinsinhalte liegen als Markdown bzw. JSON in [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/). Neue oder geaenderte Eintraege brauchen **keinen Astro-Code anzufassen** — einfach Datei anlegen/bearbeiten, committen, pushen.

Vor dem Deploy validiert Astro alle Eintraege gegen das Schema in [`src/content.config.ts`](./src/content.config.ts). Fehlende oder falsch geschriebene Felder fuehren zu einem klaren Build-Fehler in der GitHub-Action — die Seite geht nicht kaputt online.

### Neue Veranstaltung hinzufuegen

**Im Vereinsplaner** anlegen — die Website holt sich automatisch alle oeffentlichen, zukuenftigen Termine aus dem iCal-Feed. Du musst kein Code anfassen.

- Titel sollte sprechend sein (ist die Headline der Karte).
- Beschreibung kommt 1:1 als Karten-Text auf der Seite.
- Datum + Uhrzeit + Ort werden automatisch formatiert.
- Termine deren Titel „Training", „Vorstand" oder „Papnoe" enthaelt, werden ausgefiltert (interne Termine).

Aktualitaet: GitHub Action laeuft taeglich um 04:00 UTC und holt den Feed neu. Manuelles Re-Build per `gh workflow run "Deploy to GitHub Pages"`.

Loader-Konfiguration: [`src/loaders/vereinsplaner.ts`](./src/loaders/vereinsplaner.ts).

### Geschichte / Timeline-Eintrag

Datei `src/content/geschichte/07-neuer-meilenstein.md`:

```markdown
---
jahr: "2027"           # Beliebiger String, z.B. "1961" oder "18. Mai 2025"
titel: Neuer Meilenstein
icon: trophy           # diver | document | trophy | compass | star | medal
highlight: false       # true = goldener Hintergrund (Hervorhebung)
order: 7
---

Beschreibungstext der Karte. Markdown + inline HTML erlaubt.
```

### Vorstand (Footer)

Eine einzelne JSON-Datei: [`src/data/vorstand.json`](./src/data/vorstand.json). Einfach Liste editieren — Reihenfolge ueber `order`.

### Mitgliedsbeitraege

[`src/data/preise.json`](./src/data/preise.json) — `icon` nur `erwachsene` | `familie` | `jugend`.

### Layout-Texte und Strukturseiten

Reine Layout-Inhalte (Hero-Tagline, Trainingszeiten, Kontaktdaten, Mitgliedschafts-Badges) liegen direkt in den Astro-Komponenten unter [`src/components/`](./src/components/). Aenderungen dort funktionieren genauso (kleinere Code-Edits), benoetigen aber etwas mehr Vorsicht beim HTML.

## Deployment

Push auf `main` ⇒ GitHub Actions ([`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)) baut und deployed automatisch nach GitHub Pages. Kein manueller Schritt noetig — auf der **Actions**-Tab im Repo sieht man jeden Lauf in Echtzeit.

Sobald DNS fuer `duc-essen.de` auf GitHub Pages zeigt: `public/CNAME.disabled` → `public/CNAME` umbenennen, in `astro.config.mjs` `site` auf `https://duc-essen.de` und `base` entfernen.

## Weitere Doku

- **[AGENTS.md](./AGENTS.md)** — Projektkontext, Konventionen, Verzeichnis-Layout (auch fuer KI-Agenten als Briefing geeignet; `CLAUDE.md` ist Symlink darauf).
- **[TODO.md](./TODO.md)** — offene Punkte (DNS-Umzug, weitere Inhalte auf Collections umstellen, Cleanup).
- **Interner Wiki-Artikel** (nur Vereinsmitglieder): [Website-Migration Astro + GitHub Pages](https://github.com/martjn-net/deutscher_unterwasserclub_essen/blob/main/wiki/concepts/website-migration-astro-github-pages.md).
