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
  ['bereishis', /^b'?reish?is|^bereshit|^genesis$/i], ['noach', /^noah?c?h?$/i], ['lech-lecha', /^lech/i], ['vayeira', /^vayeira|^vayera/i],
  ['chayei-sarah', /^chayei/i], ['toldos', /^toldos|^toldot/i], ['vayeitzei', /^vayeitzei|^vayetze/i], ['vayishlach', /^vayishlach/i],
  ['vayeishev', /^vayeishev|^vayeshev/i], ['mikeitz', /^mikeitz|^miketz/i], ['vayigash', /^vayigash/i], ['vayechi', /^vayechi/i],
  ['shemos', /^shemos|^shemot|^sh'mos/i], ['vaeira', /^va'?eira|^vaera/i], ['bo', /^bo$/i], ['beshalach', /^beshalach|^b'shalach/i],
  ['yisro', /^yisro|^yitro/i], ['mishpatim', /^mishpatim/i], ['terumah', /^terumah|^t'rumah/i], ['tetzaveh', /^tetzaveh|^t'tzaveh/i],
  ['ki-sisa', /^ki ?sisa|^ki ?tisa/i], ['vayakhel', /^vayakhel/i], ['pekudei', /^pekudei|^p'kudei/i],
  ['vayikra', /^vayikra/i], ['tzav', /^tzav/i], ['shemini', /^shemini|^sh'mini/i], ['tazria', /^tazria/i], ['metzora', /^metzora/i],
  ['acharei-mos', /^acharei/i], ['kedoshim', /^kedoshim|^k'doshim/i], ['emor', /^emor/i], ['behar', /^behar|^b'har/i], ['bechukosai', /^bechuko|^b'chuko/i],
  ['bamidbar', /^bamidbar|^b'midbar/i], ['naso', /^naso/i], ['behaaloscha', /^beha'?alos|^b'ha'?alos/i], ['shelach', /^shelach|^sh'lach/i],
  ['korach', /^korach/i], ['chukas', /^chukas|^chukat/i], ['balak', /^balak/i], ['pinchas', /^pinchas|^pinchos/i], ['matos', /^matos|^mattos/i], ['masei', /^masei|^mas'ei/i],
  ['devarim', /^devarim|^d'varim/i], ['vaeschanan', /^va'?eschanan|^vaetchanan/i], ['eikev', /^eikev|^ekev/i], ['reeh', /^re'?eh/i], ['shoftim', /^shoftim/i],
  ['ki-seitzei', /^ki ?seitzei|^ki ?tetze/i], ['ki-savo', /^ki ?savo|^ki ?tavo/i], ['nitzavim', /^nitzavim/i], ['vayeilech', /^vayeilech|^vayelech/i],
  ['haazinu', /^ha'?azinu/i], ['vezos-haberachah', /^v'?zos|^vezot/i],
  ['rosh-hashanah', /rosh ?hashan/i], ['yom-kippur', /yom ?kippur/i], ['succos', /succos|sukkos|sukkot|shemini atzeres|simchas torah/i], ['chanukah', /chanuk|hanuk/i],
  ['purim', /purim/i], ['pesach', /pesach|passover/i], ['shavuos', /shavuos|shavuot/i], ['tisha-bav', /tisha|9 av|three weeks/i],
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
  const t = raw.replace(/&#8212;|&mdash;/g, '—').replace(/\s+/g, ' ').trim();
  const m = t.match(/^([^(—–-]+?)\s*(?:\(([^)]*)\))?\s*(?:[—–-]+\s*)?(.*)$/);
  let head = (m?.[1] ?? t).trim(), verses = (m?.[2] ?? '').trim(), title = (m?.[3] ?? '').replace(/^[“"”]+|[“"”]+$/g, '').trim();
  // Combined parshiyos: "Matos-Masei", "Nitzavim/Vayeilech" → first
  head = head.split(/[\/–-]| and /i)[0].trim();
  const p = PARSHA.find(([, re]) => re.test(head));
  return { parsha: p?.[0], verses, title: title || t, head };
}

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
  let md = td.turndown(html).replace(/\n{3,}/g, '\n\n').trim();
  const id = `${sefer}/${parsha}/${year}-${slugify(title)}`;
  const out = path.join(OUT, id + '.md');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  if (fs.existsSync(out)) { report.push([wpId, type, status, date.toISOString(), parsha, year, out, link, 'DUPLICATE id; not written']); continue; }
  const fm = { title, sefer, parsha, year, date: date.toISOString().slice(0, 10), verses, originalUrl: link, wpId };
  const front = Object.entries(fm).filter(([, v]) => v !== '' && v != null).map(([k, v]) => `${k}: ${typeof v === 'string' ? JSON.stringify(v) : v}`).join('\n');
  fs.writeFileSync(out, `---\n${front}\n---\n\n${md}\n`);
  redirects.push(`${new URL(link).pathname}  /essays/${id}/  301`);
  report.push([wpId, type, status, date.toISOString(), parsha, year, out, link, 'ok']); written++;
}
fs.mkdirSync('import', { recursive: true });
fs.writeFileSync('import/report.csv', report.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n'));
fs.writeFileSync('import/redirects.txt', redirects.join('\n'));
console.log(`wrote ${written} essays; ${report.length - 1} items examined; see import/report.csv`);
