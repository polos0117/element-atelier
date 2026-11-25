/* 지도 층(2026-11-24 — lib/walk-map.js · lib/walk.css .w-map) — 가짜 등록부(지금 등록부에서 크로뮴 카드를 모두 뺀다 — 대장간 산성의 안개 나라)로:
   (a) 깊은 주소 ?view=map&w=fantasy — 지도 층 · 그림 · 대륙 이름 9 · 하늘 · 물밑 · 땅속 배지 3 · 「지도」 눌림 · 크기 단추 3 · 이름 표 겹침 없음 · 44px
   (b) 주기율표 ↔ 지도 — 고르개는 역사 칸을 늘리지 않는다, 주기율표가 첫 화면(깊은 주소 없이 열면 주기율표, 지도는 기억하지 않는다)
   (c) 대륙 — 이름 누르기 · 빈 땅 누르기로 c, 다가가기(움직임 켬이면 한 번), 지나온 길 「대륙 › 가운데 대륙」 · 「위로」, 지역 이름 = 그 대륙 지역 수, 대륙마다 지역 이름 겹침 없음
   (d) 지역 — r, 나라 표시 = 그 지역 나라 수 · 겹침 없음 · 화면 안, 켜짐 / 안개 = 그 세계 그 화풍의 그림 유무(철 켜짐 · 크로뮴 안개), 동맹 선 = 둘 다 보이는 동맹 쌍
   (e) 뒤로 — 「위로」 · Esc · 지나온 길 · 브라우저 뒤로가 한 층씩
   (f) 나라 누르기 — 철(판타지 전경 있음) → 들어갈 때 로딩 화면 → 나라 층, 뒤로 가기 → 그 지역 지도 그대로
   (g) 하늘 · 물밑 · 땅속 — 자리로 다가가 판에 지역 · 나라, 판의 나라 → 나라 층
   (h) 손 — 끌기 · 휠 · ＋ − ⤢ · 키(화살표 · + · 0)
   (i) 움직임 줄이기 — 다가가기 없이 바로(같은 보기)
   (j) 스팀펑크 · 메카 — 「준비 중」 한 줄 + 주기율표(지도 그림 없음), 판타지로 바꾸면 지도
   (k) 가로 넘침 0(390 · 884 · 1280) · 콘솔 오류 0
   다듬기(2026-11-25): (c) 휴대폰 대륙 · 지역 배율 ≥ 온 세상 배율(위아래 빈 띠 없음) · (d) 화면 밖 동맹 상대 가장자리 표(대장간 산성 → 탄소 · 산소 (숨 쉬는 숲)) · 누르면 그곳 ·
   (f) 지도에서 온 나라의 지나온 길 「지도 › 가운데 대륙 › 대장간 산성 › 철 Fe」 · 길 누르기 · (l) 전경 미리 받기(지역 · 나라 카드 — 누르기 전 요청, 느린 그림에도 첫 누르기 로딩 화면, 데이터 절약이면 없음) ·
   (m) 온 세상 「동맹」 선 여덟 · 고르기 · 마우스 대기 · (n) 넓은 화면 확대 한도(1280 · DPR 1 → 1.6, DPR 2 → 0.8) · 그림 image-rendering auto · (o) 하늘 판 닫기(× · 테두리 밖 · Esc) · 초점
   SHOT_DIR 이 있으면 사진(deviceScaleFactor 2 — 지도 그림은 옆 그림 저장소 element-atelier-img/backgrounds/maps 의 실제 webp, 없으면 3:2 비탈).
   Run: ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/map-screen.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const H = require('./lib/harness.cjs');
const D = require('../data/element-design.json'), WM = require('../data/world-map.json'), ST = require('../data/style.json')['default'], REAL = require('../data/img.json');
const M = WM.map.fantasy, PHONE = { width: 390, height: 844 }, FOLD = { width: 884, height: 1104 }, DESK = { width: 1280, height: 800 };
/* 가짜 등록부 — 크로뮴(cr) 나라의 카드를 모두 뺀다 */
const REG = JSON.parse(JSON.stringify(REAL));
for (const k of Object.keys(REG.img)) if (k === 'cr' || k.startsWith('cr-')) delete REG.img[k];
/* 켜짐 셈(walk-data litOf 와 같은 규칙) — 그 나라 카드 가운데 판타지 기본 화풍에 세계 그림 · 전경 · 그 세계 일상컷이 하나라도 */
const cardKeys = n => [n.key, ...(n.families || []).flatMap(f => [n.key + '-' + f.key, ...(f.citizens || []).map(c => n.key + '-' + f.key + '-' + c.key)])];
const litOf = (k, w = 'fantasy') => cardKeys(D.nations.find(n => n.key === k)).some(c => { const b = ((REG.img[c] || {}).byStyle || {})[ST], f = b && b.byForm && b.byForm[w];
  return !!(f && (f.f || f.vista || (f.casual && (Array.isArray(f.casual) ? f.casual : f.casual.f || []).length))); });
