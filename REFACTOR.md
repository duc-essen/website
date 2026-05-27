# Refactor-Vorschlaege

Ergebnis einer Code-Review (Astro v6 Multi-Page-Site, Stand Mai 2026). Zehn konkrete Vorschlaege, sortiert nach Aufwand-Nutzen. Keiner ist umgesetzt — diese Datei ist die Vorlage fuer Entscheidung und schrittweise Umsetzung.

Die Befunde basieren auf einer systematischen Analyse von:
- 18 Astro-Komponenten in `src/components/`
- `src/layouts/BaseLayout.astro` + `LegalLayout.astro`
- `src/styles/global.css` (~1200 Zeilen)
- `src/content.config.ts`
- `src/utils/url.ts`
- `src/data/*.json`

---

## Uebersicht

| # | Vorschlag | Aufwand | Gewinn | Risiko |
|---|---|---|---|---|
| 1 | Inline-Styles raus → CSS-Klassen | mittel (~45 min) | Wartbarkeit, Lesbarkeit | klein |
| 2 | Icon-Komponenten generalisieren | mittel (~45 min) | -110 Zeilen Duplikation | klein |
| 3 | SectionRenderer: Map statt if/else | klein (~10 min) | DRY, neue Sektionen einfacher | minimal |
| 4 | `<CtaButton />` als Komponente | klein (~20 min) | DRY, A11y einheitlich | minimal |
| 5 | Icon-Enums zentralisieren | klein (~20 min) | Single source of truth | klein |
| 6 | BaseLayout.astro aufteilen | gross (~90 min) | Lesbarkeit, Trennung Verantwortung | mittel |
| 7 | global.css modularisieren | mittel (~30 min) | Auffindbarkeit, kein Bundle-Aenderung | minimal |
| 8 | Astro `<Image />` einsetzen | klein (~20 min) | Performance, AVIF/WebP, responsive | klein |
| 9 | Non-Null-Assertions abbauen | klein (~10 min) | Crashes vermeiden | minimal |
| 10 | JSON-LD aus `verein.json` | klein (~15 min) | Single source of truth | minimal |

Seit der ersten Review zwischendurch erledigt: **Stats-Daten** sind jetzt in `src/data/stats.json` statt hartcodiert. Damit sind nur noch der Hero-Block (Tagline + CTAs) und das JSON-LD im BaseLayout als „hartcodiert" uebrig.

**Empfehlung**: Drei Pakete je nach Zeitbudget — siehe Ende.

---

## 🔴 1. Inline-Styles raus → CSS-Klassen

**Befund:** 43 Inline-`style="..."`-Stellen, hauptsaechlich in Veranstaltungen, Preise, Kontakt, Mitgliedschaften, Footer — 1:1-Uebernahme aus dem Single-File-Entwurf.

**Beispiele:**
- `Veranstaltungen.astro` Zeilen 27-37 (Card-Styles), 39-45 (Info-Box)
- `Preise.astro` Zeile 26 (`style="color: var(--blue);"`), Zeile 34 (`text-align: center; margin-top: 2rem;`)
- `Kontakt.astro` Zeilen 27, 32, 38, 42 (CTA + Iframe-Wrapper)
- `Mitgliedschaften.astro` Zeilen 16, 20, 28-35 (komplette Card-Struktur)

**Vorher:**
```astro
<h3 style="color: var(--blue); margin-bottom: 0.5rem;">{titel}</h3>
<div style="background: var(--gray-light); padding: 1rem; border-radius: 10px;">...</div>
```

**Nachher:**
```astro
<h3 class="card-title">{titel}</h3>
<div class="info-box">...</div>
```

**Plan:**
1. Wiederkehrende Style-Cluster identifizieren (Card, Info-Box, Centered-CTA, Badge etc.)
2. Klassen in `_components.css` oder in scoped `<style>`-Bloecken der Komponente
3. Komponenten-fuer-Komponenten umstellen, jedes Mal bauen + visuell pruefen

**Gewinn:** Markup deutlich kuerzer, Theming an einer Stelle, DevTools-Friendly.

---

## 🟠 2. Icon-Komponenten generalisieren

