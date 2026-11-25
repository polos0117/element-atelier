#!/usr/bin/env node
/* 일상컷 색인 — 그림 저장소 records 의 일상컷 기록과 그 카드 · 세계의 계획 파일을 읽어 data/casual-index.json 을 쓴다(그림은 읽지 않는다).
   2026-11-17 사용자 「저거를 목록을 두고 확인할 수 있는 방법은 없을까? 위치는 허브가 좋을거 같은데, 허브에서 간단하게만. 필수컷 만들 때 뜬 갈래랑 의상이랑,
   게임코스튬 때 쓴 게임, 케릭터, 의상갈래 정도만 알 수 있으면 좋겠는데」 → 「응 그렇게 진행해줘. 우리쪽에서 고르는건 한글로 표시되게 해줘. gpt 쪽은 영어로 설계하니까 그건 어쩔 수 없이 놔두고」.
   세 공방(삼국지 · 원소 · pkm)이 같은 꼴을 쓰고 허브 casual.html 이 그 꼴만 읽는다:
     { version: 1, atelier: "element", built, source: [그림 저장소], rows: [{ card, name, world, worldKo, n, date, style, path, required, requiredKo,
       family, familyKo, item, itemKo, shade, shadeKo, cosplay: null|{ game, gameKo, character, characterKo, cut, cutKo, by, round }, free: null|{ kind, kindKo, outfit } }] }
     s(2026-11-25, 있을 때만 — 장면 풀이: 장소 · 하는 일 · 구도 + 더 보기 칸, 빈 칸은 뺀다)는 tools/casual-detail.cjs(네 공방 같은 파일)가 짓는다.
   - 기록: records/<카드>/<세계>-casualN.<화풍>-ui.json(옛 세계 없는 casualN.<화풍>-ui.json 도). 같은 카드 · 세계 · 번호 · 화풍의 곁가지(-ui 앞뒤에 꼬리가 붙은 것 — 다시 그림 · 막힘 · bold …)는
     한 컷으로 합친다(꼬리 없는 것이 먼저, 없으면 날짜 늦은 것). history · revisions 같은 아래 폴더는 안 본다.
   - 필수: 그 컷이 든 계획 파일(<세계>-casual-plan*.json · casualN-replan …, 화풍이 같은 것 — 장면이 맞는 것 · 다시 짠 것 · 지난 판이 아닌 것 먼저)의 required 글에 그 컷의 갈래가 있으면.
     노출 갈래(란제리풍 · 수영복 · 역할극) · 나라 안 · 게임 코스프레(늘 필수) · 상황 노출(코스프레가 없던 옛 묶음 — 그때 셋째 필수) · 캐릭터만의 컷(90번, own).
     계획 파일이 없는 컷은 장면으로만 가린다(계획기의 requiredType).
   - 한글: 우리가 고른 값(갈래 · 의상 · 옷 색 shade · 게임 · 재단 · 세계 · 카드 이름)은 표의 ko. 캐릭터는 목록의 characters[].ko → 주인공 하나 게임은 character_ko → 없으면 null.
     GPT 가 지은 것(자유 설계 칸의 Outfit 줄, 옛 pick 칸에서 GPT 가 고른 캐릭터 이름)은 기록의 영어 그대로.
   - rows 는 날짜 새것 먼저(같으면 카드 · 세계 · 번호 · 화풍). 내용이 같으면 파일을 다시 쓰지 않는다(built 가 바뀌어 등록 워크플로가 헛커밋하지 않게).

     node tools/casual-index.cjs [--img <그림 저장소>] [--out <파일>|-] [--check]
       --img    기본 옆의 ../element-atelier-img(기록 · 계획은 첫 저장소에만 — IMAGE_RULES 3절)
       --out -  파일 대신 표준 출력, --check 는 쓰지 않고 수만 */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-element.js']) vm.runInContext(read(f), ctx);
const T = ctx.window.AtelierSpec, CT = ctx.window.AtelierCasualTree, P = ctx.window.AtelierPrompt;
const D = JSON.parse(read('data/element-design.json')), S = JSON.parse(read('data/style.json')), tree = JSON.parse(read('data/casual-tree.json'));
const CP = require('./casual-plan.cjs');
const COSPLAY = CP.COSPLAY;
const DETAIL = require('./casual-detail.cjs')(ROOT);   /* 장면 풀이 s(2026-11-25 — 크게 보기 둘째 줄 · 더 보기) */

