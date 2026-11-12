/* 「들어가는 곳」 껍데기(index.html · lib/walk.js) — 어두운 한 화면 · 탭 줄 없음 · 깊은 주소의 뒤로 가기 한 층씩 · 낡은 열쇠 · 기억된 보기 · 세계는 하나의 상태 · 길 표시.
   Run: NODE_PATH=<playwright 가 든 node_modules> node tests/walk-shell.cjs */
const assert = require('node:assert/strict');
const { COVER, WIDE, serve, launch, open, noOverflow, shot } = require('./lib/harness.cjs');

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
      assert.equal(new URL(p.url()).pathname, '/index.html'); assert.equal(new URL(p.url()).search, search);
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
    // WIDE — 열고 넘침 · 오류만
    o = await open(br, base, '/index.html?n=fe&f=steel', { viewport: WIDE });
    await o.page.waitForSelector('.w-crumbs button');
    assert(await noOverflow(o.page), '넓은 화면 넘침'); assert.deepEqual(o.errors, []);
    await shot(o.page, 'shell-wide');
    console.log('PASS walk-shell: 어두운 한 화면 · 탭 줄 없음 · 깊은 주소 뒤로 가기 한 층씩 · 낡은 열쇠 넷 · 기억된 보기 · 세계는 하나 · 길 표시 · ' + COVER.width + ' · ' + WIDE.width + ' 넘침 0');
  } finally { await br.close(); close(); }
})().catch(e => { console.error(e); process.exit(1); });
