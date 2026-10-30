/* 프롬프트 표 — 생성기가 쓰는 영어 문장과 선택지는 전부 여기 있다. 함수는 없다(tests/words.cjs 가 본다).
   조립은 lib/prompt-element.js 가 한다. 원소·가문·주민마다 다른 글은 data/element-design.json, 화풍 문장은 data/style.json 의 판에서 온다.

   시안 열두 장(2026-10-30 — 철·오가네손의 세계 넷, 주민 물병·녹슨 갑옷·못·금화)에서 확인한 뼈대:
     CONCEPT(층마다 한 문장: 근본은 「원소 그 자체의 의인화」, 가문주는 「물질의 의인화」, 주민은 「물건을 모티브로 한 의인화」)
     → TRAITS(나라의 성질 한 줄 + 가문의 성질 한 줄 + 물건 설명) → WORLD(세계 문단 — 나라의 세계 글 + 주민의 세계 메모)
     → STYLE → OUTPUT · BODY · ONE FIGURE ONLY · ANATOMY.
   「무엇」만 주고 「어떻게」는 모델에게 맡긴다 — myth 공방에서 배운 것. 현대 세계는 없다(일상컷이 맡는다). */
(function (root) {
  'use strict';

  /* 세계 셋 — 열쇠는 설계표 vocab.worlds 와 같다. ko 는 화면, text 는 세계 문단의 머리, mecha 는 설계 문장 틀 */
  var WORLDS = [
    { key: 'fantasy', ko: '판타지', en: 'FANTASY',
      head: 'WORLD — FANTASY: ',
      tail: 'Costume and setting belong to that fantasy world: period cloth, metal ornament and regalia built from the traits above, subtle magical glow along the patterns; no modern material, no machinery.' },
    { key: 'steampunk', ko: '스팀펑크', en: 'STEAMPUNK',
      head: 'WORLD — STEAMPUNK: ',
      tail: 'Costume is 19th-century industrial: fitted bodice or waistcoat over a bustled or layered skirt, brass fittings, goggles or a small instrument as ornament, muted palette with the traits above as accents; steam, pipes and gauges in the scene; no modern plastic, no sci-fi.' },
    { key: 'mecha', ko: '메카', en: 'MECHA',
      head: 'WORLD — MECHA: ',
      tail: 'MECHA DESIGN: she is a female mecha personification — plates, joints, binders and glow lines carry the traits above; the plates must read as solid armor with visible joints, not as cloth or a gown; a back unit may carry the motif. ' }
  ];

  /* 층마다 CONCEPT 한 문장. {nation}·{family}·{object} 는 설계표에서 채운다 */
  var TIERS = {
    root: { ko: '근본', text: 'CONCEPT: the personification of the element {nation_en} ({nation_ko}) itself — the sovereign of the {nation_en} Nation. A female character who IS the element; her costume, ornaments and colors carry the element’s traits.' },
    lord: { ko: '가문주', text: 'CONCEPT: the personification of {family_en} — the lord of the {family_en} House of the {nation_en} Nation. A female character who IS that substance; her costume, ornaments and colors carry the substance’s traits, within the element’s own palette.' },
    citizen: { ko: '주민', text: 'CONCEPT: a citizen of the {nation_en} Nation, of the {family_en} House. A female personification character with {object} as her motif — the object reimagined as a woman in cloth and ornament that carry its materials, colors, shape and motifs. She does NOT hold, carry or wield the object; it is not a separate object. Both hands are ordinary human hands and hold nothing.' }
  };
  /* 입는 물건(갑옷·헬멧·금관)은 「들지도 지니지도 않는다」 를 그대로 두면 모델이 벗기거나 작게 그린다 — myth 공방에서 배운 것 */
  var CITIZEN_WEAR = 'CONCEPT: a citizen of the {nation_en} Nation, of the {family_en} House. A female personification character with {object} as her motif — she WEARS it as her own costume at full scale, never as a separate prop in her hands; add no other gear. Both hands are ordinary human hands and hold nothing.';
  var ROOT_HANDS = 'Both hands are ordinary human hands and hold nothing.';

  var TRAITS_HEAD = 'ELEMENT TRAITS of {nation_en} ({symbol}) to carry in her design and the scene: ';
  var FAMILY_HEAD = 'HOUSE TRAITS of {family_en}: ';
  var PALETTE_HEAD = 'Palette: ';

  /* 출력 — 세로 2:3 카드 한 장. 일상컷은 트리가 붙을 때 더한다 */
  var OUTPUT = 'OUTPUT: one character image that works as card art. Vertical 2:3 frame, full body with head and feet inside the frame with clear margins, face turned toward the camera (front or three-quarter). Standing, card-ready pose; the environment may be rich while her design stays fully readable.';
  var BODY_LINE = 'BODY: a normal human body — one head, two arms and two legs, each joined at its natural joint. Hands and feet may be partly hidden by the pose or the frame.';
  var RULES = [
    'ONE FIGURE ONLY. No second character, no living creature, no text, no lettering, no numbers, no logo, no watermark, no speech bubble, no frame border.',
    'ANATOMY: natural adult proportions, both hands drawn correctly as hands. No extra limbs.'
  ];

  /* 덧붙임 칸 — 생성기 화면의 글 칸. id 는 기록의 열쇠 */
  var NOTES = [
    { id: 'scene', ko: '장소·상황', multi: true, head: 'SCENE NOTE: ' },
    { id: 'outfit', ko: '의상·소품', multi: true, head: 'OUTFIT NOTE: ' },
    { id: 'custom', ko: '추가 연출 요청', multi: true, head: 'EXTRA: ' }
  ];

  /* 파일 이름 틀 — IMAGE_RULES.md 3절과 같다 */
  var FILES = {
    world: '{card}_{world}_{style}_f.webp',
    casual: '{card}_{style}_f_casual{n}.webp'
  };

  root.AtelierSpec = {
    WORLDS: WORLDS, TIERS: TIERS, CITIZEN_WEAR: CITIZEN_WEAR, ROOT_HANDS: ROOT_HANDS,
    TRAITS_HEAD: TRAITS_HEAD, FAMILY_HEAD: FAMILY_HEAD, PALETTE_HEAD: PALETTE_HEAD,
    OUTPUT: OUTPUT, BODY_LINE: BODY_LINE, RULES: RULES, NOTES: NOTES, FILES: FILES
  };
})(typeof window !== 'undefined' ? window : globalThis);