const ATELIER = 'element', IMG_DEFAULT = path.join(ROOT, '..', 'element-atelier-img');
const STYLES = new Set(Object.keys(S.styles || {}));
/* 기록 이름 — <세계>-casualN.<화풍>[꼬리]-ui[꼬리].json. 화풍 열쇠엔 . - 가 없다 */
const REC = /^(?:([a-z]+)-)?casual(\d+)\.([a-z0-9_]+)((?:[.-][a-z0-9_]+)*)-ui((?:[.-][a-z0-9_-]+)*)\.json$/;
/* 계획 파일 — 계획기(casual-plan.cjs)의 PLAN_FILE 과 같은 꼴 + 앞에 화풍이 붙은 꼴(<세계>.<화풍>-casual-plan…) */
const PLAN = /casual\d*[-.](?:re)?plan(?:ned)?\b[^/]*\.json$/, PLAN_OLD = /original|initial|before/;
const EXPOSE = CP.EXPOSE_TYPES;
const KIND_KO = { ofree: '옷 자유', gfree: '갈래 자유', sfree: '장면 자유', xfree: '상황 자유' };

const trim = s => String(s == null ? '' : s).trim();
const normName = s => trim(s).toLowerCase().replace(/\s+/g, ' ');   /* 계획기의 이름 고르기와 같다 — 대소문자 · 빈칸 무시 */
const readJSON = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } };
const nz = v => (v == null || v === '' ? null : v);

/* 한글 표 */
const worldKo = w => ((T.WORLDS || []).find(x => x.key === w) || {}).ko || '';
const cardKo = key => { const c = P.card(D, key); return c ? c.ko : key; };
const famKo = k => k ? (((CT.family(tree, k)) || {}).ko || null) : null;
/* 실루엣 갈래(2026-11-25 사용자 「실루엣 갈래도 색인에 넣어줘」) — 옷의 cls(수영복 · 란제리 · 역할극 … 계열의 classes) · 한글 이름 */
const CLS_TREE = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'data', 'casual-tree.json'), 'utf8'));
function clsOf(fam, k) {
  const f = fam && (CLS_TREE.outfits || []).find((o) => o.key === fam), it = f && k && (f.items || []).find((i) => i.key === k), c = it && it.cls;
  if (!c) return {};
  const cl = (f.classes || []).find((x) => x.key === c);
  return { cls: c, clsKo: (cl && cl.ko) || c };
}
const itemKo = (fam, k) => (fam && k) ? ((CT.item(tree, fam, k) || {}).ko || null) : null;
const SHADES = new Map(); for (const g of (T.CASUAL.colors || [])) for (const s of (g.shades || [])) SHADES.set(s.key, s.ko);
const situKo = k => { const s = (T.CASUAL.situations || []).find(x => x.key === k); return s ? String(s.ko).split(' — ')[0] : k; };
const gameOf = k => (COSPLAY.games || []).find(g => g.key === k) || null;
const cutKo = k => ((COSPLAY.cuts || []).find(c => c.key === k) || {}).ko || null;
/* 캐릭터 한글 — (1) 그 게임 목록 characters[].ko (2) 주인공 하나 게임이면 character_ko (3) null */
function characterKo(game, name) {
  const g = gameOf(game); if (!g || !trim(name)) return null;
  const ch = (g.characters || []).find(c => [c.name].concat(c.aka || []).some(n => normName(n) === normName(name)));   /* 다른 표기(aka — 2026-11-17)는 그 캐릭터 이름으로 */
  if (ch && trim(ch.ko)) return trim(ch.ko);
  if (!g.many && trim(g.character_ko)) return trim(g.character_ko);
  const rk = ((COSPLAY.retired_ko || {})[game] || {}), rn = Object.keys(rk).find(n => normName(n) === normName(name));   /* 명단에서 뺀 캐릭터(2026-11-17) */
  return rn ? rk[rn] : null;
}

/* 자유 설계 칸 Outfit 줄 — free_design(덩어리 글 · 칸 묶음) → free_outfit → free_prompt. 「…」 그대로면 없음 */
function outfitLine(g) {
  g = g || {};
  const ok = s => { s = trim(s); return s && !/^…|^\.\.\.$/.test(s) ? s : null; };
  const fromText = t => { if (typeof t !== 'string') return null; const m = t.split('\n').map(l => /^\s*Outfit\s*:\s*(.*)$/.exec(l)).filter(Boolean).map(x => ok(x[1])).filter(Boolean); return m.length ? m[m.length - 1] : null; };
  const fd = g.free_design;
  if (fd && typeof fd === 'object' && ok(fd.Outfit || fd.outfit)) return ok(fd.Outfit || fd.outfit);
  return fromText(fd) || (typeof g.free_outfit === 'string' ? ok(g.free_outfit) : null) || fromText(g.free_prompt);
}

