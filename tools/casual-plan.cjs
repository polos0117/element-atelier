#!/usr/bin/env node
/* 일상컷 묶음 계획 — 한 카드의 한 세계 일상컷 일곱 장을 서로 겹치지 않게 한 번에 짠다.
   2026-11-09 삼국지 공방의 계획기를 원소 꼴로 옮겼다(사용자 「element 쪽도 생성기 구조 sam 쪽에 맞추자. 간결버전에 일상컷도 간결, 갈래추가」 — 전엔 다섯 장 · 필수 한 장 이상).
   원소는 세계마다 다른 사람이라 **세계마다 일곱 장**(그 세계 그림을 참고 그림으로 — 2026-11-11 사용자 「한 장 더 생성하게 해서 필수갈래 또는 상황 노출을 더 그리게 추가해줘. 그럼 일상컷은 총 7장 되는거야」, 전엔 여섯).
   일곱 장 = 장면 컷 다섯(아래 묶음 규칙) + 자유 설계 칸 둘(sfree — 장면 줄을 짜지 않고 T.FREE_DESIGN 덩어리, 사용자 같은 날 「장소·활동·자세·구도·의상을 자유롭게 설계해줘 …
   필수갈래랑 상황노출 두개를 묶어서 이렇게 가자. 그리고 지금 맡겨놓은 일상컷 1장도 같이 이런식으로」): 옷 자유 칸(ofree — 묶는 것 없음, 목록에 없는 옷) ·
   갈래 자유 칸(gfree — 필수 노출 갈래 하나(큰 범위만, 노출 갈래 컷과 다른 것) + 상황은 열기 gsitu 'free' — GPT 가 짓되 우리 넷이 아닌 것 먼저, 2026-11-11 「상황도 열어주자」). 두 칸엔 최근 장면(recent — 그림 저장소 기록의 최근 여덟 + 같은 묶음의 장면 컷)을 적는다. 생성기(lib/studio.js)와 같은 lib/casual-tree-v2.js · lib/prompt-element.js 로 칸마다 장면을 고르고,
   생성기 「기록 내보내기」 와 같은 꼴의 기록(<세계>-casualN.<화풍>-ui.json)과 지시문을 쓴다. 지키는 묶음 규칙(한 세계 묶음 안, 장면 컷끼리 — IMAGE_RULES 2절):
     - 세 장은 정해 둔 갈래 — 노출 갈래 한 장(란제리풍 · 수영복 · 역할극 의상 — 카드마다 돌려 가며) + 나라 안 갈래 한 장(나라의 방 · 목욕탕 · 지붕 · 여관 · 서재 · 부엌 · 야영지 · 정원 · 다리 · 사원 · 숲길 · 나루에서
       홈웨어 · 란제리 · 목욕 차림 · 수영복) + 상황 노출 한 장(젖은 옷 · 바람 · 반쯤 푼 차림 · 흘러내린 어깨끈 — 위 두 갈래가 아닌 컷, 얼굴 클로즈업 아님), 서로 다른 컷
     - 장소는 서로 다르게, 장소 묶음은 두 번까지 · 의상 계열은 겹치지 않게(평상복만 두 번 · 동탄룩 한 장) · 시대는 한 가지 두 번까지, 네 시대(지금 현실 · 쓰임의 현장 · 나라 안 · 무대·환상) 다
     - 자세 추천은 서로 다르게 · 프레이밍은 서로 다르게(먼 컷 · 가까운 컷 하나씩은 꼭) · 몸 방향 한 가지는 두 번까지 · 머리 「어깨 너머」 는 한 장까지
     - 소품은 칸마다 다르게 · 그 원소의 물건(설계표 hold, 주민은 object)을 든 컷은 한두 장 · 마실 것은 한 장까지 · ⚠ 어색한 조합은 한 장까지
     - 옷 색 갈래 · 데니어(맞는 옷의 열에 여섯)를 나눠 준다. 목욕 차림은 덜 고르고 세계 셋 통틀어 한 장
     - 카드 사이에서도 안 쓴 트리 쪽 먼저(--usage, 기본 옆의 element-atelier-img/records) — 한 번도 안 쓴 값은 무게 12, 쓴 값은 1/(1+횟수)³
     - 세계끼리 · 묶음끼리 같은 장소 · 같은 자세 추천 · 같은 옷은 안 된다
   이미 그림이 있는 번호는 짜지 않고, 그 세계의 기록(--records)은 겹침 검사에만 쓴다 — 여섯 장을 다 그린 옛 묶음은 그대로 통과하고 다음 계획 때 일곱째(갈래 자유) 칸만 짜진다.
   --check 는 자유 설계 칸 기록에 채운 설계(generation.free_prompt)가 있는지도 본다.

     node tools/casual-plan.cjs <카드> --world <세계>|all [--fresh] [--slots 1,2,3] [--records <그림 저장소>/records/<카드>] [--seed N] [--out <폴더>] [--usage <폴더>|none]
     node tools/casual-plan.cjs <카드> --world <세계> --check <기록 폴더> [--from N]   # 올리기 전 */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-element.js']) vm.runInContext(read(f), ctx);
const T = ctx.window.AtelierSpec, CT = ctx.window.AtelierCasualTree, C2 = ctx.window.AtelierCasualTreeV2, P = ctx.window.AtelierPrompt;
const D = JSON.parse(read('data/element-design.json')), S = JSON.parse(read('data/style.json'));
const tree = JSON.parse(read('data/casual-tree.json')), tree2 = JSON.parse(read('data/casual-tree-v2.json'));
const T2 = C2.make(tree2, tree), STYLE = S['default'], CASUAL_N = 7;   /* 사용자 2026-11-11 「…그럼 일상컷은 총 7장 되는거야」 — 일곱째는 갈래 자유 칸. 전엔 여섯(2026-11-09 「일상컷 생성수를 6장으로 늘려줘」), 그 전 다섯 */
/* 상황 노출 · 옷 자유는 여섯 장 묶음부터(옛 다섯 장 묶음은 그 전), 갈래 자유는 일곱 장 묶음부터(옛 여섯 장 묶음은 그대로 통과 — 다음 계획 때 일곱째 칸만 짠다) */
const SITU_FROM = 6, OFREE_FROM = 6, GFREE_FROM = CASUAL_N, RECENT_N = 8;

const EXPOSE_TYPES = ['lingerie', 'swimwear', 'roleplay'];   /* 노출 갈래 — 카드마다 돌려 가며 */
const FAR = ['full_body', 'environmental'], NEAR = ['chest_up', 'face_close'];
const FRAMES = Object.keys(tree2.frames).filter(k => k !== 'note' && k !== 'detail');
/* 일상컷 표정 후보 — 일상컷에 어색한 것은 계획기가 고르지 않는다(사용자 2026-11-03 「표정 관련 문구가 과하게」 · 「다 해줘」):
   웃는 입에 무표정한 눈 · 지루함 · 졸림 · 지침 · 짜증 · 시큰둥 · 눈을 질끈 감은 웃음. 생성기에서 손으로 고르는 것은 그대로 된다 */
/* 2026-11-03 「일상컷쪽이 더 그래」 — 빼는 목록 대신 고르는 목록으로. GPT 세션의 image_gen 은 결연함을 노려봄으로, 으쓱 · 장난을 한쪽 눈썹 + 비웃음으로,
   크게 웃음을 벌린 입으로, 호기심을 치켜든 눈썹으로, 관능을 반쯤 감은 눈으로 키웠다. 일상컷은 은은한 표정 열일곱에서만 */
