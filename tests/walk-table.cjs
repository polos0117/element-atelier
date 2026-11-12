/* 「들어가는 곳」 첫 화면 주기율표(lib/walk-table.js) — 118칸 · 나라 칸 = 설계표 나라 · 범례 열 · 표 안 가로 스크롤 없음 · 흐린 칸을 눌러도 가까운 나라 ·
   나라 카드(가문 · 주민 수, 들어가기 · 목록 44px, Esc) · 「들어가기」 두 번에 역사 한 칸 · PixiJS 안 받음 · 옛 hall.html · 효과 ④(숨쉬기 · 불꽃)와 움직임 줄이기/끄기.
   Run: NODE_PATH=<playwright 가 든 node_modules> node tests/walk-table.cjs */
const assert = require('node:assert/strict');
const { COVER, WIDE, serve, launch, open, noOverflow, shot, contrast } = require('./lib/harness.cjs');
const D = require('../data/element-design.json');

(async () => {
  const { base, close } = await serve(), br = await launch();
  try {
    const { page: p, errors, requests } = await open(br, base, '/index.html');
    await p.waitForSelector('.w-table .pcell');
    assert.equal(await p.locator('.w-table .pcell').count(), 118);
    assert.equal(await p.locator('.w-table .pcell.on').count(), D.nations.length, '나라 칸 수 = 설계표 나라 수');
    assert.equal(await p.locator('.w-legend [data-cat]').count(), 10);
    assert(await p.evaluate(() => { const t = document.querySelector('.w-table'); return t.scrollWidth <= t.clientWidth + 1; }), '표 안 가로 스크롤 없음');
    assert.equal(await p.locator('.pcell.on >> nth=0').evaluate(e => getComputedStyle(e).animationName), 'w-breathe');
    // 흐린 칸(루테늄 — 철 바로 아래) 쪽을 눌러도 철이 잡힌다. 옆의 코발트 · 망가니즈는 나라가 됐다(2026-11-13)
    const fe = await p.locator('.pcell.on[data-n="fe"]').boundingBox();
    await p.mouse.click(fe.x + fe.width / 2, fe.y + fe.height * 1.4);
    await p.waitForSelector('.w-ncard[data-n="fe"]');
    assert(await p.locator('.w-spark').count() >= 1, '④ 불꽃');
    await shot(p, 'table-ncard');
    await p.waitForTimeout(1000);
    assert.equal(await p.locator('.w-spark').count(), 0, '불꽃은 사라진다');
    const n = D.nations.find(x => x.key === 'fe'), cit = n.families.reduce((s, f) => s + f.citizens.length, 0);
    assert((await p.locator('.w-ncard').textContent()).includes('가문 ' + n.families.length + ' · 주민 ' + cit));
    for (const a of ['enter', 'list']) assert((await p.locator('.w-ncard [data-act="' + a + '"]').boundingBox()).height >= 44);
    for (const [t, r] of await contrast(p, '.w-ncard [data-act="enter"], .w-worlds [aria-pressed="true"]')) assert(r >= 4.5, '대비(B8) ' + t + ' ' + r);
    // Esc 로 닫힘 — 역사는 그대로
    const len0 = await p.evaluate(() => history.length);
    await p.keyboard.press('Escape'); await p.waitForSelector('.w-ncard', { state: 'detached' });
    assert.equal(await p.evaluate(() => history.length), len0);
    await p.locator('.pcell.on[data-n="fe"]').click(); await p.waitForSelector('.w-ncard[data-n="fe"]');
    assert.equal(requests.filter(u => /pixi/.test(u)).length, 0, '주기율표는 PixiJS 를 받지 않는다(궤도 입자 — 과제 5 — 는 궤도에 들어가서야)');
    // double enter(Review Focus 4) — 역사는 한 칸만
    const len = await p.evaluate(() => history.length);
    await p.locator('.w-ncard [data-act="enter"]').evaluate(b => { b.click(); b.click(); });   // 다시 그리기 전에 두 번
    await p.waitForFunction(() => document.documentElement.dataset.layer === 'orbit');
    assert.equal(await p.evaluate(() => history.length), len + 1); assert.match(p.url(), /\?n=fe&mode=orbit/);
    await p.goBack(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'table');
    assert(await noOverflow(p)); assert.deepEqual(errors, []); await p.context().close();
    // 주기율표 → 목록(궤도를 거치지 않고) — PixiJS 0
    const l = await open(br, base, '/index.html'); await l.page.waitForSelector('.pcell.on');
    await l.page.locator('.pcell.on[data-n="h"]').click(); await l.page.click('.w-ncard [data-act="list"]');
    await l.page.waitForFunction(() => document.documentElement.dataset.layer === 'list'); await l.page.waitForTimeout(500);
    assert.equal(l.requests.filter(u => /pixi/.test(u)).length, 0, '주기율표 · 목록은 PixiJS 를 받지 않는다'); assert.deepEqual(l.errors, []); await l.ctx.close();
    // 옛 주소
    const hl = await open(br, base, '/hall.html?x=1'); await hl.page.waitForSelector('.w-table');
    assert.equal(new URL(hl.page.url()).pathname + new URL(hl.page.url()).search, '/index.html'); assert.deepEqual(hl.errors, []); await hl.ctx.close();
    // 움직임 줄이기 — 숨쉬기 · 불꽃 없음
    const r = await open(br, base, '/index.html', { reduced: true }); await r.page.waitForSelector('.pcell.on');
    assert.equal(await r.page.locator('.pcell.on >> nth=0').evaluate(e => getComputedStyle(e).animationName), 'none');
    await r.page.locator('.pcell.on[data-n="fe"]').click(); await r.page.waitForSelector('.w-ncard');
    assert.equal(await r.page.locator('.w-spark').count(), 0); assert.deepEqual(await r.page.evaluate(() => AtelierWalkFx.fired), []);
    await r.ctx.close();
    // 움직임 끄기(도구 상자 설정) — 기기가 움직여도 같다
    const m = await open(br, base, '/index.html'); await m.page.waitForSelector('.pcell.on');
    await m.page.evaluate(() => AtelierWalk.setMotion(false));
    assert.equal(await m.page.locator('.pcell.on >> nth=0').evaluate(e => getComputedStyle(e).animationName), 'none');
    await m.page.locator('.pcell.on[data-n="fe"]').click(); await m.page.waitForSelector('.w-ncard');
    assert.equal(await m.page.locator('.w-spark').count(), 0); assert.deepEqual(await m.page.evaluate(() => AtelierWalkFx.fired), []);
    await m.ctx.close();
    // 나라 판(2026-11-13) — 타일 = 나라 수 · 덮개에서 누를 만한 크기 · 장수는 기본 화풍만 · 거르개 · 타일 → 카드(세계별 장수) · 그림 없는 나라는 표에서 테두리만
    const b = await open(br, base, '/index.html'); await b.page.waitForSelector('.w-tile');
    const IMGS = require('../data/img.json').img, ST = require('../data/style.json').default, WS = D.vocab.worlds;
    const count = n => { let done = 0, all = 0, cas = 0; const one = (k, ws) => { const f = ((IMGS[k] || {}).byStyle || {})[ST]; const m = (f && f.byForm) || {};
        for (const w of ws) { all++; if (m[w] && m[w].f) done++; } for (const w of WS) cas += (((m[w] || {}).casual || {}).f || []).length; };
      one(n.key, WS); for (const f of n.families || []) { one(n.key + '-' + f.key, WS); for (const c of f.citizens || []) one(n.key + '-' + f.key + '-' + c.key, c.worlds || []); }
      return { done, all, cas }; };
    assert.equal(await b.page.locator('.w-tile').count(), D.nations.length, '타일 = 나라 수');
    for (const bx of await b.page.locator('.w-tile').evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return [r.width, r.height]; }))) assert(bx[0] >= 90 && bx[1] >= 44, '타일 크기 ' + bx);
    const cFe = count(D.nations.find(x => x.key === 'fe')), tFe = await b.page.locator('.w-tile[data-n="fe"]').textContent();
    assert(tFe.includes('세계 ' + cFe.done + '/' + cFe.all) && tFe.includes('일상 ' + cFe.cas), '철 장수(기본 화풍) ' + tFe);
    const none = D.nations.filter(n => { const c = count(n); return !c.done && !c.cas; }).length;
    assert.equal(await b.page.locator('.pcell.on.bare').count(), none, '그림 없는 나라 칸은 테두리만');
    await b.page.click('.w-filter [data-f="none"]'); assert.equal(await b.page.locator('.w-tile').count(), none);
    await b.page.click('.w-filter [data-f="has"]'); assert.equal(await b.page.locator('.w-tile').count(), D.nations.length - none);
    for (const bx of await b.page.locator('.w-filter button').evaluateAll(es => es.map(e => e.getBoundingClientRect().height))) assert(bx >= 44);
    await b.page.click('.w-tile[data-n="fe"]'); await b.page.waitForSelector('.w-tiles .w-ncard[data-n="fe"]');
    assert.equal(await b.page.locator('.w-ncard-tally > div').count(), WS.length + 1);
    assert.equal((await b.page.locator('.w-ncard-tally [data-w="casual"] dd').textContent()).trim(), String(cFe.cas));
    assert(await noOverflow(b.page)); await shot(b.page, 'table-board');
    await b.page.click('.w-tile[data-n="fe"]'); await b.page.waitForSelector('.w-ncard', { state: 'detached' });   // 같은 타일 다시 = 닫기
    // 표를 누르면 거르개가 전부로 돌아가고 그 나라 카드가 판에 뜬다
    await b.page.click('.w-filter [data-f="none"]'); await b.page.locator('.pcell.on[data-n="h"]').click(); await b.page.waitForSelector('.w-tiles .w-ncard[data-n="h"]');
    assert.equal(await b.page.locator('.w-tile').count(), D.nations.length); assert.deepEqual(b.errors, []); await b.ctx.close();
    // WIDE — 118 · 나라 수 · 넘침 · 오류
    const w = await open(br, base, '/index.html', { viewport: WIDE }); await w.page.waitForSelector('.w-table .pcell');
    assert.equal(await w.page.locator('.w-table .pcell').count(), 118); assert.equal(await w.page.locator('.w-table .pcell.on').count(), D.nations.length);
    assert(await w.page.evaluate(() => document.querySelector('.pcell').getBoundingClientRect().width <= 56.5), '넓으면 칸 최대 56px');
    assert(await noOverflow(w.page)); assert.deepEqual(w.errors, []);
    await shot(w.page, 'table-wide'); await w.ctx.close();
    console.log('PASS walk-table: 118칸 · 나라 ' + D.nations.length + ' · 범례 10 · 가로 스크롤 없음 · 흐린 칸 → 가까운 나라 · 나라 카드(수 · 44px · Esc) · 두 번 눌러도 역사 한 칸 · PixiJS 0 · 옛 hall.html · ④ 숨쉬기 · 불꽃 · 움직임 줄이기/끄기 · ' + COVER.width + ' · ' + WIDE.width);
  } finally { await br.close(); close(); }
})().catch(e => { console.error(e); process.exit(1); });
