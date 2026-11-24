/* 나라 층 전경 무대(2026-11-24 — 도시 공방의 도시 무대 전경을 옮김, 철 시험. lib/walk-orbit.js VistaStage · lib/walk.css .w-vista) — 가짜 등록부(지금 등록부 + 철 세 세계 전경, 피 가문주 그림은 뺌)로:
   (a) 세계마다 그 세계 전경이 무대 배경(.w-vista-bg 의 background-image 가 fe_<세계>_<화풍>_vista.webp) · 나라 이름 · 사실 칸은 전경 위(나라 글에는 없음) · 세계를 바꾸면 배경도 바뀜
   (b) 카드 띠 — 근본 + 설계된 가문 전부(설계표 차례), 모두 단추 · 44px. 근본 → 한 장, 그림 있는 가문주 → 가문, 그림 없는 가문주(피) → 목록의 그 칸
   (c) 궤도 · 보기 고르개는 전경 아래 그대로
   (d) 휴대폰 세로 390×844 움직임 켬이면 배경이 좌우로(w-pan) · 기기 움직임 줄이기면 멈춤 · 넓은 화면(폴드 884 · PC 1280)은 멈춘 cover · 둥근 판
   (e) 좁은 화면 머리 한 줄 — 지금 자리 이름 · ‹ › 는 감추고 전경 이름 줄의 ‹ › 가 대신(앞 · 뒤 나라, 역사 그대로)
   (f) 전경 구경 — 「전경」 단추 · 배경 길게 누르기로 들고, 「돌아가기」 · Esc · 한 번 누르기로 나온다. 드는 동안 이름 · 띠는 감춤, 단추는 남음
   (g) 가로 넘침 0(390 · 344 · 884 · 1280) · 콘솔 오류 0 (h) 전경이 없는 나라(수소)는 예전 그대로(전경 무대 없음 · data-vista 없음 · 머리 두 줄 · 나라 글에 이름)
   SHOT_DIR 이 있으면 사진(deviceScaleFactor 2 — 전경 그림은 옆 그림 저장소 element-atelier-img-3/img 의 실제 webp, 없으면 3:2 비탈).
   Run: NODE_PATH=<playwright 가 든 node_modules> node tests/vista-screen.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const H = require('./lib/harness.cjs');
const D = require('../data/element-design.json'), ST = require('../data/style.json')['default'], REAL = require('../data/img.json');
const WORLDS = D.vocab.worlds, FE = D.nations.find(n => n.key === 'fe');
const V = w => `fe_${w}_${ST}_vista.webp`;
/* 가짜 등록부 — 지금 등록부 + 철 세 세계 전경(셋째 그림 저장소), 피 가문주 그림은 빼 빈 카드 길을 본다 */
const REG = JSON.parse(JSON.stringify(REAL));
for (const w of WORLDS) { const b = REG.img.fe.byStyle[ST].byForm; (b[w] = b[w] || {}).vista = V(w); REG.where[V(w)] = 2; }
delete REG.img['fe-blood'];
const SHARD = path.join(H.ROOT, '..', 'element-atelier-img-3', 'img');
const WIDE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#3a2a5a"/><stop offset="1" stop-color="#c98a4a"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>';
const vistaBody = w => { const f = path.join(SHARD, V(w)); return fs.existsSync(f) ? { body: fs.readFileSync(f), contentType: 'image/webp' } : { body: WIDE_SVG, contentType: 'image/svg+xml' }; };
/* 사진을 찍을 때만 — 철 근본 · 가문주 그림은 옆 그림 저장소의 썸네일 · 원본(있으면)으로(없으면 하네스의 은빛 그림) */
const LOCAL = process.env.SHOT_DIR ? ['fe', ...FE.families.map(f => 'fe-' + f.key)].flatMap(k => Object.values((REG.img[k] || {}).byStyle || {}).flatMap(b => Object.values(b.byForm || {}).map(x => x.f)))
  .filter(Boolean).flatMap(f => ['thumb/', ''].map(d => [d, f, ['element-atelier-img', 'element-atelier-img-2', 'element-atelier-img-3'].map(r => path.join(H.ROOT, '..', r, 'img', d, f)).find(x => fs.existsSync(x))]))
  .filter(x => x[2]).map(([d, f, file]) => ({ url: new RegExp('/img/' + d + f.replace(/\./g, '\\.') + '$'), body: fs.readFileSync(file), contentType: 'image/webp' })) : [];
