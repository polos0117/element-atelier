/* 「들어가는 곳」 세계 바꾸기 전환(효과 ③, lib/walk-fx.js playShift) — 덮개 하나(pointer-events none · 막대는 덮지 않음) · 900ms 안에 사라짐 ·
   빠르게 세 번(덮개 하나 · 마지막 세계 · 누르기 안 막힘) · 목록에서도(바꾸기 전엔 PixiJS 0) · 한 장 위에서도(한 장보다 위, 넘기기 단추는 눌림) ·
   움직임 줄이기 · 움직임 끄기(새로고침 뒤에도) → 덮개 없이 바로 · WebGL 없음 → CSS 덮개만.
   Run: NODE_PATH=<playwright 가 든 node_modules> node tests/walk-world.cjs */
const assert = require('node:assert/strict');
const { serve, launch, open } = require('./lib/harness.cjs');

(async () => {
  const { base, close } = await serve(), br = await launch();
  try {
    let { page: p, errors, requests, ctx } = await open(br, base, '/index.html?n=fe&mode=orbit');
    await p.waitForSelector('.w-stage');
    await p.click('.w-worlds [data-w="mecha"]');
    await p.waitForSelector('.w-shift[data-to="mecha"]');
    assert.equal(await p.locator('.w-shift').evaluate(e => getComputedStyle(e).pointerEvents), 'none');
    assert.equal(await p.locator('.w-shift').getAttribute('aria-hidden'), 'true');
    const [bar, sh] = [await p.locator('.w-bar').boundingBox(), await p.locator('.w-shift').boundingBox()];
    assert(sh.y >= bar.y + bar.height - 1, '막대는 덮지 않는다');
    assert(await p.evaluate(() => AtelierWalkFx.fired.includes('shift:mecha')));
    assert.match(p.url(), /w=mecha/, '세계는 효과를 기다리지 않고 바로');
    await p.waitForSelector('.w-shift', { state: 'detached', timeout: 1200 });
    // PixiJS 가 이미 왔으면(궤도 입자) 덮개 안에 그 세계 입자 캔버스 한 번
    await p.waitForSelector('canvas.w-particles', { timeout: 20000 });
    await p.click('.w-worlds [data-w="steampunk"]'); await p.waitForSelector('.w-shift[data-to="steampunk"] canvas', { timeout: 900 });
    await p.waitForSelector('.w-shift', { state: 'detached', timeout: 1200 });
    // rapid shifts(Review Focus 4) — 덮개 하나, 마지막 세계, 누르기는 안 막힌다
    for (const w of ['fantasy', 'steampunk', 'mecha']) await p.click('.w-worlds [data-w="' + w + '"]');
    assert(await p.locator('.w-shift').count() <= 1);
    assert.equal(await p.getAttribute('.w-worlds [data-w="mecha"]', 'aria-pressed'), 'true'); assert.match(p.url(), /w=mecha/);
    await p.click('.w-node:not(.empty) >> nth=0', { force: true }); await p.waitForFunction(() => document.documentElement.dataset.layer === 'family');
    await p.waitForSelector('.w-shift', { state: 'detached', timeout: 1200 });
    assert.deepEqual(errors, []); await ctx.close();
    // 한 장 위에서도 — 덮개가 한 장보다 위, 덮개가 있는 동안 넘기기 단추가 눌린다
    ({ page: p, errors, ctx } = await open(br, base, '/index.html?n=fe&mode=orbit&w=fantasy&card=fe'));
    await p.waitForSelector('.lightbox.w-card .lb-stage img');
    await p.click('.w-worlds [data-w="steampunk"]'); await p.waitForSelector('.w-shift[data-to="steampunk"]');
    const z = await p.evaluate(() => [+getComputedStyle(document.querySelector('.w-shift')).zIndex, +getComputedStyle(document.querySelector('.lightbox.w-card')).zIndex]);
    assert(z[0] > z[1], '덮개가 한 장 위: ' + z);
    const n0 = await p.locator('.lb-n').textContent();
    if (await p.locator('.lb-nav.next').count()) { await p.click('.lb-nav.next'); await p.waitForFunction(t => document.querySelector('.lb-n').textContent !== t, n0); }
    assert.equal(await p.evaluate(() => document.documentElement.dataset.layer), 'card'); assert.match(p.url(), /w=steampunk/);
    assert.deepEqual(errors, []); await ctx.close();
    // 목록에서도(세계 전환은 Pixi 를 늦게 부른다 — 바꾸기 전엔 0)
    ({ page: p, requests, errors, ctx } = await open(br, base, '/index.html?n=fe&mode=list'));
    await p.waitForSelector('.dex-toc'); assert.equal(requests.filter(u => /pixi/.test(u)).length, 0);
    await p.click('.w-worlds [data-w="steampunk"]'); await p.waitForSelector('.w-shift[data-to="steampunk"]');
    await p.waitForSelector('.w-shift', { state: 'detached', timeout: 1200 }); assert.deepEqual(errors, []); await ctx.close();
    // 움직임 줄이기 — 덮개 없이 바로
    const r = await open(br, base, '/index.html?n=fe&mode=orbit', { reduced: true }); await r.page.waitForSelector('.w-stage');
    await r.page.click('.w-worlds [data-w="mecha"]'); await r.page.waitForTimeout(200);
    assert.equal(await r.page.locator('.w-shift').count(), 0); assert.deepEqual(await r.page.evaluate(() => AtelierWalkFx.fired), []);
    assert.match(r.page.url(), /w=mecha/); await r.ctx.close();
    // 움직임 끄기(도구 상자 설정) — 덮개 없이 바로, 새로고침 뒤에도
    const m = await open(br, base, '/index.html?n=fe&mode=orbit'); await m.page.waitForSelector('.w-stage');
    await m.page.evaluate(() => AtelierWalk.setMotion(false)); await m.page.reload(); await m.page.waitForSelector('.w-stage');
    await m.page.click('.w-worlds [data-w="mecha"]'); await m.page.waitForTimeout(200);
    assert.equal(await m.page.locator('.w-shift').count(), 0); assert.match(m.page.url(), /w=mecha/); assert.deepEqual(m.errors, []); await m.ctx.close();
    // WebGL 없음 — CSS 덮개만, 캔버스 없음, 오류 없음
    const g = await open(br, base, '/index.html?n=fe&mode=orbit', { noWebGL: true }); await g.page.waitForSelector('.w-stage');
    await g.page.click('.w-worlds [data-w="mecha"]'); await g.page.waitForSelector('.w-shift');
    assert.equal(await g.page.locator('.w-shift canvas').count(), 0); await g.page.waitForTimeout(1000); assert.deepEqual(g.errors, []); await g.ctx.close();
    console.log('PASS walk-world: 세계 전환 덮개 하나(누르기 안 막음 · 막대 아래) · 900ms 안에 사라짐 · 그 세계 입자 · 빠르게 세 번 · 한 장 위 · 목록(바꾸기 전 PixiJS 0) · 움직임 줄이기 · 움직임 끄기 · WebGL 없음');
  } finally { await br.close(); close(); }
})().catch(e => { console.error(e); process.exit(1); });
