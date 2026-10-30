/* 화면 검사 — 첫 화면·도감·생성기를 브라우저로 연다. 폰(390)과 PC(1280).
   첫 화면: 주기율표 118칸, 설계된 나라만 링크, 첫 묶음 카드 수 = 설계표 나라 수.
   도감: 근본 세 칸 · 가문마다 가문주 세 칸 + 주민 줄(안 사는 세계는 흐린 칸) · 같은 물질 다른 나라 링크 · 빈 자리는 생성기로.
   생성기(공방 모음 통합 생성기 꼴): 나라 › 카드 › 갈래 › 단계. 세계 그림은 세계 → 덧붙임 → 지시문. 일상컷은 트리 버전2 — 시대 → 장소 → … 한 칸씩,
   해방(트리 밖 + 까닭), 랜덤(처음부터), 여기부터 다시, 다 골랐다 결과(지시문·파일 이름), 폰은 칩 레일 + 아래 막대 + 시트. 주소 ?card=&o=. 콘솔 오류 없음. 옆으로 넘치지 않음.
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
  const state = pg => pg.evaluate(() => window.AtelierStudio.state());
  const openOf = async pg => (await state(pg)).open;
  const promptOf = pg => pg.evaluate(() => window.AtelierStudio.prompt());
  /* 폰은 🎲 메뉴 안, PC 는 판 밑 — 같은 data-* */
  const menu = async pg => { const m = pg.locator('[data-menu="rand"]'); if (await m.count()) await m.click(); };
  const randAll = async (pg, k) => { await menu(pg); await pg.click('[data-rand-all="' + k + '"]'); };
  /* 다 골랐다로 — 「다 골랐다로」 단추가 있으면 그것(PC 판 밑 · 폰 🎲 메뉴), 없으면 남은 칸(골라도 되는 칸)을 다음·건너뛰기로 넘긴다 */
  const toDone = async pg => {
    for (let i = 0; i < 12 && (await openOf(pg)) !== 'done'; i++) {
      if (await pg.locator('#panel [data-open="done"]').count()) { await pg.click('#panel [data-open="done"]'); continue; }
      const m = pg.locator('[data-menu="rand"]');
      if (await m.count()) { await m.click(); if (await pg.locator('#hbar .hmenu [data-open="done"]').count()) { await pg.click('#hbar .hmenu [data-open="done"]'); continue; } await m.click(); }
      const nx = pg.locator('#hbar [data-skip], #hbar [data-next], #panel [data-next]').first();
      assert(await nx.count(), '넘길 단추가 없다 — ' + (await openOf(pg)));
      await nx.click();
    }
    assert.equal(await openOf(pg), 'done', '다 골랐다에 못 갔다');
  };

  for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
    const mob = vp.width <= 768;
    /* 첫 화면 */
    let v = await open('/index.html', vp);
    await v.page.waitForSelector('.pcell');
    assert.equal(await v.page.locator('.pcell').count(), 118, '주기율표 118칸');
    assert.equal(await v.page.locator('a.pcell').count(), D.nations.length, '설계된 나라만 링크');
    assert.equal(await v.page.locator('.nation-card').count(), D.nations.length, '첫 묶음 카드');
    await noOverflow(v.page, vp.width); assert.deepEqual(v.errors, []); checks += 3; await v.ctx.close();

    /* 도감 — 철 */
    v = await open('/dex.html?nation=fe', vp);
    await v.page.waitForSelector('.dex-head');
    const fe = D.nations.find(n => n.key === 'fe'), fams = fe.families.length, cit = fe.families.reduce((s, f) => s + f.citizens.length, 0);
    assert.equal(await v.page.locator('.worlds:not(.casuals) .slot').count(), 3 + fams * 3 + cit * 3, '근본 3 + 가문주 3×' + fams + ' + 주민 3×' + cit);
    const dead = fe.families.reduce((s, f) => s + f.citizens.reduce((x, c) => x + (3 - c.worlds.length), 0), 0);
    assert.equal(await v.page.locator('.slot[disabled]').count(), dead, '안 사는 세계는 흐린 칸');
    assert((await v.page.locator('a.slot[href^="prompt.html?card=fe-steel&world=fantasy"]').count()) >= 1, '빈 자리는 생성기로');
    await noOverflow(v.page, vp.width); assert.deepEqual(v.errors, []); checks += 3; await v.ctx.close();
    v = await open('/dex.html?nation=h', vp); await v.page.waitForSelector('.dex-head');
    assert.equal(await v.page.locator('.row-head .shared a[href="dex.html?nation=o"]').count(), 1, '물 가문은 산소나라와 나눈다');
    assert.deepEqual(v.errors, []); checks += 1; await v.ctx.close();

    /* 생성기 — 세계 그림: 주소대로 카드·세계 → 덧붙임 → 다 골랐다 */
    v = await open('/prompt.html?card=fe-steel-sword&o=world&world=mecha', vp);
    const p = v.page; await p.waitForSelector('.hchip');
    assert.equal(await openOf(p), 'world', '처음 밟는 갈래는 첫 단계부터(세계는 주소대로 눌려 있다)');
    assert.equal(await p.locator('#panel .opt[data-pick="mecha"][aria-pressed="true"]').count(), 1, '주소의 세계가 눌려 있다');
    await p.click('#panel .opt[data-pick="mecha"]'); assert.equal(await openOf(p), 'notes', '세계 다음 덧붙임');
    assert.equal(await p.locator('.hchip[data-open="world"]').count(), 1, '세계 칩');
    await p.fill('textarea[data-note="scene"]', 'a windy ridge');
    await p.click('[data-next="notes"]');
    assert.equal(await openOf(p), 'done');
    let t0 = await promptOf(p);
    assert(t0.startsWith('CONCEPT: a citizen of the Iron Nation, of the Steel House.') && t0.includes('MECHA DESIGN:') && t0.includes('SCENE NOTE: a windy ridge'), '세계 지시문');
    assert((await p.locator(mob ? '.hres .file' : '#file-name').textContent()).includes('fe-steel-sword_mecha_game_cgi_f.webp'), '파일 이름');
    await p.click('[data-open="world"]'); await p.click('[data-pick="fantasy"]');
    assert.equal(await openOf(p), 'notes', '다 고른 뒤 고쳐도 바로 다음 칸(건너뛰지 않는다)');
    await toDone(p); assert.equal(await openOf(p), 'done', '「다 골랐다로」');
    assert(!(await promptOf(p)).includes('MECHA DESIGN'), '세계가 바뀐다');
    assert.match(p.url(), /card=fe-steel-sword&o=world&world=fantasy/, '주소에 적힌다');
    checks += 6;

    /* 갈래 → 일상컷(버전2): 시대부터 한 칸씩 */
    await p.click('[data-open="out"]'); await p.click('[data-out="casual"]');
    assert.equal(await openOf(p), 'era', '일상컷은 시대부터');
    await p.click('[data-pick="now"]'); assert.equal(await openOf(p), 'place', '다음은 장소');
    assert((await p.locator('#panel .opt[data-pick]').count()) > 20, '장소 목록');
    const placeKey = await p.locator('#panel .opt[data-pick]:not([data-out])').first().getAttribute('data-pick');
    await p.click('#panel .opt[data-pick="' + placeKey + '"]'); assert.equal(await openOf(p), 'weather', '다음은 계절·날씨');
    await p.click('#panel .opt[data-pick=""]'); assert.equal(await openOf(p), 'ofam');
    await p.click('#panel .opt[data-pick="everyday"]'); assert.equal(await openOf(p), 'item');
    await p.click('#panel .opt[data-pick=""]'); assert.equal(await openOf(p), 'preset', '옷 다음 자세 추천');
    /* 추천 하나 → 몸 쪽이 다 차고 시선으로 뛴다 */
    const presetKey = await p.locator('#panel .opt[data-pick]:not([data-out])').nth(1).getAttribute('data-pick');
    await p.click('#panel .opt[data-pick="' + presetKey + '"]');
    let sc = (await state(p)).scene;
    assert(sc.posture && sc.support && sc.frame && sc.body && sc.head && sc.camera, '추천이 몸 쪽을 채웠다 ' + JSON.stringify(sc));
    assert(['gaze', 'legs', 'expr', 'notes', 'use'].includes(await openOf(p)), '추천 뒤 열린 칸 ' + (await openOf(p)));
    assert.equal(await p.locator('.hchip[data-open="posture"]').count(), 1, '몸 자세 칩이 찼다');
    /* 해방 — 몸 자세에서 트리 밖이 흐리게, 까닭이 붙는다 */
    await p.click('[data-open="posture"]');
    const unlock = p.locator('#unlock'); if (await unlock.count()) { await unlock.check(); assert((await p.locator('#panel .opt.out .why').count()) >= 1, '트리 밖 까닭'); await unlock.uncheck(); }
    await toDone(p);
    assert.equal(await openOf(p), 'done');
    const t1 = await promptOf(p);
    assert(t1.includes('POSTURE') && t1.includes('1024') && /overall_intensity: strong/.test(t1) && !/attached image/.test(t1), '일상컷 지시문 ' + t1.slice(0, 200));
    assert((await p.locator(mob ? '.hres .file' : '#file-name').textContent()).includes('fe-steel-sword_game_cgi_f_casual1.webp'), '일상컷 파일 이름');
    checks += 10;
    /* 랜덤 처음부터 — 다 찬다. 여기부터 다시 — 장소를 열면 뒤가 빈다 */
    await randAll(p, 'era');
    assert.equal(await openOf(p), 'done', '랜덤 뒤 다 골랐다');
    sc = (await state(p)).scene; assert(sc.era && sc.place && sc.ofam && sc.posture && sc.frame, '랜덤이 다 채운다');
    await p.click('[data-open="place"]'); await menu(p); await p.click('[data-restart="place"]');
    sc = (await state(p)).scene; assert.equal(await openOf(p), 'place'); assert(!sc.posture && !sc.frame && sc.era && sc.place, '뒤 칸을 비웠다 ' + JSON.stringify(sc));
    assert.match(await p.locator('#status').textContent(), /여기부터 다시/);
    await randAll(p, 'place'); assert.equal(await openOf(p), 'done');
    /* 처음부터 다시 — 카드·갈래는 그대로 */
    await p.click('[data-reset]'); assert.equal(await openOf(p), 'era'); sc = (await state(p)).scene; assert(!sc.place && !sc.posture, '모든 칸을 비웠다');
    assert.equal((await state(p)).card, 'fe-steel-sword'); assert.equal((await state(p)).out, 'casual');
    /* 폰 — 레일 한 줄·아래 막대·시트 */
    if (mob) {
      await randAll(p, 'era');
      const mb = await p.evaluate(() => { const hb = document.getElementById('hbar'), r = hb.getBoundingClientRect(); return { rail: document.querySelector('.hrail') ? document.querySelector('.hrail').getBoundingClientRect().height : 0, barIn: !hb.hidden && r.bottom <= innerHeight + 0.5, path: document.querySelectorAll('.hpath .hcrumb').length, hres: !!document.querySelector('.hres') }; });
      assert(mb.rail > 0 && mb.rail <= 60, '칩 레일 한 줄 ' + mb.rail); assert(mb.barIn, '아래 막대'); assert.equal(mb.path, 3, '경로 나라·카드·갈래'); assert(mb.hres, '결과 상자');
      await p.click('[data-open="era"]'); await p.click('#hbar [data-act="sheet"]'); assert((await p.locator('#hsheet textarea').inputValue()).length > 200, '시트에 지시문'); await p.click('#hsheet [data-act="sheet-close"]');
      checks += 3;
    }
    /* 새로 고쳐도 남는다 */
    await p.reload(); await p.waitForSelector('.hchip');
    assert.equal((await state(p)).card, 'fe-steel-sword'); assert.equal((await state(p)).out, 'casual');
    await noOverflow(p, vp.width); assert.deepEqual(v.errors, []); checks += 6; await v.ctx.close();
  }
  await br.close(); server.close();
  console.log('PASS 화면: 첫 화면(주기율표 118·나라 링크·첫 묶음) · 도감(세 층·흐린 칸·겹치는 가문·빈 자리→생성기) · 생성기(세계 그림·일상컷 버전2 한 칸씩·자세 추천·해방·랜덤·여기부터 다시·처음부터·주소·저장·폰 레일/막대/시트) · 폰·PC — ' + checks + '가지');
})().catch(e => { console.error(e); server.close(); process.exit(1); });
