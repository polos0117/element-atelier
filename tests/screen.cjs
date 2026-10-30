/* 화면 검사 — 첫 화면·도감·생성기를 브라우저로 연다. 폰(390)과 PC(1280).
   첫 화면: 주기율표 118칸, 설계된 나라만 링크, 첫 묶음 카드 수 = 설계표 나라 수.
   도감: 근본 세 칸 · 가문마다 가문주 세 칸 + 주민 줄(안 사는 세계는 흐린 칸) · 같은 물질 다른 나라 링크 · 빈 자리는 생성기로.
   생성기: 카드·세계를 바꾸면 지시문이 바뀌고 CONCEPT 로 시작, 파일 이름 꼴, 덧붙임이 실린다, 주소에 ?card=&world=, 새로 고쳐도 남는다.
   콘솔 오류 없음. 옆으로 넘치지 않음.
   Run: ESM_DIR=<preact 가 든 node_modules> CHROMIUM_PATH=<chrome> node tests/screen.cjs   (PORT 로 자리 바꾸기, 기본 8794) */
const assert = require('node:assert/strict'), http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..'), PORT = +(process.env.PORT || 8794), BASE = 'http://127.0.0.1:' + PORT;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.md': 'text/markdown', '.webp': 'image/webp', '.png': 'image/png' };
const server = http.createServer((q, s) => {
  const p = decodeURIComponent(new URL(q.url, BASE).pathname), file = path.join(ROOT, p === '/' ? 'index.html' : p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(s);
});
const ESM = { 'https://esm.sh/preact@10.24.3': 'preact/dist/preact.mjs', 'https://esm.sh/preact@10.24.3/hooks': 'preact/hooks/dist/hooks.mjs' };
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/element-design.json'), 'utf8'));

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const br = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  let checks = 0;
  const open = async (url, viewport) => {
    const ctx = await br.newContext({ viewport });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => {
      const file = process.env.ESM_DIR && ESM[r.request().url().split('?')[0]];
      if (!file || !fs.existsSync(path.join(process.env.ESM_DIR, file))) return r.abort();
      return r.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(process.env.ESM_DIR, file), 'utf8').replace(/from"preact"/g, 'from"https://esm.sh/preact@10.24.3"') });
    });
    const page = await ctx.newPage(), errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await page.goto(BASE + url); return { ctx, page, errors };
  };
  const noOverflow = async (page, w) => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), w + ' 옆으로 넘친다');

  for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
    /* 첫 화면 */
    let v = await open('/index.html', vp);
    await v.page.waitForSelector('.pcell');
    assert.equal(await v.page.locator('.pcell').count(), 118, '주기율표 118칸');
    assert.equal(await v.page.locator('a.pcell').count(), D.nations.length, '설계된 나라만 링크');
    assert.equal(await v.page.locator('.nation-card').count(), D.nations.length, '첫 묶음 카드');
    assert.equal(await v.page.locator('a.pcell[href="dex.html?nation=fe"]').count(), 1, '철 칸이 도감으로');
    await noOverflow(v.page, vp.width); assert.deepEqual(v.errors, []); checks += 4; await v.ctx.close();

    /* 도감 — 철 */
    v = await open('/dex.html?nation=fe', vp);
    await v.page.waitForSelector('.dex-head');
    const fe = D.nations.find(n => n.key === 'fe'), fams = fe.families.length, cit = fe.families.reduce((s, f) => s + f.citizens.length, 0);
    const slots = await v.page.locator('.slot').count();
    assert.equal(slots, 3 + fams * 3 + cit * 3, '근본 3 + 가문주 3×' + fams + ' + 주민 3×' + cit + ' — ' + slots);
    const dead = fe.families.reduce((s, f) => s + f.citizens.reduce((t, c) => t + (3 - c.worlds.length), 0), 0);
    assert.equal(await v.page.locator('.slot[disabled]').count(), dead, '안 사는 세계는 흐린 칸');
    assert.equal(await v.page.locator('.citizen').count(), cit, '주민 줄');
    assert.equal(await v.page.locator('.row-head .shared').count(), 0, '산소나라엔 녹·피 가문이 없어 잇지 않는다');
    assert((await v.page.locator('a.slot[href^="prompt.html?card=fe&world=fantasy"]').count()) >= 1, '빈 자리는 생성기로');
    assert.equal(await v.page.locator('.dex-pick a[aria-current="page"]').textContent(), 'Fe철', '고른 나라');
    await noOverflow(v.page, vp.width); assert.deepEqual(v.errors, []); checks += 6; await v.ctx.close();
    /* 도감 — 수소의 물은 산소나라의 물과 잇는다 */
    v = await open('/dex.html?nation=h', vp);
    await v.page.waitForSelector('.dex-head');
    assert.equal(await v.page.locator('.row-head .shared a[href="dex.html?nation=o"]').count(), 1, '물 가문은 산소나라와 나눈다');
    assert.deepEqual(v.errors, []); checks += 1; await v.ctx.close();

    /* 생성기 */
    v = await open('/prompt.html?card=fe-steel-sword&world=mecha', vp);
    await v.page.waitForSelector('.out');
    const t0 = await v.page.locator('.out').first().inputValue();
    assert(t0.startsWith('CONCEPT: a citizen of the Iron Nation, of the Steel House.') && t0.includes('MECHA DESIGN:'), '주소대로 카드·세계');
    assert((await v.page.locator('.file').textContent()).includes('fe-steel-sword_mecha_game_keyart_f.webp'), '파일 이름');
    await v.page.click('.chips button[aria-pressed="false"]:not([disabled])');
    const t1 = await v.page.locator('.out').first().inputValue(); assert(t1 !== t0 && !t1.includes('MECHA DESIGN'), '세계를 바꾸면 지시문이 바뀐다');
    await v.page.selectOption('select >> nth=1', 'fe-steel-bridge');
    assert.equal(await v.page.locator('.chips button[disabled]').count(), 1, '철교는 판타지에 안 산다');
    assert((await v.page.locator('.out').first().inputValue()).includes('iron truss bridge'), '카드를 바꾸면 물건이 바뀐다');
    await v.page.fill('textarea >> nth=0', 'a windy ridge');
    assert((await v.page.locator('.out').first().inputValue()).includes('SCENE NOTE: a windy ridge'), '덧붙임이 실린다');
    assert.match(v.page.url(), /card=fe-steel-bridge&world=/, '주소에 적힌다');
    await v.page.reload(); await v.page.waitForSelector('.out');
    assert((await v.page.locator('.out').first().inputValue()).includes('SCENE NOTE: a windy ridge'), '새로 고쳐도 남는다');
    await v.page.selectOption('select >> nth=0', 'og');
    assert((await v.page.locator('.out').first().inputValue()).includes('Oganesson'), '나라를 바꾸면 근본으로');
    await noOverflow(v.page, vp.width); assert.deepEqual(v.errors, []); checks += 9; await v.ctx.close();
  }
  await br.close(); server.close();
  console.log('PASS 화면: 첫 화면(주기율표 118·나라 링크·첫 묶음) · 도감(세 층·흐린 칸·겹치는 가문·빈 자리→생성기) · 생성기(주소·세계·카드·덧붙임·저장) · 폰·PC — ' + checks + '가지');
})().catch(e => { console.error(e); server.close(); process.exit(1); });
