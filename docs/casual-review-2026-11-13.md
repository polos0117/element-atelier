# 일상컷 지시문 체계 검토 — 삼국지 · pkm · 원소 (2026-11-13 · claude)

1 ~ 7절은 검토와 제안(그때는 코드를 안 고쳤다). 같은 날 뒤이어 6절 1 ~ 17 을 고쳤고 그 내용은 8절에 있다.

## 0. 먼저 결론

| 물은 것 | 답 |
|---|---|
| 팔이 셋이 될 만한 지시가 있나 | 있다. 검수 기록에서 추가 팔로 적힌 컷 다섯이 모두 같은 꼴이다 — **한 팔은 머리 · 가슴으로 올리고, 다른 팔은 바닥 · 난간에 두거나 내리는데, 몸이 눕거나 돌아서 있어 「어느 어깨에서 나온 팔인지」 글만으로 정해지지 않는 조합**. 자세 추천 `lie_side_full` · `walk_lookback` 과 난간 + 머리 넘기기. 세 공방 공통(모듈 · 표가 같다) |
| 실내 비는 어디서 나오나 | 날씨 칸이 아니다(계획기는 날씨 칸을 한 번도 안 쓴다 — 세 공방 기록 5,058장 모두 비어 있다). **상황 노출 「젖은 옷」 글이 「갑작스러운 소나기」 로 시작하는데 장소 조건이 없다.** 실제 기록에서 젖은 옷 125장 중 44장이 실내(갱도 · 제어실 · 박물관 · 찜질방 · 침실) |
| 까닭 없는 까치발은 | 자세 추천 **`tiptoe_wave`(까치발로 손 흔들기)** 하나에서 거의 다 나온다(원소 28/28 · 삼국지 35/35 · pkm 19/43). 장소 조건이 없어 여관 · 갱도 · 노래방 · 편의점에서도 까치발이다. 버전1 에는 「까치발은 하는 일에 뻗기 · 선반 · 높은 곳이 있을 때만」 규칙이 있었는데 버전2 로 오며 사라졌다 |
| 갈래를 다양하게 써도 비슷한 까닭 | 몸 쪽 칸(자세 · 구도 · 손 · 다리 · 시선)이 **자세 추천 47개 묶음**에서만 나오고(원소 · 삼국지 100%), 그 47개가 「카메라를 보고 자세를 잡는」 컷에 몰려 있다 — 눈높이 카메라 72%, 카메라 응시 59%, 정면 · 3/4 정면 66%, 선 자세 계열 62%, 빈손 55%. 빛(시간대 · 날씨) 0%. 그리고 **「하는 일」 칸이 없다** — 장소는 배경 명사일 뿐 인물이 거기서 뭘 하지 않는다 |
| GPT 자유 설계의 공통 씬 | **「작업대 · 장비 앞에서 작은 물건을 손보거나 재 보는 중」** 이 압도적이다(원소 43% 재기 · 27% 고치기, pkm 64% · 41%). 자세는 걸터앉기(스툴 · 벤치에 옆으로) · 한쪽 무릎 꿇기 · 몸 숙이기, 손은 「한 손은 도구, 한 손은 받침」. 우리 트리에 없는 것 — 하는 일, 한쪽 무릎 꿇기, 스툴에 옆으로 앉기, 한 발 디딤, 수리대 · 장비실 · 건조대 같은 자리 |

읽은 것 · 못 읽은 것은 맨 끝 7절.

---

## 1. 공통 구조 — 세 공방이 같은 것

- 트리 모듈 `lib/casual-tree.js` 는 세 공방이 글자 하나 다르지 않다(md5 `714316c0…`). `lib/casual-tree-v2.js` 는 원소 · 삼국지가 같고(`8435b25b…`) pkm 만 다른 판(`b4e013be…`)이다. 표(`data/casual-tree.json` · `data/casual-tree-v2.json`)의 몸 쪽 갈래(자세 16 · 받침 8 · 프레이밍 7 · 몸 방향 5 · 머리 4 · 카메라 3 · 시선 9 · 손 30 · 다리 19 · 날씨 7)는 세 공방이 같은 글이고, 장소 · 의상 · 소품 · 자세 추천만 공방 몫이 붙었다.
- 지시문 조립도 같은 뼈대다(game 의 `casualDetailsV2` 를 옮긴 것): 원소 `lib/prompt-element.js:711-769`, 삼국지 `lib/prompt-sam.js:545-` , pkm `lib/prompt-anthro.js:220-`. 손 줄은 셋 다 `RIGHT HAND:` · `LEFT HAND:` · `PROP:` 세 줄이고 틀 글도 같다 — 「her own {side} hand is in PROP」 · 「with her own {side} hand she {action}; it is all she holds」 · 「with both hands she {action} — her own right hand {right}, her own left hand {left}」(원소 `lib/prompt-spec.js:389-391`, 삼국지 `lib/prompt-spec.js:446-448`, pkm `lib/prompt-spec.js:669-671`).
- 그래서 아래 2 · 3절은 따로 적지 않은 한 **세 공방 공통**이다. 줄 번호는 원소 저장소 기준이고, 다른 공방 줄은 괄호에 적었다.

### 장소 · 의상 제한을 푼 자리

| 푼 것 | 어디 | 지금 어떻게 |
|---|---|---|
| 장소가 받는 의상 | `lib/casual-tree-v2.js:3` 「하는 일과 장소의 받는 의상은 쓰지 않는다(의상은 시대만 거르고, 어색한 조합은 ⚠ 표시)」 · `why()` 의 `ofam` 갈래(166-170줄)는 시대만 본다 | 버전1 표의 장소마다 있는 `outfits` 목록(예: 침실 = 홈웨어 · 란제리 · 평상복 · 이브닝 · 동탄룩)은 버전2 가 읽지 않는다 |
| 어색한 조합 | `awkward()`(116줄) — 거르지 않고 표시만. 표 `awkward` 11줄(원소) · 12(삼국지) · 13(pkm) | 계획기가 묶음마다 한 장까지 허락한다(원소 `tools/casual-plan.cjs:195`, 삼국지 `:199`, pkm 은 `lib/casual-plan.js:764-781` 에서 피하는 쪽을 먼저 고른다) |
| 하는 일 | 버전2 순서(`ORDER`, 13줄)에 `act` 칸이 없다. 버전1 의 하는 일 155(원소) · 160(삼국지) · 232(pkm)는 예전 기록 변환에만 쓰인다 | 자세의 까닭(뻗기 → 까치발, 줍기 → 숙이기)을 정해 주던 칸이 없다 |
| 날씨 · 시선의 장소 조건 | `why()` 의 `weather`(165줄)는 열쇠가 있는지만, `gaze`(224-233줄)는 소품 · 몸 방향만 본다 | 장소 표에 실내 · 실외 · 창 칸이 없다(장소 칸은 `key · group · ko · en · eras · outfits` 뿐, 받침 `has` 는 의자 · 벽 · 난간 · 물 등 11가지) |
| 해방(🔓) | `unlocked()` · `repair()`(292-315줄) | 트리 밖 값을 그대로 둔다. 실제 기록에선 드물다(삼국지 6장) |
| 자유 설계 칸 | 원소 `lib/prompt-spec.js:247-260` `FREE_DESIGN`(삼국지 `:227`, pkm `:328`) | 장소 · 활동 · 자세 · 구도 · 의상 전부 GPT/Claude 몫. 상황도 「우리 넷이 아닌 것 먼저」 로 열려 있다(257줄 `situFree`) |

---

## 2. (가) 팔이 셋이 될 만한 지시

### 2-1. 검수 기록에 실제로 남은 추가 팔 — 다섯 컷, 한 가지 꼴

| 기록 | 자세 추천 | 손 줄(지시문 그대로) | 검수에 적힌 것 |
|---|---|---|---|
| 원소 `records/f/mecha-casual3` | `walk_lookback` | `COMPOSITION: … body turned three-quarters away from the camera; head turned back over her own left shoulder — the shoulder on the image's left side` / `RIGHT HAND: her own right hand is in PROP — on the image's right side, since her back is to the camera.` / `LEFT HAND: her own left arm hangs relaxed at her side — on the image's left side, since her back is to the camera.` / `PROP: with her own right hand she holds a small banded violet-and-green fluorite crystal glowing faintly in her palm at chest height; it is all she holds.` | 「three arms are visible, with two lowered arms on the image-left side and one raised crystal-holding arm」 — 원인 칸: 「Look-back torso turn combined with a held prop and lowered-hand instructions produced a duplicated arm」 |
| 원소 `records/o-rust/mecha-casual3` | `lie_side_full` | `POSTURE: lying on her side.` / `SUPPORT: she lies on her side, supported along her hip and shoulder.` / `RIGHT HAND: her own right arm bends behind her head, the hand cradling the back of her head, her elbow raised beside her head.` / `LEFT HAND: her own left hand is planted on the ground beside her.` | 「화면 왼쪽 올린 팔 아래로 내려오던 추가 팔과 바닥의 추가 손 제거」 |
| 원소 `records/au-coin/mecha-casual3` | `lie_side_full` | 위와 같은 줄 | 「머리 뒤의 오른팔 외에 화면 왼쪽 아래로 내려와 바닥을 짚는 팔이 같은 쪽에서 발생해 추가 팔처럼 읽힘」 · 「머리 뒤 손과 바닥 손을 동시에 요구한 자세에서 팔의 출발점이 혼동됨」 |
| 원소 `records/c-graphite/fantasy-casual4` | `rail_lookback`(지금은 표에서 뺀 추천) | `POSTURE: standing at a waist-high railing or sill, leaning lightly on it.` / `body turned three-quarters away … head turned back over her shoulder` / `RIGHT HAND: her own right hand rests on the railing.` / `LEFT HAND: her own left hand tucks hair behind her ear.` | 「머리카락 아래 난간으로 내려오던 세 번째 팔이 제거」 |
| 원소 `records/h-water-rain/mecha-casual3` | 추천 없음(난간 기대 서기 · 3/4 정면) | 난간 손 + 머리 넘기기(같은 두 줄) | 「원본의 몸통 앞쪽을 따라 내려오는 추가 팔이 제거됨」 |

같은 꼴이 `docs/PATCH.md` 에도 있다 — 원소 2026-10-31 별 가문주 메카 일상 「돌아선 몸에서 머리로 올린 팔이 가슴 앞에서 나왔다」(910줄), 삼국지 2026-11-02 원소(袁紹) 메카 일상5 「머리 위 수건 동작을 … 팔을 내려 몸 앞에 수건을 받치는 구도로 교체」(`sam-atelier/docs/PATCH.md:1196`), 삼국지 등애 메카 일상2(까치발로 손 흔들기 — 「가까운 팔은 몸 앞에서 손을 흔들고 반대팔은 아래로」 부분 편집, `:1049`), pkm 이상해씨 일상2 낚싯대 팔(`pkm-atelier/docs/PATCH.md:419`) · 앗차프 일상2 「옷 중간에서 나오던 오른손」(`:986`).

**왜 이 꼴에서 나는가.** 글이 팔 두 개의 「끝」(손이 어디 있나)만 말하고 「시작」(어느 어깨에서, 몸의 어느 쪽으로 지나가나)을 말하지 않는데, 몸이 눕거나 돌아서 있으면 시작이 화면에서 뻔하지 않다.

1. `lie_side`(「lying on her side」, `data/casual-tree-v2.json:554`)는 **어느 쪽으로 눕는지 안 정한다.** 그런데 손 줄은 오른팔 = 머리 뒤, 왼손 = 바닥으로 박혀 있다. 모델이 왼쪽으로 눕히면 왼팔은 몸에 깔려 「바닥을 짚을」 수 없다 — 그래서 머리 받친 팔 쪽에서 팔을 하나 더 내린다. 받침 글 「supported along her hip and shoulder」(303줄)도 깔린 쪽 팔의 자리를 말하지 않는다.
2. `walk_lookback` · `walk_away`(뒤 3/4 · 뒤)는 소품을 **「at chest height」** 로 든다(소품 동작 `…_hold` 의 글). 등이 카메라 쪽이면 가슴 높이는 화면에서 안 보이는 자리다. 모델은 소품을 보이게 하려고 팔을 옆 · 위로 빼고, 「가슴 높이」 를 지키려고 또 하나를 그린다. 여기에 `backLook()` 이 붙이는 「on the image's right side, since her back is to the camera」(`lib/casual-tree-v2.js:411`)가 **뒤 3/4**(등이 반만 돌아선 몸)에도 그대로 붙는다 — 반쯤 돈 몸에선 오른팔이 화면 가운데로 온다.
3. 난간 기대 서기는 자세 글이 이미 팔을 쓴다 — 「leaning lightly on it」(난간에 가볍게 기댄다 = 팔뚝이나 손이 난간 위). 그 위에 한 손은 난간, 한 손은 머리. 모델은 「기댄 팔」 을 따로 그린다.

2026-11-01 에 「뒷모습 돌아보기 + 얼굴 · 머리에 대는 손」 은 막았다(`whyHand` 의 `lookback`, 251-253줄). 하지만 그 규칙은 `zone: face` 손만 본다 — **가슴 높이 소품**(`walk_lookback`)과 **옆으로 눕기**, **정면 3/4 난간 + 머리 넘기기**는 지금도 통과한다(아래 표).

### 2-2. 지금 표에서 조립될 수 있는 위험 조합

모듈에 넣어 `repair()` 가 칸을 하나도 안 고치는지(= 생성기 · 계획기가 그대로 내보낸다)로 확인했다. 숫자는 통과하는 장소 수(원소 132 / 삼국지 141 / pkm 161 곳 가운데).

| # | 조합 | 조립되는 줄(표 글 그대로) | 통과 | 실제 기록 |
|---|---|---|---|---|
| A | 옆으로 눕기 + 머리 뒤 손 + 바닥 짚기 (`lie_side_full`, `data/casual-tree-v2.json:5611`) | 2-1 의 o-rust 줄 | 85 / 103 / 127 | 원소 31 · 삼국지 33 · pkm 20장. 추가 팔 2 · 좌우 뒤바뀜 여럿 |
| B | 걷기 + 뒤 3/4 + 어깨 너머 + 오른손 소품(가슴 높이) + 왼팔 내림 (`walk_lookback`, `:5452`) | 2-1 의 f 줄 | 63 / 71 / 154 | 원소 40 · 삼국지 60 · **pkm 64(가장 많이 쓴 추천)**. 추가 팔 1 · 좌우 뒤바뀜 |
| C | 걷기 + 뒤(등) + 오른손 소품 가슴 높이 + 왼팔 내림 (`walk_away`, `:5668`) | `body: back to the camera` / `PROP: with her own right hand she holds a cup at chest height; it is all she holds.` | 63 / 71 / pkm 은 막음(`banned.body: back`) | **원소 63 · 삼국지 81 — 두 공방에서 가장 많이 쓴 추천.** 등 뒤에서 안 보이는 가슴 높이 소품 |
| D | 난간 기대 서기 + 난간 손 + 머리 넘기기(정면 3/4) | `POSTURE: standing at a waist-high railing or sill, leaning lightly on it.` / `RIGHT HAND: her own right hand rests on the railing.` / `LEFT HAND: her own left hand tucks hair behind her ear.` | 68 / 82 / 118 | 추가 팔 1(h-water-rain) |
| E | 엎드리기 + 셀카 + 브이 | `SUPPORT: she lies on her front, propped on her forearms.` / `RIGHT HAND: her own right hand is in PROP.` / `LEFT HAND: her own left hand makes a V sign beside her face.` / `PROP: with her own right hand she holds a smartphone up at arm's length to take a selfie; it is all she holds.` | 29 / 29 / 30 | 받침 글은 **두 팔뚝**이 몸을 받친다는데 한 팔은 뻗고 한 손은 얼굴 옆 — 팔뚝 둘 + 손 둘 |
| F | 엎드리기 + 두 손으로 책 | `SUPPORT: … propped on her forearms.` / `PROP: with both hands she reads a book held open in both hands — her own right hand holds the right page, her own left hand holds the left page.` | 17 / 21 / 30 | 받침의 `hands` 목록(312줄)에 `prop` 이 통째로 들어 있어 두 손 동작 · 팔 뻗는 동작이 다 통과한다 |
| G | 앉아 앞으로 기울이기 + 머리 뒤 손 + 손 흔들기 | `POSTURE: seated, leaning slightly forward toward the table, forearms near its edge.` / `RIGHT HAND: her own right arm bends behind her head …` / `LEFT HAND: her own left hand is raised beside her face, waving.` | 37 / 45 / 64 | 자세 글(655줄)이 팔뚝 자리를 정했는데 손 칸에 제한(`hands`)이 없다 |
| H | 헤엄 + 머리 뒤 손 + 브이 | `POSTURE: swimming breaststroke, head and shoulders above the water.` / `RIGHT HAND: … bends behind her head …` / `LEFT HAND: … makes a V sign beside her face.` | 7 / 7 / pkm 0 | 평영은 두 팔로 젓는 동작이다. 추천 `swim_close` 는 두 손 「화면 밖」 이라 괜찮고, 손으로 고르거나 랜덤일 때만 |
| I | 벽에 기대 서기 + 벽 짚기 | `SUPPORT: her back rests against the wall.` / `RIGHT HAND: her own right palm presses flat against the wall at shoulder height.` | 110 / 128 / 188 | 등이 벽인데 손바닥을 어깨 높이로 벽에 — 팔이 뒤로 꺾인다 |
| J | 두 손 소품 + 뒤 3/4 돌아보기 (예: 수건으로 머리 말리기) | `PROP: with both hands she dries her hair with a towel — her own right hand presses the towel to the top of her head, her own left hand holds the towel at the side of her hair.` + 뒤 3/4 · 어깨 너머 | 27 / 29 / 44 | `lookback` 규칙은 손 칸의 얼굴 손만 막고 **얼굴 높이 소품 동작(`zone: face`)은 안 막는다** — 삼국지 원소 메카 일상5 가 이 꼴 |