const inRegion = r => Object.keys(WM.nations).filter(k => WM.nations[k].region === r);
const MAPF = path.join(H.ROOT, '..', 'element-atelier-img', 'backgrounds', 'maps', path.basename(M.image));
const WIDE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#1d4e6a"/><stop offset="1" stop-color="#6a8a4a"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>';
const mapBody = fs.existsSync(MAPF) ? { body: fs.readFileSync(MAPF), contentType: 'image/webp' } : { body: WIDE_SVG, contentType: 'image/svg+xml' };
/* 사진을 찍을 때만 — 대장간 산성 · 하늘 군도 나라의 그림은 옆 그림 저장소의 실제 파일로(없으면 하네스의 은빛 그림) */
const FULFILL = [{ url: /\/data\/img\.json/, body: JSON.stringify(REG), contentType: 'application/json' }, Object.assign({ url: /world-map_fantasy_/ }, mapBody)];
const shot = (p, name) => H.shot(p, name);

const view = p => p.evaluate(() => window.AtelierMap && window.AtelierMap.view);
const anims = p => p.evaluate(() => window.AtelierMap.anims);
const q = p => p.evaluate(() => location.search);
const layer = p => p.evaluate(() => document.documentElement.dataset.layer);
const settle = p => p.waitForTimeout(650);
/* 보이는 것끼리 겹침 — [이름 · 이름] */
const overlaps = (p, sel) => p.$$eval(sel, els => { const bs = els.map(e => [e.dataset.c || e.dataset.r || e.dataset.n, e.getBoundingClientRect()]).filter(([, r]) => r.width); const out = [];
  for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) { const a = bs[i][1], b = bs[j][1]; if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) out.push(bs[i][0] + '·' + bs[j][0]); }
  return out; });
const small = p => p.$$eval('.w-map button, .w-first button', els => els.filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && (r.width < 43.5 || r.height < 43.5); }).map(e => e.className + ' ' + e.textContent));
const crumbs = p => p.$$eval('.w-crumbs button', bs => bs.map(b => b.textContent));

