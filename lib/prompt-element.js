/* 지시문 조립 — 표(lib/prompt-spec.js)와 설계표(data/element-design.json)·화풍 판(data/style.json)으로 영어 지시문을 짓는다.
   ES 모듈도 빌드도 쓰지 않는다. window.AtelierPrompt 하나만 붙인다 — 생성기 화면·검사·허브(공방 모음)가 같이 쓴다.

   카드 = 세 층 가운데 하나: 근본(나라) · 가문주(나라-가문) · 주민(나라-가문-주민). 열쇠는 tools/roster.py 와 같은 규칙(하이픈).
   build(D, S, card, world, opts) → 지시문 글. D 는 설계표, S 는 화풍 판(style.json), card 는 카드 열쇠, world 는 세계 열쇠,
   opts 는 { style, notes: {scene, outfit, custom}, look: {params, faceDesignOn, silhouetteOn, exposure}, shot: {scene, time, pose, expr} } — 외형 표는 lib/look-spec.js(없으면 외형 줄을 안 싣는다).
   shot.scene 은 설계표 worlds.<세계>.scenes 의 열쇠(비우면 세계 글의 장소), time 은 T.WORLD_TIMES, pose 는 T.WORLD_POSES(비우면 카드 자세), expr 은 T.EXPRESSION_DETAIL 의 열쇠.
   buildCasual(D, S, card, scene, opts) → 일상컷 지시문(트리 버전2). scene 은 생성기의 버전2 장면, opts 는 { style, tree, tree2 }(표 둘).
   casualFile(card, style, n) · casualRecord(D, S, card, scene, opts, n) 도 같이. */