const EXPR_CASUAL = ['calm', 'soft_smile', 'gentle', 'amused', 'pensive', 'wistful', 'nostalgic', 'confident', 'proud', 'focused', 'half_smile', 'candid', 'relieved',
  'wink', 'sensual', 'serious', 'curious'];   /* 같은 날 사용자 「윙크, 관능, 진지, 호기심 정도는 일상컷에 넣어줘」 */
const EXPR_SKIP = Object.keys(tree2.expressions || {}).filter(k => !EXPR_CASUAL.includes(k));
const EXPRS = EXPR_CASUAL.filter(k => (tree2.expressions || {})[k]);
const ERA_WEIGHT = { now: 5, site: 2, nation: 2, fantasy: 1 };
/* 한 묶음의 시대 몫 — 지금 현실 둘 · 세계 안 · 역사의 자리 · 무대·환상 하나씩(2026-11-02 사용자 「지금 현실 비중을 높여줘」 —
   기록 159장 중 지금 현실이 31장(19%)이고 세계 안이 88장이었다. 안 쓴 장소 51 곳이 다 지금 현실에 있다). 칸마다 「쓴 수 ÷ 몫」 이 가장 낮은 시대부터 */
/* 2026-11-09 여섯 장 — 하나 더는 무대·환상(새 계열 모험가 · 신화 드레이프가 사는 곳). 한 시대 두 장까지(check)라 지금 현실은 둘 그대로.
   2026-11-11 일곱 장 — 장면 컷은 다섯(자유 설계 칸 둘은 시대를 안 짠다), 몫은 그대로 두고 덜 쓴 시대부터 */
const ERA_QUOTA = { now: 2, nation: 1, site: 1, fantasy: 2 };
const FIXED_AXES = { overall_intensity: 'strong', skin_exposure: 'bold' };
const DRINKS = ['cup', 'drink_glass', 'water_bottle', 'teapot'];
/* 상황 노출(사용자 2026-11-09 「1번 내용을 필수갈래에 넣어줘. 그러면 필수컷이 3장은 확정」) — 장면 컷 한 장, 노출 갈래 · 세계 안 갈래와 다른 컷에
   젖은 옷 · 바람 · 반쯤 푼 차림 · 흘러내린 어깨끈 중 그 옷에 맞는 것 하나(T.CASUAL.situations). 다른 세계 묶음이 쓴 상황은 뒤로 */
const SITUS = (T.CASUAL.situations || []).map(x => x.key);
const SITU_NO_FRAME = ['face_close'];   /* 얼굴 클로즈업엔 옷이 안 보여 상황이 안 산다(손상향 시험 계획 — 젖은 옷이 클로즈업에) */

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const pick = (r, list) => list[Math.floor(r() * list.length)];
function weighted(r, weights) { const keys = Object.keys(weights), sum = keys.reduce((s, k) => s + weights[k], 0); let x = r() * sum; for (const k of keys) { x -= weights[k]; if (x < 0) return k; } return keys[0]; }
const by = (list, k) => (list || []).find(r => r.key === k);

/* 카드 — 생성기 지시문이 쓰는 꼴(prompt-element 의 casualCard): 그 원소의 물건 하나가 「알아볼 거리」 */
function cardOf(key) {
  const c = P.card(D, key);
  if (!c) throw new Error('카드가 없다: ' + key + ' (설계표의 나라 · 가문 · 주민 열쇠를 하이픈으로)');
  const h = P.holdOf(c);   /* 그 원소의 물건(설계표 hold, 주민은 object) — 일상컷에서 손에 든다 */
  return { key, c, g: { key, signature: h ? [h] : [], signature_hold: h ? [0] : [] }, worlds: P.worldsOf(D, key) };
}
/* 필수 갈래 종류 — 옷 계열이 곧 노출 갈래면 그 계열, 세계 안의 방 · 목욕 · 지붕 · 여관 · 서재 · 부엌 · 군영 · 정원 · 다리 · 사당 · 숲길 · 나루 일상이면 nation(세계 안 갈래) */
function requiredType(sc) {
  if (sc.sfree) return '';   /* 자유 설계 칸은 장면을 짜지 않는다 — 갈래 자유 칸의 갈래는 gfree 에 따로 */
  if ((tree.required.outfits || []).includes(sc.ofam)) return sc.ofam;
  return CT.isRequired(tree, sc) ? 'nation' : '';
}
const PATH2 = new Map();
function requiredPaths(type) {
  if (PATH2.has(type)) return PATH2.get(type);
  const out = [];
  for (const e of tree.eras) for (const place of C2.choices(T2, { era: e.key }, 'place', null))
    for (const ofam of C2.choices(T2, { era: e.key, place }, 'ofam', null)) {
      const sc = { era: e.key, place, ofam };
      if (requiredType(sc) === type) out.push(sc);
    }
  PATH2.set(type, out);
  return out;
}
const MEMO = new Map();
function presetsAt(sc, g) {
  const k = [sc.era, sc.place, sc.ofam, sc.prop].join('|');
  if (!MEMO.has(k)) MEMO.set(k, C2.presets(T2, sc, g));
  return MEMO.get(k);
}
const sigProp = c => { const u = C2.use(T2, c.use); return !!u && u.prop === 'signature'; };

/* 카드 사이 쓴 횟수의 무게 — 한 번도 안 쓴 값이 먼저(12), 쓴 값은 1/(1+횟수)³.
   2026-11-02 사용자 「가중치 올려줘」 — 기록 159장 중 세계 안 · 방 · 홈웨어 · 발목 꼬고 앉기 한 장면이 12장, 길(자세 추천 × 장소) 3583 중 102 만 썼다.
   전엔 4 와 1/(1+횟수)² — 안 쓴 값이 한 번 쓴 값보다 16 배, 이제 96 배. 길(자세 추천 × 장소) · 옷 계열 횟수도 센다 */
const WEIGHT_UNUSED = 12;
/* 카메라용 몸짓 추천(쉿 · 브이 · 엄지 척 · 손 흔들기 · 카메라로 손 뻗기 … — 표의 pose)은 덜 고른다(2026-11-13 검토 — 추천 47 중 카메라 응시 28 · 눈높이 34 라
   장소가 달라도 「사진 찍히는 중」 한 장이 됐다). 없애지는 않는다 */
const POSE_WEIGHT = 0.4;
/* 어색한 조합(⚠ — 표 awkward: 수영복으로 작업 자리, 휴양지 차림으로 현장 …)인 의상 계열은 덜 고른다(2026-11-13 — 새 장소 · 새 계열이 새 모순이 되지 않게). 묶음마다 한 장까지는 여전히 된다 */
const AWKWARD_WEIGHT = 0.15;
const wOf = n => n ? 1 / Math.pow(1 + n, 3) : WEIGHT_UNUSED;
/* 옷 계열 무게 — 목욕 차림(수건 · 페슈테말 · 찜질복 · 가운)이 계획 12.7% · 등록 10.8% 로 계열 가운데 가장 많았다(사용자 2026-11-09 「수건 감는 옷 많이 나오던데 이전부터」).
   목욕 계열 장소 · 세계 안 목욕탕이 많아 그렇다 — 고를 때 무게를 줄이고, 한 카드의 세 세계 통틀어 한 장까지(check) */
