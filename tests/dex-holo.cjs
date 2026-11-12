/* 원소 도감 크게 보기 홀로 효과(lib/holo.js · PixiJS, 2026-11-12 — pkm 도감과 같은 파일)
   Run: ESM_DIR=<preact · pixi.js@8.19.0 이 든 node_modules> CHROMIUM_PATH=<chrome> node tests/dex-holo.cjs   (PORT 로 자리 바꾸기, 기본 8796)
   - 크게 보기를 열면 그림에 꼭 맞는(둥근 모서리까지) 캔버스 하나가 screen 으로 얹히고, 넘기기 단추는 그 위
   - 마우스를 따라 빛이 움직인다, 끄면 없어지고 다시 열어도 꺼진 채(기억 — 공방 모음 공용 열쇠), 넘겨도 캔버스 하나
   - 움직임 줄이기면 혼자 지나가지 않는다, 오류 없음 */
const assert = require('node:assert/strict'), http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..'), PORT = +(process.env.PORT || 8796), BASE = 'http://127.0.0.1:' + PORT;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css' };
const ESM = { 'https://esm.sh/preact@10.24.3': 'preact/dist/preact.mjs', 'https://esm.sh/preact@10.24.3/hooks': 'preact/hooks/dist/hooks.mjs',
  'https://cdn.jsdelivr.net/npm/pixi.js@8.19.0/dist/pixi.min.mjs': 'pixi.js/dist/pixi.min.mjs' };
/* 그림 — 차가운 은빛 비탈(github.io 처럼 Access-Control-Allow-Origin: *) */
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
  '<stop offset="0" stop-color="#e4e8f0"/><stop offset=".5" stop-color="#8a96a8"/><stop offset="1" stop-color="#3a3f4a"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>';
const server = http.createServer((q, s) => {
  const p = decodeURIComponent(new URL(q.url, BASE).pathname), file = path.join(ROOT, p === '/' ? 'index.html' : p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(s);
});
(async () => {
  await new Promise(r => server.listen(PORT, r));
  const br = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  let n = 0;
  const open = async (opt = {}) => {
    const ctx = await br.newContext({ viewport: { width: 1000, height: 900 }, ...(opt.reduced ? { reducedMotion: 'reduce' } : {}) });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => {
      const url = r.request().url();
      if (/\.(webp|png)(\?.*)?$/.test(url)) return r.fulfill({ contentType: 'image/svg+xml', headers: { 'Access-Control-Allow-Origin': '*' }, body: SVG });
      const file = process.env.ESM_DIR && ESM[url.split('?')[0]];
      if (!file || !fs.existsSync(path.join(process.env.ESM_DIR, file))) return r.abort();
      return r.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(process.env.ESM_DIR, file), 'utf8').replace(/from"preact"/g, 'from"https://esm.sh/preact@10.24.3"') });
    });
    const page = await ctx.newPage(), errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(BASE + '/dex.html?nation=fe');
    await page.click('#c-fe .worlds.main .slot >> nth=0'); await page.waitForSelector('.lightbox img');
    await page.locator('.lightbox img').evaluate(i => i.decode());
    return { ctx, page, errors };
  };
  const shot = p => p.locator('.lb-stage').screenshot({ animations: 'disabled' });
  try {
    const { ctx, page: p, errors } = await open();
    const cv = p.locator('.lb-stage canvas.holo-layer');
    await cv.waitFor({ timeout: 20000 });
    assert.equal(await p.locator('#dex-holo').getAttribute('aria-pressed'), 'true', '처음엔 켜짐'); n++;
    const fit = await p.evaluate(() => { const i = document.querySelector('.lb-stage img').getBoundingClientRect(), c = document.querySelector('canvas.holo-layer'), r = c.getBoundingClientRect(), st = getComputedStyle(c);
      const nav = document.querySelector('.lb-nav'); return { d: Math.max(Math.abs(i.left - r.left), Math.abs(i.top - r.top), Math.abs(i.width - r.width), Math.abs(i.height - r.height)),
        radius: st.borderTopLeftRadius, imgRadius: getComputedStyle(document.querySelector('.lb-stage img')).borderTopLeftRadius, blend: st.mixBlendMode, pe: st.pointerEvents,
        navOnTop: !nav || +getComputedStyle(nav).zIndex > +st.zIndex }; });
    assert(fit.d < 2, '그림에 꼭 맞는다 ' + JSON.stringify(fit)); assert.equal(fit.radius, fit.imgRadius, '둥근 모서리도 그림과 같다');
    assert.equal(fit.blend, 'screen'); assert.equal(fit.pe, 'none'); assert(fit.navOnTop, '넘기기 단추는 캔버스 위'); n += 5;
    const box = await cv.boundingBox();
    await p.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.2); await p.waitForTimeout(700); const a1 = await shot(p);
    await p.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.85); await p.waitForTimeout(700); const a2 = await shot(p);
    assert(!a1.equals(a2), '마우스를 따라 빛이 움직인다'); n++;
    if (await p.locator('.lb-nav.next').count()) { await p.keyboard.press('ArrowRight'); await p.locator('.lightbox img').evaluate(i => i.decode()); await p.waitForTimeout(600);
      assert.equal(await p.locator('canvas.holo-layer').count(), 1, '넘겨도 캔버스 하나'); n++; }
    await p.click('#dex-holo'); await p.locator('canvas.holo-layer').waitFor({ state: 'detached', timeout: 5000 });
    assert(!(await shot(p)).equals(a2), '켠 그림과 끈 그림이 다르다');
    assert.equal(await p.evaluate(() => localStorage.getItem('atelier_holo_v1')), '0', '끈 것을 기억(공방 모음 공용 열쇠)'); n += 2;
    await p.keyboard.press('Escape'); await p.click('#c-fe .worlds.main .slot >> nth=0'); await p.waitForSelector('.lightbox img'); await p.waitForTimeout(800);
    assert.equal(await p.locator('canvas.holo-layer').count(), 0, '다시 열어도 꺼진 채'); n++;
    assert.deepEqual(errors, [], '오류'); n++;
    await ctx.close();
    const b = await open({ reduced: true });
    await b.page.locator('canvas.holo-layer').waitFor({ timeout: 20000 }); await b.page.waitForTimeout(500);
    const r1 = await shot(b.page); await b.page.waitForTimeout(1200); const r2 = await shot(b.page);
    assert(r1.equals(r2), '움직임 줄이기면 혼자 지나가지 않는다'); assert.deepEqual(b.errors, [], '오류'); n += 2;
    await b.ctx.close();
    console.log('PASS 원소 도감 홀로 효과: ' + n + '가지 — 그림에 꼭 맞음(둥근 모서리) · screen · 넘기기 단추 위 · 마우스를 따라감 · 끄기 기억 · 움직임 줄이기');
  } finally { await br.close(); server.close(); }
})().catch(e => { console.error(e); process.exit(1); });
