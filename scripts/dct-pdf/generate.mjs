import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { marked } from 'marked';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..', '..');
const MD_PATH = resolve(ROOT, 'docs', 'DCT_FINAL.md');
const TPL_PATH = resolve(__dirname, 'template.html');
const OUT_HTML = resolve(__dirname, 'out.html');
const OUT_PDF = resolve(ROOT, 'docs', 'DCT_FINAL.pdf');

const log = (...a) => console.log('[dct-pdf]', ...a);

// Configure marked: GFM tables, fenced code, no async
marked.setOptions({
  gfm: true,
  breaks: false,
  headerIds: true,
  mangle: false,
  smartLists: true,
});

// Custom renderer: code blocks with `mermaid` language → keep as <pre><code class="language-mermaid">
// Headings get stable, deterministic ids (sec-N for h1, sub-N-M for h2)
const renderer = new marked.Renderer();
const origCode = renderer.code.bind(renderer);
let h1Counter = 0;
let h2Counter = 0;
renderer.code = function (code, infostring, escaped) {
  const lang = (infostring || '').trim().split(/\s+/)[0];
  if (lang === 'mermaid') {
    return `<pre><code class="language-mermaid">${escapeHtml(code)}</code></pre>`;
  }
  return origCode(code, infostring, escaped);
};
renderer.heading = function (token) {
  const level = token.depth;
  const text = this.parser.parseInline(token.tokens);
  let id;
  if (level === 1) {
    h1Counter++;
    h2Counter = 0;
    id = `sec-${h1Counter}`;
  } else if (level === 2) {
    h2Counter++;
    id = h1Counter > 0 ? `sub-${h1Counter}-${h2Counter}` : `intro-${h2Counter}`;
  } else {
    id = `h${level}-${Math.random().toString(36).slice(2, 7)}`;
  }
  return `<h${level} id="${id}">${text}</h${level}>\n`;
};

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildToc(html) {
  // Extract all h1 and h2 with their ids and text
  const re = /<h([12])\s+id="([^"]+)">([\s\S]*?)<\/h\1>/g;
  const items = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const level = parseInt(m[1], 10);
    const id = m[2];
    const text = m[3].replace(/<[^>]+>/g, '').trim();
    items.push({ level, id, text });
  }
  // Skip the very first h1 (preamble) and the "Table des matières" h2 itself
  const filtered = items.filter((it, i) => {
    if (i === 0) return false;
    if (/table des mati/i.test(it.text)) return false;
    return true;
  });

  // Build a 2-column compact list
  let out = '<div class="toc">\n';
  for (const it of filtered) {
    const cls = it.level === 1 ? 'toc-h1' : 'toc-h2';
    out += `  <a class="${cls}" href="#${it.id}">${it.text}</a>\n`;
  }
  out += '</div>\n';
  return out;
}

function stripFrontmatter(md) {
  if (md.startsWith('---')) {
    const end = md.indexOf('\n---', 3);
    if (end !== -1) {
      return md.slice(end + 4).replace(/^\s*\n/, '');
    }
  }
  return md;
}

function transformPageBreaks(md) {
  // No-op: page breaks are driven by CSS (page-break-before on h1).
  return md;
}

async function main() {
  log('Reading markdown:', MD_PATH);
  let md = await readFile(MD_PATH, 'utf8');
  md = stripFrontmatter(md);
  md = transformPageBreaks(md);

  log('Converting markdown to HTML…');
  // Reset counters for deterministic ids
  h1Counter = 0;
  h2Counter = 0;
  let bodyHtml = marked.parse(md, { renderer });

  log('Building TOC…');
  const tocHtml = buildToc(bodyHtml);
  bodyHtml = bodyHtml.replace('<!-- AUTO_TOC -->', tocHtml);

  log('Loading template…');
  const tpl = await readFile(TPL_PATH, 'utf8');
  const html = tpl.replace('<!--CONTENT-->', bodyHtml);

  await writeFile(OUT_HTML, html, 'utf8');
  log('HTML written:', OUT_HTML, '(' + (html.length / 1024).toFixed(1) + ' KB)');

  log('Launching Chromium (headless)…');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  try {
    const page = await browser.newPage();
    page.on('console', (m) => {
      const t = m.type();
      if (t === 'error' || t === 'warning') log(`[browser:${t}]`, m.text());
    });
    page.on('pageerror', (e) => log('[browser:error]', e.message));

    await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });

    log('Loading HTML in browser…');
    await page.goto('file://' + OUT_HTML, { waitUntil: 'networkidle0', timeout: 90_000 });

    log('Waiting for fonts + Mermaid render…');
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        try { await document.fonts.ready; } catch (_) {}
      }
    });
    // Wait for mermaid signal
    try {
      await page.waitForFunction(() => document.body.dataset.mermaidDone === 'true', { timeout: 60_000 });
    } catch (e) {
      log('WARNING: mermaid did not signal completion within 60s — proceeding anyway');
    }
    // Extra settle time for SVG layout
    await new Promise((r) => setTimeout(r, 1500));

    log('Generating PDF:', OUT_PDF);
    await page.pdf({
      path: OUT_PDF,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: true,
      margin: { top: '20mm', right: '16mm', bottom: '18mm', left: '16mm' },
      headerTemplate: `
        <div style="font-family: 'IBM Plex Mono', monospace; font-size: 7pt; color: #6b6964; width: 100%; padding: 0 16mm; display: flex; justify-content: space-between; letter-spacing: 0.06em; text-transform: uppercase;">
          <span>Althea Systems — DCT v2.0</span>
          <span>Sup de Vinci · B3 CPI · 2025-2026</span>
        </div>`,
      footerTemplate: `
        <div style="font-family: 'IBM Plex Mono', monospace; font-size: 7pt; color: #6b6964; width: 100%; text-align: center; letter-spacing: 0.08em;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>`,
    });

    log('PDF generated successfully.');
  } finally {
    await browser.close();
  }

  // Final size
  const { stat } = await import('node:fs/promises');
  const s = await stat(OUT_PDF);
  log('Final PDF size:', (s.size / 1024 / 1024).toFixed(2), 'MB');
}

main().catch((e) => {
  console.error('[dct-pdf] FATAL:', e);
  process.exit(1);
});
