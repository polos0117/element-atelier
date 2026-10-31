# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 규칙은 `AGENTS.md` 의 "6. 고쳤으면 적는다" 에 있다.

모양은 두 줄이 전부다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를
가운뎃점으로 나눈다. 그 아래 `-` 줄에 `파일 — 왜/무엇` 을 파일마다 하나씩 적는다.
날짜는 `2026-10-30` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.
이 안내글은 첫 `##` 앞이라 읽히지 않는다. `node tests/patch.cjs` 가 모양을 본다.

## 2026-10-31 · claude · 철나라 일상컷 세계마다 두 장 — 마흔아홉 더해 일흔여덟
- data/img.json — 일상컷 마흔아홉 등록(사용자 「일상컷은 캐릭터마다 판타지 2장, 스펑 2장, 메카 2장」). 세계마다 먼 컷 하나 · 가까운 컷 하나, 같은 세계 안 두 장은 시대를 다르게. 녹 스팀펑크 하나는 필터에 두 번 막혀 재봉실 평상복으로 다시 뽑았다. 철나라 일상컷 일흔여덟 — 근본·가문주는 여섯, 주민은 사는 세계마다 둘
- IMAGE_RULES.md — 한 카드 일상컷은 세계마다 두 장

## 2026-10-31 · claude · 나침반 일상컷 1 채움 — 나라 안 방의 홈웨어
- data/img.json — fe-magnet-compass_mecha_game_keyart_f_casual1.webp 등록(사용자 「나침반 채워줘」). 하이레그 수영복(먼 컷)이 필터에 두 번 막혀 필수 갈래를 나라 안 방의 홈웨어로 바꿨다(메카 그림 참고). 철나라 일상컷 스물아홉 — 말굽자석 2 만 비었다

## 2026-10-31 · claude · 작업 안내에 「사용자에게는 언제나 한국어 반말」
- CLAUDE.md — 답이 중간에 영어로 바뀌었다(사용자 「계속 영어로 바뀌네, 한글로 고정해줘」). 모델이 바뀌어도 한국어 반말로

## 2026-10-31 · claude · 철나라 일상컷 스물여덟 장 — 카드마다 두 장(참고 그림을 붙여)
- data/img.json — <카드>_<세계>_game_keyart_f_casualN.webp 스물여덟 등록(사용자 「철나라 일상컷 뽑아줘」 · 「카드마다 2장」). 카드마다 필수 갈래 · 먼 컷 하나(나라 안 방·목욕탕·지붕·여관의 홈웨어·목욕·수영복·란제리, 또는 수영복·역할극) + 다른 시대 · 가까운 컷 하나, 참고 세계도 갈랐다. 그 세계 그림을 붙여 이미지 편집으로 — 같은 사람이 나온다. 나침반 수영복(먼 컷) · 말굽자석 란제리(가까운 컷) 두 장은 안전 필터에 두 번 막혀 비었다(같은 지시문 한 번만 다시 — 규칙)
- IMAGE_RULES.md — 일상컷 뽑기(참고 그림을 붙여 편집 · 기록에 endpoint·ref_sha256 · 한 묶음 두 장부터)

## 2026-10-31 · claude · 철나라 주민 스물네 장(2.5D) — 새로 22 · 시안 교체 2
- data/img.json — fe-<가문>-<주민>_<세계>_game_keyart_f.webp 스물둘 등록(사용자 「응 해줘」). 머리색은 물건 재질, 머리·얼굴형·눈은 가문주와 다르게, 옷은 물건이 먼저. 메모가 없는 세계는 장면 변주로 배경을 갈랐다. 녹슨 갑옷 판타지 · 못 메카 2.5D 시안은 같은 이름으로 교체(그림 저장소 records/replacement.json). 철나라 근본·가문주·주민 세계 그림이 기본 화풍으로 다 찼다
- tests/screen.cjs — 「빈 자리는 생성기로」 가 나라 차례로 빈 자리를 찾고, 일상컷 「참고 그림」 줄은 등록부를 보고 판정(철나라가 차서 옛 기대가 깨졌다)

