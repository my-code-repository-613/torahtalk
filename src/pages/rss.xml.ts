import type { APIRoute } from 'astro';
import { allEssays, essayUrl, label } from '../lib/essays';
const esc = (s: string) => s.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!));
export const GET: APIRoute = async ({ site }) => {
  const essays = (await allEssays()).slice(0, 30);
  const items = essays.map(e => { const l = label(e); return `<item><title>${esc(`${l.parsha} — ${e.data.title}`)}</title><link>${site}${essayUrl(e).slice(1)}</link><guid>${site}${essayUrl(e).slice(1)}</guid><pubDate>${e.data.date.toUTCString()}</pubDate>${e.data.summary ? `<description>${esc(e.data.summary)}</description>` : ''}</item>`; }).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Torah Talk</title><link>${site}</link><description>Messages on the weekly Torah portion by Rabbi Yerachmiel Seplowitz.</description>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/xml' } });
};