### 2-3. 손이 하나 더 있어야 말이 되는 「한 손」 소품 동작

`PROP:` 줄은 「it is all she holds」 로 끝나는데 동작 글 속에 둘째 물건이 숨어 있으면, 그 물건을 쥘 손을 모델이 지어낸다. 다른 손 칸에 딴 일을 시켰으면 손이 셋이다.

| 공방 | 동작 | 글 | 숨은 둘째 손 |
|---|---|---|---|
| 원소 | `salt_pinch`(`:4577`) | 「lifts a pinch of salt from a small jar of coarse salt between two fingers」 | 항아리를 든 손 |
| pkm | `noodle_eat`(`:5968`) | 「lifts noodles from {prop} with chopsticks」 | 그릇 든 손(탁자 조건이 없으면) |
| pkm | `berry_pick` · `berry_choose` · `job_berry_sort` | 「picks {prop} from a low branch」 · 「sorts {prop} into a padded crate」 | 가지 · 상자 쪽 손 |
| pkm | `job_feed_pouch` · `job_dig_brush` · `job_stage_marker` | 「packs {prop} into a travel bag on the counter」 · 「brushes sediment from a fossil with {prop}」 | 가방 · 화석을 잡는 손 |
| 셋 다 | `umbrella_hold`(원소 `:2850`) | 「holds an umbrella open over her shoulder」 | 팔은 하나지만 장소에 역 대합실 · 공항이 들어 있다(3절) |

두 손 소품 동작(`both`)은 좌우 `grip` 을 다 적어 둬서 이 문제는 없다.

### 2-4. 좌우가 뒤바뀌는 컷 — 팔 셋의 앞 단계

검수 기록에 「계획과 좌우 반대」 로 적힌 것이 원소 24장 · 삼국지 13장 · pkm 1장이다. 자세 추천으로 세면 **몸이 옆모습인 추천**에 몰린다 — `side_chair_cross`(5) · `floor_horizon`(4) · `chair_cross_prop`(3) · `window_chin`(4) · `counter_cup`(2) · `walk_lookback`(2) · `lie_side_full`(2).

옆모습에서는 「본인의 오른손」 이 카메라 쪽 팔인지 반대쪽 팔인지가 **몸이 화면 왼쪽을 보느냐 오른쪽을 보느냐**에 달렸는데, 표의 몸 방향 `side` 는 「body in side profile」 뿐이라 그걸 안 정한다. 모델은 아무 쪽이나 고르고, 그 뒤 「오른손은 소품 · 왼손은 무릎」 을 맞추려다 손을 바꾸거나(기록의 대부분) 하나 더 그린다. BODY 줄의 「Right and left mean her own right and left, not the viewer's」 는 정면에서만 도움이 된다.

### 2-5. GPT 자유 설계 쪽

- GPT 가 쓴 Pose 줄은 **오른손 · 왼손을 둘 다 지정**하는 일이 많다(원소 21% · pkm 37%), 두 손 작업은 더 많다(원소 44% · pkm 58%). 예: 「right hand holding the brush near the floor, left hand stabilizing the platform」(`f/fantasy-casual7`), 「her right hand holds a peg at the paper spindle while her left hand steadies the round housing」(삼국지 가후).
- 그런데 자유 설계 컷의 추가 팔 기록은 0장이다. 한 물건을 두 손이 같이 다루는 꼴(한 손 도구 + 한 손 받침)이라 두 팔이 한곳으로 모이기 때문으로 보인다 — 우리 트리의 「한 손은 위, 한 손은 아래」 와 반대다.
- 자유 설계에서 나온 이상은 `f/mecha-casual7` 하나(「An underwater duplicate-looking foot contour … near the planted leg」 — 물에 잠긴 발 + 디딤 자세). Pose 줄은 「One foot already on the ledge, the other on the pool step, both arms holding the light pad at chest height」. **물속 다리 + 발 위치를 따로 지정**한 것이 원인으로 적혀 있다. 우리 표에도 같은 꼴이 있다 — `feet_in_water`(「feet dipped in the water below the edge」)와 `soak` · `shallow_water` 장소의 전신 컷.

---

## 3. (나) 모순되는 상황

### 3-1. 실내에서 비

- 날씨 칸(`weather`)은 원인이 아니다. 표의 글은 실내를 감안해 적혀 있고(「rain falls outside and streaks any window; surfaces are wet where she is outdoors」, `:6079`) 무엇보다 **계획기가 날씨 칸을 안 채운다** — 원소 1,325장 · 삼국지 1,842장 · pkm 1,891장 모두 비어 있다.
- 원인은 **상황 노출 `wet`**: 「a sudden rain shower or a splash of water has just soaked her clothes — the damp fabric clings …」(원소 `lib/prompt-spec.js:330`, 삼국지 `:401`, pkm `:365` — 같은 글). 맞는 옷인지만 보고(`fit: '.'` — 수영복 · 수건 빼고 전부) 장소는 안 본다. 계획기의 `situate()`(원소 `tools/casual-plan.cjs:269-275`)도 옷만 본다.
- 실제 기록(장소 글로 실내를 추정):

| 공방 | 젖은 옷 컷 | 그중 실내 | 예 |
|---|---|---|---|
| 원소 | 27 | 10 | 갱도(`fe/mecha-casual4`) · 발전소 제어실(`n/fantasy-casual5`) · 화보 스튜디오(`hg/fantasy-casual4`) · 유리벽 사무실 · 쇼핑몰 · 공항 라운지 |
| 삼국지 | 68 | 22 | 서예 교실(마초) · 박물관 전시실(방통) · 침실(문앙) · 호텔 스위트(가후) · 만찬장(맹획) · 얼음 궁 홀(손권) |
| pkm | 30 | 12 | 찜질방(gastly) · 오페라 로비(nidoqueen) · 박물관 홀(arcanine) · 보드게임 라운지(dodrio) · 실내 암벽 · 체육관 |

- 자유 설계 칸의 「상황 열기」 글(`situFree`)도 우리 넷을 「피할 것」 으로 늘어놓으며 rain 을 적는다. GPT 는 대체로 피했다(「no rain, wet-clinging clothing, wind …」 라고 되받아 적는다). 이쪽은 문제 없음.
- 덧붙여 `wind`(「a strong gust of wind catches her clothes」)도 장소 조건이 없다 — 실내 바람.

### 3-2. 까닭 없는 까치발 · 뻗기

- 다리 `tiptoe`(「rising onto her toes」, `:1041`)는 자세 계열 `stand` 면 다 된다 — 까닭(높은 선반 · 창 너머 보기)을 요구하는 칸이 없다. 벽에 기대 서기 · 작업대 숙이기와도 통과한다.
- 실제로는 추천 **`tiptoe_wave`**(`:5567` — 서기 · 전신 · 옆모습 · 아래에서 올려다봄 · 오른손 흔들기 · 왼팔 내림 · 까치발 · 카메라 응시)에서 나온다. 계획기가 「덜 쓴 추천 먼저」 로 고르니 카드마다 한 번쯤 돈다. 기록: 여관 · 성 계단 · 양궁장 · 노래방 · 시장 · 갱도 · 천문대 · 정유소 · 편의점 · 수중 궁.
- pkm 은 추천 없이도 24장 — pkm 계획기는 추천 말고 칸마다 랜덤 후보 여덟(`lib/casual-plan.js:865`, `C2.random(… { preset: false })`)을 같이 넣는데, `random()` 이 다리를 80% 확률로 고른다(`lib/casual-tree-v2.js:380-384`). 선 자세의 다리 후보 다섯 중 하나가 까치발이다.
- **버전1 에는 까닭 규칙이 있었다**: `pkm-atelier/lib/casual-plan.js:208-209` `OWN_ACTION = { on_tiptoe: /\b(reach(es|ing)?|shelf|shelves|high|overhead|lanterns?|ceiling|top)\b/, … waving: /wave|greet|hello|goodbye/ … }` — 「자기 동작을 따로 시키는 자세 — 하는 일에 그 동작이 있을 때만」. 하는 일 칸이 사라지면서 같이 사라졌다.
- 같은 종류: 손 `reach`(「reaches gently toward the camera」) · `wave` · `thumbs_up` · `v_sign` · `shush` 도 까닭 없이 붙는다. 이쪽은 모순이라기보다 5절의 「카메라용 몸짓」 문제.

### 3-3. 시선이 장소와 안 맞음

`why()` 의 `gaze`(224-233줄)는 장소를 안 본다.

| 시선 | 글 | 실제 기록 |
|---|---|---|
| `window`(`:241`) | 「she looks out of the window」 | 원소 40장 중 34 · 삼국지 67 중 57 · pkm 93 중 84장이 **장소 글에 창이 없는 곳** — 조폐소 금고 · 정유소 마당 · 축제 거리 · 런웨이 · 공원 길 · 포토 부스. 추천 `chin_close` · `window_chin` 이 시선을 창밖으로 박아 둔다 |
| `up`(`:256`) | 「she looks up at the sky」 | pkm 79장 중 34장이 실내 — 노래방 · 포토 부스 · 녹음 부스 · 예배당. (원소 · 삼국지는 추천에 `up` 이 없어 0장) |
| `horizon` | 「she looks toward the far distance」 | 원소 132 · 삼국지 179장. 갱도 · 금고에서도 「먼 곳」. 글이 느슨해 큰 탈은 없다 |

### 3-4. 자세 글과 다리 글이 서로 부딪힘

| 조합 | 글 | 통과 |
|---|---|---|
| 작업대 숙이기 + 짝다리 | 자세 「… hips back and **weight on both feet**」(`:632`) ↔ 다리 「**weight on one leg**, the other knee softly bent」 | 88 / 104 / 161 |
| 작업대 숙이기 + 까치발 · 벽에 한 발 | 같은 자세 글 ↔ 「rising onto her toes」 · 「one foot lifted flat against the wall behind her」 | 88 / 104 / 161 |
| 벽에 기대 서기 + 까치발 | 「leaning back against a wall」 ↔ 「rising onto her toes」 | 110 / 128 / 188 |
| 걷기 + 한 발 앞으로 | 「walking」 + 「one foot a step ahead of the other」 — 겹말, 탈 없음 | — |

`lean_counter` 가 계열 `stand` 라 선 자세의 다리를 다 받는다. 자세 추천으로는 안 나오고(추천 `counter_work` 는 다리 비움) 손으로 고르거나 pkm 랜덤 후보에서 나온다.

### 3-5. 소품 · 장소

- 우산(「holds an umbrella open over her shoulder」) 장소에 실내가 있다 — 원소 · 삼국지: 역 구내 · 공항 · 현관. pkm 은 더 넓다: 다이너 · 사무실 · 가게 · 편의점 · 쇼핑몰 · 도서관 열람실. **실내에서 편 우산.**
- 휴대폰만 시대(`eras: now`)를 본다. 나머지 소품은 장소 목록만 — 카메라(현대 카메라 글 「a camera」)가 원소 `nation_*`(판타지 · 스팀펑크 나라 안) 아홉 곳에 들어 있다.
- 등불(「a small hand lantern」)이 수중 궁(`fx_underwater`) · 얼음 궁에 들어 있다. 환상 무대라 넘어갈 수 있는 수준.

### 3-6. 시간대 · 조명 · 날씨끼리

지금은 계획기가 안 써서 드러나지 않는다(삼국지만 `time` 63장). 계획기에 붙이면(5절 제안) 바로 드러날 자리:

- 시간대 `lamplight` 는 글이 「indoors」 다 — 실외 장소와 부딪힌다. `neon` 은 현대 도시 말고는 안 맞는다. `noon` · `golden` 은 `night_*` 장소 묶음(밤 문화 8곳) · 장소 글에 「at night」 · 「evening sky」 · 「at sunrise」 가 박힌 곳과 부딪힌다(여관 「at night, a counter and a fire」, 정유소 「under a wide evening sky」, 구름 누각 「at sunrise」).
- 날씨 `night_snow` + 시간대 `noon`, `fog`(안개 낀 **아침**) + `night`, `summer`(강한 햇빛) + 밤 장소 — 서로 묶는 칸이 없다.
- 날씨 ↔ 옷은 표시만(`weather_awkward` 2줄).
- 머리 `wet`(젖은 머리) · `hat` 은 장소 · 손과 안 묶여 있다 — 모자 + 「머리 넘기기」 · 「머리 뒤 받치기」.

### 3-7. 의상 ↔ 장소

제한을 푼 결과가 여기다. 표시(⚠)만 하고 묶음마다 한 장은 통과시키므로, 일곱 장 묶음마다 어색한 조합이 한 장씩 꾸준히 나온다. 기록의 의상 계열 상위가 홈웨어 · 란제리 · 수영복 · 역할극 · 목욕 차림인데 장소 상위는 원소 `site_*`(현장) · 삼국지 `heritage_*`(역사의 자리)다 — 조폐소에서 홈웨어, 서예 교실에서 수영복. 사용자가 일부러 푼 것이라 고칠지 말지는 정할 일이고, 여기선 **「어색한 조합 표가 아는 것보다 실제 어색한 조합이 훨씬 넓다」** 는 것만 적는다: 표는 계열 × 장소 묶음 11~13줄뿐이라 `homewear` × `site_*` 같은 건 ⚠ 도 안 붙는다.

---

## 4. (다) 지금 트리 — 표

### 4-1. 가짓수

| 갈래 | 원소 | 삼국지 | pkm | 지시문 줄 | 그림을 얼마나 바꾸나 |
|---|---|---|---|---|---|
| 시대 | 4 (지금 현실 · 쓰임의 현장 · 나라 안 · 무대·환상) | 4 (지금 현실 · 역사의 자리 · 세계 안 · 무대·환상) | 4 (지금 현실 · 첫 등장 무렵 현실 · 포켓몬 세계 안 · 무대·환상) | ERA / WORLD / SETTING | 큼(배경 전체) |
| 장소 묶음 / 장소 | 13 / 132 | 13 / 141 | 16 / 161 | Place | 큼 — 다만 배경 명사로만 |
| 의상 계열 / 옷 | 18 / 326 | 18 / 326 | 20 / 351 | Outfit | 큼 |
| 옷 색 · 데니어 · 상황 | 8 · 3 · 4 | 같음 | 색 · 상황 4 | Outfit 줄 끝 | 색은 큼, 상황은 한 장 |
| 몸 자세 | 16 | 16 | 16 | POSTURE | 중간 |
| 받침 | 8 | 8 | 8 | SUPPORT | 작음(자세에 딸림) |
| 프레이밍 | 7 (디테일 포함) | 7 | 7 (디테일 금지) | COMPOSITION · CROP | 큼(거리) |
| 몸 방향 | 5 | 5 | 5 (뒤 금지 → 4) | COMPOSITION | 중간 |
| 머리 방향 | 4 | 4 | 4 | COMPOSITION | 작음 |
| 카메라 높이 | 3 | 3 | 3 | COMPOSITION | **작음 — 「slightly above / below」** |
| 렌즈 | 프레이밍이 정함(3) | 같음 | 같음 | Lens | 없음(프레이밍과 한 몸) |
| 손(한 손마다) | 30 | 30 | 31 (+ 동료 쓰다듬기) | RIGHT / LEFT HAND | 중간 |
| 소품 / 소품 동작 | 37 / 71 | 46 / 80 | 115 / 153 | PROP | 중간 |
| 다리 | 19 | 19 | 19 | LEGS | 작음(전신 · 3/4 만) |
| 시선 | 9 | 9 | 9 | GAZE | 작음 |
| 표정 | 32 (계획기는 17) | 32 | 32 | EXPRESSION | 작음 — 일부러 은은하게 묶어 둠 |
| 날씨 · 계절 | 7 | 7 | 7 | Weather / season | **계획기가 안 씀(0%)** |
| 시간대 | 7 (`lib/prompt-spec.js:282`) | 있음 | 표 없음 | Time of day | **계획기가 안 씀(원소 0% · 삼국지 3%)** |
| 머리 매무새 | 5 | 5 | — | Hair | **계획기가 안 씀(0%)** |
| **자세 추천** | **47** | **47** | **52** | (칸만 채움) | 몸 쪽 전부를 이것이 정한다 |

### 4-2. 실제로 뽑힌 분포 — 그림 저장소 기록(자유 설계 칸 빼고)

