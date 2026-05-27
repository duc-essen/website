# DUC Essen Website

Quellcode der Vereinswebsite **[duc-essen.de](https://duc-essen.de)** des Deutschen Unterwasserclub Essen e.V.

## Stand

Single-File-HTML-Entwurf (`index.html`). Geplant: Migration auf [Astro](https://astro.build/) mit Deployment via GitHub Pages auf die Custom Domain `duc-essen.de`.

## Pflege

Die Inhalte werden LLM-gestützt gepflegt (Markdown-zentrierter Workflow). Architektur- und Migrations-Kontext liegt im internen Verwaltungs-Repo des Vereins.

## Lokale Vorschau

```bash
python3 -m http.server 8000
# dann http://localhost:8000 oeffnen
```
