/* 외형 표 옮기기 — game-atelier 의 lib/prompt-spec.js 에서 외형 선택지·얼굴·실루엣 어휘를 글자 그대로 읽어 lib/look-spec.js 로 쓴다(2026-10-30).
   게임 말(「게임 설계표」)만 「나라 설계표」로 바꾸고, 원소 몫 색(팔레트에서 뽑은 머리·눈 색)을 더한다 — 더하는 것은 여기 EXTRA 에만 적는다.
   Run: node tools/port-look-spec.cjs [../game-atelier]   → lib/look-spec.js 를 다시 쓴다. tests/look-spec.cjs 가 game 표와 같은지 본다. */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const GAME = process.argv[2] || path.join(__dirname, '..', '..', 'game-atelier');
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(GAME, 'lib/prompt-spec.js'), 'utf8'), ctx);
const G = ctx.window.AtelierSpec;

/* 원소 몫 어휘 — 나라·가문 팔레트에서 뽑은 색. game 어휘에 없는 것만(머리색에 검정·쇠빛이 없다) */
const EXTRA = {
  hair_color: {
    iron_grey: 'iron-grey hair with a brushed-steel sheen', tempered_steel: 'brushed-steel silver hair with a tempered-blue sheen', rust_orange: 'rust-orange hair',
    soot_black: 'soot-black hair with a graphite sheen', violet_white: 'pale violet-white hair that dissolves into light at the ends',
    rain_blue: 'clear rain-blue hair', pale_aqua: 'pale aqua hair', cream: 'cream-blonde hair', rose_gold: 'rose-gold hair', salt_white: 'salt-white hair',
    /* 주민의 물건 재질 색(2026-10-31 — 주민 머리색은 물건, 눈 색은 가문) */
    mirror_steel: 'mirror-polished steel-silver hair with a cold blue glint', dark_iron: 'dark wrought-iron grey hair', cast_iron_black: 'cast-iron black hair with a dull sheen',
    rust_brown: 'rust-streaked dark brown-black hair', old_brass: 'tarnished old-brass brown hair', verdigris: 'sea-weathered verdigris-teal hair streaked with rust',
    brass_gold: 'polished brass-gold hair', pole_tipped: 'silver-grey hair dipped red on one side and blue on the other', deep_blood: 'deep translucent blood-red hair',
    glass_clear: 'clear glass-blue hair with bright highlights', stone_grey: 'mossy stone-grey hair', rain_grey: 'rain-grey hair with a wet sheen', pastel_sky: 'pale pastel sky-blue hair',
    ice_white: 'frost-white hair with pale blue tips', white_gold: 'white-gold hair that glows at the edges', plasma_blue: 'white-blue plasma-bright hair', copper: 'polished copper hair',
    prism_white: 'diamond-white hair with prism-rainbow glints', cedar: 'cedar-brown hair', terracotta: 'glazed terracotta-brown hair', bright_gold: 'bright cast-gold hair',
    /* 근본 여덟의 팔레트(2026-11-03) */
    helium_peach: 'pale peach-pink hair glowing softly like a gas-discharge tube', wafer_iridescent: 'blue-grey hair with a rainbow silicon-wafer sheen',
    basalt_sulfur: 'volcanic basalt-black hair tipped with crystalline sulfur-yellow', chlorine_green: 'pale yellow-green hair with a misty translucency',
    pearl_white: 'lustrous pearl-white hair with a pink-and-silver nacre sheen', moon_silver: 'liquid mirror-silver hair reflecting cold blue moonlight',
    uranium_green: 'hair glowing the eerie green of uranium glass',
    /* 2026-11-10 우라늄 색감을 검정 · 은 · 에메랄드로(사용자) */
    lead_silver: 'dark lead-grey hair with a soft silver sheen',
    /* 근본 여덟 더(2026-11-11 — 질소 · 네온 · 인 · 리튬 · 아연 · 주석 · 납 · 수은) */
    nitrogen_frost: 'frost-blue hair trailing a pale mist like liquid-nitrogen vapor', neon_red: 'glowing neon red-orange hair like a lit sign tube', phosphor_white: 'pale ivory-white hair with a faint green phosphorescent glow', lithium_crimson: 'soft silver-white hair tipped with crimson flame-red', zinc_spangle: 'blue-grey hair with a crystalline galvanized-spangle sheen', pewter: 'soft pewter-silver hair with a satin sheen', lead_blue: 'heavy dull blue-grey lead hair with a soft sheen', quicksilver: 'flowing liquid-quicksilver hair beading into mirror droplets at the tips',
    /* 근본 여덟(A) — 알루미늄 · 마그네슘 · 타이타늄 · 니켈 · 백금 · 텅스텐 · 크로뮴 · 코발트 */
    anodized_silver: 'bright satin aluminium-silver hair with soft anodized pastel blue and rose tints', flare_white: 'brilliant silver-white hair flaring blinding white at the tips, streaked with fresh chlorophyll green', titanium_tint: 'dark gunmetal-grey hair blooming at the ends into titanium heat-tint bands of straw gold, purple and blue', meteor_nickel: 'warm nickel silver-grey hair with a fine criss-cross sheen like a polished meteorite slice', platinum_white: 'cool satin platinum-white hair with a soft untarnished sheen', tungsten_ember: 'dark tungsten-grey hair glowing white-hot gold at the tips like a lit filament', chrome_prism: 'mirror-chrome silver hair streaked with chrome yellow, ruby red and viridian green', cobalt_blue: 'deep cobalt-blue hair with a glassy smalt sheen',
    /* 근본 여덟 B(2026-11-13 — 플루오린 · 아이오딘 · 브로민 · 아르곤 · 제논 · 붕소 · 비소 · 셀레늄) */
    fluorite_violet: 'violet hair banded with sea-green like a fluorite crystal', iodine_violet: 'lustrous blue-black hair dissolving into violet vapor at the tips', bromine_red: 'deep red-brown hair rippling like a heavy liquid, breathing orange-red fumes at the tips', argon_lilac: 'drowsy lilac-grey hair with a soft lavender discharge glow', xenon_flash: 'silver-white hair flashing pale ion-blue at the ends like a strobe', boron_green: 'dark brown-black hair licked with vivid green flame at the tips', arsenic_green: 'vivid poison-emerald Scheele\'s-green hair with a cold steel-grey sheen', selenium_ruby: 'dark metallic-grey hair glowing ruby-red where light strikes it'
  },
  eye_color: { violet: 'pale violet eyes', graphite_grey: 'graphite-grey eyes', rust_amber: 'rust-amber eyes', sodium_yellow: 'sodium-yellow eyes',
    /* 2026-11-03 근본 여덟(헬륨 · 규소 · 황 · 염소 · 칼슘 · 구리 · 은 · 우라늄)과 앞으로 — 사용자 「머리 스타일이나 눈색이 부족하면 더 추가해도 괜찮아」 */
    hazel: 'warm hazel eyes', storm_grey: 'storm-grey eyes', silver_grey: 'pale silver-grey eyes', honey: 'honey-gold eyes', rose: 'dusty rose-pink eyes',
    lilac: 'soft lilac eyes', mint: 'pale mint-green eyes', chartreuse: 'yellow-green chartreuse eyes', blue_flame: 'eerie blue-flame eyes',
    cherenkov_blue: 'luminous Cherenkov-blue eyes', peach: 'pale peach-pink eyes',
    /* 2026-11-11 수은 */ cinnabar: 'cinnabar-red eyes',
    /* 근본 여덟(A) — 알루미늄 · 마그네슘 · 타이타늄 · 니켈 · 크로뮴 */ sapphire: 'clear sapphire-blue eyes', chlorophyll_green: 'fresh chlorophyll-green eyes', anodized_violet: 'anodized violet-blue eyes with a gold rim', nickel_green: 'clear apple-green eyes like nickel salts', ruby: 'ruby-red eyes',
    /* 2026-11-13 근본 여덟 B — 플루오린 · 브로민 · 제논 */ pale_citrine: 'pale citrine-yellow eyes', tyrian_purple: 'deep Tyrian-purple eyes', ion_blue: 'glowing pale ion-blue eyes' },
  /* 머리 윤곽 — game 어휘 열은 열다섯 나라 · 세 세계에 모자라 돌려쓰게 된다(2026-11-03 사용자 「머리스타일은 지금 수가 제한적이라 계속 돌려쓰는 추세」).
     위로 올려 묶는 것은 updo_bun 하나뿐 — 스팀펑크 올림머리 금지(element-design.py)가 그대로 듣게 새 것은 다 내리거나 반만 묶는다 */
  hair: {
    pixie_cut: 'a short tousled pixie cut', wolf_cut: 'a shaggy layered wolf cut', hime_cut: 'long straight hair with blunt cheek-length sidelocks',
    long_curly: 'long spiral curls', half_up: 'long hair worn half-up, half-down', side_braid: 'a single thick braid over one shoulder',
    finger_waves: 'glossy chin-length finger waves', asymmetric_bob: 'an asymmetric bob, longer on one side', undercut_sweep: 'long hair swept to one side over a shaved undercut',
    slicked_back: 'sleek slicked-back hair', mermaid_waves: 'very long loose mermaid waves to the waist', flipped_shoulder: 'shoulder-length hair with outward-flipped ends',
    low_ponytail: 'a long low ponytail at the nape', shag_layers: 'a layered shag with face-framing pieces'
  },
  /* 글래머러스한 체형 — SILHOUETTE 줄이 뒤에 「 build」 를 붙이니 그 꼴로 읽히게(사용자 2026-11-01 「hourglass, voluptuous 등 글래머러스한 몸매가 더 많았으면」) — game 어휘의 일곱(아담·슬렌더·마른 장신·애슬레틱·글래머·장신·건장)에 더한다 */
  body: {
    hourglass: 'hourglass-figured — full bust and hips, distinctly narrow-waisted',
    voluptuous: 'voluptuous, generously curved at bust, hips and thighs',
    busty_slender: 'slender and full-busted, narrow-waisted',
    curvy_athletic: 'toned athletic-curvy, full-busted with rounded hips',
    /* 2026-11-12 화풍공방 core v6 — 삼국지에서 만든 두 체형(사용자 「공통으로 다 넣어주면 돼」). 글은 core 블록이 덮는다 */
    lean_toned: 'lean and toned — a slim, firm waist with softly defined vertical abs and lightly sculpted arms and shoulders, a full bust',
    petite_voluptuous: 'petite and short in stature yet voluptuous — a very full, heavy bust, a narrow waist and generously rounded hips on a small, compact frame, with realistic thighs and legs'
  }
};
const KO = {   // 설계표의 얼굴·실루엣 열쇠 → 화면 이름(lib/words.js 의 look.* 와 같다 — 검사가 맞춰 본다)
  face: { face_shape: '윤곽', eyes: '눈', brows: '눈썹', nose: '코', lips: '입', eye_color: '눈 색' },
  sil: { body: '체형', hair: '머리 윤곽', hair_color: '머리색' }
};

