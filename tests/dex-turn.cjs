/* 원소 도감 크게 보기 넘기기 전환(2026-11-12 — pkm 도감 크게 보기와 같은 모양)
   Run: ESM_DIR=<preact · pixi.js@8.19.0 이 든 node_modules> CHROMIUM_PATH=<chrome> node tests/dex-turn.cjs   (PORT 로 자리 바꾸기, 기본 8798)
   - 넘기면 나가는 그림의 사본(.lb-ghost)이 옛 그림 자리에 겹쳐 흐려지고, 새 그림은 넘긴 쪽에서 들어온다(→ 오른쪽에서, ← 왼쪽에서)
   - 끝나면 사본이 없어지고 새 그림이 다 보인다, 빠르게 넘겨도 사본은 하나, 사본은 새 그림 아래 · 넘기기 단추는 위
   - 그림이 늦게 와도 칸이 줄었다 커지지 않는다(이름 줄 · 단추 줄 그대로), 그때까지 옛 그림이 보인다
   - 움직임 줄이기면 사본 없이 바로 바뀐다, 오류 없음 */
const assert = require('node:assert/strict'), http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..'), PORT = +(process.env.PORT || 8798), BASE = 'http://127.0.0.1:' + PORT;
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
  let n = 0, slow = 0;   /* slow — 그림이 늦게 오는 폰 · 느린 망 */
  const open = async (opt = {}) => {
    const ctx = await br.newContext({ viewport: { width: 1000, height: 900 }, ...(opt.reduced ? { reducedMotion: 'reduce' } : {}) });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => {
      const url = r.request().url();
      if (/\.(webp|png)(\?.*)?$/.test(url)) return new Promise(z => setTimeout(z, slow)).then(() => r.fulfill({ contentType: 'image/svg+xml', headers: { 'Access-Control-Allow-Origin': '*' }, body: SVG }));
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
  const enterFrom = p => p.evaluate(() => { const a = document.querySelector('.lb-stage img').getAnimations()[0]; if (!a) return null;
    const m = (a.effect.getKeyframes()[0].transform || '').match(/translateX\((-?[\d.]+)px\)/); return m ? Math.sign(+m[1]) : null; });
  try {
    const { ctx, page: p, errors } = await open();
    assert.equal(await p.locator('.lb-ghost').count(), 0, '열 때는 전환 없음'); n++;
    if (!(await p.locator('.lb-nav.next').count())) throw new Error('넘길 그림이 없다(철 근본)');
    const before = await p.evaluate(() => { const i = document.querySelector('.lb-stage img'); return { src: i.getAttribute('src'), x: i.offsetLeft, y: i.offsetTop, w: i.offsetWidth, h: i.offsetHeight }; });
    await p.keyboard.press('ArrowRight');
    await p.waitForFunction(() => document.querySelectorAll('.lb-ghost').length === 1 && document.querySelector('.lb-stage img').getAnimations().length > 0, null, { timeout: 3000 });
    assert.notEqual(await p.locator('.lb-stage img').getAttribute('src'), before.src, '그림이 바뀌었다');
    assert.equal(await enterFrom(p), 1, '→ 는 오른쪽에서 들어온다'); n += 2;
    const g = await p.evaluate(() => { const e = document.querySelector('.lb-ghost'), st = getComputedStyle(e), img = document.querySelector('.lb-stage img'), nav = document.querySelector('.lb-nav');
      return { x: e.offsetLeft, y: e.offsetTop, w: e.offsetWidth, h: e.offsetHeight, bg: e.style.backgroundImage, z: +st.zIndex, imgZ: +getComputedStyle(img).zIndex, navZ: +getComputedStyle(nav).zIndex }; });
    assert(Math.max(Math.abs(g.x - before.x), Math.abs(g.y - before.y), Math.abs(g.w - before.w), Math.abs(g.h - before.h)) < 2, '사본은 옛 그림 자리 ' + JSON.stringify([g, before]));
    assert(g.bg.includes('url('), '사본은 나가는 그림'); assert(g.z < g.imgZ && g.imgZ < g.navZ, '사본 < 새 그림 < 넘기기 단추'); n += 3;
    await p.locator('.lb-ghost').waitFor({ state: 'detached', timeout: 3000 });
    assert.equal(await p.locator('.lb-stage img').evaluate(i => +getComputedStyle(i).opacity), 1, '끝나면 새 그림이 다 보인다'); n++;
    await p.keyboard.press('ArrowLeft');
    await p.waitForFunction(() => document.querySelector('.lb-stage img').getAnimations().length > 0, null, { timeout: 3000 });
    assert.equal(await enterFrom(p), -1, '← 는 왼쪽에서 들어온다'); n++;
    await p.locator('.lb-ghost').waitFor({ state: 'detached', timeout: 3000 });
    for (let i = 0; i < 3; i++) await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(100);
    assert(await p.locator('.lb-ghost').count() <= 1, '빠르게 넘겨도 사본 하나'); n++;
    await p.locator('.lb-ghost').waitFor({ state: 'detached', timeout: 3000 }).catch(() => {});
    assert.equal(await p.locator('.lb-ghost').count(), 0, '다 끝나면 사본 없음');
    assert.equal(await p.locator('.lb-stage img').evaluate(i => +getComputedStyle(i).opacity), 1, '마지막 그림이 다 보인다'); n += 2;
    /* 그림이 늦게 와도(1.2초) 칸이 줄었다 커지지 않는다 — 위 이름 줄 · 아래 단추 줄이 그대로, 그동안 옛 그림(사본)이 그대로 보인다
       (사용자 「넘길 때 카드가 밑으로 이동했다가 다시 올라오네」 — 새 그림 요소가 크기 0 인 동안 칸이 줄었다) */
    slow = 1200;
    const cdp = await ctx.newCDPSession(p); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });   /* 본 그림도 다시 받게 — 늦은 망 흉내 */
    const rows = () => p.evaluate(() => [document.querySelector('.lightbox .lb-top'), document.querySelector('.lightbox .bar')].map(e => Math.round(e.getBoundingClientRect().top)));
    const still = await rows(); await p.keyboard.press('ArrowRight');
    const t0 = Date.now();
    for (let i = 0; Date.now() - t0 < 900; i++) {   /* 그림이 오기 전(1.2초) 동안만 */
      await p.waitForTimeout(80);
      assert.deepEqual(await rows(), still, '늦은 그림 — 줄들이 그대로 ' + i);
      assert.equal(await p.locator('.lb-ghost').evaluate(g => +getComputedStyle(g).opacity), 1, '늦은 그림 — 옛 그림이 그대로 보인다 ' + i);
    }
    await p.locator('.lb-ghost').waitFor({ state: 'detached', timeout: 4000 });
    assert.deepEqual(await rows(), still, '다 바뀐 뒤에도 줄들이 그대로');
    assert.equal(await p.locator('.lb-stage').evaluate(e => e.style.minHeight), '', '붙잡은 칸 크기를 푼다'); n += 3;
    slow = 0;
    assert.deepEqual(errors, [], '오류'); n++;
    await ctx.close();
    const b = await open({ reduced: true });
    await b.page.keyboard.press('ArrowRight'); await b.page.waitForTimeout(150);
    assert.equal(await b.page.locator('.lb-ghost').count(), 0, '움직임 줄이기 — 사본 없음');
    assert.equal(await b.page.locator('.lb-stage img').evaluate(i => +getComputedStyle(i).opacity), 1, '움직임 줄이기 — 바로 다 보인다');
    assert.deepEqual(b.errors, [], '오류'); n += 3;
    await b.ctx.close();
    console.log('PASS 원소 도감 넘기기 전환: ' + n + '가지 — 늦은 그림에도 칸이 그대로 · 옛 그림 자리의 사본 · 넘긴 쪽에서 들어옴 · 사본 < 새 그림 < 단추 · 끝나면 정리 · 빠르게 넘겨도 하나 · 움직임 줄이기');
  } finally { await br.close(); server.close(); }
})().catch(e => { console.error(e); process.exit(1); });
