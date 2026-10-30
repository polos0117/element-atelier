/* 지시문 조립 — 표(lib/prompt-spec.js)와 설계표(data/element-design.json)·화풍 판(data/style.json)으로 영어 지시문을 짓는다.
   ES 모듈도 빌드도 쓰지 않는다. window.AtelierPrompt 하나만 붙인다 — 생성기 화면·검사·허브(공방 모음)가 같이 쓴다.

   카드 = 세 층 가운데 하나: 근본(나라) · 가문주(나라-가문) · 주민(나라-가문-주민). 열쇠는 tools/roster.py 와 같은 규칙(하이픈).
   build(D, S, card, world, opts) → 지시문 글. D 는 설계표, S 는 화풍 판(style.json), card 는 카드 열쇠, world 는 세계 열쇠,
   opts 는 { style, notes: {scene, outfit, custom} }. */
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

  root.AtelierPrompt = { SEP: SEP, card: card, cards: cards, worldsOf: worldsOf, element: element, nationOf: nationOf,
    build: build, fileName: fileName, record: record, styleText: styleText, styleVersion: styleVersion };
})(typeof window !== 'undefined' ? window : globalThis);
