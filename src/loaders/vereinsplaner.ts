/**
 * Custom Astro Content Loader fuer Vereinsplaner-iCal-Feed.
 *
 * Eine Funktion, zwei Modes:
 *   - 'public'   → alle zukuenftigen Events ausser Training/Vorstand/Papnoe
 *   - 'training' → nur Events deren Titel mit "Training" beginnt
 *
 * Wird zur Build-Zeit aufgerufen. Bei Netz-/Parse-Fehlern: leere Liste,
 * Build laeuft trotzdem durch.
 */
import type { Loader } from 'astro/loaders';

const ICAL_URL =
  'https://api.vereinsplaner.at/v1/public/ical/3b22bae6-cb37-4e7c-8da4-f69f4563fd82.ics';

interface VEvent {
  type: string;
  uid?: string;
  summary?: string;
  description?: string;
  start?: Date;
  end?: Date;
  location?: string;
  url?: string;
}

export interface VereinsplanerLoaderOptions {
  /**
   * 'public'   → alle Vereinstermine ausser Trainings/Vorstand/Papnoe
   * 'training' → ausschliesslich Trainings (Titel beginnt mit "Training")
   */
  mode: 'public' | 'training';
  /** Maximale Anzahl an Eintraegen (sortiert nach Datum aufsteigend). */
  limit?: number;
}

function matchesMode(summary: string, mode: 'public' | 'training'): boolean {
  if (mode === 'training') {
    // DUC-Trainings, aber keine TSV-Termine (TSV NRW ist eigener Verband)
    return /^training/i.test(summary) && !/\btsv\b/i.test(summary);
  }
  // public: alles ausser interne Termine
  return (
    !/^training/i.test(summary) &&
    !/vorstand/i.test(summary) &&
    !/papnoe/i.test(summary)
  );
}

export function vereinsplanerLoader(opts: VereinsplanerLoaderOptions): Loader {
  return {
    name: `vereinsplaner-${opts.mode}`,
    load: async ({ store, logger, parseData, generateDigest }) => {
      store.clear();
      let events: VEvent[];
      try {
        // node-ical ist ein CJS-Modul; dynamic import wrappt es in { default: ... }
        const icalModule = (await import('node-ical')) as unknown as {
          default: {
            async: { fromURL: (url: string) => Promise<Record<string, VEvent>> };
          };
        };
        const raw = await icalModule.default.async.fromURL(ICAL_URL);
        events = Object.values(raw).filter((e) => e.type === 'VEVENT');
        logger.info(`Vereinsplaner-Feed: ${events.length} VEVENTs geladen.`);
      } catch (err) {
        logger.error(
          `Vereinsplaner-Feed nicht erreichbar: ${(err as Error).message}`
        );
        return;
      }

      const now = Date.now();
      let filtered = events
        .filter((e) => e.start && new Date(e.start).getTime() > now)
        .filter((e) => e.summary && matchesMode(e.summary, opts.mode))
        .sort(
          (a, b) => new Date(a.start!).getTime() - new Date(b.start!).getTime()
        );

      if (opts.limit !== undefined) {
        filtered = filtered.slice(0, opts.limit);
      }

      logger.info(
        `Mode "${opts.mode}"${opts.limit ? ` (limit ${opts.limit})` : ''}: ${filtered.length} Eintraege.`
      );

      for (const e of filtered) {
        const data = {
          summary: e.summary!,
          start: new Date(e.start!),
          end: e.end ? new Date(e.end) : undefined,
          location: e.location,
          description: (e.description ?? '').trim(),
          url: e.url,
        };
        const parsed = await parseData({ id: String(e.uid), data });
        store.set({
          id: String(e.uid),
          data: parsed,
          digest: generateDigest(parsed),
        });
      }
    },
  };
}