## 2026-10-31 · claude · 주민이 가문주 복사본이 되지 않게 — 물건 재질 머리색 · 외형 돌리기 · 물건이 먼저인 옷
- data/element-design.json · tools/element-design.py — 주민 서른셋에 look.silhouette.hair_color(물건의 재질 색 — 검 거울 강철, 나침반 놋쇠 금빛, 수혈팩 짙은 피빛 …). 철 주민 스물네 장을 뽑아 보니 가문주와 외형 줄이 글자까지 같고 물건이 안 보였다(사용자 「머리색도 좀 바꾸는 건 어떨까」 「그렇게 해줘」)
- tools/port-look-spec.cjs · lib/look-spec.js — 원소 몫 머리색 21 더함(물건 재질 색)
- lib/prompt-element.js — lookOf 가 주민이면 헤어스타일·얼굴형·눈 모양을 주민 열쇠로 돌려 그 세계 가문주와 다르게(세계끼리도 다르게), 머리색은 설계표. 주민 세계 그림은 세계 옷 뼈대 대신 citizenTail(물건이 먼저 — 그 모양이 옷·머리 장식에서 한눈에), 주민 과감 노출(옷 뼈대 말 없이), 메카는 「물건이 설계를 이끈다」
- lib/prompt-spec.js — citizenTail(판타지·스팀펑크) · CITIZEN_MECHA · CITIZEN_EXPOSURE_BOLD. tests — 주민 75 (주민, 세계) 가 가문주와 머리·얼굴형·눈이 다 다르고 세계끼리도 다르다 · 옷 줄 · 검사기. IMAGE_RULES.md · AGENTS.md. 시험 세 장(나침반 스팀펑크 · 못 판타지 · 레일 메카)으로 봤다 — 첫 스물네 장은 안 올렸다

## 2026-10-31 · claude · 기본 화풍을 게임 키아트 2.5D 로 · 기록 이름에 화풍을 늘 붙인다
- data/style.json · IMAGE_RULES.md · AGENTS.md — 기본을 game_keyart 로(사용자 「2.5d 가 낫다, CGI 는 얼굴이 각지고 못생기게 나오는 컷이 있다」). game_cgi 철나라 열여덟 장은 그 열쇠로 남아 도감 「다른 화풍」 줄에
- lib/studio.js — 생성기는 늘 기본 화풍(화풍 고르개가 없는데 저장된 옛 화풍을 따르고 있었다 — 기본을 바꿔도 이 기기에선 CGI 로 지었을 것)
- lib/prompt-element.js · IMAGE_RULES.md — 기록 이름은 <세계>.<화풍>-ui.json 으로 늘 화풍을 붙인다. 그림 저장소의 옛 <세계>-ui.json 열여덟을 <세계>.game_cgi-ui.json 으로 옮겼다(git mv)
- tests/screen.cjs — 파일 이름이 기본 화풍을 따른다

## 2026-10-31 · claude · 철나라 게임 키아트 2.5D 판 열다섯 — 가문주 12 새로 · 근본 3 교체
- data/img.json — fe-<가문>_<세계>_game_keyart_f.webp 열둘 등록(사용자 「게임 키아트 2.5d로도 다 다시 뽑아줘」). CGI 판과 같은 장면·외형·옷으로 화풍 줄만 game_keyart. 근본 2.5D 셋(fe_<세계>_game_keyart_f.webp)은 외형 설계 전 시안이라 같은 이름으로 교체 — 그림 저장소 records/replacement.json. 도감은 기본 화풍(CGI) 줄 아래 「다른 화풍 · 게임 키아트 2.5D」 줄로 보인다

