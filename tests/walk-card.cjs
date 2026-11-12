/* 「들어가는 곳」 한 장 층(lib/walk-card.js) — 어디서 눌러도 같은 한 장(글 판 · 홀로 · 하트 · 몇 번째) · 막대의 세계 고르개 하나로 세계 넘기기 · 화풍은 층을 건너 이어진다 ·
   옛 전시관 한 장 주소의 뒤로 가기(한 장 → 가문 → 궤도 → 주기율표) · 옛 전시관 첫 주소 → 주기율표.
   Run: NODE_PATH=<playwright 가 든 node_modules> node tests/walk-card.cjs */
const assert = require('node:assert/strict');
const { COVER, WIDE, serve, launch, open, noOverflow, shot } = require('./lib/harness.cjs');
const D = require('../data/element-design.json'), IMGJ = require('../data/img.json');
const anyPic = k => Object.values(((IMGJ.img[k] || {}).byStyle) || {}).some(b => Object.values(b.byForm || {}).some(f => f.f));
/* 한 화풍에 세 세계 그림이 다 있는 첫 카드와 그 화풍 */
const threeWorlds = (() => { for (const [k, e] of Object.entries(IMGJ.img)) for (const [st, b] of Object.entries(e.byStyle || {}))
  if (D.vocab.worlds.every(w => ((b.byForm || {})[w] || {}).f)) return [k, st]; return null; })();

(async () => {
  const { base, close } = await serve(), br = await launch();
  try {
    // 어디서 눌러도 같은 한 장
    for (const [from, sel] of [['/index.html?n=fe&mode=orbit', '.w-nucleus'], ['/index.html?n=fe&mode=list&st=game_keyart', '#c-fe .worlds.main button.slot >> nth=0']]) {
      const { page: p, errors, ctx } = await open(br, base, from); await p.click(sel);
      await p.waitForSelector('.lightbox.w-card .lb-stage img');
      assert.equal(await p.locator('.w-lore h1').evaluate(e => e.firstChild.textContent), '철');
      assert.equal(await p.locator('#dex-fav, #dex-holo, .lb-n').count(), 3);
      assert(await noOverflow(p)); if (from.includes('orbit')) await shot(p, 'card-fe');
      await p.keyboard.press('Escape'); await p.waitForFunction(() => document.documentElement.dataset.layer !== 'card');
      assert.deepEqual(errors, []); await ctx.close();
    }
    // 세계 넘기기 — 위 고르개 하나로
    let skipped = '';
    const { page: p, errors } = await open(br, base, '/index.html');
    if (threeWorlds) {
      const [ck, cst] = threeWorlds, cn = ck.split('-')[0];
      await p.goto(base + '/index.html?n=' + cn + '&mode=list&st=' + cst + '&w=fantasy&card=' + ck);
      await p.waitForSelector('.lb-stage img');
      await p.click('.w-worlds [data-w="mecha"]'); await p.waitForFunction(() => /_mecha_/.test(document.querySelector('.lb-stage img').src));
      assert.match(p.url(), /pic=[^&]*_mecha_/);
      assert.match(await p.locator('.w-lore').textContent(), /메카/, '글 판도 그 세계');
      // 화풍(st)은 층을 건너 이어진다
      await p.goBack(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'list');
      assert.equal(await p.inputValue('#dex-style'), cst);
    } else skipped = ' (세계 넘기기 건너뜀 — 한 화풍에 세 세계가 다 있는 카드가 없다)';
    // 그 세계 그림이 없으면 그림은 그대로, 글 판만 그 세계로
    const KEYS = new Set(D.nations.flatMap(n => [n.key, ...n.families.flatMap(f => [n.key + '-' + f.key, ...f.citizens.map(c => n.key + '-' + f.key + '-' + c.key)])]));
    const has = (b, w) => ((b.byForm || {})[w] || {}).f, one = Object.entries(IMGJ.img).filter(([k]) => KEYS.has(k))
      .map(([k, e]) => [k, Object.entries(e.byStyle || {}).find(([, b]) => D.vocab.worlds.some(w => has(b, w)) && D.vocab.worlds.some(w => !has(b, w)))]).find(([, x]) => x);
    if (one) {
      const [ok, [ost, ob]] = one, have = D.vocab.worlds.find(w => has(ob, w)), other = D.vocab.worlds.find(w => !has(ob, w));
      await p.goto(base + '/index.html?n=' + ok.split('-')[0] + '&mode=orbit&st=' + ost + '&w=' + have + '&card=' + ok); await p.waitForSelector('.lb-stage img');
      const src = await p.getAttribute('.lb-stage img', 'src');
      await p.click('.w-worlds [data-w="' + other + '"]'); await p.waitForFunction(w => new RegExp('w=' + w).test(location.search), other);
      assert.equal(await p.getAttribute('.lb-stage img', 'src'), src, '그 세계 그림이 없으면 그림은 그대로');
      assert.equal(await p.locator('.w-lore [data-world]').getAttribute('data-world'), other, '글 판은 그 세계');
    }
    // old gallery back(Review Focus 2) — 옛 전시관 한 장 주소: 한 장 → 가문 → 궤도 → 주기율표
    const h = D.nations.find(n => n.key === 'h'), fam = h.families.find(f => f.citizens.some(c => anyPic('h-' + f.key + '-' + c.key)));
    const cit = 'h-' + fam.key + '-' + fam.citizens.find(c => anyPic('h-' + fam.key + '-' + c.key)).key;
    await p.goto(base + '/gallery.html?n=h&f=' + fam.key + '&c=' + cit + '&w=mecha&v=1'); await p.waitForSelector('.lb-stage img');
    assert.match(await p.locator('.w-lore').textContent(), new RegExp(fam.ko), '주민 글 판 — 가문');
    for (const l of ['family', 'orbit', 'table']) { await p.goBack(); await p.waitForFunction(x => document.documentElement.dataset.layer === x, l); }
    await p.goto(base + '/gallery.html'); await p.waitForSelector('.w-table');
    assert.equal(new URL(p.url()).pathname, '/index.html'); assert.doesNotMatch(new URL(p.url()).search, /[?&](n|f|card)=/, '옛 전시관 첫 주소 → 주기율표(전역 값 w · st 는 기억값이 채울 수 있다)');
    assert(await noOverflow(p)); assert.deepEqual(errors, []);
    // WIDE — 한 장 열고 넘침 · 오류, 글 판은 그림 옆
    const w = await open(br, base, '/index.html?n=fe&mode=orbit&card=fe', { viewport: WIDE }); await w.page.waitForSelector('.lb-stage img');
    const [img, lore] = [await w.page.locator('.lb-stage').boundingBox(), await w.page.locator('.w-lore').boundingBox()];
    assert(lore.x >= img.x + img.width - 1, '넓으면 글 판이 옆');
    assert(await noOverflow(w.page)); assert.deepEqual(w.errors, []); await shot(w.page, 'card-wide'); await w.ctx.close();
    console.log('PASS walk-card: 궤도 · 목록 어디서나 같은 한 장(글 판 · 홀로 · 하트) · 세계 넘기기 · 없는 세계는 글 판만 · 화풍은 층을 건너 · 옛 전시관 뒤로 가기 · 옛 전시관 첫 주소 · ' + COVER.width + ' · ' + WIDE.width + skipped);
  } finally { await br.close(); close(); }
})().catch(e => { console.error(e); process.exit(1); });