const FAM_WEIGHT = { bath: 0.25 };
const famW = sc => FAM_WEIGHT[(sc && sc.ofam) || sc] || 1;
function lean(r, list, count, key = x => x, factor = () => 1) {
  if (!list.length) return undefined;
  const w = list.map(x => wOf((count || {})[key(x)] || 0) * factor(x)), sum = w.reduce((a, b) => a + b, 0);
  let x = r() * sum; for (let i = 0; i < list.length; i++) { x -= w[i]; if (x < 0) return list[i]; }
  return list[list.length - 1];
}
/* 쓴 횟수 꼴 바로잡기 — 옛 꼴(소품 → 횟수)도 받는다 */
const EMPTY_USAGE = () => ({ prop: {}, place: {}, item: {}, preset: {}, posture: {}, expr: {}, ofam: {}, path: {} });
const usageOf0 = u => (u && (u.place || u.prop || u.preset)) ? { ...EMPTY_USAGE(), ...u } : { ...EMPTY_USAGE(), prop: u || {} };
/* 새로 더한 옷 계열(쓴 횟수 0)은 다른 계열의 가운데 값에서 시작한다 — 안 그러면 「안 쓴 쪽 먼저」 무게로 모든 묶음에 들어갔다(2026-11-03 동탄룩 72묶음 중 72) */
const FAMS = (tree.outfits || []).map(o => o.key);
const usageOf = u => {
  const x = usageOf0(u), used = FAMS.map(k => x.ofam[k] || 0).filter(n => n > 0).sort((a, b) => a - b);
  if (used.length) { const mid = used[Math.floor(used.length / 2)]; x.ofam = { ...x.ofam }; for (const k of FAMS) if (!x.ofam[k]) x.ofam[k] = mid; }
  return x;
};
const pathKey = (preset, place) => preset + '@' + place;

/* 한 칸 — 시대 · 장소 · 의상 · 옷, 그 장소에서 쓸 수 있는 자세 추천 하나(frame 을 주면 그 프레이밍의 추천만).
   wantSig 면 소품 동작을 그 원소의 물건으로. 소품 동작은 덜 쓴 소품 쪽으로(무게 1/(1+횟수)², 따로 된 난수 흐름 — game 과 같다).
   장소 · 옷 · 자세 추천(그 자세) · 표정은 다른 카드에서 안 쓴 · 덜 쓴 쪽으로(lean — 2026-11-01) */
function slot(r, card, reqType, { frame = '', wantSig = false, era: wantEra = '', usage = {}, rUse = r } = {}) {
  const g = card.g, U = usageOf(usage);
  let sc;
  if (reqType) { const paths = requiredPaths(reqType).filter(x => !wantEra || x.era === wantEra); if (!paths.length) return null; sc = { ...lean(r, paths, U.place, x => x.place, famW) }; }
  else {
    const era = wantEra || weighted(r, ERA_WEIGHT), place = lean(r, C2.choices(T2, { era }, 'place', null), U.place);
    if (!place) return null;
    sc = { era, place, ofam: lean(r, C2.choices(T2, { era, place }, 'ofam', null), U.ofam, x => x, f => famW(f) * (C2.awkward(T2, f, place).length ? AWKWARD_WEIGHT : 1)) };
  }
  sc.treeV = 2; sc.prop = wantSig ? '0' : '';
  const presets = presetsAt(sc, g).filter(p => (!frame || p.frame === frame) && (!wantSig || p.prop_kind));
  if (!presets.length) return null;
  const rp = list => pick(r, list);
  /* 자세 추천 — 그 추천과 그 자세의 횟수를 함께(선 자세가 절반이 넘었다 — 2026-11-01 기록 434장) */
  const pw = presets.map(p => wOf(U.preset[p.key] || 0) * Math.sqrt(wOf(U.posture[p.posture] || 0)) * wOf(U.path[pathKey(p.key, sc.place)] || 0) * (p.pose ? POSE_WEIGHT : 1));
  let px = r() * pw.reduce((a, b) => a + b, 0), chosen = presets[presets.length - 1];
  for (let i = 0; i < presets.length; i++) { px -= pw[i]; if (px < 0) { chosen = presets[i]; break; } }
  sc = C2.repair(T2, C2.applyPreset(T2, sc, chosen.key), g, rp);
  if (wantSig) {
    const sig = C2.choices(T2, sc, 'use', g).filter(k => C2.use(T2, k).prop === 'signature');
    if (!sig.length) return null;
    sc = { ...sc, use: pick(r, sig) };
  }
  const items = C2.choices(T2, sc, 'item', g);
  sc.item = items.length ? lean(r, items, U.item) : '';
  sc = C2.repair(T2, sc, g, rp);
  if (!wantSig && sc.use && !sigProp(sc)) {
    const alt = C2.choices(T2, sc, 'use', g).filter(k => C2.use(T2, k).prop !== 'signature');
    if (alt.length > 1) {
      const n = p => DRINKS.includes(p) ? DRINKS.reduce((a, d) => a + (U.prop[d] || 0), 0) : (U.prop[p] || 0);
      const u = weighted(rUse, Object.fromEntries(alt.map(k => [k, 1 / Math.pow(1 + n(C2.use(T2, k).prop), 2)])));
      const next = C2.set(T2, sc, 'use', u, g, rp);
      if (next.use === u) sc = next;
    }
  }
  if (wantSig && !sigProp(sc)) return null;
  const body = by(tree2.body, sc.body), head = by(tree2.head, sc.head);
  sc.expr = body && body.face_hidden && !(head && head.look_back) ? '' : pick(r, EXPRS);   /* 표정은 고르게 — 덜 쓴 쪽 무게(lean)를 걸면 덜 쓴 극단 표정으로 쏠렸다(2026-11-03) */
  sc.axes = { ...FIXED_AXES }; sc.aspect = '2:3'; sc.unlocked = [];
  return sc;
}