## 2026-10-31 · claude · 세계마다 헤어스타일·얼굴형·눈 · 철 판타지·스팀펑크 열 장 다시 뽑아 교체
- data/element-design.json · tools/element-design.py — 나라 일곱에 look.worlds(세계마다 헤어스타일·얼굴형·눈 모양, 세 세계가 서로 다른 사람이어야 검사 통과). 색·체형은 공통. 강철·자석 가문의 머리·얼굴도 세계마다로 옮겼다. 철나라·강철·자석의 메카 값은 먼저 올린 메카 그림 그대로(지시문이 글자까지 같다)(사용자 「기본 세팅값에 헤어스타일이랑 얼굴 모양은 다르게」)
- lib/prompt-element.js · lib/studio.js — lookOf(카드, 세계): 나라 → 나라 세계 → 가문 → 가문 세계 차례. FACE·SILHOUETTE 줄 · 설계 줄 목록 · 기록 design 이 그 세계 값
- data/img.json 은 그대로(같은 이름) — 그림 저장소에서 근본 판타지·스팀펑크 2 · 가문주 판타지·스팀펑크 8 을 교체했다(records/replacement.json). 안전 필터에 걸린 한 장은 같은 지시문으로 한 번 다시 돌려 통과
- tests/prompt-element.cjs · tests/look-spec.cjs — 나라마다 세 세계가 다른 사람·색·체형 공통·가문 세계 값·지시문·기록. IMAGE_RULES.md · AGENTS.md

## 2026-10-30 · claude · 판타지·스팀펑크 옷 뼈대 가르기 — 세계 꼬리·과감 노출·기본 빛
- lib/prompt-spec.js · lib/prompt-element.js — 철 가문주 판타지·스팀펑크가 같은 코르셋 + 트임 치마로 나왔다(사용자 「판타지와 스팀펑크 의상이 비슷해 보이지 않아?」). 공용 과감 노출의 「corset-like waist · slits」 와 스팀펑크 꼬리의 「fitted bodice」 가 둘을 끌어당겼다. 판타지 COSTUME(견갑·고르젯·사슬·타바드·서클릿·망토, 코르셋·버슬 금지) · 스팀펑크 COSTUME(하이넥 블라우스·조끼·연미 코트·장갑·앞치마·고글·짧은 버슬 + 승마 바지, 갑옷판·망토·왕관 금지 — 입는 물건 주민은 예외), 세계마다 exposureBold, 기본 LIGHT(판타지 햇빛·마법 빛 · 스팀펑크 가스등·흐린 하늘, 시간대가 이긴다). 메카는 그대로. 강철 가문주 시험 두 장으로 갈리는 것을 봤다
- tests/prompt-element.cjs — 세계마다 옷·과감·빛. tests/screen.cjs — 「빈 자리는 생성기로」 가 등록부에서 빈 자리를 찾는다(가문주가 차서 옛 자리가 없어졌다). docs/ELEMENT_CONCEPT.md

## 2026-10-30 · claude · 철나라 가문주 열두 장(CGI) · 강철·자석 가문 외형 가르기
- data/element-design.json — 강철 가문 look 에 짧게 친 머리·타원 얼굴·아몬드 눈·곧은 눈썹, 자석 가문 look 에 양갈래·곡선형 몸·하트 얼굴·큰 둥근 눈·하트 입술. 첫 뽑기에서 둘이 같은 은회색 땋은 머리라 자매처럼 닮았다(사용자 「2번」 — 강철·자석만 다시)
- data/img.json — fe-<가문>_<세계>_game_cgi_f.webp 열두 장 등록(강철·녹·자석·피 × 판타지·스팀펑크·메카). 장면은 가문마다 변주로 갈랐다(강철 대장간·리벳 공장·수리 도크, 녹 세계 글·철교·세계 글, 자석 자철석 광산·세계 글·자기 레일, 피 쇠 성문·용광로·궤도 주조소). 안전 필터에 걸린 두 장은 같은 지시문으로 한 번 다시 돌려 통과

## 2026-10-30 · claude · 세계 그림 장면 줄 머리말을 「SETTING (this card): 」 로
- lib/prompt-spec.js · prompt.html — 「SETTING: this card is set a magnetite mine…」 처럼 장면 글이 명사로 시작하면 문장이 어긋났다(철 가문주 지시문을 뽑다 봤다). 머리말은 콜론까지만. tests/prompt-element.cjs · tests/screen.cjs 의 문자열도

