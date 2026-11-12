/* 「들어가는 곳」 가문 층(lib/walk-family.js) — 가문주 크게 · 설계된 주민 전부(그림 없으면 빈 원 → 목록의 그 칸) · 그림 → 한 장 · 같은 물질의 다른 나라 ·
   효과 ⑤(궤도의 가문주 원에서 날아와 머리 그림으로 — 궤도에서 들어올 때만) · 뒤로 가기는 궤도 · 움직임 줄이기.
   Run: NODE_PATH=<playwright 가 든 node_modules> node tests/walk-family.cjs */
const assert = require('node:assert/strict');
const { COVER, WIDE, serve, launch, open, noOverflow, shot } = require('./lib/harness.cjs');
const D = require('../data/element-design.json'), IMGJ = require('../data/img.json');
const anyPic = k => Object.values(((IMGJ.img[k] || {}).byStyle) || {}).some(b => Object.values(b.byForm || {}).some(f => f.f));

(async () => {
  const { base, close } = await serve(), br = await launch();
  try {
    const fe = D.nations.find(n => n.key === 'fe'), steel = fe.families.find(f => f.key === 'steel');
    let { page: p, errors } = await open(br, base, '/index.html?n=fe&f=steel');
    await p.waitForSelector('.w-hero');
    assert.deepEqual(await p.locator('.w-crumbs button').allTextContents(), ['주기율표', '철 Fe', '강철 가문']);
    assert.equal(await p.locator('.w-cit').count(), steel.citizens.length, '설계된 주민 전부');
    assert.equal(await p.locator('.w-cit.empty').count(), steel.citizens.filter(c => !anyPic('fe-steel-' + c.key)).length);
    for (const e of await p.locator('.w-cit.empty').all()) assert.match(await e.textContent(), /아직 그림 없음/);
    for (const b of await p.locator('.w-hero, .w-cit, .w-shared button').all()) assert((await b.boundingBox()).height >= 44);
    const others = steel.elements.filter(k => k !== 'fe' && D.nations.find(n => n.key === k)?.families.some(f => f.key === 'steel'));
    assert.deepEqual(await p.locator('.w-shared button').evaluateAll(b => b.map(x => x.dataset.n)), others);   // ['c']
    assert(await noOverflow(p)); await shot(p, 'family-fe-steel');
    const drawn = steel.citizens.find(c => anyPic('fe-steel-' + c.key)), blank = steel.citizens.find(c => !anyPic('fe-steel-' + c.key));
    if (drawn) { await p.click('.w-cit[data-c="fe-steel-' + drawn.key + '"]'); await p.waitForFunction(() => document.documentElement.dataset.layer === 'card');
      assert.match(p.url(), new RegExp('card=fe-steel-' + drawn.key + '&pic=')); await p.goBack(); await p.waitForSelector('.w-hero'); }
    if (blank) { await p.click('.w-cit[data-c="fe-steel-' + blank.key + '"]'); await p.waitForFunction(() => document.documentElement.dataset.layer === 'list');
      assert.match(p.url(), new RegExp('mode=list&at=fe-steel-' + blank.key)); await p.goBack(); await p.waitForSelector('.w-hero'); }
    await p.click('.w-shared button[data-n="c"]'); await p.waitForURL(/n=c&mode=\w+&f=steel/); await p.waitForSelector('.w-hero');
    assert.equal(await p.locator('.w-cit').count(), D.nations.find(n => n.key === 'c').families.find(f => f.key === 'steel').citizens.length, '다른 나라의 같은 가문');
    await p.goBack(); await p.waitForURL(/n=fe/);
    // ⑤ — 궤도에서 들어오면 날아온다, 뒤로 가기는 궤도
    await p.goto(base + '/index.html?n=fe&mode=orbit'); await p.click('.w-node[data-f="steel"]', { force: true }); await p.waitForSelector('.w-hero');
    assert(await p.evaluate(() => AtelierWalkFx.fired.includes('family')));
    await p.goBack(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'orbit');
    assert(await noOverflow(p)); assert.deepEqual(errors, []);
    const r = await open(br, base, '/index.html?n=fe&mode=orbit', { reduced: true });
    await r.page.click('.w-node[data-f="steel"]', { force: true }); await r.page.waitForSelector('.w-hero');
    assert.deepEqual(await r.page.evaluate(() => AtelierWalkFx.fired), []); await r.ctx.close();
    // 가문주 그림이 없는 가문 — 머리도 빈 원, 누르면 목록의 그 칸
    const bare = D.nations.flatMap(n => n.families.map(f => [n.key, f.key])).find(([n, f]) => !anyPic(n + '-' + f));
    if (bare) { await p.goto(base + '/index.html?n=' + bare[0] + '&f=' + bare[1]); await p.click('.w-hero.empty');
      await p.waitForFunction(() => document.documentElement.dataset.layer === 'list'); assert.match(p.url(), new RegExp('at=' + bare[0] + '-' + bare[1])); }
    // WIDE — 열고 주민 수 · 넘침 · 오류
    const w = await open(br, base, '/index.html?n=fe&f=steel', { viewport: WIDE }); await w.page.waitForSelector('.w-hero');
    assert.equal(await w.page.locator('.w-cit').count(), steel.citizens.length);
    assert(await noOverflow(w.page)); assert.deepEqual(w.errors, []); await shot(w.page, 'family-wide'); await w.ctx.close();
    console.log('PASS walk-family: 주민 전부 · 빈 원 → 목록 그 칸 · 그림 → 한 장 · 같은 물질 다른 나라 · ⑤(궤도에서만) · 뒤로 가기 궤도 · 빈 가문주 · 움직임 줄이기 · ' + COVER.width + ' · ' + WIDE.width);
  } finally { await br.close(); close(); }
})().catch(e => { console.error(e); process.exit(1); });
