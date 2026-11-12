/* 「들어가는 곳」 나라 · 궤도 층(lib/walk-orbit.js) — 설계된 가문 전부(그림 없으면 빈 원) · 궤도 그림 일곱 / 코드가 그린 점선 고리 · 가문 없는 나라 · 그림 없는 나라 ·
   근본 → 한 장, 가문주 → 가문, 빈 원 → 목록의 그 칸 · ‹ › 앞뒤 나라(역사 그대로) · 궤도로/목록으로(역사 그대로, 기기에 기억) · 효과 ①(주기율표에서 들어갈 때만) ·
   펼침으로 넓혀도 원이 무대 안 · 궤도 그림 404 → 점선 · 움직임 줄이기.
   Run: NODE_PATH=<playwright 가 든 node_modules> node tests/walk-orbit.cjs */
const assert = require('node:assert/strict');
const { COVER, WIDE, serve, launch, open, noOverflow, shot } = require('./lib/harness.cjs');
const D = require('../data/element-design.json'), IMGJ = require('../data/img.json');
const anyPic = k => Object.values(((IMGJ.img[k] || {}).byStyle) || {}).some(b => Object.values(b.byForm || {}).some(f => f.f));

(async () => {
  const { base, close } = await serve(), br = await launch();
  try {
    const ORB = ['fe', 'h', 'o', 'c', 'na', 'au', 'og'], fe = D.nations.find(n => n.key === 'fe');
    let { page: p, errors, requests } = await open(br, base, '/index.html?n=fe&mode=orbit');
    await p.waitForSelector('.w-stage');
    assert.equal(await p.locator('.w-node').count(), fe.families.length, '설계된 가문 전부');
    assert.equal(await p.locator('.w-node.empty').count(), fe.families.filter(f => !anyPic('fe-' + f.key)).length);
    for (const e of await p.locator('.w-node.empty').all()) assert.match(await e.textContent(), /아직 그림 없음/);
    assert.match(await p.getAttribute('img.w-orbit-img', 'src'), /orbits\/orbit-fe\.webp$/);
    assert.equal(await p.locator('.w-ring-dash').count(), 0); assert.equal(await p.locator('.w-ring-line').count(), 1);
    for (const b of await p.locator('.w-node, .w-nucleus, .w-mode button, [data-step]').all()) { const r = await b.boundingBox(); assert(r.width >= 44 && r.height >= 44); }
    assert(await noOverflow(p), '덮개 넘침 없음');
    // 코드가 그린 고리 — 그림이 없는 나라는 그 그림을 부르지도 않는다
    const noOrb = D.nations.find(n => !ORB.includes(n.key)).key;
    await p.goto(base + '/index.html?n=' + noOrb + '&mode=orbit'); await p.waitForSelector('.w-ring-dash');
    assert.equal(await p.locator('img.w-orbit-img').count(), 0); assert.equal(requests.filter(u => u.includes('orbit-' + noOrb + '.webp')).length, 0);
    // 가문 없는 나라 · 그림 없는 나라도 들어간다
    await p.goto(base + '/index.html?n=og&mode=orbit'); await p.waitForSelector('.w-nucleus'); assert.equal(await p.locator('.w-node').count(), 0);
    const bare = D.nations.find(n => !anyPic(n.key)).key;     // 지금 ne
    await p.goto(base + '/index.html?n=' + bare + '&mode=orbit'); await p.click('.w-nucleus.empty');
    await p.waitForFunction(() => document.documentElement.dataset.layer === 'list'); assert.match(p.url(), new RegExp('mode=list&at=' + bare));
    // 그림 있는 근본 → 한 장, 가문주 → 가문
    await p.goto(base + '/index.html?n=fe&mode=orbit'); await p.click('.w-nucleus');
    await p.waitForFunction(() => document.documentElement.dataset.layer === 'card'); assert.match(p.url(), /card=fe&pic=/);
    await p.goBack(); const lord = fe.families.find(f => anyPic('fe-' + f.key));
    await p.click('.w-node[data-f="' + lord.key + '"]', { force: true }); await p.waitForFunction(() => document.documentElement.dataset.layer === 'family');
    await p.goBack(); await p.waitForSelector('.w-stage');
    // ‹ › — 주기율표 번호 차례, 역사는 그대로, 뒤로 가기는 주기율표
    assert.deepEqual(await p.locator('.w-crumbs button').allTextContents(), ['주기율표', '철 Fe']);
    const len = await p.evaluate(() => history.length);
    await p.click('[data-step="next"]'); await p.waitForURL(/n=cu/); assert.equal(await p.evaluate(() => history.length), len);
    // 궤도로 / 목록으로 — 역사 그대로, 기기에 기억
    await p.click('.w-mode [data-mode="list"]'); await p.waitForFunction(() => document.documentElement.dataset.layer === 'list');
    assert.equal(await p.evaluate(() => history.length), len); assert.equal(JSON.parse(await p.evaluate(() => localStorage.getItem('element_dex_v1'))).mode, 'list');
    await p.goBack(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'table');
    // ① — 주기율표에서 들어가면 돈다. 위에서 「목록」 이 기억됐고 「들어가기」 는 기억된 보기로 가니(설계 물음 2) 궤도로 되돌려 둔다
    await p.evaluate(() => localStorage.setItem('element_dex_v1', JSON.stringify({ mode: 'orbit' })));
    await p.locator('.pcell.on[data-n="fe"]').click(); await p.click('.w-ncard [data-act="enter"]'); await p.waitForSelector('.w-stage');
    assert(await p.evaluate(() => AtelierWalkFx.fired.includes('enter')));
    // 펼침 — 덮개 → 넓게 바꿔도 원이 무대 안, 넘침 없음
    await p.setViewportSize({ width: 884, height: 1104 }); await p.waitForTimeout(300);
    const st = await p.locator('.w-stage').boundingBox();
    for (const b of await p.locator('.w-node').all()) { const r = await b.boundingBox(); assert(r.x >= st.x - 30 && r.x + r.width <= st.x + st.width + 30); }
    assert(await noOverflow(p)); assert.deepEqual(errors, []);
    await p.context().close();
    // orbit image fails(Review Focus 5)
    const f = await open(br, base, '/index.html?n=fe&mode=orbit', { failURL: /orbit-fe\.webp/ });
    await f.page.waitForSelector('.w-ring-dash'); assert.equal(await f.page.locator('.w-ring-line').count(), 1); assert.deepEqual(f.errors, []); await f.ctx.close();
    // 움직임 줄이기 — 주기율표에서 들어가도 ① 없음
    const r = await open(br, base, '/index.html', { reduced: true });
    await r.page.locator('.pcell.on[data-n="fe"]').click(); await r.page.click('.w-ncard [data-act="enter"]'); await r.page.waitForSelector('.w-stage');
    assert.deepEqual(await r.page.evaluate(() => AtelierWalkFx.fired), []); await r.ctx.close();
    // WIDE — 열고 노드 수 · 넘침 · 오류
    const w = await open(br, base, '/index.html?n=o&mode=orbit', { viewport: WIDE }); await w.page.waitForSelector('.w-stage');
    assert.equal(await w.page.locator('.w-node').count(), D.nations.find(n => n.key === 'o').families.length);
    assert(await noOverflow(w.page)); assert.deepEqual(w.errors, []); await shot(w.page, 'orbit-wide'); await w.ctx.close();
    console.log('PASS walk-orbit: 설계된 가문 전부 · 빈 원 · 궤도 그림/점선 고리 · 가문 없는 나라 · 그림 없는 나라 → 목록 · 근본 → 한 장 · 가문주 → 가문 · ‹ › 역사 그대로 · 궤도/목록 기억 · ① · 펼침 · 그림 404 · 움직임 줄이기 · ' + COVER.width + ' · ' + WIDE.width);
  } finally { await br.close(); close(); }
})().catch(e => { console.error(e); process.exit(1); });
