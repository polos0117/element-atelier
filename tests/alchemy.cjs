/* 원소 합성(alchemy.html · lib/alchemy.js, 2026-11-12)
   Run: ESM_DIR=<preact · phaser@4.2.1 이 든 node_modules> CHROMIUM_PATH=<chrome> node tests/alchemy.cjs   (PORT 로 자리 바꾸기, 기본 8802)
   규칙(node): 조합표가 설계표의 가문 elements 그대로 · 두 나라가 나눈 물질은 나라마다 카드 · 한 원소는 그 나라 혼자 가진 물질 · 비활성 기체 · 겹친 원소 · 셋까지 · 힌트가 남은 조합을 돈다
   화면(브라우저): 폰 · PC 에 캔버스가 맞고 넘치지 않는다 · 원소 패를 실제로 눌러 고른다 · 합성하면 카드가 열리고 수집첩에 모인다(새로 고침해도) · 비활성 · 셋까지 · 메뉴에 합성 · 오류 없음 */
const assert = require('node:assert/strict'), http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const A = require(path.join(ROOT, 'lib/alchemy.js'));
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/element-design.json'), 'utf8'));
const IMGJ = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/img.json'), 'utf8')), ST = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/style.json'), 'utf8'));
let n = 0;
/* ── 규칙 ── */
const G = A.build(D, IMGJ.img, ST.default);
assert.equal(G.roots.length, D.nations.length, '근본마다 원소 패');
assert.equal(G.lords.length, D.nations.reduce((s, x) => s + (x.families || []).length, 0), '가문마다 카드');
for (const nn of D.nations) for (const f of nn.families || []) {
  const els = (f.elements && f.elements.length ? f.elements : [nn.key]).slice().sort().join('+');
  assert((G.recipes[els] || []).includes(nn.key + '-' + f.key), '조합표 ' + els + ' 에 ' + nn.key + '-' + f.key);
}
n += 3;
let st = A.blank();
let r = A.combine(G, st, ['o', 'h']);
assert(r.ok && r.lords.includes('h-water') && r.lords.includes('o-water'), 'H + O → 수소의 물 · 산소의 물(차례 상관없이)');
assert.deepEqual(A.combine(G, st, ['h', 'o']).fresh, [], '두 번째는 새 카드 없음');
r = A.combine(G, st, ['fe']);
assert(r.ok && r.lords.every(k => k.startsWith('fe-')) && r.lords.includes('fe-magnet'), '한 원소 — 그 나라 혼자 가진 물질');
assert.equal(A.combine(G, st, ['he', 'o']).why, 'inert', '비활성 기체가 섞이면 inert');
assert.equal(A.combine(G, st, ['fe', 'au']).why, 'none', '없는 조합');
assert.equal(A.combine(G, st, ['h', 'h']).lords.join(), G.recipes.h.join(), '겹친 원소는 하나로');
assert.equal(A.combine(G, st, []).why, 'empty');
assert(A.combine(G, st, ['c', 'h', 'o', 'fe']).lords.includes('c-wood'), '넷째 원소는 버린다(셋까지)');
const seen = new Set(); for (let i = 0; i < 40; i++) { const hh = A.hint(G, st); if (hh) seen.add(hh.symbol + hh.count); }
assert(seen.size >= 4, '힌트가 남은 조합을 돈다 ' + [...seen]);
const all = A.blank(); Object.keys(G.recipes).forEach(k => A.combine(G, all, k.split('+')));
assert.equal(all.found.length, G.lords.length, '조합표로 모든 카드를 찾을 수 있다'); assert.equal(A.hint(G, all), null, '다 찾으면 힌트 없음');
const stale = { found: ['h-water', 'h-water', 'gone-key', 'o-water'], tries: 1, hints: 0 };
assert.deepEqual(A.tidy(G, stale).found, ['h-water', 'o-water'], '지금 없는 카드 · 겹친 열쇠는 뺀다(수집 25 / 24 막기)');
n += 11;
console.log('  규칙 ' + n + '가지 — 조합 ' + Object.keys(G.recipes).length + ' · 카드 ' + G.lords.length);