/* 묶음 규칙 — 틀린 것 목록. base 는 이미 있는 컷(그 세계): 그것들이 벌써 넘긴 한도는 그만큼 올려 준다 */
function check(cuts, card, base = [], others = []) {
  const all = [...base, ...cuts], errs = [];
  /* 장면 규칙은 장면 컷만 — 자유 설계 칸(sfree)은 장소 · 구도 · 시대를 맡은 쪽이 짓는다(2026-11-11) */
  const sc = c => !c.sfree, sAll = all.filter(sc), sBase = base.filter(sc), sCuts = cuts.filter(sc);
  const count = (f, xs) => xs.reduce((m, c) => { const k = f(c); if (k) m[k] = (m[k] || 0) + 1; return m; }, {});
  const over = (name, f, most, xs = sAll, bs = sBase) => {
    const m = count(f, xs), b = count(f, bs);
    Object.entries(m).forEach(([k, n]) => { if (n > Math.max(most, b[k] || 0)) errs.push(`${name} ${k} 가 ${n} 번(${most} 번까지)`); });
  };
  /* 두 장은 정해 둔 갈래 — 노출 한 장 · 세계 안 한 장, 서로 다른 컷 */
  const ex = sAll.filter(c => EXPOSE_TYPES.includes(requiredType(c))), inw = sAll.filter(c => CT.isRequired(tree, c) && requiredType(c) === 'nation');
  if (all.length >= 2 && (!ex.length || !inw.length)) errs.push('필수 갈래가 없다 — 노출 한 장 · 세계 안 한 장(' + (!ex.length ? '노출 갈래' : '') + (!ex.length && !inw.length ? ' · ' : '') + (!inw.length ? '세계 안 갈래' : '') + ' 없음)');
  over('장소', c => c.place, 1);
  over('장소 묶음', c => (C2.place(T2, c.place) || {}).group, 2);
  over('의상 계열', c => c.ofam !== 'everyday' && c.ofam, 1);
  over('평상복', c => c.ofam === 'everyday' && c.ofam, 2);
  over('시대', c => c.era, 2);
  if (sCuts.length >= 4) { const eras = new Set(sAll.map(c => c.era)), want = Math.min(tree.eras.length, sAll.length); if (eras.size < want) errs.push(`시대가 ${eras.size} 가지뿐이다(${want} 가지 다)`); }
  over('프레이밍', c => c.frame, Math.max(1, Math.ceil(sAll.length / FRAMES.length)));
  over('자세 추천', c => c.preset, 1);
  over('몸 방향', c => c.body, 2);
  over('머리 어깨 너머', c => (by(tree2.head, c.head) || {}).look_back && 'over_shoulder', 1);
  over('소품', c => { const u = C2.use(T2, c.use); return u && u.prop; }, 1);
  over('마실 것', c => { const u = C2.use(T2, c.use); return u && DRINKS.includes(u.prop) && 'drink'; }, 1);
  over('그 원소의 물건', c => sigProp(c) && 'signature', 2);
  over('어색한 조합', c => C2.awkward(T2, c.ofam, c.place).length && 'awkward', 1);
  over('동탄룩', c => c.ofam === 'dongtan' && 'dongtan', 1);
  /* 셋째 필수 — 상황 노출 한 장(여섯 장 묶음부터 — 옛 다섯 장 묶음은 이 갈래 전), 노출 · 세계 안 갈래 컷과 다른 컷 */
  over('상황 노출', c => c.situ && 'situ', 1);
  over('옷 자유', c => c.ofree && 'ofree', 1, all, base);
  for (const c of cuts) if (c.situ && !P.situFits(c.situ, outfitEn(c))) errs.push(`칸 ${c.n || '?'}: 상황 ${c.situ} 는 이 옷에 안 맞는다`);
  for (const c of cuts) if (c.situ && SITU_NO_FRAME.includes(c.frame)) errs.push(`칸 ${c.n || '?'}: 상황 노출은 얼굴 클로즈업에 두지 않는다`);
  if (all.length >= SITU_FROM && !sAll.some(c => c.situ && !requiredType(c))) errs.push('상황 노출 컷이 없다 — 노출 · 세계 안 갈래와 다른 컷 한 장');   /* 2026-11-03 더한 계열 — 안 쓴 계열이라 무게가 커서 묶음마다 한 장까지 */
  /* 일곱째 — 갈래 자유 칸 한 장(2026-11-11): 자유 설계 · 필수 노출 갈래 하나(노출 갈래 컷과 다른 것) · 상황 하나(상황 노출 컷과 다른 것), 옷 자유 · 상황 노출 칸과 다른 칸 */
  over('갈래 자유', c => c.gfree && 'gfree', 1, all, base);
  if (all.length >= GFREE_FROM && !all.some(c => c.gfree)) errs.push('갈래 자유 컷이 없다 — 일곱 장 묶음에 한 장(필수 노출 갈래 + 상황 노출을 묶은 자유 설계)');
  const exFams = ex.map(c => c.ofam), situs = sAll.map(c => c.situ).filter(Boolean);
  for (const c of cuts) {
    if (c.ofree && c.gfree) errs.push(`칸 ${c.n || '?'}: 옷 자유와 갈래 자유는 다른 칸`);
    if (!c.gfree) continue;
    if (!c.sfree) errs.push(`칸 ${c.n || '?'}: 갈래 자유 컷은 자유 설계(sfree) 칸이다`);
    if (!EXPOSE_TYPES.includes(c.gfree)) errs.push(`칸 ${c.n || '?'}: 갈래 자유의 갈래 ${c.gfree} 는 필수 노출 갈래(${EXPOSE_TYPES.join(' · ')})가 아니다`);
    else if (exFams.includes(c.gfree)) errs.push(`칸 ${c.n || '?'}: 갈래 자유의 갈래 ${c.gfree} 가 노출 갈래 컷과 같다`);
    if (c.gsitu === 'free') { /* 열린 상황(2026-11-11) */ }
    else if (!SITUS.includes(c.gsitu)) errs.push(`칸 ${c.n || '?'}: 갈래 자유의 상황(gsitu)이 'free' 도 상황 표에도 없다 — ${c.gsitu || '없음'}`);
    else if (situs.includes(c.gsitu)) errs.push(`칸 ${c.n || '?'}: 갈래 자유의 상황 ${c.gsitu} 가 상황 노출 컷과 같다`);
  }
  if (card.g.signature_hold.length && sAll.length >= 3 && !sAll.some(sigProp)) errs.push('그 원소의 물건을 든 컷이 없다(한두 장)');
  if (sAll.length >= 3) {
    if (!sAll.some(c => FAR.includes(c.frame))) errs.push('먼 컷(전신·환경)이 없다');
    if (!sAll.some(c => NEAR.includes(c.frame))) errs.push('가까운 컷(가슴 위·클로즈업)이 없다');
  }
  for (const c of sCuts) {
    const fixed = C2.repair(T2, { ...c }, card.g);
    for (const k of C2.ORDER) if ((fixed[k] || '') !== (c[k] || '')) errs.push(`칸 ${c.n || '?'}: ${k}=${c[k]} 는 트리에서 못 고른다`);
  }
  /* 세계끼리 · 묶음끼리 장면을 돌려쓰지 않는다(2026-11-02 — 유비 · 조운 · 하후돈 · 사마의가 세 세계에 같은 장면 한 벌을 썼다).
     같은 장소는 안 된다 — 다만 「세계 안」 장소(nation_*)는 세계마다 다른 곳(객잔 · 선술집 · 정거장 바)이 되니, 그때는 옷 계열까지 같을 때만 막는다.
     장소 · 옷과 상관없이 같은 자세 추천(= 같은 구도)도 안 된다(사용자 「같은 구도의 장면」) */
  const inWorld = c => (C2.place(T2, c.place) || {}).eras && /^nation_/.test(c.place);
  /* 같은 옷도 세계끼리 · 묶음끼리 돌려입지 않는다(사용자 2026-11-08 「무협에서 니트 상의했으면 메카에서도 …」 → 「응 막아줘」) — 옷(item)이 같으면, 옷 없이 계열만이면 그 계열(평상복 계열 자체는 빼고) */
  const outfitKey = c => c.item ? c.ofam + '/' + c.item : (c.ofam && c.ofam !== 'everyday' ? c.ofam : '');
  for (const c of sCuts) {
    const same = others.filter(o => o.place && o.place === c.place);
    if (same.length && (!inWorld(c) || same.some(o => o.ofam === c.ofam))) errs.push(`칸 ${c.n || '?'}: 장소 ${c.place} 는 다른 세계 · 다른 묶음이 쓴 곳`);
    if (c.preset && others.some(o => o.preset === c.preset)) errs.push(`칸 ${c.n || '?'}: 자세 추천 ${c.preset} 는 다른 세계 · 다른 묶음이 쓴 구도`);
    const ok = outfitKey(c); if (ok && others.some(o => outfitKey(o) === ok)) errs.push(`칸 ${c.n || '?'}: 옷 ${ok} 는 다른 세계 · 다른 묶음이 입은 옷`);
    if (c.ofam === 'bath' && others.some(o => o.ofam === 'bath')) errs.push(`칸 ${c.n || '?'}: 목욕 차림은 한 카드의 세계 셋 통틀어 한 장까지(2026-11-09)`);
  }
  return errs;
}
/* 옷 색 갈래(2026-11-08 「일상컷 생성 옵션에 의상색 관련 다양성은 없었나?」 → 「응 넣어줘」) — 색이 박히지 않은 옷마다 서로 다른 갈래를 준다.
   이미 있는 컷 · 다른 세계 묶음이 쓴 갈래는 뒤로(다 쓰면 다시 처음부터). 장면 고르기(씨앗 r)와 따로 굴려 옛 씨앗의 장면이 그대로다 */
