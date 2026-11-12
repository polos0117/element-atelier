/* 브라우저 검사 공용 손(「들어가는 곳」 2026-11-12) — 서버 · 경로 가로채기 · 넘침 · 사진.
   tests/screen.cjs 의 서버 · 가로채기를 옮기고 더했다: 바깥 그림(.webp/.png) → 은빛 SVG, preact · pixi · phaser 사본(ESM_DIR),
   pixi 막기 · 주소 404 · WebGL 없음 · 기억값 · 느린 그림.
   ESM_DIR 이 없으면 $HOME/.cache/element-esm/node_modules(계획의 한 번 설치 자리). CHROMIUM_PATH 가 있으면 그 브라우저. SHOT_DIR 이 있으면 사진. */
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..', '..');
const ESM_DIR = process.env.ESM_DIR || path.join(os.homedir(), '.cache/element-esm/node_modules');
const COVER = { width: 344, height: 882 }, WIDE = { width: 1280, height: 900 };
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.md': 'text/markdown', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png' };
const ESM = { 'https://esm.sh/preact@10.24.3': 'preact/dist/preact.mjs', 'https://esm.sh/preact@10.24.3/hooks': 'preact/hooks/dist/hooks.mjs',
  'https://cdn.jsdelivr.net/npm/pixi.js@8.19.0/dist/pixi.min.mjs': 'pixi.js/dist/pixi.min.mjs',
  'https://cdn.jsdelivr.net/npm/phaser@4.2.1/dist/phaser.esm.min.js': 'phaser/dist/phaser.esm.min.js' };
/* 그림 — 차가운 은빛 비탈(github.io 처럼 Access-Control-Allow-Origin: *), tests/dex-holo.cjs 와 같다 */
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
  '<stop offset="0" stop-color="#e4e8f0"/><stop offset=".5" stop-color="#8a96a8"/><stop offset="1" stop-color="#3a3f4a"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>';

function serve() {
  const server = http.createServer((q, s) => {
    const p = decodeURIComponent(new URL(q.url, 'http://x').pathname), file = path.join(ROOT, p === '/' ? 'index.html' : p);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { s.writeHead(404); return s.end(); }
    s.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(s);
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r({ base: 'http://127.0.0.1:' + server.address().port, close: () => server.close() })));
}
const launch = () => chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

async function open(browser, base, url, opt = {}) {
  const { viewport = COVER, reduced = false, noWebGL = false, blockPixi = false, failURL = null, pref = null, slowImg = 0 } = opt;
  const ctx = await browser.newContext({ viewport, ...(reduced ? { reducedMotion: 'reduce' } : {}) });
  if (noWebGL) await ctx.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...a) { return /webgl/.test(kind) ? null : get.call(this, kind, ...a); };
  });
  /* 기억값은 그 맥락의 첫 문서에서만 — 뒤 문서에서 껍데기가 쓴 값을 덮지 않게 */
  if (pref) await ctx.addInitScript(p => {
    try { if (window.top === window && !sessionStorage.getItem('__walk_pref')) { localStorage.setItem('element_dex_v1', JSON.stringify(p)); sessionStorage.setItem('__walk_pref', '1'); } } catch (e) {}
  }, pref);
  await ctx.route('**/*', async r => {
    const u = r.request().url(), bare = u.split('?')[0];
    if (failURL && failURL.test(u)) return r.fulfill({ status: 404, body: '' });
    if (u.startsWith(base)) return r.continue();
    if (blockPixi && /pixi/.test(u)) return r.abort();
    if (/\.(webp|png)(\?.*)?$/.test(u)) {
      if (slowImg) await new Promise(t => setTimeout(t, slowImg));
      return r.fulfill({ contentType: 'image/svg+xml', headers: { 'Access-Control-Allow-Origin': '*' }, body: SVG });
    }
    const file = ESM[bare] && path.join(ESM_DIR, ESM[bare]);
    if (!file || !fs.existsSync(file)) return r.abort();
    return r.fulfill({ status: 200, contentType: 'text/javascript', headers: { 'Access-Control-Allow-Origin': '*' }, body: fs.readFileSync(file, 'utf8').replace(/from"preact"/g, 'from"https://esm.sh/preact@10.24.3"') });
  });
  const page = await ctx.newPage(), errors = [], requests = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if ((m.type() === 'error' && !/ERR_FAILED|net::|Failed to load resource/.test(m.text())) || (m.type() === 'warning' && /^words: /.test(m.text()))) errors.push(m.text()); });   /* 낱말 표에 없는 열쇠도 오류로 */
  page.on('request', q => requests.push(q.url()));
  await page.goto(base + url);
  return { ctx, page, errors, requests };
}
const noOverflow = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
async function shot(page, name) {
  if (!process.env.SHOT_DIR) return;
  fs.mkdirSync(process.env.SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(process.env.SHOT_DIR, name + '.png') });
}
module.exports = { ROOT, COVER, WIDE, serve, launch, open, noOverflow, shot };