/* ── 화면 ── */
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { console.log('PASS 원소 합성 규칙: ' + n + '가지(브라우저 없음)'); process.exit(0); }
const PORT = +(process.env.PORT || 8802), BASE = 'http://127.0.0.1:' + PORT;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css' };
const ESM = { 'https://esm.sh/preact@10.24.3': 'preact/dist/preact.mjs', 'https://esm.sh/preact@10.24.3/hooks': 'preact/hooks/dist/hooks.mjs',
  'https://cdn.jsdelivr.net/npm/phaser@4.2.1/dist/phaser.esm.min.js': 'phaser/dist/phaser.esm.min.js' };
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="341" height="512"><rect width="100%" height="100%" fill="#7a8aa0"/><circle cx="170" cy="200" r="90" fill="#e8d8b0"/></svg>';
const server = http.createServer((q, s) => {
  const p = decodeURIComponent(new URL(q.url, BASE).pathname), file = path.join(ROOT, p === '/' ? 'index.html' : p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(s);
});
(async () => {
  await new Promise(ok => server.listen(PORT, ok));
  const br = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const open = async (viewport, ctx0) => {
    const ctx = ctx0 || await br.newContext({ viewport });
    if (!ctx0) await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, rt => {
      const url = rt.request().url();
      if (/\.(webp|png)(\?.*)?$/.test(url)) return rt.fulfill({ contentType: 'image/svg+xml', headers: { 'Access-Control-Allow-Origin': '*' }, body: SVG });
      const file = process.env.ESM_DIR && ESM[url.split('?')[0]];
      if (!file || !fs.existsSync(path.join(process.env.ESM_DIR, file))) return rt.abort();
      return rt.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(process.env.ESM_DIR, file), 'utf8').replace(/from"preact"/g, 'from"https://esm.sh/preact@10.24.3"') });
    });
    const page = await ctx.newPage(), errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(BASE + '/alchemy.html');
    await page.waitForFunction(() => window.AtelierAlchemyGame && window.AtelierAlchemyGame.ready, null, { timeout: 30000 });
    return { ctx, page, errors };
  };
  const S = p => p.evaluate(() => window.AtelierAlchemyGame.state());
  try {
    for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
      const { ctx, page: p, errors } = await open(vp);
      const box = await p.locator('#game canvas').boundingBox();
      assert(box && box.width > 200 && box.x >= -1 && box.x + box.width <= vp.width + 1 && box.y + box.height <= vp.height + 2, vp.width + ' 캔버스가 화면 안 ' + JSON.stringify(box));
      assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), vp.width + ' 옆으로 넘친다');
      assert.equal(await p.locator('.workspace-nav a[aria-current="page"]').getAttribute('href'), 'alchemy.html', '메뉴의 합성'); n += 3;
      /* 원소 패를 실제로 누른다 */
      for (const k of ['h', 'o']) { const at = await p.evaluate(k => window.AtelierAlchemyGame.where(k), k); await p.mouse.click(at.x, at.y); }
      assert.deepEqual((await S(p)).picks, ['h', 'o'], vp.width + ' 눌러서 고른다'); n++;
      await p.evaluate(() => window.AtelierAlchemyGame.combine());
      await p.waitForFunction(() => window.AtelierAlchemyGame.state().overlay === 'reveal', null, { timeout: 10000 });
      let s = await S(p);
      assert.deepEqual(s.cards.slice().sort(), ['h-water', 'o-water'], '카드가 열린다'); assert.deepEqual(s.found.slice().sort(), ['h-water', 'o-water']); assert.deepEqual(s.picks, [], '합성로는 비운다'); n += 3;
      await p.waitForTimeout(1200);
      if (vp.width === 390) await p.screenshot({ path: process.env.SHOT_DIR ? path.join(process.env.SHOT_DIR, 'alchemy-reveal.png') : '/dev/null' }).catch(() => {});
      await p.evaluate(() => window.AtelierAlchemyGame.close());
      /* 비활성 · 셋까지 · 없는 조합 */
      await p.evaluate(() => { const g = window.AtelierAlchemyGame; g.pick('he'); g.pick('o'); g.combine(); });
      s = await S(p); assert.equal(s.overlay, null); assert.match(s.msg, /비활성/, '비활성 기체'); n += 2;
      await p.evaluate(() => { const g = window.AtelierAlchemyGame; g.clear(); ['c', 'h', 'o', 'fe'].forEach(k => g.pick(k)); });
      s = await S(p); assert.deepEqual(s.picks, ['c', 'h', 'o'], '셋까지'); assert.match(s.msg, /세 칸/); n += 2;
      await p.evaluate(() => window.AtelierAlchemyGame.combine());
      await p.waitForFunction(() => window.AtelierAlchemyGame.state().overlay === 'reveal', null, { timeout: 10000 });
      assert.deepEqual((await S(p)).cards.slice().sort(), ['c-wood', 'o-wood'], 'C + H + O → 나무 · 숲'); n++;
      await p.evaluate(() => window.AtelierAlchemyGame.close());
      await p.evaluate(() => window.AtelierAlchemyGame.book()); await p.waitForFunction(() => window.AtelierAlchemyGame.state().overlay === 'book');
      assert.equal((await S(p)).cards.length, 4, '수집첩엔 찾은 카드만 앞면'); n++;
      await p.waitForTimeout(500);
      if (vp.width === 390) await p.screenshot({ path: process.env.SHOT_DIR ? path.join(process.env.SHOT_DIR, 'alchemy-book.png') : '/dev/null' }).catch(() => {});
      await p.evaluate(() => window.AtelierAlchemyGame.close());
      if (vp.width === 390) await p.screenshot({ path: process.env.SHOT_DIR ? path.join(process.env.SHOT_DIR, 'alchemy-main.png') : '/dev/null' }).catch(() => {});
      /* 새로 고침해도 모은 것 그대로 */
      await p.reload(); await p.waitForFunction(() => window.AtelierAlchemyGame && window.AtelierAlchemyGame.ready, null, { timeout: 30000 });
      assert.equal((await S(p)).found.length, 4, '이 기기에 남는다'); n++;
      assert.deepEqual(errors, [], vp.width + ' 오류'); n++;
      await ctx.close();
    }
    console.log('PASS 원소 합성: ' + n + '가지 — 규칙(조합표 · 나눈 물질 · 한 원소 · 비활성 · 셋까지 · 힌트) · 화면(폰 · PC 맞춤 · 눌러 고르기 · 카드 열림 · 수집첩 · 남음 · 메뉴)');
  } finally { await br.close(); server.close(); }
})().catch(e => { console.error(e); process.exit(1); });
