// Generates one PDF per essay into public/pdf/<id>.pdf by printing an HTML page with Chromium (Playwright).
// Same typography as the site; runs before `astro build`. Skips PDFs whose source .md hasn't changed.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { chromium } from 'playwright';

const SRC = 'src/content/essays', OUT = 'public/pdf';
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.md') ? [path.join(d, e.name)] : []);
const files = fs.existsSync(SRC) ? walk(SRC) : [];
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const pretty = s => String(s).split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

const CSS = `
  @page { size: Letter; margin: 22mm 22mm 24mm 22mm; }
  html { font-family: "Source Serif 4", Georgia, "Times New Roman", serif; font-size: 11.5pt; line-height: 1.55; color: #000; }
  body { margin: 0; }
  .masthead { font-family: Inter, Arial, sans-serif; font-size: 8.5pt; letter-spacing: .08em; text-transform: uppercase; color: #555; border-bottom: 1px solid #999; padding-bottom: 6pt; margin-bottom: 16pt; display: flex; justify-content: space-between; }
  .kicker { font-family: Inter, Arial, sans-serif; font-size: 9.5pt; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: #5b211a; margin: 0 0 4pt; }
  h1 { font-size: 20pt; line-height: 1.2; margin: 0 0 6pt; color: #3f1611; font-weight: 600; }
  .meta { font-family: Inter, Arial, sans-serif; font-size: 9pt; color: #555; margin: 0 0 16pt; }
  .body p { margin: 0 0 9pt; orphans: 3; widows: 3; }
  .body h2, .body h3 { font-size: 13pt; margin: 14pt 0 6pt; color: #3f1611; page-break-after: avoid; }
  .body blockquote { margin: 8pt 0 8pt 14pt; padding-left: 10pt; border-left: 2pt solid #b8903f; color: #333; font-style: italic; }
  .body a { color: #000; text-decoration: none; }
  .body ul, .body ol { margin: 0 0 9pt; padding-left: 18pt; }
  .body hr { border: 0; border-top: 1px solid #ccc; margin: 12pt 0; }
  .colophon { font-family: Inter, Arial, sans-serif; font-size: 8.5pt; color: #666; border-top: 1px solid #ccc; padding-top: 6pt; margin-top: 18pt; }
`;

function page(data, html) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(data.title)}</title><style>${CSS}</style></head><body>
  <div class="masthead"><span>Torah Talk · Rabbi Yerachmiel Seplowitz</span><span>torahtalk.org</span></div>
  <p class="kicker">${esc(pretty(data.parsha))}${data.verses ? ` &nbsp;(${esc(data.verses)})` : ''}</p>
  <h1>${esc(data.title)}</h1>
  <p class="meta">${esc(data.year)} · Rabbi Yerachmiel Seplowitz</p>
  <div class="body">${html}</div>
  <p class="colophon">© ${esc(data.year)} Rabbi Yerachmiel Seplowitz. Reprint permitted for non-commercial use with attribution to torahtalk.org.</p>
  </body></html>`;
}

const todo = [];
for (const f of files) {
  const id = path.relative(SRC, f).replace(/\.md$/, ''); const out = path.join(OUT, id + '.pdf');
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(f).mtimeMs) continue;
  const { data, content } = matter(fs.readFileSync(f, 'utf8'));
  if (data.draft) continue;
  todo.push({ out, data, html: marked.parse(content) });
}
console.log(`pdfs: ${todo.length} to generate, ${files.length - todo.length} up to date`);
if (todo.length) {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const ctx = await browser.newContext();
  const pg = await ctx.newPage();
  for (const { out, data, html } of todo) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await pg.setContent(page(data, html), { waitUntil: 'load' });
    await pg.pdf({ path: out, format: 'Letter', printBackground: false, displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `<div style="font-family:Arial,sans-serif;font-size:8pt;color:#666;width:100%;text-align:center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
      margin: { top: '22mm', right: '22mm', bottom: '24mm', left: '22mm' } });
  }
  await browser.close();
  console.log(`pdfs: ${todo.length} generated`);
}
