/* 낱말 표 — 화면에 뜨는 말은 전부 여기 한 곳에서 온다.

   game-atelier 의 같은 파일에서 왔다(그쪽은 book → pkm). 화면은 W('kind.unit') 로 부르고, 말은 이 파일에만 적는다(tests/words.cjs 가 막는다).
   설계표의 글(원소 이름·인격·성질)은 자료라서 화면이 그대로 읽는다.

   쓰는 법
     W('nav.dex')                   → '도감'
     W('art.count', {n: 3})         → 자리표시자가 있으면 채워 넣는다
     W('없는.열쇠')                  → 열쇠를 그대로 돌려주고 콘솔에 적는다  */
(function (root) {
  'use strict';

  var WORDS = {
    /* 머리 */
    'app.title': '원소의 공방',
    'app.subtitle': '원소 하나가 나라가 되고, 물질이 가문이 되고, 물건이 주민이 된다.',
    'nav.index': '첫 화면',
    'nav.dex': '도감',
    'nav.prompt': '프롬프트',
    'dex.title': '도감',
    'prompt.title': '프롬프트',
    'prompt.subtitle': '나라 › 카드 › 갈래 › 단계를 한 칸씩 고르면 지시문이 나온다. 세계 그림 셋, 일상컷은 트리 버전2. 그림은 그림 저장소에, 기록은 records 에.',

    /* 설정 */
    'ui.settings': '설정',
    'ui.theme': '공간',
    'ui.background': '배경',
    'ui.background.on': '보이기',
    'ui.background.off': '끄기',
    'ui.background.hide': '배경 끄기',
    'ui.background.show': '배경 보이기',
    'ui.density': '화면 밀도',
    'ui.density.compact': '촘촘히',
    'ui.density.relaxed': '넉넉히',
    'ui.header.fold': '머리 접기',
    'ui.header.fold.short': '접기',
    'ui.header.unfold': '머리 펼치기',

    /* 공간 다섯 — 열쇠는 workspace.css 와 같다 */
    'theme.sunlit': '한낮의 실험실',
    'theme.moonlit': '심야 천문대',
    'theme.hanok': '연금술 공방',
    'theme.forest': '숲속 광산',
    'theme.phosphor': '가속기 제어실',
    'theme.note.sunlit': '창으로 햇살이 드는 실험실. 유리 기구가 빛을 모으고, 주기율표가 벽 한 면을 채운 곳입니다.',
    'theme.note.moonlit': '돔이 열린 천문대의 밤. 별빛 속 수소와 헬륨이 타는 것을 조용히 봅니다.',
    'theme.note.hanok': '누런 종이와 놋그릇의 연금술 공방. 원소가 아직 네 가지뿐이던 시절의 냄새가 납니다.',
    'theme.note.forest': '숲 아래 갱도. 광석에서 쇠와 금과 소금이 나오는 곳입니다.',
    'theme.note.phosphor': '가속기 제어실의 새벽. 초록 화면에 1000분의 1초의 원자가 깜빡입니다.',
    'home.themes': '공간',

    /* 첫 화면 */
    'home.title': '원소가 나라가 된다.',
    'home.intro': '원소 하나가 한 나라다. 그 원소로 된 물질이 가문이고, 그 물질과 닿은 물건이 주민이다. 나라의 근본·가문주·주민이 판타지·스팀펑크·메카 세 세계에서 한 사람으로 선다. 현대는 일상컷이 맡는다.',
    'home.tag': '비상업 팬작업 · 읽히는 글자·숫자는 그리지 않는다',
    'home.table': '주기율표',
    'home.table.note': '칸을 누르면 그 나라의 도감. 설계된 나라만 색이 있다({n}나라).',
    'home.first': '첫 묶음',
    'home.first.note': '설계표(data/element-design.json)에 적힌 {n}나라. 가문과 주민, 그림은 차례로 붙는다.',
    'home.first.loading': '설계표를 읽는 중',
    'home.first.fail': '설계표를 읽지 못했다 — data/element-design.json',
    'home.first.families': '가문 {n}',
    'home.first.citizens': '주민 {n}',
    'home.first.art': '그림 {n}장',
    'home.patch': '패치 기록',
    'home.patch.open': '패치 기록 보기',
    'home.patch.close': '닫기',
    'home.patch.note': '무엇을 왜 고쳤나. 새 것이 위.',
    'home.patch.loading': '읽는 중',
    'home.patch.fail': '패치 기록을 읽지 못했다 — docs/PATCH.md',
    'home.patch.none': '아직 적힌 것이 없다',

    /* 분류·상태 — 설계표 vocab 의 열쇠 */
    'cat.alkali': '알칼리 금속', 'cat.alkaline_earth': '알칼리 토금속', 'cat.transition': '전이 금속', 'cat.post_transition': '전이후 금속',
    'cat.metalloid': '준금속', 'cat.nonmetal': '비금속', 'cat.halogen': '할로젠', 'cat.noble_gas': '비활성 기체',
    'cat.lanthanide': '란타넘족', 'cat.actinide': '악티늄족', 'cat.unknown': '모름',
    'state.solid': '고체', 'state.liquid': '액체', 'state.gas': '기체', 'state.unknown': '모름',
    'fact.number': '번호', 'fact.period': '주기', 'fact.group': '족', 'fact.category': '분류', 'fact.state': '상태', 'fact.synthetic': '합성 원소',

    /* 층·세계 */
    'tier.root': '근본', 'tier.lord': '가문주', 'tier.citizen': '주민',
    'world.fantasy': '판타지', 'world.steampunk': '스팀펑크', 'world.mecha': '메카',
    'world.none': '이 세계엔 없다',
    'art.count': '{n}장',
    'art.missing': '아직 없다',

    /* 도감 */
    'dex.pick': '나라 고르기',
    'dex.nation': '나라',
    'dex.root': '근본 — 원소 그 자체',
    'dex.families': '가문',
    'dex.lord': '가문주',
    'dex.citizens': '주민',
    'dex.shared': '같은 물질을 {n}나라가 나눈다',
    'dex.shared.other': '{nation}의 {family}',
    'dex.elements': '이룬 원소',
    'dex.casual': '일상컷',
    'dex.style.alt': '다른 화풍 · {name}',
    'dex.progress': '{done}/{all}장',
    'dex.open': '크게 보기',
    'dex.close': '닫기',
    'dex.prev': '앞',
    'dex.next': '뒤',
    'dex.prompt': '이 카드의 지시문',
    'dex.loading': '읽는 중',
    'dex.fail': '자료를 읽지 못했다',
    'dex.none': '아직 설계된 나라가 없다',
    'dex.only.art': '그림 있는 것만',

    /* 생성기 */
    'prompt.nation': '나라',
    'prompt.card': '카드',
    'prompt.card.root': '근본',
    'prompt.card.lord': '{family} 가문주',
    'prompt.card.citizen': '{family} › {citizen}',
    'prompt.world': '세계',
    'prompt.style': '화풍',
    'prompt.notes': '덧붙임',
    'prompt.notes.help': '비워도 된다 — 설계표가 지시문을 짓는다. 쓰면 그 글이 더해진다.',
    'prompt.out': '지시문',
    'prompt.words': '{n}낱말',
    'prompt.copy': '복사',
    'prompt.copied': '복사했다',
    'prompt.copy.fail': '자동 복사가 안 된다 — 글을 골라 두었다',
    'prompt.file': '올릴 파일 이름',
    'prompt.record': '기록 내보내기',
    'prompt.record.note': '그림 저장소 records/{card}/{world}-ui.json 에 둔다. 원본 PNG 의 sha256 은 올릴 때 더한다.',
    'prompt.art': '등록된 그림',
    'prompt.art.none': '이 자리엔 아직 그림이 없다',
    'prompt.reset': '처음으로',
    'prompt.traits': '성질',
    'prompt.persona': '인격',
    'prompt.object': '물건',
    'prompt.loading': '설계표를 읽는 중',
    'prompt.fail': '설계표를 읽지 못했다',

    /* 생성기 판(허브 통합 생성기 꼴) — 경로·단계·단추 */
    'studio.lede': '나라 › 카드 › 갈래를 고르면 단계가 한 칸씩 열린다. 고른 단계는 위 칩으로 접히고, 누르면 그 단계로 돌아간다. 일상컷은 트리 버전2 — 앞 칸이 뒤 칸을 거른다.',
    'studio.help': '설명 보기',
    'studio.chips': '고른 단계',
    'studio.bar': '단계 단추',
    'studio.head.nation': '나라', 'studio.head.card': '카드', 'studio.head.out': '갈래',
    'studio.out.world': '세계 그림', 'studio.out.casual': '일상컷',
    'studio.out.world.note': '판타지 · 스팀펑크 · 메카 한 장. 설계표가 짓고 덧붙임만 더한다.',
    'studio.out.casual.note': '지금의 평상시 한 장. 일상컷 트리 버전2로 시대 → 장소 → 의상 → 몸 자세 → 구도 → 손 → 다리 → 시선을 고른다.',
    'studio.panel.nation': '나라', 'studio.panel.nation.note': '어느 원소의 사람인가.',
    'studio.panel.card': '카드', 'studio.panel.card.note': '근본(원소 그 자체) · 가문주(물질) · 주민(물건) 가운데 하나.',
    'studio.panel.out': '갈래',
    'studio.card.root': '근본 — 원소 그 자체', 'studio.card.lord': '{family} 가문주', 'studio.card.citizen': '{citizen}',
    'studio.step.world': '세계', 'studio.step.notes': '덧붙임',
    'studio.step.era': '시대', 'studio.step.place': '장소', 'studio.step.weather': '계절·날씨', 'studio.step.ofam': '의상 계열', 'studio.step.item': '옷',
    'studio.step.preset': '자세 추천', 'studio.step.posture': '몸 자세', 'studio.step.support': '받침', 'studio.step.frame': '프레이밍', 'studio.step.body': '몸 방향',
    'studio.step.head': '머리 방향', 'studio.step.camera': '카메라 높이', 'studio.step.right': '오른손', 'studio.step.left': '왼손', 'studio.step.use': '소품 동작',
    'studio.step.legs': '다리', 'studio.step.gaze': '시선', 'studio.step.expr': '표정',
    'studio.note.world': '그 세계의 한 장. 얼굴·생김새·자세는 세계마다 따로 뽑는다.',
    'studio.note.era': '지금 현실 · 쓰임의 현장 · 나라 안 · 무대·환상.',
    'studio.note.place': '시대에 있는 곳만. 장소의 받침(의자·벽·물…)이 뒤의 몸 자세를 거른다.',
    'studio.note.weather': '고르지 않으면 싣지 않는다.',
    'studio.note.ofam': '★ 는 필수 갈래(한 묶음에 한 장 이상). 장소와 어색하면 ⚠ 가 붙는다.',
    'studio.note.item': '자동이면 계열 안에서 장면에 맞게. 「옷 직접 쓰기」(덧붙임)가 이긴다.',
    'studio.note.preset': '자세 · 받침 · 구도 · 손 · 다리를 한 번에 채운다. 그 뒤 칸마다 바꿀 수 있다. 지금 장소에서 그대로 되는 추천만 보인다.',
    'studio.note.posture': '장소의 받침이 받는 자세만.',
    'studio.note.support': '무엇이 몸을 받치나.',
    'studio.note.frame': '프레이밍이 보이는 부위를 정한다 — 그 안에서만 손·다리를 고른다. 렌즈는 자동.',
    'studio.note.body': '가까운 컷엔 뒤쪽 몸 방향이 없다.',
    'studio.note.head': '몸 옆모습에선 고개를 옆으로 못 돌린다(카메라 쪽으로 몸까지 돈다).',
    'studio.note.camera': '',
    'studio.note.right': '인물 본인 기준. 비우면 이 손은 지시문에 싣지 않는다. 「소품 동작」을 고르면 다음에 어떤 소품을 어떻게 쓰나 고른다.',
    'studio.note.left': '인물 본인 기준. 두 손 자세는 다른 손도 같은 값이 된다.',
    'studio.note.use': '소품을 쓰는 손이 있을 때만. 이 장소·시대에 나오는 소품, 이 컷에 보이는 자리, 이 자세로 되는 동작만.',
    'studio.note.legs': '다리가 보이는 컷에서만. 비워도 된다.',
    'studio.note.gaze': '비우면 소품 동작이 정하거나 기본값.',
    'studio.note.expr': '시선은 시선 칸이 정한다 — 표정은 눈썹·눈·입만.',
    'studio.note.expr.hidden': '몸이 「뒤」 이고 고개를 돌리지 않아 얼굴이 안 보인다 — 표정은 고르지 않는다.',
    'studio.note.notes': '비워도 된다 — 설계표와 트리가 지시문을 짓는다. 쓰면 그 글이 더해진다(옷 직접 쓰기는 트리 옷을 대신한다).',
    'studio.note.done': '칩을 누르면 그 단계로 돌아간다. {where}',
    'studio.note.done.pc': '아래 지시문을 복사해 쓴다.', 'studio.note.done.m': '위 지시문을 아래 「복사」로 쓴다.',
    'studio.note.fixed': '고정값 — 전체 강도 가장 강함 · 피부 노출 많이 · 2:3.',
    'studio.all': '전체', 'studio.auto': '자동', 'studio.auto.hand': '자동 — 이 손은 싣지 않는다', 'studio.auto.weather': '자동 — 싣지 않는다', 'studio.auto.item': '자동 — 계열 안에서 장면에 맞게',
    'studio.auto.gaze': '자동 — 소품 동작이 정하면 그것', 'studio.preset.none': '고르지 않음 — 칸마다 직접', 'studio.legs.none': '고르지 않음', 'studio.hand.prop': '소품 동작',
    'studio.notes.scene': '장소·상황', 'studio.notes.outfit': '옷 직접 쓰기', 'studio.notes.custom': '추가 연출 요청',
    'studio.notes.n': '{n}칸', 'studio.none': '없음',
    'studio.unlock': '해방 — 트리 밖 선택지도 보기({n})', 'studio.unlock.short': '🔓 해방',
    'studio.unlock.note': '🔓 흐린 것은 이 길에서 빠진 값 — 고르면 기록에 남고 트리가 그 칸을 고치지 않는다.',
    'studio.unlocked': '🔓 트리 밖에서 고른 칸: {fields}',
    'studio.awkward': '⚠ 어색한 조합: {what}',
    'studio.required.star': ' ★',
    'studio.rand.one': '이 칸 랜덤', 'studio.rand.from': '여기부터 다 랜덤', 'studio.rand.all': '처음부터 다 랜덤',
    'studio.rand.one.m': '🎲 이 칸 랜덤', 'studio.rand.from.m': '🎲 여기부터 다 랜덤', 'studio.rand.all.m': '🎲 랜덤', 'studio.rand.menu': '🎲 랜덤 ▾', 'studio.more.menu': '↺ 더 ▾',
    'studio.next': '다음', 'studio.next.m': '다음 ›', 'studio.skip': '건너뛰기', 'studio.skip.m': '건너뛰기 ›', 'studio.done': '다 골랐다', 'studio.todone': '다 골랐다로', 'studio.prev': '이전 단계',
    'studio.restart': '↺ 여기부터 다시', 'studio.restart.title': '뒤 단계를 다 비우고 이 단계부터 다시', 'studio.reset': '↺ 처음부터 다시', 'studio.reset.m': '↺ 처음', 'studio.reset.title': '모든 칸을 비우고 첫 단계부터 다시',
    'studio.status.restart': '여기부터 다시 — 뒤 {n}칸을 비웠다. 이 단계부터 고른다.', 'studio.status.restart.none': '여기부터 다시 — 뒤에 비울 칸이 없다.', 'studio.status.reset': '처음부터 다시 — {n}칸을 비웠다. 첫 단계부터 고른다.',
    'studio.prompt': '지시문', 'studio.words': '{n}낱말', 'studio.copy': '복사', 'studio.copy.m': '📋 복사', 'studio.copied': '복사했다', 'studio.copy.fail': '자동 복사가 안 된다 — 글을 골라 두었다',
    'studio.record': '기록 JSON', 'studio.record.m': '기록', 'studio.sheet': '지시문 {n}', 'studio.close': '닫기', 'studio.more': '펼치기 ▾', 'studio.less': '접기 ▴',
    'studio.file': '올릴 파일 이름', 'studio.art': '이 자리에 등록된 그림', 'studio.casual.n': '일상컷 번호',
    'studio.loading': '설계표와 트리를 읽는 중…', 'studio.fail': '읽지 못했다 — {what}',
    'studio.invalid': '맞지 않는 칸이 남았다: {fields}',
    /* 트리가 왜 거르나 — lib/casual-tree-v2.js why 의 code */
    'studio.why.unknown': '없는 값', 'studio.why.era': '이 시대엔 없는 곳', 'studio.why.year': '그 해엔 없던 곳', 'studio.why.place': '장소에 받침이 없다({needs})',
    'studio.why.posture': '이 자세에선 안 된다', 'studio.why.banned': '이 공방은 안 쓴다', 'studio.why.close': '가까운 컷에서만(또는 가까운 컷엔 안 보인다)', 'studio.why.far': '가까운 컷엔 뒤쪽 몸 방향이 없다',
    'studio.why.zone': '이 프레이밍엔 그 손 자리가 안 보인다', 'studio.why.outfit': '옷에 {feature}이(가) 없다', 'studio.why.both': '다른 손과 함께 하는 자세·동작', 'studio.why.same': '두 손이 같은 데를 쓴다',
    'studio.why.chin': '두 손이 다 턱을 괸다', 'studio.why.noprop': '맞는 소품 동작이 없다', 'studio.why.nohand': '소품을 쓰는 손이 없다', 'studio.why.fit': '이 장면엔 안 맞는 소품 동작',
    'studio.why.legs': '다리가 안 보이는 컷', 'studio.why.feet': '발 동작은 전신·환경 컷만', 'studio.why.family': '이 자세 계열의 다리가 아니다', 'studio.why.use': '소품 동작이 시선을 정한다',
    'studio.why.support': '받침이 그 손을 막는다', 'studio.why.back': '등이 카메라 쪽인데 고개를 안 돌렸다', 'studio.why.body': '이 몸 방향과 같이 못 고른다', 'studio.why.required': '필수 갈래 의상엔 안 쓰는 프레이밍',
    'studio.why.companion': '동료 묶음에서만', 'studio.why.path': '이 길에 없다', 'studio.why.preset': '지금 장소·컷에선 그대로 안 된다',
    'studio.feature.pocket': '주머니', 'studio.feature.strap': '어깨끈', 'studio.feature.collar': '옷깃', 'studio.feature.glasses': '안경',
    /* 프레이밍 이름 — 트리 표의 열쇠 */
    'frame.face_close': '얼굴 클로즈업', 'frame.detail': '디테일', 'frame.chest_up': '가슴 위', 'frame.waist_up': '허리 위', 'frame.three_quarter': '3/4', 'frame.full_body': '전신', 'frame.environmental': '환경',
    'studio.lens': '렌즈 자동 — {lens}',

    /* 새 판 살피기 */
    'fresh.notice': '새 판이 나왔습니다. 하던 것을 마치고 눌러 주세요.',
    'fresh.reload': '갈아타기',
    'fresh.close': '닫기',
    'fresh.stamp': '판'
  };

  var missing = [];
  function W(key, vars) {
    var s = WORDS[key];
    if (s == null) { if (missing.indexOf(key) < 0) { missing.push(key); if (root.console) root.console.warn('words: ' + key); } return key; }
    if (vars) s = s.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : '{' + k + '}'; });
    return s;
  }
  var api = { W: W, table: WORDS, load: function (more) { for (var k in more) WORDS[k] = more[k]; }, missing: function () { return missing.slice(); } };
  root.AtelierWords = api;
  root.W = W;
})(typeof window !== 'undefined' ? window : globalThis);