const FULFILL = [{ url: /\/data\/img\.json/, body: JSON.stringify(REG), contentType: 'application/json' }, ...WORLDS.map(w => Object.assign({ url: new RegExp(V(w).replace(/\./g, '\\.')) }, vistaBody(w))), ...LOCAL];
const PHONE = { width: 390, height: 844 }, FOLD = { width: 884, height: 1104 }, DESK = { width: 1280, height: 800 };
const smallTargets = p => p.$$eval('.w-vista button', els => els.filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && (r.width < 44 || r.height < 44); }).map(e => e.outerHTML.slice(0, 90)));
const bg = p => p.evaluate(() => { const e = document.querySelector('.w-vista-bg'); return e ? getComputedStyle(e).backgroundImage : ''; });
const anim = p => p.evaluate(() => getComputedStyle(document.querySelector('.w-vista-bg')).animationName);
const layer = p => p.evaluate(() => document.documentElement.dataset.layer);
/* 머리 줄 수 — 길 표시 · 세계 고르개의 가운데 높이가 같으면 한 줄 · 막대 높이 */
const rows = p => p.evaluate(() => { const t = [...document.querySelectorAll('.w-bar .w-crumbs, .w-bar .w-worlds')].map(e => { const r = e.getBoundingClientRect(); return r.top + r.height / 2; }); return Math.abs(t[0] - t[1]) < 4 && document.querySelector('.w-bar').offsetHeight < 72 ? 1 : 2; });

