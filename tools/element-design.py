#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""원소 설계표 검사. game-atelier 의 tools/game-design.py 의 자리에 해당한다 — 세 층 구조에 맞춰 새로 썼다.

    python3 tools/element-design.py check     # 빈칸·열쇠 꼴·세계·가문의 원소·겹치는 가문·사실 칸

규칙(docs/ELEMENT_CONCEPT.md):
- 나라 열쇠는 elements 의 key(기호 소문자)와 같다. 가문·주민 열쇠는 소문자·숫자만(하이픈·밑줄 없음 — 카드 열쇠를 하이픈으로 잇는다).
- 나라는 persona · traits.ko(둘 이상) · traits.en · palette.en · worlds 셋(fantasy·steampunk·mecha — 각 en, mecha 는 design 도).
- 가문은 ko·en·persona·traits.en·elements(나라 자신을 포함, 전부 아는 원소)·citizens(비어 있어도 된다).
- 주민은 ko·en·object.en·worlds(비지 않고 전부 아는 세계). notes 의 세계도 아는 세계.
- 나라는 worlds.<세계>.scenes(그 세계 안 장소 변주 둘 이상 — key·ko·en) 과 hold.en(일상컷에서 손에 드는 그 원소의 물건). 가문은 hold.en, scenes 는 세계 글을 덮어썼을 때만.
- 나라는 look(face 여섯: face_shape·eyes·brows·nose·lips·eye_color + silhouette 셋: body·hair·hair_color, 값은 lib/look-spec.js VOCAB_EN 의 열쇠 — 어휘 대조는 tests/prompt-element.cjs).
  가문의 look 은 덮어쓸 것만(같은 칸 이름). 주민에겐 look 이 없다(가문 것을 물려받는다). 팔레트 색이 머리·눈 색이 된다(2026-10-30).