## 2026-10-30 · claude · 세계 그림에 장면·시간대·자세·표정 · 일상컷에 손에 드는 물건·시간대·머리 변화 · 나라 안은 참고 세계로
- data/element-design.json · tools/element-design.py — 나라마다 세계마다 장소 변주 scenes 셋(63) · 일상컷에서 손에 드는 그 원소의 물건 hold.en(나라 7 · 가문 15, 주민은 object.en). 검사기가 본다(사용자 「응」 + 「일상컷에서 손에 드는 소품까지」)
- data/casual-tree-v2.json · tests/casual-tree-v2.cjs — 소품 signature(그 원소의 물건, 모든 장소)와 동작 셋(들기 · 얼굴 옆 · 두 손). 카드가 signature_hold 를 주면 든다
- lib/prompt-spec.js · lib/prompt-element.js — 세계 그림: SETTING(장면) · TIME & WEATHER(일곱) · OUTPUT 의 자세 자리(WORLD_POSES 일곱, 비우면 카드 자세) · EXPRESSION, opts.shot(normShot 이 바로잡고 기록에 남는다). 일상컷: PROP 에 그 물건(hold), 시대 「나라 안」 이 참고 그림의 세계 글(전엔 늘 판타지), Time of day(일곱) · Hair(다섯 — 색·길이는 지키고 매무새만), CHARACTER 가 머리 변화·물건 들기를 허락
- lib/studio.js · lib/words.js — 세계 그림 단계 세계 → 장면(+시간대 고르개) → 자세·표정(+표정 고르개) → 설계 줄 → 외형 → 덧붙임, 카드×세계마다 저장(shots). 일상컷 단계에 시간대(날씨 뒤)·머리 변화(옷 뒤). 랜덤·여기부터 다시가 같이 다룬다
- tests/prompt-element.cjs · tests/screen.cjs(125가지) — 장면·시간대·자세·표정 줄과 차례 · 다른 세계 열쇠 비움 · 손에 드는 물건(근본·가문주·주민, 트리 허락) · 나라 안 세계 · 시간대·머리 · 화면 흐름
- IMAGE_RULES.md · AGENTS.md · docs/ELEMENT_CONCEPT.md · docs/CASUAL_TREE_PORT.md — 규칙

## 2026-10-30 · claude · 외형 칸의 「설계표」 표를 라벨 옆에 · 일상컷 덧붙임에 전체 강도·피부 노출 고르개
- lib/studio.js · lib/studio.css · lib/words.js — 외형 칸에서 설계 줄이 채우는 항목의 표(「설계표」)가 폰에서 빈 칸처럼 보였다(사용자 「설계 라고 나오는 건 뭐야」) → 라벨과 한 덩이로. 일상컷 덧붙임 칸에 두 축(전체 강도 · 피부 노출) 고르개 — 기본은 고정값(가장 강함 · 많이), 바꾸면 지시문·칩에 따라온다(사용자 「일상컷에 세부 강도 설정이 빠졌네」). 화면비는 2:3 그대로
- tests/screen.cjs — 93가지

