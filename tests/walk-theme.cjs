/* 땅(테마) 배경(lib/walk.js · walk-core · toolbox, 2026-11-13) — 고른 땅 x 지금 세계의 그림 · 세계를 바꾸면 그 세계 그림 · 도구 상자의 땅 여섯(44px, 기억) · 강조색 ·
   풍경만 보기(화면 요소 숨김 · 누르면/뒤로/Esc 로 돌아옴 · 역사 안 늘어남) · 갈래 열이 다 땅에 묶임 · 도구 화면은 예전 공간 고르개.
   Run: NODE_PATH=<playwright 가 든 node_modules> node tests/walk-theme.cjs */
const assert = require('node:assert/strict');
const { COVER, serve, launch, open, noOverflow, shot } = require('./lib/harness.cjs');
const R = require('../lib/walk-core.js'), D = require('../data/element-design.json');

(async () => {
  assert.equal(R.LANDS.length, 6);
  for (const e of D.elements) assert(R.LANDS.includes(R.landOf(e.category)), e.category);
  assert.equal(R.landOf('halogen'), 'salt'); assert.equal(R.landOf('noble_gas'), 'sky');
  const { base, close } = await serve(), br = await launch();
  try {
    const { page: p, errors, ctx } = await open(br, base, '/index.html?n=fe&mode=orbit');
    const scene = () => p.evaluate(() => document.documentElement.style.getPropertyValue('--w-scene'));
    const waitScene = s => p.waitForFunction(x => document.documentElement.style.getPropertyValue('--w-scene').includes(x), s);
    await waitScene('themes/metal_fantasy.webp');
    assert.equal(await p.evaluate(() => document.documentElement.dataset.land), 'metal');
    assert.notEqual(await p.locator('.w-scenery').evaluate(e => getComputedStyle(e).backgroundImage), 'none');
    // 세계를 바꾸면 그 세계 그림
    await p.locator('.w-worlds button >> nth=1').click(); await waitScene('themes/metal_steampunk.webp');
    // 도구 상자 — 땅 여섯
    const acc0 = await p.evaluate(() => getComputedStyle(document.body).getPropertyValue('--accent'));
    await p.click('.tb-open'); await p.waitForSelector('.tb-land-grid');
    assert.equal(await p.locator('.tb-land-grid button').count(), 6);
    for (const bx of await p.locator('.tb-land-grid button, .tb-scenery').evaluateAll(es => es.map(e => e.getBoundingClientRect().height))) assert(bx >= 44, '누르는 자리 ' + bx);
    assert.equal(await p.locator('#tb-theme').count(), 0, '공방 안에는 예전 공간 고르개가 없다');
    await shot(p, 'theme-toolbox');
    await p.click('.tb-land-grid [data-land="salt"]'); await waitScene('themes/salt_steampunk.webp');
    assert.equal(await p.evaluate(() => document.documentElement.dataset.land), 'salt');
    assert.equal(await p.evaluate(() => localStorage.getItem('element_land_v1')), 'salt');
    assert.equal(await p.locator('.tb-land-grid [data-land="salt"]').getAttribute('aria-pressed'), 'true');
    assert.notEqual(await p.evaluate(() => getComputedStyle(document.body).getPropertyValue('--accent')), acc0, '땅마다 강조색');
    // 풍경만 보기 — 판이 닫히고 화면 요소가 숨는다. 누르면 돌아온다. 역사는 판을 열기 전 그대로
    const len = await p.evaluate(() => history.length);
    await p.click('.tb-scenery'); await p.waitForSelector('.w-only');
    assert.equal(await p.locator('.tb-sheet').count(), 0);
    assert.equal(await p.locator('.w-bar').evaluate(e => getComputedStyle(e).visibility), 'hidden');
    await p.waitForFunction(() => getComputedStyle(document.querySelector('.w-scenery'), '::after').opacity === '0');   // 어둠이 걷힌다(0.4s)
    await shot(p, 'theme-only');
    await p.click('.w-only'); await p.waitForSelector('.w-only', { state: 'detached' });
    assert.equal(await p.locator('.w-bar').evaluate(e => getComputedStyle(e).visibility), 'visible');
    assert.equal(await p.evaluate(() => document.documentElement.dataset.layer), 'orbit'); assert.equal(await p.evaluate(() => history.length), len);
    // Esc 로도
    await p.click('.tb-open'); await p.click('.tb-scenery'); await p.waitForSelector('.w-only');
    await p.keyboard.press('Escape'); await p.waitForSelector('.w-only', { state: 'detached' });
    assert(await noOverflow(p)); assert.deepEqual(errors, []);
    // 다시 열면 기억된 땅
    const p2 = await ctx.newPage(); await p2.goto(base + '/index.html'); await p2.waitForFunction(() => document.documentElement.dataset.land === 'salt'); await p2.close();
    await ctx.close();
    // 움직임 끄기 — 땅을 바꿔도 그대로 바뀐다
    const m = await open(br, base, '/index.html', { reduced: true }); await m.page.waitForFunction(() => document.documentElement.dataset.land === 'metal');
    await m.page.evaluate(() => AtelierWalk.setLand('deep')); await m.page.waitForFunction(() => document.documentElement.dataset.land === 'deep');
    assert.deepEqual(m.errors, []); await m.ctx.close();
    // 도구 화면은 예전 공간 고르개
    const a = await open(br, base, '/prompt.html'); await a.page.click('.tb-open'); await a.page.waitForSelector('#tb-theme');
    assert.equal(await a.page.locator('.tb-land-grid').count(), 0); await a.ctx.close();
    console.log('PASS walk-theme: 땅 여섯 · 갈래 → 땅 · 땅 x 세계 그림 · 도구 상자 고르개(44px · 기억 · 강조색) · 풍경만 보기(누르기 · Esc · 역사 그대로) · 움직임 끄기 · 도구 화면은 공간 · ' + COVER.width);
  } finally { await br.close(); close(); }
})().catch(e => { console.error(e); process.exit(1); });
