/* 「들어가는 곳」 궤도에 머무는 동안(효과 ②) — 분류마다 입자(PixiJS 늦게 불러오기, 한 번만) · 상한(덮개 24 · 넓으면 48) · 숨은 탭에서 멈춤 ·
   천천히 도는 고리(손대면 멈춤, 2초 뒤 다시) · 떠나면 정리 · 움직임 끄기(바로, 새로고침 뒤에도) · 움직임 줄이기 · WebGL 없음 · PixiJS 막힘 → 조용히 빠지고 궤도는 그대로.
   Run: NODE_PATH=<playwright 가 든 node_modules> node tests/walk-particles.cjs */
const assert = require('node:assert/strict');
const { COVER, WIDE, serve, launch, open, shot } = require('./lib/harness.cjs');

(async () => {
  const { base, close } = await serve(), br = await launch();
  try {
    const part = p => p.evaluate(() => AtelierWalkFx.particles);
    let { page: p, errors, requests } = await open(br, base, '/index.html?n=fe&mode=orbit');
    await p.waitForSelector('canvas.w-particles', { timeout: 20000 });
    let s = await part(p); assert.equal(s.kind, 'ember'); assert(s.count <= 24 && s.running);
    assert.equal(requests.filter(u => /pixi/.test(u)).length, 1);
    await shot(p, 'particles-fe');
    for (const [n, k] of [['h', 'breeze'], ['og', 'mote'], ['si', 'glint'], ['u', 'flicker']]) {
      await p.goto(base + '/index.html?n=' + n + '&mode=orbit'); await p.waitForSelector('canvas.w-particles', { timeout: 20000 });
      assert.equal((await part(p)).kind, k, n);
    }
    // 숨은 탭에선 멈춘다
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    assert.equal((await part(p)).running, false);
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    assert.equal((await part(p)).running, true);
    // 화면 밖으로 굴리면 멈춘다
    await p.evaluate(() => { document.body.style.paddingBottom = '3000px'; scrollTo(0, 2500); });   // 나라 글이 짧아도 무대가 화면 밖으로 나가게 await p.waitForFunction(() => AtelierWalkFx.particles && !AtelierWalkFx.particles.running);
    await p.evaluate(() => { scrollTo(0, 0); document.body.style.paddingBottom = ''; }); await p.waitForFunction(() => AtelierWalkFx.particles && AtelierWalkFx.particles.running);
    // 도는 고리 — 손대면 멈춤
    const play = () => p.locator('.w-orbit-ring').evaluate(e => [getComputedStyle(e).animationName, getComputedStyle(e).animationPlayState].join(' '));
    assert.equal(await play(), 'w-spin running');
    const st = await p.locator('.w-stage').boundingBox(); await p.mouse.move(st.x + 5, st.y + 5); await p.mouse.down();
    assert.equal(await play(), 'w-spin paused'); await p.mouse.up(); await p.waitForTimeout(2200); assert.equal(await play(), 'w-spin running');
    // 떠나면 정리
    await p.click('.w-crumbs button >> nth=0'); await p.waitForFunction(() => document.documentElement.dataset.layer === 'table');
    assert.equal(await p.locator('canvas.w-particles').count(), 0); assert.equal(await part(p), null);
    assert.deepEqual(errors, []);
    // 움직임 끄기(도구 상자 설정) — 궤도에 있는 채로 끄면 바로 빠지고, 새로고침 뒤에도 없다
    await p.goto(base + '/index.html?n=fe&mode=orbit'); await p.waitForSelector('canvas.w-particles', { timeout: 20000 });
    await p.evaluate(() => AtelierWalk.setMotion(false));
    await p.waitForSelector('canvas.w-particles', { state: 'detached' }); assert.equal(await part(p), null);
    assert.equal(await p.locator('.w-orbit-ring').evaluate(e => getComputedStyle(e).animationName), 'none');
    await p.reload(); await p.waitForSelector('.w-stage'); await p.waitForTimeout(1500);
    assert.equal(await p.locator('canvas.w-particles').count(), 0); assert.equal(await part(p), null);
    await p.evaluate(() => AtelierWalk.setMotion(true)); await p.waitForSelector('canvas.w-particles', { timeout: 20000 });
    assert.deepEqual(errors, []); await p.context().close();
    // 넓으면 상한 48
    const w = await open(br, base, '/index.html?n=fe&mode=orbit', { viewport: WIDE }); await w.page.waitForSelector('canvas.w-particles', { timeout: 20000 });
    assert((await part(w.page)).count <= 48); assert.deepEqual(w.errors, []); await w.ctx.close();
    // 움직임 줄이기 · WebGL 없음 · pixi blocked(Review Focus 5) — 조용히 빠진다, 궤도는 그대로 쓴다
    for (const opt of [{ reduced: true }, { noWebGL: true }, { blockPixi: true }]) {
      const o = await open(br, base, '/index.html?n=fe&mode=orbit', opt); await o.page.waitForSelector('.w-stage'); await o.page.waitForTimeout(1500);
      assert.equal(await o.page.locator('canvas.w-particles').count(), 0, JSON.stringify(opt)); assert.equal(await part(o.page), null);
      if (opt.reduced) assert.equal(await o.page.locator('.w-orbit-ring').evaluate(e => getComputedStyle(e).animationName), 'none');
      if (opt.noWebGL) assert.equal(o.requests.filter(u => /pixi/.test(u)).length, 0, 'WebGL 이 없으면 PixiJS 를 받지도 않는다');
      await o.page.click('.w-node:not(.empty) >> nth=0', { force: true }); await o.page.waitForFunction(() => document.documentElement.dataset.layer === 'family');
      assert.deepEqual(o.errors, [], JSON.stringify(opt)); await o.ctx.close();
    }
    console.log('PASS walk-particles: 분류 입자 다섯 · PixiJS 한 번 · 상한 ' + COVER.width + '→24 · ' + WIDE.width + '→48 · 숨은 탭/화면 밖 멈춤 · 도는 고리 손대면 멈춤 · 떠나면 정리 · 움직임 끄기(바로 · 새로고침 뒤) · 움직임 줄이기 · WebGL 없음 · PixiJS 막힘');
  } finally { await br.close(); close(); }
})().catch(e => { console.error(e); process.exit(1); });
