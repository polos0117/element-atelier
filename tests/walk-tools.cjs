/* 「들어가는 곳」 도구 상자(lib/toolbox.js) · 도구 화면의 가는 막대 — 탭 줄 없음 · 들어오기 전 층으로 돌아가기 · 도구 칸을 지나와도 뒤로 가기가 헛돌지 않음 ·
   판 여섯 칸 · 44px · 닫기 셋(Esc · 판 밖 · 뒤로) · 설정(공간 · 움직임) · 즐겨찾기 수 · 패치 기록.
   Run: NODE_PATH=<playwright 가 든 node_modules> node tests/walk-tools.cjs */
const assert = require('node:assert/strict');
const { COVER, WIDE, serve, launch, open, noOverflow, shot } = require('./lib/harness.cjs');

(async () => {
  const { base, close } = await serve(), br = await launch();
  try {
    for (const vp of [COVER, WIDE]) for (const t of ['alchemy', 'styles', 'prompt']) {
      const { ctx, page: p, errors } = await open(br, base, '/' + t + '.html', { viewport: vp });
      await p.waitForSelector('header.tb-bar');
      assert.equal(await p.locator('.workspace-nav, .workspace-heading').count(), 0, t + ' 탭 줄 없음');
      assert.equal(await p.locator('h1.tb-name').textContent(), { alchemy: '합성', styles: '화풍', prompt: '프롬프트' }[t]);
      assert.equal(await p.getAttribute('a.tb-back', 'href'), 'index.html', '처음엔 주기율표로');
      assert(await noOverflow(p), vp.width + ' ' + t + ' 넘침'); assert.deepEqual(errors, [], t);
      await ctx.close();
    }
    // 들어오기 전 층으로
    const { page: p, errors } = await open(br, base, '/index.html?n=fe&mode=list');
    await p.waitForSelector('button.tb-open');
    await p.click('button.tb-open'); await p.click('[data-tool="prompt"]'); await p.waitForURL(/prompt\.html/);
    assert.equal(await p.getAttribute('a.tb-back', 'href'), 'index.html?n=fe&mode=list');
    // 도구 칸을 지나와도 뒤로 가기가 헛돌지 않는다
    await p.goBack(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'list');
    await p.goBack(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'table');
    // 판 — 여섯 칸, 44px, 닫기 셋
    await p.click('button.tb-open');
    assert.deepEqual(await p.locator('.tb-sheet [data-tool]').evaluateAll(e => e.map(x => x.dataset.tool)), ['alchemy', 'styles', 'prompt', 'fav', 'settings', 'patch']);
    assert.deepEqual(await p.locator('.tb-sheet a[data-tool]').evaluateAll(e => e.map(x => x.getAttribute('href'))), ['alchemy.html', 'styles.html', 'prompt.html', '/favorites.html']);
    for (const b of await p.locator('.tb-sheet a, .tb-sheet button, .tb-sheet select, button.tb-open').all()) assert((await b.boundingBox()).height >= 44, await b.evaluate(e => e.outerHTML.slice(0, 80)));
    await shot(p, 'toolbox-open');
    await p.keyboard.press('Escape'); await p.waitForSelector('.tb-sheet', { state: 'detached' });
    await p.click('button.tb-open'); await p.mouse.click(10, 10); await p.waitForSelector('.tb-sheet', { state: 'detached' });
    const url = p.url(); await p.click('button.tb-open'); await p.goBack(); await p.waitForSelector('.tb-sheet', { state: 'detached' });
    assert.equal(p.url(), url, '뒤로 가기는 판만 닫는다');
    // 설정 · 즐겨찾기 수 · 패치 기록
    await p.evaluate(() => localStorage.setItem('atelier_favorites_v1', JSON.stringify([{ a: 'element', key: 'fe', file: 'x.webp' }, { a: 'pkm', key: 'y', file: 'y.webp' }])));
    await p.reload(); await p.click('button.tb-open');
    assert.match(await p.locator('[data-tool="fav"]').textContent(), /즐겨찾기 1/);
    const t0 = await p.evaluate(() => document.documentElement.dataset.theme);
    const other = (await p.locator('#tb-theme option').evaluateAll(o => o.map(x => x.value))).find(v => v !== t0);
    await p.selectOption('#tb-theme', other); assert.equal(await p.evaluate(() => document.documentElement.dataset.theme), other);
    // 움직임 끄기(Global Constraints) — 한 곳(motionOn), 새로고침 뒤에도
    assert.equal(await p.evaluate(() => AtelierWalk.motionOn()), true);
    await p.click('.tb-motion [data-motion="off"]');
    assert.equal(await p.getAttribute('.tb-motion [data-motion="off"]', 'aria-pressed'), 'true');
    assert.equal(await p.evaluate(() => [AtelierWalk.motionOn(), localStorage.getItem('element_motion_v1')].join()), 'false,off');
    await p.click('[data-tool="patch"]'); await p.waitForSelector('.patch-entry');
    await p.keyboard.press('Escape'); await p.waitForSelector('.tb-sheet', { state: 'detached' });
    await p.reload(); await p.click('button.tb-open');
    assert.equal(await p.getAttribute('.tb-motion [data-motion="on"]', 'aria-pressed'), 'false', '꺼진 채 기억');
    assert.equal(await p.evaluate(() => AtelierWalk.motionOn()), false);
    await p.click('.tb-motion [data-motion="on"]'); assert.equal(await p.evaluate(() => AtelierWalk.motionOn()), true);
    const r = await open(br, base, '/index.html', { reduced: true }); await r.page.waitForSelector('header.w-bar');
    assert.equal(await r.page.evaluate(() => AtelierWalk.motionOn()), false, '기기의 움직임 줄이기'); await r.ctx.close();
    assert(await noOverflow(p)); assert.deepEqual(errors, []);
    console.log('PASS walk-tools: 도구 화면 셋 가는 막대(' + COVER.width + ' · ' + WIDE.width + ') · 들어오기 전 층으로 · 도구 칸 지나 뒤로 가기 · 판 여섯 칸 44px · 닫기 셋 · 즐겨찾기 수 · 공간 · 움직임 끄기(기억) · 패치 기록');
  } finally { await br.close(); close(); }
})().catch(e => { console.error(e); process.exit(1); });