const COLORS = (T.CASUAL.colors || []).map(c => c.key);
function outfitEn(c) { const it = C2.item(T2, c.ofam, c.item), fm = C2.family(T2, c.ofam); return (c.outfit || '').trim() || (it && it.en) || (fm && fm.en) || ''; }
function colorize(cuts, old = [], others = [], rc = Math.random) {
  const used = new Set([...old, ...others].map(c => c.color).filter(Boolean)), mine = new Set();
  for (const c of cuts) {
    if (P.colorFixed(outfitEn(c))) { delete c.color; continue; }
    let pool = COLORS.filter(k => !used.has(k) && !mine.has(k));
    if (!pool.length) pool = COLORS.filter(k => !mine.has(k));
    if (!pool.length) pool = COLORS.slice();
    c.color = pool[Math.floor(rc() * pool.length)]; mine.add(c.color);
  }
  return cuts;
}
/* 데니어(2026-11-08 「데니어 설정값 넣어서 랜덤하게 설정될 수 있게 해줘. 기존 노출설정값 과는 별개로」) — 데니어가 닿는 옷(P.denierFits)마다
   열에 여섯은 갈래 하나(40 · 60 · 80), 묶음 안에선 갈래를 돌려 가며. 노출 단계(skin_exposure)는 건드리지 않는다. 장면 · 색과 따로 된 난수 */
const DENIERS = (T.CASUAL.deniers || []).map(d => d.key), DENIER_RATE = 0.6;
function denierize(cuts, rd = Math.random) {
  const mine = [];
  for (const c of cuts) {
    if (!P.denierFits(outfitEn(c)) || rd() >= DENIER_RATE) { delete c.denier; continue; }
    let pool = DENIERS.filter(k => !mine.includes(k)); if (!pool.length) pool = DENIERS.slice();
    c.denier = pool[Math.floor(rd() * pool.length)]; mine.push(c.denier);
  }
  return cuts;
}
/* 바람에 날림은 실내가 아닌 곳만(2026-11-13 — 장소 특징 indoor). 젖은 옷은 실내면 지시문이 비 대신 물 튐 글(enIn)을 싣는다 */
const situAtPlace = (k, c) => C2.situOk(T2, c, by(T.CASUAL.situations, k));   /* 상황 표의 조건(장소 특징 · 묶음 · 자세 · 프레이밍 — 바람은 실내가 아닌 곳, 땀은 더운 곳, 역광 실루엣은 창 · 하늘, 트임은 걷거나 앉은 전신 컷) */
/* 빛 · 날씨 · 머리 매무새 · 빛의 방향 · 화면 안 자리 · 배경 깊이 · 전경 · 카메라 높이(2026-11-13) — 전엔 계획기가 이 칸들을 한 번도 안 채워 묶음의 빛이 한 가지였다.
   조건은 표 ambience(시간대는 하늘 · 창이 있는 곳, 등불은 실내, 밤 고정 장소는 밤 시간대만, 날씨는 하늘 · 창이 있는 곳 …)와 모듈 C2.ambience 가 쥔다.
   묶음 안에서 덜 쓴 값부터. 장면 고르기와 따로 된 난수라 옛 씨앗의 장면(장소 · 옷 · 자세)은 그대로다 */
const AMBIENT = ['time', 'weather', 'hair', 'light', 'spot', 'depth', 'view'];
function ambient(cuts, old = [], ra = Math.random) {
  const used = {}, note = c => [...AMBIENT, 'camera'].forEach(k => { if (c[k]) { used[k] = used[k] || {}; used[k][c[k]] = (used[k][c[k]] || 0) + 1; } });
  old.filter(c => !c.sfree).forEach(note);
  const opts = { times: (T.CASUAL.times || []).map(x => x.key), hairs: (T.CASUAL.hairs || []).map(x => x.key), used };
  for (const c of cuts) {
    if (c.sfree) continue;
    Object.assign(c, C2.ambience(T2, c, ra, opts));
    /* 역광 실루엣 상황은 빛이 뒤에서 — 밤 시간대는 뗀다 */
    if (c.situ === 'sheer_light') { c.light = 'back'; if (['night', 'neon', 'lamplight'].includes(c.time)) c.time = ''; if (c.weather === 'night_snow') c.weather = ''; }
    for (const k of AMBIENT) if (!c[k]) delete c[k];
    note(c);
  }
  return cuts;
}
/* 상황 — 상황 칸(situAt)에 그 옷에 맞는 것 하나. 이미 있는 컷 · 다른 세계 묶음이 쓴 상황은 뒤로. 장면과 따로 된 난수 */
function situate(cuts, at, old = [], others = [], rs = Math.random) {
  const used = new Set([...old, ...others].map(c => c.situ).filter(Boolean));
  cuts.forEach((c, i) => {
    if (i !== at) { delete c.situ; return; }
    const fit = P.situsFor(outfitEn(c)).filter(k => situAtPlace(k, c)); let pool = fit.filter(k => !used.has(k)); if (!pool.length) pool = fit;
    /* 젖은 옷은 거의 모든 옷에 맞아 늘 후보에 들었다(기록에서 가장 많은 상황) — 다른 후보가 있으면 열에 넷만 남긴다(2026-11-13) */
    if (pool.length > 1 && pool.includes('wet') && rs() >= 0.4) pool = pool.filter(k => k !== 'wet');
    if (pool.length) c.situ = pool[Math.floor(rs() * pool.length)]; else delete c.situ;
  });
  return cuts;
}
/* 자유 설계 칸(2026-11-11) — 옷 자유 칸(ofree, 사용자 2026-11-09 「일상컷도 1장은 gpt에게 노출의상 자유롭게 만들어달라고 해줘」)과 일곱째 갈래 자유 칸(gfree).
   둘 다 장면 줄을 짜지 않는다(sfree — 장소 · 활동 · 자세 · 구도 · 의상을 맡은 쪽이 T.FREE_DESIGN 덩어리에 채운다), 옷 색 · 데니어는 없다.
   갈래 자유 칸은 필수 노출 갈래 중 노출 갈래 컷과 다른 것 하나 + 상황 표 가운데 상황 노출 컷과 다른 것 하나(옷을 맡은 쪽이 지으니 「옷에 맞는 상황」 거름은 없다).
   다른 세계 묶음이 쓴 갈래 · 상황은 뒤로. recent 는 최근 장면 — 그림 저장소 기록의 최근 장면(recentScenes)에 같은 묶음의 장면 컷을 더한 것 */