const neutral = s => s.replace(/게임 설계표/g, '나라 설계표').replace(/게임 팔레트/g, '나라 팔레트');
const J = v => neutral(JSON.stringify(v, null, 1));
const vocab = {};
for (const k of ['body', 'hair', 'hair_color', 'eye_color', 'face_shape', 'eyes', 'brows', 'nose', 'lips']) vocab[k] = Object.assign({}, G.VOCAB_EN[k], EXTRA[k] || {});
/* 노출 — game 의 FORM_EXPOSURE 에서 「FORM costume」 을 「the costume WORLD describes」 로. 과감은 세계로 겉옷 꼴을 고른다(판타지·메카는 겉옷, 스팀펑크는 열린 재단) */
const exposure = JSON.parse(JSON.stringify(G.FORM_EXPOSURE).replace(/the FORM costume/g, 'the costume WORLD describes').replace(/FORM costume/g, 'costume WORLD describes'));
const out = `/* 외형 표 — game-atelier lib/prompt-spec.js 의 외형 선택지(PARAM_DEFS)·얼굴 다섯 묶음·실루엣 어휘를 글자 그대로 옮겼다(tools/port-look-spec.cjs, 2026-10-30).
   손으로 고치지 않는다 — game 표가 바뀌면 스크립트를 다시 돌린다(tests/look-spec.cjs 가 같은지 본다). 원소 몫으로 더한 것은 스크립트의 EXTRA(머리·눈 색 · 글래머러스한 체형 넷)뿐.
   window.AtelierSpec 에 붙는다(lib/prompt-spec.js 뒤에 싣는다). 생성기·허브 통합 생성기의 외형 칸(base·build·face·hair)과 설계표 look 칸의 어휘가 여기서 나온다.
   사용자 2026-10-30 「게임 공방처럼 원소나 물질의 특성을 살려 외형 특징을 잡고 가자 — 팔레트 색을 머리·눈 색으로」. */
(function (root) {
  'use strict';
  var S = root.AtelierSpec = root.AtelierSpec || {};   /* 보통은 lib/prompt-spec.js 가 먼저 — 혼자 실려도 표만 든다(tests/words.cjs) */
  var L = {
    PARAM_DEFS: ${J(G.PARAM_DEFS)},
    IDENTITY_GROUPS: ${J(G.IDENTITY_GROUPS)},
    IDENTITY_EXCLUDED: ${J(G.IDENTITY_EXCLUDED)},
    FACE_KEYS: ${J(G.FACE_KEYS)},
    FACE_PARAM: ${J(G.FACE_PARAM)},
    SIL_PARAM: ${J(G.SIL_PARAM)},
    LOOK_KO: ${J(KO)},
    VOCAB_EN: ${J(vocab)},
    PARAM_GUIDES: ${J(G.PARAM_GUIDES)},
    PARAM_GROUP_HELP: ${J(G.PARAM_GROUP_HELP)},
    PARAM_HELP: ${J(G.PARAM_HELP)},
    HAIR_LENGTH_LIMITS: ${J(G.HAIR_LENGTH_LIMITS)},
    EYE_CONTOURS: ${J(G.EYE_CONTOURS)},
    COLOR_HEX: ${J(G.COLOR_HEX)},
    COLOR_KEYS: ${J(G.COLOR_KEYS)},
    AGE_DEFAULT: ${J(G.AGE_DEFAULT)},
    AGE_LINES: ${J(G.AGE_LINES)},
    EXPOSURE: ${J(exposure)},
    EXPOSURE_KEYS: ${J(G.FORM_EXPOSURE_KEYS)},
    EXPOSURE_DEFAULT: ${J(G.FORM_EXPOSURE_DEFAULT)},
    /* 세계 → 과감 노출의 갈래(game 은 복식 구조로 골랐다) */
    EXPOSURE_LAYER: { fantasy: 'outer', steampunk: 'open', mecha: 'outer' },
    LOOK_LINES: {
      silhouette: ${J(G.GAME_LINES.silhouette)},
      face: ${J(G.GAME_LINES.face)},
      identity: ${J(G.GAME_LINES.identity)},
      measurement: ${J(G.GAME_LINES.measurement)}
    }
  };
  Object.keys(L).forEach(function (k) { S[k] = L[k]; });
})(typeof window !== 'undefined' ? window : globalThis);
`;
fs.writeFileSync(path.join(__dirname, '..', 'lib/look-spec.js'), out);
console.log('lib/look-spec.js — 외형 선택지 ' + G.PARAM_DEFS.length + ' · 어휘 ' + Object.keys(vocab).length + ' 묶음(원소 몫 머리색 ' + Object.keys(EXTRA.hair_color).length + ' · 눈 색 ' + Object.keys(EXTRA.eye_color).length + ')');
