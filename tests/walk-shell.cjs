/* 「들어가는 곳」 껍데기(index.html · lib/walk.js) — 어두운 한 화면 · 탭 줄 없음 · 깊은 주소의 뒤로 가기 한 층씩 · 낡은 열쇠 · 기억된 보기 · 세계는 하나의 상태 · 길 표시.
   Run: NODE_PATH=<playwright 가 든 node_modules> node tests/walk-shell.cjs */
const assert = require('node:assert/strict');
const { COVER, WIDE, serve, launch, open, noOverflow, shot } = require('./lib/harness.cjs');
const D = require('../data/element-design.json'), IMGJ = require('../data/img.json');
const anyPic = k => Object.values(((IMGJ.img[k] || {}).byStyle) || {}).some(b => Object.values(b.byForm || {}).some(f => f.f));

(async () => {
  const { base, close } = await serve(), br = await launch();
  try {
    // 덮개(COVER)
    let { page: p, errors } = await open(br, base, '/index.html');
    await p.waitForSelector('header.w-bar');
    assert.equal(await p.evaluate(() => document.documentElement.dataset.layer), 'table');
    assert.equal(await p.locator('.workspace-nav, .menu-btn, .title-plaque').count(), 0, '탭 줄 · 타이틀 단추 없음');
    assert.equal(await p.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(7, 8, 12)');
    assert.equal(await p.locator('.w-scenery').count(), 1);
    assert.deepEqual(await p.locator('.w-worlds button').evaluateAll(b => b.map(x => x.dataset.w)), ['fantasy', 'steampunk', 'mecha']);
    // deep URL back steps up(Review Focus 2) — 씨앗이 층마다 한 칸
    await p.goto(base + '/index.html?n=fe&f=steel&card=fe-steel');
    await p.waitForFunction(() => document.documentElement.dataset.layer === 'card');
    for (const [layer, search] of [['family', '?n=fe&mode=orbit&f=steel'], ['orbit', '?n=fe&mode=orbit'], ['table', '']]) {
      await p.goBack(); await p.waitForFunction(l => document.documentElement.dataset.layer === l, layer);
      assert.equal(new URL(p.url()).pathname, '/index.html');
      assert.equal(new URL(p.url()).search, search);   /* 한 장은 그림의 화풍으로 보이되 st 를 쓰지 않는다(A2) — 위 층 주소에 st 가 없다 */
    }
    // stale keys(Review Focus 3) — 빈 화면 없이, 주소도 바로잡힌다
    for (const [u, layer, search] of [['?n=zz', 'table', ''], ['?n=fe&f=nope', 'orbit', '?n=fe&mode=orbit'], ['?n=fe&card=h-water', 'orbit', '?n=fe&mode=orbit'], ['?n=fe&mode=weird', 'orbit', '?n=fe&mode=orbit']]) {
      await p.goto(base + '/index.html' + u); await p.waitForFunction(l => document.documentElement.dataset.layer === l, layer);
      assert.equal(new URL(p.url()).search, search, u);
    }
    // 기억된 보기 — 다음에 들어오면 그 보기로, 엉뚱한 기억값은 궤도
    let o = await open(br, base, '/index.html?n=fe', { pref: { mode: 'list' } });
    await o.page.waitForFunction(() => document.documentElement.dataset.layer === 'list'); await o.ctx.close();
    o = await open(br, base, '/index.html?n=fe', { pref: { mode: 'garbage' } });
    await o.page.waitForFunction(() => document.documentElement.dataset.layer === 'orbit'); await o.ctx.close();
    // 세계는 하나의 상태 — 뒤로 가도 남는다, 옆으로 바꾸기는 역사를 늘리지 않는다
    await p.goto(base + '/index.html?n=fe&f=steel'); await p.waitForSelector('.w-worlds');
    const len = await p.evaluate(() => history.length);
    await p.click('.w-worlds [data-w="mecha"]');
    assert.equal(await p.evaluate(() => history.length), len); assert.match(p.url(), /w=mecha/);
    await p.goBack(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'orbit');
    assert.equal(await p.getAttribute('.w-worlds [data-w="mecha"]', 'aria-pressed'), 'true'); assert.match(p.url(), /w=mecha/);
    // 길 표시
    await p.goto(base + '/index.html?n=fe&f=steel'); await p.waitForSelector('.w-crumbs button');
    assert.deepEqual(await p.locator('.w-crumbs button').allTextContents(), ['주기율표', '철 Fe', '강철 가문']);
    await p.click('.w-crumbs button >> nth=0'); await p.waitForFunction(() => document.documentElement.dataset.layer === 'table');
    assert.equal(await p.evaluate(() => sessionStorage.getItem('element_walk_last')), await p.evaluate(() => location.search));
    assert(await noOverflow(p), '덮개 넘침'); assert.deepEqual(errors, []);
    await shot(p, 'shell-table');
    // 빈 자리에서 목록으로 건너뛰어도 뒤로 가기는 한 층씩(A1 — mode 는 그 칸의 것, 뒤로 가기에 지금 보기를 덮지 않는다)
    const layerIs = (pg, l) => pg.waitForFunction(x => document.documentElement.dataset.layer === x, l, { timeout: 5000 });
    const backThrough = async (pg, layers) => { for (const l of layers) { await pg.goBack(); await layerIs(pg, l); } };
    const bareN = D.nations.find(n => !anyPic(n.key)).key;     // 지금 ne
    o = await open(br, base, '/index.html'); await o.page.waitForSelector('.pcell.on');
    await o.page.locator('.pcell.on[data-n="' + bareN + '"]').click(); await o.page.click('.w-ncard [data-act="enter"]');
    await o.page.click('.w-nucleus.empty'); await layerIs(o.page, 'list');
    await backThrough(o.page, ['orbit', 'table']);
    const cN = D.nations.find(n => n.families.some(f => anyPic(n.key + '-' + f.key) && f.citizens.some(c => !anyPic(n.key + '-' + f.key + '-' + c.key))));
    const cF = cN.families.find(f => anyPic(cN.key + '-' + f.key) && f.citizens.some(c => !anyPic(cN.key + '-' + f.key + '-' + c.key)));
    await o.page.locator('.pcell.on[data-n="' + cN.key + '"]').click(); await o.page.click('.w-ncard [data-act="enter"]');
    await o.page.click('.w-node[data-f="' + cF.key + '"]', { force: true }); await layerIs(o.page, 'family');
    await o.page.click('.w-cit.empty >> nth=0'); await layerIs(o.page, 'list');
    await backThrough(o.page, ['family', 'orbit', 'table']);
    // 보기 기억은 궤도/목록 고르개만(A3) — 나라 카드의 「목록」 은 기억을 바꾸지 않고, 목록으로 들어가면 ① 의 출발 자리가 남지 않는다
    await o.page.locator('.pcell.on[data-n="fe"]').click(); await o.page.click('.w-ncard [data-act="list"]'); await layerIs(o.page, 'list');
    await o.page.goBack(); await layerIs(o.page, 'table');
    await o.page.locator('.pcell.on[data-n="h"]').click(); await o.page.click('.w-ncard [data-act="enter"]'); await layerIs(o.page, 'orbit');
    await o.page.click('.w-mode [data-mode="list"]'); await layerIs(o.page, 'list');
    assert.equal(JSON.parse(await o.page.evaluate(() => localStorage.getItem('element_dex_v1'))).mode, 'list', '고르개는 기억시킨다');
    await o.page.click('.w-crumbs button >> nth=0'); await layerIs(o.page, 'table');
    await o.page.locator('.pcell.on[data-n="fe"]').click(); await o.page.click('.w-ncard [data-act="enter"]'); await layerIs(o.page, 'list');
    const fired = await o.page.evaluate(() => AtelierWalkFx.fired.filter(x => x === 'enter').length);
    await o.page.click('.w-mode [data-mode="orbit"]'); await layerIs(o.page, 'orbit'); await o.page.waitForTimeout(200);
    assert.equal(await o.page.evaluate(() => AtelierWalkFx.fired.filter(x => x === 'enter').length), fired, '목록으로 들어간 뒤 궤도로 바꿔도 ① 이 엉뚱하게 터지지 않는다');
    assert.deepEqual(o.errors, []); await o.ctx.close();
    // 길 표시는 위로(A6) — 한 장에서 「철 Fe」 를 누르면 역사를 거슬러 오르고(역사 그대로), 뒤로 가기는 주기율표(한 장이 다시 열리지 않는다)
    o = await open(br, base, '/index.html?n=fe&f=steel&card=fe-steel'); await o.page.waitForSelector('.lb-stage img');
    const hl = await o.page.evaluate(() => history.length);
    await o.page.click('.w-crumbs button >> nth=1'); await layerIs(o.page, 'orbit');
    assert.equal(await o.page.evaluate(() => history.length), hl, '길 표시가 역사를 늘리지 않는다');
    await o.page.goBack(); await layerIs(o.page, 'table');
    assert.deepEqual(o.errors, []); await o.ctx.close();
    // WIDE — 열고 넘침 · 오류만
    o = await open(br, base, '/index.html?n=fe&f=steel', { viewport: WIDE });
    await o.page.waitForSelector('.w-crumbs button');
    for (const b of await o.page.locator('.w-worlds button').all()) assert((await b.boundingBox()).height >= 44, '넓은 화면 세계 단추 44px(B7)');
    assert(await noOverflow(o.page), '넓은 화면 넘침'); assert.deepEqual(o.errors, []);
    await shot(o.page, 'shell-wide');
    console.log('PASS walk-shell: 어두운 한 화면 · 탭 줄 없음 · 깊은 주소 뒤로 가기 한 층씩 · 낡은 열쇠 넷 · 기억된 보기 · 세계는 하나 · 길 표시 · ' + COVER.width + ' · ' + WIDE.width + ' 넘침 0');
  } finally { await br.close(); close(); }
})().catch(e => { console.error(e); process.exit(1); });