| | 원소 1,325장 | 삼국지 1,842장 | pkm 1,891장(버전2 만) |
|---|---|---|---|
| 자세 추천으로 나온 컷 | 99% | 99.7% | 62%(나머지는 랜덤 후보) |
| 카메라 눈높이 | 73% | 72% | 58% |
| 카메라 응시 | 59% | 58% | 41% |
| 몸 정면 + 3/4 정면 | 66% | 67% | 61% |
| 머리 「몸과 같이」 | 70% | 71% | 39% |
| 선 자세 계열(서기 · 기대 서기 · 걷기 · 작업대) | 63% | 61% | 62% |
| 그중 그냥 서기 | 38% | 37% | 35% |
| 빈손(소품 없음) | 55% | 57% | 65% |
| 두 손 다 지시 없음 | 0% | 0% | **38%**(719장 — 손 칸 둘 다 비움) |
| 다리 지시 없음 | 51% | 50% | 56% |
| 날씨 · 머리 매무새 | 0% | 0% | 0% |
| 장소 묶음 치우침 | 환상 · 현장 · 나라 안이 68% | 환상 · 세계 안 · 역사가 67% | 고르게(한 묶음 최대 9%) |

많이 쓴 추천 — 원소: 멀어지며 걷기 63 · 벽에 기대 팔짱 54 · 바닥에 앉아 먼 곳 보기 49 · 머리 넘기며 내려다보기 44. 삼국지: 멀어지며 걷기 81 · 벽에 기대 팔짱 75 · 바닥에 앉아 먼 곳 74. pkm: 걷다 멈춰 돌아보기 64 · 소품 들고 돌아보기 56 · 벤치에 앉아 옆 보기 51.

### 4-3. 비슷해지는 까닭

1. **몸 쪽 조합이 47가지뿐이다.** 자세 16 × 프레이밍 7 × 몸 방향 5 × 머리 4 × 카메라 3 × 손 30² × 다리 19 × 시선 9 는 천문학적이지만, 원소 · 삼국지 계획기는 자세 추천을 고른 뒤 그대로 쓴다(`tools/casual-plan.cjs:137-144`). 일곱 장 묶음 안에서는 겹치지 않아도 카드 200장을 넘기면 같은 47장이 장소 · 옷만 바꿔 되풀이된다. 사용자가 「갈래를 다양하게 쓰는데도」 라고 느끼는 까닭 — 다양한 것은 장소 132 · 옷 326 쪽이고, 사람의 꼴은 47가지다.
2. **47가지가 같은 방향을 본다.** 추천의 카메라 높이는 눈높이 34 · 위 9 · 아래 4, 시선은 카메라 28, 몸은 정면 16 · 3/4 정면 18 · 옆 11 · 뒤쪽 2, 자세는 서기 18. 추천 이름도 카메라용 몸짓이다 — 쉿 · 볼에 손 · 브이 · 엄지 척 · 손 흔들기 · 카메라로 손 뻗기 · 두 손 모으기 · 팔짱. **「지금 뭘 하고 있나」 가 아니라 「사진 찍히는 중」** 이라, 장소가 조폐소든 온실이든 같은 화보 한 장이 된다.
3. **카메라 축이 사실상 하나다.** 높이 세 가지가 다 「slightly」 이고, 좌우(카메라가 인물의 어느 쪽에 서나) · 거리감(프레이밍과 따로인 원근) · 기울기 · 전경 겹침(어깨 너머 · 문틀 너머 · 물건 너머)이 없다. 렌즈는 프레이밍이 정해 따로 못 돌린다.
4. **인물이 화면 어디에 서는지 · 배경이 얼마나 깊은지 칸이 없다.** 모델 기본값(가운데 · 배경은 뒤에 한 겹)으로 나온다.
5. **빛이 한 가지다.** 시간대 7 · 날씨 7 표가 있고 조립기도 줄을 싣는데(`lib/prompt-element.js:722-724`) 계획기가 안 고른다. 짧은 판의 `Light: the place's own light` 한 줄뿐 — 장소 글에 시간이 박힌 몇 곳 말고는 다 「밝은 낮 · 고른 빛」.
6. **장소가 인물에 닿지 않는다.** 받침 `has`(의자 · 탁자 · 난간 …)는 거르는 데만 쓰이고 지시문에 「그 장소의 무엇에」 가 안 실린다. `sit_chair` 는 어느 장소든 「seated on a chair」 — 용광로 앞에서도 여관에서도 같은 의자다.
7. **동작의 크기가 한 단계다.** 자세 16이 다 가만히 있는 자세다(걷기도 「walking」 한 마디). 몸통을 비틀거나 숙이거나 뻗거나 한 발을 올리는 축이 없다. 표정도 일부러 은은한 17로 묶었다(2026-11-03).
8. pkm 은 랜덤 후보 덕에 몸 방향 · 머리 · 카메라가 더 고르다. 대신 **손 칸을 둘 다 비운 컷이 38%** — 손 줄이 없으면 모델이 기본 자세(두 팔 내림 · 한 손 허리)로 채운다. 고른 것처럼 보여도 그림은 닮는다.

### 4-4. 새 트리 후보

우선순위 차례. 후보마다 갈래 예시.

**① 하는 일(activity) — 가장 큰 구멍.** 장소 → 하는 일 → (자세 · 받침 · 손 · 소품 · 시선)을 한 번에 묶는 갈래. 지금 자세 추천이 하는 역할을 「몸짓」 이 아니라 「일」 로 바꾸는 것이다. 까치발 · 뻗기 · 숙이기의 까닭이 여기서 나온다(버전1 `OWN_ACTION` 의 자리). GPT 자유 설계가 정확히 이 꼴이다(6절).

- 손보기: 작업대 위 작은 물건을 한 손 도구로 조이고 다른 손으로 받친다 / 엉킨 줄 · 끈을 푼다 / 막힌 것을 빼낸다
- 재 보기: 빛에 대 본다 / 수평을 맞춘다 / 두 개를 견준다 / 물에 담가 기포를 본다
- 정리: 선반 위 칸에 올린다(→ 까치발 · 한 팔 위) / 줄에 넌다(→ 두 팔 위) / 바닥의 것을 주워 담는다(→ 쪼그려 · 숙이기) / 접어 쌓는다
- 닦기 · 쓸기: 한쪽 무릎을 꿇고 바닥을 쓴다 / 유리를 닦는다(→ 팔 뻗기 · 옆모습)
- 몸단장: 걸터앉아 한 발을 올리고 신발끈을 맨다 / 소매를 걷는다 / 앞치마 끈을 뒤로 묶는다 / 머리를 올려 묶는다(→ 두 팔 위 · 정면)
- 오가기: 문을 어깨로 밀고 들어온다 / 계단을 두 칸 오르다 돌아본다 / 수레를 민다 / 짐을 옆구리에 끼고 걷는다
- 쉬기: 창턱에 걸터앉아 다리를 올린다 / 벽에 등을 대고 바닥에 앉아 무릎에 책을 얹는다 / 탁자에 엎드려 턱을 팔에 얹는다

**② 빛 — 표는 이미 있다. 계획기가 쓰기만 하면 된다.** 장소에 실내 · 실외 · 밤 고정 칸을 달고 시간대 7 · 날씨 7 을 묶음마다 서로 다르게. 덧붙일 갈래(빛의 방향):

- 역광(창 · 해를 등지고 윤곽에 테) / 옆 빛(창에서 한쪽으로) / 위에서 떨어지는 빛(천창 · 등) / 아래에서 비추는 빛(등불 · 화면 · 불) / 얼룩 그림자(나뭇잎 · 블라인드) / 두 색 빛(따뜻한 실내 + 푸른 창밖)

**③ 카메라 자리 — 높이 3 을 자리 · 각도로 넓힌다.**

- 좌우: 인물 왼쪽 앞 / 오른쪽 앞 / 정옆 / 뒤 왼쪽 / 뒤 오른쪽 (몸 방향 `side` 에 「화면 왼쪽을 본다 · 오른쪽을 본다」 를 주는 것과 같은 일 — 2-4 의 좌우 뒤바뀜도 같이 준다)
- 높이: 바닥 가까이(앉은 인물과 같은 높이) / 허리 높이 / 눈높이 / 머리 위 / 바로 위에서(누운 컷)
- 전경: 문틀 너머 / 선반 사이로 / 창 유리 너머 / 앞에 놓인 물건 너머 / 거울에 비친 모습
- 기울기: 수평 / 살짝 기울임(걷기 · 달리기에만)

**④ 화면 안 자리 · 배경 깊이.**

- 자리: 가운데 / 왼쪽 3분의 1(오른쪽이 비어 시선이 간다) / 오른쪽 3분의 1 / 아래쪽에 작게(위로 공간) 
- 깊이: 벽 앞(얕다) / 복도 · 길이 뒤로 빠진다(깊다) / 창밖이 보인다(두 겹) / 문 너머 다른 방이 보인다(세 겹)

**⑤ 몸의 선 — 동작 크기.** 자세 16 에 덧붙일 것(이름은 표 꼴로):

- `half_kneel` 한쪽 무릎 꿇기(다른 발은 디딤) — GPT 자유 설계 20%대, 우리 표에 없음
- `sit_sideways` 스툴 · 벤치에 옆으로 걸터앉아 몸통만 카메라로
- `step_up` 한 발을 계단 · 턱 · 상자에 올림
- `bend_over` 허리 숙여 낮은 것에 손(버전1 `bending_over` 의 자리)
- `reach_up` 위로 뻗기(까치발과 한 묶음 — 받침에 「높은 선반 · 줄 · 고리」 가 있을 때만)
- `twist` 발은 그대로, 몸통을 돌려 뒤의 것을 집는다
- `lean_fwd_knees` 앉아 팔꿈치를 무릎에

**⑥ 장소 안 자리 · 고정물 — 받침 `has` 넓히기.** 지금 11가지(의자 · 가장자리 · 바닥 · 눕는 자리 · 벽 · 난간 · 탁자 · 물 셋 · 작업대, 삼국지는 + 기둥). 덧붙일 것:

- `window`(창 — 「창밖」 시선 · 창턱 턱 괴기 · 비 날씨의 조건) · `sky`(하늘이 보인다 — 「위」 시선 · 날씨 · 햇빛 시간대) · `indoor`
- `shelf_high`(높은 선반 · 줄 · 고리 — 까치발 · 뻗기의 까닭) · `stairs`(계단 — 한 발 올림 · 걸터앉기) · `doorway`(문간 — 기대 서기 · 들어서기) · `stool`(스툴) · `mirror`(거울 — 손거울 없이 매무새) · `counter_far`(카운터 건너편에 선다)
- 그리고 자세 글에 그 고정물 이름을 싣는다 — 「seated on a chair」 가 아니라 「seated on the low stool by the kiln door」(장소 표에 고정물 글 한 줄씩).

**⑦ 시선 대상.** 지금 9가지는 방향이다(카메라 · 소품 · 창밖 · 먼 곳 · 아래 · 위 · 화면 왼쪽 · 오른쪽). 대상으로:

- 손이 하는 일 / 장소의 한 물건(불 · 창밖 풍경 · 선반 위) / 거울 속 자기 / 방금 들어온 문 쪽 / 어깨 너머 뒤쪽

**⑧ 덜 급한 것.** 머리 매무새 5(표 있음 · 계획기 안 씀) — ②와 같이 붙이면 된다. 계절 소품(목도리 · 부채 · 우산)은 날씨에 딸려야 한다.

---

## 5. (라) GPT 자유 설계 일상컷 — 공통 씬

### 5-1. 모은 것

| 공방 | 자유 설계 기록 | 읽은 글 |
|---|---|---|
| 원소 | 93장(옷 자유 39 · 갈래 자유 54) | `generation.free_design` 의 Place · Activity · Pose · Framing · Outfit 줄. 87장에 Place 줄 |
| 삼국지 | 266장(옷 자유 192 · 갈래 자유 74) | 같은 꼴. 162장에 Place 줄(나머지 104장은 2026-11-11 전 — 옷만 자유라 장면은 우리 트리) |
| pkm | 74장(장면 자유 37 · 갈래 자유 37) | `casualN-submitted.txt`(GPT 가 쓴 실제 지시문)의 SCENE 덩어리. 그 밖에 옷만 자유인 컷 142장은 장면이 우리 트리라 뺐다 |

### 5-2. 되풀이되는 것(낱말로 센 것 — 한 장이 여러 줄에 걸린다)

**장소**

| | 원소(87) | 삼국지(162) | pkm(74) | 우리 트리에 |
|---|---|---|---|---|
| 작업대 · 공방 · 수리대 · 작업실 | 31% | 10% | 44% | 작업실 4~5곳뿐(화실 · 재단실 · 제과실 · 녹음실) — **수리 · 정비 자리 없음** |
| 수영장 · 물가 · 부두 · 배(특히 「수영 클럽 장비실 · 탈의 구석 · 훈련 풀」) | 22% | 17% | 20% | 물가 7곳은 있다. **장비실 · 풀 가장자리 턱 · 부두 작업대**는 없음 |
| 창가 | 20% | 9% | 31% | 장소로는 없음(창은 장소 글 속 낱말) |
| 시장 · 가게 · 매대 · 키오스크 | 16% | 6% | 25% | 시장 · 가게 있음. **한 칸짜리 수리 키오스크 · 매대 안쪽**은 없음 |
| 역 · 정류장 · 차고 · 열차 | 8% | 5% | 25% | 역 · 침대차 있음 |
| 박물관 · 전시 · 천문관 | 8% | 1% | 13% | 박물관 있음. **체험대 · 개관 전 빈 전시실** 없음 |
| 옥상 · 발코니 · 테라스(빨래 건조 테라스 포함) | 9% | 9% | 8% | 있음 |
| 계단 · 복도 · 문간 | 2% | 11% | 2% | **없음** |
| 세탁 · 건조 | 6% | 1% | 0% | pkm 빨래방만 |

**하는 일**

| | 원소 | 삼국지 | pkm |
|---|---|---|---|
| 재기 · 시험 · 살피기 · 맞추기(「checks · tests · aligns · inspects」) | 43% | 14% | 64% |
| 고치기 · 조이기 · 풀기 · 되감기 | 27% | 8% | 41% |
| 정리 · 분류 · 쌓기 · 걸기 · 개기 | 20% | 7% | 54% |
| 신발 · 끈 · 지퍼 · 앞치마 매만지기 | 18% | 7% | 63% |
| 옮기기 · 밀기 · 들기 | 18% | 5% | 39% |
| 놀이 · 연주 · 공 다루기 | 18% | 9% | 54% |
| 닦기 · 씻기 · 쓸기 | 11% | 0% | 35% |
| 위로 뻗기 · 까치발(**까닭이 붙어 있다** — 줄에 널기 · 맨 위 칸에 넣기) | 12% | 1% | 27% |
| 먹기 · 마시기 | 0% | 0% | 4% |

우리 트리의 소품 동작은 들기 · 입에 대기 · 보기가 대부분이고(잔 · 휴대폰 · 책 · 꽃다발), 「마실 것 한 장까지」 규칙이 따로 있을 만큼 마시기가 많다. GPT 는 마시기를 거의 안 쓴다 — 「최근 장면을 피하라」 에 우리 장면이 실려서이기도 하다.

**자세 · 구도**

| | 원소 | pkm |
|---|---|---|
| 앉기(스툴 · 벤치 · 걸터앉기 — 「seated sideways on a low stool」 꼴이 흔하다) | 42% | 68% |
| 두 손을 한 물건에 | 44% | 58% |
| 한쪽 무릎 꿇기 · 무릎 꿇기 | 22% | 20% |
| 서기 | 34% | 16% |
| 몸 숙이기 | 9% | 12% |
| 한 발 디딤 · 올림 | 8% | 5% |
| 눕기 · 걷기 · 돌아보기 | 각 1~3% | 각 1~3% |
| 구도 「3/4 정면 · 얼굴 높이 카메라」 | 55% | 50% |
| 전신 | 47% | 28% |
| 옆모습 | 0% | 0% |
| 낮은 · 높은 카메라 | 3% · 0% | 0% · 9% |

### 5-3. 읽고 느낀 것

- GPT 자유 설계도 **한 틀로 모인다.** 「작은 [가게 · 클럽 · 공방]의 조용한 [구석 · 장비실], [개점 전 · 수업 뒤]. 그녀는 [작은 기계 장치]를 [맞추고 · 고치고] 있다. [낮은 스툴에 옆으로 앉아 · 한쪽 무릎을 꿇고], 오른손은 [도구], 왼손은 [받침]. 3/4 정면, 얼굴 높이.」 원소의 「수영 클럽 장비실」 은 갈래 자유 칸(수영복 갈래 + 상황 열기)에서 여섯 번 넘게 나온다 — 수영복을 입을 까닭과 「우리 넷이 아닌 상황」 을 같이 풀려니 「장비를 벗는 중 · 턱에 발을 올리는 중」 으로 간다.
- 구도는 우리보다 **더 좁다** — 3/4 정면 · 얼굴 높이가 절반. 옆모습 0, 돌아보기 0. 「얼굴과 두 손이 또렷이」 를 GPT 가 스스로 건다. 팔 사고가 없는 까닭이기도 하다.
- 상황 노출을 「우리 넷 아닌 것」 으로 지으라고 하니 **자세가 노출을 만든다** — 「올린 무릎이 앞치마 자락을 민다」 · 「두 팔을 올려 밑단이 딸려 올라간다」. 여기서 까치발 · 뻗기 · 한 발 올림이 나온다(까닭 있는 까치발).
- 그러니 「GPT 쪽이 참신해 보이는」 것의 정체는 **하는 일이 있다**는 하나다. 장소 · 구도는 오히려 덜 다양하다.

### 5-4. 트리에 넣을 후보