## 2026-10-30 · claude · 세계 그림에 외형 — 설계표 look(팔레트 → 머리·눈 색) · 설계 줄 · 외형 선택지(game 과 같은 표)
- data/element-design.json · tools/element-design.py — 나라 일곱에 look(얼굴 여섯 + 실루엣 셋 — 팔레트 색이 머리·눈 색: 철 iron_grey·ember, 수소 silver_white·sky_blue, 산소 ocean_blue·forest_green, 탄소 soot_black·leaf_green, 나트륨 lemon_yellow·sodium_yellow, 금 golden_blonde·gold, 오가네손 violet_white·violet), 가문 열다섯은 제 팔레트로 머리색·눈 색만 덮어쓴다, 주민은 가문 것. 검사기가 칸·꼴을 본다(사용자 「게임 공방처럼 원소·물질의 특성을 살려 외형 특징을 잡자, 팔레트 색을 머리·눈 색으로」)
- lib/look-spec.js · tools/port-look-spec.cjs · tests/look-spec.cjs — game 의 외형 선택지(34) · 얼굴 다섯 묶음 · 실루엣 어휘 · 나이 줄 · 노출 문장을 글자 그대로 옮겨 AtelierSpec 에 붙인다(「게임 설계표」→「나라 설계표」, FORM costume → the costume WORLD describes). 원소 몫 머리색 10 · 눈 색 4 만 더했다. 검사가 game 표와 대조하고 설계표 look 값이 어휘에 다 있는지 본다
- lib/prompt-element.js — build 가 AGE · SILHOUETTE · FACE(설계표 look, 직접 고른 묶음은 빠진다) · EXPOSURE(세계로 겉옷 꼴) · IDENTITY(직접 고른 외형 목록, game 의 paramValues 그대로)를 싣는다. opts.look = {params, faceDesignOn, silhouetteOn, exposure}, normLook 이 저장값을 바로잡고 기록에 look·design 이 남는다
- lib/studio.js · lib/studio.css · lib/words.js · prompt.html — 세계 그림 갈래가 세계 → 설계 줄(실루엣·얼굴 싣기 + 설계표 값 목록 + 왜 + 노출) → 외형(네 묶음 접는 칸, 무작위·초기화, 설계가 쥔 칸 표시, 직접 입력) → 덧붙임. 외형은 카드×세계마다 저장(element_studio_v1 looks). 폰 막대도
- tests/prompt-element.cjs · tests/screen.cjs(85가지) · tests/words.cjs — 외형 줄·차례·이김·끄기·노출·기록, 생성기 두 칸, 표 파일 셋
- AGENTS.md · IMAGE_RULES.md · docs/ELEMENT_CONCEPT.md · docs/PORT_NOTES.md — 외형 규칙

## 2026-10-30 · claude · 화풍은 CGI 하나로 · 일상컷은 세계 그림을 참고 그림으로(세계를 탄다)
- data/style.json · IMAGE_RULES.md · AGENTS.md · docs/ELEMENT_CONCEPT.md — 화풍은 game_cgi 하나로 통일(사용자 「cgi로 통일하자」). game_keyart·cinematic_keyart 는 이미 뽑은 그림들의 열쇠로만. 일상컷은 그 세계 그림을 참고 그림으로 붙인 그 사람의 지금 평상시(사용자 「일상컷은 참고 이미지가 있어야 돼서 그 화풍을 따라가야 돼」) — 세계를 타고 화풍은 그 그림의 것
- lib/prompt-spec.js · lib/prompt-element.js — 일상컷 INPUT·CHARACTER·WARDROBE·ANGLE 을 game 의 「첨부 그림의 그 여자」 꼴로(얼굴·머리·몸만 가져오고 옷·갑옷·배경은 버린다), buildCasual(…, {world}) — 카드가 안 사는 세계면 ''. 파일 이름 <카드>_<세계>_<화풍>_f_casualN.webp, 기록에 world·ref(참고 그림 파일)
- lib/studio.js · lib/studio.css · prompt.html · lib/words.js — 일상컷 갈래의 첫 칸이 세계(참고 그림). 결과에 참고 그림 줄(등록돼 있으면 작은 그림, 없으면 「아직 없다 — 세계 그림을 먼저」), 주소 ?world= 는 일상컷에도. 랜덤·처음부터 다시가 세계도 다룬다
- tools/register-images.py · lib/img.js · dex.html · index.html — 세계 붙은 일상컷은 그 세계 몫(byForm.<세계>.casual)에, 세계 없는 옛 시안 셋은 화풍 몫에 그대로. IMG.casualsOf([{file, world}])로 도감 일상컷 줄에 세계 이름, 첫 화면 그림 수도 센다. 특별컷은 세계를 안 탄다
- tests/prompt-element.cjs · tests/screen.cjs(69가지) · tests/register-images.py — 첨부 줄 · 세 세계 · 안 사는 세계 거름 · 파일 이름·기록 · 생성기 세계 칸·참고 그림 줄·주소 · 등록기 세계 몫 일상컷·옛 시안·--prune

## 2026-10-30 · claude · 오가네손 근본도 세 화풍 나란히 — CGI 세 장 · 시네마틱 키아트 세 장 등록
- data/img.json — og_<세계>_game_cgi_f.webp · og_<세계>_cinematic_keyart_f.webp 여섯 장 등록(사용자 「철 말고 오가네손도 똑같이, 다른 화풍 3개씩」). 2.5D 시안 세 장과 함께 도감 근본 칸에 세 줄로 보인다. 그림 저장소 기록은 records/og/<세계>-ui.json(기본 CGI) · <세계>.cinematic_keyart-ui.json

