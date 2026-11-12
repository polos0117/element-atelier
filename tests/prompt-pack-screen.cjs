/* 지시문 묶음 = 생성기 화면 — tools/prompt-pack.cjs 가 쓴 기록의 저장값(storage)을 생성기에 넣으면 화면이 같은 지시문 · 같은 파일 이름을 만든다.
   카드 하나(주민 fe-steel-sword) × 사는 세계마다 세계 그림 + 일상 일곱(계획기 tools/casual-plan.cjs — 자유 설계 칸 둘 포함), 외형 · 장면 · 덧붙임을 고친 설정으로(안 고친 세계 · 컷은 기본 설정 그대로). 틀린 설정은 안 쓴다.
   Run: ESM_DIR=<preact 가 든 node_modules> CHROMIUM_PATH=<chrome> node tests/prompt-pack-screen.cjs   (PORT 로 자리 바꾸기, 기본 8795) */
const assert = require('node:assert/strict'), http = require('node:http'), fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { chromium } = require('playwright');
const C = require('../tools/casual-plan.cjs'), K = require('../tools/prompt-pack.cjs');
const ROOT = path.resolve(__dirname, '..'), PORT = +(process.env.PORT || 8795), BASE = 'http://127.0.0.1:' + PORT;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png' };
const server = http.createServer((q, s) => {
  const p = decodeURIComponent(new URL(q.url, BASE).pathname), file = path.join(ROOT, p === '/' ? 'index.html' : p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(s);
});
(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-pack-'));
  await new Promise(r => server.listen(PORT, r));
  const br = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  try {
    let n = 0;
    /* 카드 하나(2026-11-12 검사 정리 — 전엔 근본 철도 같이 돌았다). 고친 설정이 안 닿는 세계 · 컷은 기본 설정 그대로라 기본 꼴도 같이 본다 */
    for (const [key, edit] of [['fe-steel-sword', (set, card) => {
      const w = card.worlds[0];
      set.worlds[w].look.params = { 'hair color': '#8a8f99', hairstyle: '__custom__', hairstyle_custom: 'a low braided knot' };
      set.worlds[w].notes = { custom: 'sparks drifting from a forge' }; set.worlds[w].shot = { time: 'night', pose: 'kneel' }; set.worlds[w].why = '검사';
      const c = Object.keys(set.casual)[1]; set.casual[c].custom = 'Her right hand holds the sword hilt; her left hand rests on her hip.'; set.casual[c].why = '검사'; const c2 = Object.keys(set.casual)[2]; set.casual[c2].exposure = 'low'; set.casual[c2].why = '필터 거절 뒤 노출 낮추기 검사'; set.worlds[w].look.exposure = 'moderate';
    }]]) {
      const card = C.cardOf(key), dir = path.join(tmp, key), plans = [];
      fs.mkdirSync(dir);
      for (const w of card.worlds) {
        card.world = w;
        const res = C.plan(card, [1, 2, 3, 4, 5, 6, 7], [], { seed: 21, recent: ['a test place — standing'] }), f = path.join(dir, 'plan-' + w + '.json');
        fs.writeFileSync(f, JSON.stringify({ card: key, world: w, seed: 21, tree: 2, style: C.STYLE, required: res.required, slots: [1, 2, 3, 4, 5, 6, 7], cuts: res.cuts }));
        plans.push(f);
      }
      const set = K.initSettings(card, plans);
      if (edit) edit(set, card);
      fs.writeFileSync(path.join(dir, 'settings.json'), JSON.stringify(set));
      const log = console.log; console.log = () => {};
      try { assert.equal(K.build(dir), 0, key + ' build'); } finally { console.log = log; }
      const list = K.slots(card, plans.map(f => JSON.parse(fs.readFileSync(f, 'utf8'))));
      assert.equal(list.length, card.worlds.length * 8, '세계마다 세계 그림 + 일상 일곱(2026-11-11)');
      assert.equal(list.filter(s => s.cut && s.cut.sfree).length, card.worlds.length * 2, '세계마다 자유 설계 칸 둘(옷 자유 · 갈래 자유)');
      for (const s of list) {
        const rec = JSON.parse(fs.readFileSync(path.join(dir, s.slot + '-ui.json'), 'utf8'));
        assert.equal(fs.readFileSync(path.join(dir, s.slot + '-prompt.txt'), 'utf8'), rec.prompt);
        if (edit && s.slot === Object.keys(JSON.parse(fs.readFileSync(path.join(dir, 'settings.json'), 'utf8')).casual)[2]) assert(/skin_exposure: low|, mostly covered, /.test(rec.prompt), '일상 노출 낮추기가 지시문에(짧은 판은 Outfit 줄의 「mostly covered」)');
        const ctx = await br.newContext({ viewport: { width: 1280, height: 900 } });
        await ctx.addInitScript(v => { if (!sessionStorage.getItem('__seeded')) { localStorage.setItem('element_studio_v1', v); sessionStorage.setItem('__seeded', '1'); } }, JSON.stringify(rec.storage));
        await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
        const page = await ctx.newPage();
        await page.goto(BASE + '/prompt.html?card=' + key + '&o=' + rec.storage.out + '&world=' + s.world);
        await page.waitForFunction(() => window.AtelierStudio && window.AtelierStudio.prompt && window.AtelierStudio.prompt().length > 0);
        assert.equal(await page.evaluate(() => window.AtelierStudio.prompt()), rec.prompt, key + ' ' + s.slot + ' 화면과 묶음 지시문이 다르다');
        assert.equal(await page.evaluate(() => window.AtelierStudio.state().casualN || 1), s.cut ? s.cut.n : rec.storage.casualN, key + ' ' + s.slot + ' 일상 번호');
        await ctx.close(); n++;
      }
    }
    /* 틀린 칸은 아무것도 안 쓴다 */
    const card = C.cardOf('fe'), bad = path.join(tmp, 'bad');
    fs.mkdirSync(bad);
    const set = K.initSettings(card, []);
    set.worlds.fantasy.look.params = { 'hair color': 'not-a-value' }; set.worlds.steampunk.shot = { pose: 'nope' }; set.worlds.mecha.notes = { custom: 'x' }; set.worlds.ocean = {};
    fs.writeFileSync(path.join(bad, 'settings.json'), JSON.stringify(set));
    const err = console.error, said = []; console.error = m => said.push(m);
    try { assert.equal(K.build(bad), 1); } finally { console.error = err; }
    assert(!fs.existsSync(path.join(bad, 'fantasy-prompt.txt')), '틀리면 쓰지 않는다');
    for (const re of [/hair color 의 값 not-a-value/, /shot\.pose 의 값 nope/, /worlds\.mecha 에 직접 입력/, /worlds 에 없는 칸 ocean/]) assert(said.some(m => re.test(m)), re + ' 를 알린다');
    console.log(`PASS 지시문 묶음 ↔ 생성기 화면: ${n} 자리(카드 하나 · 세계 그림 · 세계마다 일상 일곱(자유 설계 둘) · 고친 설정 하나)를 화면에 넣으면 같은 지시문 · 같은 번호 · 틀린 설정은 안 쓴다`);
  } finally { await br.close(); server.close(); fs.rmSync(tmp, { recursive: true, force: true }); }
})().catch(e => { console.error(e); process.exit(1); });
