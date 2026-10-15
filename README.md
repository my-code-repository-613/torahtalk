# Torah Talk — torahtalk.org

Static site for Rabbi Yerachmiel Seplowitz's weekly Torah messages (2000–present). Astro + Tailwind, hosted on Cloudflare Pages. Content is Markdown in `src/content/essays/<sefer>/<parsha>/<year>-<slug>.md`.

- `npm run dev` — local preview
- `npm run build` — downloads Chromium, generates a PDF for every essay (`public/pdf/`), then builds the site to `dist/`
- `npm run convert import/export.xml` — one-time import of the WordPress.com export; writes essays, `import/report.csv`, `import/redirects.txt` (copy to `public/_redirects`)
- `/admin` — Decap CMS form for posting new messages (needs the OAuth worker URL in `public/admin/config.yml`)

Cloudflare Pages: build command `npm run build`, output directory `dist`, Node 22 (`.nvmrc`).