## 2026-10-30 · claude · 도감 — 기본 화풍 밖에 등록된 세계 그림도 「다른 화풍」 줄로 보인다
- dex.html — 카드마다 기본 화풍 줄 아래에, 다른 화풍으로 등록된 세계 그림을 화풍 이름 붙여 한 줄씩(점선 테두리). 기본을 game_cgi 로 바꾼 뒤 2.5D 시안 열두 장이 도감에서 안 보이던 것(사용자 「처음 2.5D 뽑은 이미지는 어디 갔지」). 기본 화풍 그림이 없는 카드는 첫 화풍이 본 줄
- lib/element.css · lib/words.js — .alt-row · .style-note · dex.style.alt. tests/screen.cjs — 다른 화풍 줄 수·이름·그림 검사

## 2026-10-30 · claude · 화풍 시네마틱 키아트(cinematic_keyart) 추가 — 철 근본 판타지·스팀펑크 비교 두 장
- data/style.json — cinematic_keyart v1 을 선택 화풍으로(신화 공방 mecha_cinematic_keyart 문장, 열쇠만 짧게). 사용자가 철 근본 판타지·스팀펑크는 CGI 와 살짝 안 어울린다 해서 비교용. 기본은 아직 game_cgi
- data/img.json — 철 근본 세 장(fe_<세계>_cinematic_keyart_f.webp) 등록. 메카는 화풍 비교 때 뽑은 장을 그대로 썼다. 그림 저장소 기록은 <세계>.cinematic_keyart-ui.json

## 2026-10-30 · claude · 기본 화풍을 게임 시네마틱 CGI(game_cgi)로 — 철 근본 세 장
- data/style.json — game_cgi v1 을 기본으로(철 메카 한 장을 2.5D·시네마틱 키아트·CGI 로 나란히 보고 사용자가 「재질이 테마에 어울린다」). 문장은 신화 공방 game_cgi 에서 weapon → prop, 일상컷은 옷감·장신구·자연광. game_keyart 는 선택지로(시안 열두 장의 열쇠)
- data/img.json — 철 근본 세 장(fe_<세계>_game_cgi_f.webp) 등록. 그림 저장소 기록은 기본 화풍 밖이면 <세계>.<화풍>-ui.json
- IMAGE_RULES.md — 화풍·기록 이름 규칙. tests/screen.cjs · tests/prompt-element.cjs — 기본 화풍 열쇠를 style.json 에서 읽는다

## 2026-10-30 · claude · 생성기를 공방 모음 통합 생성기 꼴로 · 일상컷 트리 버전2 · 공간 다섯 리뉴얼
- prompt.html · lib/studio.js · lib/studio.css — 생성기 판을 공방 모음 통합 생성기(prompt/hub.js) 꼴로 다시 썼다(사용자 「UI 는 허브 통합 생성기」): 나라 › 카드 › 갈래(세계 그림 · 일상컷) › 단계 한 칸씩, 칩·해방(트리 밖 + 까닭)·랜덤·여기부터 다시·처음부터, 폰 레일·아래 막대·시트. 일상컷은 버전2 칸(시대 → 장소 → 계절·날씨 → 의상 → 옷 → 자세 추천 → 몸 자세 → 받침 → 프레이밍 → 몸·머리 방향 → 카메라 → 오른손·왼손 → 소품 동작 → 다리 → 시선 → 표정 → 덧붙임). 고른 것은 element_studio_v1
- lib/casual-tree.js · lib/casual-tree-v2.js — game·pkm 과 같은 공용 모듈(글자 하나 다르지 않게). data/casual-tree.json · data/casual-tree-v2.json — 원소 몫 트리 표(시대 now·site·nation·fantasy, 원소의 현장 site_* 열 곳, 나라 안 nation_* 일곱 곳, 원소 소품 여섯). tools/casual-tree*.py · tests/casual-tree* — 검사. 무엇을 바꿨나는 docs/CASUAL_TREE_PORT.md
- lib/workspace.css · lib/workspace-theme.js · lib/room.css — 공간 다섯(실험실·천문대·연금술 공방·광산·제어실)의 색을 새로 짜고, 배경 그림 다섯(그림 저장소 backgrounds/room-*.webp, 도트 공방 호출기로 받음)을 맨 아래 겹에 깐다
- dex.html — 일상컷 줄을 카드마다(근본만이 아니라 가문주·주민도) 세계 셋 아래에
- lib/words.js — 생성기 판 낱말(studio.*)·프레이밍 이름·트리가 거른 까닭. tests/screen.cjs — 생성기 검사를 새 판에 맞게(세계 그림·일상컷 한 칸씩·자세 추천·해방·랜덤·다시·폰 레일/막대/시트) — 61가지
- AGENTS.md · IMAGE_RULES.md · docs/ELEMENT_CONCEPT.md · docs/PORT_NOTES.md — 일상컷 버전2·생성기 판·공간 리뉴얼