4-4 의 ①(하는 일) · ⑤(몸의 선) · ⑥(고정물)에 그대로 들어간다. 따로 적으면:

| 넣을 것 | 무엇으로 | GPT 글의 예 |
|---|---|---|
| 하는 일 묶음 「작업대에서 손보기」 | 자세 추천(자세 `sit_sideways` 또는 `lean_counter` · 두 손 소품 동작 · 시선 소품) + 소품 동작 여럿 | 「turns a small manual pin vise, left hand steadies the rail」 · 「turning the small key and left hand holding the gate still」 · 「one hand holds the disk by its rim and the other turns a knurled focus ring」 |
| 하는 일 묶음 「빛에 대 보기 · 견주기」 | 한 손 올림 동작(지금 `tube_light` 꼴) — 소품을 그 공방 물건으로 넓힘 | 「holds a long freshly cleaned sheet up to the light to find a tiny remaining stain」 · 「holds the vial at eye level」 |
| 하는 일 묶음 「널기 · 올려놓기」 | 자세 `reach_up` + 다리 까치발 + 받침 `shelf_high` | 「standing barefoot on tiptoe … both arms naturally reach upward, her two hands each pinching one wooden clip」 · 「lifting a freshly folded blanket overhead to fit it into the top cubby」 |
| 하는 일 묶음 「신발 · 끈 · 장비 풀기」 | 자세 걸터앉기 + 다리 「한 발 올림」(새 다리 갈래) + 두 손 | 「one bare foot on a low stool, both hands visibly threading the loose shoe lace」 · 「turning a stubborn neoprene water boot inside out」 |
| 하는 일 묶음 「쓸기 · 닦기」 | 자세 `half_kneel` + 한 손 도구 · 한 손 짚기 | 「One knee on a padded step, torso gently leaning forward, right hand holding the brush near the floor, left hand stabilizing the platform」 |
| 자세 `half_kneel` · `sit_sideways` · `step_up` | 자세 표 | 위 |
| 고정물 `stool` · `shelf_high` · `stairs` · `doorway` · `window` | 받침 `has` | 「a low wooden footstep」 · 「a tall dry rack」 · 「beside a large open window」 |
| 장소 — 수리 키오스크 · 정비 창고 · 수영 클럽 장비실 · 건조 테라스 · 개관 전 전시실 · 계단참 | 장소 표(지금 현실). 원소는 「쓰임의 현장」 에도 맞는다 | 「A small bicycle repair kiosk by an elevated riverside cycle path」 · 「A miniature-railway maintenance shed with its door open onto a sunny garden」 · 「a quiet apartment rooftop drying terrace」 |

넣을 때 조심할 것: 한 물건을 두 손이 다루는 꼴은 지금 `both` 소품 동작의 `grip`(오른손 · 왼손 따로 적기)으로 이미 받을 수 있다. 새 틀이 필요 없다.

---

## 6. (마) 고칠 순서 제안

작은 것 · 확실한 것부터. 각 줄은 따로 정할 수 있다.

**첫째 — 글 몇 마디로 끝나는 모순(세 공방 공통, 검사 거의 없음)**

1. 상황 `wet` 글에서 비를 뗀다. 「a sudden rain shower or a splash of water」 → 장소가 실외 · 물가일 때만 비, 아니면 「a splash of water」(쏟은 물 · 물 튐)만. 장소 칸이 없는 지금은 **글을 「a splash of water」 로만** 두는 것이 가장 싸다. `wind` 는 실외 · 창가 · 선풍기 같은 까닭이 있는 곳만.
2. 추천 `tiptoe_wave` — 까치발을 떼거나(다리 `stand_relaxed`), 까닭을 붙인다(「난간 너머로 손 흔들기」 로 바꾸고 `needs: rail_waist`). 다리 `tiptoe` 는 ⑥의 `shelf_high` 가 생길 때까지 추천 · 랜덤에서 뺀다.
3. 추천 `chin_close` · `window_chin` 의 시선 `window` — 장소 글에 창이 있는 곳만(지금은 `needs` 를 달 칸이 시선에 없다 → 시선을 비우거나 「화면 왼쪽」 으로).
4. 우산 장소에서 실내(역 구내 · 공항 · pkm 의 가게 · 도서관 …)를 뺀다. 또는 실내에선 「접은 우산을 든다」 동작만.
5. `lean_counter` 의 다리에서 짝다리 · 까치발 · 벽에 한 발을 뺀다(자세 글이 「두 발에 무게」).

**둘째 — 팔(추천 셋과 규칙 셋)**