function makeFree(cardKey, nums, kinds, cuts, old = [], others = [], recentList = [], rf = Math.random) {
  const all = [...old, ...cuts], bundle = all.filter(c => !c.sfree).sort((a, b) => a.n - b.n).map(c => sceneText(c, holdOfKey(cardKey))).filter(Boolean);
  const recent = [...new Set([...recentList, ...bundle])], out = [];
  const pickFrom = (list, avoid) => { const pref = list.filter(k => !avoid.has(k)), pool = pref.length ? pref : list; return pool[Math.floor(rf() * pool.length)]; };
  for (let i = 0; i < kinds.length; i++) {
    const c = { n: nums[i], treeV: 2, sfree: true };
    if (kinds[i] === 'ofree') c.ofree = true;
    else {
      const exFams = all.filter(x => EXPOSE_TYPES.includes(requiredType(x))).map(x => x.ofam), fams = EXPOSE_TYPES.filter(f => !exFams.includes(f));
      if (!fams.length) return null;
      c.gfree = pickFrom(fams, new Set(others.map(o => o.gfree).filter(Boolean)));
      c.gsitu = 'free';   /* 상황은 GPT 가 짓는다 — 우리 넷이 아닌 것 먼저(사용자 2026-11-11 「상황도 열어주자」) */
    }
    Object.assign(c, { recent, axes: { ...FIXED_AXES }, aspect: '2:3', unlocked: [] });
    out.push(c);
  }
  return out;
}
/* 장면 한 줄(영어, 트리 표 이름) — 장소 + 하는 일(소품 동작, 없으면 자세). 최근 장면 · 같은 묶음 장면을 자유 설계 칸에 적을 때 */
const HOLD = new Map();
function holdOfKey(key) { if (!key) return ''; if (!HOLD.has(key)) { const c = P.card(D, key); HOLD.set(key, c ? P.holdOf(c) : ''); } return HOLD.get(key); }
function sceneText(sc, hold = '') {
  const p = C2.place(T2, sc.place); if (!p) return '';
  const u = C2.use(T2, sc.use), pr = u && C2.prop(T2, u.prop), po = C2.posture(T2, sc.posture);
  const act = u && pr ? u.en.replace('{prop}', pr.signature ? (String(hold).split(/ with |, /)[0] || "her element's own object") : pr.en) : (po && po.en) || '';
  const short = t => String(t).split(/ — |, /)[0].replace(/\s+/g, ' ').trim();   /* 짧게 — 첫 덩어리만(「a mine gallery of rough rock walls, timber props, …」 → 앞 말) */
  return short(p.en) + (act ? ' — ' + short(act) : '');
}
/* 자유 설계 기록의 장면 — 채운 덩어리의 Place · Activity 줄(「…」 그대로면 없음) */
function freeText(text) {
  const g = re => ((re.exec(String(text || '')) || [])[1] || '').trim();
  const place = g(/^Place: (.+)$/m), act = g(/^Activity: (.+)$/m);
  if (!place || /…/.test(place)) return '';
  return place.replace(/\.$/, '') + (act && !/…/.test(act) ? ' — ' + act.replace(/\.$/, '') : '');
}
/* 최근 장면 — 그림 저장소의 모든 카드 일상컷 기록을 올린 날(imported, 없으면 date) 늦은 차례로, 같은 글은 한 번, n 개까지 */
function recentScenes(dir, n = RECENT_N) {
  if (!dir || !fs.existsSync(dir)) return [];
  const rows = [];
  for (const k of fs.readdirSync(dir)) {
    if (!fs.statSync(path.join(dir, k)).isDirectory()) continue;
    for (const f of fs.readdirSync(path.join(dir, k)).filter(x => /-casual\d+\.[a-z0-9_]+-ui\.json$/.test(x))) {
      let r; try { r = JSON.parse(fs.readFileSync(path.join(dir, k, f), 'utf8')); } catch (e) { continue; }
      if (!r || !r.scene) continue;
      const gen = r.generation || {}, text = r.scene.sfree ? freeText(gen.free_design || gen.free_prompt) : sceneText(r.scene, holdOfKey(r.card || k));
      if (text) rows.push({ when: String(r.imported || r.date || ''), at: k + '/' + f, text });
    }
  }
  rows.sort((a, b) => b.when.localeCompare(a.when) || b.at.localeCompare(a.at));
  const out = [];
  for (const r of rows) { if (!out.includes(r.text)) out.push(r.text); if (out.length >= n) break; }
  return out;
}
const MUST = /^(필수 갈래가 없다|먼 컷|가까운 컷|그 원소의 물건을 든 컷이 없다|시대가 |상황 노출 컷이 없다|갈래 자유 컷이 없다)/;
function plan(card, slots, old, { seed = Date.now(), required = '', usage = {}, others = [], recent = [] } = {}) {
  /* 씨앗에 카드 · 세계를 섞는다 — 같은 씨앗이면 카드마다 같은 묶음이 나왔다 */
  const mix = [...(card.key + '|' + (card.world || ''))].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);
  const rUse = rng((seed ^ mix ^ 0x5bd1e995) >>> 0), r = rng((seed ^ mix) >>> 0);
  const ci = P.cards(D).indexOf(card.key), oldEx = old.some(c => EXPOSE_TYPES.includes(requiredType(c))), oldIn = old.some(c => requiredType(c) === 'nation');
  /* 정해 둔 두 갈래 중 아직 없는 것을 앞 칸부터 — 노출 갈래는 카드마다 란제리풍 · 수영복 · 역할극을 돌려 가며 */
  const wants = [oldEx ? '' : (required || EXPOSE_TYPES[Math.max(0, ci) % EXPOSE_TYPES.length]), oldIn ? '' : 'nation'].filter(Boolean);
  const total = slots.length + old.length, oldScene = old.filter(c => !c.sfree);
  const needSitu = total >= SITU_FROM && !old.some(c => c.situ && !requiredType(c));
  /* 자유 설계 칸 — 옷 자유(여섯 장 묶음부터) · 갈래 자유(일곱 장 묶음부터) 중 아직 없는 것을 맨 뒤 번호에. 칸이 모자라면 정해 둔 갈래 · 상황 노출이 먼저 */
  let room = slots.length - wants.length - (needSitu ? 1 : 0);
  const freeKinds = [];
  if (total >= OFREE_FROM && !old.some(c => c.ofree) && room > 0) { freeKinds.push('ofree'); room--; }
  if (total >= GFREE_FROM && !old.some(c => c.gfree) && room > 0) { freeKinds.push('gfree'); room--; }
  const freeNums = slots.slice(slots.length - freeKinds.length);
  slots = slots.slice(0, slots.length - freeKinds.length);   /* 여기부터 slots 는 장면을 짜는 칸만 */
  const needSig = card.g.signature_hold.length > 0 && !old.some(sigProp) && slots.length >= 3;
  const oldFrames = new Set(oldScene.map(c => c.frame));
  for (let attempt = 1; attempt <= 400; attempt++) {
    let frames = FRAMES.filter(f => !oldFrames.has(f)).sort(() => r() - 0.5);
    if (frames.length < slots.length) frames = frames.concat(FRAMES.slice().sort(() => r() - 0.5)).slice(0, slots.length);
    frames = frames.slice(0, slots.length);
    const seen = [...oldScene, ...frames.map(frame => ({ frame }))];
    if (slots.length + oldScene.length >= 3 && (!seen.some(c => FAR.includes(c.frame)) || !seen.some(c => NEAR.includes(c.frame)))) continue;
    /* 시대 — 칸마다 먼저 나눠 준다. 이미 있는 컷까지 세어 몫(ERA_QUOTA)에 비해 가장 덜 쓴 시대부터(같으면 무게대로) */
    const ERAS = tree.eras.map(e => e.key), cnt = Object.fromEntries(ERAS.map(e => [e, 0]));
    old.forEach(c => { if (c.era in cnt) cnt[c.era]++; });
    /* 세계 안 갈래 칸은 「세계 안」 시대로 먼저 세고, 나머지 칸에 덜 쓴 시대부터(같으면 무게대로) 나눈 뒤 정해 둔 칸 뒤쪽만 섞는다 */
    if (wants.includes('nation')) cnt.nation++;
    const eras = [];
    for (let i = 0; i < slots.length; i++) {
      if (wants[i] === 'nation') { eras.push('nation'); continue; }
      const ratio = x => cnt[x] / (ERA_QUOTA[x] || 1), lo = Math.min(...ERAS.map(ratio)), e = weighted(r, Object.fromEntries(ERAS.filter(x => ratio(x) === lo).map(x => [x, ERA_WEIGHT[x] || 1])));
      eras.push(e); cnt[e]++;
    }
    const tail = eras.slice(wants.length).sort(() => r() - 0.5); eras.splice(wants.length, tail.length, ...tail);
    const free = slots.length - wants.length, sigAt = needSig && free > 0 ? wants.length + Math.floor(r() * free) : -1, cuts = [];
    /* 상황 칸 — 정해 둔 칸 뒤, 그 원소의 물건 칸과 다른 칸(빈 칸이 하나뿐이면 같은 칸) */
    let situAt = -1;
    if (needSitu && free > 0) { const pool = []; for (let i = wants.length; i < slots.length; i++) if ((i !== sigAt || free === 1) && !SITU_NO_FRAME.includes(frames[i])) pool.push(i); if (!pool.length) continue; situAt = pool[Math.floor(r() * pool.length)]; }
    for (let i = 0; i < slots.length; i++) {
      let got = null;
      for (let k = 0; k < 60 && !got; k++) {
        const U0 = usageOf(usage), here = { ...U0, prop: { ...U0.prop }, ofam: { ...U0.ofam } }; cuts.forEach(c => { const u = C2.use(T2, c.use); if (u) here.prop[u.prop] = (here.prop[u.prop] || 0) + 10; here.ofam[c.ofam] = (here.ofam[c.ofam] || 0) + 10; });   /* 묶음 안에서 이미 고른 옷 계열은 다시 덜 고른다(동탄룩 한 장까지) */
        const want = wants[i] || '', sc = slot(r, card, want, { frame: frames[i], wantSig: i === sigAt && !want, era: eras[i], usage: here, rUse });
        if (!sc) continue;
        const cand = { n: slots[i], ...sc };
        if (i === situAt && !P.situsFor(outfitEn(cand)).length) continue;   /* 상황 칸엔 상황이 붙는 옷만 */
        if (i === situAt) cand.situ = P.situsFor(outfitEn(cand))[0];   /* 자리 표시 — 묶음이 다 차면 situate 가 고른다 */
        if (!check([...cuts, cand], card, old, others).filter(e => !MUST.test(e)).length) got = cand;
      }
      if (!got) break;
      cuts.push(got);
    }
    if (cuts.length === slots.length && !check(cuts, card, old, others).filter(e => !/^갈래 자유 컷이 없다/.test(e)).length) { colorize(cuts, old, others, rng((seed ^ mix ^ 0x27d4eb2f) >>> 0)); denierize(cuts, rng((seed ^ mix ^ 0x165667b1) >>> 0)); situate(cuts, situAt, old, others, rng((seed ^ mix ^ 0x3c6ef372) >>> 0)); ambient(cuts, old, rng((seed ^ mix ^ 0x7f4a7c15) >>> 0));
      const free = makeFree(card.key, freeNums, freeKinds, cuts, old, others, recent, rng((seed ^ mix ^ 0x1b873593) >>> 0));
      if (!free || check([...cuts, ...free], card, old, others).length) continue;   /* 갈래 자유 칸에 남은 갈래가 없으면(노출 갈래가 장면 컷에 다 들었으면) 다시 */
      const all = [...old, ...cuts, ...free];
      return { cuts: [...cuts, ...free], attempt, required: [...all.map(requiredType).filter(Boolean), ...all.filter(c => c.situ).map(c => 'situ:' + c.situ), ...all.filter(c => c.ofree && c.sfree).map(() => 'ofree'), ...all.filter(c => c.gfree).map(c => 'gfree:' + c.gfree + '+' + c.gsitu)].join(' · ') }; }
  }
  throw new Error('규칙을 다 지키는 묶음을 못 찾았다 — 이미 있는 컷이 칸을 너무 많이 차지했는지 본다');
}