(async () => {
  const srv = await H.serve(), br = await H.launch();
  let checks = 0;
  const ok = () => checks++;
  const open = (url, o = {}) => H.open(br, srv.base, url, Object.assign({ viewport: PHONE, touch: true, scale: process.env.SHOT_DIR ? 2 : 0 }, o, { fulfill: FULFILL }));
  const errorsAll = [];
  try {
    /* (a) 깊은 주소 — 휴대폰 · 폴드 · PC */
    for (const [vp, name] of [[PHONE, 'phone'], [FOLD, 'fold'], [DESK, 'desk']]) {
      const o = await open('/index.html?view=map&w=fantasy', { viewport: vp, touch: vp === PHONE }), p = o.page;
      await p.waitForSelector('.w-map .w-ml'); await p.waitForTimeout(300);
      assert.equal(await layer(p), 'map', name + ' (a) 지도 층');
      assert((await p.getAttribute('.w-map-img', 'src')).endsWith(M.image), name + ' (a) 지도 그림'); ok();
      assert.equal(await p.locator('.w-ml').count(), WM.continents.length, name + ' (a) 대륙 이름 9');
      assert.equal(await p.locator('.w-ml.is-anchor .w-ml-badge').count(), 3, name + ' (a) 하늘 · 물밑 · 땅속 배지');
      assert.deepEqual(await p.$$eval('.w-ml.is-anchor', e => e.map(x => x.dataset.layer).sort()), ['sky', 'underground', 'undersea'], name + ' (a) 배지 층');
      assert.equal(await p.getAttribute('[data-first="map"]', 'aria-pressed'), 'true', name + ' (a) 「지도」 눌림');
      assert.equal(await p.locator('.w-map-zoom button').count(), 3, name + ' (a) ＋ − ⤢');
      assert.deepEqual(await overlaps(p, '.w-ml'), [], name + ' (a) 대륙 이름 겹침 없음');
      assert.deepEqual(await small(p), [], name + ' (a) 44px');
      assert.deepEqual(await crumbs(p), ['지도'], name + ' (a) 지나온 길');
      assert(await H.noOverflow(p), name + ' (k) 가로 넘침'); ok();
      if (vp === DESK) { const v = await view(p), wv = vp.width; assert(v.x >= 0 && v.x + 1536 * v.s <= wv + 1, 'desk (a) 넓으면 한 장 다 보인다 ' + JSON.stringify(v)); }
      if (vp === PHONE) { const v = await view(p); assert(1024 * v.s >= 700, 'phone (a) 휴대폰은 높이에 맞춘다'); }
      if (name === 'phone') await shot(p, 'phone-world');
      if (name === 'desk') await shot(p, 'desktop-world');
      errorsAll.push(...o.errors.map(e => name + ': ' + e)); await o.ctx.close();
    }

    /* (b) 주기율표 ↔ 지도 — 역사 칸 그대로, 지도는 기억하지 않는다 */
    {
      const o = await open('/index.html'), p = o.page;
      await p.waitForSelector('.w-table'); const len = await p.evaluate(() => history.length);
      assert.equal(await p.getAttribute('[data-first="table"]', 'aria-pressed'), 'true', '(b) 첫 화면은 주기율표');
      await p.click('[data-first="map"]'); await p.waitForSelector('.w-map .w-ml');
      assert.equal(await q(p), '?view=map', '(b) 지도로'); assert.equal(await p.evaluate(() => history.length), len, '(b) 역사 칸 그대로');
      await p.click('[data-first="table"]'); await p.waitForSelector('.w-table');
      assert.equal(await q(p), '', '(b) 주기율표로'); ok();
      await p.click('[data-first="map"]'); await p.waitForSelector('.w-map .w-ml');
      await p.goto(srv.base + '/index.html'); await p.waitForSelector('.w-table');
      assert.equal(await layer(p), 'table', '(b) 다시 열면 주기율표(지도는 기억하지 않는다)'); ok();
      errorsAll.push(...o.errors); await o.ctx.close();
    }

    /* (c) (d) (e) (f) 대륙 → 지역 → 나라 — 휴대폰, 움직임 켬 */
    {
      const o = await open('/index.html?view=map&w=fantasy'), p = o.page;
      await p.waitForSelector('.w-ml[data-c="heartland"]');
      const a0 = await anims(p), vw = await view(p), sh = (await p.locator('.w-map-stage').boundingBox()).height;
      await p.click('.w-ml[data-c="heartland"]'); await settle(p);
      const vc = await view(p);
      assert(vc.s >= vw.s - 1e-4, '(c) 휴대폰 대륙 배율 ≥ 온 세상 ' + JSON.stringify([vw, vc]));
      assert(vc.y <= 0.5 && vc.y + 1024 * vc.s >= sh - 0.5, '(c) 위아래 빈 띠 없음 ' + JSON.stringify(vc));
      assert.equal(await p.evaluate(() => document.activeElement && document.activeElement.classList.contains('w-map-stage')), true, '(o) 누른 이름 표가 사라져도 초점은 지도 판');
      assert.equal(await q(p), '?w=fantasy&view=map&c=heartland', '(c) 대륙 누르기');
      assert.equal(await anims(p), a0 + 1, '(c) 다가가기 한 번');
      assert.deepEqual(await crumbs(p), ['지도', '가운데 대륙'], '(c) 지나온 길');
      assert.equal(await p.locator('.w-mr').count(), WM.regions.filter(r => r.continent === 'heartland').length, '(c) 지역 이름');
      assert.equal(await p.locator('.w-ml:not(.w-mr)').count(), 0, '(c) 대륙 이름은 감춤');
      assert(await p.locator('.w-map-up').isVisible(), '(c) 위로 단추');
      assert.equal(await p.textContent('.w-map-cap h2'), '가운데 대륙', '(c) 글 판'); ok();
      await shot(p, 'phone-continent-heartland');
      assert.equal(await p.locator('.w-me').count(), 1, '(d) 가운데 대륙 — 화면 밖 동맹 상대는 하늘 군도 하나');
      assert.match(await p.textContent('.w-me[data-to="sky_isles"]'), /수소 \(하늘 군도\)/, '(d) → 수소 (하늘 군도)');
      await p.click('.w-mr[data-r="c_forge"]'); await settle(p);
      assert((await view(p)).s >= vw.s - 1e-4, '(c) 휴대폰 지역 배율 ≥ 온 세상');
      assert.equal(await q(p), '?w=fantasy&view=map&c=heartland&r=c_forge', '(d) 지역');
      const forge = inRegion('c_forge');
      assert.equal(await p.locator('.w-mk').count(), forge.length, '(d) 나라 표시 = 지역 나라 수');
      assert.deepEqual(await p.$$eval('.w-mk', e => e.map(x => x.dataset.n).sort()), forge.slice().sort(), '(d) 그 지역 나라');
      assert.deepEqual(await overlaps(p, '.w-mk'), [], '(d) 겹침 없음');
      assert(await p.locator('.w-mk[data-n="fe"].is-lit').count() === 1, '(d) 철 켜짐');
      assert(await p.locator('.w-mk[data-n="cr"].is-fog').count() === 1, '(d) 크로뮴 안개(그림 없음)');
      assert.equal(await p.locator('.w-mk.is-lit').count(), forge.filter(k => litOf(k)).length, '(d) 켜짐 수 = 그림 있는 나라');
      assert.match(await p.getAttribute('.w-mk[data-n="cr"]', 'aria-label'), /아직 그림 없음/, '(d) 안개는 말로도');
      assert.equal(await p.locator('.w-mk-lines line').count(), 0, '(d) 대장간 산성엔 둘 다 보이는 동맹이 없다');
      assert.deepEqual(await crumbs(p), ['지도', '가운데 대륙', '대장간 산성'], '(d) 지나온 길 셋');
      assert(await H.noOverflow(p), '(k) 지역 넘침'); ok();
      /* (d) 화면 밖 동맹 상대 — 철의 강철(탄소) · 녹 · 피(산소)는 숨 쉬는 숲, 표는 왼쪽(서쪽) 가장자리 쪽 · 화면 안 · 44px */
      assert.equal(await p.locator('.w-me').count(), 1, '(d) 가장자리 표 하나(곳마다 묶음)');
      assert.match(await p.textContent('.w-me[data-to="c_forest"]'), /탄소 · 산소 \(숨 쉬는 숲\)/, '(d) 탄소 · 산소 (숨 쉬는 숲)');
      assert.match(await p.getAttribute('.w-me', 'aria-label'), /강철 · 녹 · 피 동맹/, '(d) 동맹 이름은 말로');
      { const b = await p.locator('.w-me').boundingBox(), st = await p.locator('.w-map-stage').boundingBox();
        assert(b.x >= st.x && b.x + b.width <= st.x + st.width && b.y >= st.y && b.y + b.height <= st.y + st.height, '(d) 표는 화면 안 ' + JSON.stringify(b));
        assert(b.x + b.width / 2 < st.x + st.width / 2, '(d) 표는 숨 쉬는 숲 쪽(왼쪽)'); }
      assert.deepEqual(await small(p), [], '(d) 44px'); ok();
      /* (l) 지역의 나라가 보이면 전경을 미리 받는다 — 철 판타지 전경 요청이 누르기 전에 */
      assert(o.requests.some(u => /fe_fantasy_[a-z0-9_]+_vista\.webp/.test(u)), '(l) 지역이 보이자 철 전경 요청'); ok();
      await shot(p, 'phone-region-c_forge');
      /* (e) 위로 · Esc · 지나온 길 · 브라우저 뒤로 */
      await p.click('.w-map-up'); await settle(p);
      assert.equal(await q(p), '?w=fantasy&view=map&c=heartland', '(e) 위로 → 대륙');
      await p.goForward(); await settle(p);
      assert.equal(await q(p), '?w=fantasy&view=map&c=heartland&r=c_forge', '(e) 앞으로 → 지역');
      await p.focus('.w-map-stage'); await p.keyboard.press('Escape'); await settle(p);
      assert.equal(await q(p), '?w=fantasy&view=map&c=heartland', '(e) Esc → 대륙');
      await p.goForward(); await settle(p);
      await p.click('.w-crumbs button:first-child'); await settle(p);
      assert.equal(await q(p), '?w=fantasy&view=map', '(e) 지나온 길 「지도」 → 온 세상');
      await p.goForward(); await p.goForward(); await settle(p);
      assert.equal(await q(p), '?w=fantasy&view=map&c=heartland&r=c_forge', '(e) 앞으로 둘'); ok();
      /* (f) 철 → 로딩 화면 → 나라 층 → 뒤로 → 그 지역 */
      await p.click('.w-mk[data-n="fe"]');
      await p.waitForSelector('.sp', { timeout: 3000 });
      await p.waitForFunction(() => document.documentElement.dataset.layer === 'orbit', null, { timeout: 5000 });
      assert.equal(await q(p), '?n=fe&mode=orbit&w=fantasy&c=heartland&r=c_forge', '(f) 나라 층(지도에서 온 길 c · r 은 남는다)'); ok();
      await p.waitForFunction(() => !document.querySelector('.sp'), null, { timeout: 4000 });
      /* (f) 지나온 길 — 지도 › 가운데 대륙 › 대장간 산성 › 철 Fe, 길을 누르면 그 지도 칸(역사를 거슬러), 앞으로 가면 다시 나라 */
      assert.deepEqual(await crumbs(p), ['지도', '가운데 대륙', '대장간 산성', '철 Fe'], '(f) 지도에서 온 나라의 지나온 길');
      await shot(p, 'phone-nation-from-map');
      await p.click('.w-crumbs button:nth-of-type(3)'); await p.waitForSelector('.w-mk'); await settle(p);
      assert.equal(await q(p), '?w=fantasy&view=map&c=heartland&r=c_forge', '(f) 길 「대장간 산성」 → 그 지역');
      await p.goForward(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'orbit');
      await p.click('.w-crumbs button:nth-of-type(2)'); await p.waitForSelector('.w-mr'); await settle(p);
      assert.equal(await q(p), '?w=fantasy&view=map&c=heartland', '(f) 길 「가운데 대륙」 → 그 대륙');
      await p.goForward(); await p.goForward(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'orbit');
      assert.equal(await q(p), '?n=fe&mode=orbit&w=fantasy&c=heartland&r=c_forge', '(f) 앞으로 둘 → 나라'); ok();
      /* ‹ › 옆 나라 — 지도에서 온 길은 같은 지역 나라일 때만 남는다(코발트는 땅속), 아니면 주기율표 › 나라 */
      await p.locator('[data-step="next"]:visible').first().click(); await p.waitForTimeout(150);
      assert.equal(await q(p), '?n=co&mode=orbit&w=fantasy', '(f) 옆 나라 — c · r 지움');
      assert.deepEqual(await crumbs(p), ['주기율표', '코발트 Co'], '(f) 옆 나라의 지나온 길');
      await p.locator('[data-step="prev"]:visible').first().click(); await p.waitForTimeout(150);
      await p.goBack(); await p.waitForSelector('.w-mk'); await settle(p);
      assert.equal(await q(p), '?w=fantasy&view=map&c=heartland&r=c_forge', '(f) 뒤로 → 그 지역 지도');
      assert.equal(await layer(p), 'map', '(f) 지도 층'); ok();
      /* 빈 땅 누르기 — 온 세상에서 화산 북쪽 들(가운데 대륙 상자 안 · 하늘 · 땅속 자리 밖 · 이름 표 밖) */
      await p.click('.w-crumbs button:first-child'); await settle(p);
      const v = await view(p), st = await p.locator('.w-map-stage').boundingBox();
      await p.mouse.click(st.x + v.x + .52 * 1536 * v.s, st.y + v.y + .48 * 1024 * v.s); await settle(p);
      assert.equal(await q(p), '?w=fantasy&view=map&c=heartland', '(c) 빈 땅 누르기 → 그 대륙'); ok();
      errorsAll.push(...o.errors); await o.ctx.close();
    }

    /* (c) 대륙마다 지역 이름 겹침 없음 · (d) 지역마다 나라 표시 겹침 없음 · 화면 안 — 휴대폰 · PC */
    for (const [vp, name] of [[PHONE, 'phone'], [DESK, 'desk']]) {
      const o = await open('/index.html?view=map&w=fantasy', { viewport: vp, touch: vp === PHONE, reduced: true }), p = o.page;
      await p.waitForSelector('.w-ml');
      for (const c of WM.continents.filter(c => c.layer === 'surface')) {
        await p.evaluate(u => { history.pushState(history.state, '', u); dispatchEvent(new PopStateEvent('popstate')); }, '/index.html?view=map&w=fantasy&c=' + c.key);
        await p.waitForTimeout(80);
        assert.deepEqual(await overlaps(p, '.w-mr'), [], name + ' (c) ' + c.key + ' 지역 이름 겹침');
        for (const r of WM.regions.filter(r => r.continent === c.key)) {
          await p.evaluate(u => { history.pushState(history.state, '', u); dispatchEvent(new PopStateEvent('popstate')); }, '/index.html?view=map&w=fantasy&c=' + c.key + '&r=' + r.key);
          await p.waitForTimeout(60);
          assert.equal(await p.locator('.w-mk').count(), inRegion(r.key).length, name + ' (d) ' + r.key + ' 나라 수');
          assert.deepEqual(await overlaps(p, '.w-mk'), [], name + ' (d) ' + r.key + ' 겹침');
          const out = await p.$$eval('.w-mk', (els, w) => els.filter(e => { const b = e.getBoundingClientRect(); return b.left < -1 || b.right > w + 1; }).map(e => e.dataset.n), vp.width);
          assert.deepEqual(out, [], name + ' (d) ' + r.key + ' 화면 밖');
          /* 동맹 선 = 이 지역에 둘 다 있는 동맹 쌍 */
          const here = new Set(inRegion(r.key)), want = WM.alliances.reduce((s, a) => { const n = a.nations.filter(k => here.has(k)).length; return s + n * (n - 1) / 2; }, 0);
          assert.equal(await p.locator('.w-mk-lines line').count(), want, name + ' (d) ' + r.key + ' 동맹 선');
        }
      }
      ok();
      if (name === 'desk') {
        await p.evaluate(u => { history.pushState(history.state, '', u); dispatchEvent(new PopStateEvent('popstate')); }, '/index.html?view=map&w=fantasy&c=heartland&r=c_forge');
        await p.waitForTimeout(200); await shot(p, 'desktop-region-c_forge');
        await p.evaluate(u => { history.pushState(history.state, '', u); dispatchEvent(new PopStateEvent('popstate')); }, '/index.html?view=map&w=fantasy&c=heartland&r=c_forest');
        await p.waitForTimeout(100);
        assert.deepEqual(await p.$$eval('.w-mk-lines line', l => l.map(x => x.dataset.family).sort()), ['fire', 'wood'], 'desk (d) 숨 쉬는 숲 — 불 · 숲 동맹 선(탄소 · 산소)');
        assert.match(await p.textContent('.w-mk-ally'), /불 동맹/, 'desk (d) 동맹 이름'); ok();
      }
      errorsAll.push(...o.errors.map(e => name + ': ' + e)); await o.ctx.close();
    }

    /* (g) 하늘 군도 — 판에 지역 둘 · 나라, 판의 나라 → 나라 층 */
    {
      const o = await open('/index.html?view=map&w=fantasy'), p = o.page;
      await p.waitForSelector('.w-ml[data-c="sky_isles"]');
      await p.click('.w-ml[data-c="sky_isles"]'); await settle(p);
      assert.equal(await q(p), '?w=fantasy&view=map&c=sky_isles', '(g) 하늘 군도');
      const regs = WM.regions.filter(r => r.continent === 'sky_isles'), ns = regs.flatMap(r => inRegion(r.key));
      assert.equal(await p.locator('.w-map-panel .w-map-preg').count(), regs.length, '(g) 판의 지역');
      assert.equal(await p.locator('.w-map-panel .w-pn').count(), ns.length, '(g) 판의 나라');
      assert.equal(await p.locator('.w-map-panel .w-ml-badge').textContent(), '하늘', '(g) 층 배지');
      assert.equal(await p.locator('.w-map-focus').count(), 1, '(g) 자리 테두리');
      assert.equal(await p.locator('.w-mr, .w-mk').count(), 0, '(g) 지역 이름 · 나라 표시는 판에만');
      assert.deepEqual(await small(p), [], '(g) 44px');
      assert(await H.noOverflow(p), '(k) 하늘 넘침'); ok();
      await shot(p, 'phone-sky-overlay');
      assert.match(await p.textContent('.w-me[data-to="c_forest"]'), /탄소 · 산소 \(숨 쉬는 숲\)/, '(g) 하늘 군도 — 수소의 동맹 상대(숨 쉬는 숲) 표');
      /* (o) 판 닫기 — × · 테두리 밖 빈 땅 · 판 안에서 Esc, 모두 한 층 위(온 세상) */
      await p.click('.w-map-pclose'); await settle(p);
      assert.equal(await q(p), '?w=fantasy&view=map', '(o) × → 온 세상'); await p.goForward(); await settle(p);
      { const v = await view(p), st = await p.locator('.w-map-stage').boundingBox(), b = M.continents.sky_isles;
        await p.mouse.click(st.x + v.x + (b.x + b.w + .03) * 1536 * v.s, st.y + v.y + (b.y - .02) * 1024 * v.s); await settle(p); }
      assert.equal(await q(p), '?w=fantasy&view=map', '(o) 테두리 밖 누르기 → 온 세상'); await p.goForward(); await settle(p);
      await p.focus('.w-map-panel .w-pn[data-n="he"]'); await p.keyboard.press('Escape'); await settle(p);
      assert.equal(await q(p), '?w=fantasy&view=map', '(o) 판 안에서 Esc → 온 세상'); await p.goForward(); await settle(p); ok();
      await p.click('.w-map-panel .w-pn[data-n="h"]');
      await p.waitForFunction(() => document.documentElement.dataset.layer === 'orbit', null, { timeout: 5000 });
      assert.equal(await q(p), '?n=h&mode=orbit&w=fantasy&c=sky_isles', '(g) 수소 나라(지도에서 온 길 — 하늘 군도까지)');
      assert.deepEqual(await crumbs(p), ['지도', '하늘 군도', '수소 H'], '(g) 지나온 길'); ok();
      errorsAll.push(...o.errors); await o.ctx.close();
    }

    /* (h) 손 — 끌기 · 휠 · 단추 · 키 (PC) */
    {
      const o = await open('/index.html?view=map&w=fantasy&c=heartland', { viewport: DESK, touch: false, scale: 1 }), p = o.page;   /* DPR 1 — 확대 한도 1.6 */
      await p.waitForSelector('.w-mr'); await settle(p);
      const st = await p.locator('.w-map-stage').boundingBox(), v0 = await view(p), cx = st.x + st.width / 2, cy = st.y + st.height / 2;
      await p.mouse.move(cx, cy); await p.mouse.down(); await p.mouse.move(cx - 120, cy - 40, { steps: 6 }); await p.mouse.up();
      const v1 = await view(p);
      assert(v1.x < v0.x - 60, '(h) 끌기 — 옮김 ' + JSON.stringify([v0, v1]));
      assert.equal(await q(p), '?w=fantasy&view=map&c=heartland', '(h) 끌기는 누르기가 아니다');
      await p.mouse.move(cx, cy); await p.mouse.wheel(0, -400); await p.waitForTimeout(50);
      const v2 = await view(p); assert(v2.s > v1.s * 1.1, '(h) 휠 키우기 ' + JSON.stringify([v1, v2]));
      await p.click('[data-z="out"]'); await settle(p);
      const v3 = await view(p); assert(v3.s < v2.s, '(h) − 줄이기');
      await p.click('[data-z="in"]'); await settle(p);
      assert((await view(p)).s > v3.s, '(h) ＋ 키우기');
      await p.click('[data-z="fit"]'); await settle(p);
      assert.deepEqual(await view(p), v0, '(h) ⤢ 이 자리에 맞추기');
      await p.focus('.w-map-stage'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(30);
      assert((await view(p)).x < v0.x, '(h) 화살표');
      await p.keyboard.press('+'); await settle(p); assert((await view(p)).s > v0.s, '(h) + 키');
      await p.keyboard.press('0'); await settle(p); assert.deepEqual(await view(p), v0, '(h) 0 키'); ok();
      errorsAll.push(...o.errors); await o.ctx.close();
    }

    /* (i) 움직임 줄이기 — 다가가기 없이 바로, 같은 보기 */
    {
      const o = await open('/index.html?view=map&w=fantasy', { reduced: true }), p = o.page;
      await p.waitForSelector('.w-ml[data-c="ore_east"]');
      await p.click('.w-ml[data-c="ore_east"]'); await p.waitForTimeout(40);
      const v = await view(p);
      assert.equal(await anims(p), 0, '(i) 다가가기 없음');
      const o2 = await open('/index.html?view=map&w=fantasy&c=ore_east', { reduced: true }); await o2.page.waitForSelector('.w-mr');
      assert.deepEqual(v, await view(o2.page), '(i) 바로 그 대륙 보기(깊은 주소와 같음)'); ok();
      errorsAll.push(...o.errors, ...o2.errors); await o.ctx.close(); await o2.ctx.close();
    }

    /* (j) 스팀펑크 · 메카 — 준비 중 + 주기율표, 판타지로 바꾸면 지도 */
    for (const w of ['steampunk', 'mecha']) {
      const o = await open('/index.html?view=map&w=' + w), p = o.page;
      await p.waitForSelector('.w-map-soon');
      assert.equal(await p.locator('.w-map').count(), 0, w + ' (j) 지도 그림 없음');
      assert.equal(await p.locator('.w-table .pcell').count() > 100, true, w + ' (j) 주기율표');
      assert.match(await p.textContent('.w-map-soon'), /준비 중/, w + ' (j) 준비 중');
      assert.equal(await p.getAttribute('[data-first="map"]', 'aria-pressed'), 'true', w + ' (j) 지도 눌림 그대로');
      assert(await H.noOverflow(p), w + ' (k) 넘침');
      await p.click('.w-worlds [data-w="fantasy"]'); await p.waitForSelector('.w-map .w-ml');
      assert.equal(await q(p), '?w=fantasy&view=map', w + ' (j) 판타지 → 지도'); ok();
      errorsAll.push(...o.errors); await o.ctx.close();
    }

    /* (l) 전경 미리 받기 — 그림이 느려도(0.9초) 지역이 보이고 1.3초 뒤 첫 누르기에 로딩 화면(600ms 규칙에 안 걸림) · 나라 카드 열기 · 데이터 절약 */
    {
      const o = await open('/index.html?view=map&w=fantasy&c=heartland&r=c_forge', { slowImg: 900 }), p = o.page;
      await p.waitForSelector('.w-mk[data-n="fe"]'); await p.waitForTimeout(1300);
      await p.click('.w-mk[data-n="fe"]');
      await p.waitForSelector('.sp', { timeout: 1500 });
      await p.waitForFunction(() => document.documentElement.dataset.layer === 'orbit', null, { timeout: 5000 }); ok();
      errorsAll.push(...o.errors); await o.ctx.close();
    }
    {
      const o = await open('/index.html', { slowImg: 900 }), p = o.page;
      await p.waitForSelector('.w-tile[data-n="fe"]');
      assert(!o.requests.some(u => /fe_fantasy_\w+_vista\.webp/.test(u)), '(l) 주기율표 — 나라 카드 열기 전엔 전경을 받지 않는다');
      await p.locator('.w-tile[data-n="fe"]').first().click(); await p.waitForSelector('.w-ncard');
      assert(o.requests.some(u => /fe_fantasy_\w+_vista\.webp/.test(u)), '(l) 나라 카드를 열자 철 전경 요청');
      await p.waitForTimeout(1300); await p.click('.w-ncard [data-act="enter"]');
      await p.waitForSelector('.sp', { timeout: 1500 }); ok();
      errorsAll.push(...o.errors); await o.ctx.close();
    }
    {
      const o = await open('/index.html?view=map&w=fantasy&c=heartland&r=c_forge'), p = o.page;
      await o.ctx.addInitScript(() => { Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true }); });
      const n0 = o.requests.length; await p.reload(); await p.waitForSelector('.w-mk[data-n="fe"]'); await p.hover('.w-mk[data-n="fe"]'); await p.waitForTimeout(300);
      assert(!o.requests.slice(n0).some(u => /_vista\.webp/.test(u)), '(l) 데이터 절약이면 미리 받지 않는다'); ok();
      errorsAll.push(...o.errors); await o.ctx.close();
    }

    /* (m) 온 세상 「동맹」 — 선 여덟(동맹마다 하나) · 아래 줄 고르기 → 밝은 선 하나 · 이름 표 · 다시 누르면 닫힘, 끄면 없음 · 선 누르기는 대륙으로 가지 않는다 · PC 는 마우스만 대도 */
    for (const [vp, name] of [[PHONE, 'phone'], [DESK, 'desk']]) {
      const o = await open('/index.html?view=map&w=fantasy', { viewport: vp, touch: vp === PHONE }), p = o.page;
      await p.waitForSelector('.w-map-allies');
      assert.equal(await p.getAttribute('.w-map-allies', 'aria-pressed'), 'false', name + ' (m) 처음엔 꺼짐');
      assert.equal(await p.locator('.w-ma').count(), 0, name + ' (m) 선 없음');
      await p.click('.w-map-allies');
      assert.equal(await p.locator('.w-ma g[data-ally]').count(), WM.alliances.length, name + ' (m) 동맹 선 여덟');
      assert.equal(await p.locator('.w-ma-line').count(), 8, name + ' (m) 선 8');
      assert.equal(await p.locator('.w-ma-list button').count(), 8, name + ' (m) 고르기 8');
      assert.deepEqual(await small(p), [], name + ' (m) 44px');
      await p.click('.w-ma-list [data-ally="water"]');
      assert.equal(await p.locator('.w-ma g.is-on').count(), 1, name + ' (m) 고른 선 하나');
      assert.equal(await p.textContent('.w-ma-tag'), '물 동맹 · 수소 · 산소', name + ' (m) 이름 표');
      if (name === 'phone') { await p.click('.w-ma-list [data-ally="steel"]'); await shot(p, 'phone-world-allies'); }
      await p.click('.w-ma-list [aria-pressed="true"]');
      assert.equal(await p.locator('.w-ma-tag').count(), 0, name + ' (m) 다시 누르면 닫힘');
      if (name === 'desk') {
        const pt = await p.evaluate(() => { const path = document.querySelector('.w-ma g[data-ally="salt"] .w-ma-line'), L = path.getTotalLength(), q = path.getPointAtLength(L / 2), m = path.getScreenCTM(); return { x: q.x * m.a + m.e, y: q.y * m.d + m.f }; });
        await p.mouse.move(pt.x, pt.y); await p.waitForTimeout(80);
        assert.equal(await p.textContent('.w-ma-tag'), '소금 동맹 · 나트륨 · 염소', 'desk (m) 마우스를 대면 이름');
        await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(80);
        assert.equal(await q(p), '?w=fantasy&view=map', 'desk (m) 선 누르기는 대륙으로 가지 않는다');
        await shot(p, 'desktop-world-allies');
      }
      assert(await H.noOverflow(p), name + ' (k) 동맹 넘침');
      await p.click('.w-map-allies'); assert.equal(await p.locator('.w-ma').count(), 0, name + ' (m) 끄면 없음'); ok();
      errorsAll.push(...o.errors.map(e => name + ': ' + e)); await o.ctx.close();
    }

    /* (n) 넓은 화면 확대 한도 — 그림이 기기 픽셀로 1.6 배를 넘지 않는다(1280 · DPR 1 → 1.6, DPR 2 → 0.8 — 온 세상 배율보다 작게는 아니다), ＋ · 휠로도 */
    for (const dpr of [1, 2]) {
      const o = await open('/index.html?view=map&w=fantasy&c=heartland&r=c_forge', { viewport: DESK, touch: false, scale: dpr }), p = o.page;
      await p.waitForSelector('.w-mk'); await settle(p);
      const ws = await p.evaluate(() => { const r = document.querySelector('.w-map-stage').getBoundingClientRect(); return Math.min(r.width / 1536, r.height / 1024); }), cap = Math.max(ws, 1.6 / dpr);
      const v = await view(p); assert(v.s <= cap + 1e-3, 'DPR ' + dpr + ' (n) 지역 배율 ≤ ' + cap.toFixed(3) + ' ' + JSON.stringify(v));
      assert(v.s >= ws - 1e-3, 'DPR ' + dpr + ' (n) 지역 배율 ≥ 온 세상');
      for (let i = 0; i < 4; i++) { await p.click('[data-z="in"]'); await settle(p); }
      const st = await p.locator('.w-map-stage').boundingBox(); await p.mouse.move(st.x + st.width / 2, st.y + st.height / 2); await p.mouse.wheel(0, -800); await p.waitForTimeout(60);
      assert((await view(p)).s <= cap + 1e-3, 'DPR ' + dpr + ' (n) ＋ · 휠로도 한도 ' + JSON.stringify(await view(p)));
      assert.equal(await p.evaluate(() => getComputedStyle(document.querySelector('.w-map-img')).imageRendering), 'auto', '(n) image-rendering auto');
      if (dpr === 2) { await p.click('[data-z="fit"]'); await settle(p); await shot(p, 'desktop-region-c_forge-dpr2'); }
      ok(); errorsAll.push(...o.errors); await o.ctx.close();
    }

    assert.deepEqual(errorsAll, [], '(k) 콘솔 오류');
    console.log('PASS map-screen: (a) 깊은 주소 · 대륙 이름 · 배지 · 겹침 · 44px · (b) 주기율표 ↔ 지도 · (c) 대륙 · (d) 지역 · 켜짐/안개 · 동맹 선 · (e) 뒤로 · (f) 나라 · (g) 하늘 판 · (h) 손 · (i) 움직임 줄이기 · (j) 준비 중 · (k) 넘침 · 오류 · (l) 전경 미리 받기 · (m) 동맹 선 · (n) 확대 한도 · (o) 판 닫기 · 초점 — 묶음 ' + checks);
  } finally { await br.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
