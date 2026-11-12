/* 「들어가는 곳」 나라 · 목록 층(lib/walk-list.js) + 한 장 층(lib/walk-card.js) — 옛 tests/screen.cjs 의 도감 묶음(2026-10-31 판 ~ 「물 가문은 산소나라와 나눈다」)을 옮겨 왔다.
   더한 것: 조작 줄 두 줄(344 안) · 세계 거르기는 막대(「전부」 는 목록에서만) · ?at= 로 그 칸 · 목록 깊이에서 열고 닫으면 제자리 · 옛 dex.html 주소 · 옛 즐겨찾기 link 의 뒤로 가기.
   Run: NODE_PATH=<playwright 가 든 node_modules> node tests/walk-list.cjs */
const assert = require('node:assert/strict');
const { COVER, WIDE, serve, launch, open, noOverflow, shot, contrast } = require('./lib/harness.cjs');
const D = require('../data/element-design.json'), S = require('../data/style.json'), IMGJ = require('../data/img.json');

(async () => {
  const { base, close } = await serve(), br = await launch();
  let checks = 0;
  try {
    const fe = D.nations.find(n => n.key === 'fe'), fams = fe.families.length, cit = fe.families.reduce((s, f) => s + f.citizens.length, 0);
    const feCards = ['fe', ...fe.families.flatMap(f => ['fe-' + f.key, ...f.citizens.map(c => 'fe-' + f.key + '-' + c.key)])];
    /* 등록부에서 센다 — 한 화풍의 세계 그림, 일상컷(세계 몫 + 화풍 몫의 옛 시안) */
    const OLD = 'game_keyart', bs = k => (IMGJ.img[k] || {}).byStyle || {};
    const worldN = st => feCards.reduce((n, k) => n + Object.values((bs(k)[st] || {}).byForm || {}).filter(f => f.f).length, 0);
    const casN = (k, w) => [bs(k)[OLD]].filter(Boolean).reduce((n, b) => n + Object.entries(b.byForm || {}).filter(([wk]) => !w || wk === w).reduce((x, [, f]) => x + (((f.casual || {}).f) || []).length, 0) + (w ? 0 : (((b.casual || {}).f) || []).length), 0);
    let v = await open(br, base, '/index.html?n=fe&mode=list');
    const pg = v.page; await pg.waitForSelector('.dex-head');
    assert.equal(await pg.locator('.worlds.main .slot').count(), 3 + fams * 3 + cit * 3, '세계 그림 칸 — 근본 3 + 가문주 3×' + fams + ' + 주민 3×' + cit);
    /* 조작 줄 — 두 줄, 잘리지 않는다 */
    assert.equal(await pg.locator('.dex-pick, [data-wf], #dex-fav-count').count(), 0);
    assert.equal(await pg.locator('.dex-toc .toc-row').count(), 2);
    assert.deepEqual(await pg.locator('.w-worlds button').evaluateAll(b => b.map(x => x.dataset.w)), ['fantasy', 'steampunk', 'mecha', 'all']);
    for (const e of await pg.locator('.dex-toc .toc-row > *, .dex-toc .toc-row select, .dex-toc [data-view]').all()) {
      const r = await e.boundingBox(); assert(r.x >= -1 && r.x + r.width <= 344 + 1, '조작 줄이 344 안');
    }
    assert.match(await pg.locator('.toc-jump').evaluate(e => getComputedStyle(e).maskImage || getComputedStyle(e).webkitMaskImage), /linear-gradient/);
    assert(await noOverflow(pg)); checks += 6;
    await shot(pg, 'list-fe-top');
    /* 화풍 고르개 — 기본 화풍이 먼저 눌려 있고, 화풍 판의 화풍이 다 있다. 고른 화풍의 그림만 */
    assert.equal(await pg.locator('#dex-style').inputValue(), S.default, '처음은 기본 화풍');
    assert.deepEqual(await pg.locator('#dex-style option').evaluateAll(es => es.map(e => e.value)), [S.default, ...Object.keys(S.styles).filter(k => k !== S.default)], '고르개 — 기본 화풍 먼저, 화풍 판 차례');
    assert.equal(await pg.locator('.worlds.main .slot img').count(), worldN(S.default), '기본 화풍 그림만 ' + worldN(S.default));
    assert.match(await pg.locator('#dex-style option').first().textContent(), new RegExp(worldN(S.default) + '장'), '고르개에 그 화풍 장수');
    for (const st of Object.keys(S.styles).filter(k => k !== S.default && k !== OLD && worldN(k))) {
      await pg.selectOption('#dex-style', st);
      assert.equal(await pg.locator('.worlds.main .slot img').count(), worldN(st), st + ' 그림만');
      assert.equal(await pg.locator('.worlds.main a.slot').count(), 0, st + ' — 기본 화풍이 아니면 빈 칸이 생성기로 안 간다');
      assert.match(pg.url(), new RegExp('st=' + st));
    }
    await pg.selectOption('#dex-style', OLD); assert.match(pg.url(), /st=game_keyart/, '고른 화풍이 주소에');
    assert.equal(await pg.locator('.worlds.main .slot img').count(), worldN(OLD), '옛 화풍을 고르면 옛 그림 ' + worldN(OLD));
    const dead = fe.families.reduce((s, f) => s + f.citizens.reduce((x, c) => x + (3 - c.worlds.length), 0), 0);
    assert.equal(await pg.locator('.slot.dead').count(), dead, '안 사는 세계는 작고 흐린 칸');
    if (dead) assert((await pg.locator('.slot.dead').first().boundingBox()).height < 110, '흐린 칸은 작다');
    /* 어두운 바탕 대비 4.5:1(B8) — 흐린 칸 글 · 나라 설명 · 눌린 단추, 화풍 고르개 44px(B7) */
    await pg.waitForTimeout(300);   // 눌린 단추의 바탕색 전환(.25s)이 끝난 뒤에 잰다 — 전환 중 값은 oklab(…) 으로 와서 대비 손이 못 읽는다
    for (const [t, r] of await contrast(pg, '.slot.dead .ph, .slot.dead .cap, .about summary, .seg [aria-pressed="true"], .w-worlds [aria-pressed="true"], .w-mode [aria-pressed="true"], .row-head .shared a')) assert(r >= 4.5, '대비 ' + t + ' ' + r);
    assert((await pg.locator('#dex-style').boundingBox()).height >= 44, '화풍 고르개 44px'); checks += 2;
    assert.equal(await pg.locator('.worlds.alt, .worlds.casuals, [data-more="alt"]').count(), 0, '세계 그림 보기 — 일상컷은 접혀 있고 다른 화풍 줄은 없다');
    assert.equal(await pg.locator('.toc-jump .jump').count(), 1 + fams + cit, '바로 가기 칩 — 근본·가문주·주민');
    /* 접은 단추 — 근본의 일상컷(고른 화풍 것만) */
    await pg.click('#c-fe [data-more="casual"]'); assert.equal(await pg.locator('#c-fe .worlds.casuals .slot').count(), casN('fe'), '일상컷 펼치기');
    const capH = await pg.locator('#c-fe .worlds.casuals .slot .cap').first().evaluate(e => e.getBoundingClientRect().height);
    assert(capH < 40, '일상컷 이름은 한 줄 ' + capH);
    assert.match(await pg.locator('#c-fe .worlds.casuals .slot .cap').first().textContent(), /^(판타지|스팀펑크|메카|시안) \d+$/, '이름은 「판타지 1」 꼴');
    /* 바로 가기 — 누르면 그 카드가 위에 붙은 띠 바로 아래로 */
    const far = feCards[Math.floor(feCards.length / 2)];
    await pg.click('[data-jump="' + far + '"]'); await pg.waitForTimeout(900);
    const top = await pg.evaluate(k => { const el = document.getElementById('c-' + k), j = document.querySelector('.toc-jump'); return { card: el.getBoundingClientRect().top, toc: j.getBoundingClientRect().bottom }; }, far);
    assert(top.card >= top.toc - 20 && top.card < top.toc + 160, '바로 가기 ' + JSON.stringify(top));
    /* 보기 — 일상컷 + 메카(막대의 세계): 세계 그림은 없고 메카 일상컷만 */
    await pg.click('[data-view="casual"]'); await pg.click('.w-worlds [data-w="mecha"]');
    assert.equal(await pg.locator('.worlds.main').count(), 0, '일상컷 보기엔 세계 그림이 없다');
    assert.equal(await pg.locator('.worlds.casuals .slot').count(), feCards.reduce((n, k) => n + casN(k, 'mecha'), 0), '메카 일상컷 수');
    assert.deepEqual([...new Set((await pg.locator('.worlds.casuals .slot .cap').allTextContents()).map(t => t.split(' ')[0]))], ['메카'], '메카만');
    assert.match(pg.url(), /view=casual/); assert.match(pg.url(), /w=mecha/);
    /* 전부 — 세계 그림 + 일상컷, 다른 화풍 줄은 없다 */
    await pg.click('[data-view="all"]'); await pg.click('.w-worlds [data-w="all"]');
    assert.equal(await pg.locator('.worlds.alt').count(), 0, '전부 보기 — 다른 화풍 줄은 없다(고르개로)');
    assert.equal(await pg.locator('.worlds.casuals .slot').count(), feCards.reduce((n, k) => n + casN(k), 0), '전부 보기 — 고른 화풍 일상컷');
    await pg.click('[data-view="world"]'); checks += 22;
    /* 한 장 — 넘기기 · 하트(공방 모음 즐겨찾기 a: element) · Esc */
    await pg.click('[data-jump="fe"]'); await pg.waitForTimeout(500);
    await pg.click('#c-fe .worlds.main .slot >> nth=0');
    await pg.waitForSelector('.lightbox');
    const total = await pg.locator('.lightbox .lb-n').textContent();
    assert.match(total, /^1 \/ \d+$/, '몇 번째 ' + total);
    await pg.keyboard.press('ArrowRight'); await pg.waitForFunction(() => /^2 \//.test(document.querySelector('.lightbox .lb-n').textContent));
    await pg.keyboard.press('ArrowLeft'); await pg.keyboard.press('ArrowLeft');
    await pg.waitForFunction(t => document.querySelector('.lightbox .lb-n').textContent === t, total.replace(/^1 /, total.split(' / ')[1] + ' '));
    await pg.click('#dex-fav');
    const favs = await pg.evaluate(() => JSON.parse(localStorage.getItem('atelier_favorites_v1') || '[]'));
    assert(favs.length === 1 && favs[0].a === 'element' && favs[0].key === 'fe' && /\/index\.html\?n=fe&mode=list&card=fe&pic=.+&st=game_keyart$/.test(favs[0].link) && /^https:\/\//.test(favs[0].thumb), '하트 — 즐겨찾기 칸 ' + JSON.stringify(favs[0]));
    assert.equal(await pg.locator('#dex-fav').getAttribute('aria-pressed'), 'true');
    await pg.keyboard.press('Escape'); await pg.waitForSelector('.lightbox', { state: 'detached' });
    /* 즐겨찾기 수는 도구 상자로 */
    await pg.click('button.tb-open');
    assert.match(await pg.locator('[data-tool="fav"]').textContent(), /즐겨찾기 1/, '즐겨찾기 수');
    assert.equal(await pg.locator('[data-tool="fav"]').getAttribute('href'), '/favorites.html', '공방 모음 즐겨찾기로');
    await pg.keyboard.press('Escape'); await pg.waitForSelector('.tb-sheet', { state: 'detached' });
    /* 뒤로 가기는 한 장만 닫는다 — 목록 그대로(일상컷 한 장에서) */
    const before = pg.url();
    if (!(await pg.locator('#c-fe .worlds.casuals .slot').count())) await pg.click('#c-fe [data-more="casual"]');
    await pg.click('#c-fe .worlds.casuals .slot >> nth=0'); await pg.waitForSelector('.lightbox');
    await pg.goBack(); await pg.waitForFunction(() => document.documentElement.dataset.layer === 'list');
    assert.equal(await pg.locator('.lightbox').count(), 0, '뒤로 가기 — 한 장이 닫힌다'); assert.equal(pg.url(), before, '뒤로 가기 — 목록 그대로');
    await pg.click('#c-fe .worlds.casuals .slot >> nth=0'); await pg.waitForSelector('.lightbox'); await pg.click('.lightbox .bar button:last-child');
    await pg.waitForFunction(() => document.documentElement.dataset.layer === 'list'); assert.equal(pg.url(), before, '닫기 — 목록 그대로');
    assert(await noOverflow(pg)); assert.deepEqual(v.errors, []); checks += 12;
    /* 세계는 하나 — 목록의 「전부」 는 다른 층에선 판타지로 보인다 */
    await pg.click('.w-worlds [data-w="all"]'); await pg.click('.w-mode [data-mode="orbit"]');
    await pg.waitForFunction(() => document.documentElement.dataset.layer === 'orbit');
    assert.equal(await pg.locator('.w-worlds [data-w="all"]').count(), 0); assert.equal(await pg.getAttribute('.w-worlds [data-w="fantasy"]', 'aria-pressed'), 'true');
    await pg.click('.w-mode [data-mode="list"]'); await pg.waitForSelector('.dex-toc'); checks += 2;
    /* at= — 그 칸으로 내려간다 */
    const tgt = 'fe-' + fe.families[2].key;
    await pg.goto(base + '/index.html?n=fe&mode=list&at=' + tgt); await pg.waitForSelector('#c-' + tgt);
    await pg.waitForFunction(k => { const t = document.getElementById('c-' + k).getBoundingClientRect().top; return t >= -2 && t < 200; }, tgt); checks++;
    /* list scroll kept(Review Focus 1) */
    await pg.goto(base + '/index.html?n=fe&mode=list&st=game_keyart'); await pg.waitForSelector('.worlds.main button.slot');
    const last = pg.locator('.worlds.main button.slot').last(); await last.scrollIntoViewIfNeeded();
    const y0 = await pg.evaluate(() => scrollY); assert(y0 > 800, '충분히 내려왔다 ' + y0);
    await last.click(); await pg.waitForFunction(() => document.documentElement.dataset.layer === 'card');
    await pg.goBack(); await pg.waitForFunction(() => document.documentElement.dataset.layer === 'list');
    assert(Math.abs((await pg.evaluate(() => scrollY)) - y0) <= 2, '닫으면 제자리'); checks += 2;
    /* 옛 주소 — 셋 중 도감 */
    await pg.evaluate(() => localStorage.removeItem('element_dex_v1'));   // 위에서 화풍 고르개로 고른 화풍(game_keyart)은 기억된다 — 처음 오는 사람처럼 지우고 본다
    await pg.goto(base + '/dex.html?nation=fe&view=casual&w=mecha'); await pg.waitForSelector('.dex-toc');
    assert.equal(new URL(pg.url()).search, '?n=fe&mode=list&w=mecha&view=casual');
    assert.equal(await pg.getAttribute('[data-view="casual"]', 'aria-pressed'), 'true'); checks += 2;
    /* 공방 모음 즐겨찾기의 link 로 다시 오면 그 그림이 열린다(그 그림의 화풍으로) */
    const pic = favs[0].file; await v.ctx.close();
    v = await open(br, base, favs[0].link.replace(/^.*index\.html/, '/index.html')); await v.page.waitForSelector('.lightbox img');
    assert((await v.page.locator('.lightbox img').getAttribute('src')).endsWith(pic), '즐겨찾기 link 가 그 그림을 연다');
    await v.page.goBack(); await v.page.waitForFunction(() => document.documentElement.dataset.layer === 'list');
    assert.equal(await v.page.locator('#dex-style').inputValue(), OLD, '즐겨찾기 link — 그 그림의 화풍으로'); checks += 2;
    /* old favorite back(Review Focus 2) — 옛 즐겨찾기 link: 그 그림 → 뒤로 목록 → 뒤로 주기율표 */
    const p2 = v.page;
    await p2.goto(base + '/dex.html?nation=fe&card=fe&pic=' + encodeURIComponent(pic) + '&st=game_keyart'); await p2.waitForSelector('.lightbox img');
    assert((await p2.getAttribute('.lightbox img', 'src')).endsWith(pic));
    await p2.goBack(); await p2.waitForFunction(() => document.documentElement.dataset.layer === 'list'); assert.equal(await p2.inputValue('#dex-style'), 'game_keyart');
    await p2.goBack(); await p2.waitForFunction(() => document.documentElement.dataset.layer === 'table');
    /* 화풍 없는 옛 link 도 그 그림을 연다 — 그림의 화풍으로 보이되 st 는 쓰지 않는다(A2): 뒤로 가면 목록은 고르개 그대로 */
    await p2.evaluate(() => localStorage.removeItem('element_dex_v1'));
    await p2.goto(base + '/dex.html?nation=fe&card=fe&pic=' + encodeURIComponent(pic)); await p2.waitForSelector('.lightbox img');
    assert((await p2.getAttribute('.lightbox img', 'src')).endsWith(pic)); assert.doesNotMatch(p2.url(), /[?&]st=/);
    await p2.goBack(); await p2.waitForFunction(() => document.documentElement.dataset.layer === 'list');
    assert.equal(await p2.inputValue('#dex-style'), S.default, '옛 link 의 그림 화풍이 고르개를 옮기지 않는다');
    assert.deepEqual(v.errors, []); checks += 4; await v.ctx.close();
    /* 빈 자리는 생성기로 — 그림이 없는 (카드, 세계) 하나를 등록부에서 찾아(나라 차례대로) 그 나라 목록에서 본다 */
    const holes = D.nations.flatMap(n => [n.key, ...n.families.flatMap(f => [n.key + '-' + f.key, ...f.citizens.map(c => n.key + '-' + f.key + '-' + c.key)])].flatMap(k => {
      const fam = n.families.find(f => k.split('-')[1] === f.key), ci = fam && fam.citizens.find(c => k.split('-')[2] === c.key);
      const ws = ci ? ci.worlds : ['fantasy', 'steampunk', 'mecha'], have = (((IMGJ.img[k] || {}).byStyle || {})[S.default] || {}).byForm || {};
      return ws.filter(w => !(have[w] && have[w].f)).map(w => [n.key, k, w]);
    }));
    assert(holes.length, '빈 자리가 하나도 없다 — 이 검사를 다시 생각할 때');
    v = await open(br, base, '/index.html?n=' + holes[0][0] + '&mode=list', { pref: { st: '' } }); await v.page.waitForSelector('.dex-head');
    assert((await v.page.locator('a.slot[href^="prompt.html?card=' + holes[0][1] + '&world=' + holes[0][2] + '"]').count()) >= 1, '빈 자리는 생성기로 ' + holes[0]);
    /* 물 가문은 산소나라와 나눈다 — 누르면 그 나라 목록(한 층 아래로) */
    await v.page.goto(base + '/index.html?n=h&mode=list'); await v.page.waitForSelector('.dex-head');
    assert.equal(await v.page.locator('.row-head .shared a[href="index.html?n=o&mode=list"]').count(), 1, '물 가문은 산소나라와 나눈다');
    await v.page.click('.row-head .shared a[href="index.html?n=o&mode=list"]'); await v.page.waitForURL(/n=o&mode=list/);
    assert(await noOverflow(v.page)); assert.deepEqual(v.errors, []); checks += 4; await v.ctx.close();
    /* 그림이 다 404(B1) — 썸네일 → 원본 한 번씩만, load 가 온다, 마지막 실패면 숨긴다 */
    v = await open(br, base, '/index.html?n=fe&mode=list', { failURL: /\.(webp|png)(\?.*)?$/ }); await v.page.waitForSelector('.dex-head'); await v.page.waitForTimeout(2000);
    { const per = {}; for (const u of v.requests.filter(u => /\.(webp|png)(\?|$)/.test(u))) per[u] = (per[u] || 0) + 1;
      assert(Math.max(0, ...Object.values(per)) <= 2, '그림 부르기 ' + JSON.stringify(Object.entries(per).sort((a, b) => b[1] - a[1]).slice(0, 2)));
      const seen = await v.page.locator('.slot .face img').evaluateAll(es => es.filter(e => e.complete && e.getBoundingClientRect().top < innerHeight).map(e => getComputedStyle(e).visibility));
      assert(seen.length && seen.every(x => x === 'hidden'), '실패한 그림은 숨긴다 ' + seen); }
    await v.ctx.close(); checks += 2;
    /* WIDE — 열고 칸 수 · 넘침 · 오류 */
    const w = await open(br, base, '/index.html?n=fe&mode=list', { viewport: WIDE }); await w.page.waitForSelector('.dex-head');
    assert.equal(await w.page.locator('.worlds.main .slot').count(), 3 + fams * 3 + cit * 3);
    /* 목록 머리의 원소 기호는 나라 카드처럼 칸(B13) */
    const sym = await w.page.locator('.dex-head .sym').evaluate(e => ({ w: e.getBoundingClientRect().width, f: parseFloat(getComputedStyle(e).fontSize) }));
    assert(sym.w >= 56 && sym.f >= 24, '원소 기호 칸 ' + JSON.stringify(sym));
    assert(await noOverflow(w.page)); assert.deepEqual(w.errors, []); checks += 3; await w.ctx.close();
    console.log('PASS walk-list: ' + checks + '가지 — 세 층 · 흐린 칸 · 화풍 고르개 · 일상컷 · 바로 가기 · 조작 줄 두 줄(344 안) · 막대의 세계 거르기 · 한 장 넘기기 · 하트 · 즐겨찾기 수는 도구 상자 · 뒤로 가기는 한 장만 · ?at= · 목록 제자리 · 옛 dex 주소 · 옛 즐겨찾기 link · 빈 자리 → 생성기 · 겹치는 가문 · ' + COVER.width + ' · ' + WIDE.width);
  } finally { await br.close(); close(); }
})().catch(e => { console.error(e); process.exit(1); });
