/* 들어갈 때 로딩 화면(2026-11-24 — lib/splash.js · lib/splash.css, 주기율표 → 나라 카드 「들어가기」 → 나라 궤도) — 가짜 등록부(지금 등록부 + 철 세 세계 전경, 수소는 전경 없음)로:
   (a) 처음 들어가면 덮개가 뜨고 제목 = 「Fe 26 · 철」(기호 · 번호 · 이름) · 세계 줄 = 세계 이름 · 한 줄 = 설계표 성격 첫 마디(40자 이하) · 덮개 aria-hidden · 알림 한 줄에 나라 이름
   (b) 빛 입자(PixiJS) 1~150 · 덮개는 나타나고 2초 안에 걷힌다 · 걷히면 나라 전경 무대 · 초점은 나라 이름 · 가로 넘침 0 · 콘솔 오류 0 — 휴대폰 390×844 · PC 1280×800
   (c) 같은 탭에서 다시 들어가면 없음 · 나라에서 세계를 바꿔도 없음 · 다른 세계로 들어가면 그 세계 것 한 번
   (d) 누르기 · Enter · Esc 로 곧바로 걷힘(누른 것이 띠로 새지 않는다) (e) 움직임 줄이기면 없음 (f) 전경 없는 나라(수소) · 목록으로 들어가기는 없음
   (g) PixiJS 막힘 → 덮개는 그대로 뜨고 걷힘(입자만 없음) (h) 그림이 600ms 안에 안 오면(느림 · 404) 덮개 없이 들어감 (i) 깊은 주소(?n=fe&mode=orbit)는 덮개 없음 · 뒤로 가기는 주기율표
   Run: CHROMIUM_PATH=<chrome> NODE_PATH=<playwright> ESM_DIR=<preact · pixi.js@8.19.0 사본> node tests/splash-screen.cjs
   SHOT_DIR 이 있으면 덮개 한가운데 사진(배율 2) — SPLASH_IMG=<폴더>에 fe-<세계>.jpg 가 있으면 그 그림으로 */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const H = require('./lib/harness.cjs');
const D = require('../data/element-design.json'), ST = require('../data/style.json')['default'], REAL = require('../data/img.json');
const WORLDS = D.vocab.worlds, FE = D.nations.find(n => n.key === 'fe'), FEL = D.elements.find(e => e.key === 'fe'), WN = { fantasy: '판타지', steampunk: '스팀펑크', mecha: '메카' };
const V = w => `fe_${w}_${ST}_vista.webp`;
const REG = JSON.parse(JSON.stringify(REAL));
for (const w of WORLDS) { const b = REG.img.fe.byStyle[ST].byForm; (b[w] = b[w] || {}).vista = V(w); }
for (const k of Object.keys(REG.img)) if (k !== 'fe') for (const b of Object.values(REG.img[k].byStyle || {})) for (const f of Object.values(b.byForm || {})) delete f.vista;   /* 전경은 철만 */
const WIDE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#3a2a5a"/><stop offset="1" stop-color="#c98a4a"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>';
const REAL_IMG = process.env.SPLASH_IMG;
const vistaRoute = { url: /_vista\.webp/, body: WIDE_SVG, contentType: 'image/svg+xml' };
const REAL_ROUTES = REAL_IMG ? WORLDS.map(w => ({ url: new RegExp('fe_' + w + '_.*_vista\\.webp'), body: fs.readFileSync(path.join(REAL_IMG, 'fe-' + w + '.jpg')), contentType: 'image/jpeg' })) : [];
const REG_ROUTE = { url: /\/data\/img\.json/, body: JSON.stringify(REG), contentType: 'application/json' };
const PHONE = { width: 390, height: 844 }, DESK = { width: 1280, height: 800 };
const sp = p => p.evaluate(() => ({ on: !!document.querySelector('.sp'), log: JSON.parse(JSON.stringify(window.AtelierSplash || { shown: [], skipped: 0 })) }));
const watch = p => p.evaluate(() => { window.__sp = 0; new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.classList && n.classList.contains('sp')) window.__sp++; }).observe(document.body, { childList: true }); });
const layer = p => p.evaluate(() => document.documentElement.dataset.layer);