/* 한 카드 폴더 → 컷(곁가지 합침) · 계획 */
function scanCard(dir) {
  let names; try { names = fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isFile()).map(e => e.name); } catch (e) { return { cuts: [], plans: [] }; }
  const groups = new Map(), plans = [];
  for (const nm of names) {
    const m = REC.exec(nm);
    if (m && STYLES.has(m[3])) {
      const k = (m[1] || '') + '|' + Number(m[2]) + '|' + m[3], side = !!(m[4] || m[5]);
      const g = groups.get(k) || []; g.push({ file: nm, world: m[1] || '', n: Number(m[2]), style: m[3], side }); groups.set(k, g); continue;
    }
    if (PLAN.test(nm)) { const r = readJSON(path.join(dir, nm)); if (r && Array.isArray(r.cuts)) plans.push({ file: nm, r, world: r.world || (/^([a-z]+)[.-]/.exec(nm) || [])[1] || '', re: /replan/.test(nm), old: PLAN_OLD.test(nm) }); }
  }
  const cuts = [];
  for (const g of groups.values()) {
    const recs = g.map(x => ({ ...x, r: readJSON(path.join(dir, x.file)) })).filter(x => x.r);
    if (!recs.length) continue;
    recs.sort((a, b) => (a.side - b.side) || String(b.r.date || '').localeCompare(String(a.r.date || '')) || a.file.localeCompare(b.file));
    cuts.push({ ...recs[0], merged: recs.length });
  }
  return { cuts, plans };
}

const sameScene = (a, b) => !!a && !!b && ((a.sfree && b.sfree) || (a.place === b.place && a.ofam === b.ofam && (a.item || '') === (b.item || '')));
/* 그 컷이 든 계획 — 세계 · 화풍 같은 것, 장면이 맞는 것 · 다시 짠 것 · 지난 판 아닌 것 먼저 */
function planOf(plans, cut, scene) {
  let best = null, bs = -1;
  for (const p of plans) {
    if (p.world !== cut.world || (p.r.style && p.r.style !== cut.style)) continue;
    const pc = p.r.cuts.find(c => c && Number(c.n) === cut.n); if (!pc) continue;
    const s = (sameScene(pc, scene) ? 4 : 0) + (p.re ? 2 : 0) + (p.old ? 0 : 1);
    if (s > bs) { bs = s; best = p; }
  }
  return best;
}
const tokensOf = p => p ? String(p.r.required || '').split('·').map(t => trim(t).split(':')[0]).filter(Boolean) : null;

/* 필수 갈래 — [열쇠, 한글] 또는 [null, null] */
function requiredOf(cut, scene, rec, plan) {
  if (cut.n === 90 || scene.own || rec.own) return ['own', '캐릭터만의 컷'];
  if (CP.isCosplay(scene)) return ['cosplay', '게임 코스프레'];
  if (scene.sfree || scene.ofree) return [null, null];
  const tok = tokensOf(plan), rt = CP.requiredType(scene);
  if (rt && (!tok || tok.includes(rt))) return EXPOSE.includes(rt) ? [rt, '노출 갈래(' + (famKo(rt) || rt) + ')'] : [rt, '나라 안'];
  if (scene.situ && tok && tok.includes('situ') && !tok.includes('cosplay')) return ['situ', '상황 노출(' + situKo(scene.situ) + ')'];   /* 2026-11-09 ~ 11-15 묶음의 셋째 필수 */
  return [null, null];
}

