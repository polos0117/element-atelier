/* 지시문 조립 — 표(lib/prompt-spec.js)와 설계표(data/element-design.json)·화풍 판(data/style.json)으로 영어 지시문을 짓는다.
   ES 모듈도 빌드도 쓰지 않는다. window.AtelierPrompt 하나만 붙인다 — 생성기 화면·검사·허브(공방 모음)가 같이 쓴다.

   카드 = 세 층 가운데 하나: 근본(나라) · 가문주(나라-가문) · 주민(나라-가문-주민). 열쇠는 tools/roster.py 와 같은 규칙(하이픈).
   build(D, S, card, world, opts) → 지시문 글. D 는 설계표, S 는 화풍 판(style.json), card 는 카드 열쇠, world 는 세계 열쇠,
   opts 는 { style, notes: {scene, outfit, custom} }.
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
  function styleVersion(S, styleKey) {
    var st = (S && S.styles || {})[styleKey || (S && S['default'])];
    return st ? st.current : '';
  }

  function build(D, S, key, world, opts) {
    opts = opts || {};
    var c = card(D, key); if (!c) return '';
    var W = T.WORLDS.filter(function (w) { return w.key === world; })[0]; if (!W) return '';
    var n = c.nation, e = c.element, m = { nation_en: e.en, nation_ko: e.ko, symbol: e.symbol,
      family_en: c.family ? c.family.en : '', object: c.citizen ? trim((c.citizen.object || {}).en) : '' };
    var lines = [];
    /* CONCEPT */
    if (c.tier === 'citizen') lines.push(fill(c.citizen.wear ? T.CITIZEN_WEAR : T.TIERS.citizen.text, m));
    else lines.push(fill(T.TIERS[c.tier].text, m) + ' ' + T.ROOT_HANDS);
    /* TRAITS — 나라, 가문, (주민은 물건이 CONCEPT 에) */
    var tr = fill(T.TRAITS_HEAD, m) + trim((n.traits || {}).en) + '.' + (n.palette && n.palette.en ? ' ' + T.PALETTE_HEAD + trim(n.palette.en) + '.' : '');
    lines.push(tr);
    if (c.family) {
      var fam = c.family, ft = fill(T.FAMILY_HEAD, m) + trim((fam.traits || {}).en) + '.' + (fam.palette && fam.palette.en ? ' ' + T.PALETTE_HEAD + trim(fam.palette.en) + '.' : '');
      lines.push(ft);
    }
    /* WORLD — 나라의 세계 글(가문이 덮어쓰면 그것), 주민의 세계 메모, 세계 꼬리. 메카는 설계 문장 */
    var nw = ((c.family && c.family.worlds) || {})[world] || (n.worlds || {})[world] || {};
    var note = c.citizen && c.citizen.notes && c.citizen.notes[world] ? trim(c.citizen.notes[world].en) : '';
    if (note) note = note.charAt(0).toUpperCase() + note.slice(1);   // 나라 글 뒤에 문장으로 잇는다
    var wl = W.head + trim(nw.en) + (trim(nw.en) ? '.' : '') + (note ? ' ' + note + '.' : '');
    if (world === 'mecha') wl += ' ' + W.tail + (nw.design ? trim(nw.design) + '.' : '');
    else wl += ' ' + W.tail;
    lines.push(trim(wl));
    /* STYLE */
    var st = styleText(S, opts.style, 'text'); if (st) lines.push('STYLE: ' + st);
    /* 덧붙임 */
    var notes = opts.notes || {};
    T.NOTES.forEach(function (f) { var v = trim(notes[f.id]); if (v) lines.push(f.head + v); });
    /* 출력·몸·규칙 */
    lines.push(T.OUTPUT, T.BODY_LINE); lines.push.apply(lines, T.RULES);
    return lines.join('\n');
  }

  /* 올릴 파일 이름 — IMAGE_RULES.md 3절 */
  function fileName(key, world, styleKey, casualN) {
    return casualN ? fill(T.FILES.casual, { card: key, style: styleKey, n: casualN }) : fill(T.FILES.world, { card: key, world: world, style: styleKey });
  }

  /* 기록 내보내기 — 그림 저장소 records/<카드>/<세계>-ui.json 에 둔다 */
  function record(D, S, key, world, opts) {
    opts = opts || {};
    var styleKey = opts.style || (S && S['default']), c = card(D, key);
    return { atelier: 'element', card: key, tier: c ? c.tier : '', world: world, style: styleKey, styleVersion: styleVersion(S, styleKey),
      notes: opts.notes || {}, file: fileName(key, world, styleKey), prompt: build(D, S, key, world, opts), date: new Date().toISOString().slice(0, 10) };
  }

  /* ══ 일상컷(트리 버전2) ══ game-atelier 의 buildCasualV2·casualDetailsV2 에서 왔다(2026-10-30, docs/CASUAL_TREE_V2.md 5절).
     표 둘(opts.tree = data/casual-tree.json, opts.tree2 = data/casual-tree-v2.json)과 공용 모듈 lib/casual-tree.js·casual-tree-v2.js 가 있어야 한다.
     장면(scene)은 생성기가 만든 버전2 장면 하나 — treeV 2 · era · place · weather · ofam · item · outfit(글) · ofeat · posture · support · frame · body · head ·
     camera · right · left · use · kind · legs · gaze · expr · axes · aspect · scene(장소·상황 글) · custom(추가 연출) · unlocked · preset.
     첨부 그림이 없다(컷마다 새 사람) — INPUT 은 글만, CHARACTER 는 「누구의 의인화」. 시대 열쇠는 표에서 읽고 여기 박지 않는다(now · site · nation · fantasy). */
  var SCENE_V2 = ['treeV', 'era', 'place', 'ofam', 'item', 'posture', 'support', 'frame', 'body', 'head', 'camera', 'right', 'left', 'use', 'kind', 'legs', 'gaze',
    'weather', 'expr', 'preset', 'prop', 'outfit', 'ofeat', 'scene', 'custom', 'axes', 'unlocked', 'unlockedAuto'];
  function sceneV2(st) { var o = {}; SCENE_V2.forEach(function (k) { if (st && st[k] !== undefined) o[k] = st[k]; }); return o; }
  function quoted(v) { return trim(v).replace(/"/g, "'"); }

  /* 버전2 표정 — 표정 문장 속 시선 말을 뗀다(시선은 GAZE 줄 하나가 정한다) */
  var EXPR_GAZE = [[/,?\s*gaze slightly to the side/, ''], [/\bdirect (\w+) gaze\b/, '$1 eyes'], [/\bhard forward gaze\b/, 'hard eyes'],
    [/\bsoft distant gaze past the camera\b/, 'soft distant eyes'], [/\bgaze softened and directed slightly upward or away\b/, 'softened eyes'],
    [/\bgaze direct and unwarm\b/, 'eyes unwarm'], [/ fixed on one point/, ''], [/ looking away/, ''], [/,?\s*eyes off camera/, ''], [/\bgaze angled down and away,\s*/, '']];
  function exprNoGaze(text) { return EXPR_GAZE.reduce(function (t, r) { return t.replace(r[0], r[1]); }, String(text || '')); }

  /* 트리가 보는 「카드」 — 알아볼 거리를 손에 들지 않는다(signature_hold 비움: 주민은 물건을 들지 않고, 원소는 장신구로만). 출시 연도 칸은 없다 */
  function casualCard(c) { return { key: c.key, signature: [], signature_hold: [] }; }
  /* 설계표 → 틀 채우기 값 */
  function casualVars(c) {
    var n = c.nation, e = c.element;
    return { nation_en: e.en, nation_ko: e.ko, symbol: e.symbol, family_en: c.family ? c.family.en : '', object: c.citizen ? trim((c.citizen.object || {}).en) : '',
      traits: trim((n.traits || {}).en), palette: trim((n.palette || {}).en) };
  }
  /* 시대 줄 — 표의 시대 열쇠로 틀을 고른다. 나라 안(nation)은 나라(가문이 덮어쓰면 그것)의 판타지 세계 글, 쓰임의 현장(site)은 설계표에 현장 글이 있으면 그것 */
  function casualEraLine(c, eraRow, m) {
    var CL = T.CASUAL, n = c.nation, key = eraRow.key, tpl = CL.era[key];
    if (!tpl) return fill(CL.eraOther, { en: trim(eraRow.en) || key });
    var fw = ((c.family && c.family.worlds) || {}).fantasy || (n.worlds || {}).fantasy || {};
    var site = ((n.casual || {}).site || (n.worlds || {}).site || {}).en;
    return fill(tpl, Object.assign({}, m, { world: trim(fw.en) || 'its own recognisable places', site: trim(site) ? ' — ' + trim(site) : '' }));
  }

  /* 버전2 장면 → SCENE 줄들. 손·소품·받침의 관계는 PROP 한 줄에서만, 오른손·왼손은 인물 본인 기준 */
  function casualDetailsV2(sc, t, m) {
    var C = root.AtelierCasualTreeV2, CL = T.CASUAL, out = [], f = C.frame(t, sc.frame);
    var p = C.place(t, sc.place), fam = C.family(t, sc.ofam), it = C.item(t, sc.ofam, sc.item);
    var po = C.posture(t, sc.posture), su = C.support(t, sc.support), u = C.use(t, sc.use), pr = u && C.prop(t, u.prop);
    var by = function (list, k) { return (list || []).filter(function (r) { return r.key === k; })[0]; };
    var body = by(t.v2.body, sc.body), head = by(t.v2.head, sc.head), cam = by(t.v2.camera, sc.camera);
    var gaze = by(t.v2.gaze, sc.gaze || (u && u.gaze) || '');
    /* 세계 안 시대의 「그 세계의 자리」 장소는 WORLD 줄이 정한다 */
    if (p) out.push('Place: ' + (p.world_place ? CL.worldPlace : p.en));
    var wt = (t.v2.weather || []).filter(function (r) { return r.key === sc.weather; })[0];
    if (wt) out.push('Weather / season: ' + wt.en + '.');
    var specs = (sc.ofeat || []).indexOf('glasses') >= 0 ? CL.glasses : '';
    if (trim(sc.outfit)) out.push('Outfit: ' + trim(sc.outfit) + specs);
    else if (it) out.push('Outfit: ' + it.en + specs);
    else if (fam) out.push('Outfit: ' + fam.en + specs);
    if (po) out.push('POSTURE: ' + po.en + '.');
    if (su && su.en) out.push('SUPPORT: ' + su.en + '.');
    /* 몸이 옆모습이면 얼굴도 옆모습, 뒤 3/4 도 몸 표의 turned_face 를 붙인다 — 머리가 몸을 따를 때만. 카메라를 보면 눈만 */
    var bodyText = body && body.en + (body.profile_face && head && head.key === 'with_body' ? (gaze && gaze.key === 'camera' ? ', her face in profile too — only her eyes turn toward the camera' : ', her face in profile too, not turned toward the camera') : '')
      + (body.turned_face && head && head.key === 'with_body' ? ', ' + body.turned_face : '');
    out.push('COMPOSITION: ' + [(f && f.en) || sc.frame, bodyText, head && head.key !== 'with_body' && head.en, cam && cam.en].filter(Boolean).join('; ') + '.');
    var lens = C.lens(t, sc.frame);
    if (lens) out.push('Lens / perspective: ' + ((T.LENS_GUIDES[lens] || [])[1] || lens));
    var r = C.hand(t, sc.right), both = r && r.both && sc.right === sc.left;
    if (both) out.push('BOTH HANDS: ' + r.en + '.');
    else ['right', 'left'].forEach(function (side) {
      var k = sc[side], h = C.hand(t, k), text;
      if (k === 'prop') text = fill(CL.handBusy, { side: side });
      else if (h) text = h.en.replace('{side}', side) + (h.elbow ? ', her elbow ' + h.elbow : '');
      if (text) out.push(side.toUpperCase() + ' HAND: ' + text + '.');
    });
    if (u && pr) {
      var thing = pr.signature ? fill(CL.signatureProp, m) : pr.en, action = u.en.replace('{prop}', thing);
      var side = sc.right === 'prop' ? 'right' : 'left';
      out.push('PROP: ' + (u.hands === 'both' ? fill(CL.propBoth, { action: action, right: (u.grip || {}).right, left: (u.grip || {}).left }) : fill(CL.propOne, { side: side, action: action })) + '.');
    }
    var lg = C.leg(t, sc.legs);
    if (lg && f && f.legs) out.push('LEGS: ' + lg.en + '.');
    if (gaze) out.push('GAZE: ' + gaze.en + '.');
    /* 표정은 버전2 표(눈썹·눈꺼풀·입만), 없으면 표정 문장에서 시선 말을 뗀 것. 몸이 「뒤」 이고 고개를 안 돌리면 얼굴이 안 보여 싣지 않는다 */
    var faceHidden = body && body.face_hidden && !(head && head.look_back);
    if (trim(sc.expr) && !faceHidden) out.push('EXPRESSION: ' + ((t.v2.expressions || {})[sc.expr] || exprNoGaze(T.EXPRESSION_DETAIL[sc.expr] || sc.expr)) + '.');
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
    return { axes: axes, aspect: T.ASPECT_FRAME[trim(scene.aspect)] ? trim(scene.aspect) : F.aspect };
  }

  /* 일상컷 지시문 — opts = { style, tree, tree2 }. 차례는 game 의 buildCasualV2 와 같다:
     INPUT → CHARACTER → DESIGN → STYLE → AGE → OUTPUT → FRAME·CROP → 시대 줄 → (SCREENS) → SCENE (chosen) → WARDROBE → ANGLE → (LOOK-BACK) → ONE MAIN FIGURE → ANATOMY → BODY → HANDS */
  function buildCasual(D, S, key, scene, opts) {
    opts = opts || {}; scene = scene || {};
    var C = root.AtelierCasualTreeV2, C1 = root.AtelierCasualTree, CL = T.CASUAL;
    if (!C || !C1 || !opts.tree || !opts.tree2) throw new Error('Casual tree v2 needs lib/casual-tree.js, lib/casual-tree-v2.js, data/casual-tree.json and data/casual-tree-v2.json');
    var c = card(D, key); if (!c) return '';
    var t = C.make(opts.tree2, opts.tree), g = casualCard(c), m = casualVars(c), fx = casualFixed(scene);
    var sc = C.repair(t, Object.assign(sceneV2(scene), { axes: fx.axes }), g), f = C.frame(t, sc.frame);
    var body = (t.v2.body || []).filter(function (r) { return r.key === sc.body; })[0] || {};
    var head = (t.v2.head || []).filter(function (r) { return r.key === sc.head; })[0] || {};
    var close = T.CLOSE_FRAMES.indexOf(trim(sc.frame)) >= 0, lines = [];
    lines.push(CL.input);
    lines.push(fill(CL.character[c.tier], m));
    if (m.traits) lines.push(fill(CL.design, m));
    var st = styleText(S, opts.style, 'casual') || styleText(S, opts.style, 'text'); if (st) lines.push('STYLE: ' + st);
    lines.push(CL.age);
    lines.push(CL.output);
    lines.push(fill(CL.frame, { frame: T.ASPECT_FRAME[fx.aspect] }));
    if (close) lines.push(fill(CL.crop, { edge: T.CROP_EDGE[trim(sc.frame)] }));
    var era = C.era(t, sc.era); if (era) lines.push(casualEraLine(c, era, m));
    if (C1.screens(t.v1, sc.place)) lines.push(CL.screens);
    lines.push('SCENE (chosen):\n' + casualDetailsV2(sc, t, m).join('\n'));
    lines.push(close ? CL.wardrobeClose : CL.wardrobe);
    lines.push(CL.angle);
    /* 등이 카메라 쪽이고 고개를 어깨 너머로 돌렸을 때만 — 눈은 GAZE 줄이 정한다 */
    if (body.far && head.look_back) lines.push(CL.lookBack);
    lines.push(CL.figure, close ? CL.anatomyClose : CL.anatomy, CL.body, CL.hands);
    return lines.join('\n\n');
  }

  /* 올릴 파일 이름 — <카드>_<화풍>_f_casual<n>.webp (IMAGE_RULES.md 3절) */
  function casualFile(key, styleKey, n) { return fileName(key, '', styleKey, n || 1); }

  /* 기록 내보내기 — 그림 저장소 records/<카드>/casual<n>-ui.json. 장면은 다시 검사한 뒤의 값(생성기가 보인 것과 같다) */
  function casualRecord(D, S, key, scene, opts, n) {
    opts = opts || {}; n = n || 1;
    var styleKey = opts.style || (S && S['default']), c = card(D, key), C = root.AtelierCasualTreeV2;
    var fx = casualFixed(scene || {}), sc = sceneV2(scene);
    sc.axes = fx.axes; sc.aspect = fx.aspect;
    if (C && opts.tree && opts.tree2) sc = Object.assign(C.repair(C.make(opts.tree2, opts.tree), sc, c ? casualCard(c) : null), { aspect: fx.aspect });
    return { atelier: 'element', card: key, tier: c ? c.tier : '', slot: 'casual' + n, treeV: 2, style: styleKey, styleVersion: styleVersion(S, styleKey),
      scene: sc, file: casualFile(key, styleKey, n), prompt: buildCasual(D, S, key, scene, opts), date: new Date().toISOString().slice(0, 10) };
  }

  root.AtelierPrompt = { SEP: SEP, card: card, cards: cards, worldsOf: worldsOf, element: element, nationOf: nationOf,
    build: build, fileName: fileName, record: record, styleText: styleText, styleVersion: styleVersion,
    buildCasual: buildCasual, casualFile: casualFile, casualRecord: casualRecord, casualDetailsV2: casualDetailsV2, exprNoGaze: exprNoGaze, sceneV2: sceneV2, casualFixed: casualFixed };
})(typeof window !== 'undefined' ? window : globalThis);