(function (root) {
  'use strict';
  var SEP = '-';
  var T = root.AtelierSpec;

  function fill(t, m) { return String(t).replace(/\{(\w+)\}/g, function (_, k) { return m[k] != null ? m[k] : ''; }); }
  function trim(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }

  /* 원소 사실 칸 — 번호·기호·이름 */
  function element(D, key) { return (D.elements || []).filter(function (e) { return e.key === key; })[0] || null; }
  function nationOf(D, key) { return (D.nations || []).filter(function (n) { return n.key === key; })[0] || null; }

  /* 카드 열쇠 → {tier, nation, family, citizen, ko, en} */
  function card(D, key) {
    var p = String(key || '').split(SEP), n = nationOf(D, p[0]), e = element(D, p[0]);
    if (!n || !e) return null;
    var out = { key: key, tier: 'root', nation: n, element: e, family: null, citizen: null, ko: e.ko, en: e.en };
    if (p.length === 1) return out;
    var f = (n.families || []).filter(function (x) { return x.key === p[1]; })[0];
    if (!f) return null;
    out.family = f; out.tier = 'lord'; out.ko = f.ko; out.en = f.en;
    if (p.length === 2) return out;
    var c = (f.citizens || []).filter(function (x) { return x.key === p[2]; })[0];
    if (!c || p.length > 3) return null;
    out.citizen = c; out.tier = 'citizen'; out.ko = c.ko; out.en = c.en;
    return out;
  }

  /* 설계표 차례대로 모든 카드 */
  function cards(D) {
    var out = [];
    (D.nations || []).forEach(function (n) {
      out.push(n.key);
      (n.families || []).forEach(function (f) {
        out.push(n.key + SEP + f.key);
        (f.citizens || []).forEach(function (c) { out.push(n.key + SEP + f.key + SEP + c.key); });
      });
    });
    return out;
  }

  /* 이 카드가 사는 세계 — 근본·가문주는 셋 다, 주민은 설계표의 worlds */
  function worldsOf(D, key) {
    var c = card(D, key), all = ((D.vocab || {}).worlds) || T.WORLDS.map(function (w) { return w.key; });
    if (!c) return [];
    if (c.tier !== 'citizen') return all.slice();
    return all.filter(function (w) { return (c.citizen.worlds || []).indexOf(w) >= 0; });
  }

  function styleText(S, styleKey, slot) {
    var st = (S && S.styles || {})[styleKey || (S && S['default'])];
    if (!st) return '';
    var v = (st.versions || []).filter(function (x) { return x.v === st.current; })[0] || (st.versions || [])[0] || {};
    return v[slot || 'text'] || '';
  }
  /* 화풍 판의 얼굴 낱말(2026-11-02 v3) — {'칸.값': 글}. 지시문으로 옮길 때만 바꿔 적는다(설계표 값은 그대로). 옛 판엔 없어 옛 기록 지시문이 그대로 나온다 */
  function styleFace(S, styleKey) {
    var st = (S && S.styles || {})[styleKey || (S && S['default'])];
    if (!st) return {};
    var v = (st.versions || []).filter(function (x) { return x.v === st.current; })[0] || {};
    return v.face || {};
  }
  /* 화풍 판의 표정 글(v3 — 놀람을 낮춘다)과 FACE 줄 끝 한 마디. 옛 판엔 없다 */
  function styleVer(S, styleKey) {
    var st = (S && S.styles || {})[styleKey || (S && S['default'])];
    return st ? (st.versions || []).filter(function (x) { return x.v === st.current; })[0] || {} : {};
  }
  function exprText(S, styleKey, k, fallback) { var e = styleVer(S, styleKey).expr || {}; return e[k] || fallback; }
  function styleVersion(S, styleKey) {
    var st = (S && S.styles || {})[styleKey || (S && S['default'])];
    return st ? st.current : '';
  }

  /* ══ 외형 ══ 설계표의 look(나라 ← 가문이 덮어쓴 것, 주민은 가문 것) + 생성기 외형 칸. 표는 lib/look-spec.js(game 의 외형 선택지 그대로).
     opts.look = { params: {열쇠: 값}, faceDesignOn, silhouetteOn, exposure }. 직접 고른 항목이 설계의 그 묶음을 이긴다(game 의 faceItems·silhouetteItems 와 같은 규칙).
     사용자 2026-10-30 「게임 공방처럼 원소·물질의 특성을 살려 외형 특징을 잡고 가자 — 팔레트 색을 머리·눈 색으로」 */
  /* 세계마다 다른 사람(2026-10-30) — 근본은 나라 → 나라의 그 세계. 세계를 안 주면 공통 값만(색·체형 + 나라 기본).
     가문주·주민이 근본을 너무 따라갔다(사용자 2026-11-01 「가주나 다른 물건들이 근본원소의 외형값을 너무 많이 따라가. 특히 체형은 슬랜더로 치우친」 —
     가문주는 머리·눈 색만 자기 것이고 체형·헤어·얼굴형·눈·눈썹·코·입이 근본 그대로, 주민도 체형·눈썹·코·입이 가문(=근본) 그대로였다).
     이제 가문주는 설계표 가문 look 에 적은 칸만 가문 것이고, 안 적은 칸(체형 · 헤어 · 얼굴형 · 눈 · 눈썹 · 코 · 입)은 가문주 열쇠로 근본과 다르게 돌린다.
     주민은 머리색이 물건의 재질 색, 눈 색은 가문(핏줄), 나머지 일곱은 주민 열쇠로 가문주와도 근본과도 다르게 돌린다. 체형 · 눈썹 · 코 · 입은 세 세계 공통, 헤어 · 얼굴형 · 눈은 세계마다.
     다시(사용자 2026-11-01 「가문주 외형도 근본 쪽 따라갈 필요가 없을거 같아. 각자 그 물질이나 물건을 생각했을 때 떠오르는 이미지로」) — 가문주 · 주민 모두 설계표 look 에
     일곱 칸 + 사는 세계마다 헤어 · 얼굴형 · 눈을 직접 적는다(tools/element-design.py 가 다 찼는지 본다). 아래 돌림은 적힌 칸이 없을 때의 대비로만 남는다 */
  var LOOK_TURN = [['silhouette', 'body', 3, false], ['silhouette', 'hair', 0, true], ['face', 'face_shape', 7, true], ['face', 'eyes', 13, true],
    ['face', 'brows', 19, false], ['face', 'nose', 23, false], ['face', 'lips', 29, false]];
  /* 위로 올려 묶는 머리 — 스팀펑크에선 돌리지 않는다(2026-11-16 삼국지에서 옮긴 올림머리 일곱도, tools/element-design.py UPDO 와 같다) */
  var UPDO = ['updo_bun', 'double_buns', 'chignon', 'messy_bun', 'topknot_tails', 'twin_loops', 'cloud_updo', 'tilted_bun'];
  var OWN_FACE = ['age', 'impression', 'skin_tone', 'eye_size', 'eye_tilt', 'mark', 'expr'];
  function lookOf(c, world) {
    var n = (c.nation.look || {}), f = (c.family && c.family.look) || {}, nw = world && n.worlds && n.worlds[world] || {}, fw = world && f.worlds && f.worlds[world] || {};
    var root = { face: Object.assign({}, n.face || {}, nw.face || {}), silhouette: Object.assign({}, n.silhouette || {}, nw.silhouette || {}) };
    if (!c.family) return root;
    var V = T.VOCAB_EN || {}, wi = Math.max(0, ['fantasy', 'steampunk', 'mecha'].indexOf(world));
    /* 걸음 2 — 세 세계가 갈린다(빼고 남은 목록 길이가 홀수일 때 늘, 짝수면 헤어가 갈라 준다) */
    /* 스팀펑크에선 올림머리로 돌리지 않는다 — 시대 옷차림이 이미 머리를 올리게 당겨서 스팀펑크 그림 스물하나 중 아홉이 올림머리였다(사용자 2026-11-01 「스팀펑크 쪽은 모든 물체에서 헤어스타일이 위로 묶은 머리가 너무 많아」) */
    var turn = function (key, axis, avoid, salt, perWorld) {
      var all = Object.keys(V[axis] || {}).filter(function (k) { return avoid.indexOf(k) < 0 && !(axis === 'hair' && world === 'steampunk' && UPDO.indexOf(k) >= 0); });
      return all.length ? all[(hashKey(key) + salt + (perWorld ? wi * 2 : 0)) % all.length] : avoid[0];
    };
    var mine = { face: Object.assign({}, f.face || {}, fw.face || {}), silhouette: Object.assign({}, f.silhouette || {}, fw.silhouette || {}) };
    var lordKey = c.nation.key + SEP + c.family.key, lord = { face: Object.assign({}, root.face), silhouette: Object.assign({}, root.silhouette) };
    LOOK_TURN.forEach(function (r) { var g = r[0], a = r[1]; if (!mine[g][a] && root[g][a]) lord[g][a] = turn(lordKey, a, [root[g][a]], r[2], r[3]); });
    OWN_FACE.forEach(function (a) { delete lord.face[a]; }); delete lord.silhouette.bangs;
    Object.assign(lord.face, mine.face); Object.assign(lord.silhouette, mine.silhouette);
    if (!c.citizen) return lord;
    var out = { face: Object.assign({}, lord.face), silhouette: Object.assign({}, lord.silhouette) };
    LOOK_TURN.forEach(function (r) { var g = r[0], a = r[1]; if (lord[g][a]) out[g][a] = turn(c.key, a, [lord[g][a], root[g][a]], r[2], r[3]); });
    /* 주민도 제 물건에서 떠오르는 외형을 설계표에 다 적는다(2026-11-01) — 적힌 칸이 이기고, 돌림은 빈칸 대비일 뿐 */
    /* 얼굴 설계 칸(나이감 · 인상 · 피부 · 눈 크기 · 눈꼬리 · 표식 · 표정 · 앞머리)은 물려받지 않는다 — 그 사람 것만(2026-11-01) */
    OWN_FACE.forEach(function (a) { delete out.face[a]; }); delete out.silhouette.bangs;
    var cl = c.citizen.look || {}, cw = world && cl.worlds && cl.worlds[world] || {};
    Object.assign(out.silhouette, cl.silhouette || {}, cw.silhouette || {}); Object.assign(out.face, cl.face || {}, cw.face || {});
    return out;
  }
  /* 열쇠 → 늘 같은 수(가문주 · 주민 외형 돌리기) */
  function hashKey(k) { var x = 0; for (var i = 0; i < String(k).length; i++) x = (x * 31 + String(k).charCodeAt(i)) % 100003; return x; }
  function en(axis, key) { return ((T.VOCAB_EN || {})[axis] || {})[key] || key || ''; }
  function isHex(v) { return typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v); }
  /* 외형 칸 {열쇠: 값} → [[열쇠, 값]] — 외형 묶음(base·build·face·hair)의 값 있는 것만. 직접 입력(__custom__)은 그 글(열쇠_custom)로 */
  function identityParams(params) {
    var out = [];
    if (!T.PARAM_DEFS) return out;
    Object.keys(params || {}).forEach(function (k) {
      var d = T.PARAM_DEFS.filter(function (x) { return x.key === k; })[0], v = params[k];
      if (!d || T.IDENTITY_GROUPS.indexOf(d.group) < 0 || T.IDENTITY_EXCLUDED.indexOf(k) >= 0) return;
      if (v === '__custom__') v = trim(params[k + '_custom']);
      if (!v || v === 'AUTO') return;
      out.push([k, v]);
    });
    return out;
  }
  function chosenKeys(params) { var out = {}; identityParams(params).forEach(function (p) { out[p[0]] = 1; }); return out; }
  /* game 의 paramValues — 저장된 열쇠는 그대로, 풀이만 붙인다 */
  function paramValues(raw) {
    var out = raw.map(function (p) { return p.slice(); });
    var value = function (k) { var p = raw.filter(function (p) { return p[0] === k; })[0]; return p ? p[1] : ''; };
    var has = function (k) { return !!value(k); };
    out = out.map(function (p) {
      var guide = T.PARAM_GUIDES[p[0]] && T.PARAM_GUIDES[p[0]][p[1]];
      if (p[0] === 'hair length' && guide && T.HAIR_LENGTH_LIMITS[value('hairstyle')]) return [p[0], T.HAIR_LENGTH_LIMITS[value('hairstyle')][1]];
      if (p[0] === 'eye shape' && ((p[1] === 'large' && has('eye size')) || (p[1] !== 'large' && has('eye tilt'))) && T.EYE_CONTOURS[p[1]]) return [p[0], T.EYE_CONTOURS[p[1]]];
      if (T.COLOR_KEYS[p[0]] && isHex(p[1])) return [p[0], p[1].toUpperCase()];
      return [p[0], guide ? p[1] + ' — ' + guide[1] : p[1]];
    });
    if (has('body type')) out.push(['body scope', 'Body type sets the build; body details adjust within it. These describe anatomy beneath the costume, not costume volume.']);
    if (has('hairstyle')) out.push(['hair scope', 'Keep the cut and its fixed length; other hair settings adjust within it. Hair choices do not set ethnicity.']);
    if (T.FACE_KEYS.some(has)) out.push(['facial precedence', 'Explicit facial geometry controls the actual outline, above style, ethnicity or demeanor; shading and expression must not reshape it.']);
    if (has('facial character')) out.push(['demeanor scope', 'Facial character affects demeanor only; preserve age and geometry. Explicit scene expression takes priority.']);
    if (has('facial ethnicity')) out.push(['ethnicity scope', 'Broad ancestry cue with individual variation; preserve explicit geometry, skin tone and hair. No stereotyped features.']);
    var right = value('eye color'), left = value('second eye color');
    out = out.filter(function (p) { return p[0] !== 'second eye color'; });
    if (left && left !== right) out.push(['heterochromia', 'Character-relative right eye is ' + (right || 'one chosen primary color, different from ' + left) + '; left eye is ' + left + '. Keep the sides; do not blend colors.']);
    else if (right) out.push(['eye color consistency', 'both eyes are ' + right]);
    return out;
  }
  /* 설계의 얼굴 여섯 → FACE 줄 항목. 직접 고른 묶음·끈 경우는 빠진다 */
  function faceItems(c, look, world, fw) {
    look = look || {}; fw = fw || {}; var f = lookOf(c, world).face, chosen = chosenKeys(look.params);
    if (look.faceDesignOn === false || !T.FACE_PARAM) return [];
    var base = Object.keys(T.FACE_PARAM).filter(function (k) { return f[k] && !chosen[T.FACE_PARAM[k]]; }).map(function (k) { return [k, fw[k + '.' + f[k]] || en(k, f[k])]; });
    if (!designedFace(f)) return base.map(function (p) { return p[1]; });
    /* 얼굴 설계(2026-11-01) — 인상이 먼저, 피부 · 윤곽 · 눈(크기 · 꼬리 · 모양) · 눈썹 · 코 · 입 · 눈 색 · 표식 */
    var FD = T.FACE_DESIGN, d = function (k) { return f[k] && FD[k][f[k]] && !chosen[FD.param[k]] ? (fw[k + '.' + f[k]] || FD[k][f[k]]) : ''; }, get = function (k) { var p = base.filter(function (x) { return x[0] === k; })[0]; return p ? p[1] : ''; };
    var eyes = [d('eye_size'), get('eyes')].filter(Boolean).join(' — ') + (d('eye_tilt') ? ', ' + d('eye_tilt') : '');
    var imp = d('impression');
    return [imp ? 'first impression — ' + imp : '', d('skin_tone'), get('face_shape'), eyes, get('brows'), get('nose'), get('lips'), get('eye_color'), d('mark')].filter(function (x) { return x && x !== ', '; });
  }
  function designedFace(f) { return !!(T.FACE_DESIGN && f && f.impression && T.FACE_DESIGN.impression[f.impression]); }
  /* 설계의 실루엣 셋 → SILHOUETTE 줄 항목 */
  function silhouetteItems(c, look, world) {
    look = look || {}; var s = lookOf(c, world).silhouette, chosen = chosenKeys(look.params), out = [];
    if (look.silhouetteOn === false || !T.SIL_PARAM) return out;
    if (s.body && !chosen[T.SIL_PARAM.body]) out.push(en('body', s.body) + ' build');
    if (s.hair && !chosen[T.SIL_PARAM.hair]) out.push(en('hair', s.hair) + (s.bangs && T.FACE_DESIGN && T.FACE_DESIGN.bangs[s.bangs] && !chosen.bangs ? ' with ' + T.FACE_DESIGN.bangs[s.bangs] : ''));
    if (s.hair_color && !chosen[T.SIL_PARAM.hair_color]) out.push(en('hair_color', s.hair_color));
    return out;
  }
  function ageLine(look, f) {
    var v = ((look || {}).params || {})['apparent age'];
    if (v === '__custom__') v = trim((look.params || {})['apparent age_custom']);
    /* 설계표 나이감(2026-11-01) — 모두에게 같은 「soft full cheeks · soft smile」 줄이 얼굴을 하나로 만들었다 */
    if ((!v || v === 'AUTO') && f && f.age && T.FACE_DESIGN && T.FACE_DESIGN.age[f.age]) return T.FACE_DESIGN.age[f.age];
    if (!v || v === 'AUTO') v = T.AGE_DEFAULT;
    return T.AGE_LINES ? (T.AGE_LINES[v] || ('AGE: ' + v + '.')) : '';
  }
  /* 노출 — 비우면 싣지 않는다. 과감은 세계에 제 문장이 있으면 그것(판타지·스팀펑크 — 2026-10-30), 없으면 겉옷 꼴로 공용 문장(EXPOSURE_LAYER) */
  function exposureLine(look, world, citizen) {
    var e = T.EXPOSURE && T.EXPOSURE[(look || {}).exposure];
    if (!e) return '';
    if (typeof e === 'string') return e;
    var W = T.WORLDS.filter(function (w) { return w.key === world; })[0];
    if (W && W.exposureBold) return citizen && T.CITIZEN_EXPOSURE_BOLD && W.exposureBoldCitizen !== true ? T.CITIZEN_EXPOSURE_BOLD : W.exposureBold;   /* 메카는 주민도 장갑이라 세계 문장(exposureBoldCitizen) */
    return e[T.EXPOSURE_LAYER[world]] || e.open;
  }
  /* 생성기·허브가 저장한 외형 칸을 바로잡는다 — 모르는 열쇠는 버리고, 노출은 아는 값만 */
  function normLook(raw) {
    raw = raw && typeof raw === 'object' ? raw : {};
    var out = { params: {}, faceDesignOn: raw.faceDesignOn !== false, silhouetteOn: raw.silhouetteOn !== false, exposure: T.EXPOSURE_DEFAULT || '' };
    if (T.EXPOSURE_KEYS && T.EXPOSURE_KEYS.indexOf(raw.exposure) >= 0) out.exposure = raw.exposure;
    var p = raw.params && typeof raw.params === 'object' ? raw.params : {};
    Object.keys(p).forEach(function (k) {
      var base = k.replace(/_custom$/, ''), d = (T.PARAM_DEFS || []).filter(function (x) { return x.key === base; })[0];
      if (d && typeof p[k] === 'string' && p[k]) out.params[k] = p[k];
    });
    return out;
  }

  /* 그 카드·세계의 장면 변주 — 가문이 세계 글을 덮어썼으면 가문의 scenes, 아니면 나라의 */
  function scenesOf(c, world) {
    var fw = ((c.family && c.family.worlds) || {})[world], nw = (c.nation.worlds || {})[world] || {};
    return ((fw && fw.scenes) || nw.scenes || []).slice();
  }
  function byKey(list, k) { return (list || []).filter(function (r) { return r.key === k; })[0] || null; }
  /* 실루엣(2026-11-09 사용자 「삼국지처럼 세계컷 의상도 다양화 시켜서, 원소 특징에 맞게 분배 시켜줘」) — 고른 값(shot.frame), 안 고르면 카드 설계값
     (근본 · 가문주의 sil.<세계> — tools/sil-spread.py 가 원소 성격대로 나눴다), 'free' 면 없음. 주민은 그 물건이 옷을 정해 설계값이 없다(고르면 쓴다) */
  function silOf(c, world, shot) {
    var f = trim((shot || {}).frame), L = (T.SILHOUETTES || {})[world];
    if (f === 'free' || !c) return null;
    var own = c.citizen ? null : ((c.family || c.nation || {}).sil || {})[world];
    return byKey(L, f) || byKey(L, trim(own));
  }
  /* 세계 그림 칸(장면·시간대·자세·표정·실루엣)을 바로잡는다 — 모르는 열쇠는 비운다 */
  function normShot(D, key, world, raw) {
    raw = raw && typeof raw === 'object' ? raw : {};
    var c = card(D, key), out = { scene: '', time: '', pose: '', expr: '', frame: '' };
    if (raw.frame === 'free' || byKey((T.SILHOUETTES || {})[world], raw.frame)) out.frame = raw.frame;
    if (c && byKey(scenesOf(c, world), raw.scene)) out.scene = raw.scene;
    if (byKey(T.WORLD_TIMES, raw.time)) out.time = raw.time;
    if (byKey(T.WORLD_POSES, raw.pose)) out.pose = raw.pose;
    if (T.EXPRESSION_DETAIL && T.EXPRESSION_DETAIL[raw.expr]) out.expr = raw.expr;
    return out;
  }

  /* ══ 구조판(2026-11-04 — 화풍 판의 format: structured, 지금 기본 semireal) ══
     사용자 「이런구조로 가자」 → 「이걸 기본화풍으로 처음부터 만들거야」 → 「생성기부터 손봐줘」. 채팅으로 손수 짓던 틀을 생성기가 짓는다:
     공통 적용 규칙(판의 rules) → [일상컷 규칙(casual_rule)] → 1절 작화 고정(section1) → 2절 캐릭터 외형 → 3절 코디네이션 → 4절 장면. 칸 값은 [ ] 안.
     칸 값 차례: 기본(설계표 · 세계 문장 · 표 STRUCT) → 그 카드의 손으로 쓴 칸(설계표 struct.<세계>."2"·"3"·"4", 일상컷 2절은 "c2") → 생성기에서 직접 고른 외형 · 장면 · 덧붙임.
     설계 값은 한글 낱말 표(STRUCT.ko — 2026-11-04 「한글로 나오게」), 표에 없으면 영어 문구. 체형 여덟 칸은 STRUCT.body. */
  var FN = null;   /* 칸 이름 — 표 STRUCT.f(조립부에 한글을 두지 않는다) */
  function structVer(S, styleKey) { FN = FN || T.STRUCT.f; var v = styleVer(S, styleKey); return v && v.format === 'structured' && v.section1 ? v : null; }
  var HEAD_RE = /^[A-Z][A-Z &\/-]*(?: \([^)]*\))?: /;
  function bare(s) { return trim(String(s || '').replace(HEAD_RE, '')); }
  function noDot(s) { return trim(s).replace(/[.;:]+$/, ''); }
  /* 받침 — 괄호 앞 낱말의 끝 글자. 숫자는 읽는 소리(영 · 일 · 삼 · 육 · 칠 · 팔 · 십 은 받침) */
  function batchim(w) { var ch = String(w || '').replace(/\s*\([^)]*\)\s*$/, '').replace(/["']+$/, '').slice(-1), code = ch.charCodeAt(0); if (/[0-9]/.test(ch)) return '0136780'.indexOf(ch) >= 0; return code >= 0xAC00 && code <= 0xD7A3 && (code - 0xAC00) % 28 > 0; }
    function cardObj(c) { return c.citizen || c.family || c.nation; }
  function structOf(c, world) { var s = (cardObj(c).struct || {})[world]; return s && typeof s === 'object' ? s : {}; }
  function worldKo(c, world) { var fw = ((c.family && c.family.worlds) || {})[world], nw = (c.nation.worlds || {})[world] || {}; return trim((fw && fw.ko) || nw.ko); }
  function worldOf(c, world) { return ((c.family && c.family.worlds) || {})[world] || (c.nation.worlds || {})[world] || {}; }
  /* 누구인가 — 층마다 한 문장(근본 · 가문주 · 주민) */
  function whoKo(c) {
    var e = c.element, Wd = T.STRUCT.words, pp = function (w) { return batchim(w) ? Wd.eul : Wd.reul; };
    if (c.tier === 'root') return fill(Wd.root, { ko: e.ko, symbol: e.symbol, number: e.number, p: pp(e.ko) });
    if (c.tier === 'lord') return fill(Wd.lord, { family: c.family.ko, family_en: c.family.en, nation: e.ko, p: pp(c.family.ko) });
    return fill(Wd.citizen, { nation: e.ko, family: c.family.ko, object: c.citizen.ko, object_en: trim((c.citizen.object || {}).en), p: pp(c.citizen.ko) }) + (c.citizen.wear ? Wd.citWear : Wd.citMotif);
  }
  /* 영어 줄이 가리키던 옛 머리말(WORLD · SCENE · PROP · CROP · GAZE · COMPOSITION)을 구조판 칸 이름으로 */
  var REFS = null;
  function refs(s) { REFS = REFS || T.STRUCT.refs.map(function (r) { return [new RegExp(r[0], 'g'), r[1]]; }); return REFS.reduce(function (x, r) { return x.replace(r[0], r[1]); }, String(s)); }
  function sectionText(title, names, vals, extra) {
    var H = T.STRUCT.heading, rows = names.map(function (n) { return H.indexOf(n) >= 0 ? n + ':' : n + ': [' + refs(vals[n] != null ? vals[n] : '') + ']'; });
    (extra || []).forEach(function (x) { if (trim(x[1])) rows.push(x[0] + ': [' + refs(trim(x[1])) + ']'); });
    return title + '\n\n' + rows.join('\n\n');
  }
  function overrideVals(vals, ov, names) { Object.keys(ov || {}).forEach(function (k) { if (names.indexOf(k) >= 0 && typeof ov[k] === 'string' && trim(ov[k])) vals[k] = trim(ov[k]); }); return vals; }
  function joinOn(a, b, sep) { return trim(a) ? (trim(b) ? trim(a) + (sep || ' — ') + trim(b) : trim(a)) : trim(b); }
  /* 생성기에서 직접 고른 외형 칸 → 2절 칸. 「바꾼다」 는 그 칸의 설계 값을 고른 값으로, 「더한다」 는 고른 값을 앞에 붙인다. 표에 없는 것(풀이 줄 포함)은 「직접 고른 외형」 칸 */
  function applyChosen(vals, look) {
    var rest = [], got = {};
    paramValues(identityParams((look || {}).params)).forEach(function (p) {
      var to = T.STRUCT.paramField[p[0]];
      if (!to) { rest.push(p[0] + ': ' + p[1]); return; }
      var fk = T.STRUCT.f[to[0]], g = got[fk] || (got[fk] = { replace: false, items: [] });
      g.items.push(p[0] + ': ' + p[1]); if (to[1]) g.replace = true;
    });
    Object.keys(got).forEach(function (k) { var g = got[k], s = g.items.join('; '); vals[k] = g.replace ? s : joinOn(s, vals[k], '; '); });
    return rest;
  }
  /* 2절 — 세계 그림. 설계표 look(lookOf)의 값 */
  function s2World(c, world, look, S, styleKey) {
    var F = T.STRUCT.fixed, FD = T.FACE_DESIGN || {}, KO = T.STRUCT.ko, L = lookOf(c, world);
    var f = look.faceDesignOn === false ? {} : L.face, s = look.silhouetteOn === false ? {} : L.silhouette, v = {};
    /* 한글 낱말 표(STRUCT.ko)가 먼저, 없으면 영어 문구 */
    var d = function (axis, k) { return k ? ((KO[axis] || {})[k] || en(axis, k)) : ''; };
    var fd = function (axis, k) { return k && ((KO[axis] || {})[k] || (FD[axis] && FD[axis][k])) || ''; };
    var imp = fd('impression', f.impression);
    v[FN.concept] = whoKo(c) + fill(T.STRUCT.words.world, { world: worldRow(world).ko }) + (imp ? T.STRUCT.words.impression + imp : '');
    var ageKo = f.age ? KO.age[f.age] || (FD.age && FD.age[f.age] ? noDot(bare(FD.age[f.age])) : '') : '';
    v[FN.age] = T.STRUCT.words.adult + (T.STRUCT.age[f.age] ? ', ' + T.STRUCT.age[f.age] : '') + (ageKo ? ' — ' + ageKo : '');
    v[FN.faceSize] = F.faceSize;
    v[FN.faceShape] = d('face_shape', f.face_shape) || F.noDesign;
    v[FN.placement] = F.placement;
    var eyes = [fd('eye_size', f.eye_size), d('eyes', f.eyes), fd('eye_tilt', f.eye_tilt)].filter(Boolean).join(', ');
    v[FN.eyes] = (eyes || F.noDesign) + (f.brows ? ', ' + d('brows', f.brows) : '');
    v[FN.eyeColor] = d('eye_color', f.eye_color) || F.noDesign;
    v[FN.pupil] = F.pupil;
    v[FN.nose] = d('nose', f.nose) || F.noDesign;
    var mark = fd('mark', f.mark), lipMark = /lip|gloss/.test(f.mark || '');
    v[FN.lips] = (d('lips', f.lips) || F.noDesign) + (mark && lipMark ? ', ' + mark : '');
    v[FN.skin] = (fd('skin_tone', f.skin_tone) || F.noDesign) + (mark && !lipMark ? ', ' + mark : '');
    v[FN.hairColor] = d('hair_color', s.hair_color) || F.noDesign;
    var hw = (T.STRUCT.worlds[world] || {}).hair;
    v[FN.hair] = s.hair ? d('hair', s.hair) + (s.bangs && fd('bangs', s.bangs) ? ', ' + fd('bangs', s.bangs) : '') + (hw ? ' — ' + ((T.STRUCT.worlds[world].tiedHair || []).indexOf(s.hair) >= 0 ? T.STRUCT.worlds[world].hairTied : hw) : '') : F.noDesign;
    var B = T.STRUCT.body[s.body];
    T.STRUCT.bodyKeys.forEach(function (k, i) { v[k] = B ? B[i] : (i === 0 && s.body ? en('body', s.body) + ' build' : F.noDesign); });
    return v;
  }
  function paletteOf(c) { return [trim((c.nation.palette || {}).en), c.family ? trim((c.family.palette || {}).en) : ''].filter(Boolean).join('; '); }
  function s3World(c, world, look, m) {
    var F = T.STRUCT.fixed, n = c.nation, cit = c.tier === 'citizen', nw = worldOf(c, world), WS = T.STRUCT.worlds[world] || {}, v = {};
    /* 성질은 설계표의 한글(traits.ko — 나라는 목록, 가문은 한 줄), 없으면 영어 한 줄 */
    var tko = function (tr) { tr = tr || {}; var k = Array.isArray(tr.ko) ? tr.ko.join(', ') : trim(tr.ko); return trim(k) || noDot(tr.en); };
    var traits = [T.STRUCT.words.traitsN + tko(n.traits)];
    if (c.family && c.family.traits && (trim(c.family.traits.en) || c.family.traits.ko)) traits.push(T.STRUCT.words.traitsF + tko(c.family.traits));
    if (cit) traits.push(T.STRUCT.words.object + trim((c.citizen.object || {}).en));
    var ex = exposureLine(look, world, cit);
    v[FN.philosophy] = joinOn(WS.philosophy, traits.join('; '), ' · ') + (ex ? T.STRUCT.words.expo + bare(ex) : '');
    v[FN.colors] = paletteOf(c) || F.noDesign;
    v[FN.materials] = T.STRUCT.materials[world] || F.noDesign;
    var mfs = silOf(c, world, look && look._shot);
    v[FN.top] = (mfs ? mfs.kot + ' — ' : '') + (world === 'mecha' ? noDot(nw.design) + (cit ? '. ' + noDot(T.CITIZEN_MECHA) : '') : (cit ? WS.citTop : WS.top) || F.noDesign);
    v[FN.bottom] = cit && world !== 'mecha' ? F.sameAsTop : WS.bottom || F.sameAsTop; v[FN.shoes] = cit && world !== 'mecha' ? F.sameAsTop : WS.shoes || F.sameAsTop;
    v[FN.accessory] = fill(F.accessory, m);
    v[FN.gear] = cit && c.citizen.wear ? F.handsWear : F.handsEmpty;
    var note = cit && c.citizen.notes && c.citizen.notes[world] ? trim(c.citizen.notes[world].en) : '';
    v[FN.extra] = joinOn(note, cit ? '' : WS.extra, '; ') || F.noneExtra;
    return v;
  }
  function s4World(c, world, m) {
    var F = T.STRUCT.fixed, nw = worldOf(c, world), WS = T.STRUCT.worlds[world] || {}, wko = worldKo(c, world), v = {};
    v[FN.action] = F.action; v[FN.hands] = F.hands; v[FN.expr] = F.expr; v[FN.gaze] = F.gaze; v[FN.motion] = F.motion;
    v[FN.frame] = F.frame; v[FN.camera] = F.camera; v[FN.light] = WS.light || F.light; v[FN.palette] = joinOn(paletteOf(c), WS.palette) || F.noDesign;
    v[FN.background] = joinOn(wko, noDot(nw.en)) + '. ' + fill(F.text, m);
    v[FN.effects] = WS.effects || F.effects;
    return v;
  }
  function buildStructured(D, S, key, world, opts, sv) {
    var c = card(D, key); if (!c) return '';
    if (!worldRow(world)) return '';
    var look = normLook(opts.look), shot = normShot(D, key, world, opts.shot), notes = opts.notes || {}, ST = T.STRUCT, F = ST.fixed, e = c.element;
    var m = { symbol: e.symbol, number: e.number, number_eul: batchim(String(e.number)) ? T.STRUCT.words.eul : T.STRUCT.words.reul }, own = structOf(c, world), sec = sv.sections || [];
    /* 2절 — 기본 → 손으로 쓴 칸 → 직접 고른 외형 */
    var v2 = overrideVals(s2World(c, world, look, S, opts.style), own['2'], ST.s2), rest2 = applyChosen(v2, look);
    /* 3절 — 노출은 기본이 아닌 값을 고르면 손으로 쓴 칸 뒤에도 붙인다. 덧붙임의 의상 · 소품은 부가 요소 앞에 */
    var v3 = overrideVals(s3World(c, world, Object.assign({}, look, { _shot: shot }), m), own['3'], ST.s3);
    if (own['3'] && own['3'][FN.philosophy] && look.exposure !== T.EXPOSURE_DEFAULT) { var ex = exposureLine(look, world, c.tier === 'citizen'); v3[FN.philosophy] += T.STRUCT.words.expoChosen + (ex ? bare(ex) : F.noDesign); }
    if (trim(notes.outfit)) v3[FN.extra] = joinOn(trim(notes.outfit), v3[FN.extra] === F.noneExtra ? '' : v3[FN.extra], '; ');
    /* 4절 — 고른 자세 · 표정 · 시간대 · 장소, 덧붙임의 장소 · 추가 연출이 이긴다. 표정은 고른 것 → 손으로 쓴 칸 → 설계표 기본 표정 */
    var v4 = s4World(c, world, m), dz = look.faceDesignOn === false ? {} : lookOf(c, world).face;
    var KO = ST.ko, exprOf = function (k) { return KO.expr[k] || noDot(exprText(S, opts.style, k, T.EXPRESSION_DETAIL[k])); };
    if (dz.expr && T.EXPRESSION_DETAIL[dz.expr]) v4[FN.expr] = exprOf(dz.expr);
    overrideVals(v4, own['4'], ST.s4);
    var po = byKey(T.WORLD_POSES, shot.pose); if (po) { v4[FN.action] = KO.pose[po.key] || noDot(po.en); v4[FN.hands] = F.handsPose; }
    if (shot.expr) v4[FN.expr] = exprOf(shot.expr);
    var tm = byKey(T.WORLD_TIMES, shot.time); if (tm) v4[FN.light] = KO.time[tm.key] || noDot(bare(tm.en));
    var scn = byKey(scenesOf(c, world), shot.scene), bg = v4[FN.background];
    if (scn) bg = joinOn(bg, T.STRUCT.words.scene + scn.ko + ' — ' + noDot(scn.en), ' · ');
    if (trim(notes.scene)) bg = joinOn(bg, T.STRUCT.words.note + trim(notes.scene), ' · ');
    v4[FN.background] = bg;
    return [sv.rules, sv.section1,
      sectionText(sec[0] || T.STRUCT.words.sec[0], ST.s2, v2, [[ST.extra.s2, rest2.join('; ')]]),
      sectionText(sec[1] || T.STRUCT.words.sec[1], ST.s3, v3),
      sectionText(sec[2] || T.STRUCT.words.sec[2], ST.s4, v4, [[ST.extra.s4, trim(notes.custom)]])].join('\n\n');
  }
  /* 일상컷 구조판 — buildCasual 이 고른 장면을 casualDetailsV2 로 영어 줄로 짓고, 그 줄을 머리말대로 칸에 나눠 싣는다. 얼굴 · 화풍 · 옷 바꾸기 규칙은 일상컷 규칙(casual_rule)이 한글로 쥔다 */
  function casualStructured(c, wr, sc, t, m, fx, sv, ex, extraRows) {
    var C = root.AtelierCasualTreeV2, CL = T.CASUAL, ST = T.STRUCT, K = ST.casual, sec = sv.sections || [], own = structOf(c, wr.key);
    var f = C.frame(t, sc.frame), body = (t.v2.body || []).filter(function (r) { return r.key === sc.body; })[0] || {}, head = (t.v2.head || []).filter(function (r) { return r.key === sc.head; })[0] || {};
    var close = T.CLOSE_FRAMES.indexOf(trim(sc.frame)) >= 0;
    var got = { place: [], light: [], hair: '', outfit: '', action: [], comp: '', lens: '', hands: [], prop: '', gaze: '', expr: '', note: [], custom: '', expo: '', axes: [], other: [] };
    var HANDS = T.STRUCT.words.hands;
    casualDetailsV2(sc, t, m, ex).forEach(function (l) {
      var r;
      if ((r = /^Place: (.*)$/.exec(l))) got.place.push(noDot(r[1]));
      else if ((r = /^Time of day: (.*)$/.exec(l))) got.light.push(ST.ko.ctime[sc.time] || noDot(r[1]));
      else if ((r = /^Weather \/ season: (.*)$/.exec(l))) got.light.push(noDot(r[1]));
      else if ((r = /^Light direction: (.*)$/.exec(l))) got.light.push(noDot(r[1]));   /* 빛의 방향(2026-11-13) */
      else if ((r = /^Hair: (.*)$/.exec(l))) got.hair = ST.ko.chair[sc.hair] || noDot(r[1]);
      else if ((r = /^Outfit: (.*)$/.exec(l))) got.outfit = noDot(r[1]);
      else if ((r = /^(?:POSTURE|SUPPORT): (.*)$/.exec(l))) got.action.push(noDot(r[1]));
      else if ((r = /^LEGS: (.*)$/.exec(l))) got.action.push(T.STRUCT.words.legs + noDot(r[1]));
      else if ((r = /^COMPOSITION: (.*)$/.exec(l))) got.comp = noDot(r[1]);
      else if ((r = /^Lens \/ perspective: (.*)$/.exec(l))) got.lens = noDot(r[1]);
      else if ((r = /^(BOTH HANDS|RIGHT HAND|LEFT HAND): (.*)$/.exec(l))) got.hands.push(HANDS[r[1]] + ': ' + noDot(r[2]));
      else if ((r = /^PROP: (.*)$/.exec(l))) got.prop = noDot(r[1]);
      else if ((r = /^GAZE: (.*)$/.exec(l))) got.gaze = noDot(r[1]);
      else if ((r = /^EXPRESSION: (.*)$/.exec(l))) got.expr = ST.ko.expr[sc.expr] || noDot(r[1]);
      else if ((r = /^Scene note: (.*)$/.exec(l))) got.note.push(T.STRUCT.words.note + noDot(r[1]));
      else if ((r = /^Note: (.*)$/.exec(l))) got.custom = noDot(r[1]);
      else if ((r = /^skin_exposure: (.*)$/.exec(l))) got.expo = 'skin_exposure: ' + noDot(r[1]);
      else if (/^\w+: /.test(l) && T.LOCAL_AXES.indexOf(l.split(':')[0]) >= 0) got.axes.push(noDot(l));
      else got.other.push(noDot(l));
    });
    /* 2절 — 첨부 그림 그대로(그 카드의 c2 칸이 덮어쓴다), 머리를 바꾸는 장면이면 그 줄이 이긴다 */
    var v2 = {}; ST.s2.forEach(function (n) { v2[n] = K.same; });
    v2[FN.concept] = fill(K.concept, { world: wr.ko, who: whoKo(c) }); v2[FN.age] = K.age; v2[FN.hair] = K.hair;
    overrideVals(v2, own.c2, ST.s2);
    if (got.hair) v2[FN.hair] = fill(K.hairChange, { hair: got.hair });
    var v3 = {};
    v3[FN.philosophy] = K.philosophy + (got.expo ? T.STRUCT.words.expo + got.expo : '');
    v3[FN.colors] = K.colors; v3[FN.materials] = K.materials;
    v3[FN.top] = got.outfit || K.colors; v3[FN.bottom] = ST.fixed.sameAsTop; v3[FN.shoes] = K.shoes;
    v3[FN.accessory] = isCosplay(t, sc) && (CL.cosplay || {}).accessory ? CL.cosplay.accessory : fill(K.accessory, m); v3[FN.gear] = got.prop || K.handsEmpty; v3[FN.extra] = got.custom || ST.fixed.noneExtra;
    var v4 = {};
    v4[FN.action] = got.action.join(' · ') || K.motion;
    v4[FN.hands] = got.hands.concat(got.other.filter(function (l) { return /\barm\b|elbow|hand/i.test(l); })).join(' · ') || K.motion;
    v4[FN.expr] = (got.expr || K.exprNone) + K.exprTail;
    v4[FN.gaze] = joinOn(got.gaze || K.motion, body.far && head.look_back ? bare(CL.lookBack) : '', ' · ');
    v4[FN.motion] = K.motion;
    v4[FN.frame] = [T.ASPECT_FRAME[fx.aspect], got.comp, close ? bare(fill(CL.crop, { edge: T.CROP_EDGE[trim(sc.frame)] })) : ''].filter(Boolean).join(' — ');
    v4[FN.camera] = joinOn(got.lens, bare(CL.angle), ' · ');
    v4[FN.light] = got.light.join(' · ') || K.motion;
    v4[FN.palette] = K.palette;
    v4[FN.background] = got.place.concat(extraRows.map(noDot), got.note).filter(Boolean).join(' — ') + '. ' + fill(ST.fixed.text.split('. ')[0] + '. ', m) + ({ companion: K.textCompanion, background: K.textAnimals }[creatureKind(t, sc)] || K.text);
    v4[FN.effects] = K.motion;
    var rest = got.axes.concat(got.other.filter(function (l) { return !/\barm\b|elbow|hand/i.test(l); }));
    /* 얼굴 고정 — 일상컷 규칙 줄 끝에 한 문장, 1절 마지막 NEGATIVE 줄 끝에 금지 낱말(세계 그림의 1절은 그대로) */
    var s1 = sv.section1.replace(/^(02 NEGATIVE - .*?)\s*$/m, function (all, l) { return l + ', ' + K.negative; });
    if (s1 === sv.section1) s1 += '\n\n02 NEGATIVE - ' + K.negative;
    return [sv.rules, T.STRUCT.words.casualRule + sv.casual_rule + ' ' + K.faceLock, s1,
      sectionText(sec[0] || T.STRUCT.words.sec[0], ST.s2, v2),
      sectionText(sec[1] || T.STRUCT.words.sec[1], ST.s3, v3),
      sectionText(sec[2] || T.STRUCT.words.sec[2], ST.s4, v4, [[ST.extra.s4, rest.join(' · ')]])].join('\n\n');
  }

  /* 동물 줄(2026-11-23) — 돌봄 장소(묶음 companion)는 한 사람 + 동물 한 마리, 동물원 · 수족관 · 동물 카페 · 연못(animals)은 배경에만, 나머지는 동물 없음.
     짧은 판 끝 줄의 「One figure in focus」 를 돌봄 장소에선 동료 줄로, 아니면 뒤에 동물 줄을 붙인다. 자유 설계 칸(sfree · ofree)은 장소가 없어 동물 없음 */
  function creatureKind(t, sc) {
    var C = root.AtelierCasualTreeV2, k = sc && !sc.sfree && !sc.ofree && sc.place;
    if (!k || !C) return 'none';
    return C.companionAt(t, k) ? 'companion' : C.animalsAt && C.animalsAt(t, k) ? 'background' : 'none';
  }
  function creatureEnd(t, sc, end) {
    var CR = T.CASUAL.creatures, k = creatureKind(t, sc);
    if (k !== 'companion') return end + ' ' + CR[k];
    return end.replace(/^One figure in focus[.,]\s*(\w)/, function (all, ch) { return CR.companion + ' ' + ch.toUpperCase(); });
  }
  /* ── 짧은 판(2026-11-09 삼국지 공방에서 옮김 — 사용자 「element 쪽도 생성기 구조 sam 쪽에 맞추자. 간결버전에 일상컷도 간결, 갈래추가」) ── */
  function worldShortOn(S, styleKey) { var row = styleVer(S, styleKey) || {}; return row.worldShort === false || row.format === 'structured' ? false : !!(row.worldShort || (S && S.worldShort)); }
  /* 짧은 세계 그림 — 줄 꼴 판의 긴 지시문(CONCEPT · TRAITS · AGE · SILHOUETTE · FACE · WORLD · EXPOSURE · EXPRESSION)에서 설계 칸만 뽑는다 */
  /* 짧은 판의 「직접 고른 외형」 한 줄 — 긴 판 IDENTITY 칸과 같은 값(나이는 Age 줄이 쥔다) */
  function chosenLine(look) {
    var values = paramValues(identityParams((normLook(look) || {}).params)).filter(function (p) { return p[0] !== 'apparent age'; });
    if (!values.length) return '';
    return 'Chosen look (overrides the automatic look): ' + values.map(function (p) { return p[0] + ': ' + p[1]; }).join('; ') + '.' +
      (values.some(function (p) { return p[0] === 'body measurements (B/W/H)'; }) && T.LOOK_LINES ? ' ' + T.LOOK_LINES.measurement : '');
  }
  function buildWorldShort(D, S, key, world, opts) {
    var WS = T.WORLD_SHORT, isLine = function (k) { return S && S.styles && S.styles[k] && !structVer(S, k) && !kvVer(S, k); };
    var ref = isLine(opts.style || S['default']) ? (opts.style || S['default']) : ['kr_mmorpg', 'glossy_kr_game'].concat(Object.keys(S.styles || {})).filter(isLine)[0];
    var t = build(D, S, key, world, Object.assign({}, opts, { style: ref, _long: true }));
    var L = t.split('\n'), line = function (h) { var l = L.filter(function (x) { return x.indexOf(h) === 0; })[0]; return l ? trim(l.slice(h.length)) : ''; };
    var lineRe = function (re) { var l = L.filter(function (x) { return re.test(x); })[0]; return l ? trim(l.replace(re, '')) : ''; };
    var first = function (x) { var i = x.indexOf('. '); return i > 0 ? x.slice(0, i + 1) : x; };
    var c = card(D, key), e = c.element || {};
    var face = line('FACE —'), fi = face.indexOf('first impression — '), fe = face.indexOf('. Whatever');
    var shot = normShot(D, key, world, opts.shot), po = byKey(T.WORLD_POSES, shot.pose), row = styleVer(S, opts.style) || {};
    var ex = L.filter(function (x) { return /^EXPOSURE \(/.test(x); })[0] || '';
    var wl = lineRe(/^WORLD — [A-Z ]+:\s*/), sh = T.SCENE_HEAD ? line(T.SCENE_HEAD.trim()) : '';
    var out = [
      fill(WS.head, { concept: line('CONCEPT:') }) + (line('AGE:') ? ' Age: ' + first(line('AGE:')) : ''),
      'Style: ' + shortStyle(S, opts.style),
      'Her: ' + [noDot(fi >= 0 ? face.slice(fi + 19, fe > 0 ? fe : undefined) : face), line('SILHOUETTE:')].filter(Boolean).join('. '),   /* 얼굴을 끄면 「Her: . 」 이 남던 것(2026-11-11) */
      chosenLine(opts.look),   /* 생성기에서 직접 고른 외형 — 짧은 판에서 빠지던 것(2026-11-11): 고르면 설계의 그 칸이 빠지는데 고른 값이 안 실렸다 */
      WS.face || '',
      lineRe(/^ELEMENT TRAITS of [^:]+:\s*/) ? 'Her element: ' + lineRe(/^ELEMENT TRAITS of [^:]+:\s*/) : '',
      lineRe(/^HOUSE TRAITS of [^:]+:\s*/) ? 'Her house: ' + lineRe(/^HOUSE TRAITS of [^:]+:\s*/) : '',
      wl ? 'World and costume: ' + wl : '',
      lineRe(/^(?:OUTFIT|MECHA) SILHOUETTE:\s*/) ? 'Outfit silhouette: ' + lineRe(/^(?:OUTFIT|MECHA) SILHOUETTE:\s*/) : '',   /* 실루엣(2026-11-09) */
      ex ? ex.replace(/Chest and pelvis covered/g, 'Intimate areas covered') : '',
      'Pose: ' + noDot(po ? po.en : WS.pose) + '.' + (line('EXPRESSION:') ? ' Expression: ' + first(line('EXPRESSION:')) : ''),
      sh ? 'This card: ' + sh : ''];
    var tm = byKey(T.WORLD_TIMES, shot.time); if (tm) out.push(tm.en);
    var notes = opts.notes || {}; (T.NOTES || []).forEach(function (f) { var v = trim(notes[f.id]); if (v) out.push(f.head + v); });
    out.push(WS.composition, trim(row.worldLight) || WS.light, fill(WS.end, { symbol: e.symbol || '', number: e.number || '' }) + (WS.guard[world] ? ' ' + WS.guard[world] : ''));
    return out.filter(Boolean).join('\n\n');
  }
  /* 칸 꼴 세계 그림(2026-11-11 3단계 — 사용자 「다른거 먼저 3단계 진행해줘」 → 「응 네 안대로 하고 기존 화풍 열쇠로 해줘」).
     짧은 판과 같은 글을 core 칸 틀(AtelierSpec.CORE_FRAME — 화풍공방 core v4~, 삼국지와 같은 틀)의 다섯 칸에 나눠 싣는다.
     세계 줄의 조각은 제자리로: 의상(COSTUME · MECHA DESIGN) → 3칸, 「No …」 금지 → 5칸 Avoid(조건 unless 이 붙은 마디는 남긴다), LIGHT → 4칸 빛 한 줄(화풍 worldLight 가 있으면 그것),
     HAIR → 2칸. 옛 줄 이름(WORLD · SILHOUETTE · CONCEPT · TIME & WEATHER)을 가리키던 말은 칸 말로, 5칸의 손가락 말은 해부 줄과 겹쳐 뺀다 */
  function worldSectionsOn(S, styleKey) {
    var row = styleVer(S, styleKey) || {};
    return worldShortOn(S, styleKey) && !!T.CORE_FRAME && row.worldSections !== false && !!(row.worldSections || (S && S.worldSections));
  }
  /* 「No a, b or c.」 · 「no a, no b」 → 금지 낱말 목록, 나머지 글은 그대로 */
  function splitNo(text) {
    var keep = [], avoid = [];
    trim(text).split(/\.\s+(?=[A-Z])/).forEach(function (sen) {
      var k = [], cap = false;
      sen.replace(/\.$/, '').split(/;\s*/).forEach(function (p) {
        if (!/^no\s/i.test(p)) { k.push(p); return; }
        p.replace(/^no\s+/i, '').split(/,\s*(?:no\s+)?|\s+or\s+(?:no\s+)?/i).map(trim).filter(Boolean).forEach(function (x) {
          if (/\bunless\b/.test(x)) { if (!k.length) cap = true; k.push('no ' + x); } else avoid.push(x);
        });
      });
      /* 남은 마디가 금지 마디(「no … unless」)로 시작할 때만 첫 글자를 올린다 — 나머지는 원래 글 그대로 */
      if (k.length) keep.push((cap ? k.join('; ').replace(/^./, function (c) { return c.toUpperCase(); }) : k.join('; ')) + '.');
    });
    return { text: keep.join(' '), avoid: avoid };
  }
  function buildWorldSections(D, S, key, world, opts) {
    var WS = T.WORLD_SHORT, CF = T.CORE_FRAME, isLine = function (k) { return S && S.styles && S.styles[k] && !structVer(S, k) && !kvVer(S, k); };
    var ref = isLine(opts.style || S['default']) ? (opts.style || S['default']) : ['kr_mmorpg', 'glossy_kr_game'].concat(Object.keys(S.styles || {})).filter(isLine)[0];
    var L = build(D, S, key, world, Object.assign({}, opts, { style: ref, _long: true })).split('\n');
    var line = function (h) { var l = L.filter(function (x) { return x.indexOf(h) === 0; })[0]; return l ? trim(l.slice(h.length)) : ''; };
    var lineRe = function (re) { var l = L.filter(function (x) { return re.test(x); })[0]; return l ? trim(l.replace(re, '')) : ''; };
    var first = function (x) { var i = x.indexOf('. '); return i > 0 ? x.slice(0, i + 1) : x; };
    var pal = function (x) { var m = x.match(/\s*Palette: ([^.]+)\.?$/); return m ? { text: trim(x.slice(0, m.index)), palette: trim(m[1]) } : { text: x, palette: '' }; };
    var c = card(D, key), e = c.element || {}, wr = (T.WORLDS || []).filter(function (w) { return w.key === world; })[0] || {};
    var face = line('FACE —'), fi = face.indexOf('first impression — '), fe = face.indexOf('. Whatever');
    face = noDot(fi >= 0 ? face.slice(fi + 19, fe > 0 ? fe : undefined) : face);
    var shot = normShot(D, key, world, opts.shot), po = byKey(T.WORLD_POSES, shot.pose), tm = byKey(T.WORLD_TIMES, shot.time), row = styleVer(S, opts.style) || {};
    var ex = (L.filter(function (x) { return /^EXPOSURE \(/.test(x); })[0] || '').replace(/^EXPOSURE/, 'Exposure').replace(/Chest and pelvis covered/g, 'Intimate areas covered').replace(/the costume WORLD describes/g, 'the costume above');   /* 노출 단계마다 옛 줄 이름 WORLD — 3칸 의상이 바로 위 */
    var el = pal(lineRe(/^ELEMENT TRAITS of [^:]+:\s*/)), house = pal(lineRe(/^HOUSE TRAITS of [^:]+:\s*/)), sh = T.SCENE_HEAD ? line(T.SCENE_HEAD.trim()) : '';
    /* 세계 줄 — 세계 그림 · 의상 · 빛 · 머리 */
    var wl = lineRe(/^WORLD — [A-Z ]+:\s*/), ci = wl.search(/\s(?:COSTUME \(|MECHA DESIGN:)/);
    var worldDesc = ci >= 0 ? trim(wl.slice(0, ci)) : wl, rest = ci >= 0 ? wl.slice(ci) : '', costume = '', wlight = '', hair = '';
    rest.split(/\s(?=(?:LIGHT|HAIR): )/).forEach(function (seg) {
      seg = trim(seg);
      if (/^LIGHT: /.test(seg)) wlight = seg.slice(7); else if (/^HAIR: /.test(seg)) hair = seg.slice(6); else if (seg) costume = seg.replace(/^(?:COSTUME \([^)]*\)|MECHA DESIGN):\s*/, '');
    });
    var st = splitNo(shortStyle(S, opts.style)), co = splitNo(costume);
    co.text = co.text.replace('unless CONCEPT says she wears one', 'unless the opening line says she wears one');
    hair = hair.replace('as SILHOUETTE says', 'as described above').replace('unless SILHOUETTE says an updo', 'unless the hair above is an updo');
    wlight = tm ? wlight.replace('unless TIME & WEATHER says otherwise', 'unless the time and weather above say otherwise') : wlight.replace(/,?\s*unless TIME & WEATHER says otherwise/, '');
    var notes = opts.notes || {}, sil = lineRe(/^(?:OUTFIT|MECHA) SILHOUETTE:\s*/), expr = line('EXPRESSION:');
    var p1 = [CF.s1, st.text, (WS.face || '').replace('described above', 'described below')];
    var p2 = [CF.s2, line('AGE:') ? 'Age: ' + first(line('AGE:')) : '', face ? 'Face — her own: ' + face + '.' : '', line('SILHOUETTE:') ? 'Body and hair: ' + line('SILHOUETTE:') : '',
      hair ? 'Hair: ' + hair : '', chosenLine(opts.look), expr ? 'Expression: ' + first(expr) : '',
      el.text ? 'Her element, carried in her design: ' + el.text : '', house.text ? 'Her house, carried in her design: ' + house.text : '', CF.anatomy];
    var p3 = [fill(CF.s3, { costume: 'COSTUME', genre: wr.en || world.toUpperCase() }), co.text ? 'Costume: ' + co.text : '', sil ? 'Silhouette: ' + sil.replace('where EXPOSURE allows', 'where the exposure below allows') : '',
      el.palette ? 'Colours: ' + el.palette + '.' : '', house.palette ? 'House colours: ' + house.palette + '.' : '', ex];
    var p4 = [CF.s4, worldDesc ? 'World: ' + worldDesc : '', sh ? 'This card: ' + sh : ''];
    /* 옛 줄 이름(TIME & WEATHER: · SCENE NOTE: …)은 4칸의 다른 줄처럼 「Time & weather: 」 꼴로(2026-11-12 사용자 「응 둘 다 고쳐줘」) — 옛 꼴은 그대로 */
    var secHead = function (x) { return x.replace(/^([A-Z][A-Z &]*):/, function (m, h) { return h.charAt(0) + h.slice(1).toLowerCase() + ':'; }); };
    (T.NOTES || []).forEach(function (f) { var v = trim(notes[f.id]); if (v) p4.push(secHead(f.head) + v); });
    p4.push('Pose: ' + noDot(po ? po.en : WS.pose) + '.', tm ? secHead(tm.en) : '', trim(row.worldLight) || (wlight ? 'Light: ' + wlight : WS.light), WS.composition);
    var avoid = st.avoid.concat(co.avoid, row.avoid || []).filter(function (x, i, a) { return a.indexOf(x) === i; });
    var p5 = [CF.s5, fill(WS.end, { symbol: e.symbol || '', number: e.number || '' }).replace('One figure only, natural hands with five fingers; ', 'One figure only; ') + (WS.guard[world] ? ' ' + WS.guard[world] : ''),
      avoid.length ? fill(CF.avoid, { list: avoid.join(', ') }) : ''];
    return [fill(WS.head, { concept: line('CONCEPT:') })].concat([p1, p2, p3, p4, p5].map(function (p) { return p.filter(Boolean).join('\n'); })).join('\n\n');
  }
  /* GPT 임의 설계 주문(2026-11-09) — 줄 꼴 긴 지시문에서 누구 · 원소 · 세계만 뽑고, 나머지는 GPT 가 정한다(T.WORLD_FREE) */
  /* 그 카드의 실루엣 묶음 — 원소 성격 태그(SIL_TAGS)의 묶음(SIL_POOLS)을 합친 것, 실루엣 표 차례 그대로. 근본 · 가문주마다 나눌 때와 같은 묶음
     (사용자 2026-11-09 「응 원소쪽도 둘 다 넣어줘」). 태그가 없으면 그 세계 실루엣 전부 */
  function silPool(c, world) {
    var all = (T.SILHOUETTES || {})[world] || [], tags = (T.SIL_TAGS || {})[c.nation.key + (c.family ? SEP + c.family.key : '')] || [], keys = [];
    tags.forEach(function (t) { (((T.SIL_POOLS || {})[t] || {})[world] || []).forEach(function (k) { if (keys.indexOf(k) < 0) keys.push(k); }); });
    return keys.length ? all.filter(function (x) { return keys.indexOf(x.key) >= 0; }) : all;
  }
  /* 우리 설계의 얼굴 · 머리 — 설계표 외형(그 세계 덮어쓰기까지)을 영어 낱말로(2026-11-18 세계컷 GPT 설계안 — GPT 설계가 우리 두 장과 얼굴 · 외곽이 겹치지 않게) */
  function oursLook(c, world) {
    var l = lookOf(c, world) || {}, f = l.face || {}, h = l.silhouette || {};
    var face = [f.face_shape && en('face_shape', f.face_shape), f.eyes && en('eyes', f.eyes), f.brows && en('brows', f.brows)].filter(Boolean).join(', ');
    var hair = [h.hair && en('hair', h.hair), h.bangs && (((T.FACE_DESIGN || {}).bangs || {})[h.bangs] || en('bangs', h.bangs))].filter(Boolean).join(', ');
    return [face ? 'face — ' + noDot(face) : '', hair ? 'hair — ' + noDot(hair) : ''].filter(Boolean).join('; ');
  }
  /* 설계 요약(2026-11-18 세계컷 GPT 설계안 3단계) — 우리 설계의 얼굴형 · 눈 · 눈썹 · 표정 · 머리 · 실루엣 열쇠와 그 영어 한 줄(tools/design-near.cjs 가 쓴다) */
  function designKeys(c, world) {
    var l = lookOf(c, world) || {}, f = l.face || {}, h = l.silhouette || {}, s = silOf(c, world);
    return { face_shape: f.face_shape || '', eyes: f.eyes || '', brows: f.brows || '', expr: f.expr || '', hair: h.hair || '', sil: s ? s.key : '' };
  }
  function designSummary(c, world) {
    var k = designKeys(c, world), s = silOf(c, world), x = function (v) { return String(v || '').replace(/_/g, ' '); };
    return ['face — ' + noDot(en('face_shape', k.face_shape)), 'eyes and brows — ' + noDot([en('eyes', k.eyes), en('brows', k.brows)].filter(Boolean).join(', ')),
      'expression — ' + x(k.expr), 'hair — ' + noDot(en('hair', k.hair)), 'costume — ' + (s ? noDot(String(s.en).split(' — ')[0]) : (c.citizen ? 'her object' : ''))].join('; ');
  }
  /* ══ 칸 채우기 세계컷 GPT 설계(2026-11-18, 삼국지 공방과 같은 꼴) ══ 우리 설계 지시문(build)에서 헤어스타일 · 실루엣 글 자리를 칸으로 비우고, 디자인 아이디어 · 서는 법 · 배경 줄을 더한다.
     주민(물건이 의상을 이끈다 — 실루엣 목록이 없다)은 실루엣 칸 대신 Costume variation 줄. 얼굴 · 표정 줄은 고쳐도 되고 나머지는 글자 그대로 */
  var FILL_HAIR = '[HAIRSTYLE: …]', FILL_SIL = '[COSTUME SILHOUETTE: …]', FILL_BODY = '[BUILD: …]', FILL_VAR = 'Costume variation: …', FILL_IDEA = 'Design idea: …', FILL_STANCE = 'Stance and hands: …', FILL_SET = 'Setting detail: …';
  var FILL_FREE = /^(Face —[^:]*:|FACE —[^:]*:|Face:|FACE:|Expression:|EXPRESSION:)/;
  /* 얼굴 여덟 칸(2026-11-19 사용자 「같아도 되고 달라도 된다고 했더니 거의 같게 그리는거 같아 … 얼굴까지 우리거랑 다르게 … GPT A랑 B가 또 다르게」 → 「Face 쪽은 다 다르게로 하자」).
     Face 줄을 칸 여덟로 — 칸마다 우리 목록(우리 것 뺌)에서 글 그대로, 두 GPT 설계도 칸마다 서로 다르게. 웃는 입은 목록에 넣지 않는다 */
  var FACE_SLOTS = [['impression', 'IMPRESSION'], ['skin_tone', 'SKIN TONE'], ['face_shape', 'FACE SHAPE'], ['eyes', 'EYE SHAPE'], ['eye_color', 'EYE COLOUR'], ['brows', 'BROWS'], ['nose', 'NOSE'], ['lips', 'LIPS']];
  var FACE_NO = { lips: ['wide_smile'] }, FACE_LINE = /^(Face —[^:]*:|FACE —[^:]*:|Face:|FACE:)/;
  var faceTok = function (lab) { return '[' + lab + ': …]'; };
  function faceOpts(c, world) {
    var f = (lookOf(c, world) || {}).face || {}, FD = T.FACE_DESIGN || {}, out = {};
    FACE_SLOTS.forEach(function (sl) {
      var k = sl[0], tab = (k === 'impression' || k === 'skin_tone') ? (FD[k] || {}) : ((T.VOCAB_EN || {})[k] || {});
      var ours = f[k] && typeof tab[f[k]] === 'string' ? noDot(tab[f[k]]) : '', seen = {};
      var list = Object.keys(tab).filter(function (x) { return typeof tab[x] === 'string' && tab[x] && x !== f[k] && (FACE_NO[k] || []).indexOf(x) < 0; })
        .map(function (x) { return noDot(tab[x]); }).filter(function (x) { if (!x || x === ours || seen[x]) return false; seen[x] = 1; return true; });
      out[k] = { label: sl[1], ours: ours, list: list };
    });
    return out;
  }
  var SLOTS = {};
  function slotTable() { if (!SLOTS[FILL_HAIR]) { SLOTS[FILL_HAIR] = 'hair'; SLOTS[FILL_SIL] = 'sil'; SLOTS[FILL_BODY] = 'body'; FACE_SLOTS.forEach(function (sl) { SLOTS[faceTok(sl[1])] = 'face_' + sl[0]; }); } return SLOTS; }
  var escRe = function (x) { return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
  function slotSplit() { return new RegExp('(' + Object.keys(slotTable()).map(escRe).join('|') + ')'); }
  function hasSlot(tl) { return slotSplit().test(tl); }
  function slotRe(tl, keys) { var ST = slotTable(); return new RegExp('^' + tl.split(slotSplit()).map(function (x) { if (ST[x]) { keys.push(ST[x]); return '(.+?)'; } return escRe(x); }).join('') + '$'); }
  function fillOpts(c, world) {
    var l = lookOf(c, world) || {}, h = l.silhouette || {}, s = silOf(c, world);
    var list = s ? silPool(c, world).filter(function (x) { return x.key !== s.key; }).map(function (x) { return noDot(x.en); }) : [];
    return { hair: h.hair ? en('hair', h.hair) : '', bangs: h.bangs ? (((T.FACE_DESIGN || {}).bangs || {})[h.bangs] || '') : '', sil: s ? noDot(s.en) : '', list: list,
      body: h.body ? en('body', h.body) + ' build' : '', bodies: Object.keys((T.VOCAB_EN || {}).body || {}).map(function (k) { return en('body', k) + ' build'; }) };   /* 체형 칸(2026-11-18 사용자 「피부랑 체형까지는 바꿈 허용해줘」 → A 「우리 체형 목록 안에서만」) */
  }
  function worldFillTemplate(D, S, key, world, opts) {
    var c = card(D, key); if (!c) return '';
    var o = fillOpts(c, world), t = build(D, S, key, world, Object.assign({}, opts, { shot: {}, notes: {} })), low = t.toLowerCase();
    for (var bi = o.body ? t.indexOf(o.body) : -1; bi >= 0; bi = t.indexOf(o.body, bi + 1)) if (bi === 0 || !/[A-Za-z-]/.test(t[bi - 1])) { t = t.slice(0, bi) + FILL_BODY + t.slice(bi + o.body.length); low = t.toLowerCase(); break; }   /* 우리 체형 글 → [BUILD: …] */
    var i = o.hair ? low.indexOf(o.hair.toLowerCase()) : -1;
    if (i >= 0) { var end = i + o.hair.length; if (o.bangs) { var j = t.indexOf(o.bangs, end); if (j >= 0 && j - end <= 12) end = j + o.bangs.length; } t = t.slice(0, i) + FILL_HAIR + t.slice(end); }
    var k = o.sil && o.list.length ? t.indexOf(o.sil) : -1;
    if (k >= 0) t = t.slice(0, k) + FILL_SIL + t.slice(k + o.sil.length);
    else if (o.sil && o.list.length) {   /* 지시문에서 글이 조금 바뀐 실루엣(「where EXPOSURE allows」 → 「where the exposure below allows」) — 앞 구절로 찾아 그 문장 끝까지 */
      var head = o.sil.split(' — ')[0], k2 = t.indexOf(head), e2 = k2 >= 0 ? t.indexOf('. ', k2) : -1;
      if (k2 >= 0 && e2 > k2 && t.slice(k2, e2).indexOf('\n') < 0) t = t.slice(0, k2) + FILL_SIL + t.slice(e2);
    }
    var L = t.split('\n');
    var ffi = L.findIndex(function (x) { return FACE_LINE.test(x); });   /* Face 줄 → 얼굴 칸 여덟(2026-11-19) */
    if (ffi >= 0) L[ffi] = L[ffi].match(FACE_LINE)[1] + ' ' + FACE_SLOTS.map(function (sl) { return faceTok(sl[1]); }).join('; ') + '.';
    else L.splice(1, 0, 'Face: ' + FACE_SLOTS.map(function (sl) { return faceTok(sl[1]); }).join('; ') + '.');
    if (i < 0) { var fi = L.findIndex(function (x) { return FILL_FREE.test(x); }); L.splice(fi >= 0 ? fi + 1 : 1, 0, 'Hairstyle: ' + FILL_HAIR + '.'); }
    var si = L.findIndex(function (x) { return x.indexOf(FILL_SIL) >= 0; });
    if (si < 0) { si = L.findIndex(function (x) { return /^(Costume:|COSTUME)/.test(x); }); L.splice(si >= 0 ? si + 1 : L.length, 0, FILL_VAR); si = si >= 0 ? si + 1 : L.length - 1; }
    L.splice(si + 1, 0, FILL_IDEA);
    var pi = L.findIndex(function (x) { return /^(Pose:|POSE:|OUTPUT:)/.test(x); });
    L.splice(pi >= 0 ? pi + 1 : L.length, 0, FILL_STANCE, FILL_SET);
    return L.join('\n');
  }

  function worldFillPicks(D, S, key, world, filled, opts) {
    var T0 = worldFillTemplate(D, S, key, world, opts || {}).split('\n').map(trim), F = String(filled || '').split('\n').map(trim), out = {};
    T0.forEach(function (tl) { if (!hasSlot(tl)) return; var keys = [], re = slotRe(tl, keys); F.forEach(function (fl) { var m = re.exec(fl); if (m) keys.forEach(function (k, n) { out[k] = trim(m[n + 1]); }); }); });
    F.forEach(function (fl) { if (/^Costume variation:\s*\S/.test(fl)) out.variation = fl; });
    return out;
  }
  /* 검사 말은 낱말 표(lib/prompt-spec.js WORLD_FREE.msg)에서 — 화면 코드에 한글을 두지 않는다(tests/words.cjs) */
  var FM = function (k) { return ((T.WORLD_FREE || {}).msg || {})[k] || k; };
  function worldFillErrors(D, S, key, world, filled, opts, other) {
    opts = opts || {};
    var c = card(D, key); if (!c) return [FM('no_card')];
    var o = fillOpts(c, world), errs = [], got = {};
    var T0 = worldFillTemplate(D, S, key, world, opts).split('\n').map(trim).filter(Boolean);
    var F = String(filled || '').split('\n').map(trim).filter(Boolean);
    if (!F.length || !/^SUMMARY:\s*\S/.test(F[0])) errs.push(FM('no_summary')); else F = F.slice(1);
    var j = 0;
    for (var i = 0; i < T0.length; i++) {
      var tl = T0[i], fl = F[j];
      if (tl === FILL_STANCE || tl === FILL_SET) { var pre = tl.split(':')[0] + ':'; if (fl && fl.indexOf(pre) === 0) { if (/…/.test(fl)) errs.push(pre + FM('slot_empty')); j++; } continue; }
      if (fl == null) { errs.push(FM('line_missing') + tl.slice(0, 60)); continue; }
      if (tl === FILL_IDEA || tl === FILL_VAR) { var p0 = tl.split(':')[0] + ':'; if (fl.indexOf(p0) !== 0 || /…/.test(fl) || !trim(fl.slice(p0.length))) errs.push(p0 + FM('line_empty')); j++; continue; }
      if (hasSlot(tl)) { var keys = [], m = slotRe(tl, keys).exec(fl); if (!m) errs.push(FM('outside_changed') + tl.slice(0, 60)); else keys.forEach(function (k, n) { got[k] = trim(m[n + 1]); }); j++; continue; }
      var fm = FILL_FREE.exec(tl);
      if (fm) { if (fl.indexOf(fm[1]) !== 0) errs.push(FM('line_head') + tl.slice(0, 40)); j++; continue; }
      if (fl !== tl) errs.push(FM('line_changed') + tl.slice(0, 60)); j++;
    }
    if (j < F.length) errs.push(FM('line_added') + F[j].slice(0, 60));
    if (got.hair != null) { var gh = got.hair.toLowerCase(); if (/…/.test(gh) || !gh) errs.push(FM('hair_empty')); else if (o.hair && gh.indexOf(o.hair.toLowerCase()) >= 0) errs.push(FM('hair_same') + o.hair + ')'); }
    if (got.body != null && o.bodies.indexOf(trim(got.body)) < 0) errs.push(FM('body_off') + got.body.slice(0, 60));
    if (got.sil != null && o.list.indexOf(noDot(got.sil)) < 0) errs.push(FM('sil_off') + got.sil.slice(0, 60));
    var fo = faceOpts(c, world);   /* 얼굴 칸 — 목록 글 그대로(우리 것 뺌), 두 설계도 칸마다 다르게(2026-11-19) */
    FACE_SLOTS.forEach(function (sl) { var v = got['face_' + sl[0]]; if (v == null) return;
      if (!trim(v) || /…/.test(v)) errs.push(sl[1] + FM('slot_empty')); else if (fo[sl[0]].list.indexOf(noDot(v)) < 0) errs.push(FM('face_off') + sl[1] + ': ' + v.slice(0, 50)); });
    if (other) { var e2 = worldFillPicks(D, S, key, world, other, opts); if (got.hair && e2.hair && got.hair.toLowerCase() === e2.hair.toLowerCase()) errs.push(FM('two_hair')); if (got.sil && e2.sil && noDot(got.sil) === noDot(e2.sil)) errs.push(FM('two_sil'));
      FACE_SLOTS.forEach(function (sl) { var a = got['face_' + sl[0]], b = e2['face_' + sl[0]]; if (a && b && noDot(a) === noDot(b)) errs.push(FM('two_face') + sl[1]); }); }
    return errs;
  }
  function buildWorldFree(D, S, key, world, opts) {
    opts = opts || {};
    var WF = T.WORLD_FREE, FL = WF.fill, c = card(D, key); if (!c) return '';
    if (!FL) return buildWorldFreeOld(D, S, key, world, opts);
    var o = fillOpts(c, world), tpl = worldFillTemplate(D, S, key, world, opts);
    var traits = (tpl.match(/^Her element, carried in her design: (.*)$/m) || [])[1] || '';
    var name = (c.citizen && c.citizen.en) || (c.family && c.family.en) || (c.element && c.element.en) || key;
    return [fill(FL.head, { name: name }), fill(FL.hair, { ours: [o.hair, o.bangs].filter(Boolean).join(', ') || 'see the prompt' }),
      FL.body && o.body && worldFillTemplate(D, S, key, world, opts).indexOf(FILL_BODY) >= 0 ? fill(FL.body, { ours: o.body, list: o.bodies.map(function (x, i) { return (i + 1) + ') ' + x; }).join('; ') }) : '',
      o.list.length && tpl.indexOf(FILL_SIL) >= 0 ? fill(FL.sil, { list: o.list.map(function (x, i) { return (i + 1) + ') ' + x; }).join('; ') }) : FL.variation,
      FL.face ? fill(FL.face, { lists: (function (fo) { return FACE_SLOTS.map(function (sl) { return sl[1] + ' — ' + fo[sl[0]].list.map(function (x, i) { return (i + 1) + ') ' + x; }).join('; '); }).join(' | '); })(faceOpts(c, world)) }) : '',
      fill(FL.idea, { traits: noDot(traits) || 'her element' }), FL.free, FL.two,
      opts.near && opts.near.length ? fill(FL.near, { near: opts.near.map(function (x, i) { return (i + 1) + ') ' + x; }).join('; ') }) : '', FL.out, FL.sep, tpl].filter(Boolean).join('\n\n');
  }
  function buildWorldFreeOld(D, S, key, world, opts) {
    opts = opts || {};
    var WF = T.WORLD_FREE, WS = T.WORLD_SHORT, c = card(D, key); if (!c) return '';
    var isLine = function (k) { return S && S.styles && S.styles[k] && !structVer(S, k) && !kvVer(S, k); };
    var ref = ['kr_mmorpg', 'glossy_kr_game'].concat(Object.keys(S.styles || {})).filter(isLine)[0];
    var t = build(D, S, key, world, Object.assign({}, opts, { style: ref, _long: true, shot: {}, notes: {} }));
    var L = t.split('\n'), line = function (h) { var l = L.filter(function (x) { return x.indexOf(h) === 0; })[0]; return l ? trim(l.slice(h.length)) : ''; };
    var lineRe = function (re) { var l = L.filter(function (x) { return re.test(x); })[0]; return l ? trim(l.replace(re, '')) : ''; };
    var first = function (x) { var i = x.indexOf('. '); return i > 0 ? x.slice(0, i + 1) : x; };
    var e = c.element || {}, concept = line('CONCEPT:').replace(/\s*Both hands are ordinary human hands[^.]*\./, '');
    var traits = [lineRe(/^ELEMENT TRAITS of [^:]+:\s*/), lineRe(/^HOUSE TRAITS of [^:]+:\s*/)].filter(Boolean).join(' ');
    var hairC = WF.hair ? en('hair_color', (lookOf(c, world).silhouette || {}).hair_color) : '';   /* 머리색은 우리 설계값(2026-11-09) */
    var pals = [lineRe(/^ELEMENT TRAITS of [^:]+:\s*/), lineRe(/^HOUSE TRAITS of [^:]+:\s*/)].map(function (x) { var m = x.match(/Palette: ([^.]+)\./); return m ? m[1] : ''; }).filter(Boolean);
    /* 화풍 판의 덧줄(2026-11-18 — 삼국지 관은병 메카 GPT 설계에서 주문에 화풍 문단만 있어 피부 마감 · 빛 · Avoid 가 빠졌다) — 우리 설계 지시문과 같은 것을 고정 칸으로 */
    var srow = styleVer(S, opts.style) || {}, skinF = trim(srow.worldStyleAfter), lightF = trim(srow.worldLight), avoidF = srow.avoid || [];
    var styleExtra = [skinF ? 'Skin finish (fixed — ours): ' + noDot(skinF.replace(/^Skin finish:\s*/i, '')) + '.' : '',
      lightF ? 'Light (fixed — ours): ' + noDot(lightF.replace(/^Light:\s*/i, '')) + ' — keep this lighting whatever the setting; the background may change, not how she is lit.' : '',
      avoidF.length ? 'Avoid (fixed): ' + avoidF.join(', ') + '.' : ''].filter(Boolean).join('\n\n');
    return [fill(WF.head, { concept: concept, age: first(line('AGE:')) }), WF.free, 'Style (fixed): ' + shortStyle(S, opts.style), styleExtra,
      traits ? fill(WF.legend, { traits: traits }) : '', fill(WF.world, { world: first(lineRe(/^WORLD — [A-Z ]+:\s*/)) }),
      c.tier === 'citizen' ? WF.citizenCostume : fill(WF.costume, { list: silPool(c, world).map(function (x, i) { return (i + 1) + ') ' + noDot(x.en); }).join('; ') }),
      pals.length ? fill(WF.palette, { palette: pals.join('; ') }) : '', hairC ? fill(WF.hair, { hair: hairC }) : '', world === 'mecha' ? (WF.mecha || '') : '', WF.expose,
      WS.face.replace('Her eyes keep the shape described above at a natural open size', 'Her eyes stay at a natural open size'), WF.ours ? fill(WF.ours, { ours: oursLook(c, world) }) : '', WS.composition, WF.pose || '', WF.summary || '', opts.near && opts.near.length && WF.near ? fill(WF.near, { near: opts.near.map(function (x, i) { return (i + 1) + ') ' + x; }).join('; ') }) : '', fill(WF.second, { source: c.tier === 'citizen' ? WF.sourceCitizen : WF.sourceRoot }) + (world === 'mecha' && WF.secondMecha ? ' ' + WF.secondMecha : ''), WF.check || '', fill(WF.end, { symbol: e.symbol || '', number: e.number || '' })].filter(Boolean).join('\n\n');
  }
  function build(D, S, key, world, opts) {
    opts = opts || {};
    if (!opts._long && worldSectionsOn(S, opts.style)) return buildWorldSections(D, S, key, world, opts);   /* 칸 꼴(2026-11-11 3단계) */
    if (!opts._long && worldShortOn(S, opts.style)) return buildWorldShort(D, S, key, world, opts);   /* 짧은 세계 그림(2026-11-09) */
    var sv = structVer(S, opts.style); if (sv) return buildStructured(D, S, key, world, opts, sv);
    var kv = kvVer(S, opts.style); if (kv) return buildKv(D, S, key, world, opts, kv);
    var L = worldLines(D, S, key, world, opts); return L ? L.map(function (x) { return x[1]; }).join('\n') : '';
  }
  /* 세계 그림의 줄들 — [칸, 글]. 영어 틀(build)은 차례대로 잇고, kv 판(buildKv)은 칸으로 묶는다(2026-11-07 삼국지 공방 화풍 옮기기) */
  function worldLines(D, S, key, world, opts) {
    opts = opts || {};
    var c = card(D, key); if (!c) return null;
    var W = T.WORLDS.filter(function (w) { return w.key === world; })[0]; if (!W) return null;
    var look = normLook(opts.look), shot = normShot(D, key, world, opts.shot);
    var n = c.nation, e = c.element, m = { nation_en: e.en, nation_ko: e.ko, symbol: e.symbol, number: e.number,
      family_en: c.family ? c.family.en : '', object: c.citizen ? trim((c.citizen.object || {}).en) : '' };
    var lines = [], add = function (t, x) { lines.push([t, x]); };
    /* CONCEPT */
    if (c.tier === 'citizen') add('concept', fill(c.citizen.wear ? T.CITIZEN_WEAR : T.TIERS.citizen.text, m));
    else add('concept', fill(T.TIERS[c.tier].text, m) + ' ' + T.ROOT_HANDS);
    /* TRAITS — 나라, 가문, (주민은 물건이 CONCEPT 에) */
    var tr = fill(T.TRAITS_HEAD, m) + trim((n.traits || {}).en) + '.' + (n.palette && n.palette.en ? ' ' + T.PALETTE_HEAD + trim(n.palette.en) + '.' : '');
    add('traits', tr);
    if (c.family) {
      var fam = c.family, ft = fill(T.FAMILY_HEAD, m) + trim((fam.traits || {}).en) + '.' + (fam.palette && fam.palette.en ? ' ' + T.PALETTE_HEAD + trim(fam.palette.en) + '.' : '');
      add('traits', ft);
    }
    /* 외형 — 나이 · 실루엣 · 얼굴(설계표 look, 직접 고른 묶음은 빠진다) */
    var dzf = look.faceDesignOn === false ? {} : lookOf(c, world).face;
    var age = ageLine(look, dzf); if (age) add('look', age);
    var sil = silhouetteItems(c, look, world); if (sil.length && T.LOOK_LINES) add('look', fill(T.LOOK_LINES.silhouette, { items: sil.join('; ') }));
    var face = faceItems(c, look, world, styleFace(S, opts.style)); if (face.length && styleVer(S, opts.style).face_tail && designedFace(dzf)) face.push(styleVer(S, opts.style).face_tail); if (face.length && T.LOOK_LINES) add('look', fill(designedFace(dzf) ? T.FACE_DESIGN.head : T.LOOK_LINES.face, { items: face.join('; ') }));
    /* WORLD — 나라의 세계 글(가문이 덮어쓰면 그것), 주민의 세계 메모, 세계 꼬리. 메카는 설계 문장 */
    var nw = ((c.family && c.family.worlds) || {})[world] || (n.worlds || {})[world] || {};
    var note = c.citizen && c.citizen.notes && c.citizen.notes[world] ? trim(c.citizen.notes[world].en) : '';
    if (note) note = note.charAt(0).toUpperCase() + note.slice(1);   // 나라 글 뒤에 문장으로 잇는다
    var wl = W.head + trim(nw.en) + (trim(nw.en) ? '.' : '') + (note ? ' ' + note + '.' : '');
    /* 설계표 design 글은 소문자 조각 — 틀 꼬리(「…carry the motif. 」) 뒤 새 문장이라 첫 글자를 올린다(2026-11-12) */
    if (world === 'mecha') wl += ' ' + W.tail + (nw.design ? trim(nw.design).replace(/^./, function (x) { return x.toUpperCase(); }) + '.' : '') + (c.tier === 'citizen' ? ' ' + T.CITIZEN_MECHA : '');
    else wl += ' ' + (c.tier === 'citizen' && W.citizenTail ? W.citizenTail : W.tail);
    add('world', trim(wl));
    /* 실루엣 — 세계 글 바로 뒤(kv 판은 같은 칸이라 COSTUME 에 함께), 큰 덩어리 모양만. 메카는 MECHA SILHOUETTE */
    var mf = silOf(c, world, shot);
    if (mf) add('world', T.SILHOUETTE_HEAD[world] + mf.en + '. Only the overall shape is fixed; design the details freely in the element\'s materials and palette.' + (world !== 'mecha' ? ' This silhouette overrides the overall shape of the costume above.' : ''));
    /* 장면 변주 · 시간대 — 세계 글 뒤 */
    var scn = byKey(scenesOf(c, world), shot.scene); if (scn) add('scene', T.SCENE_HEAD + trim(scn.en) + '.');
    var tm = byKey(T.WORLD_TIMES, shot.time); if (tm) add('scene', tm.en);
    /* STYLE · 노출 */
    var st = styleText(S, opts.style, 'text'); if (st) add('style', 'STYLE: ' + st);
    var ex = exposureLine(look, world, c.tier === 'citizen'); if (ex) add('exposure', ex);
    /* 덧붙임 */
    var notes = opts.notes || {};
    T.NOTES.forEach(function (f) { var v = trim(notes[f.id]); if (v) add('note', f.head + v); });
    /* 출력(자세 자리) · 표정 · 몸 · 직접 고른 외형(나이는 위 AGE 줄이 쥔다) · 규칙 */
    var po = byKey(T.WORLD_POSES, shot.pose);
    add('output', fill(T.OUTPUT, { pose: po ? po.en : T.POSE_DEFAULT }));
    /* 표정 — 고른 것, 없으면 설계표 기본 표정(2026-11-01 — 다 같은 옅은 미소였다) */
    var ex2 = shot.expr || (dzf.expr && T.EXPRESSION_DETAIL[dzf.expr] ? dzf.expr : '');
    if (ex2) add('expr', T.EXPR_HEAD + exprText(S, opts.style, ex2, T.EXPRESSION_DETAIL[ex2]) + '.');
    add('body', T.BODY_LINE);
    var values = paramValues(identityParams(look.params)).filter(function (p) { return p[0] !== 'apparent age'; });
    if (values.length && T.LOOK_LINES) add('look', T.LOOK_LINES.identity + '\n' + values.map(function (p) { return p[0] + ': ' + p[1]; }).join('\n') +
      (values.some(function (p) { return p[0] === 'body measurements (B/W/H)'; }) ? '\n' + T.LOOK_LINES.measurement : ''));
    T.RULES.forEach(function (r) { add('rules', fill(r, m)); });
    lines.card = c; lines.m = m;
    return lines;
  }


  /* kv 판(삼국지 공방에서 옮긴 화풍 — 2026-11-07 사용자 「원소공방에도 지금 삼국지 공방에 있는 화풍들추가」): 머리말 · STYLE(판의 글) · CHARACTER · COSTUME AND EQUIPMENT · POSE AND SETTING(+ 판의 끝 줄).
     칸 값은 영어 틀과 같은 줄(worldLines)에서 — 설계표 · 외형 · 세계 글 · 장면 · 노출 · 덧붙임은 그대로, 판이 정하는 것은 머리말 · 작화 · 장르 이름 · 끝 줄뿐 */
  function kvVer(S, styleKey) { var v = styleVer(S, styleKey); return v && v.format === 'kv' && v.section1 ? v : null; }
  function buildKv(D, S, key, world, opts, kv) {
    var L = worldLines(D, S, key, world, opts); if (!L) return '';
    var c = L.card, m = L.m, of = function (t) { return L.filter(function (x) { return x[0] === t; }).map(function (x) { return x[1]; }); };
    var name = c.tier === 'root' ? m.nation_en : (c.en || m.nation_en);
    var out = [fill(kv.head, { name_en: name, nation_en: m.nation_en, nation_ko: m.nation_ko, symbol: m.symbol, number: m.number }), kv.section1,
      'CHARACTER:\n' + of('concept').concat(of('traits'), of('look'), of('expr')).join('\n'),
      'COSTUME AND EQUIPMENT — ' + ((kv.genre || {})[world] || world) + ':\n' + of('world').concat(of('exposure'), of('note')).join('\n'),
      'POSE AND SETTING:\n' + of('scene').concat(of('output'), of('body'), of('rules')).join('\n')];
    if (kv.tail) out.push(kv.tail);
    return out.join('\n\n');
  }

  /* 올릴 파일 이름 — IMAGE_RULES.md 3절. 일상컷도 세계를 탄다(그 세계 그림이 참고 그림) */
  function fileName(key, world, styleKey, casualN) {
    return casualN ? fill(T.FILES.casual, { card: key, world: world, style: styleKey, n: casualN }) : fill(T.FILES.world, { card: key, world: world, style: styleKey });
  }

  /* 기록 내보내기 — 그림 저장소 records/<카드>/<세계>.<화풍>-ui.json 에 둔다(화풍을 늘 붙인다 — 기본 화풍이 바뀌어도 이름이 안 헷갈리게, 2026-10-31) */
  function record(D, S, key, world, opts) {
    opts = opts || {};
    var styleKey = opts.style || (S && S['default']), c = card(D, key);
    return { atelier: 'element', card: key, tier: c ? c.tier : '', world: world, style: styleKey, styleVersion: styleVersion(S, styleKey),
      notes: opts.notes || {}, look: normLook(opts.look), design: c ? lookOf(c, world) : null, shot: normShot(D, key, world, opts.shot), file: fileName(key, world, styleKey), prompt: build(D, S, key, world, opts), date: new Date().toISOString().slice(0, 10) };
  }

  /* ══ 일상컷(트리 버전2) ══ game-atelier 의 buildCasualV2·casualDetailsV2 에서 왔다(2026-10-30, docs/CASUAL_TREE_V2.md 5절).
     표 둘(opts.tree = data/casual-tree.json, opts.tree2 = data/casual-tree-v2.json)과 공용 모듈 lib/casual-tree.js·casual-tree-v2.js 가 있어야 한다.
     장면(scene)은 생성기가 만든 버전2 장면 하나 — treeV 2 · era · place · weather · ofam · item · outfit(글) · ofeat · posture · support · frame · body · head ·
     camera · right · left · use · kind · legs · gaze · expr · axes · aspect · scene(장소·상황 글) · custom(추가 연출) · unlocked · preset.
     참고 그림은 그 카드의 세계 그림 하나(opts.world — fantasy · steampunk · mecha) — 그 사람이 일상에 나온 한 장이라 INPUT·CHARACTER 가 「첨부 그림의 그 여자」 를 말하고
     화풍은 그 세계 그림의 화풍을 따른다(사용자 2026-10-30). 시대 열쇠는 표에서 읽고 여기 박지 않는다(now · site · nation · fantasy). */
  var SCENE_V2 = ['treeV', 'ostyle', 'era', 'place', 'ofam', 'item', 'posture', 'support', 'frame', 'body', 'head', 'camera', 'right', 'left', 'use', 'kind', 'legs', 'gaze', 'turn',
    'weather', 'time', 'moment', 'hair', 'own', 'placeText', 'ownProp', 'light', 'spot', 'depth', 'view', 'color', 'shade', 'denier', 'situ', 'ofree', 'sfree', 'gfree', 'gsitu', 'recent', 'cosplay', 'expr', 'preset', 'prop', 'outfit', 'ofeat', 'scene', 'custom', 'axes', 'aspect', 'unlocked', 'unlockedAuto'];   /* time·hair 는 원소 몫(2026-10-30) · cosplay — 게임 코스프레 컷(2026-11-15) · shade — 옷 색 묶음 안 구체 색 하나(2026-11-16) */
  function sceneV2(st) { var o = {}; SCENE_V2.forEach(function (k) { if (st && st[k] !== undefined) o[k] = st[k]; }); return o; }
  function quoted(v) { return trim(v).replace(/"/g, "'"); }

  /* 버전2 표정 — 표정 문장 속 시선 말을 뗀다(시선은 GAZE 줄 하나가 정한다) */
  var EXPR_GAZE = [[/,?\s*gaze slightly to the side/, ''], [/\bdirect (\w+) gaze\b/, '$1 eyes'], [/\bhard forward gaze\b/, 'hard eyes'],
    [/\bsoft distant gaze past the camera\b/, 'soft distant eyes'], [/\bsoft distant eyes looking just beside the camera at her own eye level\b/, 'soft distant eyes'], [/\bgaze softened and directed slightly upward or away\b/, 'softened eyes'],
    [/\bgaze direct and unwarm\b/, 'eyes unwarm'], [/ fixed on one point/, ''], [/ looking away/, ''], [/,?\s*eyes off camera/, ''], [/\bgaze angled down and away,\s*/, '']];
  function exprNoGaze(text) { return EXPR_GAZE.reduce(function (t, r) { return t.replace(r[0], r[1]); }, String(text || '')); }

  /* 트리가 보는 「카드」 — 손에 드는 그 원소의 물건 하나(설계표 hold.en, 주민은 object.en — 사용자 2026-10-30 「일상컷에서 손에 드는 소품까지」). 출시 연도 칸은 없다 */
  function holdOf(c) { return c.citizen ? trim((c.citizen.object || {}).en) : trim(((c.family && c.family.hold) || c.nation.hold || {}).en); }
  /* tree2 · world 를 주면 땅(표 lands_of — 나라의 갈래) · 세계도 — 그 땅의 현장 · 그 세계에만 있는 자리를 트리가 거른다(2026-11-13) */
  function casualCard(c, tree2, world) { var h = holdOf(c); return { key: c.key, signature: h ? [h] : [], signature_hold: h ? [0] : [], land: tree2 ? (tree2.lands_of || {})[(c.element || {}).category] || '' : '', world: world || '' }; }
  /* 설계표 → 틀 채우기 값 */
  function casualVars(c) {
    var n = c.nation, e = c.element;
    return { nation_en: e.en, nation_ko: e.ko, symbol: e.symbol, number: e.number, family_en: c.family ? c.family.en : '', object: c.citizen ? trim((c.citizen.object || {}).en) : '',
      traits: trim((n.traits || {}).en), palette: trim((n.palette || {}).en), hold: holdOf(c) };
  }
  /* 시대 줄 — 표의 시대 열쇠로 틀을 고른다. 나라 안(nation)은 참고 그림의 세계(world) 글 — 나라(가문이 덮어쓰면 그것)의 것(2026-10-30: 전에는 늘 판타지였다). 쓰임의 현장(site)은 설계표에 현장 글이 있으면 그것 */
  function casualEraLine(c, eraRow, m, world) {
    var CL = T.CASUAL, n = c.nation, key = eraRow.key, tpl = CL.era[key];
    if (!tpl) return fill(CL.eraOther, { en: trim(eraRow.en) || key });
    var fw = ((c.family && c.family.worlds) || {})[world || 'fantasy'] || (n.worlds || {})[world || 'fantasy'] || {};
    var site = ((n.casual || {}).site || (n.worlds || {}).site || {}).en;
    return fill(tpl, Object.assign({}, m, { world: trim(fw.en) || 'its own recognisable places', site: trim(site) ? ' — ' + trim(site) : '' }));
  }

  /* 자유 설계 칸(2026-11-11 — sfree: 옷 자유 칸 ofree · 갈래 자유 칸 gfree) — 장면 줄 대신 T.FREE_DESIGN 덩어리. 최근 장면(recent)은 계획기가 장면에 적어 둔 것,
     갈래 자유 칸은 필수 갈래(gfree — 트리 표의 영어 이름)와 상황(gsitu — 상황 표 글 그대로) 두 줄을 Outfit 줄 바로 위에 */
  function freeDesignLines(sc, t) {
    var F = T.FREE_DESIGN, C = root.AtelierCasualTreeV2, recent = (sc.recent || []).map(trim).filter(Boolean);
    var out = [F.head, fill(F.recent, { recent: recent.join('; ') || F.recentNone })].concat(F.lines);
    if (sc.gfree) {
      var fam = C.family(t, sc.gfree), si = byKey(T.CASUAL.situations, sc.gsitu);
      out.push(fill(F.family, { family: (F.familyNames || {})[sc.gfree] || trim(fam && fam.en) || sc.gfree }));
      if (sc.gsitu === 'free' && F.situFree) out.push(F.situFree); else if (si) out.push(fill(F.situ, { situ: si.en }));   /* 상황은 열기(gsitu 'free', 2026-11-11) — 옛 기록의 표 상황은 표 글 그대로 */
    }
    var tm = byKey(T.CASUAL.times, sc.time); if (tm) out.push('Time of day (fixed): ' + tm.en + ' — set your scene at this time.');   /* 시간대(2026-11-18 사용자 B) — 자유 설계 칸도 계획기가 고른 시간대를 준다(비면 늘 따뜻한 밤 실내로 그렸다) */
    out.push(sc.gfree ? F.outfit : F.outfitFree);
    return out;
  }
  /* 게임 코스프레 컷(2026-11-15) — 의상 계열에 cosplay: true(트리 game_cosplay). 장면 칸 cosplay = { game, character, cut, round, used?, again? }(계획기 tools/casual-plan.cjs pickCosplay).
     Outfit 줄은 목록(data/game-cosplay.json — opts.cosplay 로 받는다)의 글: 주인공 하나 게임은 fixed, 등장인물 많은 게임은 계획기가 정한 1회차(round 1 · 캐릭터 찬 것)면 assigned
     (2026-11-16 — 등장인물 많은 게임도 계획기가 캐릭터를 정한다), 2회차(round 2)면 again, 캐릭터가 빈 옛 계획 칸이면 pick(맨 앞 「…」 — 그리는 쪽이 채운다, {used} 는 그 게임에서 이미 쓴 캐릭터 —
     새 계획엔 없고 아직 안 그린 옛 계획을 위해 남긴다). 재단은 트리 옷(gc_<재단>)의 cut, 없으면 cosplay.cut. 게임이 없거나 목록이 없으면 트리 옷 글 */
  function isCosplay(t, sc) { var C = root.AtelierCasualTreeV2, f = C && sc && C.family(t, sc.ofam); return !!(f && f.cosplay); }
  function cosplayText(data, cos, itemRow) {
    cos = cos || {};
    var g = data && byKey(data.games, cos.game), cut = data && byKey(data.cuts, (itemRow && itemRow.cut) || cos.cut), X = (data && data.text) || {};   /* 재단은 트리 옷이 먼저(생성기에서 옷을 바꾸면 그것) */
    if (!g || !cut) return itemRow ? trim(itemRow.en) : '';
    if (!g.many) return fill(X.fixed, { character: g.character, game: g.en, outfit: g.outfit, cut: cut.en });
    if (trim(cos.character)) return fill(cos.round === 2 || !X.assigned ? X.again : X.assigned, { character: trim(cos.character), game: g.en, cut: cut.en });
    return fill(X.pick, { game: g.en, used: (cos.used || []).map(trim).filter(Boolean).join(', ') || X.none, cut: cut.en });
  }
  /* 버전2 장면 → SCENE 줄들. 손·소품·받침의 관계는 PROP 한 줄에서만, 오른손·왼손은 인물 본인 기준 */
  /* 나라 안 장소의 그 세계 글(트리 장소 worlds.<세계>.en — 2026-11-24 탈 것: 하늘배 · 비행선 · 스카이 요트). 없으면 장소 글 그대로 — 삼국지 공방 placeEn 과 같다 */
  function placeEn(p, world) { var w = p && p.worlds && world && p.worlds[world]; return w && w.en ? w.en : (p ? p.en : ''); }
  /* 놀이터(장소 특징 k_kids, 2026-11-25 사용자 — 아이들이 배경에 나올 수 있다): 노출은 적게 · 상황 노출 · 드러내기 없음, 장면 줄 Place 뒤에 배경 아이들 · 덮인 옷 두 줄(표 kids_place) */
  function kidsAt(t, sc) { var C = root.AtelierCasualTreeV2; return !!(sc && C && sc.place && C.placeHas(t, sc.place).indexOf('k_kids') >= 0); }
  function kidsScene(t, sc) { return kidsAt(t, sc) ? Object.assign({}, sc, { axes: Object.assign({}, sc.axes || {}, { skin_exposure: 'low' }), situ: '', ofreeSitu: '', expose: '' }) : sc; }
  function kidsLines(t, sc) { var K = (t.v2 && t.v2.kids_place) || {}; return kidsAt(t, sc) ? [K.people, K.cover].filter(Boolean) : []; }
  function casualDetailsV2(sc, t, m, ex) {
    if (sc.sfree && T.FREE_DESIGN) return freeDesignLines(sc, t);
    var C = root.AtelierCasualTreeV2, CL = T.CASUAL, out = [], f = C.frame(t, sc.frame);
    var p = C.place(t, sc.place), fam = C.family(t, sc.ofam), it = C.item(t, sc.ofam, sc.item);
    var po = C.posture(t, sc.posture), su = C.support(t, sc.support), u = C.use(t, sc.use), pr = u && C.prop(t, u.prop);
    var by = function (list, k) { return (list || []).filter(function (r) { return r.key === k; })[0]; };
    var body = by(t.v2.body, sc.body), head = by(t.v2.head, sc.head), cam = by(t.v2.camera, sc.camera);
    var bl = C.backLook(t, sc);   /* 뒷모습 돌아보기 — 돌아보는 어깨 · 손의 화면 쪽 · 얼굴 손의 팔(lib/casual-tree-v2.js) */
    var gaze = by(t.v2.gaze, sc.gaze || (u && u.gaze) || '');
    /* 세계 안 시대의 「그 세계의 자리」 장소는 WORLD 줄이 정한다 */
    /* 캐릭터만의 컷(own)은 그 컷의 장소 글(placeText) — 받침 · 장소 종류만 트리 장소(base)에서 빌린다(2026-11-13) */
    if (trim(sc.placeText)) out.push('Place: ' + trim(sc.placeText)); else if (p) out.push('Place: ' + (p.world_place ? CL.worldPlace : placeEn(p, m && m.world_key)));
    kidsLines(t, sc).forEach(function (l) { out.push(l); });
    var wt = (t.v2.weather || []).filter(function (r) { return r.key === sc.weather; })[0];
    if (wt) out.push('Weather / season: ' + wt.en + '.');
    var tm = byKey(CL.times, sc.time), lk = tm ? C.extras(t, sc).look : ''; if (tm) out.push('Time of day: ' + tm.en + (lk ? '; ' + lk : '') + '.');   /* 빛 모습(2026-11-18 G — 표 ambience.looks) */
    var hr = byKey(CL.hairs, sc.hair); if (hr) out.push('Hair: ' + hr.en + '.');
    var X = C.extras(t, sc);   /* 빛의 방향 · 화면 안 자리 · 옆모습의 가까운 팔 · 실내 여부(lib/casual-tree-v2.js extras, 2026-11-13) */
    if (X.light) out.push('Light direction: ' + X.light + '.');
    if (X.moment) out.push('Small moment: ' + X.moment + '.');   /* 순간(2026-11-18 D — 표 moments) */
    var specs = (sc.ofeat || []).indexOf('glasses') >= 0 ? CL.glasses : '';
    /* 옷 색 · 데니어 · 상황 노출(2026-11-09 삼국지 공방에서) — 맞는 옷에만 Outfit 줄 끝에 */
    /* 게임 코스프레 컷은 목록 글 — 옷 색 · 데니어 · 상황은 얹지 않는다(2026-11-15) */
    var cos = fam && fam.cosplay, oen = (cos && !trim(sc.outfit) ? cosplayText((m || {}).cosplay, sc.cosplay, it) : '') || trim(sc.outfit) || (it && it.en) || (fam && fam.en) || '', col = cos || colorFixed(oen) ? null : m && m.shade !== undefined ? m.shade : byKey(CL.colors, sc.color);   /* 옷 색은 묶음 안 shade 하나(buildCasual 이 m.shade 로 — 2026-11-16) */
    var dn = !cos && denierFits(oen) ? byKey(CL.deniers, sc.denier) : null, si = !cos && situFits(sc.situ, oen) ? byKey(CL.situations, sc.situ) : null;
    if (sc.ofree && T.OUTFIT_FREE) out.push(T.OUTFIT_FREE + specs + '.');   /* 옷 자유 컷(2026-11-09) — GPT · Claude 가 노출 의상을 짓는다 */
    else if (oen) out.push('Outfit: ' + oen + (col ? fill(CL.colorLine, { color: col.en }) : '') + (dn ? fill(CL.denierLine, dn) : '') + (C.styleText && C.styleText(t, sc) ? '; ' + C.styleText(t, sc) : '') + (si ? fill(CL.situLine, { en: (X.indoor && si.enIn) || si.en }) : '') + specs);   /* 옷 꾸밈(scene.ostyle, 2026-11-23 — 공용 모듈 styleText) */
    if (po) out.push('POSTURE: ' + po.en + '.');
    if (su && su.en) out.push('SUPPORT: ' + su.en + '.');
    /* 몸이 옆모습이면 얼굴도 옆모습, 뒤 3/4 도 몸 표의 turned_face 를 붙인다 — 머리가 몸을 따를 때만. 카메라를 보면 눈만 */
    var bodyText = body && body.en + (body.profile_face && head && head.key === 'with_body' ? (gaze && gaze.key === 'camera' ? ', her face in profile too — only her eyes turn toward the camera' : ', her face in profile too, not turned toward the camera') : '')
      + (body.turned_face && head && head.key === 'with_body' ? ', ' + body.turned_face : '')
      + (X.side ? ', ' + X.side.body : '');
    var TT = C.turnText ? C.turnText(t, sc) : null;   /* 고개 · 몸 좌우(scene.turn, 2026-11-20 — 공용 모듈 turnText) */
    out.push('COMPOSITION: ' + [(f && f.en) || sc.frame, (TT && TT.body) || bodyText, TT ? TT.head : head && head.key !== 'with_body' && (bl ? bl.head : head.en), cam && cam.en].concat(X.comp, TT ? [TT.lock] : []).filter(Boolean).join('; ') + '.');
    var lens = C.lens(t, sc.frame);
    if (lens) out.push('Lens / perspective: ' + ((T.LENS_GUIDES[lens] || [])[1] || lens));
    var r = C.hand(t, sc.right), both = r && r.both && sc.right === sc.left;
    if (both) out.push('BOTH HANDS: ' + r.en + '.');
    else ['right', 'left'].forEach(function (side) {
      var k = sc[side], h = C.hand(t, k), text;
      if (k === 'prop') text = fill(CL.handBusy, { side: side });
      else if (h) text = h.en.replace('{side}', side) + (h.elbow ? ', her elbow ' + h.elbow : '');
      if (text) out.push(side.toUpperCase() + ' HAND: ' + text + X.where(side) + '.');
    });
    if (bl && bl.arm && !both) out.push(bl.arm);
    if (u && pr) {
      var thing = pr.signature ? (trim(sc.ownProp) || fill(CL.signatureProp, m)) : pr.en,   /* 캐릭터만의 컷은 그 직업의 도구(ownProp) */ action = u.en.replace('{prop}', thing);
      var side = sc.right === 'prop' ? 'right' : 'left';
      out.push('PROP: ' + (u.hands === 'both' ? fill(CL.propBoth, { action: action, right: (u.grip || {}).right, left: (u.grip || {}).left }) : fill(CL.propOne, { side: side, action: action })) + '.');
    }
    var lg = C.leg(t, sc.legs);
    if (lg && f && f.legs) out.push('LEGS: ' + lg.en + '.');
    if (gaze) out.push('GAZE: ' + gaze.en + '.');
    /* 표정은 버전2 표(눈썹·눈꺼풀·입만), 없으면 표정 문장에서 시선 말을 뗀 것. 몸이 「뒤」 이고 고개를 안 돌리면 얼굴이 안 보여 싣지 않는다 */
    var faceHidden = body && body.face_hidden && !(head && head.look_back);
    if (trim(sc.expr) && !faceHidden) out.push('EXPRESSION: ' + ((ex || {})[sc.expr] || (t.v2.expressions || {})[sc.expr] || exprNoGaze(T.EXPRESSION_DETAIL[sc.expr] || sc.expr)) + '.');
    if (trim(sc.scene)) out.push('Scene note: ' + quoted(sc.scene));
    if (trim(sc.custom)) out.push('Note: ' + quoted(sc.custom));
    T.LOCAL_AXES.forEach(function (k) {
      var v = sc.axes && sc.axes[k];
      if (!v || v === 'AUTO' || (T.ADVANCED_OPTIONS[k] || []).indexOf(v) < 0) return;
      var closeGuide = f && f.close && T.CLOSE_AXIS_GUIDES[k] && T.CLOSE_AXIS_GUIDES[k][v];
      out.push(k + ': ' + v + ' — ' + (closeGuide || T.SCENE_AXIS_GUIDES[k][v][1]));
    });
    return out;
  }

  /* 고정값 — 두 축과 화면비는 비었거나 AUTO 면 고정값(IMAGE_RULES 일상컷 고정값). 손으로 고른 값은 그대로 */
  function casualFixed(scene) {
    var F = T.CASUAL_FIXED, axes = Object.assign({}, scene.axes || {});
    Object.keys(F.axes).forEach(function (k) { if (!axes[k] || axes[k] === 'AUTO') axes[k] = F.axes[k]; });
    /* 자유 설계 칸은 늘 2:3(2026-11-23 — 화면비는 계획의 자세 · 프레이밍이 정하는데 자유 칸은 그것을 맡은 쪽이 짓는다) */
    return { axes: axes, aspect: !(scene.sfree || scene.ofree) && T.ASPECT_FRAME[trim(scene.aspect)] ? trim(scene.aspect) : F.aspect };
  }

  /* 참고 그림의 세계 — 그 카드가 사는 세계여야 한다. 아니면 '' */
  function casualWorld(D, key, world) { return worldsOf(D, key).indexOf(world) >= 0 ? world : ''; }
  function worldRow(world) { return T.WORLDS.filter(function (w) { return w.key === world; })[0] || null; }

  /* 일상컷 지시문 — opts = { world, style, tree, tree2 }. world 는 참고 그림(그 카드의 세계 그림)의 세계 — 없거나 그 카드가 안 사는 세계면 ''. 차례는 game 의 buildCasualV2 와 같다:
     INPUT → CHARACTER → DESIGN → STYLE → AGE → OUTPUT → FRAME·CROP → 시대 줄 → (SCREENS) → SCENE (chosen) → WARDROBE → ANGLE → (LOOK-BACK) → ONE MAIN FIGURE → ANATOMY → BODY → HANDS */
  /* 일상컷 — 얼굴 · 화풍은 첨부 그림에 맡긴다(2026-11-03). 화풍 문장 · 얼굴 문장을 새로 주면 GPT 세션이 첨부 그림의 얼굴을 그 말대로 다시 그렸다
     (헬륨 메카 일상 — 사용자 「일상컷 저거 너무 이상해」 → 이 세 줄로 「이제 좀 낫네」). STYLE 은 「첨부 그림 그대로」, FACE 줄을 넣고, 표정은 얼굴 안에서 살짝만 */
  var REF_STYLE = "STYLE: keep the attached image's rendering exactly — the same finish, skin rendering, line weight, colour palette, saturation and lighting quality. Do not restyle her: no more realistic, no more painterly, no more 2D than the attached image. Only the outfit, pose, expression, framing and place change.";
  var REF_FACE = "FACE: exactly the face of the attached image — the same face shape, jawline, eye shape and size, nose, lips and their proportions, and the same skin rendering. Do not add skin texture, pores, harder nose or lip modelling, or any facial definition the attached image does not have. Keep the same face proportions — the same short midface (eyes to mouth), jaw length and face length-to-width ratio; no camera angle or pose (low or high camera, chin on a hand, profile, looking back), bangs or headpiece may lengthen her face or lower face or make her jaw look heavier than in the attached image.";   /* 얼굴 길이 한 문장 — 삼국지 공방 REF_FACE 의 두 문장을 겹침 없이 줄여(일상컷 1200 낱말 상한)(2026-11-07 사용자 「원소공방에는 일상컷 근거리때 얼굴길이 줄이는게 없나?」 → 「응 적용해줘」). 구조판(mmorpg2d · semireal)은 STRUCT.casual.faceLock 이 따로 */
  var REF_EXPR = ' Show it mildly, only with her brows, eyelids and mouth corners; her face shape and features stay exactly as in the attached image.';
  function refLock(text) {
    var out = [], faced = false;
    String(text).split('\n\n').forEach(function (p) {
      if (/^STYLE: /.test(p)) { out.push(REF_STYLE); return; }
      if (/^FINAL CHECK: /.test(p)) return;
      if (/^AGE: the same adult woman as in the attached image/.test(p)) { out.push(REF_FACE); faced = true; return; }
      out.push(p.replace(/^EXPRESSION: .*$/m, function (l) { return l.replace(/\s+$/, '') + REF_EXPR; }));
    });
    if (!faced) { var i = out.findIndex(function (p) { return /^CHARACTER: /.test(p); }); out.splice(i >= 0 ? i + 1 : 1, 0, REF_FACE); }
    return out.join('\n\n');
  }
  /* 옷 색 shade(2026-11-16) — 묶음 글의 「such as」 예시 대신 그 묶음 안 구체 색 하나. 장면 shade 가 그 묶음 것이면 그것,
     아니면(옛 계획 · 생성기에서 묶음만 고른 것) 카드 | 세계 | 번호로 늘 같은 하나 — 그 사람 머리색과 같은 갈래(hue)는 피한다(다 피하면 피하지 않는다) */
  function hairHue(c, world) {
    var hc = c ? ((lookOf(c, world) || {}).silhouette || {}).hair_color : '', text = hc ? en('hair_color', hc) : '', rows = T.CASUAL.hairHue || [];
    for (var i = 0; text && i < rows.length; i++) if (new RegExp(rows[i][1], 'i').test(text)) return rows[i][0];
    return '';
  }
  function shadesOf(color) { var g = byKey(T.CASUAL.colors, color); return (g && g.shades) || []; }
  function autoShade(color, key, world, n, avoid) {
    var all = shadesOf(color), pool = all.filter(function (s) { return s.hue !== avoid; }); if (!pool.length) pool = all;
    return pool.length ? pool[hashKey(key + '|' + world + '|' + (n || 1)) % pool.length] : null;
  }
  function shadeFor(c, world, sc, n) {
    sc = sc || {}; if (!sc.color || !c) return null;
    return byKey(shadesOf(sc.color), sc.shade) || autoShade(sc.color, c.key, world, n, hairHue(c, world));
  }
  function colorFixed(en) { return !!(T.CASUAL.colorFixed && new RegExp(T.CASUAL.colorFixed, 'i').test(en || '')); }
  function denierFits(en) { var C = T.CASUAL; return !!(C.denierFit && new RegExp(C.denierFit, 'i').test(en || '') && !(C.denierSkip && new RegExp(C.denierSkip, 'i').test(en || ''))); }
  function situsFor(en) { return (T.CASUAL.situations || []).filter(function (s) { return new RegExp(s.fit || '.', 'i').test(en || '') && !(s.skip && new RegExp(s.skip, 'i').test(en || '')); }).map(function (s) { return s.key; }); }
  function situFits(key, en) { return situsFor(en).indexOf(key) >= 0; }
  function casualShortOn(S, styleKey) { var row = styleVer(S, styleKey) || {}; return row.casualShort === false || row.format === 'structured' ? false : !!(row.casualShort || T.CASUAL.shortAll); }
  /* 짧은 판의 화풍 단락 — 일상 글 > 세계 글, kv 판은 1절에서 머리 · 장르 고정을 뗀 앞 문장들(120낱말까지) */
  function shortStyle(S, styleKey) {
    var row = styleVer(S, styleKey) || {};
    var t = trim((row.casualKit || {}).style) || styleText(S, styleKey, 'casual') || styleText(S, styleKey, 'text') || String(row.section1 || '');
    t = String(t).replace(/^1\. RENDERING STYLE[^\n]*\n/, '').replace(/^STYLE:\s*/, '').split('GENRE LOCK')[0].replace(/\s+/g, ' ').trim();
    t = t.replace(/\s*[—-]\s*the same rendering quality as the attached image\.?/i, '.');
    var w = t.split(' ');
    if (w.length > 120) { var cut = w.slice(0, 120).join(' '); t = cut.lastIndexOf('.') > 0 ? cut.slice(0, cut.lastIndexOf('.') + 1) : cut; }
    return t;
  }
  /* 짧은 일상컷 — 화풍 단락 + 계획 칸 + 꼭 필요한 줄만(T.CASUAL.short) */
  /* 일상컷 체형 줄(2026-11-15 — 삼국지와 같이). refFree — 참고 그림이 GPT 임의 설계(몸이 GPT 것)면 체형 글 없이 그림의 몸만 */
  function figureLine(c, world, long, refFree) {
    var head = long ? 'FIGURE' : 'Figure', CL = T.CASUAL;
    if (refFree) return CL.bodyKeepFree ? fill(CL.bodyKeepFree, { head: head }) : '';
    var b = ((lookOf(c, world) || {}).silhouette || {}).body, x = b ? en('body', b) : ''; return x && CL.bodyKeep ? fill(CL.bodyKeep, { head: head, body: x }) : '';
  }
  function buildCasualShort(S, opts, c, wr, t, sc, m, close, aspect) {
    var C = root.AtelierCasualTreeV2, CL = T.CASUAL, SH = CL.short, row = styleVer(S, opts.style) || {};
    var ex = SH.expose[((sc.axes || {}).skin_exposure) || 'bold'] || SH.expose.bold;
    var det = casualDetailsV2(sc, t, m, row.expr).filter(function (l) { return !/^(?:overall_intensity|skin_exposure|action_level|source_influence|separates_preference):/.test(l); }).map(function (l) {
      if (/^Outfit: /.test(l)) return l.replace(/\.?\s*$/, '') + ', ' + ex + ', ' + SH.body + '.';
      if (/^EXPRESSION: /.test(l)) { var i = l.indexOf('. '); return i > 0 ? l.slice(0, i + 1) : l; }
      return l;
    });
    var who = fill((SH.who || {})[c.tier] || SH.who.root, m);
    var lines = [fill(SH.input, Object.assign({}, m, { who: who })), (SH.outputs || {})[aspect] || SH.output || '', SH.face, 'Style: ' + shortStyle(S, opts.style) + ' ' + SH.keep];
    var wp = det.some(function (l) { return l.indexOf(CL.worldPlace) >= 0; }), era = C.era(t, sc.era);
    if (wp && era) lines.push(casualEraLine(c, era, m, wr.key));   /* 「그 세계의 자리」 장소일 때만 세계 글 */
    lines.push(det.join('\n'));
    if (close) lines.push('Framing: ' + T.CROP_EDGE[trim(sc.frame)] + '.');
    /* 게임 코스프레 컷 — 머리 장식 줄 대신 코스튬 줄, 「원소가 옷의 디테일에」 줄은 뺀다(옷은 그 게임 캐릭터 것, 2026-11-15) */
    var cos = isCosplay(t, sc);
    if (cos && (CL.cosplay || {}).short) lines.push(CL.cosplay.short); else if (SH.headwear) lines.push(SH.headwear);
    if (m.traits && !cos) lines.push(fill(SH.legend, m));
    lines.push(figureLine(c, wr.key, false, opts.refFree));   /* 체형 줄(2026-11-15) */
    lines.push(trim(row.casualLight) || SH.light, creatureEnd(t, sc, SH.end));
    return lines.filter(Boolean).join('\n\n');
  }
  function buildCasual(D, S, key, scene, opts) {
    opts = opts || {}; scene = scene || {};
    var C = root.AtelierCasualTreeV2, C1 = root.AtelierCasualTree, CL = T.CASUAL;
    if (!C || !C1 || !opts.tree || !opts.tree2) throw new Error('Casual tree v2 needs lib/casual-tree.js, lib/casual-tree-v2.js, data/casual-tree.json and data/casual-tree-v2.json');
    var c = card(D, key); if (!c) return '';
    var wr = worldRow(casualWorld(D, key, opts.world)); if (!wr) return '';
    var t = C.make(opts.tree2, opts.tree), g = casualCard(c, opts.tree2, wr.key), m = Object.assign(casualVars(c), { world_key: wr.key, world_en: wr.en.charAt(0) + wr.en.slice(1).toLowerCase(), cosplay: opts.cosplay || null }), fx = casualFixed(scene);   /* cosplay — 게임 코스프레 목록(data/game-cosplay.json, 2026-11-15) */
    /* 자유 설계 칸은 장면 칸을 짜지 않는다 — 트리로 채우지(repair) 않는다(2026-11-11) */
    var sc = scene.sfree ? Object.assign(sceneV2(scene), { treeV: 2, axes: fx.axes }) : kidsScene(t, C.repair(t, Object.assign(sceneV2(scene), { axes: fx.axes }), g)), f = C.frame(t, sc.frame);
    var body = (t.v2.body || []).filter(function (r) { return r.key === sc.body; })[0] || {};
    var head = (t.v2.head || []).filter(function (r) { return r.key === sc.head; })[0] || {};
    var close = !sc.sfree && T.CLOSE_FRAMES.indexOf(trim(sc.frame)) >= 0, lines = [];
    m.shade = shadeFor(c, wr.key, sc, opts.n);   /* 옷 색 shade — opts.n 은 일상컷 번호(casualRecord · 생성기가 준다, 없으면 1) */
    if (casualShortOn(S, opts.style)) return buildCasualShort(S, opts, c, wr, t, sc, m, close, fx.aspect);   /* 짧은 일상컷(2026-11-09) · 화면비 — Output 줄(2026-11-23) */
    var sv = structVer(S, opts.style);
    if (sv) { var era0 = C.era(t, sc.era); return casualStructured(c, wr, sc, t, m, fx, sv, styleVer(S, opts.style).expr, [era0 ? bare(casualEraLine(c, era0, m, wr.key)) : '', C1.screens(t.v1, sc.place) ? bare(fill(CL.screens, m)) : '']); }
    /* 게임 코스프레 컷(2026-11-15) — CHARACTER 끝의 「원소는 장신구로만」 문장 · DESIGN · OUTPUT · WARDROBE 를 코스튬 줄로 */
    var cos = isCosplay(t, sc) && CL.cosplay;
    lines.push(fill(CL.input, m));
    lines.push(cos ? fill(CL.character[c.tier], m).replace(/ (?:Her element|The substance|That object) shows ONLY [\s\S]*$/, ' ' + cos.element) : fill(CL.character[c.tier], m));
    if (m.traits && !cos) lines.push(fill(CL.design, m));
    var st = styleText(S, opts.style, 'casual') || styleText(S, opts.style, 'text'); if (st) lines.push('STYLE: ' + st);
    lines.push(CL.age);
    lines.push(cos ? cos.output : CL.output);
    lines.push(fill(CL.frame, { frame: T.ASPECT_FRAME[fx.aspect] }));
    if (close) lines.push(fill(CL.crop, { edge: T.CROP_EDGE[trim(sc.frame)] }));
    var era = C.era(t, sc.era); if (era) lines.push(casualEraLine(c, era, m, wr.key));
    if (C1.screens(t.v1, sc.place)) lines.push(fill(CL.screens, m));
    lines.push('SCENE (chosen):\n' + casualDetailsV2(sc, t, m, styleVer(S, opts.style).expr).join('\n'));
    var csk = styleVer(S, opts.style).casualSkin; if (csk) lines.push(csk);   /* 삼국지에서 옮긴 판(kv_kmmo_23d · lock · 애니 광택)의 일상컷 피부 광택 줄 — 그 판만(2026-11-07) */
    lines.push(cos ? cos.wardrobe : close ? CL.wardrobeClose : CL.wardrobe);
    lines.push(CL.angle);
    /* 등이 카메라 쪽이고 고개를 어깨 너머로 돌렸을 때만 — 눈은 GAZE 줄이 정한다 */
    if (body.far && head.look_back) lines.push(CL.lookBack);
    lines.push(creatureKind(t, sc) === 'companion' ? fill(CL.figureCompanion, m) : fill(CL.figure, m) + ' ' + CL.creatures[creatureKind(t, sc)], close ? CL.anatomyClose : CL.anatomy);
    var fig = figureLine(c, wr.key, true, opts.refFree); if (fig) lines.push(fig);   /* 체형 줄 — ANATOMY 다음(2026-11-15) */
    lines.push(CL.body, CL.hands);
    return refLock(lines.join('\n\n'));
  }

  /* 올릴 파일 이름 — <카드>_<세계>_<화풍>_f_casual<n>.webp (IMAGE_RULES.md 3절). 세계는 참고 그림의 세계 */
  function casualFile(key, world, styleKey, n) { return fileName(key, world, styleKey, n || 1); }

  /* 기록 내보내기 — 그림 저장소 records/<카드>/<세계>-casual<n>.<화풍>-ui.json. ref 는 참고 그림(그 세계 그림) 파일 이름. 장면은 다시 검사한 뒤의 값(생성기가 보인 것과 같다) */
  function casualRecord(D, S, key, scene, opts, n) {
    opts = opts || {}; n = n || 1;
    var styleKey = opts.style || (S && S['default']), c = card(D, key), C = root.AtelierCasualTreeV2, world = casualWorld(D, key, opts.world);
    var fx = casualFixed(scene || {}), sc = sceneV2(scene);
    sc.axes = fx.axes; sc.aspect = fx.aspect;
    if (C && opts.tree && opts.tree2 && !sc.sfree) sc = Object.assign(C.repair(C.make(opts.tree2, opts.tree), sc, c ? casualCard(c, opts.tree2, world) : null), { aspect: fx.aspect });
    else if (sc.sfree) sc.treeV = 2;
    var rec = { atelier: 'element', card: key, tier: c ? c.tier : '', slot: 'casual' + n, treeV: 2, world: world, style: styleKey, styleVersion: styleVersion(S, styleKey),
      ref: world ? fileName(key, world, styleKey) : '', scene: sc, file: world ? casualFile(key, world, styleKey, n) : '', prompt: buildCasual(D, S, key, scene, Object.assign({}, opts, { n: n })), date: new Date().toISOString().slice(0, 10) };
    if (opts.refFree) rec.refDesign = 'gpt_free';   /* 참고 그림이 GPT 임의 설계 — 체형 줄이 그림의 몸만(2026-11-15) */
    return rec;
  }

  /* ══ 전경(2026-11-24 — city-atelier 의 전경을 옮김, 철 시험) ══ 나라 × 세계 × 화풍마다 풍경 한 장 — 사람 없음 · 글자 없음 · 3:2(나라 층 궤도의 배경).
     글은 T.VISTA(lib/prompt-spec.js). 장소 = 설계표 worlds.<세계>.en, 곁 장소 = scenes, 원소 결 = traits.en 의 첫 마디, 색 = palette.en,
     화풍 줄 = 화풍 판의 vista 칸(없으면 화풍 글 첫 문장으로 T.VISTA.styleFallback), Avoid = 그 세계 옷 줄의 「No …」(splitNo)에서 옷 낱말을 뺀 것.
     나라(근본 열쇠)에만 — 가문 · 주민 카드에는 전경이 없다 */
  function escRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var CLOTH_RE = null, HER_RE = /\b(?:she|her|hers|herself)\b/i;
  function clothRe() { return CLOTH_RE || (CLOTH_RE = new RegExp('\\b(?:' + T.VISTA.cloth.map(escRe).join('|') + ')s?\\b', 'i')); }
  /* 설계표 글에서 그녀를 가리키는 마디를 덜어 장소만 남긴다 — 꼬리 마디(behind her …)는 지우고, 그래도 she · her 가 남은 「;」 마디는
     첫 마디가 아니면 통째로, 첫 마디면 그 안의 「,」 조각만 뺀다 */
  function herCut(text) {
    var t = trim(text).replace(T.VISTA.herTail, '');
    var segs = t.split(/;\s*/), out = [];
    segs.forEach(function (s, i) {
      if (!HER_RE.test(s)) { out.push(s); return; }
      if (i) return;
      var keep = s.split(/,\s+/).filter(function (x) { return !HER_RE.test(x); });
      if (keep.length) out.push(keep.join(', '));
    });
    return trim(out.join('; '));
  }
  function vistaAvoid(world) {
    var w = (T.WORLDS || []).filter(function (x) { return x.key === world; })[0] || {};
    return splitNo(w.tail || '').avoid.filter(function (b, i, a) { return !clothRe().test(b) && a.indexOf(b) === i; });
  }
  function vistaStyle(S, styleKey) { var v = styleVer(S, styleKey), t = trim(v.vista), txt = trim(v.text), i = txt.indexOf('. '), head = noDot(i > 0 ? txt.slice(0, i) : txt); return t || (head ? fill(T.VISTA.styleFallback, { head: head }) : ''); }
  /* 원소 결 — traits.en 의 첫 마디(; 앞). 뒤 나라들의 성질 글은 「<원소>: …」 로 시작하는 내력 글이라 이름 머리를 떼고 T.VISTA.traitsMax 낱말 안에서 「,」 조각까지만(옅은 실마리) */
  function vistaTraits(n, e) {
    var t = herCut(String((n.traits || {}).en || '').split(';')[0]), max = T.VISTA.traitsMax || 30, out = [], k = 0;
    t = noDot(t.replace(new RegExp('^' + escRe(e.en) + ':\\s*', 'i'), ''));
    if (t.split(/\s+/).length <= max) return t;
    t.split(/,\s+/).some(function (x) { var m = x.split(/\s+/).length; if (out.length && k + m > max) return true; out.push(out.length ? x : x.split(/\s+/).slice(0, max).join(' ')); k += m; return false; });
    return noDot(out.join(', '));
  }
  function vistaFile(key, world, styleKey) { return fill(T.FILES.vista, { card: key, world: world, style: styleKey }); }
  function needVistaWorld(world) { if (!(T.VISTA.genre || {})[world]) throw new Error('unknown world: ' + world); }
  function buildVista(D, S, key, world, opts) {
    opts = opts || {}; needVistaWorld(world);
    var n = nationOf(D, key), e = element(D, key); if (!n || !e) throw new Error('unknown nation: ' + key + ' (vista — nation keys only, no house or citizen cards)');
    var b = (n.worlds || {})[world]; if (!b || !trim(b.en)) return '';
    var V = T.VISTA, st = vistaStyle(S, opts.style || (S && S['default'])), ban = vistaAvoid(world);
    var scenes = (b.scenes || []).map(function (s) { return noDot(herCut(s.en)); }).filter(Boolean);
    var traits = vistaTraits(n, e), pal = noDot((n.palette || {}).en);
    return [fill(V.head, { nation_en: e.en, symbol: e.symbol, genre: V.genre[world] }), fill(V.place, { place: noDot(herCut(b.en)) }),
      scenes.length ? fill(V.scenes, { list: scenes.join('; ') }) : '', traits ? fill(V.traits, { traits: traits }) : '', pal ? fill(V.palette, { palette: pal }) : '',
      V.composition, st ? fill(V.style, { style: st }) : '', V.none, ban.length ? fill(V.avoid, { list: ban.join(', ') }) : '', V.output].filter(Boolean).join('\n\n');
  }
  /* 전경 기록 — 그림 저장소 records/<나라>/<세계>-vista.<화풍>-api.json 의 바탕(그린 뒤 generation 을 더한다) */
  function vistaRecord(D, S, key, world, opts) {
    opts = opts || {};
    var styleKey = opts.style || (S && S['default']);
    return { atelier: 'element', card: key, kind: 'vista', world: world, style: styleKey, styleVersion: styleVersion(S, styleKey), file: vistaFile(key, world, styleKey),
      size: T.VISTA.size.slice(), prompt: buildVista(D, S, key, world, opts), date: new Date().toISOString().slice(0, 10) };
  }

  root.AtelierPrompt = { SEP: SEP, buildVista: buildVista, vistaFile: vistaFile, vistaRecord: vistaRecord, vistaAvoid: vistaAvoid, vistaStyle: vistaStyle, herCut: herCut, worldFillFace: function (D, key, world) { var c = card(D, key); return c ? faceOpts(c, world) : {}; }, worldFillTemplate: worldFillTemplate, worldFillErrors: worldFillErrors, worldFillPicks: worldFillPicks, designKeys: designKeys, designSummary: designSummary, card: card, cards: cards, worldsOf: worldsOf, element: element, nationOf: nationOf,
    build: build, buildKv: buildKv, kvVer: kvVer, worldLines: worldLines, fileName: fileName, record: record, styleText: styleText, styleVersion: styleVersion, structVer: structVer,
    lookOf: lookOf, normLook: normLook, scenesOf: scenesOf, normShot: normShot, holdOf: holdOf, faceItems: faceItems, silhouetteItems: silhouetteItems, identityParams: identityParams, paramValues: paramValues, exposureLine: exposureLine,
    buildCasual: buildCasual, casualCard: casualCard, casualWorld: casualWorld, casualFile: casualFile, casualRecord: casualRecord, casualDetailsV2: casualDetailsV2, freeDesignLines: freeDesignLines, exprNoGaze: exprNoGaze, sceneV2: sceneV2, casualFixed: casualFixed,
    silOf: silOf, buildWorldFree: buildWorldFree, silPool: silPool, worldShortOn: worldShortOn, worldSectionsOn: worldSectionsOn, splitNo: splitNo, casualShortOn: casualShortOn, shortStyle: shortStyle, colorFixed: colorFixed, hairHue: hairHue, shadesOf: shadesOf, autoShade: autoShade, shadeFor: shadeFor, denierFits: denierFits, situsFor: situsFor, situFits: situFits, cosplayText: cosplayText, isCosplay: isCosplay };
})(typeof window !== 'undefined' ? window : globalThis);
