// Converts a WordPress.com export (WXR XML) into Markdown essays under src/content/essays/.
// Usage: node scripts/convert-wxr.mjs import/torahtalk.xml
// Output: one .md per essay, path <sefer>/<parsha>/<year>-<slug>.md, plus import/report.csv and import/redirects.txt
import fs from 'node:fs';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import TurndownService from 'turndown';

const src = process.argv[2];
if (!src) { console.error('usage: node scripts/convert-wxr.mjs <export.xml>'); process.exit(1); }
const OUT = 'src/content/essays';
const xml = fs.readFileSync(src, 'utf8');
const doc = new XMLParser({ ignoreAttributes: false, cdataPropName: '#cdata', textNodeName: '#text' }).parse(xml);
const items = [].concat(doc.rss.channel.item ?? []);

// Parsha spelling variants seen in titles → canonical slug
const PARSHA = [
  ['bereishis', /^b[’']?e?reish?is|^bereshit/i], ['noach', /^noa?ch?$/i], ['lech-lecha', /^lech/i], ['vayeira', /^vayeira|^vayera/i],
  ['chayei-sarah', /^chayei/i], ['toldos', /^toldos|^toldot/i], ['vayeitzei', /^vayeitzei|^vayetze/i], ['vayishlach', /^vayishlach/i],
  ['vayeishev', /^vayeishev|^vayeshev/i], ['mikeitz', /^mik[e]?i?e?tz/i], ['vayigash', /^vayigash/i], ['vayechi', /^vayechi/i],
  ['shemos', /^sh[’']?e?mos|^shemot/i], ['vaeira', /^va[’']?e(i)?ra/i], ['bo', /^bo$/i], ['beshalach', /^b[’']?e?shalach/i],
  ['yisro', /^yisro|^yitro/i], ['mishpatim', /^mishpatim/i], ['terumah', /^t[’']?e?rumah/i], ['tetzaveh', /^t[’']?e?tzaveh/i],
  ['ki-sisa', /^ki ?sisa|^ki ?tisa/i], ['vayakhel', /^vayakh[ea]i?l/i], ['pekudei', /^p[’']?e?kudei/i],
  ['vayikra', /^vayikra/i], ['tzav', /^tzav/i], ['shemini', /^sh[’']?e?mini/i], ['tazria', /^tazria/i], ['metzora', /^metzora/i],
  ['acharei-mos', /^acharei/i], ['kedoshim', /^k[’']?e?doshim/i], ['emor', /^emor/i], ['behar', /^b[’']?e?har$/i], ['bechukosai', /^b[’']?e?chuko/i],
  ['bamidbar', /^b[’']?a?midbar/i], ['naso', /^naso/i], ['behaaloscha', /^b[’']?e?ha[’']?alos/i], ['shelach', /^sh[’']?e?lach/i],
  ['korach', /^korach/i], ['chukas', /^chukas|^chukat/i], ['balak', /^balak/i], ['pinchas', /^pinchas|^pinchos/i], ['matos', /^matos|^mattos/i], ['masei', /^mas[’']?ei/i],
  ['devarim', /^d[’']?e?v[ao]rim/i], ['vaeschanan', /^v[ae][’']? ?es?chanan|^vaetchanan/i], ['eikev', /^eikev|^ekev/i], ['reeh', /^re[’']?eh/i], ['shoftim', /^shoftim/i],
  ['ki-seitzei', /^ki ?seitzei|^ki ?tetze/i], ['ki-savo', /^ki ?savo|^ki ?tavo/i], ['nitzavim', /^nitzavim/i], ['vayeilech', /^vayeilech|^vayelech/i],
  ['haazinu', /^ha[’']?azinu/i], ['vezos-haberachah', /^v[’']?e?zos|^vezot/i],
  ['rosh-hashanah', /rosh ?hashan/i], ['yom-kippur', /yom ?kippur/i], ['succos', /succos|sukkos|sukkot|shemini atzeres|simchas torah/i], ['chanukah', /chanuk|hanuk/i],
  ['purim', /purim/i], ['pesach', /pesach|passover/i], ['shavuos', /shavuos|shavuot/i], ['tisha-bav', /tisha|9 av|three weeks|nine days|seventeenth of tammuz|17th of tammuz/i],
  ['pesach', /shabbos hagadol/i],
  ['general', /pidyon|bris|independence day|help me help|commentaries quoted/i],
];
const SEFER_OF = Object.fromEntries([
  ...['bereishis','noach','lech-lecha','vayeira','chayei-sarah','toldos','vayeitzei','vayishlach','vayeishev','mikeitz','vayigash','vayechi'].map(p=>[p,'bereishis']),
  ...['shemos','vaeira','bo','beshalach','yisro','mishpatim','terumah','tetzaveh','ki-sisa','vayakhel','pekudei'].map(p=>[p,'shemos']),
  ...['vayikra','tzav','shemini','tazria','metzora','acharei-mos','kedoshim','emor','behar','bechukosai'].map(p=>[p,'vayikra']),
  ...['bamidbar','naso','behaaloscha','shelach','korach','chukas','balak','pinchas','matos','masei'].map(p=>[p,'bamidbar']),
  ...['devarim','vaeschanan','eikev','reeh','shoftim','ki-seitzei','ki-savo','nitzavim','vayeilech','haazinu','vezos-haberachah'].map(p=>[p,'devarim']),
  ...['rosh-hashanah','yom-kippur','succos','chanukah','purim','pesach','shavuos','tisha-bav','other'].map(p=>[p,'holidays']),
  ['general','mitzvos'],
]);
// Note: the canonical parsha list lives in src/lib/torah.ts; keep these in sync.

const td = new TurndownService({ headingStyle: 'atx', emDelimiter: '*', strongDelimiter: '**' });
td.remove(['script', 'style']);
const txt = v => (v == null ? '' : typeof v === 'object' ? (v['#cdata'] ?? v['#text'] ?? '') : String(v));
const slugify = s => s.toLowerCase().replace(/[’'"“”‘]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70);

// Title pattern: "PARSHA (Book 1:1-6:8) — “Essay Title”"   (many variants; be lenient)
function parseTitle(raw) {
  const t = raw.replace(/&#8212;|&mdash;/g, '—').replace(/&#8217;|&rsquo;/g, '’').replace(/&amp;/g, '&').replace(/[‑­]/g, '-').replace(/\s+/g, ' ').trim();
  // Separator between the parsha/verses head and the essay title: " -- ", " — ", " – ", or just a quote mark
  const qf = t.match(/^[“"]([^”"]+)[”"]\s+(.+)$/);
  if (qf && !/^[“"]/.test(qf[2])) return parseTitle(`${qf[2]} -- "${qf[1]}"`);
  const sep = t.search(/\s*(?:--+|—|–)\s*|\s*(?=[“"])/);
  let head = sep >= 0 ? t.slice(0, sep) : t, title = sep >= 0 ? t.slice(sep).replace(/^\s*(?:--+|—|–)\s*/, '') : '';
  const vm = head.match(/\(([^)]*)\)/); const verses = (vm?.[1] ?? '').replace(/^\s*(Genesis|Exodus|Leviticus|Numbers|Deuteronomy),\s*/, '$1 ').trim();
  head = head.replace(/\([^)]*\)/g, '').replace(/^torah talk\s+/i, '').trim();
  title = title.replace(/^[“"”']+|[“"”']+\s*$/g, '').trim();
  // Combined parshiyos / add-ons: "CHUKAS/BALAK", "KI SISA /PARAH", "Matos-Masei", "DEVORIM/TISHA B'AV" → first
  head = head.split(/\s*[\/]\s*|\s+-\s+|(?<=[a-z])-(?=[A-Z])| and /i)[0].trim();
  let p = PARSHA.find(([, re]) => re.test(head));
  if (!p && !head) { const flat = title.replace(/[“”"]/g, ''); p = PARSHA.find(([, re]) => re.test(flat)) ?? PARSHA.find(([slug]) => new RegExp(slug.replace(/-/g, '[ -]?'), 'i').test(flat)); }
  return { parsha: p?.[0], verses, title: title || t, head };
}

const seen = new Map(); // `${sefer}/${parsha}/${normTitle}` -> {year, out}
const norm = x => x.toLowerCase().replace(/[^a-z0-9]+/g, '');
const report = [['wpId', 'type', 'status', 'date', 'parsha', 'year', 'outfile', 'sourceUrl', 'note']];
const redirects = [];
let written = 0;
for (const it of items) {
  const type = txt(it['wp:post_type']); const status = txt(it['wp:status']);
  if (!['post', 'page'].includes(type) || status !== 'publish') continue;
  const wpId = Number(txt(it['wp:post_id'])); const link = txt(it.link); const rawTitle = txt(it.title);
  const html = txt(it['content:encoded']); const date = new Date(txt(it['wp:post_date_gmt']) + 'Z');
  const text = html.replace(/<[^>]+>/g, '').replace(/&nbsp;|&#160;/g, ' ').trim();
  // Skip index/teaser items: very short bodies, or bodies that are mostly "read more" link lists
  if (text.length < 600) { report.push([wpId, type, status, date.toISOString(), '', '', '', link, 'skipped: short/teaser']); continue; }
  const { parsha, verses, title, head } = parseTitle(rawTitle);
  if (!parsha) { report.push([wpId, type, status, date.toISOString(), '', '', '', link, `UNMATCHED parsha from "${head}"`]); continue; }
  const sefer = SEFER_OF[parsha];
  // Year: prefer "(2009)" style markers in title, else the post year
  const yearInTitle = rawTitle.match(/\((19|20)\d{2}\)/)?.[0]?.slice(1, -1);
  const year = Number(yearInTitle ?? date.getUTCFullYear());
  let md = td.turndown(html).replace(/(\w)\*\*(\w)/g, '$1$2').replace(/\*\*\s*\*\*/g, '').replace(/\n{3,}/g, '\n\n').trim();
  const key = `${sefer}/${parsha}/${norm(title)}`;
  if (seen.has(key)) { const prev = seen.get(key); if (prev.year <= year) { report.push([wpId, type, status, date.toISOString(), parsha, year, prev.out, link, `REPOST of ${prev.year}; skipped`]); redirects.push(`${new URL(link).pathname}  /essays/${prev.id}/  301`); continue; } else { fs.rmSync(prev.out, { force: true }); report.push([prev.wpId, '', '', '', parsha, prev.year, prev.out, '', `REPOST superseded by earlier ${year}`]); } }
  const id = `${sefer}/${parsha}/${year}-${slugify(title)}`;
  const out = path.join(OUT, id + '.md');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  if (fs.existsSync(out)) { const prev = fs.readFileSync(out, 'utf8'); if (prev.length >= md.length + 200) { report.push([wpId, type, status, date.toISOString(), parsha, year, out, link, 'DUPLICATE id; shorter copy skipped']); continue; } report.push([wpId, type, status, date.toISOString(), parsha, year, out, link, 'DUPLICATE id; replaced shorter copy']); }
  const fm = { title, sefer, parsha, year, date: date.toISOString().slice(0, 10), verses, originalUrl: link, wpId };
  const front = Object.entries(fm).filter(([, v]) => v !== '' && v != null).map(([k, v]) => `${k}: ${typeof v === 'string' ? JSON.stringify(v) : v}`).join('\n');
  fs.writeFileSync(out, `---\n${front}\n---\n\n${md}\n`);
  seen.set(key, { year, out, id, wpId });
  redirects.push(`${new URL(link).pathname}  /essays/${id}/  301`);
  report.push([wpId, type, status, date.toISOString(), parsha, year, out, link, 'ok']); written++;
}
fs.mkdirSync('import', { recursive: true });
fs.writeFileSync('import/report.csv', report.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n'));
fs.writeFileSync('import/redirects.txt', redirects.join('\n'));
console.log(`wrote ${written} essays; ${report.length - 1} items examined; see import/report.csv`);
