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
      tail: 'COSTUME (fantasy): a high-fantasy royal or warrior costume — plate pauldrons or a gorget, mail or scale over a long tabard or robe, a circlet or crown, a flowing cape; metal ornament and regalia built from the traits above, subtle magical glow along the patterns. No corset, no bustle, no Victorian tailoring, no modern material, no machinery. LIGHT: natural daylight or the world\'s own magical glow, unless TIME & WEATHER says otherwise.',
      /* 과감 노출 — 세계마다 따로. 공용 노출 문장(look-spec)의 「corset-like waist · slits」 가 판타지·스팀펑크를 같은 코르셋 옷으로 끌어당겼다(2026-10-30 철 가문주) */
      /* 주민 — 물건이 먼저(2026-10-31): 세계 옷 뼈대가 모든 주민에게 같은 견갑·타바드를 입혀 물건을 덮었다. 세계는 시대 재단·마감만 */
      citizenTail: 'COSTUME (citizen, fantasy): her object leads — its silhouette, parts and materials must read at first glance in her outfit and headpiece, the object reimagined as cloth, forged pieces and ornament; the fantasy era only sets the period cut and finish — cloth, leather, forged metal, subtle magical glow. No corset, no modern material, no machinery. LIGHT: natural daylight or the world\'s own magical glow, unless TIME & WEATHER says otherwise.',
      exposureBold: 'EXPOSURE (bold): her regalia opens to show skin — bare shoulders and arms between pauldron and bracer, a deep open neckline under the gorget with natural cleavage, a high slit in the tabard or robe showing the thigh; armor pieces stay on and symmetrical. Nothing slipped off. Chest and pelvis covered; no corset; keep the costume WORLD describes, material and palette.' },
    { key: 'steampunk', ko: '스팀펑크', en: 'STEAMPUNK',
      head: 'WORLD — STEAMPUNK: ',
      tail: 'COSTUME (steampunk): late-Victorian industrial dress — a high-necked blouse with a waistcoat or a tailored tail coat, leather gloves, a work apron or utility belt with brass fittings, goggles hung at the neck or a small instrument as ornament; below, a short bustle skirt over riding trousers and laced boots; muted palette with the traits above as accents. No armor plates, no cape, no crown unless CONCEPT says she wears one; steam, pipes and gauges in the scene; no modern plastic, no sci-fi. LIGHT: hazy gaslight and a smoky overcast sky, unless TIME & WEATHER says otherwise. HAIR: her hair is worn exactly as SILHOUETTE says — loose, long or cut as named; do not pin it up into a bun or tuck it under goggles or a hat unless SILHOUETTE says an updo.',
      citizenTail: 'COSTUME (citizen, steampunk): her object leads — its silhouette, parts and materials must read at first glance in her outfit and headpiece, the object reimagined as cloth, leather and brass fittings; the steampunk era only sets the late-Victorian cut and the brass-and-leather finish. Steam, pipes and gauges in the scene; no modern plastic, no sci-fi. LIGHT: hazy gaslight and a smoky overcast sky, unless TIME & WEATHER says otherwise. HAIR: her hair is worn exactly as SILHOUETTE says — loose, long or cut as named; do not pin it up into a bun or tuck it under goggles or a hat unless SILHOUETTE says an updo.',
      exposureBold: 'EXPOSURE (bold): the high collar unbuttoned down to the sternum with natural cleavage, sleeves rolled above the elbow, a short bustle skirt showing the legs above laced boots; the waistcoat stays buttoned at the waist. Nothing slipped off. Chest and pelvis covered; no corset; keep the costume WORLD describes, material and palette.' },
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
  var OUTPUT = 'OUTPUT: one character image that works as card art. Vertical 2:3 frame, full body with head and feet inside the frame with clear margins, face turned toward the camera (front or three-quarter). {pose} the environment may be rich while her design stays fully readable.';
  /* 세계 그림의 자세 — 비우면 카드 자세. 셋을 나란히 견주는 자리라 프레이밍·카메라는 그대로(전신·정면 또는 3/4) */
  var POSE_DEFAULT = 'Standing, card-ready pose;';
  var WORLD_POSES = [
    { key: 'stand_3q', ko: '3/4 로 서서', en: 'Standing turned three-quarters toward the camera, weight on one leg, one hand resting at her side or hip;' },
    { key: 'stride', ko: '걸어 나오며', en: 'Mid-stride toward the camera, one foot forward, cloth and hair in motion;' },
    { key: 'sit_throne', ko: '앉아서(자리·계단)', en: 'Seated on a throne, step or edge that belongs to the world, upright, knees together or crossed, both feet visible;' },
    { key: 'kneel', ko: '한쪽 무릎', en: 'Down on one knee, the other foot planted, torso upright and facing the camera;' },
    { key: 'lean', ko: '기대서', en: 'Leaning back against a structure of the world (gate, rail, tank, pillar), arms relaxed;' },
    { key: 'arms_cross', ko: '팔짱', en: 'Standing square to the camera with arms crossed, chin level;' },
    { key: 'hand_heart', ko: '가슴에 손', en: 'Standing with one hand laid over her heart, the other at her side, a quiet ceremonial bearing;' }
  ];
  var WORLD_TIMES = [
    { key: 'dawn', ko: '새벽', en: 'TIME & WEATHER: first light of dawn — cool blue shadows, a thin warm line on the horizon.' },
    { key: 'day', ko: '한낮', en: 'TIME & WEATHER: clear daylight, crisp shadows.' },
    { key: 'golden', ko: '석양', en: 'TIME & WEATHER: golden hour — long warm light, deep orange sky.' },
    { key: 'night', ko: '밤', en: 'TIME & WEATHER: night — the scene lit by its own fires, lamps or glow, a dark sky above.' },
    { key: 'storm', ko: '폭풍', en: 'TIME & WEATHER: an approaching storm — heavy clouds, wind in cloth and hair, a flash of distant lightning.' },
    { key: 'snow', ko: '눈', en: 'TIME & WEATHER: falling snow, soft diffused light, snow on edges and shoulders.' },
    { key: 'fog', ko: '안개', en: 'TIME & WEATHER: thick fog — the far structures fade to silhouettes, near light glows in the mist.' }
  ];
  var SCENE_HEAD = 'SETTING (this card): ';
  /* 주민 메카 — 물건이 설계를 이끈다 */
  var CITIZEN_MECHA = 'Her object leads the mecha design — its silhouette and parts must read at first glance in the plates, binders, helmet and back unit.';
  /* 주민 과감 노출 — 세계 옷 뼈대 말(견갑·고르젯·블라우스) 없이 */
  var CITIZEN_EXPOSURE_BOLD = 'EXPOSURE (bold): her outfit opens to show skin — a deep open neckline with natural cleavage, bare shoulders or arms, a high slit or a short hem where the outfit allows; pieces stay symmetrical. Nothing slipped off. Chest and pelvis covered; no corset; keep the object\'s shape, material and palette.';   /* 장면 글은 전치사(inside·before·on·at)나 명사로 시작한다 — 머리말은 콜론까지만 */
  var EXPR_HEAD = 'EXPRESSION: ';
  var BODY_LINE = 'BODY: a normal human body — one head, two arms and two legs, each joined at its natural joint. Hands and feet may be partly hidden by the pose or the frame.';
  var RULES = [
    /* 원소 기호 · 원자 번호는 읽히게 나와도 된다(사용자 2026-10-31 「원자 번호랑 기호도 허용해줘」) — 그 밖의 글자 · 숫자는 없다. {symbol} · {number} 는 조립부가 채운다 */
    "ONE FIGURE ONLY. No second character, no living creature, no logo, no watermark, no speech bubble, no frame border. No text or numbers except her element's own chemical symbol ({symbol}) and atomic number ({number}) — those two may appear readably (engraved, stamped, glowing or on a sign or label); nothing else is written.",
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
    casual: '{card}_{world}_{style}_f_casual{n}.webp'   /* 일상컷은 그 세계 그림을 참고 그림으로 붙인다 — 세계를 탄다(사용자 2026-10-30) */
  };

  /* ══ 일상컷(트리 버전2) ══ game-atelier 의 GAME_LINES 일상컷 몫에서 왔다(2026-10-30, docs/CASUAL_TREE_V2.md 5절).
     장면(시대·장소·의상·자세·받침·구도·손·소품·다리·시선)은 data/casual-tree.json·casual-tree-v2.json 이 쥐고 lib/casual-tree*.js 가 거른다.
     여기는 그 장면을 영어 줄에 싣는 틀만. 조립은 lib/prompt-element.js 의 buildCasual.
     game 과 같은 것: 참고 그림을 붙인다 — 그 카드의 세계 그림(판타지·스팀펑크·메카 중 하나) 이 사람이 일상에 나온 한 장(사용자 2026-10-30 「일상컷은 참고 이미지가 있어야 돼서 그 화풍을 따라가야 돼」).
     그래서 일상컷은 세계를 타고(파일 이름에 세계), 화풍은 그 세계 그림의 화풍이다. INPUT·CHARACTER·WARDROBE·ANGLE 은 game 의 「첨부 그림의 …」 꼴.
     「그 게임」 자리는 「그 원소」 — 원소·물질·물건은 장신구·주변 사물로만, 옷의 색·무늬·재단과 갑옷으로는 옮기지 않는다. */
  var CASUAL = {
    input: "INPUT: the attached image is the approved character — her {world_en} card; keep her. Do not reuse earlier conversation images.",
    /* 층마다 CHARACTER 한 문장. {nation_en}·{symbol}·{family_en}·{object} 는 설계표에서. 얼굴·머리·몸은 첨부 그대로, 옷만 바꾼다 */
    character: {
      root: "CHARACTER: the same woman as the attached image — the personification of {nation_en} ({symbol}), seen in her everyday life. Keep her face, eye and hair colors, haircut, skin tone and body proportions; expression and hair motion may change, and her hair may be worn differently only as SCENE's Hair line says. Her element shows ONLY as a small accessory, an object around her, or the object PROP says she holds — never in the outfit's colours, patterns or cut, never as armor, regalia or a costume.",
      lord: "CHARACTER: the same woman as the attached image — the personification of {family_en}, of the {nation_en} Nation, seen in her everyday life. Keep her face, eye and hair colors, haircut, skin tone and body proportions; expression and hair motion may change, and her hair may be worn differently only as SCENE's Hair line says. The substance shows ONLY as a small accessory, an object around her, or the object PROP says she holds — never in the outfit's colours, patterns or cut, never as armor, regalia or a costume.",
      citizen: "CHARACTER: the same woman as the attached image — a citizen of the {nation_en} Nation, a personification of {object}, seen in her everyday life. Keep her face, eye and hair colors, haircut, skin tone and body proportions; expression and hair motion may change, and her hair may be worn differently only as SCENE's Hair line says. That object shows ONLY as a small accessory or a small object around her, never worn as a costume; she holds it only when PROP says so — her clothes are the ordinary outfit SCENE describes, in that outfit's own colours, patterns and cut."
    },
    /* 시간대 — 계절·날씨 뒤. 비우면 싣지 않는다(사용자 2026-10-30 「일상컷에 시간대」) */
    times: [
      { key: 'morning', ko: '아침', en: 'early morning — low clean light, long soft shadows' },
      { key: 'noon', ko: '한낮', en: 'midday — bright even light' },
      { key: 'golden', ko: '해 질 녘', en: 'golden hour — warm low sun, long shadows' },
      { key: 'dusk', ko: '땅거미', en: 'dusk — blue hour, lights coming on' },
      { key: 'night', ko: '밤', en: 'night — the scene lit by lamps, screens or windows, dark outside' },
      { key: 'neon', ko: '네온 밤', en: 'night under neon and signage light, coloured reflections' },
      { key: 'lamplight', ko: '등불', en: 'warm lamplight or candlelight indoors, the rest in shadow' }
    ],
    /* 머리 변화 — 첨부 그림의 색·길이는 지키고 매무새만(사용자 2026-10-30) */
    hairs: [
      { key: 'tied', ko: '묶음', en: 'her hair tied up in a loose bun or ponytail — same colour and length as the attached image, a few strands loose' },
      { key: 'down', ko: '풀어 내림', en: 'her hair let down loose over her shoulders — same colour and length as the attached image' },
      { key: 'braid', ko: '땋음', en: 'her hair in a single loose braid over one shoulder — same colour and length as the attached image' },
      { key: 'hat', ko: '모자·후드', en: 'a casual hat, cap or hood that suits the outfit, her hair showing beneath it — same colour and length as the attached image' },
      { key: 'wet', ko: '젖은 머리', en: 'her hair wet and slicked back or dripping — same colour and length as the attached image' }
    ],
    /* 팔레트·시각 언어는 장신구 힌트로만. 피부·머리·눈은 첨부 그림의 그 사람 */
    design: "DESIGN (accessory hints only): her element's visual language — {traits} — may inform at most one small accessory, a hair ornament or an object beside her, in its palette ({palette}). The clothes keep the chosen outfit's own colours; her skin, hair and eyes stay as in the attached image.",
    /* 2026-11-01 — 「soft full cheeks · soft smile」 을 뺐다(얼굴을 하나로 만들었다). 얼굴 · 나이는 첨부 그림의 그 사람, 표정은 SCENE 의 것 */
    age: "AGE: the same adult woman as in the attached image — keep her own face shape, cheekbones, eye proportions and skin tone exactly; minimal facial lines (no nasolabial folds, crow's feet, under-eye bags or cheek creases).",
    output: "OUTPUT: one standalone off-duty scene of her in the outfit chosen in SCENE; her element shows only through accessories and objects around her — never in the outfit's colours, patterns or cut, never as armor, regalia or a costume. Everything else follows SCENE (chosen).",
    frame: "FRAME: {frame} image. Compose the image for this frame; COMPOSITION in SCENE sets how much of her shows.",
    crop: "CROP: {edge}. This crop wins over every other line: details apply only to the part that shows, and the outfit reads through its visible neckline, straps, fabric and colour. Never widen the framing to show a hidden support, hand or leg; a limb crossing the edge runs naturally on past it, never cut off or fading out inside the image.",
    /* 시대 넷 — 열쇠는 트리 표 eras[].key(now · site · nation · fantasy). 표에 다른 시대가 있으면 그 시대의 en 으로 eraOther */
    era: {
      now: "ERA: the present-day real world — today's clothing, hair, devices and interiors; an ordinary woman of today, nothing of her element in her clothes.",
      site: "SETTING: a real present-day place where {nation_en} ({symbol}) is actually made, worked or used{site} — Place in SCENE names it. Its tools, materials and machines are the real ones of that trade; the element's own visual language ({traits}) lives in the surroundings, light and materials, never in her clothes. She is at ease there, in the outfit SCENE describes.",
      nation: "WORLD: this scene happens inside her own kingdom, the {nation_en} Nation, as if she simply lives there — {world}. Its architecture, props, light and weather show the world; no creatures, no second character, no readable text other than her element's own symbol and atomic number. Her clothes stay the everyday outfit SCENE describes, not regalia or armor.",
      fantasy: "SETTING: a stylised stage, editorial or fantasy set, not bound to a real year — still one real adult woman in a believable space, no creatures."
    },
    eraOther: "ERA: {en}.",
    worldPlace: "the place named in WORLD",
    screens: "SCREENS: any monitor, screen, poster or sign shows only abstract colored light, simple shapes, blank art or her element's symbol ({symbol}) and atomic number ({number}) — no other readable text or numbers, no logo.",
    wardrobe: "WARDROBE: change her clothes completely. From the attached image take only her face, hair and body — not its garment, armor, regalia, ornaments, mecha plates or background. Dress her exactly as SCENE describes; that outfit must read at first glance, keeping its own recognisable colours and parts. Do not carry the attached image's palette, patterns or trim into the outfit; her element belongs in accessories and props, never in the clothes — never restyle the chosen outfit into her element's palette, materials, patterns or regalia.",
    /* 가까운 컷의 옷 줄 — 「옷이 한눈에, 알아볼 부분이 다」 가 크롭 밖 치마·드레스 자락까지 불렀다(game 조조전 일상, 2026-10-29) */
    wardrobeClose: "WARDROBE: change her clothes completely. From the attached image take only her face, hair and body — not its garment, armor, regalia, ornaments, mecha plates or background. Dress her exactly as SCENE describes; the part of that outfit inside the crop must read at first glance in its own colours. Do not carry the attached image's palette, patterns or trim into the outfit; her element belongs in accessories and props, never in the clothes — never restyle the chosen outfit into her element's palette, materials, patterns or regalia.",
    angle: "ANGLE: the attached image fixes who she is, not how she is posed or shot. Do not copy its head angle, head tilt, gaze direction, face size in frame, camera height or crop — turn her head, set her gaze and place the camera exactly as SCENE describes, and let her face read naturally from that new angle (profile, three-quarter, looking down or away), with her features staying the same. No default card pose, no default front-facing portrait.",
    /* 돌아보기 — 등이 카메라 쪽이고 고개를 어깨 너머로 돌렸을 때만. 눈이 어디를 보는지는 GAZE 줄이 정한다 */
    lookBack: "LOOK-BACK: her back is toward the camera and her head turns at most a quarter turn over one shoulder — the face shows in profile or three-quarter view, never full-front on a back-facing torso. Her chin sits just above the near shoulder, the far eye and cheek may be partly hidden, the side of the neck shows the turn and the shoulder line continues behind the head. Where her eyes go follows GAZE.",
    /* 붐비는 장소(레드카펫·입장 줄·관중석)는 작고 흐린 배경 인물을 허용한다(game 사용자 2026-10-29) */
    figure: "ONE MAIN FIGURE: she is the only character in focus. Where the place is busy, other people may appear only as small, soft-focus background extras — never posed with her. No logo, no watermark, no speech bubble, no frame border. No text or numbers except her element's own chemical symbol ({symbol}) and atomic number ({number}) — those two may appear readably (engraved, stamped, glowing or on a sign or label); nothing else is written.",
    anatomy: "ANATOMY: natural adult proportions, about 7.5 heads tall — height from the legs, never a smaller head or a longer neck. The neck is a natural length and the head sits close to the shoulders. No body-part enlargement, no extra limbs.",
    /* 가까운 컷의 몸 줄 — 「7.5 등신·키는 다리에서」 가 전신을 부른다(game 스파2 일상, 2026-10-29) */
    anatomyClose: "ANATOMY: natural adult proportions, never a smaller head or a longer neck. The neck is a natural length and the head sits close to the shoulders. No body-part enlargement, no extra limbs.",
    body: "BODY: a normal human body — one head, two arms and two legs, each joined at its natural joint; elbows, knees and wrists bend the human way. Hands and feet may be partly hidden by the pose, what she holds or the frame. Right and left mean her own right and left, not the viewer's.",
    hands: "HANDS: natural human hands, no extra or duplicated limbs; each visible hand joins through its wrist and forearm to the matching shoulder. A hand may stay outside the crop, and fingers may be partly hidden by a grip.",
    handBusy: "her own {side} hand is in PROP",
    propOne: "with her own {side} hand she {action}; it is all she holds",
    propBoth: "with both hands she {action} — her own right hand {right}, her own left hand {left}",
    /* 소품 표의 「알아볼 거리」(signature) 자리 — 원소에선 그 원소의 작은 물건. 보통은 트리 거르기(signature_hold 비움)가 고르지 않게 한다 */
    signatureProp: "{hold}",   /* 설계표 hold.en(근본·가문주) · object.en(주민) — 일상컷에서 손에 드는 그 원소의 물건 */
    glasses: "; she wears thin-framed glasses"
  };
  /* 일상컷 고정값 — pkm·game 과 같다(IMAGE_RULES 일상컷 고정값). 생성기가 이 값으로 고르고 잠근다; 조립기도 빈 값이면 이 값으로 */
  var CASUAL_FIXED = { axes: { overall_intensity: 'strong', skin_exposure: 'bold' }, aspect: '2:3' };
  var ASPECT_OPTIONS = ['2:3', '3:2', '1:1', '9:16', '16:9'];
  /* 화면비 → FRAME 줄. 그림 저장소의 크기는 2:3 이 1024×1536 */
  var ASPECT_FRAME = { '2:3': 'a vertical 2:3 (1024×1536)', '3:2': 'a horizontal 3:2 (1536×1024)', '1:1': 'a square 1:1 (1024×1024)',
    '9:16': 'a tall vertical 9:16', '16:9': 'a wide horizontal 16:9' };
  /* CROP 줄의 아래 가장자리 — 「이 크롭이 이긴다」 만으로는 넓게 나왔다. 어디서 잘리는지를 말한다 */
  var CROP_EDGE = {
    waist_up: 'a waist-up shot — the bottom edge crosses her waist; hips, legs and feet are out of frame',
    chest_up: 'a chest-up shot — the bottom edge crosses just below her bust; waist, hips and legs are out of frame',
    face_close: 'a close-up — her face and hair fill most of the frame and the bottom edge crosses at her collarbones; nothing below the shoulders shows, and her hands and anything she holds stay below the frame unless raised to her face',
    detail: 'a detail shot — only the part of her the scene names fills the frame'
  };
  var CLOSE_FRAMES = Object.keys(CROP_EDGE);
  /* 추가 연출·장면 글에 이 말이 보이면 「손·소품은 칸에서 고르세요」 경고(막지는 않는다) */
  var CASUAL_HAND_WORDS = /\b(hold|holds|holding|hand|hands|grip|grips|cup|glass|phone|book|camera)\b|손|쥐|든다|들고|잔을/i;
  /* 가까운 컷의 노출 풀이 — 「배·다리 노출」 이 크롭 밖을 부른다. 노출은 CROP 안에서만, 컷은 움직이지 않는다 */
  var CLOSE_AXIS_GUIDES = { skin_exposure: {
    moderate: 'some exposed shoulders or arms inside the crop, with the chest covered',
    bold: 'more bare shoulder and collarbone inside the crop; the crop stays exactly where CROP sets it and never moves down to show more; cover the chest' } };
  /* 렌즈 — 버전2 는 프레이밍에 따라 자동(표 lens). [ko, en] */
  var LENS_GUIDES = {
    wide24: ['24mm 광각: 주변 장소와 앞뒤 거리감이 넓게 드러나요. 가까운 손발이나 얼굴이 과장되지 않도록 억제해요.',
      '24mm-equivalent wide-angle impression with spacious environmental depth; use enough camera distance to avoid stretching the face or limbs.'],
    documentary35: ['35mm 준광각: 인물과 주변 상황을 균형 있게 담는 생활 스냅 느낌이에요.',
      '35mm-equivalent environmental perspective balancing the woman and the setting with moderate depth.'],
    natural50: ['50mm 표준: 앞뒤 거리감을 과하게 벌리거나 압축하지 않는 무난한 표현이에요.',
      '50mm-equivalent natural perspective with balanced proportions and modest depth compression.'],
    portrait85: ['85mm 준망원: 배경이 조금 가까워 보이고 얼굴과 몸의 원근감이 차분해져요.',
      '85mm-equivalent short-telephoto perspective from a suitable distance, with gentle background compression.'],
    telephoto135: ['135mm 망원: 앞뒤 공간이 압축되고 배경 요소가 겹쳐 보여요.',
      '135mm-equivalent telephoto perspective from farther away, with compressed background depth and unchanged anatomy.']
  };
  /* 일상컷 두 축 — 장부(IMAGE_RULES)가 보는 축. 값·풀이는 pkm·book·game 과 열쇠가 같다 */
  var LOCAL_AXES = ['overall_intensity', 'skin_exposure'];
  var ADVANCED_OPTIONS = {
    overall_intensity: ['AUTO', 'restrained', 'sensual', 'bold', 'strong'],
    skin_exposure: ['AUTO', 'low', 'moderate', 'bold']
  };
  var ADVANCED_LABELS = { overall_intensity: ['Overall Intensity', '전체 강도'], skin_exposure: ['Skin Exposure', '피부 노출 정도'] };
  var ADV_AXIS = { overall_intensity: '이 장면의 스타일링과 분위기를 얼마나 강하게 표현할지 정해요.', skin_exposure: '가슴·골반을 제외한 부위의 노출 정도.' };
  var ADV_VAL = {
    overall_intensity: { restrained: '절제', sensual: '자연스럽게 관능적', bold: '과감', strong: '가장 강함' },
    skin_exposure: { low: '적게', moderate: '보통', bold: '많이' }
  };
  var SCENE_AXIS_GUIDES = {
    overall_intensity: {
      restrained: ['의상과 태도를 차분하게 절제해요. 노출량은 별도 선택이에요.', 'understated styling and restrained demeanor; exposure is separate'],
      sensual: ['부드러운 옷의 흐름과 여유 있는 몸짓으로 관능미를 표현해요.', 'sensual fabric drape and relaxed expressive posture; no automatic extra exposure'],
      bold: ['대담한 의상선과 자신감 있는 태도로 강도를 높여요.', 'bold outfit lines and confident demeanor; honor chosen coverage'],
      strong: ['선택한 장면 안에서 의상·태도의 존재감을 가장 강하게 해요.', 'maximal styling presence within the scene; retain chosen exposure and anatomy']
    },
    skin_exposure: {
      low: ['목·손 정도의 제한된 노출이에요. 직접 지정한 의상이 우선해요.', 'mostly covered clothing, limited neck/hand exposure unless outfit is explicit'],
      moderate: ['팔이나 종아리 등 일부 부위를 드러내요. 가슴·골반은 가려요.', 'some exposed arms or lower legs, with chest and pelvis covered'],
      bold: ['어깨·등·복부·다리에서 장면에 맞는 부위를 더 드러내요. 가슴·골반은 가려요.', 'more scene-appropriate shoulder, back, midriff or leg exposure; cover chest and pelvis']
    }
  };
  /* 표정 — 열쇠는 pkm·book·game 과 같다. 버전2 는 트리 표 expressions(시선 말 없는 문장)가 있으면 그것, 없으면 여기 문장에서 시선 말을 뗀 것 */
  var EXPRESSION_OPTIONS = [
    ['', 'AUTO — 자동'], ['calm', 'calm — 차분함'], ['focused', 'focused — 집중'], ['soft_smile', 'soft smile — 옅은 미소'], ['half_smile', 'half-smile — 은은한 미소'],
    ['playful', 'playful — 장난기'], ['confident', 'confident — 자신감'], ['sensual', 'sensual — 자연스러운 섹시'], ['provocative', 'provocative — 도발적이되 비노출'],
    ['sleepy', 'sleepy — 졸린 느낌'], ['candid', 'candid — 생활감'], ['mildly_annoyed', 'mildly annoyed — 약간 짜증'], ['surprised', 'surprised — 놀람'],
    ['curious', 'curious — 호기심'], ['serious', 'serious — 진지함'], ['amused', 'amused — 재미있어하는'], ['bored', 'bored — 심드렁함'], ['pensive', 'pensive — 생각에 잠긴'],
    ['smug', 'smug — 우쭐한'], ['gentle', 'gentle — 온화함'], ['determined', 'determined — 결의에 찬'], ['exhausted', 'exhausted — 지친'], ['nostalgic', 'nostalgic — 아련한'],
    ['unimpressed', 'unimpressed — 시큰둥함'], ['flustered', 'flustered — 당황한'], ['proud', 'proud — 자랑스러운'], ['wistful', 'wistful — 그리운 듯한'],
    ['mischievous', 'mischievous — 짓궂은'], ['relieved', 'relieved — 안도한'], ['cold_smile', 'cold smile — 차가운 미소'], ['laughing', 'laughing — 소리내어 웃는 · 눈 감김'],
    ['laughing_open', 'laughing, eyes open — 소리내어 웃는 · 눈 뜬 채'], ['wink', 'wink — 윙크']
  ];
  var EXPRESSION_DETAIL = {
    calm: 'relaxed brow, softly open eyes, lips closed and unstrained, no smile',
    focused: 'slightly drawn brow, narrowed steady eyes fixed on one point, mouth firmly closed',
    soft_smile: 'faint upward pull at the mouth corners, lips together, warmth reaching the lower eyelids',
    half_smile: 'one mouth corner lifted higher than the other, lips closed, gaze slightly to the side',
    playful: 'asymmetric grin with teeth just showing, one brow raised, eyes narrowed with amusement',
    confident: 'level brow, direct unhurried gaze, chin slightly raised, mouth closed and composed',
    sensual: 'heavy-lidded eyes, lips slightly parted and relaxed, brow smooth, chin a little lowered',
    provocative: 'direct challenging gaze under lowered lids, one brow raised, mouth corner tugged in a slight smirk',
    sleepy: 'heavy drooping eyelids, unfocused gaze, softened slack mouth, brow low and relaxed',
    candid: 'caught mid-motion, eyes off camera, mouth in an unposed in-between shape',
    mildly_annoyed: 'inner brows drawn together, one eye slightly narrowed, mouth pressed flat to one side',
    surprised: 'raised brows, widened eyes with visible upper white, mouth open in a small round shape',
    curious: 'one brow raised higher, head tilted, eyes wide and attentive, lips slightly parted',
    serious: 'level lowered brow, steady unblinking gaze, mouth closed in a straight line, jaw set',
    amused: 'crinkled lower eyelids, closed-lip smile pushing the cheeks up, brows relaxed',
    bored: 'lidded half-open eyes looking away, slack mouth, brows flat and unengaged',
    pensive: 'gaze angled down and away, slightly furrowed brow, lips lightly pressed or touched',
    smug: 'one mouth corner lifted, lids lowered in a knowing look, chin tipped slightly up',
    gentle: 'softly lowered brows, warm relaxed eyes, faint closed-lip smile, no tension anywhere',
    determined: 'brows pulled down and in, hard forward gaze, jaw clenched, mouth a tight line',
    exhausted: 'drooping lids and brows, dull unfocused gaze, mouth slightly open and slack, shoulders of the face fallen',
    nostalgic: 'soft distant gaze past the camera, faint wistful half-smile, brows gently raised at the inner ends',
    unimpressed: 'flat level brows, half-lidded deadpan stare, mouth in a straight unmoved line',
    flustered: 'raised inner brows, darting or averted eyes, mouth slightly open, faint blush across the cheeks and nose',
    proud: 'chin lifted, brows level, eyes bright and steady, closed-lip smile with a firm mouth',
    wistful: 'gaze softened and directed slightly upward or away, faint sad smile, inner brows raised',
    mischievous: 'narrowed sparkling eyes, one brow up, closed-lip grin pushed to one side',
    relieved: 'brows released upward and outward, eyes half closed, breath-out mouth slightly open, whole face loosened',
    cold_smile: 'mouth smiling while the eyes stay flat and unsmiling, brows level, gaze direct and unwarm',
    laughing: 'head tipped back slightly, eyes squeezed nearly shut, mouth open wide with teeth showing, cheeks raised high',
    laughing_open: 'mouth open wide in a laugh with teeth showing and cheeks raised, but the eyes stay open and engaged — lids only slightly narrowed, gaze still readable rather than squeezed shut',
    wink: 'one eye closed in a playful wink while the other stays open and bright, one mouth corner lifted in a small smile, brows relaxed'
  };

  /* 얼굴 설계 — 설계한 얼굴형 · 이목구비가 있어도 얼굴 느낌이 비슷하게 나왔다(사용자 2026-11-01 「얼굴형이나 이목구비를 설계로 나눠놔도 얼굴 느낌이 비슷하게 나오는것 같아」).
     판타지 열여섯 장의 얼굴을 모아 보니 큰 눈 · 갸름한 턱 · 흰 피부 · 같은 옅은 미소 — 다른 것은 머리뿐. 까닭: 모두에게 같은 AGE 줄(「soft full cheeks · soft smile」), 화풍 줄의
     「controlled anime facial design」, 전신 2:3 에서 코 · 입 차이는 안 보인다. 그래서 전신에서도 읽히는 칸을 더한다 — 나이감 · 인상 · 피부 톤 · 눈 크기 · 눈꼬리 · 표식(점 · 주근깨 · 화장) ·
     기본 표정(EXPRESSION_DETAIL 열쇠), 세계마다 앞머리. 설계표 look 에 인상(impression)이 있는 카드만 이 줄로 쓴다(시험 셋 → 사용자 확인 뒤 나머지) */
  var FACE_DESIGN = {
    head: "FACE — she must read as her own person at a glance, NOT the style's default pretty face and not a sister of the other characters: {items}.",
    age: {
      early_20s: 'AGE: about twenty — a fresh young-adult face; no facial lines.',
      mid_20s: 'AGE: mid-twenties — a clear adult face; no facial lines.',
      late_20s: 'AGE: late twenties — a settled, mature adult face with defined cheekbones; no wrinkles, folds or under-eye bags.',
      early_30s: 'AGE: early thirties — a poised, mature face with defined cheekbones and jaw; at most faint lines, no deep folds or under-eye bags.'
    },
    impression: {
      elegant: 'an elegant, refined presence', cool: 'a cool, aloof beauty', sharp: 'a sharp, striking, intense look', mature: 'a mature, poised woman',
      soft: 'a soft, gentle warmth', glamorous: 'a glamorous, sultry allure', rugged: 'a rugged, tough, outdoorsy look', stoic: 'a stoic, unreadable reserve',
      boyish: 'a boyish, mischievous tomboy energy', regal: 'a regal, imperious haughtiness', cute: 'a cute, bright-eyed sweetness', cheerful: 'a cheerful, sunny openness',
      languid: 'a languid, sleepy-eyed ease', fierce: 'a fierce, wild ferocity', melancholic: 'a quiet melancholy', androgynous: 'a striking androgynous handsomeness', innocent: 'a clear, innocent purity'
    },
    skin_tone: { porcelain: 'porcelain-pale skin', fair: 'fair skin', warm_beige: 'warm beige skin', olive: 'olive skin', golden_tan: 'golden tan skin', bronze: 'bronze-brown skin', deep_brown: 'deep brown skin' },
    eye_size: { small: 'smaller, narrower eyes than usual anime proportion', medium: 'moderately sized, realistically proportioned eyes', large: 'large eyes' },
    eye_tilt: { up: 'outer eye corners tilting sharply upward', level: 'level outer eye corners', down: 'outer eye corners drooping downward' },
    mark: {
      freckles: 'a dusting of freckles across nose and cheeks', mole_eye: 'a small beauty mark under one eye', mole_lip: 'a small beauty mark beside the lips',
      winged_liner: 'sharp winged eyeliner', smoky: 'smoky dark eye makeup', red_lip: 'bold red lipstick', dark_lip: 'dark berry lipstick', gloss: 'glossy nude lips',
      blush: 'rosy flushed cheeks', bare: 'a bare, makeup-free face', scar: 'a thin faint scar through one eyebrow'
    },
    bangs: {
      none: 'no bangs, forehead bare', straight: 'blunt straight bangs', side_swept: 'side-swept bangs', curtain: 'curtain bangs', one_eye: 'long bangs falling over one eye',
      parted: 'center-parted bangs framing the face', choppy: 'choppy uneven bangs'
    },
    /* 설계 칸 → 생성기 외형 칸(직접 고르면 설계 값이 빠진다) */
    param: { impression: 'facial character', skin_tone: 'skin tone', eye_size: 'eye size', eye_tilt: 'eye tilt', bangs: 'bangs', age: 'apparent age' }
  };

  /* ══ 구조판(2026-11-04 — 화풍 semireal, 사용자 「이런구조로 가자」 · 「생성기부터 손봐줘」) ══
     공통 적용 규칙 · 1절 작화 고정은 화풍 판(data/style.json 의 rules · casual_rule · section1)이 쥐고, 여기는 2~4절의 칸 이름과 칸의 기본 글.
     칸 값은 [ ] 안에 들어간다. 설계표 외형 값은 한글 낱말 표(ko)로 — 표에 없는 값만 영어 문구(lib/look-spec.js VOCAB_EN · FACE_DESIGN).
     카드마다 손으로 쓴 칸은 설계표의 struct.<세계>(세계 그림: "2" · "3" · "4", 일상컷 2절: "c2") — 칸 이름 그대로 덮어쓴다(tools/element-design.py 가 칸 이름을 본다).
     체형 여덟 칸은 체형 열쇠마다(BODY) — 규소에서 「탄탄 · 근육 결」 을 겹쳐 적었더니 보디빌더 쪽으로 넘쳤다(2026-11-04), 근육은 과장하지 않는다 */
  var STRUCT = {
    s2: ['캐릭터/콘셉트', '성별·나이대', '얼굴 크기', '얼굴형', '이목구비 배치', '눈 형태', '눈색', '동공', '코', '입술', '피부색', '머리색', '헤어스타일',
      '체형', '전체 골격·비례', '목·어깨', '가슴', '허리', '골반·엉덩이', '허벅지', '팔·종아리', '전체 실루엣'],
    s3: ['철학', '주요 색상', '주요 소재', '상의', '하의', '신발', '액세서리', '장비·소품', '부가 요소'],
    s4: ['액션', '손동작', '표정', '시선', '머리카락·의상 움직임', '구도', '카메라', '광원', '장면 팔레트', '배경', '환경 효과'],
    /* 외형 · 표정 · 자세 · 시간대의 한글(2026-11-04 — 사용자 「한글로 나오게 한 뒤에 손글칸 채우는게 맞을거 같은데」). 열쇠는 lib/look-spec.js VOCAB_EN · FACE_DESIGN ·
       EXPRESSION_DETAIL · WORLD_POSES · WORLD_TIMES · CASUAL.times · CASUAL.hairs 와 같다(tests/prompt-element.cjs 가 빠진 것을 본다). 이름 붙은 스타일 용어만 괄호로 영어 — 1절처럼 */
    ko: {
      face_shape: { oval: '부드러운 계란형(oval), 매끈한 볼, 완만하게 좁아지는 하관', round: '둥근 얼굴형(round), 볼이 둥글게 차오른 부드러운 윤곽', heart: '부드러운 하트형(heart-shaped), 넓고 매끈한 이마, 갸름하게 좁아지는 하관, 작고 뾰족한 턱끝',
        long: '긴 얼굴형(long face), 세로로 긴 윤곽과 곧은 볼선', square_soft: '부드러운 각진형(softly square), 또렷하지만 둥글게 다듬은 턱선', diamond: '갸름한 다이아몬드형(diamond-shaped), 살짝 드러나는 광대, 작고 단정한 턱끝' },
      eyes: { almond_wide: '완전히 뜬 넓은 아몬드형 눈(wide almond eyes)', round_large: '크고 둥근 눈(large round eyes)', narrow_upturned: '가늘고 눈꼬리가 올라간 눈(narrow upturned eyes)',
        droopy_soft: '눈꼬리가 살짝 처진 순한 눈(soft droopy eyes)', deep_set: '깊게 자리 잡은 눈(deep-set eyes)', monolid_long: '가로로 긴 홑꺼풀 눈(long monolid eyes)' },
      brows: { straight_thick: '짙고 곧은 일자 눈썹', arched_thin: '가늘게 휜 아치형 눈썹', soft_round: '부드럽고 둥근 눈썹', angled_sharp: '날카롭게 각진 눈썹', low_heavy: '낮고 짙은 눈썹' },
      nose: { small_button: '작고 동그란 코', straight_narrow: '곧고 가는 콧대, 작고 단정한 코끝', aquiline: '콧대가 살짝 휜 매부리코(aquiline)', broad_soft: '넓고 부드러운 코', upturned: '코끝이 살짝 들린 코' },
      lips: { full_wide: '도톰하고 넓은 입술', thin_long: '얇고 가로로 긴 입술', small_bow: '작은 활 모양 입술', heart_full: '도톰한 하트형 입술', wide_smile: '양 끝이 넓게 올라가는 입' },
      eye_color: { amber: '호박색 눈', azure: '맑은 하늘빛 청색 눈(azure)', coral: '산호빛 주황 눈', crimson: '진홍색 눈', ember: '불씨 같은 주황 눈', emerald: '에메랄드 초록 눈', forest_green: '깊은 숲 초록 눈',
        gold: '금색 눈', ice_blue: '얼음 같은 연청색 눈', leaf_green: '잎사귀 초록 눈', navy: '짙은 남색 눈', sky_blue: '하늘색 눈', steel_blue: '강철빛 청색 눈(steel-blue)', teal: '청록색 눈(teal)', violet: '연보라 눈',
        graphite_grey: '흑연빛 회색 눈', rust_amber: '녹슨 호박색 눈', sodium_yellow: '나트륨등 같은 노란 눈', hazel: '따뜻한 헤이즐색 눈', storm_grey: '폭풍 하늘 같은 회색 눈', silver_grey: '옅은 은회색 눈',
        honey: '꿀빛 금색 눈', rose: '먼지 낀 장밋빛 분홍 눈', lilac: '부드러운 라일락색 눈', mint: '옅은 민트 초록 눈', chartreuse: '연둣빛 샤르트뢰즈 눈(chartreuse)', blue_flame: '푸른 불꽃 같은 청색 눈',
        cherenkov_blue: '빛나는 체렌코프 청색 눈(Cherenkov blue)', peach: '맑은 연분홍 복숭앗빛 눈' },
      hair_color: { antique_gold: '고풍스러운 앤티크 금발', ash_gray: '잿빛 회색 머리', bright_red: '선명한 빨강 머리', bronze: '따뜻한 청동색 머리', crimson: '진홍색 머리', cyan: '밝은 시안색 머리',
        flame_orange: '불꽃 같은 주황 머리', golden_blonde: '황금빛 금발', grass_green: '풀빛 초록 머리', lemon_yellow: '레몬빛 노란 머리', navy: '짙은 남색 머리', ocean_blue: '바다빛 파란 머리',
        royal_blue: '선명한 로열 블루 머리', royal_purple: '짙은 왕실 보라 머리', silver_white: '은백색 머리', sunset_pink: '노을빛 분홍 머리', teal: '청록색 머리', violet: '보라색 머리', wine_red: '짙은 와인빛 머리',
        iron_grey: '브러시드 스틸 광택이 도는 철회색 머리', tempered_steel: '담금질한 푸른 광택이 도는 강철 은색 머리', rust_orange: '녹빛 주황 머리', soot_black: '흑연 광택이 도는 그을음빛 검은 머리',
        violet_white: '끝으로 갈수록 빛으로 흩어지는 연보랏빛 흰 머리', rain_blue: '맑은 빗물빛 파란 머리', pale_aqua: '옅은 아쿠아색 머리', cream: '크림빛 금발', rose_gold: '로즈골드 머리', salt_white: '소금처럼 흰 머리',
        mirror_steel: '차가운 푸른 빛이 비치는, 거울처럼 연마한 강철 은색 머리', dark_iron: '짙은 연철 회색 머리', cast_iron_black: '둔한 광택의 주철빛 검은 머리', rust_brown: '녹 줄이 섞인 짙은 갈흑색 머리',
        old_brass: '빛바랜 옛 황동빛 갈색 머리', verdigris: '녹 줄이 진, 바닷바람에 삭은 녹청색 머리', brass_gold: '광택 나는 황동빛 금색 머리', pole_tipped: '한쪽 끝은 빨강, 다른 쪽 끝은 파랑으로 물든 은회색 머리',
        deep_blood: '짙고 투명한 핏빛 빨강 머리', glass_clear: '밝은 하이라이트가 도는 맑은 유리빛 파란 머리', stone_grey: '이끼 낀 돌빛 회색 머리', rain_grey: '젖은 광택이 도는 비 오는 날의 회색 머리',
        pastel_sky: '옅은 파스텔 하늘색 머리', ice_white: '끝이 연한 파랑으로 물든 서리빛 흰 머리', white_gold: '가장자리가 빛나는 화이트골드 머리', plasma_blue: '플라스마처럼 밝은 흰빛 파란 머리',
        copper: '광택 나는 구릿빛 머리', prism_white: '프리즘 무지갯빛이 반짝이는 다이아몬드빛 흰 머리', cedar: '삼나무빛 갈색 머리', terracotta: '유약 바른 테라코타빛 갈색 머리', bright_gold: '밝은 주조 금빛 머리',
        helium_peach: '가스 방전관처럼 은은하게 빛나는 옅은 복숭앗빛 분홍 머리', wafer_iridescent: '빛을 받는 곳마다 실리콘 웨이퍼 같은 무지갯빛 광택이 도는 청회색 머리(rainbow silicon-wafer sheen)',
        basalt_sulfur: '끝이 결정 같은 유황빛 노랑으로 물든 화산 현무암빛 검은 머리', chlorine_green: '안개처럼 비치는 옅은 황록색 머리', pearl_white: '분홍·은빛 진주층 광택이 도는 진주빛 흰 머리',
        moon_silver: '차가운 푸른 달빛을 비추는, 액체 거울 같은 은색 머리', uranium_green: '우라늄 유리처럼 기묘한 초록으로 빛나는 머리' },
      hair: { short_crop: '짧게 친 숏컷(short crop)', bob: '단발(bob)', ponytail: '긴 포니테일(ponytail)', long_straight: '긴 생머리', long_wavy: '긴 웨이브 머리', updo_bun: '올림머리 번(updo bun)', braids: '길게 땋은 머리',
        voluminous: '풍성한 볼륨 머리', twin_tails: '양갈래(twin tails)', side_swept: '한쪽으로 쓸어 넘긴 긴 머리', pixie_cut: '짧고 헝클어진 픽시컷(pixie cut)', wolf_cut: '층을 많이 낸 덥수룩한 울프컷(wolf cut)',
        hime_cut: '볼 높이에서 일자로 자른 옆머리가 있는 긴 생머리(hime cut)', long_curly: '길게 꼬인 나선형 컬', half_up: '긴 머리를 윗부분만 묶어 올린 반묶음(half-up, half-down)',
        side_braid: '한쪽 어깨 위로 늘어뜨린 굵은 한 갈래 땋은 머리', finger_waves: '턱선 길이의 윤기 있는 핑거 웨이브 단발(finger waves)', asymmetric_bob: '한쪽이 더 긴 비대칭 단발(asymmetric bob)',
        undercut_sweep: '언더컷 위로 한쪽에 쓸어 넘긴 긴 머리(undercut)', slicked_back: '매끈하게 뒤로 넘긴 머리(slicked back)', mermaid_waves: '허리까지 내려오는 풍성하고 느슨한 인어 웨이브(mermaid waves)',
        flipped_shoulder: '끝이 바깥으로 뻗친 어깨 길이 머리', low_ponytail: '목덜미에서 낮게 묶어 등까지 내려오는 긴 로우 포니테일(low ponytail)', shag_layers: '얼굴 주변에 층을 낸 레이어드 샤기컷(shag)' },
      bangs: { none: '앞머리 없이 드러난 이마', straight: '일자로 자른 앞머리(blunt bangs)', side_swept: '한쪽으로 쓸어 넘긴 옆 앞머리(side-swept bangs)', curtain: '가운데에서 갈라져 얼굴을 감싸는 커튼 앞머리(curtain bangs)',
        one_eye: '한쪽 눈 위로 길게 내려오는 앞머리', parted: '가운데에서 갈라져 이마 양쪽을 덮는 앞머리(center-parted bangs)', choppy: '들쭉날쭉한 앞머리(choppy bangs)' },
      impression: { elegant: '우아하고 기품 있는', cool: '차갑고 도도한 미인', sharp: '날카롭고 강렬한', mature: '성숙하고 침착한 여성', soft: '부드럽고 다정한 온기', glamorous: '화려하고 관능적인',
        rugged: '거칠고 단단한 야외형', stoic: '속을 읽을 수 없는 침착함', boyish: '장난기 있는 보이시한', regal: '위엄 있고 도도한 기품', cute: '눈이 반짝이는 귀여움', cheerful: '밝고 쾌활한',
        languid: '나른하고 여유로운', fierce: '사납고 야성적인', melancholic: '조용한 우수', androgynous: '중성적인 미모', innocent: '맑고 순수한' },
      skin_tone: { porcelain: '도자기처럼 흰 피부', fair: '밝은 피부', warm_beige: '따뜻한 베이지 피부', olive: '올리브빛 피부', golden_tan: '따뜻한 황금빛 태닝 피부(golden tan)', bronze: '청동빛 갈색 피부', deep_brown: '짙은 갈색 피부' },
      eye_size: { small: '애니메이션 비례보다 작고 가는 눈', medium: '적당한 크기의 실제 비례에 가까운 눈', large: '큰 눈' },
      eye_tilt: { up: '눈꼬리가 날카롭게 올라감', level: '눈꼬리는 수평', down: '눈꼬리가 아래로 처짐' },
      mark: { freckles: '코와 볼에 흩뿌린 주근깨', mole_eye: '한쪽 눈 아래 작은 점', mole_lip: '입술 옆 작은 점', winged_liner: '날렵한 윙 아이라인', smoky: '짙은 스모키 눈화장', red_lip: '선명한 빨간 립스틱',
        dark_lip: '짙은 베리색 립스틱', gloss: '윤기 있는 누드톤 입술', blush: '발그레한 볼', bare: '화장기 없는 맨얼굴(bare face)', scar: '한쪽 눈썹을 가로지르는 가늘고 옅은 흉터' },
      age: { early_20s: '갓 성인이 된 앳된 얼굴, 주름 없음', mid_20s: '또렷한 성인 얼굴, 주름 없음', late_20s: '광대가 또렷한 성숙하고 안정된 얼굴, 주름·팔자·눈밑 처짐 없음',
        early_30s: '광대와 턱선이 또렷한 침착하고 성숙한 얼굴, 옅은 선 정도만, 깊은 주름·눈밑 처짐 없음' },
      expr: { calm: '힘을 뺀 눈썹, 부드럽게 뜬 눈, 힘주지 않고 다문 입술, 웃지 않음', focused: '살짝 모은 눈썹, 한 점을 응시하는 가늘고 흔들림 없는 눈, 굳게 다문 입',
        soft_smile: '입술을 다문 채 입꼬리만 살짝 올라간 옅은 미소, 아래 눈꺼풀까지 닿는 따뜻한 눈빛', half_smile: '한쪽 입꼬리가 더 올라간 입 다문 미소, 시선은 살짝 옆으로',
        playful: '이가 살짝 보이는 비대칭 웃음, 한쪽 눈썹을 올리고 재미있다는 듯 가늘게 뜬 눈', confident: '수평의 눈썹, 서두르지 않는 곧은 시선, 살짝 든 턱, 침착하게 다문 입',
        sensual: '무겁게 내려온 눈꺼풀, 힘을 빼고 살짝 벌린 입술, 매끈한 눈썹, 살짝 숙인 턱', provocative: '내리깐 눈꺼풀 아래 도전적인 곧은 시선, 한쪽 눈썹을 올리고 한쪽 입꼬리를 살짝 당긴 미소',
        sleepy: '무겁게 처진 눈꺼풀, 초점 없는 시선, 힘이 풀린 입, 낮고 편한 눈썹', candid: '움직이는 도중에 잡힌 모습, 카메라를 보지 않는 눈, 꾸미지 않은 중간 모양의 입',
        mildly_annoyed: '안쪽으로 모은 눈썹, 살짝 가늘게 뜬 한쪽 눈, 한쪽으로 납작하게 다문 입', surprised: '올라간 눈썹, 흰자가 위로 보이게 크게 뜬 눈, 작고 둥글게 벌린 입',
        curious: '한쪽 눈썹을 더 올리고 고개를 갸웃, 크게 뜬 주의 깊은 눈, 살짝 벌린 입술', serious: '낮고 수평인 눈썹, 깜빡임 없는 흔들림 없는 시선, 일자로 다문 입, 힘준 턱',
        amused: '주름 잡힌 아래 눈꺼풀, 볼을 밀어 올리는 입 다문 미소, 편한 눈썹', bored: '반쯤 감긴 눈으로 다른 곳을 봄, 힘 빠진 입, 납작하고 무심한 눈썹',
        pensive: '아래 옆으로 향한 시선, 살짝 찌푸린 눈썹, 가볍게 다물거나 손이 닿은 입술', smug: '한쪽 입꼬리를 올리고 다 안다는 듯 내리깐 눈꺼풀, 살짝 든 턱',
        gentle: '부드럽게 내려온 눈썹, 따뜻하고 편안한 눈, 입을 다문 옅은 미소, 어디에도 긴장이 없음', determined: '아래 안쪽으로 당긴 눈썹, 앞을 노려보는 단단한 시선, 힘준 턱, 꽉 다문 입',
        exhausted: '처진 눈꺼풀과 눈썹, 초점 잃은 흐린 시선, 살짝 벌어진 힘 빠진 입', nostalgic: '카메라 너머 먼 곳을 보는 부드러운 시선, 아련한 옅은 반미소, 안쪽 끝이 살짝 올라간 눈썹',
        unimpressed: '납작한 수평 눈썹, 반쯤 감은 무표정한 응시, 움직임 없는 일자 입', flustered: '올라간 안쪽 눈썹, 흔들리거나 피하는 눈, 살짝 벌린 입, 볼과 코에 옅은 홍조',
        proud: '든 턱, 수평의 눈썹, 밝고 흔들림 없는 눈, 입을 단단히 다문 미소', wistful: '살짝 위나 옆으로 향한 부드러운 시선, 옅고 슬픈 미소, 올라간 안쪽 눈썹',
        mischievous: '반짝이며 가늘게 뜬 눈, 한쪽 눈썹을 올리고 한쪽으로 밀린 입 다문 웃음', relieved: '위·바깥으로 풀린 눈썹, 반쯤 감은 눈, 숨을 내쉬듯 살짝 벌린 입, 얼굴 전체가 풀림',
        cold_smile: '입은 웃지만 눈은 웃지 않는 납작한 눈빛, 수평 눈썹, 곧고 차가운 시선', laughing: '고개를 살짝 젖히고 눈을 거의 감은 채 이를 드러내며 크게 웃는 입, 높이 올라간 볼',
        laughing_open: '이를 드러내고 볼이 올라가게 크게 웃지만 눈은 뜬 채 — 눈꺼풀만 살짝 좁아지고 시선이 읽힘', wink: '한쪽 눈은 장난스럽게 감고 다른 눈은 밝게 뜬 채, 한쪽 입꼬리를 올린 작은 미소, 편한 눈썹' },
      pose: { stand_3q: '카메라 쪽 3/4으로 돌아 서서 한쪽 다리에 무게를 싣고, 한 손은 옆구리나 허리에 둠', stride: '한 발을 앞으로 내디디며 카메라를 향해 걸어 나오는 동작, 옷자락과 머리가 움직임',
        sit_throne: '그 세계에 속한 왕좌·계단·턱에 곧게 앉아 무릎을 모으거나 꼬고, 두 발이 다 보임', kneel: '한쪽 무릎을 꿇고 다른 발을 디딘 채 상체를 곧게 세워 카메라를 봄',
        lean: '그 세계의 구조물(문·난간·탱크·기둥)에 등을 기대고 팔은 편하게', arms_cross: '카메라를 정면으로 보고 팔짱을 낀 채 턱은 수평', hand_heart: '한 손을 가슴에 얹고 다른 손은 옆에 둔 조용하고 의례적인 자세' },
      time: { dawn: '새벽 첫 빛 — 차가운 푸른 그림자, 지평선의 가는 따뜻한 선', day: '맑은 한낮 빛, 선명한 그림자', golden: '석양 — 길고 따뜻한 빛, 짙은 주황 하늘',
        night: '밤 — 장면 속 불·등불·발광이 비추고 위는 어두운 하늘', storm: '다가오는 폭풍 — 무거운 구름, 옷과 머리를 흔드는 바람, 먼 번개', snow: '내리는 눈, 부드럽게 퍼진 빛, 가장자리와 어깨에 쌓인 눈',
        fog: '짙은 안개 — 먼 구조물은 실루엣으로 사라지고 가까운 빛이 안개 속에서 번짐' },
      ctime: { morning: '이른 아침 — 낮고 맑은 빛, 길고 부드러운 그림자', noon: '한낮 — 밝고 고른 빛', golden: '해 질 녘 — 따뜻하고 낮은 해, 긴 그림자', dusk: '땅거미 — 푸른 시간, 불이 켜지기 시작함',
        night: '밤 — 등·화면·창문이 비추고 바깥은 어두움', neon: '네온과 간판 빛 아래의 밤, 색색의 반사', lamplight: '실내의 따뜻한 등불이나 촛불, 나머지는 그늘' },
      chair: { tied: '느슨한 번이나 포니테일로 묶음, 몇 가닥이 흘러내림', down: '어깨 위로 풀어 내림', braid: '한쪽 어깨 위로 느슨하게 한 갈래로 땋음',
        hat: '옷에 어울리는 모자·캡·후드, 그 아래로 머리가 보임', wet: '젖어서 뒤로 넘기거나 물이 떨어지는 머리' }
    },
    /* 칸 이름 — 조립부(lib/prompt-element.js)가 이 열쇠로 부른다(한글을 조립부에 두지 않는다) */
    f: { concept: '캐릭터/콘셉트', age: '성별·나이대', faceSize: '얼굴 크기', faceShape: '얼굴형', placement: '이목구비 배치', eyes: '눈 형태', eyeColor: '눈색', pupil: '동공', nose: '코', lips: '입술',
      skin: '피부색', hairColor: '머리색', hair: '헤어스타일', body: '전체 골격·비례', neck: '목·어깨', bust: '가슴', waist: '허리', hips: '골반·엉덩이', thighs: '허벅지', limbs: '팔·종아리', silhouette: '전체 실루엣',
      philosophy: '철학', colors: '주요 색상', materials: '주요 소재', top: '상의', bottom: '하의', shoes: '신발', accessory: '액세서리', gear: '장비·소품', extra: '부가 요소',
      action: '액션', hands: '손동작', expr: '표정', gaze: '시선', motion: '머리카락·의상 움직임', frame: '구도', camera: '카메라', light: '광원', palette: '장면 팔레트', background: '배경', effects: '환경 효과' },
    /* 조립부가 잇는 말 — {p} 는 앞 낱말 받침에 맞춘 을/를 */
    words: {
      eul: '을', reul: '를',
      root: '원소 {ko}({symbol}, 원자 번호 {number}){p} 의인화한 {ko} 나라의 군주',
      lord: '{family}({family_en}){p} 의인화한 {nation} 나라 {family} 가문의 가문주',
      citizen: '{nation} 나라 {family} 가문의 주민 — 물건 {object}({object_en}){p} 의인화한 여성',
      citWear: ', 그 물건을 실물 크기의 의상으로 입는다', citMotif: ', 물건은 옷·장식의 재질·색·형태로만 담고 손에 들지 않는다',
      world: ' — {world} 세계', impression: ' · 첫인상: ', adult: '성인 여성',
      traitsN: '원소 성질 — ', traitsF: '가문 성질 — ', object: '물건 — ', expo: ' · 노출: ', expoChosen: ' · 노출(고른 것): ',
      scene: '이번 장소: ', note: '장면 메모: ', legs: '다리: ', hands: { 'BOTH HANDS': '두 손', 'RIGHT HAND': '오른손', 'LEFT HAND': '왼손' },
      casualRule: '일상컷 규칙: ', sec: ['2.캐릭터 외형', '3. 코디네이션', '4. 장면']
    },
    /* 영어 줄이 가리키던 옛 머리말 → 구조판 칸 이름(정규식 글, 순서대로) */
    refs: [['\\bthe costume WORLD describes\\b', 'the costume in 상의'], ['\\bWORLD\\b', '배경'], ['\\bSCENE \\(chosen\\)', '이 문구'], ["\\bSCENE's\\b", '이 문구의'], ['\\bSCENE\\b', '이 문구'],
      ['\\bPROP\\b', '장비·소품'], ['\\bCROP\\b', '구도'], ['\\bGAZE\\b', '시선'], ['\\bCOMPOSITION\\b', '구도']],
    /* 생성기 외형 칸 → 2절 칸 열쇠(f). 1 은 그 칸의 설계 값을 고른 값으로 바꾸고, 0 은 고른 값을 앞에 붙인다. 없는 것(풀이 줄 포함)은 「직접 고른 외형」 칸 */
    paramField: {
      'apparent age': ['age', 1], 'body type': ['body', 1], 'height impression': ['body', 0], 'shoulder build': ['neck', 1], 'torso / chest build': ['bust', 1],
      'torso length': ['waist', 0], 'waist / hip silhouette': ['hips', 1], 'leg proportion': ['thighs', 0], 'lower-body build': ['thighs', 1], 'body measurements (B/W/H)': ['silhouette', 0],
      'skin tone': ['skin', 1], 'face shape': ['faceShape', 1], 'face length': ['faceShape', 0], 'face width': ['faceShape', 0], 'jaw & chin': ['faceShape', 0],
      'eye shape': ['eyes', 1], 'eye size': ['eyes', 0], 'eye tilt': ['eyes', 0], 'eye spacing': ['placement', 0], 'eyebrows': ['eyes', 0],
      'eye color': ['eyeColor', 1], 'heterochromia': ['eyeColor', 1], 'eye color consistency': ['eyeColor', 0], 'nose character': ['nose', 1], 'lips': ['lips', 1],
      'hair color': ['hairColor', 1], 'hairstyle': ['hair', 1], 'hair length': ['hair', 0], 'bangs': ['hair', 0], 'hair accent': ['hair', 0],
      'hair texture': ['hair', 0], 'hair volume': ['hair', 0], 'parting': ['hair', 0]
    },
    heading: ['체형'],   /* 값 없이 「체형:」 한 줄 — 아래 일곱 칸의 머리 */
    extra: { s2: '직접 고른 외형', s4: '덧붙임' },   /* 생성기에서 고른 외형 · 덧붙임 칸이 있을 때만 맨 끝에 */
    bodyKeys: ['전체 골격·비례', '목·어깨', '가슴', '허리', '골반·엉덩이', '허벅지', '팔·종아리', '전체 실루엣'],
    body: {
      petite: ['작고 아담한 체격, 몸에 맞는 자연스러운 다리 비율', '가는 목, 좁고 부드러운 어깨선', '작고 자연스러운 볼륨', '가는 허리', '작고 부드러운 골반', '가늘고 매끈한 허벅지', '가는 팔과 종아리, 작은 손목과 발목', '작고 균형 잡힌 아담한 실루엣'],
      slender: ['가늘고 늘씬한 체격, 긴 다리', '자연스러운 목 길이, 부드러운 어깨선', '적당한 볼륨', '잘록한 허리', '허리와 자연스럽게 이어지는 골반', '가늘고 매끈한 허벅지', '길고 가는 팔과 종아리, 가는 손목과 발목', '곧고 가는 늘씬한 실루엣'],
      lanky: ['마르고 다리가 긴 체격', '자연스러운 목 길이, 곧은 어깨선', '작은 볼륨', '곧게 떨어지는 허리', '좁은 골반', '길고 가는 허벅지', '길고 가는 팔과 종아리', '길쭉하고 가벼운 실루엣'],
      athletic: ['탄력 있고 균형 잡힌 운동형 체격', '자연스러운 목 길이, 곧은 어깨선', '적당한 볼륨', '단단하고 잘록한 허리', '안정적인 골반', '매끈하고 탄력 있는 허벅지 — 근육이 도드라지지 않음', '매끈한 팔과 종아리, 가는 손목과 발목', '균형 잡힌 실루엣, 부드러운 곡선 위에 은은한 탄력 — 근육을 과장하지 않음(no visible muscle definition)'],
      curvy: ['굴곡진 체격', '자연스러운 목 길이, 부드러운 어깨선', '풍만한 볼륨, 자연스럽게 연결되는 둥근 입체감', '잘록한 허리', '허리와 대비되는 둥글고 넓은 골반', '윗부분에 볼륨 있는 허벅지, 무릎을 향해 완만하게 좁아지는 형태', '부드러운 팔과 종아리, 가는 손목과 발목', '부드럽고 굴곡이 분명한 실루엣'],
      tall_statuesque: ['키가 크고 다리가 긴 당당한 체격', '자연스러운 목 길이, 곧은 어깨선', '균형 잡힌 볼륨', '잘록한 허리', '허리와 대비되는 골반', '길고 매끈한 허벅지', '긴 팔과 종아리, 가는 손목과 발목', '길고 곧은 조각 같은 실루엣'],
      broad_strong: ['어깨가 넓고 힘 있는 체격', '자연스러운 목 길이, 넓고 곧은 어깨', '적당한 볼륨', '단단한 허리', '안정적인 골반', '힘 있는 허벅지 — 근육이 도드라지지 않음', '힘 있되 매끈한 팔과 종아리', '넓은 어깨에서 내려오는 힘 있는 실루엣 — 보디빌더처럼 근육을 과장하지 않음(no visible muscle definition)'],
      hourglass: ['모래시계형 체격', '자연스러운 목 길이, 부드러운 어깨선', '풍만한 볼륨, 자연스럽게 연결되는 둥근 입체감', '확실히 잘록한 허리, 갈비뼈에서 골반으로 이어지는 매끄러운 굴곡', '가슴과 균형을 이루는 넓은 골반', '윗부분에 자연스러운 볼륨, 무릎을 향해 완만하게 좁아지는 형태', '부드러운 팔과 종아리, 가는 손목과 발목', '가슴·허리·골반의 대비가 분명한 모래시계형'],
      voluptuous: ['풍만한 체격', '자연스러운 목 길이, 부드러운 어깨선', '아주 풍만한 볼륨, 자연스럽게 연결되는 둥근 입체감', '잘록한 허리', '넓고 풍성한 골반과 엉덩이', '풍성한 허벅지', '부드럽고 둥근 팔과 종아리', '가슴·골반·허벅지가 풍성한 곡선 실루엣'],
      busty_slender: ['길고 늘씬한 체격, 긴 다리', '자연스러운 목 길이, 부드러운 어깨선', '풍만한 볼륨, 자연스럽게 연결되는 둥근 입체감', '잘록한 허리, 갈비뼈에서 골반으로 이어지는 매끄러운 굴곡', '허리와 대비되는 넓이, 부드러운 볼륨', '윗부분에 자연스러운 볼륨, 무릎을 향해 완만하게 좁아지는 형태', '길고 늘씬한 팔과 종아리, 가는 손목과 발목', '가슴·허리·골반의 대비가 분명하며 곡면이 자연스럽게 이어지는 늘씬한 모래시계형'],
      curvy_athletic: ['탄력 있고 굴곡진 체격, 긴 다리', '자연스러운 목 길이, 곧은 어깨선', '풍만한 볼륨, 자연스럽게 연결되는 둥근 입체감', '잘록한 허리, 갈비뼈에서 골반으로 이어지는 매끄러운 굴곡', '허리와 대비되는 둥근 골반, 부드러운 볼륨', '윗부분에 자연스러운 볼륨, 무릎을 향해 완만하게 좁아지는 형태 — 근육이 도드라지지 않음', '매끈한 팔과 종아리, 가는 손목과 발목', '가슴·허리·골반의 대비가 분명한 모래시계형, 부드러운 곡선 위에 은은한 탄력(soft curves with subtle tone) — 근육이 도드라지지 않게(no visible muscle definition)']
    },
    age: { early_20s: '20대 초반', mid_20s: '20대 중반', late_20s: '20대 후반', early_30s: '30대 초반' },
    tier: { root: '군주', lord: '가문주', citizen: '주민' },
    /* 세계 그림 칸의 기본 글 — 설계 값이 없는 칸 */
    fixed: {
      faceSize: '신체 대비 작은 얼굴',
      placement: '자연스러운 미간, 비교적 짧은 중안면, 균형 잡힌 눈·코·입 배치',
      pupil: '작고 둥근 짙은 동공',
      noDesign: '설계 지정 없음 — 화풍과 장면에 맞게',
      accessory: '원소 기호 "{symbol}"와 원자 번호 "{number}"{number_eul} 새긴 장식 하나',   /* 2026-11-06 「한 번씩만」 뺐다 — 본인 원소 기호 · 번호는 그림 여러 곳에 나와도 된다(헬륨 메카 탱크, 사용자 「이름을 알 수 있어서 더 좋은거 같아」), 그 밖의 글자만 금지(배경 끝 문장) */
      handsEmpty: '없음 — 두 손은 비어 있고 아무것도 들지 않는다',
      handsWear: '없음 — 물건은 실물 크기의 의상으로 입고, 두 손은 비어 있다',
      sameAsTop: '상의 칸의 의상 설명을 따름',
      noneExtra: '없음',
      action: '카메라를 향해 천천히 한 걸음 내딛는 동작',
      hands: '양손을 몸 옆에 두고 손가락을 자연스럽게 느슨하게 굽힘 — 아무것도 들지 않음',
      handsPose: '자세 칸대로 — 아무것도 들지 않음',
      expr: '입술을 다문 차분한 표정',
      gaze: '관객을 향함',
      motion: '머리끝과 옷자락이 가볍게 흩날림',
      frame: '세로 2:3, 머리부터 발끝까지 포함한 전신, 인물을 화면 중앙에 크게 배치',
      camera: '얼굴 높이에서 수평으로 잡은 시점(eye-level camera) — 턱은 들지도 당기지도 않고 얼굴에 올려다보는 원근 없음, 몸과 얼굴을 카메라 쪽으로 살짝 돌린 완만한 3/4 방향',   /* 2026-11-06 낮은 시점 → 수평 3/4. 올려다본 세계 그림을 일상컷이 붙이면 하관이 길고 턱이 무거운 얼굴로 따라갔고, 정면은 일상컷 고개 각도를 굳혔다(갸라도스 시험) — 사용자 「수평 정면 3/4 구도를 기본으로 하자」 */
      light: '밝은 주광, 머리카락 가장자리의 가는 역광(rim light)',
      text: '글자는 "{symbol}"와 "{number}" 말고는 쓰지 않는다. 생물·두 번째 인물 없음',
      effects: '장면에 맞는 옅은 공기 효과, 바닥의 작은 반사'
    },
    /* 세계마다 3 · 4절 기본 글 — 손글 칸이 없는 카드의 옷 · 빛. 옛 영어 세계 옷 문장(WORLDS 의 tail)을 그대로 쓰지 않는다:
       스팀펑크의 「muted palette · riding trousers · hazy gaslight」 가 그림을 실사 · 갈색으로 끌었다(2026-11-04 헬륨 — 광택 소재 · 파스텔 · 보조광 · 빛 입자로 맞췄고, 승마 바지는 사용자가 뺐다).
       옷 칸은 노출과 따로 — 열고 닫는 것은 철학 칸의 노출 글이 정한다 */
    worlds: {
      fantasy: {
        philosophy: '하이 판타지 왕실·전사 의상 — 성질을 판갑·금속 장식·옷 문양의 은은한 마법 빛으로',
        top: '원소 성질을 담은 금속 목가리개와 양쪽 어깨에 대칭으로 얹힌 판갑 견갑, 그 아래 성질의 색을 담은 비단 상의 — 코르셋 없음',
        bottom: '바닥까지 흐르는 긴 타바드나 로브, 허리를 두르는 가는 금속 사슬띠',
        shoes: '발등을 감싸는 금속 샌들 부츠',
        extra: '성질을 담은 작은 보석 하나를 박은 가는 서클릿, 어깨 뒤로 흐르는 망토',
        citTop: '물건의 실루엣·부품·재질이 한눈에 읽히도록 천·단조 금속·장식으로 옮긴 판타지풍 의상과 머리 장식 — 코르셋·현대 소재·기계 없음',
        light: '밝은 낮빛, 차가운 하늘 반사광, 머리카락 가장자리의 가는 역광(rim light), 판갑 문양의 은은한 마법 빛',
        effects: '떠다니는 작은 빛 입자, 매끈한 바닥에 비치는 인물'
      },
      steampunk: {
        philosophy: '공상 모험 이야기 속 빅토리아풍 탐험가·장인의 우아한 현장 복장 — 성질을 광택 황동 장치와 빛나는 유리 부품으로',
        top: '윤기 있는 실크 하이넥 블라우스, 팔꿈치 위로 걷어 올린 소매, 허리에서 단추를 채운 은은한 광택의 새틴 조끼',
        bottom: '짧은 버슬 스커트, 허리의 윤기 나는 가죽 벨트와 광택 황동 고정쇠',
        shoes: '끈으로 묶는 윤기 나는 가죽 부츠',
        extra: '목에 건 광택 황동 고글, 벨트에 매단 성질을 담은 작은 유리관이나 계기 — 갑옷·망토·관 없음',
        citTop: '물건의 실루엣·부품·재질이 한눈에 읽히도록 실크·가죽·광택 황동 장식으로 옮긴 빅토리아풍 의상과 머리 장식 — 갑옷·망토·코르셋 없음',
        light: '밝고 따뜻한 햇빛, 흰 구름에 반사된 부드러운 하늘빛, 머리카락 가장자리의 가는 역광(rim light), 성질을 담은 장치의 빛이 옷 가장자리에 은은하게 번지는 보조광',
        palette: '밝고 화사한 파스텔 톤(high-key pastel) — 갈색·짙은 황동으로 가라앉지 않게',
        hair: '묶거나 모자·고글 속에 넣지 않고 풀어 둔 그대로',
        hairTied: '모자·고글 속에 넣지 않음',   /* 원래 묶는 머리 모양(포니테일 · 땋은 머리 · 반묶음)엔 「풀어 둔 그대로」 가 부딪힌다(2026-11-04 우라늄) */
        tiedHair: ['ponytail', 'low_ponytail', 'twin_tails', 'braids', 'side_braid', 'half_up', 'updo_bun'],
        effects: '장치 주변에 떠다니는 작은 빛 입자, 배관에서 피어오르는 옅고 하얀 증기, 밝은 바닥에 비치는 인물'
      },
      mecha: {
        philosophy: '미래형 메카 슈트 — 판 · 관절 · 바인더 · 발광선이 성질을 싣고, 판은 관절이 보이는 단단한 장갑으로 읽혀야 한다(천이나 드레스가 아니다)',
        bottom: '상의와 이어지는 장갑 — 설계 문장대로',
        shoes: '장갑 부츠 — 설계 문장대로',
        extra: '등 뒤 유닛이 모티브를 실을 수 있다',
        light: '밝은 주광, 차가운 반사광, 머리카락 가장자리의 가는 역광(rim light), 장갑 이음새의 은은한 발광',
        effects: '떠다니는 작은 빛 입자, 반질한 바닥에 비치는 인물과 발광'
      }
    },
    /* 세계마다 소재 기본 글 — 금지어를 한글로 */
    materials: {
      fantasy: '판갑·금 세공·비단·가죽, 은은한 마법 빛 — 코르셋·현대 소재·기계 없음',
      steampunk: '윤기 있는 실크·새틴·가죽·광택 황동 — 갑옷·망토·코르셋 없음',
      mecha: '단단한 장갑판·관절·발광선 — 천이나 드레스로 읽히지 않게'
    },
    /* 일상컷 칸의 기본 글 */
    casual: {
      concept: '첨부한 {world} 세계 그림의 그 여성 — {who}가 보내는 쉬는 날의 한 장면',
      same: '첨부 그림 그대로',
      age: '첨부 그림 그대로 — 성인 여성',
      hair: '첨부 그림 그대로 — 길이와 머리 모양을 바꾸지 않음',
      hairChange: '첨부 그림의 색·길이 그대로 — {hair}',
      philosophy: '그 장소에 맞는 평상복 — 원소는 작은 장신구나 주변 물건으로만, 옷의 색·무늬·재단은 그 옷 고유의 것',
      colors: '그 옷 고유의 색',
      materials: '그 옷 고유의 소재',
      shoes: '의상과 장소에 맞게',
      accessory: '원소의 시각 언어({traits})를 담은 작은 장신구 하나, 팔레트 {palette}',
      handsEmpty: '없음 — 두 손에 든 것은 손동작 칸대로',
      palette: '첨부 그림과 같은 밝기·채도·톤',
      motion: '장면에 맞게 자연스럽게',
      exprNone: '장면에 맞는 옅은 표정',
      exprTail: ' — 눈썹·눈꺼풀·입꼬리로만 옅게, 얼굴 생김새는 첨부 그림 그대로',
      text: '생물·두 번째 인물 없음 — 붐비는 곳이면 흐릿한 배경 인물만',
      /* 2026-11-06 사용자 — 카메라 · 자세가 얼굴을 길게 · 턱을 무겁게 만들지 않게. 일상컷 규칙 줄 끝 · 1절 NEGATIVE 줄 끝에, 일상컷만 */
      faceLock: 'From any camera angle or pose — low or high camera, chin resting on a hand, profile, looking back — keep the reference image’s face shape, jaw length and face length-to-width ratio; perspective and pose must never lengthen her lower face or make her jaw look heavier than in the reference.',
      negative: 'face lengthened by the camera angle, heavy jaw'
    }
  };

  root.AtelierSpec = {
    FACE_DESIGN: FACE_DESIGN,
    WORLDS: WORLDS, TIERS: TIERS, CITIZEN_WEAR: CITIZEN_WEAR, ROOT_HANDS: ROOT_HANDS,
    TRAITS_HEAD: TRAITS_HEAD, FAMILY_HEAD: FAMILY_HEAD, PALETTE_HEAD: PALETTE_HEAD,
    OUTPUT: OUTPUT, POSE_DEFAULT: POSE_DEFAULT, WORLD_POSES: WORLD_POSES, WORLD_TIMES: WORLD_TIMES, SCENE_HEAD: SCENE_HEAD, CITIZEN_MECHA: CITIZEN_MECHA, CITIZEN_EXPOSURE_BOLD: CITIZEN_EXPOSURE_BOLD, EXPR_HEAD: EXPR_HEAD, BODY_LINE: BODY_LINE, RULES: RULES, NOTES: NOTES, FILES: FILES,
    CASUAL: CASUAL, CASUAL_FIXED: CASUAL_FIXED, ASPECT_OPTIONS: ASPECT_OPTIONS, ASPECT_FRAME: ASPECT_FRAME, CROP_EDGE: CROP_EDGE, CLOSE_FRAMES: CLOSE_FRAMES,
    CASUAL_HAND_WORDS: CASUAL_HAND_WORDS, CLOSE_AXIS_GUIDES: CLOSE_AXIS_GUIDES, LENS_GUIDES: LENS_GUIDES,
    LOCAL_AXES: LOCAL_AXES, ADVANCED_OPTIONS: ADVANCED_OPTIONS, ADVANCED_LABELS: ADVANCED_LABELS, ADV_AXIS: ADV_AXIS, ADV_VAL: ADV_VAL, SCENE_AXIS_GUIDES: SCENE_AXIS_GUIDES,
    EXPRESSION_OPTIONS: EXPRESSION_OPTIONS, EXPRESSION_DETAIL: EXPRESSION_DETAIL, STRUCT: STRUCT
  };
})(typeof window !== 'undefined' ? window : globalThis);
