/* 화면 검사 — 첫 화면·도감·생성기를 브라우저로 연다. 폰(390)과 PC(1280).
   첫 화면: 주기율표 118칸, 설계된 나라만 링크, 첫 묶음 카드 수 = 설계표 나라 수.
   도감: 근본 세 칸 · 가문마다 가문주 세 칸 + 주민 줄(안 사는 세계는 흐린 칸) · 같은 물질 다른 나라 링크 · 빈 자리는 생성기로.
   생성기(공방 모음 통합 생성기 꼴): 나라 › 카드 › 갈래 › 단계. 세계 그림은 세계 → 덧붙임 → 지시문. 일상컷은 트리 버전2 — 시대 → 장소 → … 한 칸씩,
   해방(트리 밖 + 까닭), 랜덤(처음부터), 여기부터 다시, 다 골랐다 결과(지시문·파일 이름), 폰은 칩 레일 + 아래 막대 + 시트. 주소 ?card=&o=. 콘솔 오류 없음. 옆으로 넘치지 않음.
   Run: ESM_DIR=<preact 가 든 node_modules> CHROMIUM_PATH=<chrome> node tests/screen.cjs   (PORT 로 자리 바꾸기, 기본 8794) */
const assert = require('node:assert/strict'), http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..'), PORT = +(process.env.PORT || 8794), BASE = 'http://127.0.0.1:' + PORT;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.md': 'text/markdown', '.webp': 'image/webp', '.png': 'image/png' };
const server = http.createServer((q, s) => {
  const p = decodeURIComponent(new URL(q.url, BASE).pathname), file = path.join(ROOT, p === '/' ? 'index.html' : p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(s);
});
const ESM = { 'https://esm.sh/preact@10.24.3': 'preact/dist/preact.mjs', 'https://esm.sh/preact@10.24.3/hooks': 'preact/hooks/dist/hooks.mjs' };
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/element-design.json'), 'utf8'));
const S = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/style.json'), 'utf8'));
const IMGJ = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/img.json'), 'utf8'));

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const br = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  let checks = 0;
  const open = async (url, viewport) => {
    const ctx = await br.newContext({ viewport });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => {
      const file = process.env.ESM_DIR && ESM[r.request().url().split('?')[0]];
      if (!file || !fs.existsSync(path.join(process.env.ESM_DIR, file))) return r.abort();
      return r.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(process.env.ESM_DIR, file), 'utf8').replace(/from"preact"/g, 'from"https://esm.sh/preact@10.24.3"') });
    });
    const page = await ctx.newPage(), errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await page.goto(BASE + url); return { ctx, page, errors };
  };
  const noOverflow = async (page, w) => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), w + ' 옆으로 넘친다');
  const state = pg => pg.evaluate(() => window.AtelierStudio.state());
  const openOf = async pg => (await state(pg)).open;
  const promptOf = pg => pg.evaluate(() => window.AtelierStudio.prompt());
  /* 폰은 🎲 메뉴 안, PC 는 판 밑 — 같은 data-* */
  const menu = async pg => { const m = pg.locator('[data-menu="rand"]'); if (await m.count()) await m.click(); };
  const randAll = async (pg, k) => { await menu(pg); await pg.click('[data-rand-all="' + k + '"]'); };
  /* 다 골랐다로 — 「다 골랐다로」 단추가 있으면 그것(PC 판 밑 · 폰 🎲 메뉴), 없으면 남은 칸(골라도 되는 칸)을 다음·건너뛰기로 넘긴다 */
  const toDone = async pg => {
    for (let i = 0; i < 12 && (await openOf(pg)) !== 'done'; i++) {
      if (await pg.locator('#panel [data-open="done"]').count()) { await pg.click('#panel [data-open="done"]'); continue; }
      const m = pg.locator('[data-menu="rand"]');
      if (await m.count()) { await m.click(); if (await pg.locator('#hbar .hmenu [data-open="done"]').count()) { await pg.click('#hbar .hmenu [data-open="done"]'); continue; } await m.click(); }
      const nx = pg.locator('#hbar [data-skip], #hbar [data-next], #panel [data-next]').first();
      assert(await nx.count(), '넘길 단추가 없다 — ' + (await openOf(pg)));
      await nx.click();
    }
    assert.equal(await openOf(pg), 'done', '다 골랐다에 못 갔다');
  };

  for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
    const mob = vp.width <= 768;
    /* 첫 화면 */
    let v = await open('/index.html', vp);
    await v.page.waitForSelector('.pcell');
    assert.equal(await v.page.locator('.pcell').count(), 118, '주기율표 118칸');
    assert.equal(await v.page.locator('a.pcell').count(), D.nations.length, '설계된 나라만 링크');
    assert.equal(await v.page.locator('.nation-card').count(), D.nations.length, '첫 묶음 카드');
    await noOverflow(v.page, vp.width); assert.deepEqual(v.errors, []); checks += 3; await v.ctx.close();

    /* 도감 — 철(2026-10-31 판): 위에 붙는 판(보기·세계·바로 가기·즐겨찾기) · 카드마다 세계 그림만 펴고 일상컷·다른 화풍은 접는다 · 크게 보기 넘기기·하트 */
    v = await open('/dex.html?nation=fe', vp);
    await v.page.waitForSelector('.dex-head');
    const pg = v.page, fe = D.nations.find(n => n.key === 'fe'), fams = fe.families.length, cit = fe.families.reduce((s, f) => s + f.citizens.length, 0);
    const feCards = ['fe', ...fe.families.flatMap(f => ['fe-' + f.key, ...f.citizens.map(c => 'fe-' + f.key + '-' + c.key)])];
    /* 등록부에서 센다 — 기본 화풍 밖 세계 그림(다른 화풍), 일상컷(세계 몫 + 화풍 몫의 옛 시안) */
    const bs = k => (IMGJ.img[k] || {}).byStyle || {};
    const altN = k => Object.entries(bs(k)).filter(([st]) => st !== S.default).reduce((n, [, b]) => n + Object.values(b.byForm || {}).filter(f => f.f).length, 0);
    const casN = (k, w) => Object.values(bs(k)).reduce((n, b) => n + Object.entries(b.byForm || {}).filter(([wk]) => !w || wk === w).reduce((x, [, f]) => x + (((f.casual || {}).f) || []).length, 0) + (w ? 0 : (((b.casual || {}).f) || []).length), 0);
    assert.equal(await pg.locator('.worlds.main .slot').count(), 3 + fams * 3 + cit * 3, '세계 그림 칸 — 근본 3 + 가문주 3×' + fams + ' + 주민 3×' + cit);
    const dead = fe.families.reduce((s, f) => s + f.citizens.reduce((x, c) => x + (3 - c.worlds.length), 0), 0);
    assert.equal(await pg.locator('.slot.dead').count(), dead, '안 사는 세계는 작고 흐린 칸');
    if (dead) assert((await pg.locator('.slot.dead').first().boundingBox()).height < 110, '흐린 칸은 작다');
    assert.equal(await pg.locator('.worlds.alt, .worlds.casuals').count(), 0, '세계 그림 보기 — 일상컷·다른 화풍은 접혀 있다');
    assert.equal(await pg.locator('.toc-jump .jump').count(), 1 + fams + cit, '바로 가기 칩 — 근본·가문주·주민');
    /* 접은 단추 — 근본의 다른 화풍 · 일상컷 */
    if (altN('fe')) { assert.match(await pg.locator('#c-fe [data-more="alt"]').textContent(), new RegExp(String(altN('fe')))); await pg.click('#c-fe [data-more="alt"]'); assert.equal(await pg.locator('#c-fe .worlds.alt .slot').count(), altN('fe'), '다른 화풍 펼치기'); }
    await pg.click('#c-fe [data-more="casual"]'); assert.equal(await pg.locator('#c-fe .worlds.casuals .slot').count(), casN('fe'), '일상컷 펼치기');
    const capH = await pg.locator('#c-fe .worlds.casuals .slot .cap').first().evaluate(e => e.getBoundingClientRect().height);
    assert(capH < 40, '일상컷 이름은 한 줄(세로로 쌓이지 않는다 — 여백 포함) ' + capH);
    assert.match(await pg.locator('#c-fe .worlds.casuals .slot .cap').first().textContent(), /^(판타지|스팀펑크|메카|시안) \d+$/, '이름은 「판타지 1」 꼴');
    /* 바로 가기 — 누르면 그 카드가 위 판 바로 아래로 */
    const far = feCards[Math.floor(feCards.length / 2)];   // 맨 끝 카드는 페이지가 끝나 위로 못 올라온다 — 가운데
    await pg.click('[data-jump="' + far + '"]'); await pg.waitForTimeout(900);
    const top = await pg.evaluate(k => { const el = document.getElementById('c-' + k), toc = document.querySelector('.dex-toc'); return { card: el.getBoundingClientRect().top, toc: toc.getBoundingClientRect().bottom }; }, far);
    assert(top.card >= top.toc - 20 && top.card < top.toc + 160, '바로 가기 ' + JSON.stringify(top));
    /* 보기 — 일상컷 + 메카: 세계 그림은 없고 메카 일상컷만 */
    await pg.click('[data-view="casual"]'); await pg.click('[data-wf="mecha"]');
    assert.equal(await pg.locator('.worlds.main').count(), 0, '일상컷 보기엔 세계 그림이 없다');
    assert.equal(await pg.locator('.worlds.casuals .slot').count(), feCards.reduce((n, k) => n + casN(k, 'mecha'), 0), '메카 일상컷 수');
    assert.deepEqual([...new Set((await pg.locator('.worlds.casuals .slot .cap').allTextContents()).map(t => t.split(' ')[0]))], ['메카'], '메카만');
    assert.match(pg.url(), /view=casual/); assert.match(pg.url(), /w=mecha/);
    /* 전부 — 다른 화풍 줄도 펼친다 */
    await pg.click('[data-view="all"]'); await pg.click('[data-wf="all"]');
    assert.equal(await pg.locator('.worlds.alt').count(), feCards.filter(k => altN(k)).length, '전부 보기 — 다른 화풍 줄');
    await pg.click('[data-view="world"]');
    /* 크게 보기 — 넘기기 · 하트(공방 모음 즐겨찾기 a: element) · Esc */
    await pg.click('[data-jump="fe"]'); await pg.waitForTimeout(500);
    await pg.click('#c-fe .worlds.main .slot >> nth=0');
    await pg.waitForSelector('.lightbox');
    const total = await pg.locator('.lightbox .lb-n').textContent();
    assert.match(total, /^1 \/ \d+$/, '몇 번째 ' + total);
    await pg.keyboard.press('ArrowRight'); assert.match(await pg.locator('.lightbox .lb-n').textContent(), /^2 \//, '→ 다음');
    await pg.keyboard.press('ArrowLeft'); await pg.keyboard.press('ArrowLeft'); assert.equal(await pg.locator('.lightbox .lb-n').textContent(), total.replace(/^1 /, total.split(' / ')[1] + ' '), '← 처음에서 끝으로');
    await pg.click('#dex-fav');
    const favs = await pg.evaluate(() => JSON.parse(localStorage.getItem('atelier_favorites_v1') || '[]'));
    assert(favs.length === 1 && favs[0].a === 'element' && favs[0].key === 'fe' && /\/dex\.html\?nation=fe&card=fe&pic=/.test(favs[0].link) && /^https:\/\//.test(favs[0].thumb), '하트 — 즐겨찾기 칸 ' + JSON.stringify(favs[0]));
    assert.equal(await pg.locator('#dex-fav').getAttribute('aria-pressed'), 'true');
    assert.match(await pg.locator('#dex-fav-count').textContent(), /즐겨찾기 1/, '즐겨찾기 수');
    assert.equal(await pg.locator('#dex-fav-count').getAttribute('href'), '/favorites.html', '공방 모음 즐겨찾기로');
    await pg.keyboard.press('Escape'); assert.equal(await pg.locator('.lightbox').count(), 0, 'Esc');
    await noOverflow(pg, vp.width); assert.deepEqual(v.errors, []); checks += 20;
    /* 공방 모음 즐겨찾기의 link 로 다시 오면 그 그림이 열린다 */
    const pic = favs[0].file; await v.ctx.close();
    v = await open(favs[0].link.replace(/^.*dex\.html/, '/dex.html'), vp); await v.page.waitForSelector('.lightbox img');
    assert((await v.page.locator('.lightbox img').getAttribute('src')).endsWith(pic), '즐겨찾기 link 가 그 그림을 연다');
    assert.deepEqual(v.errors, []); checks += 1; await v.ctx.close();
    /* 빈 자리는 생성기로 — 그림이 없는 (카드, 세계) 하나를 등록부에서 찾아(나라 차례대로 — 그림이 차면 자리가 옮겨 간다) 그 나라 도감에서 본다 */
    const holes = D.nations.flatMap(n => [n.key, ...n.families.flatMap(f => [n.key + '-' + f.key, ...f.citizens.map(c => n.key + '-' + f.key + '-' + c.key)])].flatMap(k => {
      const fam = n.families.find(f => k.split('-')[1] === f.key), cit = fam && fam.citizens.find(c => k.split('-')[2] === c.key);
      const ws = cit ? cit.worlds : ['fantasy', 'steampunk', 'mecha'], have = (((IMGJ.img[k] || {}).byStyle || {})[S.default] || {}).byForm || {};
      return ws.filter(w => !(have[w] && have[w].f)).map(w => [n.key, k, w]);
    }));
    assert(holes.length, '빈 자리가 하나도 없다 — 이 검사를 다시 생각할 때');
    v = await open('/dex.html?nation=' + holes[0][0], vp); await v.page.waitForSelector('.dex-head');
    assert((await v.page.locator('a.slot[href^="prompt.html?card=' + holes[0][1] + '&world=' + holes[0][2] + '"]').count()) >= 1, '빈 자리는 생성기로 ' + holes[0]);
    assert.deepEqual(v.errors, []); checks += 1; await v.ctx.close();
    v = await open('/dex.html?nation=h', vp); await v.page.waitForSelector('.dex-head');
    assert.equal(await v.page.locator('.row-head .shared a[href="dex.html?nation=o"]').count(), 1, '물 가문은 산소나라와 나눈다');
    assert.deepEqual(v.errors, []); checks += 1; await v.ctx.close();

    /* 생성기 — 세계 그림: 주소대로 카드·세계 → 덧붙임 → 다 골랐다 */
    v = await open('/prompt.html?card=fe-steel-sword&o=world&world=mecha', vp);
    const p = v.page; await p.waitForSelector('.hchip');
    assert.equal(await openOf(p), 'world', '처음 밟는 갈래는 첫 단계부터(세계는 주소대로 눌려 있다)');
    assert.equal(await p.locator('#panel .opt[data-pick="mecha"][aria-pressed="true"]').count(), 1, '주소의 세계가 눌려 있다');
    await p.click('#panel .opt[data-pick="mecha"]'); assert.equal(await openOf(p), 'scene', '세계 다음 장면');
    /* 장면 — 세계 글대로 + 설계표 scenes, 시간대 고르개. 자세·표정 — 카드 자세 + 자세 일곱, 표정 고르개 */
    assert.equal(await p.locator('#panel .opt[data-pick]').count(), 1 + D.nations.find(n => n.key === 'fe').worlds.mecha.scenes.length, '장면 선택지');
    await p.selectOption('#panel select[data-shot="time"]', 'night');
    await p.click('#panel .opt[data-pick="foundry"]'); assert.equal(await openOf(p), 'pose', '장면 다음 자세');
    assert.match(await p.locator('.hchip[data-open="scene"]').textContent(), /궤도 주조소 · 밤/, '장면 칩');
    await p.selectOption('#panel select[data-shot="expr"]', 'confident');
    await p.click('#panel .opt[data-pick="stride"]'); assert.equal(await openOf(p), 'design', '자세 다음 설계 줄');
    assert.equal(await p.locator('.hchip[data-open="world"]').count(), 1, '세계 칩');
    /* 설계 줄 — 실루엣·얼굴 싣기 체크(설계표 look 값 목록), 노출. 얼굴을 끄면 FACE 줄이 빠진다 */
    assert.equal(await p.locator('#panel [data-lookcheck]').count(), 2, '실루엣·얼굴 싣기');
    assert((await p.locator('#panel .design-list').first().textContent()).includes('mirror-polished steel-silver'), '설계표 머리색(검 주민 — 물건 재질)이 목록에');
    await p.selectOption('#panel select[data-exposure]', 'moderate');
    await p.uncheck('#panel [data-lookcheck="face"]');
    if (mob) await p.click('#hbar [data-next="design"]'); else await p.click('[data-next="design"]');
    assert.equal(await openOf(p), 'look', '설계 줄 다음 외형');
    assert.equal(await p.locator('#panel details.grp').count(), 4, '외형 네 묶음');
    await p.evaluate(() => { document.querySelector('#panel details.grp[data-grp="hair"]').open = true; });   // 머리 묶음은 접혀 있다
    await p.selectOption('#panel select[data-param="hair color"]', 'silver');
    if (mob) await p.click('#hbar [data-next="look"]'); else await p.click('[data-next="look"]');
    assert.equal(await openOf(p), 'notes', '외형 다음 덧붙임');
    assert.match(await p.locator('.hchip[data-open="look"]').textContent(), /1칸/, '외형 칩');
    await p.fill('textarea[data-note="scene"]', 'a windy ridge');
    if (mob) await p.click('#hbar [data-next="notes"]'); else await p.click('[data-next="notes"]');
    assert.equal(await openOf(p), 'done');
    let t0 = await promptOf(p);
    assert(t0.startsWith('CONCEPT: a citizen of the Iron Nation, of the Steel House.') && t0.includes('MECHA DESIGN:') && t0.includes('SCENE NOTE: a windy ridge'), '세계 지시문');
    assert(t0.includes('EXPOSURE (moderate)') && !t0.includes('FACE (') && t0.includes('SILHOUETTE: ') && !t0.includes('tempered-blue') && t0.includes('hair color: silver'), '설계 줄·외형 칸이 지시문에 ' + t0.slice(0, 150));
    assert(t0.includes('SETTING (this card): the orbital foundry floor') && t0.includes('TIME & WEATHER: night') && t0.includes('Mid-stride toward the camera') && t0.includes('EXPRESSION: level brow'), '장면·시간대·자세·표정이 지시문에');
    assert((await p.locator(mob ? '.hres .file' : '#file-name').textContent()).includes('fe-steel-sword_mecha_' + S.default + '_f.webp'), '파일 이름');
    await p.click('[data-open="world"]'); await p.click('[data-pick="fantasy"]');
    assert.equal(await openOf(p), 'scene', '다 고른 뒤 고쳐도 바로 다음 칸(건너뛰지 않는다)');
    await toDone(p); assert.equal(await openOf(p), 'done', '「다 골랐다로」');
    assert(!(await promptOf(p)).includes('MECHA DESIGN') && (await promptOf(p)).includes('FACE (') && !(await promptOf(p)).includes('hair color: silver') && !(await promptOf(p)).includes('SETTING (this card)') && (await promptOf(p)).includes('Standing, card-ready pose'), '세계가 바뀌면 외형·장면 칸도 그 세계 것(판타지는 아직 설계표대로)');
    assert.match(p.url(), /card=fe-steel-sword&o=world&world=fantasy/, '주소에 적힌다');
    checks += 20;

    /* 갈래 → 일상컷(버전2): 세계(참고 그림이 되는 세계 그림 — 세계 그림 갈래에서 고른 판타지가 눌려 있다)부터 한 칸씩 */
    await p.click('[data-open="out"]'); await p.click('[data-out="casual"]');
    assert.equal(await openOf(p), 'world', '일상컷은 참고 그림의 세계부터');
    assert.equal(await p.locator('#panel .opt[data-pick="fantasy"][aria-pressed="true"]').count(), 1, '세계 그림 갈래에서 고른 세계가 눌려 있다');
    assert.match(await p.locator('#panel .note').first().textContent(), /참고 그림/, '세계 칸의 안내가 참고 그림을 말한다');
    await p.click('#panel .opt[data-pick="mecha"]'); assert.equal(await openOf(p), 'era', '세계 다음 시대');
    await p.click('[data-pick="now"]'); assert.equal(await openOf(p), 'place', '다음은 장소');
    assert((await p.locator('#panel .opt[data-pick]').count()) > 20, '장소 목록');
    const placeKey = await p.locator('#panel .opt[data-pick]:not([data-out])').first().getAttribute('data-pick');
    await p.click('#panel .opt[data-pick="' + placeKey + '"]'); assert.equal(await openOf(p), 'weather', '다음은 계절·날씨');
    await p.click('#panel .opt[data-pick=""]'); assert.equal(await openOf(p), 'time', '날씨 다음 시간대');
    await p.click('#panel .opt[data-pick="neon"]'); assert.equal(await openOf(p), 'ofam');
    await p.click('#panel .opt[data-pick="everyday"]'); assert.equal(await openOf(p), 'item');
    await p.click('#panel .opt[data-pick=""]'); assert.equal(await openOf(p), 'hair', '옷 다음 머리 변화');
    assert.match(await p.locator('#panel .opt[data-pick=""]').textContent(), /그대로/, '머리 그대로가 첫 선택지');
    await p.click('#panel .opt[data-pick="tied"]'); assert.equal(await openOf(p), 'preset', '머리 다음 자세 추천');
    /* 추천 하나 → 몸 쪽이 다 차고 시선으로 뛴다 */
    const presetKey = await p.locator('#panel .opt[data-pick]:not([data-out])').nth(1).getAttribute('data-pick');
    await p.click('#panel .opt[data-pick="' + presetKey + '"]');
    let sc = (await state(p)).scene;
    assert(sc.posture && sc.support && sc.frame && sc.body && sc.head && sc.camera, '추천이 몸 쪽을 채웠다 ' + JSON.stringify(sc));
    assert(['gaze', 'legs', 'expr', 'notes', 'use'].includes(await openOf(p)), '추천 뒤 열린 칸 ' + (await openOf(p)));
    assert.equal(await p.locator('.hchip[data-open="posture"]').count(), 1, '몸 자세 칩이 찼다');
    /* 해방 — 몸 자세에서 트리 밖이 흐리게, 까닭이 붙는다 */
    await p.click('[data-open="posture"]');
    const unlock = p.locator('#unlock'); if (await unlock.count()) { await unlock.check(); assert((await p.locator('#panel .opt.out .why').count()) >= 1, '트리 밖 까닭'); await unlock.uncheck(); }
    await toDone(p);
    assert.equal(await openOf(p), 'done');
    /* 덧붙임 칸의 두 축 — 기본은 고정값(가장 강함·많이), 바꾸면 지시문이 따라오고 칩에 보인다 */
    await p.click('[data-open="notes"]');
    assert.equal(await p.locator('#panel select[data-axis]').count(), 2, '전체 강도·피부 노출 고르개');
    assert.equal(await p.locator('#panel select[data-axis="skin_exposure"]').inputValue(), 'bold', '기본은 고정값');
    await p.selectOption('#panel select[data-axis="skin_exposure"]', 'moderate');
    assert.match(await p.locator('.hchip[data-open="notes"]').textContent(), /보통/, '덧붙임 칩에 축');
    assert((await promptOf(p)).includes('skin_exposure: moderate — '), '바꾼 축이 지시문에');
    await p.selectOption('#panel select[data-axis="skin_exposure"]', 'bold');
    await toDone(p); assert.equal(await openOf(p), 'done');
    const t1 = await promptOf(p);
    assert(t1.includes('POSTURE') && t1.includes('1024') && /overall_intensity: strong/.test(t1) && t1.startsWith('INPUT: the attached image is the approved character — her Mecha card'), '일상컷 지시문 ' + t1.slice(0, 200));
    assert(t1.includes('Time of day: night under neon') && t1.includes('Hair: her hair tied up'), '시간대·머리가 일상컷 지시문에');
    assert.match(await p.locator('.hchip[data-open="time"]').textContent(), /네온 밤/, '시간대 칩'); assert.match(await p.locator('.hchip[data-open="hair"]').textContent(), /묶음/, '머리 칩');
    /* 손에 드는 그 원소의 물건 — 오른손을 「소품 동작」 으로 하면 소품 동작 칸에 「그 물건을 든다」 가 보인다(검의 주민은 검) */
    await p.click('[data-open="right"]'); await p.click('#panel .opt[data-pick="prop"]'); assert.equal(await openOf(p), 'left', '오른손 다음 왼손');
    await p.click('#panel .opt[data-pick=""]'); assert.equal(await openOf(p), 'use', '소품 동작 칸');
    if (!(await p.locator('#panel .opt[data-pick^="sig_"]').count()) && mob) { await p.click('#panel [data-gtab=""]'); }
    assert((await p.locator('#panel .opt[data-pick^="sig_"]').count()) >= 1, '그 물건을 드는 동작 선택지(컷에 맞는 꼴 — 얼굴 클로즈업이면 얼굴 옆에)');
    await p.click('#panel .opt[data-pick^="sig_"]'); await toDone(p);
    assert(/PROP: with her own right hand she holds a forged/.test(await promptOf(p)), '검의 주민이 검을 든다 ' + ((await promptOf(p)).split('PROP: ')[1] || '').slice(0, 80));
    assert((await p.locator(mob ? '.hres .file' : '#file-name').textContent()).includes('fe-steel-sword_mecha_' + S.default + '_f_casual1.webp'), '일상컷 파일 이름(세계를 탄다)');
    const refT = await p.locator(mob ? '.hres .ref' : '#ref .ref').textContent();
    /* 등록돼 있으면 작은 그림, 없으면 「아직 없다」 — 등록부를 보고 판정한다(그림이 차면 바뀐다) */
    const refHave = !!((((((IMGJ.img['fe-steel-sword'] || {}).byStyle || {})[S.default] || {}).byForm || {}).mecha || {}).f);
    assert(refT.includes('fe-steel-sword_mecha_' + S.default + '_f.webp') && /아직 없다/.test(refT) === !refHave, '참고 그림 줄 — 그 세계 그림 이름, 등록 ' + refHave + ' ' + refT);
    assert.equal(await p.locator((mob ? '.hres' : '#ref') + ' .ref img').count(), refHave ? 1 : 0, '등록된 참고 그림은 작은 그림으로');
    assert.match(p.url(), /card=fe-steel-sword&o=casual&world=mecha/, '일상컷도 주소에 세계');
    checks += 28;
    /* 랜덤 처음부터 — 다 찬다. 여기부터 다시 — 장소를 열면 뒤가 빈다 */
    await randAll(p, 'world');
    assert.equal(await openOf(p), 'done', '랜덤 뒤 다 골랐다');
    sc = (await state(p)).scene; assert(sc.era && sc.place && sc.ofam && sc.posture && sc.frame, '랜덤이 다 채운다');
    await p.click('[data-open="place"]'); await menu(p); await p.click('[data-restart="place"]');
    sc = (await state(p)).scene; assert.equal(await openOf(p), 'place'); assert(!sc.posture && !sc.frame && sc.era && sc.place, '뒤 칸을 비웠다 ' + JSON.stringify(sc));
    assert.match(await p.locator('#status').textContent(), /여기부터 다시/);
    await randAll(p, 'place'); assert.equal(await openOf(p), 'done');
    /* 처음부터 다시 — 카드·갈래는 그대로 */
    await p.click('[data-reset]'); assert.equal(await openOf(p), 'world'); sc = (await state(p)).scene; assert(!sc.place && !sc.posture && !(await state(p)).world, '모든 칸을 비웠다(세계도)');
    await randAll(p, 'world'); assert((await state(p)).world && (await state(p)).scene.era, '랜덤이 세계도 채운다'); await p.click('[data-reset]'); await randAll(p, 'world');
    assert.equal((await state(p)).card, 'fe-steel-sword'); assert.equal((await state(p)).out, 'casual');
    /* 폰 — 레일 한 줄·아래 막대·시트 */
    if (mob) {
      await randAll(p, 'world');
      const mb = await p.evaluate(() => { const hb = document.getElementById('hbar'), r = hb.getBoundingClientRect(); return { rail: document.querySelector('.hrail') ? document.querySelector('.hrail').getBoundingClientRect().height : 0, barIn: !hb.hidden && r.bottom <= innerHeight + 0.5, path: document.querySelectorAll('.hpath .hcrumb').length, hres: !!document.querySelector('.hres') }; });
      assert(mb.rail > 0 && mb.rail <= 60, '칩 레일 한 줄 ' + mb.rail); assert(mb.barIn, '아래 막대'); assert.equal(mb.path, 3, '경로 나라·카드·갈래'); assert(mb.hres, '결과 상자');
      await p.click('[data-open="world"]'); await p.click('#hbar [data-act="sheet"]'); assert((await p.locator('#hsheet textarea').inputValue()).length > 200, '시트에 지시문'); await p.click('#hsheet [data-act="sheet-close"]');
      checks += 3;
    }
    /* 새로 고쳐도 남는다 */
    await p.reload(); await p.waitForSelector('.hchip');
    assert.equal((await state(p)).card, 'fe-steel-sword'); assert.equal((await state(p)).out, 'casual');
    await noOverflow(p, vp.width); assert.deepEqual(v.errors, []); checks += 6; await v.ctx.close();
  }
  await br.close(); server.close();
  console.log('PASS 화면: 첫 화면(주기율표 118·나라 링크·첫 묶음) · 도감(세 층·흐린 칸·겹치는 가문·빈 자리→생성기) · 생성기(세계 그림·일상컷 버전2 한 칸씩·자세 추천·해방·랜덤·여기부터 다시·처음부터·주소·저장·폰 레일/막대/시트) · 폰·PC — ' + checks + '가지');
})().catch(e => { console.error(e); server.close(); process.exit(1); });