function rowOf(cardKey, cut, plan, source) {
  const rec = cut.r, sc = rec.scene || {}, gen = rec.generation || {};
  const [required, requiredKo] = requiredOf(cut, sc, rec, plan);
  const world = cut.world || trim(rec.world);
  const row = { card: cardKey, name: cardKo(cardKey), world, worldKo: worldKo(world), n: cut.n, date: String(rec.date || '').slice(0, 10), style: cut.style,
    path: source + '/records/' + cut.dir + '/' + cut.file, required, requiredKo,
    family: null, familyKo: null, item: null, itemKo: null, shade: null, shadeKo: null, cosplay: null, free: null };
  const freeKind = sc.gfree ? 'gfree' : sc.ofree ? 'ofree' : sc.sfree ? 'sfree' : null;
  if (required === 'own') { row.itemKo = nz(trim((rec.own || {}).job_ko)); }   /* 캐릭터만의 컷 — 옷은 그 직업 차림(표 casual-own.json) */
  else if (freeKind) {
    if (freeKind === 'gfree') { row.family = sc.gfree; row.familyKo = famKo(sc.gfree); }   /* 갈래 자유 — 갈래는 우리가, 옷은 GPT 가 */
    row.free = { kind: freeKind, kindKo: KIND_KO[freeKind], outfit: outfitLine(gen) };
  } else {
    row.family = nz(sc.ofam); row.familyKo = famKo(sc.ofam); row.item = nz(sc.item); row.itemKo = itemKo(sc.ofam, sc.item); Object.assign(row, clsOf(sc.ofam, sc.item));
    row.shade = nz(sc.shade); row.shadeKo = sc.shade ? (SHADES.get(sc.shade) || null) : null;
  }
  const s = sc.cosplay, g = gen.cosplay;
  if (CP.isCosplay(sc) && (s || g)) {
    const sChar = trim(s && s.character), game = (s && s.game) || (g && g.game) || null, character = sChar || trim(g && g.character) || null, cut2 = (s && s.cut) || (g && g.cut) || null;
    row.cosplay = { game, gameKo: (gameOf(game) || {}).ko || null, character, characterKo: characterKo(game, character), cut: cut2, cutKo: cutKo(cut2),
      by: sChar ? 'planner' : 'gpt', round: s && s.round != null ? s.round : null };
  }
  const det = DETAIL(sc, rec, cardKey); if (det) row.s = det;
  return row;
}

function build({ img = IMG_DEFAULT } = {}) {
  const source = path.basename(img), recDir = path.join(img, 'records'), rows = [];
  if (!fs.existsSync(recDir)) throw new Error('그림 저장소 records 가 없다: ' + recDir);
  for (const e of fs.readdirSync(recDir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const { cuts, plans } = scanCard(path.join(recDir, e.name));
    for (const cut of cuts) {
      const cardKey = trim(cut.r.card) || e.name;
      rows.push(rowOf(cardKey, { ...cut, dir: e.name }, planOf(plans, cut, cut.r.scene || {}), source));
    }
  }
  rows.sort((a, b) => b.date.localeCompare(a.date) || a.card.localeCompare(b.card) || a.world.localeCompare(b.world) || a.n - b.n || a.style.localeCompare(b.style));
  return { version: 1, atelier: ATELIER, built: new Date().toISOString(), source: [source], rows };
}

function summary(ix) {
  const r = ix.rows, c = k => r.filter(k).length;
  return `일상컷 색인 — ${r.length}줄 · 필수 ${c(x => x.required && x.required !== 'own')} (캐릭터만의 컷 ${c(x => x.required === 'own')}) · 코스프레 ${c(x => x.cosplay)}(planner ${c(x => x.cosplay && x.cosplay.by === 'planner')} · gpt ${c(x => x.cosplay && x.cosplay.by === 'gpt')})` +
    ` · 자유 설계 ${c(x => x.free)}(Outfit 줄 ${c(x => x.free && x.free.outfit)})`;
}

/* 내용(rows · source)이 같으면 쓰지 않는다 */
function write(ix, out) {
  const old = readJSON(out);
  if (old && JSON.stringify(old.rows) === JSON.stringify(ix.rows) && JSON.stringify(old.source) === JSON.stringify(ix.source) && old.version === ix.version) return false;
  fs.writeFileSync(out, JSON.stringify(ix) + '\n');
  return true;
}

if (require.main === module) {
  const a = process.argv.slice(2), opt = {};
  for (let i = 0; i < a.length; i++) { if (a[i] === '--check') opt.check = true; else if (a[i].startsWith('--')) opt[a[i].slice(2)] = a[++i]; }
  const ix = build({ img: opt.img ? path.resolve(opt.img) : IMG_DEFAULT });
  if (opt.out === '-') { process.stdout.write(JSON.stringify(ix) + '\n'); process.exit(0); }
  console.log(summary(ix));
  if (!opt.check) { const out = path.resolve(opt.out || path.join(ROOT, 'data', 'casual-index.json')); console.log(write(ix, out) ? '썼다: ' + path.relative(process.cwd(), out) : '같다 — 쓰지 않음'); }
}

module.exports = { build, rowOf, scanCard, planOf, requiredOf, outfitLine, characterKo, summary, write, REC, PLAN };
