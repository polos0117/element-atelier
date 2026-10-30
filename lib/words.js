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
    'prompt.subtitle': '나라 › 가문 › 주민을 고르고 세계를 고르면 지시문이 나온다. 그림은 그림 저장소에, 기록은 records 에.',

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
