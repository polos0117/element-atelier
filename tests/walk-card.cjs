/* 「들어가는 곳」 한 장 층(lib/walk-card.js) — 어디서 눌러도 같은 한 장(글 판 · 홀로 · 하트 · 몇 번째) · 막대의 세계 고르개 하나로 세계 넘기기 · 화풍은 층을 건너 이어진다 ·
   옛 전시관 한 장 주소의 뒤로 가기(한 장 → 가문 → 궤도 → 주기율표) · 옛 전시관 첫 주소 → 주기율표.
   Run: NODE_PATH=<playwright 가 든 node_modules> node tests/walk-card.cjs */
const assert = require('node:assert/strict');
const { COVER, WIDE, serve, launch, open, noOverflow, shot } = require('./lib/harness.cjs');
const D = require('../data/element-design.json'), IMGJ = require('../data/img.json'), S = require('../data/style.json');
const anyPic = k => Object.values(((IMGJ.img[k] || {}).byStyle) || {}).some(b => Object.values(b.byForm || {}).some(f => f.f));
const stylePic = (k, st) => Object.values((((IMGJ.img[k] || {}).byStyle || {})[st] || {}).byForm || {}).some(f => f.f);
/* 한 화풍에 세 세계 그림이 다 있는 첫 카드와 그 화풍 */
/* 일상컷 한 줄 fixture(2026-11-17) — 한 화풍 · 한 세계에 일상컷이 넷 넘는 카드(세계 그림도 있는), 앞 셋만 색인에(필수 · 코스프레 GPT · 옷 자유), 넷째는 없음 */
const CN = (() => { for (const [k, e] of Object.entries(IMGJ.img)) for (const [st, b] of Object.entries(e.byStyle || {})) for (const w of D.vocab.worlds) {
  const fm = (b.byForm || {})[w] || {}, fl = (fm.casual || {}).f || []; if (!fm.f || fl.length < 4) continue;
  const files = fl.slice(0, 4), base = f => ({ card: k, name: k, world: w, worldKo: '', n: +f.match(/_casual(\d+)\.webp$/)[1], date: '2026-11-17', style: st, path: '', required: null, requiredKo: null, family: null, familyKo: null, item: null, itemKo: null, shade: null, shadeKo: null, cosplay: null, free: null });
  const outfit = 'an asymmetric apricot wrap top with a single broad shoulder band and an opaque cropped front, high-waisted tailored shorts with overlapping rounded side panels';
  const rows = [Object.assign(base(files[0]), { required: 'nation', requiredKo: '나라 안', family: 'homewear', familyKo: '홈웨어', item: 'backless_lounge', itemKo: '백리스 라운지', shade: 'stone', shadeKo: '스톤 베이지' }),
    Object.assign(base(files[1]), { required: 'cosplay', requiredKo: '게임 코스프레', family: 'game_cosplay', familyKo: '게임 코스프레', item: 'gc_lingerie', itemKo: '란제리', cosplay: { game: 'street_fighter_2', gameKo: '스트리트 파이터 II', character: 'E. Honda', characterKo: null, cut: 'lingerie', cutKo: '란제리', by: 'gpt', round: 1 } }),
    Object.assign(base(files[2]), { free: { kind: 'ofree', kindKo: '옷 자유', outfit } })];
  return { key: k, n: k.split('-')[0], st, w, files, outfit, doc: { version: 1, atelier: 'element', built: '', source: [], rows } };
} return null; })();
const threeWorlds = (() => { for (const [k, e] of Object.entries(IMGJ.img)) for (const [st, b] of Object.entries(e.byStyle || {}))
  if (D.vocab.worlds.every(w => ((b.byForm || {})[w] || {}).f)) return [k, st]; return null; })();

