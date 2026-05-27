/**
 * Single source of truth fuer alle Icon-Slugs der Site.
 *
 * Werden importiert von:
 * - `src/content.config.ts` (zod-Schemas)
 * - `src/components/icons/*.astro` (Type-Definitionen)
 *
 * Wenn ein neuer Icon-Slug hinzukommt:
 * 1. Hier in der entsprechenden Liste ergaenzen
 * 2. SVG-Markup in der jeweiligen Icon-Komponente unter src/components/icons/
 *    hinzufuegen
 * 3. Im Markdown den neuen Slug verwenden
 */

export const ANGEBOT_ICONS = [
  'freitauchen',
  'hallenbad',
  'freiwasser',
  'wettkampf',
  'clubfahrten',
  'app',
] as const;
export type AngebotIconName = (typeof ANGEBOT_ICONS)[number];

export const TIMELINE_ICONS = [
  'diver',
  'document',
  'trophy',
  'compass',
  'star',
  'medal',
] as const;
export type TimelineIconName = (typeof TIMELINE_ICONS)[number];

export const PRICE_ICONS = ['erwachsene', 'familie', 'jugend'] as const;
export type PriceIconName = (typeof PRICE_ICONS)[number];

export const EVENT_ICONS = [
  'calendar',
  'ship',
  'video',
  'goggles',
  'pool',
  'waves',
] as const;
export type EventIconName = (typeof EVENT_ICONS)[number];

export const KONTAKT_ICONS = ['pin', 'pool', 'mail', 'clock'] as const;
export type KontaktIconName = (typeof KONTAKT_ICONS)[number];