(async () => {
  const srv = await H.serve(), br = await H.launch();
  let checks = 0;
  const open = (url, o = {}) => H.open(br, srv.base, url, Object.assign({ viewport: PHONE, touch: true, scale: process.env.SHOT_DIR ? 2 : 0 }, o, { fulfill: FULFILL }));
  try {
    /* (a) (b) (c) (d) (e) (g) 세계마다 — 휴대폰 세로 */
    for (const w of WORLDS) {
      const o = await open('/index.html?n=fe&mode=orbit&w=' + w), p = o.page;
      await p.waitForSelector('.w-vista'); await p.waitForTimeout(200);
      assert((await bg(p)).includes(V(w)), w + ' (a) 무대 배경 = 그 세계 전경 — ' + await bg(p));
      assert.equal(await p.locator('.w-vista h1').count(), 1, w + ' (a) 나라 이름은 전경 위');
      assert.equal(await p.locator('.w-ntext h1, .w-ntext .w-facts').count(), 0, w + ' (a) 나라 글에는 이름 · 사실 칸이 없다(겹치지 않게)');
      assert.equal(await p.locator('.w-ntext .w-persona').count(), 1, w + ' (a) 나라 글(인격)은 그대로');
      const cards = await p.$$eval('.w-vista-strip > li', ls => ls.map(l => l.dataset.card));
      assert.deepEqual(cards, ['fe', ...FE.families.map(f => 'fe-' + f.key)], w + ' (b) 띠 = 근본 + 가문 ' + FE.families.length);
      assert.equal(await p.locator('.w-vista-strip .w-vcard').count(), cards.length, w + ' (b) 카드는 모두 단추');
      assert.equal(await p.locator('.w-vcard.empty').count(), 1, w + ' (b) 그림 없는 가문주(피)는 빈 카드');
      assert.deepEqual(await smallTargets(p), [], w + ' (b) 44px');
      assert.equal(await p.locator('.w-stage .w-node').count(), FE.families.length, w + ' (c) 궤도는 아래 그대로');
      assert.equal(await p.locator('.w-mode button').count(), 2, w + ' (c) 보기 고르개');
      assert.equal(await anim(p), 'w-pan', w + ' (d) 휴대폰 세로 — 배경이 좌우로');
      assert.equal(await rows(p), 1, w + ' (e) 머리 한 줄');
      assert(!(await p.locator('.w-crumbs button[aria-current]').isVisible()) && !(await p.locator('.w-bar .w-steps').isVisible()), w + ' (e) 지금 자리 이름 · 막대의 ‹ › 는 감춤');
      assert(await p.locator('.w-vsteps [data-step="next"]').isVisible(), w + ' (e) 전경 이름 줄의 ‹ ›');
      const vb = await p.locator('.w-vista').boundingBox(), bar = await p.locator('.w-bar').boundingBox();
      assert(vb.x <= 0.5 && Math.abs(vb.width - PHONE.width) <= 1, w + ' (d) 휴대폰 — 양옆 여백 없이 화면 끝까지 ' + JSON.stringify(vb));
      assert(Math.abs(vb.y - (bar.y + bar.height)) <= 1 && vb.y + vb.height <= PHONE.height + 1, w + ' (d) 막대 바로 아래 · 첫 화면 안');
      assert(await H.noOverflow(p), w + ' (g) 390 가로 넘침');
      await H.shot(p, 'vista-phone-' + w);
      assert.deepEqual(o.errors, [], w + ' 콘솔'); checks += 17; await o.ctx.close();
    }
    /* (a) 세계 바꾸기 → 배경도 · (b) 카드 길 · (e) 이름 줄의 ‹ › */
    { const o = await open('/index.html?n=fe&mode=orbit&w=steampunk'), p = o.page;
      await p.waitForSelector('.w-vista');
      await p.click('.w-worlds button[data-w="fantasy"]');
      await p.waitForFunction(v => getComputedStyle(document.querySelector('.w-vista-bg')).backgroundImage.includes(v), V('fantasy'));
      await p.click('.w-vista-strip li[data-card="fe"] .w-vcard'); await p.waitForFunction(() => document.documentElement.dataset.layer === 'card');
      assert.match(p.url(), /card=fe&pic=fe_/, '(b) 근본 → 한 장');
      await p.goBack(); await p.waitForSelector('.w-vista');
      await p.click('.w-vista-strip li[data-card="fe-steel"] .w-vcard'); await p.waitForFunction(() => document.documentElement.dataset.layer === 'family');
      assert.match(p.url(), /f=steel/, '(b) 그림 있는 가문주 → 가문');
      await p.goBack(); await p.waitForSelector('.w-vista');
      await p.click('.w-vista-strip li[data-card="fe-blood"] .w-vcard'); await p.waitForFunction(() => document.documentElement.dataset.layer === 'list');
      assert.match(p.url(), /mode=list&at=fe-blood/, '(b) 그림 없는 가문주 → 목록의 그 칸');
      await p.goBack(); await p.waitForSelector('.w-vista');
      const len = await p.evaluate(() => history.length);
      await p.click('.w-vsteps [data-step="next"]'); await p.waitForURL(/n=co&/);
      assert.equal(await p.evaluate(() => history.length), len, '(e) 이름 줄의 › — 다음 나라, 역사 그대로');
      assert.equal(await p.locator('.w-vista').count(), 0, '(h) 전경 없는 나라(코발트)로 가면 전경 무대가 빠진다');
      assert.equal(await p.evaluate(() => document.documentElement.dataset.vista), undefined, '(h) data-vista 도 빠진다');
      assert.deepEqual(o.errors, [], '세계 · 카드 콘솔'); checks += 7; await o.ctx.close(); }
    /* (f) 전경 구경 — 단추 · Esc · 길게 누르기 · 한 번 누르기 · 돌아가기 */
    { const o = await open('/index.html?n=fe&mode=orbit&w=fantasy'), p = o.page;
      await p.waitForSelector('.w-vista');
      await p.click('.w-look-btn');
      await p.waitForSelector('.w-vista.is-look .w-vista-look img');
      await p.waitForTimeout(450);   /* 이름 · 띠가 흐려지는 0.3초 */
      assert.equal(await p.getAttribute('.w-look-btn', 'aria-pressed'), 'true', '(f) 눌린 단추');
      assert(!(await p.locator('.w-vista-top').isVisible()) && !(await p.locator('.w-vista-strip').isVisible()), '(f) 이름 · 띠 감춤');
      assert(await p.locator('.w-look-close').isVisible() && await p.locator('.w-look-btn').isVisible(), '(f) 돌아가기 · 전경 단추는 남음');
      assert.equal(await anim(p), 'none', '(f) 구경 중엔 흐름 멈춤');
      await p.waitForFunction(() => { const b = document.querySelector('.w-vista-look'); return b && b.scrollWidth > b.clientWidth + 100; });
      await p.waitForTimeout(400);
      await H.shot(p, 'vista-phone-look');
      await p.keyboard.press('Escape'); await p.waitForSelector('.w-vista:not(.is-look)');
      assert.equal(await layer(p), 'orbit', '(f) Esc 는 구경만 닫는다(층 그대로)');
      /* 길게 누르기 — 띠 · 단추가 아닌 배경(이름 아래 하늘) */
      const vb = await p.locator('.w-vista').boundingBox();
      await p.mouse.move(vb.x + vb.width / 2, vb.y + vb.height * .45); await p.mouse.down(); await p.waitForTimeout(650); await p.mouse.up();
      await p.waitForSelector('.w-vista.is-look', { timeout: 2000 });
      await p.mouse.click(vb.x + vb.width / 2, vb.y + vb.height * .5); await p.waitForSelector('.w-vista:not(.is-look)');
      await p.click('.w-look-btn'); await p.waitForSelector('.w-look-close'); await p.click('.w-look-close'); await p.waitForSelector('.w-vista:not(.is-look)');
      /* 띠 위를 길게 눌러도 들지 않는다 */
      const sb = await p.locator('.w-vista-strip').boundingBox();
      await p.mouse.move(sb.x + 30, sb.y + sb.height / 2); await p.mouse.down(); await p.waitForTimeout(650); await p.mouse.up();
      assert.equal(await p.locator('.w-vista.is-look').count(), 0, '(f) 띠 위 길게 누르기는 구경이 아니다');
      assert.deepEqual(o.errors, [], '구경 콘솔'); checks += 8; await o.ctx.close(); }
    /* (d) 움직임 줄이기 — 멈춤 */
    { const o = await open('/index.html?n=fe&mode=orbit&w=mecha', { reduced: true }), p = o.page;
      await p.waitForSelector('.w-vista'); assert.equal(await anim(p), 'none', '(d) 움직임 줄이기면 멈춤'); checks++; await o.ctx.close(); }
    /* (g) 덮개 344 — 머리 한 줄 · 넘침 없음 */
    { const o = await open('/index.html?n=fe&mode=orbit&w=fantasy', { viewport: H.COVER }), p = o.page;
      await p.waitForSelector('.w-vista'); assert.equal(await rows(p), 1, '(e) 344 머리 한 줄'); assert(await H.noOverflow(p), '(g) 344 넘침');
      assert.deepEqual(await smallTargets(p), [], '344 44px'); assert.deepEqual(o.errors, []); checks += 3; await o.ctx.close(); }
    /* (d) (g) 폴드 · PC — 둥근 판, 멈춘 cover, 머리는 예전 꼴 */
    for (const [name, vp] of [['fold', FOLD], ['desktop', DESK]]) {
      const o = await open('/index.html?n=fe&mode=orbit&w=fantasy', { viewport: vp, touch: name === 'fold' }), p = o.page;
      await p.waitForSelector('.w-vista'); await p.waitForTimeout(300);
      assert.equal(await anim(p), 'none', name + ' (d) 넓은 화면은 흐르지 않는다');
      assert.equal(await p.evaluate(() => getComputedStyle(document.querySelector('.w-vista')).borderTopLeftRadius), '16px', name + ' (d) 둥근 판');
      assert(await p.locator('.w-crumbs button[aria-current]').isVisible() && await p.locator('.w-bar .w-steps').isVisible() && !(await p.locator('.w-vsteps').isVisible()), name + ' (e) 머리는 예전 꼴');
      const vb = await p.locator('.w-vista').boundingBox();
      assert(vb.y + vb.height <= vp.height + 1, name + ' 전경 판이 첫 화면 안');
      assert(await H.noOverflow(p), name + ' (g) 넘침'); assert.deepEqual(await smallTargets(p), [], name + ' 44px');
      await H.shot(p, 'vista-' + name);
      assert.deepEqual(o.errors, [], name + ' 콘솔'); checks += 6; await o.ctx.close();
    }
    /* (h) 전경 없는 나라 — 예전 그대로 */
    { const o = await open('/index.html?n=h&mode=orbit&w=fantasy'), p = o.page;
      await p.waitForSelector('.w-stage');
      assert.equal(await p.locator('.w-vista').count(), 0, '(h) 전경 무대 없음');
      assert.equal(await p.evaluate(() => document.documentElement.dataset.vista), undefined, '(h) data-vista 없음');
      assert.equal(await p.locator('.w-ntext h1').count(), 1, '(h) 나라 이름은 나라 글에');
      assert.equal(await rows(p), 2, '(h) 머리는 두 줄 그대로');
      assert(await H.noOverflow(p)); assert.deepEqual(o.errors, []); checks += 5; await o.ctx.close(); }
    console.log(`PASS vista-screen: 철 전경 세 세계 · 카드 띠(근본 + 가문 ${FE.families.length}) · 궤도 그대로 · 휴대폰 흐름 · 움직임 줄이기 · 머리 한 줄 · 이름 줄 ‹ › · 전경 구경(단추 · Esc · 길게 · 한 번 · 돌아가기) · 344 · 폴드 · PC · 전경 없는 나라 그대로 — ${checks} 확인`);
  } finally { await br.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