6. `lie_side_full` — 어느 쪽으로 눕는지 적고 손을 그 쪽에 맞춘다: 「lying on her left side」 + 깔린 왼팔은 「머리를 받친다(팔꿈치를 바닥에)」, 위의 오른팔은 「몸 앞 바닥을 짚는다」 또는 「허리에 얹는다」. 지금은 깔린 팔에 「바닥 짚기」 가 갈 수 있다.
7. 뒤 · 뒤 3/4 몸 방향에선 소품 동작을 `zone: hips`(옆에 든다 · 내려 든다)만 받게. 「가슴 높이」 는 등에서 안 보인다 — `walk_lookback` · `walk_away` 가 세 공방에서 가장 많이 쓴 추천이라 영향이 크다. `backLook().where`(「on the image's right side, since her back is to the camera」)는 몸이 `back` 일 때만 붙이고 `rear_3q` 에선 뗀다.
8. `lookback` 규칙을 얼굴 높이 **소품 동작**까지 넓힌다(지금은 손 칸만).
9. 자세 글이 팔을 쓰는 자세에 손 제한(`hands`)을 단다 — `front_floor` 처럼. `sit_lean`(팔뚝이 탁자에) · `swim`(두 팔로 젓는다) · `lean_rail`(난간에 기댄다). `front_floor` 의 `prop` 은 팔꿈치를 바닥에 둔 채 되는 동작만(셀카 · 두 손 책 빼기).
10. 옆모습 · 누운 몸에서는 좌우 대신 **가까운 팔 · 먼 팔**로 적거나, 몸 방향에 「화면 왼쪽을 본다 / 오른쪽을 본다」 를 준다(③ 카메라 자리와 같은 일). 좌우 뒤바뀜 38장의 대부분이 여기다.
11. 한 손 동작 글 고치기: `salt_pinch` 는 두 손 동작으로(오른손 집기 · 왼손 항아리), pkm `noodle_eat` · `berry_pick` · `job_*` 일곱도 같다. 또는 탁자 받침을 요구(「on the table in front of her」).
12. pkm — 손 칸 둘 다 비운 컷(38%)에 `natural` 이라도 채운다. 빈 채면 모델이 고르고, 그게 소품 · 자세 글과 부딪히면 팔이 는다.

**셋째 — 다양성(계획기)**

13. 장소 표에 `indoor` · `window` · `sky` · `night`(밤 고정) 칸을 단다 — 1 · 3 · 4번의 제대로 된 판이고, 다음 줄의 조건이다. 132~161곳 × 네 칸, 영어 글에서 초안을 뽑으면 반은 자동이다(이번에 낱말로 추정해 보니 원소 132곳 중 실내 53 · 실외 43 · 둘 다 9 · 모름 27).
14. 계획기가 시간대 · 날씨 · 머리 매무새를 묶음마다 서로 다르게 고른다. 표 · 조립은 이미 있다.
15. 자세 추천 47개를 손본다 — 카메라용 몸짓(쉿 · 브이 · 엄지 척 · 손 흔들기 · 카메라로 손 뻗기) 비중을 줄이고, 카메라 위 · 아래 · 옆모습 · 시선 비카메라 추천을 늘린다. 원소 · 삼국지 계획기에 pkm 처럼 칸마다 랜덤 후보를 섞는 것도 방법(대신 12번이 먼저).

**넷째 — 새 트리(설계가 필요한 것)**

16. 하는 일 트리(4-4 ①, 5-4) — GPT 공통 씬 다섯 묶음부터. 고정물(⑥) · 새 자세 셋(⑤)이 같이 간다.
17. 카메라 자리(③) · 화면 안 자리와 깊이(④) · 빛의 방향(②).

**다섯째 — 자유 설계 칸**

18. `FREE_DESIGN.head` 에 한 줄: 「Pose 줄은 손마다 하나의 일만 — 팔이 어느 쪽에서 나오는지 헷갈릴 자세(등 뒤 · 머리 뒤 · 몸에 깔린 팔)는 피한다. 물에 잠긴 다리의 발 위치는 지정하지 않는다.」 지금도 사고는 드물지만(1/433) 틀이 굳어 가니 「작업대 · 장비실 · 수리 말고」 도 최근 장면 목록과 함께 돌려 줄 만하다.

**검수 쪽 한 가지.** 원소 기록의 `qa.passed: false` 가 1,418장 중 800장인데 대부분 「계획과 구도 · 의상이 조금 다르다」 다. 추가 팔 같은 진짜 사고가 그 속에 묻힌다. 검수 칸에 `anatomy: ok / arm / hand / foot` 한 칸을 따로 두면 다음 검토가 쉽다. (pkm `qa.json` 은 이미 `anatomy.arms: 2` 꼴이 있다.)

---

## 7. 읽은 것 · 못 읽은 것

- 코드 저장소 셋은 2026-11-13 에 `git pull` 한 뒤 읽었다: 원소 `element-atelier`, pkm `pkm-atelier`, 삼국지 `sam-atelier`(삼국지 공방 저장소는 `sam-atelier` 다 — `atelier` 는 건담 쪽).
- 그림 저장소는 GitHub `polos0117/*` 에서 `records/` 만 받아 읽었다(임시 폴더 — 저장소에는 아무것도 안 썼다): `element-atelier-img`(일상컷 기록 1,751) · `pkm-atelier-img` ~ `-img-4`(408 · 779 · 1,129 · 1,996) · `sam-atelier-img` · `-img-2`(2,267 · 193).
- **`element-atelier-img-2` 에는 `records/` 가 없다**(원격 · 로컬 둘 다). 거기 올린 그림의 기록이 따로 있다면 못 읽었다.
- pkm 버전1 기록 1,739장은 분포 집계에서 뺐다(버전2 칸이 없다).
- 그림은 한 장도 보지 않았다. 이상은 전부 검수 기록(GPT 가 쓴 `qa`)과 `docs/PATCH.md` 의 글에서 왔다. 삼국지 `docs/STYLE_LAB.md:1291` 에 「검수 칸(GPT 가 씀)은 거의 다 『연결 정상』 이라 결함 수…」 라고 적힌 대로 **검수 기록은 실제 사고보다 적게 잡는다** — 삼국지 추가 팔 0장은 「없다」 가 아니라 「안 적혔다」 일 수 있다(PATCH 에는 두 건 있다).
- 실내 · 실외는 장소 영어 글의 낱말로 추정했다(표에 칸이 없다). 3-1 · 3-3 의 숫자는 ±몇 장 틀릴 수 있다.
- 자유 설계 글의 집계는 낱말 찾기다. 한 장이 여러 줄에 걸리고, 삼국지는 Place 줄 없는 옛 꼴 104장이 섞여 비율이 낮게 나온다.
- 버전1 트리(하는 일 · 추천 조합 229~340)는 지금 생성에 안 쓰여 깊이 보지 않았다. 생성기 화면(`prompt.html`)에서 손으로 고르는 길은 모듈 규칙으로만 확인했다.
- 「조립될 수 있다」 는 모듈 `repair()` 를 통과한다는 뜻이다. 2-2 의 E~I 는 추천에 없어 손으로 고르거나 pkm 랜덤 후보에서만 나온다 — 실제 기록 수는 세지 않았다.

---

## 8. 고친 것 · 정한 것 (2026-11-13 뒤이어 — 6절 1 ~ 17)

사용자 「4번까지하고 gpt도 다 비슷한 장면을 쓴다면 그거를 우리쪽 일상틀에 넣어줘」. 다섯째(18번 — 자유 설계 칸 한 줄)와 검수 칸은 뒤이어 했다(9절). 이미 그린 그림 · 등록부 · 기록은 그대로다. 저장소마다 `docs/PATCH.md` 맨 위 칸에 파일별로 적었다.

### 번호별

| # | 한 것 | 어디 |
|---|---|---|
| 1 | 상황 「젖은 옷」 에 실내 글(`enIn` — 「a splash of water has just soaked her clothes …」). 장소가 실내면 조립기가 이 글을 싣는다. 바람 상황은 계획기가 실내가 아닌 곳에만 준다 | `lib/prompt-spec.js` · 조립기 · 계획기 |
| 2 | 추천 `tiptoe_wave` 는 까치발을 뗐다(다리 `stand_relaxed`, 이름 「옆모습으로 손 흔들기」 — 열쇠는 기록과 맞추려고 그대로). 다리 `tiptoe` 는 높은 선반(`shelf_high`)이 있는 곳 · 서기 · 위로 손 뻗기에서만 | 표 |
| 3 | 시선 `window` 는 `needs: [window]`, `up` 은 `needs: [sky]`. 추천 `chin_close` · `window_chin` 은 창이 있는 곳에서만 추천으로 뜬다(안 바꿨다 — 모듈이 거른다) | 표 · 모듈 |
| 4 | 우산(삼국지는 기름종이 우산도) 펴 들기는 `needs: [sky]`, 장소 목록에서도 실내를 뺐다 | 표 |
| 5 | 다리 `stand_relaxed` · `contrapposto` · `step_forward` · `tiptoe` · `foot_on_wall` 에 자세 목록 — 작업대 숙이기엔 「편히 서기」 만 | 표 |
| 6 | 옆으로 눕기는 **왼쪽으로** 눕는다(자세 · 받침 글). 깔린 왼팔은 「팔꿈치 짚고 머리 받치기」(`head_rest`) · 자연스럽게 · 화면 밖만(받침 `hands_left`), 위의 오른팔은 「몸 앞 바닥에 손」(`floor_front`) 등. 추천 `lie_side_full` = 오른손 `floor_front` · 왼손 `head_rest` | 표 · 모듈 |
| 7 | 뒤쪽 몸 방향(뒤 · 뒤 3/4)에선 소품 동작이 `zone: hips`(옆에 내려 든다)만. 그 물건에도 `sig_low`(「carries … low at her side」). `backLook` 의 「on the image's … side」 는 몸이 `back` 일 때만 | 모듈 · 표 |
| 8 | 7번 규칙이 얼굴 높이 소품 동작(수건으로 머리 말리기 등)까지 막는다 — 따로 규칙을 더하지 않았다 | 모듈 |
| 9 | 자세가 받는 손 `posture.hands`: 앉아 앞으로 기울이기(턱 괴기 · 볼 · 쉿 · 머리 넘기기 · 무릎 · 소품 …) · 헤엄(화면 밖 · 자연스럽게) · 위로 손 뻗기. 엎드리기에선 팔을 드는 한 손 동작(`raise` 꼴 · 셀카)을 뺐다. 난간 기대 서기 글에서 「leaning lightly on it」 을 뺐다. 벽에 기대 서기에서 벽 짚기를 뺐다 | 표 · 모듈 |
| 10 | 옆모습 컷은 「facing the right of the frame, so her own right side is toward the camera」 와 손 줄 끝의 「her near arm, on the camera side」 · 「her far arm, on the side away from the camera」 | 모듈 `sideLook` · 조립기 |
| 11 | 원소 `salt_pinch` 는 두 손 동작(오른손 집기 · 왼손 항아리), pkm `noodle_eat` 는 탁자 위 그릇에서(탁자 받침 필요) | 표 |
| 12 | pkm — 손 칸을 둘 다 비운 랜덤 후보는 `natural` 로 채운다 | `pkm lib/casual-plan.js` |
| 13 | 장소 특징 아홉을 받침 낱말(`has`)에 더해 장소마다 붙였다 — `indoor` · `window` · `sky` · `night`(밤 고정) · `timed`(글에 시간이 정해진 곳) · `shelf_high` · `stool` · `stairs` · `doorway` | 표 |
| 14 | 계획기가 시간대 · 날씨 · 머리 매무새 · 빛의 방향 · 화면 자리 · 깊이 · 전경 · 카메라 높이를 고른다. 조건은 표 `ambience` | 모듈 `ambience` · 계획기 |
| 15 | 카메라용 몸짓 추천 여덟(`shush_close` · `vsign_close` · `thumbs_waist` · `wave_chest` · `reach_waist` · `clasp_low` · `tiptoe_wave` · `cheek_close`)에 `pose` 표시 — 원소 · 삼국지는 고르는 무게 0.4, pkm 은 점수 +0.8(뒤로). 없애지 않았다 | 표 · 계획기 |
| 16 | 새 자세 넷 · 손 넷 · 소품 다섯(동작 열) · 장소 여섯 · 추천 여덟(아래) | 표 |
| 17 | 카메라 높이 `floor`(앉은 눈높이 — 앉은 · 낮은 · 누운 자세) · `top`(바로 위 — 누운 자세), 새 표 `light`(여섯) · `spot`(셋) · `depth`(셋) · `view`(셋) | 표 · 조립기 |

### GPT 공통 씬을 트리에 넣은 꼴

「하는 일」 을 새 칸으로 만들지 않고 **자세 추천 + 소품 동작**으로 넣었다(생성기 화면 · 기록 꼴을 안 바꾸려고).

| 추천 | 꼴 | 받는 곳 |
|---|---|---|
| `bench_fix` 옆으로 걸터앉아 두 손으로 손보기 | 옆으로 걸터앉기 · 3/4 · 두 손 소품 · 시선 소품 | 스툴이나 걸터앉을 턱 + 두 손 동작이 되는 소품 |
| `half_kneel_use` 한쪽 무릎 꿇고 소품 쓰기 | 한쪽 무릎 꿇기 · 전신 · 위에서 · 오른손 소품 · 왼손 바닥 | 바닥 |
| `reach_shelf` 까치발로 높은 선반에 손 뻗기 | 위로 손 뻗기 · 전신 · 옆모습 · 아래에서 · 까치발 | 높은 선반 |
| `hang_line` 두 팔 올려 널기 · 올려놓기 | 위로 손 뻗기 · 3/4 · 두 손(천 널기 · 상자 올리기) | 높은 선반 + 그 소품이 나오는 곳 |
| `lace_stool` 옆으로 걸터앉아 신발끈 매기 | 옆으로 걸터앉기 · 전신 · 옆모습 · 시선 아래 | 스툴 · 턱 |
| `step_pause` 한 발 올리고 먼 곳 보기 | 한 발 올려 서기 · 전신 · 아래에서 · 고개 옆 | 계단 · 턱 |
| `light_check` 소품을 빛에 대 보기 | 서기 · 가슴 위 · 옆모습 · 아래에서 · 시선 소품 | 「들어 보는」 동작이 있는 소품 |
| `floor_wall_use` 벽에 기대 앉아 두 손으로 소품 쓰기 | 바닥에 앉기 · 등을 벽에 · 위에서 | 벽 + 바닥 |

새 소품 동작: 손 공구(`tool_hold` · `tool_fix` — 「adjusts a small mechanism on the work surface with a small screwdriver」), 닦는 천(`cloth_hold` · `cloth_wipe` · `cloth_window`), 손 빗자루(`brush_sweep`), 갓 빤 천(`sheet_hang` · `sheet_fold`), 수납 상자(`box_shelf` · `box_carry`).
새 장소(지금 현실): `repair_kiosk` · `maintenance_shed` · `pool_gear_room` · `drying_terrace` · `museum_workshop` · `stair_landing`.

### 스스로 정한 것 — 뒤집을 수 있게

1. **장소 특징은 영어 글의 낱말 + 묶음 기본값으로 붙이고 눈에 띄는 것만 손으로 바로잡았다.** 틀린 곳이 있을 수 있다(원소 138곳: 실내 80 · 하늘 58 · 창 34 · 밤 고정 22 · 높은 선반 26 · 스툴 21 · 계단 13 · 문간 5 · 시간 고정 5). 표 `places.<장소>` 의 목록을 고치면 된다. 「실내」 와 「하늘」 은 한 장소에 같이 안 붙였다 — 천문대(돔이 열림) · 역 승강장 같은 곳은 한쪽으로 정했다.
2. **옆으로 눕기는 늘 왼쪽.** 오른쪽으로 눕는 컷은 못 만든다(자세를 둘로 나누면 된다).
3. **옆모습이 보는 쪽은 「일하는 손이 카메라 쪽」 으로 정했다** — 오른손이 소품 · 얼굴 · 가슴 높이면 화면 오른쪽을 본다. 추천이 대부분 오른손을 쓰니 옆모습 컷은 대개 오른쪽을 본다. 시선이 화면 왼쪽 · 오른쪽이면 그쪽.
4. **뒤쪽 몸 방향의 소품은 옆에 내려 드는 것만.** 그 장소에 그런 소품(카메라 · 쇼핑백 · 등불 · 기타 · 그 물건 `sig_low` …)이 없으면 `walk_lookback` · `walk_away` 가 추천으로 안 뜬다 — 세 공방에서 가장 많이 쓰던 추천이라 빈도가 내려간다.
5. **「하는 일」 은 추천으로**, 새 칸이 아니다. 생성기 화면엔 자세 추천 목록에 여덟 개가 더 보인다.
6. **빛 · 화면 자리는 계획기만 고른다.** 생성기 화면에서 손으로 고르는 칸은 안 만들었다(시간대 · 날씨 · 머리는 원래 있는 칸 그대로). 계획 기록을 생성기에 넣으면 지시문엔 그대로 실린다.
7. **확률**: 시간대 70%(고를 것이 하나뿐인 곳 30%) · 날씨 35% · 머리 35% · 빛의 방향 60% · 화면 자리 35% · 깊이 50% · 전경 20% · 카메라 바꾸기 30%(추천이 눈높이일 때). 묶음 안에서 덜 쓴 값부터. 모듈 `ambience` 의 숫자.
8. **시간대 조건**: 아침 · 한낮 · 해 질 녘 · 땅거미 · 밤은 하늘이나 창이 있는 곳, 네온은 지금 현실의 바깥, 등불은 실내. 밤 고정 장소는 밤 · 네온 · 등불만. 장소 글에 시간이 박힌 곳(「at dusk」 · 「at sunrise」)은 시간대 · 날씨를 안 고른다. 날씨는 맞는 시간대하고만(안개 — 아침, 눈 오는 밤 — 밤 · 등불, 한여름 볕 — 한낮 · 해 질 녘).
9. **머리 매무새**: 젖은 머리는 물가 · 목욕 묶음만, 모자는 바깥 + 머리에 손을 안 대는 컷만.
10. **젖은 옷은 실내에서도 남는다**(글만 물 튐으로). 박물관 · 도서관 같은 곳에선 아직 어색할 수 있다 — 빼려면 계획기의 `situAtPlace` 에 `wet` 조건을 더하면 된다.
11. **`tiptoe_wave` 열쇠를 그대로 뒀다** — 이름과 내용이 안 맞지만 그림 저장소 기록의 추천 횟수(덜 쓴 쪽 먼저)와 이어지게.
12. **pkm 손 칸**: 추천이 아닌 후보는 두 손 다 「자연스럽게」(시범 54컷 중 28컷). 손을 칸마다 랜덤으로 고르게 하면 더 다양해지지만 팔 사고 위험이 늘어 안 했다.
13. **pkm 시간대**는 표(`data/casual-tree-v2.json` 의 `times`)에 넣었다 — 원소 · 삼국지는 원래 `lib/prompt-spec.js` 에 있다.
14. **데니어 표본 문턱**(원소 `tests/casual-plan.cjs` 15 → 5): 고르는 무게가 바뀌어 표본 묶음의 옷이 달라졌다. 비율 조건은 그대로.
15. **game · book · myth 는 안 고쳤다.** 같은 모듈 · 검사기를 쓰지만 이번 일 밖이다(`docs/CASUAL_TREE_PORT.md`).

### 확인

- 표 검사 `tools/casual-tree-v2.py check` — 원소 추천 55 · 자세 20 · 손 34 · 소품 42 · 동작 82, 삼국지 55 · 20 · 34 · 51 · 91, pkm 60 · 20 · 35 · 120 · 163, 셋 다 통과.
- 문제였던 기록 장면을 새 코드로 다시 조립: `o-rust/mecha-casual3`(왼손 「바닥 짚기」 가 비워짐 · 「lying on her left side」), `f/mecha-casual3`(「holds … at chest height」 → 「carries … low at her side」, 화면 쪽 말 빠짐), `fe/mecha-casual4`(갱도 — 「a sudden rain shower or」 빠짐), `au/fantasy-casual1`(여관 — 「LEGS: rising onto her toes」 빠짐 · 가까운 팔 말), `ag/steampunk-casual1`(금고 — 「GAZE: she looks out of the window」 빠짐).
- 새로 짠 묶음: 원소 270컷 · 삼국지 84컷 · pkm 54컷에서 실내 소나기 · 실내 바람 · 창 없는 창밖 · 까닭 없는 까치발 · 실외 등불 0건. 원소 270컷 중 빛의 방향 줄 159 · 가까운 팔 줄 67 · 시간대 124 · 날씨 49 · 머리 94 · 카메라 눈높이 138(전 73% → 51%).
- 못 한 것: 그림을 새로 뽑아 보지 않았다(지시문 글만 확인). 생성기 화면 검사(브라우저)는 안 돌렸다 — 화면 코드는 안 바꿨고 추천 · 자세 목록이 길어졌을 뿐이다. 원소 `tests/casual-tree-v2.py` 와 pkm `tests/casual-ledger-replacement.py` 는 고치기 전에도 이 윈도우에서 안 돈다(`fork` · 경로).

---

## 9. 더한 장소 · 의상 · 상황 — 빼거나 고칠 수 있게 (2026-11-13 뒤이어)

사용자 「구도나 저런 날씨 지시말고, 장소나 의상 추가 등을 더 해 줄수는 없어?」 · 「상황연출 … 종류가 적은걸로 알아」 · 「응 5번도 해줘」.

### 먼저 본 것 — 몰려 뽑혔나

- **장소는 가짓수보다 시대 몫이 몰림을 만든다.** 묶음마다 네 시대가 한 장 이상씩 들어가는데, 원소 「쓰임의 현장」 은 10곳 · 「나라 안」 은 16곳뿐이라 기록 1,325장에서 현장 한 곳이 29 ~ 35장, 나라 안 한 곳이 33 ~ 44장씩 나왔다(「지금 현실」 60여 곳은 한 곳에 평균 7장). 삼국지도 같다(세계 안 · 역사의 자리 한 곳 30 ~ 43장). pkm 은 고르다(한 묶음 최대 9%). 그래서 **작은 시대에 장소를 더했다**.
- 의상 계열은 고르게 뽑힌다(원소 상위 홈웨어 10% · 역할극 9% · 란제리풍 9% …, 필수 갈래 몫). 가짓수를 늘리는 쪽으로 했다.
- 상황 노출은 세 공방 다 넷(젖은 옷 · 바람에 날림 · 반쯤 푼 차림 · 흘러내린 어깨끈)이었다. 필수 갈래는 ① 노출 갈래(란제리풍 · 수영복 · 역할극) ② 세계 안 갈래(원소 · 삼국지) ③ **상황 노출**(pkm 은 ①을 셋 다 한 장씩 + 코스튬 + 상황 노출) — 사용자가 말한 「상황연출」 은 ③으로 봤다. 기록: 원소 젖은 옷 27 · 어깨끈 23 · 바람 18 · 반쯤 푼 차림 4, 삼국지 68 · 50 · 54 · 22, pkm 30 · 29 · 32 · 27.

### 상황 노출 — 넷 → 아홉 (세 공방 같은 글)

옷 상태만 말하고 팔 동작은 말하지 않는다(손 줄과 부딪힌다). 「옷 갈아입는 중」 처럼 필터에 걸리기 쉬운 것은 안 넣었다.

| 열쇠 | 이름 | 지시문 글 | 붙는 조건 |
|---|---|---|---|
| `knot` | 밑단을 묶어 올림 | she has knotted the hem of her top up under her bust to keep it out of the way, baring her midriff and waist | 셔츠 · 티 · 니트 · 후드 같은 상의(이미 짧거나 원피스 · 수영복 · 란제리면 안 붙음) |
| `waist_tied` | 겉옷을 허리에 묶음 | she has slipped her outer layer off and tied it around her waist by its sleeves, leaving only the fitted inner top over her bare shoulders and arms | 재킷 · 후드 · 카디건 · 코트 · 작업복 · 점프슈트가 있는 옷 |
| `sweat` | 더위에 밴 땀 | the heat of the place has left a fine sheen on her skin, her top clinging lightly at the collar and the small of her back, a few damp strands at her temples; the fabric stays opaque | 더운 곳만 — 목욕 · 운동 묶음, 또는 장소 글에 용광로 · 가마 · 사우나 · 부엌 · 온실 · 사막 · 체육관 … |
| `sheer_light` | 역광에 비친 실루엣 | strong light from behind passes through the thin outer fabric, so the outline of her figure shows as a soft silhouette inside it; the inner layer stays fully opaque | 창이나 하늘이 있는 곳 · 밤 고정 장소 아님 · 드레스 · 셔츠 · 로브 · 린넨 같은 얇은 겉옷(가죽 · 데님 · 수영복 아님). 계획기가 빛을 역광으로 맞추고 밤 시간대를 뗀다 |
| `slit` | 움직임에 벌어진 트임 | the slit or wrap of her skirt has fallen open along one thigh with her movement, baring that leg up to the hip line; the fabric stays in place | 트임 · 랩 · 치파오 · 기모노 · 사롱 · 로브가 있는 옷 · 걷기 · 한 발 올려 서기 · 앉기 · 무릎 꿇기 · 다리가 보이는 컷(3/4 · 전신 · 환경) |

있던 넷 가운데 **바람에 날림은 실내가 아닌 곳만**, **젖은 옷은 실내면 물 튐 글**(8절). 젖은 옷은 거의 모든 옷에 맞아 늘 후보라 가장 많이 나왔다 — 원소 · 삼국지 계획기는 다른 후보가 있으면 열에 넷만 남긴다(pkm 은 원래 최근에 덜 쓴 것부터). 자유 설계 칸의 「우리 것 말고」 목록에도 다섯을 더했다. 조건은 모듈 `situOk`, 글은 공방마다 `lib/prompt-spec.js` 의 상황 표.
새 묶음 시범(상황 컷만): 원소 54컷 — 어깨끈 20 · 역광 10 · 반쯤 푼 차림 5 · 젖은 옷 5 · 땀 5 · 바람 4 · 트임 4 · 밑단 1.

### 장소

**원소** — 27곳(표의 장소 159)

| 열쇠 | 이름 | 시대 · 묶음 | 지시문 글 | 특징 |
|---|---|---|---|---|
| `repair_kiosk` | 수리 가게 작업대 | 지금 현실 · 거리·도시 | a small repair kiosk with a cluttered workbench, a low stool, tools hanging on the wall and an open shutter onto the street | 스툴 · 높은 선반 · 실내 · 창 · 문간 |
| `maintenance_shed` | 정비 창고 | 지금 현실 · 작업실·공방 | a maintenance shed with a long workbench, tool racks overhead and its door open onto the yard | 스툴 · 높은 선반 · 실내 · 문간 · 창 |
| `pool_gear_room` | 수영 클럽 장비실 | 지금 현실 · 물가 | the equipment room of a swimming club — a slatted bench, racks of kickboards and floats, tiled walls and a high window | 스툴 · 높은 선반 · 실내 · 창 |
| `drying_terrace` | 옥상 빨래 건조대 | 지금 현실 · 집 | a rooftop drying terrace with laundry lines overhead, a low stool, a parapet and the city beyond | 스툴 · 높은 선반 · 하늘 |
| `museum_workshop` | 개관 전 전시실 체험대 | 지금 현실 · 거리·도시 | a museum hands-on workshop table before opening, glass display cases, stools and tall windows | 스툴 · 실내 · 창 |
| `stair_landing` | 계단참 | 지금 현실 · 거리·도시 | a stairwell landing with a tall window, a handrail and worn stone steps | 계단 · 실내 · 창 |
| `home_closet` | 드레스룸 | 지금 현실 · 집 | a walk-in closet with open shelves, hanging rails, a full-length mirror and a low stool | 스툴 · 높은 선반 · 실내 |
| `home_veranda` | 볕 드는 베란다 | 지금 현실 · 집 | a sunny enclosed veranda with drying racks overhead, floor cushions and a sliding glass door | 스툴 · 높은 선반 · 문간 · 실내 · 창 |
| `street_bookstall` | 헌책 노점 | 지금 현실 · 거리·도시 | a second-hand book stall under an awning on a quiet street, crates of books on trestle tables and a folding stool | 스툴 · 높은 선반 · 하늘 |
| `street_bus_stop` | 버스 정류장 | 지금 현실 · 거리·도시 | a bus shelter on a quiet street, a narrow bench, a glass side panel and the road beyond | 스툴 · 하늘 |
| `street_bike_path` | 강변 자전거 길 | 지금 현실 · 여행지 | a riverside cycle path with a parked bicycle, a low stone wall and reeds along the water | 하늘 |
| `water_indoor_pool` | 실내 수영장 | 지금 현실 · 물가 | an indoor lap pool with lane ropes, a tiled deck, a starting block and tall windows | 실내 · 창 |
| `site_shipyard` | 조선소 선대 | 지금 현실 · 쓰임의 현장 · 원소의 현장 | a shipyard slipway beside a half-built steel hull, scaffolding, cranes and coiled cables under an open sky | 계단 · 하늘 |
| `site_dam` | 댐 위 통로 | 지금 현실 · 쓰임의 현장 · 원소의 현장 | the crest walkway of a hydroelectric dam, a steel railing, spillway gates and a wide reservoir below | 하늘 |
| `site_pharmacy` | 약국 조제실 | 지금 현실 · 쓰임의 현장 · 원소의 현장 | a pharmacy dispensing room with a long wooden counter, drawers of unlabelled glass jars, a brass scale and tall shelves | 스툴 · 높은 선반 · 실내 · 창 |
| `site_jeweler` | 보석 세공대 | 지금 현실 · 쓰임의 현장 · 원소의 현장 | a jeweller's bench with a loupe lamp, trays of cut stones and fine tools, a shop window behind | 스툴 · 실내 · 창 |
| `site_windfarm` | 풍력 단지 언덕 | 지금 현실 · 쓰임의 현장 · 원소의 현장 | a hillside wind farm, white turbine towers, a service ladder and tall grass moving in the wind | 계단 · 하늘 |
| `site_darkroom` | 사진 암실 | 지금 현실 · 쓰임의 현장 · 원소의 현장 | a photographic darkroom under red safelight, trays of solution on a wet bench and prints clipped to a line overhead | 스툴 · 높은 선반 · 실내 · 시간 고정 |
| `site_brewery` | 양조장 | 지금 현실 · 쓰임의 현장 · 원소의 현장 | a brewery hall of copper kettles, steel tanks, hoses and a mezzanine stair | 계단 · 실내 |
| `site_quarry` | 대리석 채석장 | 지금 현실 · 쓰임의 현장 · 원소의 현장 | a marble quarry of stepped white terraces, cut blocks and a still green pool at the bottom | 계단 · 하늘 |
| `site_perfumery` | 조향실 | 지금 현실 · 쓰임의 현장 · 원소의 현장 | a perfumer's desk with tiers of small glass bottles, paper blotter strips and a window onto a herb garden | 스툴 · 높은 선반 · 실내 · 창 |
| `nation_workshop` | 나라의 공방 | 나라 안 · 나라 안 | a craftsman's workshop of her element's kingdom, a heavy workbench, hanging tools and an open door | 스툴 · 높은 선반 · 문간 · 실내 · 창 |
| `nation_stairs` | 나라의 돌계단 | 나라 안 · 나라 안 | a long outdoor stairway climbing through a town of her element's kingdom, lamps along the steps and rooftops below | 계단 · 하늘 |
| `nation_laundry` | 나라의 빨래터 | 나라 안 · 나라 안 | a washing place by a water channel of her element's kingdom, stone basins, drying lines overhead and wet flagstones | 높은 선반 · 하늘 |
| `nation_balcony` | 나라의 발코니 | 나라 안 · 나라 안 | a balcony of her own house in a town of her element's kingdom, a balustrade, a small table and the street below | 하늘 |
| `nation_platform` | 나라의 정거장 | 나라 안 · 나라 안 | a small station or dock platform of her element's kingdom, benches, a signal post and a waiting carriage | 스툴 · 하늘 |
| `nation_greenhouse` | 나라의 온실 | 나라 안 · 나라 안 | a glass conservatory of her element's kingdom, raised planting beds, a potting bench and hanging baskets | 스툴 · 높은 선반 · 실내 · 창 |

**삼국지** — 22곳(표의 장소 163)

| 열쇠 | 이름 | 시대 · 묶음 | 지시문 글 | 특징 |
|---|---|---|---|---|
| `repair_kiosk` | 수리 가게 작업대 | 지금 현실 · 거리·도시 | a small repair kiosk with a cluttered workbench, a low stool, tools hanging on the wall and an open shutter onto the street | 스툴 · 높은 선반 · 실내 · 창 · 문간 |
| `maintenance_shed` | 정비 창고 | 지금 현실 · 작업실·공방 | a maintenance shed with a long workbench, tool racks overhead and its door open onto the yard | 스툴 · 높은 선반 · 실내 · 문간 · 창 |
| `pool_gear_room` | 수영 클럽 장비실 | 지금 현실 · 물가 | the equipment room of a swimming club — a slatted bench, racks of kickboards and floats, tiled walls and a high window | 스툴 · 높은 선반 · 실내 · 창 |
| `drying_terrace` | 옥상 빨래 건조대 | 지금 현실 · 집 | a rooftop drying terrace with laundry lines overhead, a low stool, a parapet and the city beyond | 스툴 · 높은 선반 · 하늘 |
| `museum_workshop` | 개관 전 전시실 체험대 | 지금 현실 · 거리·도시 | a museum hands-on workshop table before opening, glass display cases, stools and tall windows | 스툴 · 실내 · 창 |
| `stair_landing` | 계단참 | 지금 현실 · 거리·도시 | a stairwell landing with a tall window, a handrail and worn stone steps | 계단 · 실내 · 창 |
| `home_closet` | 드레스룸 | 지금 현실 · 집 | a walk-in closet with open shelves, hanging rails, a full-length mirror and a low stool | 스툴 · 높은 선반 · 실내 |
| `home_veranda` | 볕 드는 베란다 | 지금 현실 · 집 | a sunny enclosed veranda with drying racks overhead, floor cushions and a sliding glass door | 스툴 · 높은 선반 · 문간 · 실내 · 창 |
| `street_bookstall` | 헌책 노점 | 지금 현실 · 거리·도시 | a second-hand book stall under an awning on a quiet street, crates of books on trestle tables and a folding stool | 스툴 · 높은 선반 · 하늘 |
| `street_bus_stop` | 버스 정류장 | 지금 현실 · 거리·도시 | a bus shelter on a quiet street, a narrow bench, a glass side panel and the road beyond | 스툴 · 하늘 |
| `street_bike_path` | 강변 자전거 길 | 지금 현실 · 여행지 | a riverside cycle path with a parked bicycle, a low stone wall and reeds along the water | 하늘 |
| `water_indoor_pool` | 실내 수영장 | 지금 현실 · 물가 | an indoor lap pool with lane ropes, a tiled deck, a starting block and tall windows | 실내 · 창 |
| `nation_workshop` | 세계의 공방 | 세계 안 · 세계 안 | a craftsman's workshop of her world, a heavy workbench, hanging tools and an open door<br>세계별: 대장간 옆 공방 / 길드 공방 / 정비 격납고 작업대 | 스툴 · 높은 선반 · 문간 · 실내 · 창 |
| `nation_stairs` | 세계의 돌계단 | 세계 안 · 세계 안 | a long outdoor stairway climbing through a town of her world, lamps along the steps and rooftops below<br>세계별: 성벽 돌계단 / 성곽 계단 / 승강 계단 | 계단 · 하늘 |
| `nation_laundry` | 세계의 빨래터 | 세계 안 · 세계 안 | a washing place by a water channel of her world, stone basins, drying lines overhead and wet flagstones<br>세계별: 냇가 빨래터 / 수로 빨래터 / 함내 세탁실 | 높은 선반 · 하늘 |
| `nation_balcony` | 세계의 발코니 | 세계 안 · 세계 안 | a balcony of her own house in a town of her world, a balustrade, a small table and the street below<br>세계별: 누각 난간 / 석조 발코니 / 관측 발코니 | 하늘 |
| `nation_platform` | 세계의 정거장 | 세계 안 · 세계 안 | a small station or dock platform of her world, benches, a signal post and a waiting carriage<br>세계별: 역참 마당 / 마차 정거장 / 궤도 승강장 | 스툴 · 하늘 |
| `heritage_inkshop` | 문방사우 가게 | 지금 현실 · 역사의 자리 · 역사의 자리 | an old brush-and-ink shop in a heritage quarter, racks of hanging brushes, ink sticks and rolls of paper, a worn wooden counter | 스툴 · 높은 선반 · 실내 · 창 |
| `heritage_boat` | 장강 유람 목선 | 지금 현실 · 역사의 자리 · 역사의 자리 | the open deck of a wooden sightseeing boat on the Yangtze, a low rail, benches and cliffs sliding past | 하늘 |
| `heritage_gate_stairs` | 옛 성문 누각 계단 | 지금 현실 · 역사의 자리 · 역사의 자리 | the stone stairway up to an old city gate tower, red lanterns under the eaves and the town roofs below | 계단 · 문간 · 하늘 |
| `heritage_tea_terrace` | 촉 땅 차밭 | 지금 현실 · 역사의 자리 · 역사의 자리 | terraced tea fields on a misty Sichuan hillside, narrow stone steps and a bamboo rest hut | 계단 · 스툴 · 하늘 |
| `heritage_archery` | 전통 활터 | 지금 현실 · 역사의 자리 · 역사의 자리 | a traditional archery ground beside a temple wall, straw targets, a bow rack and a shaded bench | 스툴 · 높은 선반 · 하늘 |

**pkm** — 17곳(표의 장소 178)

| 열쇠 | 이름 | 시대 · 묶음 | 지시문 글 | 특징 |
|---|---|---|---|---|
| `repair_kiosk` | 수리 가게 작업대 | 지금 현실 · 거리·도시 | a small repair kiosk with a cluttered workbench, a low stool, tools hanging on the wall and an open shutter onto the street | 스툴 · 높은 선반 · 실내 · 창 · 문간 |
| `maintenance_shed` | 정비 창고 | 지금 현실 · 화실·공방 | a maintenance shed with a long workbench, tool racks overhead and its door open onto the yard | 스툴 · 높은 선반 · 실내 · 문간 · 창 |
| `pool_gear_room` | 수영 클럽 장비실 | 지금 현실 · 물가 | the equipment room of a swimming club — a slatted bench, racks of kickboards and floats, tiled walls and a high window | 스툴 · 높은 선반 · 실내 · 창 |
| `drying_terrace` | 옥상 빨래 건조대 | 지금 현실 · 집 | a rooftop drying terrace with laundry lines overhead, a low stool, a parapet and the city beyond | 스툴 · 높은 선반 · 하늘 |
| `museum_workshop` | 개관 전 전시실 체험대 | 지금 현실 · 거리·도시 | a museum hands-on workshop table before opening, glass display cases, stools and tall windows | 스툴 · 실내 · 창 |
| `stair_landing` | 계단참 | 지금 현실 · 거리·도시 | a stairwell landing with a tall window, a handrail and worn stone steps | 계단 · 실내 · 창 |
| `home_closet` | 드레스룸 | 지금 현실 · 집 | a walk-in closet with open shelves, hanging rails, a full-length mirror and a low stool | 스툴 · 높은 선반 · 실내 |
| `home_veranda` | 볕 드는 베란다 | 지금 현실 · 집 | a sunny enclosed veranda with drying racks overhead, floor cushions and a sliding glass door | 스툴 · 높은 선반 · 문간 · 실내 · 창 |
| `street_bookstall` | 헌책 노점 | 지금 현실 · 거리·도시 | a second-hand book stall under an awning on a quiet street, crates of books on trestle tables and a folding stool | 스툴 · 높은 선반 · 하늘 |
| `street_bus_stop` | 버스 정류장 | 지금 현실 · 거리·도시 | a bus shelter on a quiet street, a narrow bench, a glass side panel and the road beyond | 스툴 · 하늘 |
| `street_bike_path` | 강변 자전거 길 | 지금 현실 · 여행지 | a riverside cycle path with a parked bicycle, a low stone wall and reeds along the water | 하늘 |
| `water_indoor_pool` | 실내 수영장 | 지금 현실 · 물가 | an indoor lap pool with lane ropes, a tiled deck, a starting block and tall windows | 실내 · 창 |
| `pw_workshop` | 포켓몬 세계 공방 | 포켓몬 세계 안 · 포켓몬 세계 | a craftsman's workshop of a Pokémon-world town, a heavy workbench, hanging tools and an open door | 스툴 · 높은 선반 · 문간 · 실내 · 창 |
| `pw_stairs` | 포켓몬 세계 돌계단 | 포켓몬 세계 안 · 포켓몬 세계 | a long outdoor stairway climbing through a town of a Pokémon-world town, lamps along the steps and rooftops below | 계단 · 하늘 |
| `pw_laundry` | 포켓몬 세계 빨래터 | 포켓몬 세계 안 · 포켓몬 세계 | a washing place by a water channel of a Pokémon-world town, stone basins, drying lines overhead and wet flagstones | 높은 선반 · 하늘 |
| `pw_balcony` | 포켓몬 세계 발코니 | 포켓몬 세계 안 · 포켓몬 세계 | a balcony of her own house in a town of a Pokémon-world town, a balustrade, a small table and the street below | 하늘 |
| `pw_platform` | 포켓몬 세계 정거장 | 포켓몬 세계 안 · 포켓몬 세계 | a small station or dock platform of a Pokémon-world town, benches, a signal post and a waiting carriage | 스툴 · 하늘 |

삼국지 세계 안 다섯 곳은 세계마다 글이 따로 있다(삼국시대 · 판타지 · 메카 — 표의 `worlds`). 앞의 여섯(수리 가게 작업대 ~ 계단참)은 8절에서 넣은 것.

### 의상 계열

**세 공방 — `resort` 휴양지 차림**(a resort look — light holiday clothes for sun and sea air, worn loose over bare skin). 원소 시대: 지금 현실 · 나라 안 · 무대·환상

| 열쇠 | 이름 | 지시문 글 |
|---|---|---|
| `kaftan_open` | 열어 입은 카프탄 | a long printed kaftan worn open over a bandeau top and tailored shorts, flat sandals |
| `sarong_set` | 사롱 세트 | a knotted sarong skirt with a matching halter crop top and a shell anklet |
| `linen_shirt_shorts` | 린넨 셔츠와 반바지 | an oversized linen shirt half-buttoned over a bralette top with linen shorts |
| `crochet_set` | 크로셰 투피스 | a fully lined crochet two-piece — a short-sleeved crochet crop top and a matching mini skirt |
| `sundress_backless` | 등 파인 선드레스 | a backless halter sundress with a short flared hem and espadrilles |
| `palazzo_bandeau` | 와이드 팬츠와 밴도 | wide-leg palazzo trousers with a bandeau top and a wide-brimmed straw hat |
| `romper_wrap` | 랩 점프슈트(짧은) | a wrap-front holiday romper with a deep V neckline and a tie belt |
| `aloha_knot` | 묶어 입은 알로하 셔츠 | a tropical-print shirt knotted at the waist over a bikini-style top with denim cut-offs |

**원소 · 삼국지 — `workwear` 작업복·현장 차림**(a workwear look — practical work clothes worn fitted and short, sleeves rolled, one layer opened or tied). 원소 시대: 지금 현실 · 쓰임의 현장 · 나라 안

| 열쇠 | 이름 | 지시문 글 |
|---|---|---|
| `coverall_tied` | 허리에 묶은 작업복 | a mechanic's coverall with its top half peeled down and the sleeves tied at the waist over a fitted cropped tank top, work boots |
| `dungaree_bandeau` | 짧은 멜빵 데님 | short denim dungarees over a bandeau top, one strap unhooked, canvas sneakers |
| `utility_vest_shorts` | 유틸리티 조끼와 카고 반바지 | a multi-pocket utility vest worn closed over bare shoulders with high-waisted cargo shorts and ankle boots |
| `apron_knit_dress` | 공방 앞치마와 니트 원피스 | a canvas workshop apron over a fitted ribbed mini dress, sleeves pushed up |
| `lab_coat_crop` | 짧은 실험 가운 | a short white lab coat worn open over a cropped knit top and a pencil mini skirt |
| `gardener_set` | 정원사 차림 | a gardener's look — a knotted linen shirt, high-waisted shorts, a tool belt and rubber boots |
| `leather_apron_top` | 가죽 앞치마 | a leather work apron over a sleeveless fitted top and slim work trousers, gauntlet gloves tucked in the belt |
| `painter_dungaree` | 페인트 묻은 멜빵바지 | paint-flecked white painter's dungarees with one strap down over a cropped tee |

**삼국지** — `resort` 같은 여덟 벌. 시대: 지금 현실 · 세계 안 · 무대·환상

**삼국지** — `workwear` 같은 여덟 벌. 시대: 지금 현실 · 역사의 자리 · 세계 안

**pkm** — `resort` 같은 여덟 벌. 시대: 지금 현실 · 포켓몬 세계 안 · 무대·환상

pkm 에는 `workwear` 를 안 넣었다 — 「일하는 차림」(`work`, 15벌)이 이미 있다.

**조건**: 어색한 조합 표에 세 줄을 더했다 — 휴양지 차림으로 현장 · 운동 · 격식 자리 · 작업 자리, 작업복으로 목욕 · 물가 · 격식 자리 · 밤 문화, 새 작업 자리 · 길가에 수영복 · 목욕 차림 · 란제리풍. 어색한 조합은 원래 표시(⚠)만 하고 묶음마다 한 장까지 됐는데, 원소 · 삼국지 계획기가 이제 **어색한 조합인 계열을 무게 0.15 로 덜 고른다**(pkm 은 원래 어색하지 않은 쪽을 먼저 고른다). 막지는 않았다 — 「장소 · 의상 제한을 푼」 원래 뜻을 지키려고.
각 저장소의 노출 규칙은 그대로다(피부 노출 bold · 가슴과 골반은 덮는다 · 젖어도 불투명). 새 옷은 있던 옷들의 수위에 맞춰 썼다.

### 다섯째(18번) — 자유 설계 칸

1. 머리글 끝에 한 문장: 「In your pose, give each hand one job only and say plainly where each arm goes; avoid poses where it is unclear which shoulder an arm comes from — an arm behind her back, behind her head or pinned under her body — and never state where a foot sits under water.」 (원소 · 삼국지 `FREE_DESIGN.head`, pkm `FREE_SCENE.head`)
2. 굳은 장면 피하기: 「Do not make it another small repair, adjusting, measuring or sorting task at a workbench, repair stall, equipment room or locker room — those scenes are already in our own list; choose another kind of everyday moment (rest, play, a meal, travel, weather, getting ready, simply being in the place).」 (원소 · 삼국지는 머리글 끝, pkm 은 「최근 작업 피하기」 줄 끝). 최근 장면 목록은 원소 · 삼국지가 원래 넘기고 있다(`Recent scenes to avoid` — 그림 저장소 기록의 최근 여덟 + 같은 묶음), pkm 은 묶음의 다른 일상컷 지시문 파일을 보라고 한다 — 그대로 뒀다.
3. 검수 기록의 몸 이상 칸: 원소 · 삼국지 `docs/IMAGE_AUTOMATION.md` 의 기록 틀에 `"anatomy": "ok"`(걸리면 `["arm", "hand", "foot", "leg"]` 가운데), pkm `IMAGE_RULES.md` 의 `anatomy` 안내에 `anatomy.issue`(같은 낱말). 안내 문서만 고쳤다 — 이미 쓴 기록 · 기록을 읽는 도구는 그대로다.

### 이번에 스스로 정한 것

1. 새 장소는 버전2 표의 `extra_places` 에 넣었다(버전1 표는 그대로). 세계 안 새 장소는 「세계 안 필수 갈래」 장소 목록에 안 넣었다 — 필수 컷은 있던 열두 곳에서 나오고, 새 곳은 나머지 컷에서 나온다.
2. 원소 현장 아홉 곳은 원소를 가리지 않는 일반 현장이다(그 원소와 맞는지는 안 본다 — 있던 열 곳도 그렇다).
3. 「땀」 상황의 더운 곳은 장소 묶음 + 장소 글 낱말로 가렸다. 표에 `hot` 칸을 따로 두지 않았다.
4. pkm 의 옛(버전1) 계획 길(`--v1`)은 상황의 장소 조건을 안 본다 — 버전1 엔 자세 · 장소 특징 칸이 없다.
5. pkm `tests/casual-plan-v2.cjs` 의 「피할 값」 시험은 씨앗을 바꿔 다시 하게 고쳤다 — 전신 프레이밍을 통째로 피하는 계획은 고치기 전에도 60번 중 12번 「맞는 구도 없음」 이었고(지금 17번), 도구는 원래 씨앗을 바꿔 다시 정한다.

---

## 10. 안 어울리는 조합 막기 · 현장 ↔ 땅 · 하는 일 갈래의 세계별 판 (2026-11-13 뒤이어)

사용자 「갱도에서 수영복을 입고 누워있는 다거나 그런거」 · 「현장 장소 땅에 묶는 것도 같이 넣어줘 … 너무 안어울렸어서」 · 「자동차를 운전한다거나 세차를 한다거나, 버스나 지하철을 기다리거나 타는거, 자전거나 바이크를 타는거」 · 「마차나 말을 타거나 손질하고 메카쪽은 우주선을 몬다거나 … 야영을 하거나 각 세계의 식당에서 식사를 하거나, 훈련을 한다거나」 · 「스팀펑크 하면 떠오르는 탈거나 오토메일 정비소」.

### 10-1. 장소 종류와 누울 면 — 막은 규칙

장소마다 종류 하나(받침 낱말 `k_…`)와 「눕거나 바닥에 앉을 만한 면」(`soft`)을 붙였다. 예전처럼 장소마다 의상 목록을 잠그지 않고, 종류로만 느슨하게 막는다. 표 `outfit_rules` · 자세 표의 `needs`, 모듈 `why` 가 본다.

| 막은 것 | 규칙 | 풀려면 |
|---|---|---|
| 수영복 | 작업 현장 · 공공 실내 · 거리 · 탈것 안에서 안 된다(물가 · 사적 실내 · 자연 · 무대는 된다) | `outfit_rules.swimwear.not_has` |
| 란제리풍 · 목욕 차림 | 작업 현장 · 공공 실내 · 거리 · 탈것 · 야외 자연에서 안 된다 | `outfit_rules.lingerie` · `.bath` |
| 홈웨어 | 작업 현장 · 공공 실내 · 거리 · 탈것 안에서 안 된다(자연 — 야영지 · 정원은 된다) | `outfit_rules.homewear` |
| 저녁 드레스 · 휴양지 차림 | 작업 현장에서 안 된다 | `.evening` · `.resort` |
| 웨딩 | 작업 현장 · 물가에서 안 된다 | `.bridal` |
| 작업복(원소 · 삼국지) | 물가 · 목욕에서 안 된다 | `.workwear` |
| 옆으로 눕기 · 엎드리기 · 바닥에 앉기 | 누울 면이 있는 곳만 — 침대 · 소파 · 선베드가 있거나, 사적 실내 · 자연 · 물가 · 무대의 바닥. 작업 현장 · 가게 · 거리 · 공공 실내에선 서기 · 걸터앉기 · 무릎 꿇기 · 한쪽 무릎 · 쪼그려 앉기 | 자세 표 `needs` · 장소의 `soft` |

「밤 문화」(바 · 클럽 · 노래방)는 차려입는 자리로 보고 무대 종류에 넣었다(란제리풍 · 수영복이 된다 — 어색한 조합 표시는 그대로). 그 밖의 계열(평상복 · 운동복 · 전통 · 역할극 · 서브컬처 · 코스튬 · 레트로 · 화보 · 모험가 · 드레이프 …)은 어디든 된다.

**기록에서 얼마나 나왔나(새 규칙으로 옛 기록을 세면)**

| 공방 | 버전2 기록 | 의상 ↔ 장소 종류가 안 맞는 컷 | 누울 면 없는 곳에서 눕기 · 엎드리기 · 바닥에 앉기 | 많이 나온 짝 |
|---|---|---|---|---|
| 원소 | 1,316 | 285(22%) | 72(5%) | 수영복 × 작업 현장 33 · 란제리풍 × 작업 현장 29 · 저녁 드레스 × 작업 현장 29 · 란제리풍 × 공공 실내 30 |
| 삼국지 | 2,095 | 410(20%) | 96(5%) | 홈웨어 × 거리 65 · 란제리풍 × 공공 실내 62 · 수영복 × 공공 실내 54 · 홈웨어 × 공공 실내 49 |
| pkm | 1,928 | 373(19%) | 55(3%) | 수영복 × 공공 실내 · 란제리풍 × 공공 실내 · 란제리풍 × 작업 현장 33 · 수영복 × 작업 현장 23 |

예: 조폐소 금고에서 란제리풍, 정유소에서 홈웨어, 화실에서 수영복, 포켓몬센터 케어실에서 수영복. 새로 짠 묶음에선 0건이다(트리가 막는다).

**조합 가능 수(장소 × 의상 계열)**: 원소 전 2,044(장소 132) → 후 2,395(장소 172 — 조건이 없었다면 2,940), 삼국지 2,181 → 2,459(조건 없으면 2,937), pkm 2,606 → 2,666(조건 없으면 3,185). 장소 · 계열을 더한 만큼이 조건으로 줄어든 것을 메웠다. 눕기 · 엎드리기가 되는 장소는 원소 75 → 55 · 삼국지 84 → 58 · pkm 87 → 66곳.

장소 종류 수(원소 172곳): 사적 실내 20 · 공공 실내 38 · 작업 현장 33 · 물가 · 목욕 23 · 야외 자연 17 · 거리 17 · 무대 · 환상 · 밤 문화 16 · 탈것 8 · 누울 면 55.

**세계 안 필수 갈래에 닿는 것**: 「세계 안에서 홈웨어 · 란제리풍 · 목욕 차림 · 수영복」 컷의 장소 열두 곳 가운데 다리 · 사원 · 나루 · 여관 같은 거리 · 공공 실내는 이제 그 네 계열을 못 받는다 — 필수 컷은 방 · 목욕탕 · 지붕 · 서재 · 부엌 · 야영지 · 정원 · 숲길에서 나온다. 2026-11-09 에 일부러 넓힌 목록이라, 되돌리려면 그 장소들의 종류를 `k_private` 로 바꾸거나 규칙을 풀면 된다.

### 10-2. 원소 — 쓰임의 현장 ↔ 땅

나라의 갈래가 땅을 정하고(표 `lands_of` — `lib/walk-core.js` `LAND_OF` 와 같은 표), 현장은 그 땅의 나라에서만 뽑힌다(표 `place_lands`). 원소를 더해도 손댈 것이 없다. 적히지 않은 장소(화학 실험실 · 일반 장소)는 어디서나.

| 현장 | 땅 |
|---|---|
| 염전 | 소금(salt) |
| 제철소 용광로 | 쇠(metal) |
| 광산 갱도 | 쇠(metal) · 깊은 곳(deep) |
| 조폐소·금고 | 쇠(metal) |
| 천문대 | 하늘(sky) · 깊은 곳(deep) |
| 수소 충전소 | 숨(breath) · 하늘(sky) |
| 정유소·탱크 | 숨(breath) |
| 유리·도자기 공방 | 결정(crystal) |
| 발전소 제어실 | 깊은 곳(deep) · 결정(crystal) |
| 조선소 선대 | 쇠(metal) |
| 댐 위 통로 | 깊은 곳(deep) · 소금(salt) |
| 약국 조제실 | 소금(salt) · 숨(breath) |
| 보석 세공대 | 결정(crystal) · 쇠(metal) |
| 풍력 단지 언덕 | 숨(breath) · 하늘(sky) |
| 사진 암실 | 쇠(metal) · 소금(salt) |
| 양조장 | 숨(breath) |
| 대리석 채석장 | 소금(salt) · 결정(crystal) |
| 조향실 | 숨(breath) |
| 네온 사인 공방 | 하늘(sky) |
| 화학 실험실 | 제한 없음 |

땅마다 현장 수(실험실 포함): 쇠(metal) 7 · 숨(breath) 7 · 소금(salt) 6 · 결정(crystal) 5 · 하늘(sky) 5 · 깊은 곳(deep) 5. 초안에서 바꾼 것 — 광산은 쇠 + 깊은 곳(우라늄 · 희토류도 캔다), 천문대는 하늘 + 깊은 곳, 발전소 제어실은 깊은 곳 + 결정(반도체), 수소 충전소는 숨 + 하늘(헬륨 · 풍선 기체). 하늘 땅의 현장이 모자라 「네온 사인 공방」 을 더했다. 새 현장 아홉 곳도 같은 표에 있다.
확인: 철(쇠)은 용광로 · 광산 · 조폐소 · 조선소 · 암실, 헬륨(하늘)은 천문대 · 풍력 단지 · 네온 공방 · 실험실만 나왔다(12카드 36묶음). 현장에 딸린 소품은 장소를 따라간다(소품의 장소 목록).

### 10-3. 하는 일 갈래와 세계별 판

하는 일은 여전히 **자세 추천**이다. 추천마다 갈래(`act`)를 달았고(표 `acts` 열 가지 — 이동 · 탈것 / 야영 / 손보기 · 쓰기 / 집안일 · 정리 / 채비 · 매무새 / 살피기 · 바라보기 / 걷기 / 쉬기 / 먹고 마시기 / 카메라용 몸짓), 원소 · 삼국지 계획기는 한 묶음에 같은 갈래를 두 장까지만 넣는다. 세계별 판은 **장소**가 맡는다 — 같은 추천(운전대 잡고 앉기)이 지금 현실에선 운전석, 메카에선 조종석, 스팀펑크에선 비행선 갑판에서 뜬다. 그 세계에만 있는 자리는 장소의 `worlds_only` 가 거른다.

**더한 추천 넷**

| 추천 | 갈래 | 글(조립된 줄) | 조건 |
|---|---|---|---|
| 운전대 잡고 앉기 `drive_seat` | 이동 | `POSTURE: seated on a chair.` / `BOTH HANDS: both hands rest on the wheel in front of her.` / `GAZE: she looks toward the far distance.` | 운전대 · 조타륜 · 조종간(`wheel`)이 있는 곳. 두 손 자세라 다른 손 동작 · 소품이 못 붙는다 |
| 손잡이 잡고 서기 `strap_stand` | 이동 | `RIGHT HAND: her own right hand holds the overhead strap — her near arm, on the camera side.` / 왼손 자연스럽게 | 머리 위 손잡이(`strap_rail`) — 지하철 객차 |
| 안장에 앉아 먼 곳 보기 `saddle_sit` | 이동 | `POSTURE: seated on the saddle of the parked bike, one foot down on the ground.` / `BOTH HANDS: both hands hold the handlebars in front of her.` | 자전거 · 바이크(`bike`)가 있는 곳. 이 자세는 핸들 잡기 · 자연스럽게만 받는다 |
| 불가에 앉아 손 쬐기 `fire_sit` | 야영 | `BOTH HANDS: both hands are held out, palms toward the small campfire in front of her.` | 불(`fire`)이 있는 야영지 · 누울 면 |

**더한 장소**

| 공방 | 열쇠 | 이름 | 세계 | 지시문 글 |
|---|---|---|---|---|
| 세 공방 | `car_seat` | 운전석 | now | the driver's seat of a small car parked on a quiet street, the steering wheel in front of her, the windscreen and side window bright |
| 세 공방 | `car_wash` | 셀프 세차장 | now | a self-service car wash bay, a small wet car beside her, a foam bucket, a coiled hose and puddles on the concrete |
| 세 공방 | `subway_platform` | 지하철 승강장 | now | an underground subway platform, a tiled wall, a bench, platform-edge lights and a train arriving |
| 세 공방 | `subway_car` | 지하철 객차 안 | now | the inside of a quiet subway car, bench seats along the windows, overhead straps and a grab pole |
| 세 공방 | `street_noodle_stall` | 밤 포장마차 | now | a street food stall at night under a tarp, a narrow counter with stools, steaming pots and a bare bulb |
| 원소 | `nation_tackroom` | 나라의 마구 창고 | fantasy · steampunk 만 | a tack room beside the stables of her element's kingdom — saddles on wooden racks, bridles on pegs, a workbench and an open half-door |
| 원소 | `nation_cockpit` | 나라의 조종석 | mecha 만 | the cockpit of a small starship of her element's kingdom — a pilot seat, a control yoke in front of her and a wide canopy onto space |
| 원소 | `nation_hangar` | 나라의 격납고 정비대 | mecha 만 | a hangar maintenance bay of her element's kingdom — a parked craft, a steel workbench, a rolling stool, tool racks and a gantry stair |
| 원소 | `nation_airship_deck` | 비행선 갑판 | steampunk 만 | the open deck of a brass airship of her element's kingdom, a ship's wheel at the helm, a polished rail, rigging and clouds below |
| 원소 | `nation_clockwork_shop` | 태엽 · 기계 의수 공방 | steampunk 만 | a workshop for clockwork and brass mechanical prosthetic limbs in her element's kingdom — one detached brass mechanical arm lying on the workbench, gears, springs, fine tools and a tall window |
| 원소 | `nation_steam_carriage` | 증기 기관차 객차 | steampunk 만 | a compartment of a steam train in her element's kingdom — velvet bench seats, a brass luggage rack, a small table and steam drifting past the window |
| 원소 | `nation_steam_tavern` | 증기 선술집 | steampunk 만 | a steam-heated tea room and tavern of her element's kingdom — copper pipes along the wall, a long counter with stools, a hissing brass urn |
| 원소 | `site_neon_workshop` | 네온 사인 공방 | now · site | a neon sign workshop, glass tubes glowing in many colours on the wall, a bending bench with a ribbon burner and coils of wire |
| 삼국지 | `nation_tackroom` | 세계의 마구 창고 | samguk · fantasy 만 | a tack room beside the stables of her world — saddles on wooden racks, bridles on pegs, a workbench and an open half-door |
| 삼국지 | `nation_cockpit` | 세계의 조종석 | mecha 만 | the cockpit of a small starship of her world — a pilot seat, a control yoke in front of her and a wide canopy onto space |
| 삼국지 | `nation_hangar` | 세계의 격납고 정비대 | mecha 만 | a hangar maintenance bay of her world — a parked craft, a steel workbench, a rolling stool, tool racks and a gantry stair |
| pkm | `pw_cycling_road` | 포켓몬 세계 사이클링 로드 | in_pokemon | a long cycling road bridge of the Pokémon world, a parked bicycle at the rail, sea wind and a town far below |

**더한 소품 동작**: 밥그릇(`meal_eat` — 「eats from a bowl of hot food set on the table in front of her」, 오른손 젓가락 · 숟가락 / 왼손 그릇, 탁자가 있어야 · `meal_hold`), 세차 스펀지(`car_sponge` — 「wipes the door of the car beside her with a soapy sponge」, 세워 둔 차가 있어야 · `sponge_hold`), 연습용 목검(원소 · 삼국지 — `sword_low` 옆에 내려 들기 · `sword_guard` 두 손으로 겨누기, 나라 안 · 역사 · 환상 시대만), 안장 닦는 천(원소 · 삼국지 — `saddle_oil` 「rubs the saddle resting on the rack in front of her」, 마구 창고). 손: 두 손으로 운전대 · 머리 위 손잡이 · 두 손으로 핸들 · 불에 두 손 쬐기. 자세: 안장에 앉기.
있던 자리도 같이 쓴다 — 버스 정류장 · 강변 자전거 길(이제 자전거가 있다) · 택시 뒷자리 · 침대차 · 페리 갑판 · 요트 · 해적선 · 케이블카는 「탈것」 종류, 야영지 · 여관 · 다이너 · 부엌은 밥그릇이 나온다.

**기계 의수 공방**은 작품 이름 없이 「a workshop for clockwork and brass mechanical prosthetic limbs」 로 적고, 손보는 대상을 「one detached brass mechanical arm lying on the workbench」 로 몸과 떼어 장소 글에 뒀다. 손 줄은 「작은 장치를 드라이버로 손본다」 그대로다(인물이 기계 팔을 단 것으로 읽히지 않게).

**넣지 않은 것과 까닭**
- **말 · 마차를 타거나 말을 손질하기**: 시대 줄에 「no creatures, no second character」 가 박혀 있고(원소 · 삼국지 WORLD 줄), 동물이 들어오면 다리 · 팔 수가 꼬이기 쉽다. 말 없이 되는 「마구 창고에서 안장 닦기」 와 「정거장에서 마차 기다리기」(9절의 정거장)만 넣었다. 말을 넣으려면 그 줄을 장소에 따라 푸는 일이 먼저다.
- **선외 유영**: 차림이 우주복으로 정해져 일상 의상 · 노출 규칙과 따로 정해야 한다. 조종석 · 격납고만 넣었다.
- **달리는 탈것**(자전거로 달리기 · 운전 중): 세워 둔 것에 앉는 꼴로만 넣었다 — 페달 밟는 다리 · 도는 바퀴는 사고가 잦다.

### 10-4. 캐릭터 한 명의 묶음 — 전 · 후

같은 카드 · 같은 씨앗(11)으로 고치기 전 코드와 지금 코드가 짠 묶음(장면 컷만 — 자유 설계 칸 빼고).

**원소 철(Fe · 쇠 땅) 판타지 — 전**

| # | 시대 · 장소(종류) | 의상 계열 | 자세 추천(하는 일 갈래) | 구도 · 카메라 | 빛 | 상황 |
|---|---|---|---|---|---|---|
| 1 | 지금 현실 · 호텔 방 | 란제리풍 | 까치발로 손 흔들기 | full_body · 옆모습 · 아래에서 올려다봄 |  |  |
| 2 | 나라 안 · 나라의 부엌 | 홈웨어 | 벽에 기대 머리 넘기기 | waist_up · 3/4 정면 · 눈높이 |  |  |
| 3 | 무대·환상 · 서커스 천막 | 전통 의상 | 벽에 기대 팔짱 | chest_up · 3/4 정면 · 눈높이 |  | 바람에 날림 |
| 4 | 쓰임의 현장 · 수소 충전소 | 저녁 드레스 | 브이 클로즈업 | face_close · 정면 · 아래에서 올려다봄 |  |  |
| 5 | 지금 현실 · 겨울 산장 테라스 | 운동복 | 걷다 멈춰 돌아보기 | three_quarter · 뒤 3/4 · 눈높이 |  |  |

**후**

| # | 시대 · 장소(종류) | 의상 계열 | 자세 추천(하는 일 갈래) | 구도 · 카메라 | 빛 | 상황 |
|---|---|---|---|---|---|---|
| 1 | 지금 현실 · 재즈바(무대) | 란제리풍 | 쉿 클로즈업(카메라용 몸짓) | face_close · 정면 · 눈높이 | 등불 · 위에서 떨어지는 빛 |  |
| 2 | 나라 안 · 나라의 방(사적 실내) | 홈웨어 | 소품을 빛에 대 보기(살피기 · 바라보기) | chest_up · 옆모습 · 아래에서 올려다봄 | 역광 |  |
| 3 | 무대·환상 · 얼음 궁전(무대) | 할로윈 코스튬 | 걸터앉아 두 손 짚기(쉬기) | three_quarter · 정면 · 눈높이 |  |  |
| 4 | 쓰임의 현장 · 제철소 용광로(작업 현장) | 운동복 | 멀어지며 걷기(걷기) | environmental · 뒤 · 눈높이 | 등불 · 낮고 따뜻한 빛 |  |
| 5 | 지금 현실 · 셀프 세차장(작업 현장) | 서브컬처 | 주머니에 손 넣고 소품 보기(살피기 · 바라보기) | waist_up · 3/4 정면 · 눈높이 | 아침 · 눈 | 반쯤 푼 차림 |

**삼국지 관우 삼국시대 — 전**

| # | 시대 · 장소(종류) | 의상 계열 | 자세 추천(하는 일 갈래) | 구도 · 카메라 | 빛 | 상황 |
|---|---|---|---|---|---|---|
| 1 | 지금 현실 · 댄스 무대 | 수영복 | 바닥에 앉아 먼 곳 보기 | environmental · 옆모습 · 위에서 내려다봄 |  |  |
| 2 | 세계 안 · 세계의 지붕 · 테라스 | 목욕 차림 | 엄지 척 | waist_up · 정면 · 눈높이 |  |  |
| 3 | 지금 현실 · 하맘 | 홈웨어 | 까치발로 손 흔들기 | full_body · 옆모습 · 아래에서 올려다봄 |  |  |
| 4 | 무대·환상 · 사막 오아시스 | 신화 드레이프 | 허리에 손 짝다리 | three_quarter · 3/4 정면 · 눈높이 |  | 바람에 날림 |
| 5 | 세계 안 · 세계의 방 | 운동복 | 소품을 얼굴 가까이 든 클로즈업 | face_close · 3/4 정면 · 눈높이 |  |  |
| 6 | 역사의 자리 · 삼국지 촬영 세트장 | 운동복 | 벽에 기대 팔짱 | chest_up · 3/4 정면 · 눈높이 |  |  |
| 7 | 역사의 자리 · 삼국지 촬영 세트장 | 전통 의상 | 볼에 손 클로즈업 | face_close · 3/4 정면 · 눈높이 |  |  |

**후**

| # | 시대 · 장소(종류) | 의상 계열 | 자세 추천(하는 일 갈래) | 구도 · 카메라 | 빛 | 상황 |
|---|---|---|---|---|---|---|
| 1 | 지금 현실 · 캠프장(자연) | 수영복 | 선베드에 누워 소품 들기(쉬기) | environmental · 3/4 정면 · 위에서 내려다봄 | 봄꽃 |  |
| 2 | 세계 안 · 세계의 목욕탕 · 개울(물가) | 홈웨어 | 카메라로 손 뻗기(카메라용 몸짓) | waist_up · 정면 · 아래에서 올려다봄 | 해 질 녘 · 한여름 볕 · 옆 빛 |  |
| 3 | 지금 현실 · 낙봉파 산길 사당(자연) | 역할극·직업 의상 | 엎드려 두 손으로 턱 괴기(쉬기) | full_body · 정면 · 아래에서 올려다봄 | 아침 · 안개 낀 아침 · 얼룩 그림자 |  |
| 4 | 무대·환상 · 촛불 예배당(공공 실내) | 할로윈 코스튬 | 옆으로 걸터앉아 두 손으로 손보기(손보기 · 쓰기) | three_quarter · 3/4 정면 · 낮게 — 앉은 눈높이 | 등불 | 흘러내린 어깨끈 |
| 5 | 세계 안 · 세계의 부엌(사적 실내) | 동탄룩 | 쉿 클로즈업(카메라용 몸짓) | face_close · 정면 · 눈높이 |  |  |
| 6 | 역사의 자리 · 관제묘(공공 실내) | 동탄룩 | 소품을 빛에 대 보기(살피기 · 바라보기) | chest_up · 옆모습 · 아래에서 올려다봄 | 땅거미 · 역광 |  |
| 7 | 역사의 자리 · 성도 찻집(공공 실내) | 무대·판타지 의상 | 턱 괴고 창밖(살피기 · 바라보기) | face_close · 3/4 정면 · 눈높이 |  |  |

(삼국지 6 · 7번은 자유 설계 칸이라 계획의 장면이 안 그려진다.)

읽는 법: 전에는 수소 충전소에서 저녁 드레스 · 하맘에서 홈웨어 · 댄스 무대에서 수영복처럼 종류가 안 맞는 짝이 한 묶음에 한두 장씩 있었고 빛 칸이 비어 있었다. 후에는 용광로(쇠 땅의 현장)에 운동복, 방에 홈웨어처럼 맞는 짝이고 컷마다 빛이 다르다.
원소 12카드 36묶음(씨앗 3)으로 재면 — 못 짠 묶음 0, 장면 컷 다섯 안에서 서로 다른 값이 평균 하는 일 갈래 4.1 · 장소 종류 4.3 · 카메라 2.8 · 빛 4.8 가지. 갈래 분포: 카메라용 몸짓 36 · 쉬기 32 · 살피기 31 · 손보기 25 · 채비 23 · 걷기 20 · 먹고 마시기 7 · 집안일 6 · 이동 0 · 야영 0.
**아직 아닌 것**: 카메라용 몸짓이 여전히 가장 많고(무게를 0.4 로 내렸어도 추천 여덟이 어디서나 된다), 이동 · 야영 추천은 받는 장소가 적어 이 표본에 안 나왔다. 「그 사람의 역할에 맞는 갈래 먼저」(무장은 훈련, 책사는 서재)는 안 했다 — 세계 · 땅까지만 캐릭터를 본다. 삼국지 예의 「캠프장 + 수영복」 · 「산길 사당에서 엎드리기」 처럼 자연 종류는 느슨해서 아직 어색한 짝이 남는다.

### 10-5. 다음 후보 — 일상 갈래 × 세계, 비어 있는 칸

기록에 많이 나온 것에서가 아니라 일상 갈래 목록을 놓고 지금 트리(이번에 더한 것 포함)와 견줬다. ● 있다 · ◐ 장소나 소품만 있고 「하는 일」 동작이 없다 · ○ 없다.

| 갈래 | 지금 현실 | 과거(삼국 · 판타지) | 스팀펑크 | 미래 · 메카 | pkm 세계 | 넣을 만한 것 |
|---|---|---|---|---|---|---|
| 이동 · 탈것 | ● 운전석 · 지하철 · 버스 정류장 · 자전거 · 택시 · 침대차 · 페리 | ◐ 정거장 · 마구 창고 · 유람선(삼국지) | ● 비행선 갑판 · 증기 객차 | ● 조종석 · 격납고 | ◐ 사이클링 로드 · 여행 열차 | 말 타기 · 손질(시대 줄 고친 뒤), 수레 · 나룻배 젓기, 증기 자동차 · 큰 바퀴 자전거 · 궤도 전차, 호버 바이크, 선외 유영(우주복 규칙 정한 뒤), 스쿠터 · 킥보드, 주유 · 충전, 주차장, 헬멧 쓰기, 짐 싣기, 비행기 좌석, 라이드 포켓몬(동료 규칙 안에서) |
| 식사 | ● 밥그릇 · 포장마차 · 다이너 · 카페 · 부엌 | ◐ 여관 · 부엌(세계별 글 — 삼국지) | ● 증기 선술집 | ◐ 함내 식당(삼국지 메카 부엌 글) | ● 열매 요리 · 노점 | 차 따르기는 있음. 만두 빚기 · 구이 굽기 · 국자 뜨기, 도시락 열기, 식판 들기, 길거리 꼬치, 차 의식(다도), 술잔 기울이기(삼국지 호리병은 있음) |
| 잠 · 쉼 | ● 눕기 · 엎드리기 · 선베드 · 소파 | ◐ 방 | ◐ 객차 | ○ | ◐ 방 | 이불 덮고 책 읽기, 해먹, 창가 낮잠(눈 감은 표정이 없다), 야전 침상, 침낭, 수면 캡슐 |
| 씻기 · 목욕 | ● 욕실 · 온천 · 사우나 · 하맘 · 머리 말리기 · 빗기 | ● 목욕탕 · 빨래터 | ○ | ○ | ● 온천 | 세수 · 양치(거울 앞), 발 씻기, 증기 목욕탕, 샤워 뒤 가운 |
| 일 | ● 작업대 손보기 · 반죽 · 꽃 다듬기 · 수놓기 · 노트 쓰기 | ● 공방 · 서재 · 붓글씨(삼국지) | ● 태엽 · 의수 공방 | ● 격납고 정비 | ● 직업 현장 63 동작 | 계산대 · 서빙, 배달 상자, 사무(노트북), 전신국 · 우체국, 보일러에 석탄 넣기 · 밸브 조이기, 대장간 풀무, 약 짓기 |
| 공부 · 읽기 | ● 책 · 도서관 · 스케치 | ● 서재 · 죽간(삼국지) | ◐ | ◐ | ◐ | 칠판 · 지도 앞에 서기, 시험지, 별자리판 읽기, 홀로그램 판 |
| 놀이 · 취미 | ● 기타 · 카메라 · 낚시 · 바둑(삼국지) · 보드게임(pkm) | ● 금 · 부채 | ○ | ○ | ● 오락실 | 연 날리기, 보드 · 카드 한 판, 뜨개, 악기 연습(피아노 · 피리), 화분 분갈이, 종이접기, 볼링 · 당구, 오르골 |
| 운동 · 훈련 | ● 체육관 · 코트 · 트랙 · 암벽 · 활 · 라켓 | ● 목검 · 활터 · 연무장 | ○ | ○ 시뮬레이터 | ● 연습 필드 | 스트레칭 · 요가 자세, 줄넘기, 샌드백, 창 · 봉 자세, 과녁 뽑기, 달리기 뒤 숨 고르기, 메카 시뮬레이터 좌석 |
| 장보기 | ● 시장 · 가게 · 마트 · 쇼핑백 | ● 시장 | ○ | ○ | ● 시장 · 열매 노점 | 과일 고르기, 바구니 들기, 저울에 올리기, 옷 대 보기(거울) |
| 집안일 | ● 널기 · 개기 · 닦기 · 쓸기 · 상자 올리기 · 물 주기 | ● 빨래터 | ○ | ○ | ◐ | 설거지, 다림질, 이불 털기, 창문 열기, 요리 재료 썰기(칼 — 필터 조심) |
| 돌봄 | ◐ 화분 물 주기 | ○ | ○ | ○ | ● 동료 쓰다듬기 · 먹이 주기 | 고양이 · 새 모이(동물 규칙), 아이 없이 되는 것만 — 식물 · 등불 심지 · 불씨 살피기 |
| 만남 | ◐ 손 흔들기 · 손 뻗기(카메라용) | ○ | ○ | ○ | ◐ | 한 사람 규칙이라 상대는 화면 밖 — 문 열고 맞기, 편지 읽기 · 쓰기, 전화 받기, 선물 상자 풀기 |
| 꾸미기 | ● 손거울 · 빗 · 머리 넘기기 · 안경 | ◐ 분장실(삼국지 경극) | ○ | ○ | ◐ | 귀걸이 걸기, 립스틱(입 주변 손 — 조심), 머리 묶기(두 팔 위 — 정면만), 옷매무새 거울 앞, 신발 신기 |
| 여행 | ● 공항 · 역 · 전망대 · 산장 · 케이블카 | ● 나루 · 다리 · 돌계단 | ● 비행선 | ● | ● 여행 센터 | 지도 펴 보기, 여행 가방 끌기, 사진 찍기는 있음, 기념품 고르기, 표 들고 기다리기 |
| 날씨 대응 | ● 우산(하늘) · 비 · 눈 · 바람 상황 | ◐ 기름종이 우산(삼국지) | ○ | ○ | ◐ | 처마 밑 비 피하기, 목도리 여미기, 부채질, 눈 뭉치기, 손차양 |
| 명절 · 축제 | ● 축제 거리 · 불꽃놀이 · 등불 강 · 할로윈 · 웨딩 | ● 등불 거리(삼국지) | ○ 박람회 | ○ | ● 콘테스트 | 등불 띄우기, 소원 쪽지 달기(→ 까치발의 까닭), 떡 · 만두 빚기, 폭죽 불꽃(pkm 스파클러는 있음), 가면 쓰기는 있음, 증기 박람회 구경 |

스팀펑크 칸이 가장 비었다(원소만 스팀펑크 세계가 있다): 증기 기관실, 시계탑 안, 발명가의 작업실, 전신국, 온실 박람회, 비행선 야영지, 증기선 갑판, 궤도 전차 정거장.

### 10-6. 이번에 스스로 정한 것

1. 장소 종류는 묶음 기본값 + 열쇠 이름 규칙으로 붙였다. 틀린 곳이 있을 수 있다 — 표 `places.<장소>` 의 `k_…` 하나를 바꾸면 된다.
2. 의상 조건은 「안 되는 종류」(`not_has`)로만 적었다. 더 조이려면 「되는 종류」(`needs_any`)로 바꾸면 된다(모듈은 둘 다 본다).
3. 「밤 문화」 를 무대 종류로 봤다.
4. 「하는 일」 을 새 칸으로 만들지 않고 추천의 갈래(`act`)로 뒀다 — 갈래를 더하려면 표 `acts` 에 한 줄, 추천에 `act` 를 달면 된다.
5. 세계별 판은 장소(`worlds_only`)로 — 원소 · 삼국지의 카드가 사는 세계를 계획기 · 생성기가 트리에 알려 준다. 세계를 모르고 부르면(검사기 등) 안 거른다.
6. 삼국지 새 세계 안 자리(마구 창고 · 조종석 · 격납고)는 세계별 글(`worlds`) 없이 한 글이다.
7. pkm 계획기는 의상 조건을 장소 고를 때 본다(`famsAt`). pkm 「피할 값」 시험은 프레이밍을 한 컷에서만 피하게 고쳤다 — 열 장에서 프레이밍 하나를 통째로 피하는 계획은 조건이 늘어난 뒤로 거의 못 맞춘다(보통 계획은 40번 중 40번 성공).
8. 원소 `tests/casual-plan.cjs` 의 「새 계열」 은 넷 가운데 둘 넘게, 삼국지의 「세계끼리 같은 옷」 은 자유 설계 칸을 빼고 본다. 세 공방 `tests/casual-tree-v2.cjs` 의 「어색한 조합은 표시만」 은 아직 막히지 않은 조합으로 본다.
