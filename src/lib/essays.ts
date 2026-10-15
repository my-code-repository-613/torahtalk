import { getCollection, type CollectionEntry } from 'astro:content';
import { SEFARIM, seferBySlug, parshaBySlug } from './torah';

export type Essay = CollectionEntry<'essays'>;

export async function allEssays(): Promise<Essay[]> {
  const list = await getCollection('essays', e => !e.data.draft);
  return list.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const essayUrl = (e: Essay) => `/essays/${e.id}/`;
export const pdfUrl = (e: Essay) => `/pdf/${e.id}.pdf`;

export function label(e: Essay) {
  const s = seferBySlug(e.data.sefer); const p = parshaBySlug(e.data.sefer, e.data.parsha);
  return { sefer: s?.name ?? e.data.sefer, parsha: p?.name ?? e.data.parsha, verses: e.data.verses || p?.verses || '' };
}

export const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

/** Count of essays per sefer and per parsha, for archive pages. */
export async function counts() {
  const list = await allEssays();
  const bySefer: Record<string, number> = {}; const byParsha: Record<string, number> = {};
  for (const e of list) {
    bySefer[e.data.sefer] = (bySefer[e.data.sefer] ?? 0) + 1;
    const k = `${e.data.sefer}/${e.data.parsha}`; byParsha[k] = (byParsha[k] ?? 0) + 1;
  }
  return { bySefer, byParsha, total: list.length, sefarim: SEFARIM };
}