(async () => {
  const { base, close } = await serve(), br = await launch();
  try {
    // 일상컷 한 줄(2026-11-17 「상세보기나 크게보기 일 때만 보이도록」) — 목록 칸엔 없음(색인도 안 받는다) · 한 장에서만 · 필수 · 코스프레(GPT 고름) · 자유 설계(영어, 줄였다 펼침) · 색인에 없는 컷은 없음 · 색인은 한 번만
    if (CN) for (const viewport of [COVER, WIDE]) {
      const { page: p, errors, ctx } = await open(br, base, '/index.html?n=' + CN.n + '&mode=list&view=casual&st=' + CN.st, { viewport }); let fetched = 0;
      await ctx.route(/\/data\/casual-index\.json/, r => { fetched++; return r.fulfill({ contentType: 'application/json', body: JSON.stringify(CN.doc) }); });
      await p.reload(); const slot = f => p.locator('#c-' + CN.key + ' .worlds.casuals button.slot:has(img[src$="' + encodeURIComponent(f) + '"])');
      await slot(CN.files[0]).waitFor();
      assert.equal(await p.locator('.cnote').count(), 0, '목록 칸엔 한 줄이 없다'); assert.equal(fetched, 0, '목록을 그릴 때 색인을 안 받는다');
      await slot(CN.files[0]).click(); const note = p.locator('.w-card .lb-cnote'); await note.waitFor();
      assert.equal(fetched, 1, '처음 열 때 색인 한 번'); assert.equal((await note.textContent()).trim(), '필수 · 나라 안 — 백리스 라운지 · 스톤 베이지', '필수 한 줄');
      await p.keyboard.press('ArrowRight'); await p.waitForFunction(() => /코스프레/.test((document.querySelector('.lb-cnote') || {}).textContent || ''));
      assert.equal(await note.locator('b').textContent(), '필수 · 게임 코스프레'); assert.match(await note.textContent(), /— 스트리트 파이터 II · E\. Honda · 란제리GPT 고름$/, '코스프레 — 캐릭터는 영어 그대로 · GPT 고름');
      await p.keyboard.press('ArrowRight'); await p.waitForSelector('.lb-cnote .cnote-more');
      const more = note.locator('.cnote-more'); assert.equal(await note.locator('b').textContent(), '옷 자유'); assert.equal(await more.getAttribute('aria-expanded'), 'false'); assert((await more.textContent()).endsWith('…'), '긴 Outfit 은 줄여 보인다');
      await more.click(); assert.equal(await more.getAttribute('aria-expanded'), 'true'); assert.equal(await more.textContent(), CN.outfit, '누르면 펼침(영어 그대로)');
      assert.equal(await p.evaluate(() => document.documentElement.dataset.layer), 'card', '펼쳐도 한 장 그대로');
      await p.keyboard.press('ArrowRight'); await p.waitForFunction(f => ((document.querySelector('.w-card .lb-stage img') || {}).getAttribute('src') || '').endsWith(encodeURIComponent(f)), CN.files[3]);
      assert.equal(await p.locator('.lb-cnote').count(), 0, '색인에 없는 컷은 아무것도 안 보인다'); assert.equal(fetched, 1, '색인은 한 번만');
      { const nb = await p.locator('.w-card .lb-top').boundingBox(); assert(nb.x >= 0 && nb.x + nb.width <= viewport.width + 1, '일상컷 한 줄 옆 넘침 ' + JSON.stringify(nb)); }   /* 쪽 전체 넘침은 아래 목록 층 것(344 조작 줄 — 원래 실패)이라 한 장의 위 줄만 잰다 */ assert.deepEqual(errors, []); await ctx.close();
    }
    // 어디서 눌러도 같은 한 장
    for (const [from, sel] of [['/index.html?n=fe&mode=orbit', '.w-nucleus'], ['/index.html?n=fe&mode=list&st=game_keyart', '#c-fe .worlds.main button.slot >> nth=0']]) {
      const { page: p, errors, ctx } = await open(br, base, from); await p.click(sel);
      await p.waitForSelector('.lightbox.w-card .lb-stage img');
      assert.equal(await p.locator('.w-lore h1').evaluate(e => e.firstChild.textContent), '철');
      assert.equal(await p.locator('#dex-fav, #dex-holo, .lb-n').count(), 3);
      assert(await noOverflow(p)); if (from.includes('orbit')) await shot(p, 'card-fe');
      /* 한 장 층은 가로 굴림 막대를 띄우지 않는다(hidden — 손으로 못 굴리고 막대도 없다) — 넘길 때 화면 아래에 하얀 줄이 뜨던 것 */
      assert.equal(await p.locator('.lightbox.w-card').evaluate(e => getComputedStyle(e).overflowX), 'hidden', '한 장 층 가로 굴림 없음');
      await p.keyboard.press('Escape'); await p.waitForFunction(() => document.documentElement.dataset.layer !== 'card');
      assert.deepEqual(errors, []); await ctx.close();
    }
    // 단추 줄(B2) — 덮개 344 의 근본 한 장(단추 넷): 단추 글이 두 줄로 꺾이지 않고(줄이 넘치면 단추째 다음 줄로), 44 ~ 48px, 옆 넘침 없음
    {
      const { page: p, errors, ctx } = await open(br, base, '/index.html?n=fe&mode=orbit&card=fe'); await p.waitForSelector('.lb-stage img');
      const btns = await p.locator('.w-card .bar > *').evaluateAll(es => es.map(e => {
        const r = document.createRange(); r.selectNodeContents(e);
        /* 줄 수 = 글 상자의 윗변이 반 줄 넘게 떨어진 무리 수 — 글꼴이 없어 대신 쓴 글꼴의 ♡ 는 같은 줄에서도 상자가 2px 높아(656 · 658) 윗변을 그대로 세면 두 줄로 셌다(2026-11-25) */
        const half = parseFloat(getComputedStyle(e).fontSize) / 2, tops = [...r.getClientRects()].filter(x => x.width > 0).map(x => x.top).sort((a, b) => a - b);
        const lines = tops.reduce((n, t, i) => n + (i === 0 || t - tops[i - 1] > half ? 1 : 0), 0);
        return { t: e.textContent.trim(), h: e.getBoundingClientRect().height, lines };
      }));
      assert.equal(btns.length, 4, '근본 한 장 — 홀로 · 즐겨찾기 · 지시문 · 닫기 ' + JSON.stringify(btns));
      for (const b of btns) { assert.equal(b.lines, 1, '단추 글은 한 줄 ' + JSON.stringify(b)); assert(b.h >= 44 && b.h <= 48, '단추 높이 ' + JSON.stringify(b)); }
      assert(await p.locator('.w-card .bar').evaluate(e => e.scrollWidth <= e.clientWidth + 1), '단추 줄 옆 넘침');
      assert(await noOverflow(p)); assert.deepEqual(errors, []); await ctx.close();
    }
    // 그림이 안 와도(B6) — 깨진 그림 표시 없이 숨기고, 그림 칸이 무너지지 않아 ‹ › 가 위 글에 겹치지 않는다
    {
      const { page: p, ctx } = await open(br, base, '/index.html?n=fe&mode=orbit&card=fe', { failURL: /\.(webp|png)(\?.*)?$/ }); await p.waitForSelector('.lb-stage img', { state: 'attached' }); await p.waitForTimeout(800);
      assert.equal(await p.locator('.lb-stage img').evaluate(e => getComputedStyle(e).visibility), 'hidden');
      const [top, nav] = [await p.locator('.lb-top').boundingBox(), await p.locator('.lb-nav.prev').boundingBox()];
      assert(nav.y >= top.y + top.height, '‹ › 가 위 글 아래 ' + JSON.stringify({ top, nav })); await ctx.close();
    }
    // 긴 길 표시(B9) — 덮개에서 길이 넘치면 끝(지금 자리)이 보이게 민다
    {
      /* 덮개 344 에선 글꼴에 따라 몇 px 넘친다 — 넘침이 확실하게 300 폭에서 본다 */
      const { page: p, ctx } = await open(br, base, '/index.html?n=c&f=diamond&card=c-diamond-drill&w=steampunk', { viewport: { width: 300, height: 882 } }); await p.waitForSelector('.lb-stage img');
      const c = await p.locator('.w-crumbs').evaluate(n => { const a = n.querySelector('[aria-current]').getBoundingClientRect(), r = n.getBoundingClientRect(); return { l: a.left - r.left, r: r.right - a.right, sw: n.scrollWidth, cw: n.clientWidth }; });
      assert(c.sw > c.cw + 20, '길이 넘친다 ' + JSON.stringify(c)); assert(c.l >= -1 && c.r >= -1, '지금 자리가 다 보인다 ' + JSON.stringify(c)); await ctx.close();
    }
    // 키로 열고 닫기(B3) — 열면 초점이 한 장 안으로, 닫으면 연 자리로
    {
      const { page: p, errors, ctx } = await open(br, base, '/index.html?n=fe&mode=list'); await p.waitForSelector('#c-fe .worlds.main button.slot');
      const opener = p.locator('#c-fe .worlds.main button.slot >> nth=0');
      await opener.evaluate(e => { e.dataset.opener = '1'; }); await opener.focus(); await p.keyboard.press('Enter');
      await p.waitForSelector('.lightbox.w-card .lb-stage img');
      await p.waitForFunction(() => !!(document.activeElement && document.activeElement.closest('.w-card')), null, { timeout: 5000 });
      await p.keyboard.press('Escape'); await p.waitForFunction(() => document.documentElement.dataset.layer === 'list');
      await p.waitForFunction(() => document.activeElement && document.activeElement.dataset.opener === '1', null, { timeout: 5000 });
      assert.deepEqual(errors, []); await ctx.close();
    }
    // 다른 화풍 그림의 한 장(A2) — 그 그림의 화풍으로 보이되 st 는 주소 · 기기 기억에 쓰지 않는다: 목록의 화풍 고르개 · 생성기 링크 그대로
    {
      const fam = D.nations.flatMap(n => n.families.map(f => [n, f])).find(([n, f]) => anyPic(n.key + '-' + f.key) && f.citizens.some(c => anyPic(n.key + '-' + f.key + '-' + c.key) && !stylePic(n.key + '-' + f.key + '-' + c.key, S.default)));
      const [an, af] = fam, ac = an.key + '-' + af.key + '-' + af.citizens.find(c => anyPic(an.key + '-' + af.key + '-' + c.key) && !stylePic(an.key + '-' + af.key + '-' + c.key, S.default)).key;
      const { page: p, errors, ctx } = await open(br, base, '/index.html?n=' + an.key + '&f=' + af.key); await p.waitForSelector('.w-hero');
      await p.click('.w-cit[data-c="' + ac + '"]'); await p.waitForSelector('.lb-stage img');
      assert.doesNotMatch(p.url(), /[?&]st=/, '한 장이 st 를 주소에 쓰지 않는다');
      for (const l of ['family', 'orbit']) { await p.goBack(); await p.waitForFunction(x => document.documentElement.dataset.layer === x, l, { timeout: 5000 }); }
      await p.click('.w-mode [data-mode="list"]'); await p.waitForSelector('#dex-style');
      assert.equal(await p.inputValue('#dex-style'), S.default, '목록의 화풍 고르개 그대로');
      assert((await p.locator('a.slot').count()) > 0, '생성기 링크 그대로');
      assert.equal(await p.evaluate(() => (JSON.parse(localStorage.getItem('element_dex_v1') || '{}').st) || ''), '', '기기 기억에도 쓰지 않는다');
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
    await p.evaluate(() => localStorage.removeItem('element_dex_v1'));   // 위에서 주소로 준 화풍(st=)의 기억을 지우고 — 옛 한 장 주소는 st 없이 온다
    await p.goto(base + '/gallery.html?n=h&f=' + fam.key + '&c=' + cit + '&w=mecha&v=1'); await p.waitForSelector('.lb-stage img');
    assert.match(await p.locator('.w-lore').textContent(), new RegExp(fam.ko), '주민 글 판 — 가문');
    for (const l of ['family', 'orbit', 'table']) { await p.goBack(); await p.waitForFunction(x => document.documentElement.dataset.layer === x, l); }
    await p.goto(base + '/gallery.html'); await p.waitForSelector('.w-table');
    /* 옛 전시관 첫 주소 → 주기율표. 위 옛 한 장 주소가 준 세계(w=mecha)는 기억되지만, 그림의 화풍은 기억되지 않는다(A2) */
    assert.equal(new URL(p.url()).pathname, '/index.html'); assert.equal(new URL(p.url()).search, '?w=mecha', '옛 전시관 첫 주소 → 주기율표');
    assert(await noOverflow(p)); assert.deepEqual(errors, []);
    // WIDE — 한 장 열고 넘침 · 오류, 글 판은 그림 옆
    const w = await open(br, base, '/index.html?n=fe&mode=orbit&card=fe', { viewport: WIDE }); await w.page.waitForSelector('.lb-stage img');
    const [img, lore] = [await w.page.locator('.lb-stage').boundingBox(), await w.page.locator('.w-lore').boundingBox()];
    assert(lore.x >= img.x + img.width - 1, '넓으면 글 판이 옆');
    assert(await noOverflow(w.page)); assert.deepEqual(w.errors, []); await shot(w.page, 'card-wide'); await w.ctx.close();
    /* 세계 안에서만 넘긴다 · 안 사는 세계 탭은 끈다(2026-11-12) — 산소 녹 가문의 화성(판타지 · 메카에만 산다) */
    {
      const mars = 'o-rust-mars', fan = 'o-rust-mars_fantasy_game_keyart_f.webp';
      const { page: p, errors, ctx } = await open(br, base, '/index.html?n=o&mode=list&card=' + mars + '&pic=' + fan + '&w=fantasy');
      await p.waitForSelector('.lightbox.w-card .lb-stage img');
      const tabs = () => p.locator('.w-worlds button').evaluateAll(es => es.map(e => [e.dataset.w, e.disabled, e.getAttribute('aria-pressed')]));
      assert.deepEqual(await tabs(), [['fantasy', false, 'true'], ['steampunk', true, 'false'], ['mecha', false, 'false']], '화성 — 스팀펑크 탭 꺼짐');
      const pic = () => p.evaluate(() => new URLSearchParams(location.search).get('pic'));
      const n = Number((await p.locator('.lb-n').textContent()).split('/')[1]);
      const seen = [await pic()];
      for (let i = 1; i < n; i++) { await p.keyboard.press('ArrowRight'); await p.waitForFunction(f => new URLSearchParams(location.search).get('pic') !== f, seen[seen.length - 1]); seen.push(await pic()); }
      assert.equal(n, 6, '판타지 — 세계 그림 하나 + 일상컷 다섯');
      assert(seen.every(f => f.includes('_fantasy_')), '판타지 탭에서는 판타지 그림만 — ' + seen.join(','));
      assert(seen[1].includes('casual1'), '세계 그림 다음은 그 세계의 일상컷');
      await p.keyboard.press('ArrowRight'); await p.waitForFunction(f => new URLSearchParams(location.search).get('pic') === f, fan);   /* 끝에서 처음으로 */
      /* 꺼진 탭은 눌러도 그대로 */
      await p.locator('.w-worlds button[data-w="steampunk"]').click({ force: true }).catch(() => {});
      assert.equal(await pic(), fan); assert.equal(await p.evaluate(() => new URLSearchParams(location.search).get('w')), 'fantasy');
      /* 메카 탭 — 메카 세계 그림으로, 넘기면 메카 일상컷 */
      await p.locator('.w-worlds button[data-w="mecha"]').click();
      await p.waitForFunction(() => (new URLSearchParams(location.search).get('pic') || '').includes('_mecha_game_keyart_f.webp'));
      await p.keyboard.press('ArrowRight'); await p.waitForFunction(() => /_mecha_.*casual1/.test(new URLSearchParams(location.search).get('pic') || ''));
      /* 다른 세계 그림의 주소로 오면 막대가 그 세계로 맞춘다 */
      await p.goto(base + '/index.html?n=o&mode=list&card=' + mars + '&pic=o-rust-mars_mecha_game_keyart_f.webp&w=fantasy'); await p.waitForSelector('.lightbox.w-card .lb-stage img');
      await p.waitForFunction(() => document.querySelector('.w-worlds button[data-w="mecha"]').getAttribute('aria-pressed') === 'true');
      /* 한 장을 닫으면 탭이 다시 살아난다 */
      await p.keyboard.press('Escape'); await p.waitForFunction(() => document.documentElement.dataset.layer !== 'card');
      assert((await tabs()).every(t => t[1] === false), '한 장 밖에서는 탭이 다 켜진다');
      assert.deepEqual(errors, []); await ctx.close();
    }
    console.log('PASS walk-card: 궤도 · 목록 어디서나 같은 한 장(글 판 · 홀로 · 하트) · 세계 넘기기 · 없는 세계는 글 판만 · 화풍은 층을 건너 · 옛 전시관 뒤로 가기 · 옛 전시관 첫 주소 · ' + COVER.width + ' · ' + WIDE.width + skipped);
  } finally { await br.close(); close(); }
})().catch(e => { console.error(e); process.exit(1); });