/* 기록 — 생성기 「기록 내보내기」 와 같은 꼴(P.casualRecord) + 그 기록이 놓일 자리 */
const recordRel = (key, world, n, style = STYLE) => `records/${key}/${world}-casual${n}.${style}-ui.json`;
function record(card, world, cut) {
  const { n, ...scene } = cut;
  return { ...P.casualRecord(D, S, card.key, scene, { world, style: STYLE, tree, tree2 }, n), record: recordRel(card.key, world, n) };
}
/* 이미 있는 컷 — 그 세계의 기록(<세계>-casualN.<화풍>-ui.json) */
function oldCuts(dir, card, world) {
  if (!dir || !fs.existsSync(dir)) return [];
  const re = new RegExp('^' + world + '-casual(\\d+)\\.' + STYLE + '-ui\\.json$');
  return fs.readdirSync(dir).filter(f => re.test(f)).map(f => {
    const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    return { n: Number(re.exec(f)[1]), ...(rec.scene.sfree ? { ...rec.scene } : C2.repair(T2, { ...rec.scene }, card.g)), old: true };   /* 자유 설계 칸은 트리로 채우지 않는다 */
  });
}
/* 등록된 그 세계의 일상컷 번호 */
function registered(card, world) {
  const v = (((JSON.parse(read('data/img.json')).img || {})[card.key] || {}).byStyle || {})[STYLE] || {};
  return (((((v.byForm || {})[world] || {}).casual || {}).f) || []).map(f => Number((/_casual(\d+)\.webp$/.exec(f) || [])[1])).filter(Boolean);
}
function freeSlots(card, world, want = CASUAL_N) {
  const taken = new Set(registered(card, world)), out = [];
  for (let n = 1; taken.size + out.length < want; n++) if (!taken.has(n)) out.push(n);
  return out;
}
/* 쓴 횟수 — 그림 저장소의 모든 카드 기록에서(그 카드는 빼고): 소품(그 원소의 물건은 빼고) · 장소 · 옷 · 자세 추천 · 자세 · 표정 */
function sceneUsage(dir, skip) {
  const out = EMPTY_USAGE();
  if (!dir || !fs.existsSync(dir)) return out;
  const add = (m, k) => { if (k) m[k] = (m[k] || 0) + 1; };
  for (const k of fs.readdirSync(dir)) {
    if (k === skip || !fs.statSync(path.join(dir, k)).isDirectory()) continue;
    for (const f of fs.readdirSync(path.join(dir, k)).filter(x => /-casual\d+\.[a-z_]+-ui\.json$/.test(x))) {
      let sc; try { sc = JSON.parse(fs.readFileSync(path.join(dir, k, f), 'utf8')).scene; } catch (e) { continue; }
      if (!sc) continue;
      const u = C2.use(T2, sc.use);
      if (u && u.prop !== 'signature') add(out.prop, u.prop);
      add(out.place, sc.place); add(out.item, sc.item); add(out.preset, sc.preset); add(out.posture, sc.posture); add(out.expr, sc.expr); add(out.ofam, sc.ofam);
      if (sc.preset && sc.place) add(out.path, pathKey(sc.preset, sc.place));
    }
  }
  return out;
}
const propUsage = (dir, skip) => sceneUsage(dir, skip).prop;
function line(c) {
  if (c.sfree) {
    const fam = c.gfree ? (CT.family(tree, c.gfree) || {}).ko || c.gfree : '', si = c.gsitu === 'free' ? '상황 자유' : c.gsitu ? (by(T.CASUAL.situations, c.gsitu) || {}).ko || c.gsitu : '';
    return `${c.old ? '  (있음)' : '  '} ${c.n} ✦  ${c.gfree ? '갈래 자유 — ' + fam + ' · 상황 ' + si : '옷 자유'} │ 장면 통째 자유 설계(장소 · 활동 · 자세 · 구도 · 의상을 GPT · Claude 가 — 최근 장면 ${(c.recent || []).length} 개 피하기)`;
  }
  const p = C2.place(T2, c.place) || {}, f = CT.family(tree, c.ofam) || {}, it = CT.item(tree, c.ofam, c.item), u = C2.use(T2, c.use), pr = by(tree2.presets, c.preset);
  const ko = (list, k) => (by(list, k) || {}).ko || k || '—', hand = k => k === 'prop' ? '소품' : ko(tree2.hands, k);
  return `${c.old ? '  (있음)' : '  '} ${c.n} ${requiredType(c) ? '★' : ' '}${C2.awkward(T2, c.ofam, c.place).length ? '⚠' : ' '} ${(CT.era(tree, c.era) || {}).ko} · ${p.ko} · ${f.ko}${it ? '(' + it.ko + ')' : ''} │ ${pr ? pr.ko : '—'} │ ` +
    `${ko(tree2.postures, c.posture)} · ${c.frame} · ${ko(tree2.body, c.body)} · ${ko(tree2.head, c.head)} · 오른손 ${hand(c.right)} · 왼손 ${hand(c.left)}${u ? ' · ' + ko(tree2.props, u.prop) + ' ' + u.ko : ''}${c.legs ? ' · ' + ko(tree2.legs, c.legs) : ''}${c.gaze ? ' · 시선 ' + ko(tree2.gaze, c.gaze) : ''}${c.situ ? ' · 상황 ' + ko(T.CASUAL.situations, c.situ) : ''}${c.ofree ? ' · 옷 자유(노출 의상을 GPT · Claude 가)' : ''}`;
}