**Befund:** 5 Icon-Komponenten mit identischem Pattern, ~110 Zeilen Duplikation:
- `src/components/icons/AngebotIcon.astro` (6 Slugs)
- `src/components/icons/EventIcon.astro` (6 Slugs)
- `src/components/icons/TimelineIcon.astro` (6 Slugs)
- `src/components/icons/PriceIcon.astro` (3 Slugs)
- `src/components/icons/KontaktIcon.astro` (4 Slugs)

**Jede Datei ist im Prinzip:**
```astro
{name === 'foo' && <svg>...</svg>}
{name === 'bar' && <svg>...</svg>}
```

**Vorher (4 Importe):**
```astro
import AngebotIcon from './icons/AngebotIcon.astro';
<AngebotIcon name={entry.data.icon} />
```

**Nachher (1 Import):**
```astro
import Icon from './Icon.astro';
<Icon catalog="angebote" name={entry.data.icon} />
```

**Plan:**
- SVG-Maps in `src/data/icons/{angebote,events,timeline,preise,kontakt}.ts` (TypeScript-typsicher) oder als JSON.
- Eine generische `Icon.astro`, die nach `catalog` + `name` lookupt.
- Schema-Enums (siehe #5) ziehen daraus.

**Gewinn:** 5 Komponenten → 1; neuer Icon-Slug = ein Eintrag statt drei Stellen.

---

## 🟠 3. SectionRenderer: Map statt if/else

**Befund:** `SectionRenderer.astro` hat 7 `{section.id === '…' && <…>}`-Zeilen.

**Vorher:**
```astro
{section.id === 'angebote' && <Angebote section={section} isStandalone={isStandalone} />}
{section.id === 'training' && <Training section={section} isStandalone={isStandalone} />}
{section.id === 'geschichte' && <Geschichte section={section} isStandalone={isStandalone} />}
... (7x)
```

**Nachher:**
```astro
---
const COMPONENTS = {
  angebote: Angebote,
  training: Training,
  geschichte: Geschichte,
  veranstaltungen: Veranstaltungen,
  preise: Preise,
  kontakt: Kontakt,
  mitgliedschaften: Mitgliedschaften,
} as const;

const Comp = COMPONENTS[section.id as keyof typeof COMPONENTS];
---
{Comp && <Comp section={section} isStandalone={isStandalone} />}
```

**Plan:** Strikt typisieren, sodass eine neue Sektion in `sections`-Collection einen TypeScript-Compilerfehler ausloest, wenn sie nicht in `COMPONENTS` registriert ist.

**Gewinn:** Eine Sektion mehr = ein Map-Eintrag.

---

## 🟠 4. `<CtaButton />` als Komponente

**Befund:** `<a class="btn btn-primary">{text}</a>` taucht in 7+ Stellen auf, jedes Mal mit derselben `ctaHref(...)`-Logik aussen rum.

**Vorher (siehe z.B. `Angebote.astro`, `Training.astro`, `Geschichte.astro`, `Preise.astro`):**
```astro
const ctaLink = ctaHref(section.data.cta?.href, isStandalone);
---
{section.data.cta && ctaLink && (
  <a href={ctaLink} class="btn btn-primary">{section.data.cta.text}</a>
)}
```

**Nachher:**
```astro
<CtaButton cta={section.data.cta} isStandalone={isStandalone} />
```

Wo `<CtaButton />`:
- den `ctaHref`-Call internalisiert
- `variant`-Prop (`primary | secondary | outline`)
- einheitliche A11y (aria-Attribute, focus-Ring konsistent)
- nichts rendert wenn `cta` undefined

**Gewinn:** Eine Codestelle fuer alle CTAs, A11y konsistent.

---

## 🟡 5. Icon-Enums zentralisieren

**Befund:** In `content.config.ts` stehen drei separate `z.enum([...])`:
- angebote-Icons (`freitauchen` | `hallenbad` | …)
- geschichte-Icons (`diver` | `document` | …)
- preise-Icons (`erwachsene` | `familie` | `jugend`)

(Veranstaltungen-Icons werden inzwischen per `guessIcon()` aus dem Event-Titel ermittelt, kein Schema noetig.)

**Vorher:**
```ts
// content.config.ts
icon: z.enum(['freitauchen', 'hallenbad', 'freiwasser', 'wettkampf', 'clubfahrten', 'app']),
```

**Nachher:**
```ts
// src/types/icons.ts
export const ANGEBOT_ICONS = ['freitauchen', 'hallenbad', ...] as const;
export type AngebotIcon = (typeof ANGEBOT_ICONS)[number];

// content.config.ts
import { ANGEBOT_ICONS } from './types/icons';
icon: z.enum(ANGEBOT_ICONS),
```

**Gewinn:** Die Enum-Liste kann zwischen Schema-Validierung, generischer Icon-Komponente (#2) und ggf. weiteren Stellen geteilt werden. Kein Drift mehr.

---

## 🟡 6. BaseLayout.astro aufteilen

**Befund:** `BaseLayout.astro` ist 260+ Zeilen mit **drei** Verantwortungen vermischt:

1. **SEO-Head + JSON-LD** (Zeilen 22-99) — JSON-LD ist hartcodiert: Logo, Adresse, Sport-Liste, etc. Sollte aus `verein.json` kommen.
2. **Bubbles-Hintergrund** (Zeilen 113-125) — 10x `<div class="bubble">` hartcodiert, dazu in `global.css` 10x `:nth-child` CSS-Regeln.
3. **Inline-Scripts** (Zeilen 136-260) — 120 Zeilen JS fuer Mobile-Menu, Scroll-Spy, Smooth-Scroll, History-API, Back-to-Top.

**Vorschlag — aufteilen in:**
```
src/components/SeoHead.astro    ← SEO + JSON-LD (greift auf verein.json zu)
src/components/Bubbles.astro    ← Astro-Loop + CSS-Variablen (per Bubble)
src/components/BackToTop.astro  ← Button + Listener (klein)
src/scripts/layout.ts            ← extrahierte Scripts (Module mit Type-Defs)
src/layouts/BaseLayout.astro     ← schrumpft auf ~80 Zeilen
```

**Konkret fuer Bubbles:**
```astro
---
// Bubbles.astro
const bubbles = [
  { size: 40, left: '10%', duration: 8 },
  { size: 20, left: '20%', duration: 5, delay: 1 },
  ...
];
---
<div class="bubbles" aria-hidden="true">
  {bubbles.map((b) => (
    <div class="bubble" style={`--size: ${b.size}px; --left: ${b.left}; --duration: ${b.duration}s; --delay: ${b.delay ?? 0}s;`}></div>
  ))}
</div>
```

CSS reduziert sich von 10 :nth-child-Regeln auf eine Regel mit Custom-Properties.

**Gewinn:** BaseLayout wird wartbar, JSON-LD wird konsistent mit Impressum/Datenschutz/Footer.

---

## 🟡 7. global.css modularisieren

**Befund:** 1200+ Zeilen in einer Datei. Alles vermischt: Reset, Typography, Hero, Navbar, Section-Layout, Animation, Klaro-Theme, Print-Rules.

**Vorschlag:**
```
src/styles/
├── _vars.css        (custom props: --gold, --blue, ...)
├── _base.css        (Reset, html/body, Typography, focus-Rings)
├── _layout.css      (Navbar, Hero, Section, Footer)
├── _components.css  (Buttons, Cards, Timeline, Badges)
├── _animations.css  (Bubbles, Fade-In, Wobble, Wave)
├── _klaro.css       (Cookie-Banner-Theme)
└── global.css       (importiert alle obigen)
```

Build-Bundle bleibt identisch (Vite resolved/bundlet); aber „wo ist diese Hover-Regel?" wird beantwortbar.

**Gewinn:** Auffindbarkeit, kein Build-Effekt.

---

## 🟢 8. Astro `<Image />` einsetzen

**Befund:** Trainings-Bilder und Mitgliedschafts-Logos werden mit `<img>` + `loading="lazy"` eingebunden — kein AVIF/WebP, kein responsive `srcset`, keine Format-Auswahl.

**Vorher (Training.astro):**
```astro
<img src={assetUrl(bild.url)} alt={bild.alt} loading="lazy" style="..." />
```

**Nachher:**
```astro
import { Image } from 'astro:assets';

<Image
  src={bild.url}
  alt={bild.alt}
  widths={[400, 800, 1200]}
  sizes="(max-width: 768px) 100vw, 33vw"
  format="avif"
/>
```

**Voraussetzung:** Bilder muessen in `src/assets/` liegen (nicht `public/`), damit Astro sie zum Build-Zeitpunkt verarbeiten kann. → Migration der bereits lokal vorhandenen Files.

**Gewinn:** Lighthouse-Score, mobile Ladezeit, deutlich kleinere Bilder ohne Qualitaetsverlust.

---

## 🟢 9. Non-Null-Assertions abbauen

**Befund:**
- `src/components/Kontakt.astro:10` — `const k = section.data.kontakt!;`
- `src/components/Training.astro:10` — `const t = section.data.training!;`

Wenn jemand die Section ohne diese Sub-Daten rendert → Runtime-Crash mit hauptschwer lesbarer Fehlermeldung.

**Vorschlag (defensive):**
```ts
if (!section.data.training) {
  throw new Error(`Section ${section.id} missing 'training' frontmatter block`);
}
const t = section.data.training;
```

**Saubererer (strukturell):** Zod `discriminatedUnion` in `content.config.ts`, sodass `training-section` ein eigener Sub-Typ ist und `section.data.training` zur Compile-Zeit garantiert vorhanden ist. Aufwand etwas hoeher, dafuer kein Runtime-Risk.

---

## 🟢 10. JSON-LD aus `verein.json`

**Befund:** `BaseLayout.astro` Zeilen 56-89 — JSON-LD `SportsClub`-Strukturdaten sind hartcodiert (Logo, Adresse, E-Mail, Sport-Liste, OG-Bild).

**Vorher:**
```ts
{
  '@context': 'https://schema.org',
  '@type': 'SportsClub',
  name: 'Deutscher Unterwasserclub Essen e.V.',  // <-- hartcodiert
  email: 'info@duc-essen.de',                     // <-- hartcodiert
  ...
}
```

**Nachher:**
```ts
import verein from '../data/verein.json';

{
  '@context': 'https://schema.org',
  '@type': 'SportsClub',
  name: verein.name,
  alternateName: verein.shortName,
  email: verein.emailDatenschutz,
  address: { '@type': 'PostalAddress', streetAddress: ..., postalCode: ..., ... },
  ...
}
```

Sport-Liste, Opening Hours koennen weiterhin hartcodiert bleiben (gehoeren nicht in Vereinsstammdaten) oder spaeter in eine `seo.json` oder eigene Section umziehen.

**Gewinn:** Adressaenderung an einer Stelle, kein Drift zwischen sichtbarem Footer/Impressum und JSON-LD.

---

## Allgemeine Beobachtungen

| Aspekt | Status |
|---|---|
| TypeScript Strict | ✅ aktiv |
| Type Casts mit `!` | ⚠️ siehe #9 |
| Accessibility | 🟡 Skip-Link + Focus-Rings ✅, `aria-label` nicht ueberall |
| Image-Optimierung | ❌ siehe #8 |
| Unit Tests | ❌ 0 Tests (z.B. fuer `pathTo()`, `ctaHref()`, `assetUrl()`) — `vitest` einrichten waere sinnvoll wenn der `url.ts`-Helper waechst |
| Bundle-Groesse | Heute OK, weil grossteils statisches HTML/CSS |

---

## Empfohlene Pakete

| Paket | Inhalt | Gesamt-Aufwand |
|---|---|---|
| **Quick Wins** | 3, 4, 9, 10 | ~1 h |
| **Tiefes Aufraeumen** | + 1, 2, 5, 7 | ~3 h |
| **Komplettpaket** | + 6, 8 | ~5 h |

Jedes Paket erweitert das vorherige. Alle aufeinander aufbauend, kein Konflikt untereinander. Empfohlene Reihenfolge: **3 → 5 → 2 → 4 → 1 → 7 → 10 → 9 → 6 → 8** (von minimalem Risiko zu architekturveraendernd).