- 성질·세계 문장에 한국어가 섞이지 않는다(en 칸). 시각 언어 한 줄이 비어 있으면 그림이 흔들린다 — en 칸은 40자 이상.
- 가문이 여러 나라에 걸치면(elements 둘 이상) 그 나라들 모두에 같은 열쇠의 가문이 있어야 하는 것은 아니다 — 있으면 도감이 잇는다. 다만 elements 에 적힌 원소는 전부 있어야 한다.
"""
import re
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import roster  # noqa: E402

KEY = re.compile(r"^[a-z0-9]+$")
LOOK = {"face": ("face_shape", "eyes", "brows", "nose", "lips", "eye_color"), "silhouette": ("body", "hair", "hair_color")}


def check_scenes(where, scenes, need, errs):
    """세계 안 장소 변주 — 나라는 둘 이상(need), 가문은 있으면 본다. key 는 소문자 열쇠, ko 와 en(12자 이상)"""
    if scenes is None:
        if need:
            errs.append(where + " scenes 가 없다")
        return
    if not isinstance(scenes, list) or (need and len(scenes) < 2):
        errs.append(where + " scenes 는 둘 이상의 목록"); return
    seen = set()
    for r in scenes:
        k = (r or {}).get("key")
        if not k or not KEY.match(k):
            errs.append(where + " scenes 열쇠는 소문자·숫자만 — %r" % k)
        if k in seen:
            errs.append(where + " scenes 열쇠 %r 가 두 번" % k)
        seen.add(k)
        if not (r.get("ko") or "").strip():
            errs.append(where + " scenes.%s ko 가 비었다" % k)
        en_ = (r.get("en") or "").strip()
        if len(en_) < 12 or re.search(r"[가-힣]", en_):
            errs.append(where + " scenes.%s en 이 짧거나 한국어" % k)


def check_look(where, look, full, errs):
    """나라는 아홉 칸이 다 차야 하고(full), 가문은 아는 칸만 덮어쓴다. 값은 소문자 열쇠(어휘 대조는 node 검사)."""
    if not isinstance(look, dict):
        errs.append(where + " look 이 없다" if full else where + " look 은 dict"); return
    for grp, keys in LOOK.items():
        box = look.get(grp)
        if box is None:
            if full:
                errs.append("%s look.%s 가 없다" % (where, grp))
            continue
        for k, v in box.items():
            if k not in keys:
                errs.append("%s look.%s 의 %r 는 모르는 칸" % (where, grp, k))
            elif not isinstance(v, str) or not KEY.match(v.replace("_", "")):
                errs.append("%s look.%s.%s 값은 소문자 열쇠 — %r" % (where, grp, k, v))
        if full:
            for k in keys:
                if not box.get(k):
                    errs.append("%s look.%s.%s 가 비었다" % (where, grp, k))
    for k in look:
        if k not in ("face", "silhouette", "why", "worlds"):
            errs.append("%s look 의 %r 는 모르는 칸" % (where, k))
    # 세계마다 다른 사람(2026-10-30) — 나라는 세 세계 다, 머리·얼굴형·눈이 차고 세 세계가 서로 다르다. 가문은 있으면 본다
    ws = look.get("worlds")
    if ws is None:
        if full:
            errs.append(where + " look.worlds 가 없다(세계마다 머리·얼굴형·눈)")
        return
    for w, sub in ws.items():
        if w not in ("fantasy", "steampunk", "mecha"):
            errs.append("%s look.worlds 의 %r 는 아는 세계가 아니다" % (where, w)); continue
        check_look(where + " look.worlds." + w, sub, False, errs)
        if full and not ((sub.get("silhouette") or {}).get("hair") and (sub.get("face") or {}).get("face_shape") and (sub.get("face") or {}).get("eyes")):
            errs.append("%s look.worlds.%s 에 머리·얼굴형·눈이 다 있어야 한다" % (where, w))
    if full:
        sig = [((ws.get(w) or {}).get("silhouette") or {}).get("hair", "") + "/" + ((ws.get(w) or {}).get("face") or {}).get("face_shape", "") + "/" + ((ws.get(w) or {}).get("face") or {}).get("eyes", "") for w in ("fantasy", "steampunk", "mecha")]
        if len(set(sig)) < 3:
            errs.append(where + " look.worlds — 두 세계가 같은 사람(머리·얼굴형·눈): %s" % sig)


def check(doc):
    errs, warns = [], []
    v = doc.get("vocab") or {}
    worlds = v.get("worlds") or []
    if worlds != ["fantasy", "steampunk", "mecha"]:
        errs.append("vocab.worlds 는 fantasy·steampunk·mecha 셋 — %r" % (worlds,))
    els = {e["key"]: e for e in doc.get("elements") or []}
    if len(els) != 118:
        errs.append("elements 가 118 이 아니다: %d" % len(els))
    nums = sorted(e["number"] for e in els.values())
    if nums != list(range(1, 119)):
        errs.append("원소 번호가 1~118 이 아니다")
    for e in els.values():
        for k in ("symbol", "ko", "en", "category", "period", "state"):
            if e.get(k) in (None, ""):
                errs.append("원소 %s 의 %s 가 비었다" % (e["key"], k))
        if e["key"] != e["symbol"].lower():
            errs.append("원소 %s 의 key 는 기호 소문자" % e["symbol"])

    def en(where, s, least=40):
        s = (s or "").strip()
        if len(s) < least:
            errs.append("%s — 영어 문장이 짧다(%d자)" % (where, len(s)))
        if re.search(r"[가-힣]", s):
            errs.append("%s — 영어 칸에 한국어" % where)

    seen_nation = set()
    for n in doc.get("nations") or []:
        k = n.get("key")
        if k not in els:
            errs.append("나라 %r 는 아는 원소가 아니다" % k); continue
        if k in seen_nation:
            errs.append("나라 %s 가 두 번" % k)
        seen_nation.add(k)
        here = "나라 " + k
        if not (n.get("persona") or "").strip():
            errs.append(here + " persona 가 비었다")
        tr = n.get("traits") or {}
        if len(tr.get("ko") or []) < 2:
            errs.append(here + " traits.ko 는 둘 이상")
        en(here + " traits.en", tr.get("en"))
        en(here + " palette.en", (n.get("palette") or {}).get("en"), 10)
        check_look(here, n.get("look"), True, errs)
        ws = n.get("worlds") or {}
        for w in worlds:
            if w not in ws:
                errs.append(here + " worlds 에 %s 가 없다" % w); continue
            en(here + " worlds." + w, ws[w].get("en"))
            if w == "mecha":
                en(here + " worlds.mecha.design", ws[w].get("design"))
            check_scenes(here + " worlds." + w, ws[w].get("scenes"), True, errs)
        en(here + " hold.en", (n.get("hold") or {}).get("en"), 12)
        seen_f = set()
        for f in n.get("families") or []:
            fk = f.get("key")
            fhere = here + " 가문 %r" % fk
            if not fk or not KEY.match(fk):
                errs.append(fhere + " 열쇠는 소문자·숫자만")
            if fk in seen_f:
                errs.append(fhere + " 가 두 번")
            seen_f.add(fk)
            for c in ("ko", "en", "persona"):
                if not (f.get(c) or "").strip():
                    errs.append(fhere + " %s 가 비었다" % c)
            en(fhere + " traits.en", (f.get("traits") or {}).get("en"))
            if "look" in f:
                check_look(fhere, f.get("look"), False, errs)
            fe = f.get("elements") or []
            if k not in fe:
                errs.append(fhere + " elements 에 제 나라 %s 가 없다" % k)
            for x in fe:
                if x not in els:
                    errs.append(fhere + " elements 의 %r 는 아는 원소가 아니다" % x)
            for w, body in (f.get("worlds") or {}).items():
                if w not in worlds:
                    errs.append(fhere + " worlds 의 %r 는 아는 세계가 아니다" % w)
                else:
                    en(fhere + " worlds." + w, body.get("en"))
                    check_scenes(fhere + " worlds." + w, body.get("scenes"), False, errs)
            en(fhere + " hold.en", (f.get("hold") or {}).get("en"), 12)
            seen_c = set()
            for c in f.get("citizens") or []:
                ck = c.get("key")
                chere = fhere + " 주민 %r" % ck
                if not ck or not KEY.match(ck):
                    errs.append(chere + " 열쇠는 소문자·숫자만")
                if ck in seen_c:
                    errs.append(chere + " 가 두 번")
                seen_c.add(ck)
                for col in ("ko", "en"):
                    if not (c.get(col) or "").strip():
                        errs.append(chere + " %s 가 비었다" % col)
                if "look" in c:
                    errs.append(chere + " 에 look 이 있다 — 주민은 가문 것을 물려받는다")
                en(chere + " object.en", (c.get("object") or {}).get("en"), 12)
                cw = c.get("worlds") or []
                if not cw:
                    errs.append(chere + " worlds 가 비었다")
                for w in cw:
                    if w not in worlds:
                        errs.append(chere + " worlds 의 %r 는 아는 세계가 아니다" % w)
                for w, body in (c.get("notes") or {}).items():
                    if w not in worlds:
                        errs.append(chere + " notes 의 %r 는 아는 세계가 아니다" % w)
                    elif w not in cw:
                        warns.append(chere + " notes.%s 가 있는데 그 세계에 살지 않는다" % w)
                    else:
                        en(chere + " notes." + w, body.get("en"), 12)
            if not f.get("citizens"):
                warns.append(fhere + " 에 주민이 없다")
        if not n.get("families") and not els[k].get("synthetic"):
            warns.append(here + " 에 가문이 없다")
    # 겹치는 가문 — 같은 열쇠의 가문이 둘 이상의 나라에 있으면 elements 가 서로를 가리키는지
    fam_at = {}
    for n in doc.get("nations") or []:
        for f in n.get("families") or []:
            fam_at.setdefault(f["key"], []).append((n["key"], set(f.get("elements") or [])))
    for fk, where in fam_at.items():
        if len(where) > 1:
            for nk, fe in where:
                others = [o for o, _ in where if o != nk]
                for o in others:
                    if o not in fe:
                        warns.append("가문 %s — %s 나라의 elements 에 %s 가 없어 도감이 잇지 못한다" % (fk, nk, o))
    return errs, warns


def main(argv):
    if len(argv) < 2 or argv[1] != "check":
        print(__doc__); return 2
    doc = roster.design()
    errs, warns = check(doc)
    cards = roster.cards()
    tiers = {t: sum(1 for c in cards.values() if c["tier"] == t) for t in ("root", "lord", "citizen")}
    for w in warns:
        print("경고:", w)
    for e in errs:
        print("오류:", e)
    print("나라 %d · 가문주 %d · 주민 %d · 카드 %d · 경고 %d · 오류 %d" % (tiers["root"], tiers["lord"], tiers["citizen"], len(cards), len(warns), len(errs)))
    return 1 if errs else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
