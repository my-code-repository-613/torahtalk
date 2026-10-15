// Generates one PDF per essay into public/pdf/<id>.pdf. Pure JS (pdfkit) so it runs in any CI without a browser.
// Runs before `astro build`. Skips PDFs whose source .md hasn't changed since the PDF was written.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import PDFDocument from 'pdfkit';

const SRC = 'src/content/essays', OUT = 'public/pdf';
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.md') ? [path.join(d, e.name)] : []);
const files = fs.existsSync(SRC) ? walk(SRC) : [];
const FONT = 'Times-Roman', BOLD = 'Times-Bold', ITAL = 'Times-Italic', BI = 'Times-BoldItalic';
const pick = (b, i) => (b && i ? BI : b ? BOLD : i ? ITAL : FONT);

function inline(doc, tokens, opts = {}, state = { b: false, i: false }) {
  for (const t of tokens) {
    if (t.type === 'text' || t.type === 'escape') doc.font(pick(state.b, state.i)).text(t.text.replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&'), { ...opts, continued: true });
    else if (t.type === 'strong') inline(doc, t.tokens, opts, { ...state, b: true });
    else if (t.type === 'em') inline(doc, t.tokens, opts, { ...state, i: true });
    else if (t.type === 'link') { inline(doc, t.tokens, { ...opts, link: t.href, underline: true }, state); }
    else if (t.type === 'codespan') doc.font('Courier').text(t.text, { ...opts, continued: true });
    else if (t.type === 'br') doc.text('\n', { ...opts, continued: true });
    else if (t.tokens) inline(doc, t.tokens, opts, state);
  }
}
function block(doc, tokens) {
  for (const t of tokens) {
    if (t.type === 'paragraph') { inline(doc, t.tokens); doc.text('', { continued: false }); doc.moveDown(0.6); }
    else if (t.type === 'heading') { doc.moveDown(0.4).font(BOLD).fontSize(t.depth <= 2 ? 14 : 12.5); inline(doc, t.tokens, {}, { b: true, i: false }); doc.text('', { continued: false }).fontSize(11.5).moveDown(0.4); }
    else if (t.type === 'blockquote') { const x = doc.x; doc.x = x + 18; block(doc, t.tokens); doc.x = x; }
    else if (t.type === 'list') { for (const li of t.items) { doc.text(t.ordered ? `${li.raw.match(/^\d+/)?.[0] ?? '•'}. ` : '• ', { continued: true }); inline(doc, li.tokens.flatMap(x => x.tokens ?? [x])); doc.text('', { continued: false }); } doc.moveDown(0.6); }
    else if (t.type === 'hr') { doc.moveDown(0.3).moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke('#999').moveDown(0.6); }
    else if (t.type === 'space') {}
    else if (t.tokens) block(doc, t.tokens);
    else if (t.text) doc.font(FONT).text(t.text).moveDown(0.6);
  }
}

let made = 0, skipped = 0;
for (const f of files) {
  const id = path.relative(SRC, f).replace(/\.md$/, ''); const out = path.join(OUT, id + '.pdf');
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(f).mtimeMs) { skipped++; continue; }
  const { data, content } = matter(fs.readFileSync(f, 'utf8'));
  if (data.draft) continue;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const doc = new PDFDocument({ size: 'LETTER', margins: { top: 64, bottom: 64, left: 72, right: 72 }, info: { Title: data.title, Author: 'Rabbi Yerachmiel Seplowitz', Subject: `Torah Talk — ${data.parsha} ${data.year}` } });
  doc.pipe(fs.createWriteStream(out));
  doc.font(FONT).fontSize(9).fillColor('#666').text('TORAH TALK  ·  Rabbi Yerachmiel Seplowitz  ·  torahtalk.org', { align: 'left' });
  doc.moveTo(72, doc.y + 4).lineTo(doc.page.width - 72, doc.y + 4).stroke('#999'); doc.moveDown(1.2);
  doc.fillColor('#000').font(BOLD).fontSize(10).text(`${String(data.parsha).replace(/-/g, ' ').toUpperCase()}${data.verses ? `  (${data.verses})` : ''}`);
  doc.font(BOLD).fontSize(18).text(data.title, { lineGap: 2 }); doc.moveDown(0.2);
  doc.font(ITAL).fontSize(10).fillColor('#444').text(String(data.year)); doc.moveDown(1);
  doc.fillColor('#000').font(FONT).fontSize(11.5);
  block(doc, marked.lexer(content));
  doc.moveDown(1).font(ITAL).fontSize(9).fillColor('#666').text(`© ${data.year} Rabbi Yerachmiel Seplowitz. Reprint permitted for non-commercial use with attribution to torahtalk.org.`);
  doc.end(); made++;
}
console.log(`pdfs: ${made} generated, ${skipped} up to date`);