(async () => {
  const srv = await H.serve(), br = await H.launch();
  let checks = 0;
  const open = (url, o = {}) => H.open(br, srv.base, url, Object.assign({ viewport: PHONE, touch: true }, o, { fulfill: [REG_ROUTE, ...(o.fulfill || [vistaRoute])] }));
  /* 주기율표에서 그 나라 칸 → 나라 카드 → 들어가기 */
  const enter = async (p, n = 'fe') => { await p.waitForSelector('.pcell.on[data-n="' + n + '"]'); await p.locator('.pcell.on[data-n="' + n + '"]').click(); await p.click('.w-ncard [data-act="enter"]'); };
  try {
    /* (a) (b) (c) — 휴대폰 · PC */
    for (const [vp, touch, tag] of [[PHONE, true, '390'], [DESK, false, '1280']]) {
      const o = await open('/index.html?w=fantasy', { viewport: vp, touch }), p = o.page;
      const t0 = Date.now(); await enter(p);
      await p.waitForSelector('.sp', { timeout: 1500 }); const t1 = Date.now();
      const txt = await p.evaluate(() => { const q = s => (document.querySelector(s) || {}).textContent || ''; return { k: q('.sp-kicker'), sym: q('.sp-title .sp-sym'), num: q('.sp-title .sp-num'), t: q('.sp-title'), l: q('.sp-line'), hid: document.querySelector('.sp').getAttribute('aria-hidden'), live: q('.sp-live'), liveRole: document.querySelector('.sp-live').getAttribute('aria-live') }; });
      assert(txt.sym === FEL.symbol && txt.num === String(FEL.number) && txt.t.endsWith(FEL.ko), tag + ' (a) 제목 = 기호 · 번호 · 이름 ' + txt.t);
      assert.equal(txt.k, WN.fantasy, tag + ' (a) 세계 줄');
      assert(txt.l.length > 4 && txt.l.length <= 41 && FE.persona.startsWith(txt.l.replace(/…$/, '')), tag + ' (a) 한 줄 = 성격 첫 마디 ' + txt.l);
      assert.equal(txt.hid, 'true', tag + ' (a) 덮개 aria-hidden'); assert(txt.live.includes(FEL.ko) && txt.liveRole === 'polite', tag + ' (a) 알림 한 줄 ' + txt.live);
      await p.waitForFunction(() => window.AtelierSplash.pixi !== 'wait', null, { timeout: 1500 });
      const lg = (await sp(p)).log;
      assert(lg.pixi === 'on' && lg.sprites >= 1 && lg.sprites <= 150, tag + ' (b) 빛 입자 ' + JSON.stringify(lg));
      assert(await H.noOverflow(p), tag + ' (b) 가로 넘침');
      await p.waitForFunction(() => /n=fe/.test(location.search) && document.querySelector('.sp'), null, { timeout: 1000 }).catch(() => assert.fail(tag + ' (b) 덮개 뒤에서 들어감'));
      await p.waitForSelector('.sp', { state: 'detached', timeout: 2500 }); const t2 = Date.now();
      assert(t2 - t1 <= 2000, tag + ' (b) 2초 안에 걷힘 ' + (t2 - t1) + 'ms(누르고부터 ' + (t2 - t0) + 'ms)');
      assert.equal(await layer(p), 'orbit', tag + ' (b) 나라 층'); assert.equal(await p.locator('.w-vista').count(), 1, tag + ' (b) 전경 무대');
      assert.equal(await p.evaluate(() => document.activeElement && document.activeElement.matches('.w-vtitle h1')), true, tag + ' (b) 초점은 나라 이름');
      /* (c) */
      await watch(p);
      await p.click('.w-worlds button[data-w="steampunk"]'); await p.waitForTimeout(400);
      assert.equal(await p.evaluate(() => window.__sp), 0, tag + ' (c) 나라에서 세계를 바꾸면 없음');
      await p.click('.w-worlds button[data-w="fantasy"]'); await p.waitForTimeout(200);
      await p.goBack(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'table'); await watch(p);
      await enter(p); await p.waitForSelector('.w-vista'); await p.waitForTimeout(500);
      assert.equal(await p.evaluate(() => window.__sp), 0, tag + ' (c) 같은 탭에서 다시 들어가면 없음');
      await p.goBack(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'table');
      await p.click('.w-worlds button[data-w="mecha"]'); await p.waitForTimeout(300);
      await enter(p); await p.waitForSelector('.sp', { timeout: 1500 });
      assert.equal(await p.textContent('.sp-kicker'), WN.mecha, tag + ' (c) 다른 세계로 들어가면 그 세계 것');
      await p.waitForSelector('.sp', { state: 'detached', timeout: 2500 });
      assert.deepEqual((await sp(p)).log.shown, ['fe|fantasy', 'fe|mecha'], tag + ' (c) 본 자리');
      assert.deepEqual(o.errors, [], tag + ' 콘솔'); checks += 17; await o.ctx.close();
    }
    /* (d) 누르기 · Enter · Esc */
    for (const how of ['tap', 'Enter', 'Escape']) {
      const o = await open('/index.html?w=fantasy'), p = o.page;
      await enter(p); await p.waitForSelector('.sp', { timeout: 1500 }); await p.waitForTimeout(350);
      const t = Date.now();
      if (how === 'tap') { const b = await p.locator('.w-vista').boundingBox(); await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height - 50); }   /* 띠의 카드 자리 — 새면 한 장 · 가문이 열린다 */
      else await p.keyboard.press(how);
      await p.waitForSelector('.sp', { state: 'detached', timeout: 600 }); const dt = Date.now() - t;
      assert(dt < 600, how + ' (d) 곧바로 걷힘 ' + dt + 'ms');
      await p.waitForTimeout(300);
      assert.equal(await layer(p), 'orbit', how + ' (d) 나라 그대로(새지 않음)');
      assert.equal((await sp(p)).log.skipped, 1, how + ' (d) 건너뜀 1');
      assert.deepEqual(o.errors, [], how + ' 콘솔'); checks += 4; await o.ctx.close();
    }
    /* (e) 움직임 줄이기 */
    { const o = await open('/index.html?w=fantasy', { reduced: true }), p = o.page;
      await p.waitForSelector('.pcell.on'); await watch(p); await enter(p); await p.waitForSelector('.w-vista'); await p.waitForTimeout(500);
      assert.equal(await p.evaluate(() => window.__sp), 0, '(e) 움직임 줄이기 — 없음');
      assert.deepEqual(o.errors, [], '(e) 콘솔'); checks += 2; await o.ctx.close(); }
    /* (f) 전경 없는 나라 · 목록으로 들어가기 */
    { const o = await open('/index.html?w=fantasy'), p = o.page;
      await p.waitForSelector('.pcell.on'); await watch(p); await enter(p, 'h'); await p.waitForSelector('.w-stage'); await p.waitForTimeout(500);
      assert(/n=h\b/.test(await p.evaluate(() => location.search)) && await p.evaluate(() => window.__sp) === 0, '(f) 전경 없는 나라 — 없음');
      await p.goBack(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'table');
      await p.locator('.pcell.on[data-n="fe"]').click(); await p.click('.w-ncard [data-act="list"]'); await p.waitForFunction(() => document.documentElement.dataset.layer === 'list'); await p.waitForTimeout(400);
      assert.equal(await p.evaluate(() => window.__sp), 0, '(f) 목록으로 — 없음');
      assert.deepEqual(o.errors, [], '(f) 콘솔'); checks += 3; await o.ctx.close(); }
    /* (g) PixiJS 막힘 */
    { const o = await open('/index.html?w=steampunk', { blockPixi: true }), p = o.page;
      await enter(p); await p.waitForSelector('.sp', { timeout: 1500 });
      assert.equal(await p.textContent('.sp-kicker'), WN.steampunk, '(g) PixiJS 막혀도 덮개');
      await p.waitForSelector('.sp', { state: 'detached', timeout: 2500 });
      const lg = (await sp(p)).log;
      assert(lg.pixi === 'none' && lg.sprites === 0, '(g) 입자만 없음 ' + JSON.stringify(lg));
      assert.equal(await p.locator('.w-vista').count(), 1, '(g) 전경 무대');
      assert.deepEqual(o.errors, [], '(g) 콘솔'); checks += 4; await o.ctx.close(); }
    /* (h) 느린 그림 · 404 */
    for (const [what, opt] of [['느림', { fulfill: [], slowImg: 1500 }], ['404', { fulfill: [], failURL: /_vista\.webp/ }]]) {
      const o = await open('/index.html?w=fantasy', opt), p = o.page;
      await p.waitForSelector('.pcell.on'); await watch(p); await p.locator('.pcell.on[data-n="fe"]').click();
      const t = Date.now(); await p.click('.w-ncard [data-act="enter"]'); await p.waitForFunction(() => document.documentElement.dataset.layer === 'orbit', null, { timeout: 3000 }); const dt = Date.now() - t;
      await p.waitForTimeout(300);
      assert(await p.evaluate(() => window.__sp) === 0 && dt < 1500, '(h) ' + what + ' — 덮개 없이 들어감 ' + dt + 'ms');
      assert.deepEqual(o.errors, [], '(h) ' + what + ' 콘솔'); checks += 2; await o.ctx.close();
    }
    /* (i) 깊은 주소 */
    { const o = await open('/index.html?n=fe&mode=orbit&w=fantasy'), p = o.page;
      await p.waitForSelector('.w-vista'); await p.waitForTimeout(800);
      assert.equal(await p.locator('.sp').count() + (await sp(p)).log.shown.length, 0, '(i) 깊은 주소 — 없음');
      await p.goBack(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'table');
      assert.deepEqual(o.errors, [], '(i) 콘솔'); checks += 2; await o.ctx.close(); }
    /* 사진 */
    if (process.env.SHOT_DIR) for (const [w, vp, touch, name] of [['fantasy', PHONE, true, 'element-fe-fantasy-phone'], ['mecha', DESK, false, 'element-fe-mecha-desktop']]) {
      const o = await open('/index.html?w=' + w, { viewport: vp, touch, scale: 2, fulfill: REAL_ROUTES.length ? REAL_ROUTES : [vistaRoute] }), p = o.page;
      await p.waitForSelector('.pcell.on'); await p.evaluate(() => { window.AtelierSplash.hold = 6000; }); await p.waitForTimeout(400);
      await enter(p); await p.waitForSelector('.sp', { timeout: 1500 });
      await p.waitForTimeout(1000); assert.equal(await p.locator('.sp').count(), 1, name + ' 덮개'); await H.shot(p, name); await o.ctx.close();
    }
    console.log(`PASS 들어갈 때 로딩 화면: 휴대폰 · PC 처음 한 번(Fe 26 · 철 · 세계 · 한 줄 · 입자 ≤150 · 2초 안에 걷힘 · 초점) · 다시 · 세계 바꿈은 없음 · 다른 세계는 한 번 · 누르기 · Enter · Esc 건너뜀(새지 않음) · 움직임 줄이기 · 전경 없는 나라 · 목록 · PixiJS 막힘 · 느린 그림 · 404 · 깊은 주소 (${checks})`);
  } finally { await br.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