const FLAGS = new Set(['fresh']);
function main(argv) {
  const key = argv[0], opt = {};
  for (let i = 1; i < argv.length; i++) { const k = argv[i].replace(/^--/, ''); opt[k] = FLAGS.has(k) ? true : argv[++i]; }   /* --fresh 는 값 없이 */
  let card;
  try { card = cardOf(key); } catch (e) { console.error(e.message + '\n' + fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 20).join('\n')); return 2; }
  const recDir = opt.records || path.join(ROOT, '..', 'element-atelier-img', 'records', key);
  /* 다른 세계의 컷(그리고 --fresh 면 같은 세계의 옛 묶음까지) — 장면을 돌려쓰지 않게 겹침만 본다 */
  const allOld = w => oldCuts(recDir, { ...card, world: w }, w);
  if (opt.check) {
    const world = opt.world; card.world = world;
    if (!card.worlds.includes(world)) { console.error(`${key} 는 ${card.worlds.join(' · ')} 에 산다 — --world 로 하나`); return 2; }
    /* --from N: 옛 묶음 뒤에 더한 새 묶음(N 번부터)만 묶음으로 보고, 옛 묶음은 겹침에만 넣는다 */
    const from = Number(opt.from || 0), all = oldCuts(opt.check, card, world);
    const cuts = all.filter(c => c.n >= from), others = [...all.filter(c => c.n < from), ...card.worlds.filter(w => w !== world).flatMap(w => oldCuts(opt.check, { ...card, world: w }, w))];
    for (const c of cuts.sort((a, b) => a.n - b.n)) console.log(line(c));
    const errs = cuts.length ? check(cuts.map(c => ({ ...c, old: false })), card, [], others) : [`${world} 일상컷 기록이 없다 — 폴더 · --from 을 확인`];
    /* 자유 설계 칸은 채운 글이 기록에 남아야 한다(2026-11-11 사용자 「어떤 설계 했는지 다 남지?」) — generation.free_prompt 에 「…」 를 채운 지시문 통째 */
    for (const c of cuts.filter(x => x.sfree)) {
      const g = JSON.parse(fs.readFileSync(path.join(opt.check, `${world}-casual${c.n}.${STYLE}-ui.json`), 'utf8')).generation || {}, t = String(g.free_prompt || '');
      if (!/^FREE DESIGN: /m.test(t) || /^(?:Place|Activity|Pose|Framing|Outfit): …/m.test(t)) errs.push(`칸 ${c.n}: 자유 설계 칸인데 채운 설계가 기록에 없다 — generation.free_prompt(실제로 넘긴 지시문 통째, 「…」 를 채운 것) · free_design(채운 덩어리)`);
    }
    for (const e of errs) console.log('  X ' + e);
    console.log(errs.length ? `일상컷 묶음 ${errs.length} 가지 걸림` : `일상컷 묶음 통과 — ${cuts.length} 장`);
    return errs.length ? 1 : 0;
  }
  const worlds = opt.world === 'all' ? card.worlds : [opt.world];
  if (!worlds.every(w => card.worlds.includes(w))) { console.error(`${key} 는 ${card.worlds.join(' · ')} 에 산다 — --world 로 하나 또는 all`); return 2; }
  const fresh = 'fresh' in opt, seed0 = Number(opt.seed || Date.now() % 1e9);
  const usageDir = opt.usage === 'none' ? '' : (opt.usage || path.join(ROOT, '..', 'element-atelier-img', 'records'));
  const extra = (opt.others || '').split(',').filter(Boolean).flatMap(f => JSON.parse(fs.readFileSync(f, 'utf8')).cuts || []);
  const planned = [];
  for (const world of worlds) {
    card.world = world;
    const mine = allOld(world), taken = Math.max(0, ...mine.map(c => c.n), ...registered(card, world));
    /* --fresh: 옛 묶음은 그대로 두고 그 뒤 번호로 새 일곱 장(사용자 2026-11-02 「대체하는건 아니고, 추가로」) */
    const slots = opt.slots ? opt.slots.split(',').map(Number) : fresh ? Array.from({ length: CASUAL_N }, (_, i) => taken + 1 + i) : freeSlots(card, world);
    if (!slots.length) { console.log(`${key} ${world} — 일상컷이 벌써 ${CASUAL_N} 장이다`); continue; }
    const old = fresh ? [] : mine.filter(c => !slots.includes(c.n));
    const others = [...card.worlds.filter(w => w !== world).flatMap(allOld), ...(fresh ? mine : []), ...extra, ...planned];
    const seed = seed0 + worlds.indexOf(world);
    const res = plan(card, slots, old, { seed, required: opt.required || '', usage: sceneUsage(usageDir, key), others, recent: recentScenes(usageDir) });
    planned.push(...res.cuts);
    console.log(`${key} ${world} 일상컷 묶음 — 칸 ${slots.join(',')} · 정해 둔 갈래 ${res.required} · 시도 ${res.attempt} · seed ${seed}${fresh ? ' · 새 묶음(옛 묶음과 겹치지 않게)' : ''}`);
    for (const c of [...old, ...res.cuts].sort((a, b) => a.n - b.n)) console.log(line(c));
    if (opt.out) {
      const out = worlds.length > 1 ? path.join(opt.out, 'plan-' + world) : opt.out;
      fs.mkdirSync(out, { recursive: true });
      for (const c of res.cuts) {
        const rec = record(card, world, c);
        fs.writeFileSync(path.join(out, `${world}-casual${c.n}.${STYLE}-ui.json`), JSON.stringify(rec, null, 1) + '\n');
        fs.writeFileSync(path.join(out, `${world}-casual${c.n}-prompt.txt`), rec.prompt);
      }
      fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify({ card: key, world, seed, tree: 2, style: STYLE, required: res.required, slots, fresh, cuts: res.cuts }, null, 1) + '\n');
      console.log('→ ' + out);
    }
  }
  return 0;
}
module.exports = { ambient, POSE_WEIGHT, cardOf, plan, colorize, denierize, situate, makeFree, sceneText, freeText, recentScenes, SITUS, DENIERS, outfitEn, COLORS, check, record, recordRel, oldCuts, freeSlots, registered, requiredType, propUsage, sceneUsage, CASUAL_N, STYLE, WEIGHT_UNUSED, EXPOSE_TYPES };
if (require.main === module) process.exit(main(process.argv.slice(2)));