## 2026-10-30 · claude · 일상컷 지시문(트리 버전2) 조립
- lib/prompt-spec.js — 일상컷 표(CASUAL 줄 묶음 · 고정값 · 화면비 · CROP · 두 축 · 렌즈 · 표정)를 game-atelier 에서 옮겼다. 첨부 그림이 없으니 INPUT 은 글만, CHARACTER 는 「누구의 의인화」, 「그 게임」 자리는 「그 원소」(장신구·주변 사물로만, 옷·갑옷으로는 안 옮긴다). 함수는 없다.
- lib/prompt-element.js — buildCasual(D, S, 카드, 장면, {style, tree, tree2}) · casualFile · casualRecord · casualDetailsV2 · exprNoGaze. 차례는 game 의 buildCasualV2 와 같고 시대 줄은 표의 시대 열쇠(now · site · nation · fantasy)로 고른다.
- tests/prompt-element.cjs — 카드 다섯 × 시대 넷 · 랜덤 · 해방 · 돌아보기 · 클로즈업 · 두 손 소품 · 고정값 · 기록. 표·모듈이 없으면 game 것을 빌려 돈다.

## 2026-10-30 · claude · 원소의 공방 — 뼈대
- data/element-design.json — 설계표. 나라(원소) › 가문(물질) › 주민(물건) 세 층, 세계 셋(판타지·스팀펑크·메카). 사실 칸 118원소는 tools/seed-elements.py 가 채웠고, 설계 칸은 철·수소·산소·탄소·나트륨·금·오가네손 일곱 나라(가문 15, 주민 33).
- data/style.json — 화풍 판 game_keyart v1(시안 열두 장을 뽑은 문장 그대로). data/img.json — 빈 등록부.
- lib/prompt-spec.js · lib/prompt-element.js — 지시문 표와 조립(CONCEPT → TRAITS → WORLD → STYLE → OUTPUT·BODY·규칙). 층마다 CONCEPT 한 문장, 입는 물건은 WEARS 줄, 메카는 설계 문장. 파일 이름·기록도 여기서.
- index.html · dex.html · prompt.html · lib/element.css · lib/words.js — 첫 화면(주기율표·첫 묶음·패치 기록·공간), 도감(근본·가문주·주민 세 세계, 같은 물질 다른 나라 잇기, 크게 보기), 생성기(나라 › 카드 › 세계 › 덧붙임 → 지시문·파일 이름·기록).
- lib/workspace*.{css,js} · lib/room.css · lib/fresh.js · lib/patch.js · lib/favorites.js · lib/img.js — game-atelier 에서. 열쇠(element_room_v1 …)·문양·공간 이름만 바꿨다.
- tools/roster.py · tools/element-design.py · tools/seed-elements.py · tests/* — 자료 읽기, 설계표 검사, 씨앗, 검사(지시문·설계표·낱말·패치·화면·그림 등록).
- AGENTS.md · IMAGE_RULES.md · README.md · CLAUDE.md · docs/ELEMENT_CONCEPT.md · docs/PORT_NOTES.md — 규칙과 기획.
