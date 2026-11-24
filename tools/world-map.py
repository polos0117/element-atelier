#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""원소 월드맵 배치표 검사(2026-11-24 — 사용자 「성향 배치로 가고 배치표 먼저 짜줘」 → 「판타지 대륙 지도부터 만들어줘」).

    python3 tools/world-map.py check [표 경로]     # 기본 data/world-map.json

규칙(배치표 초안의 검사기를 옮기고 더했다):
- 대륙: 열쇠 · ko · en · position · why_ko, 층(layer)은 surface · sky · undersea · underground. 대륙마다 지역 하나 이상.
- 지역: 아는 대륙, 맞닿은 지역(adjacent)은 아는 지역이고 서로 맞닿음. 지역마다 나라 둘 이상. 지역 수 15~30 은 주의만.
- 나라: 설계표(data/element-design.json)의 나라 열쇠와 똑같은 모음(118 — 한 번씩), 아는 지역, why_ko, 이웃 2~6(겹침 · 자기 없음 · 서로 이웃 · 같은 지역이거나 맞닿은 지역).
- 동맹: 설계표에서 elements 가 둘 이상인 가문과 같은 모음, 가문 열쇠는 그 나라들에 있고 나라 모음 = 가문 elements, same_region 이 맞고, alliance_summary 수가 맞다.
- 지도 자리(map.<세계>): 세계는 설계표 세계, 그림은 backgrounds/maps/world-map_<세계>_<화풍>.webp(화풍은 style.json), 크기 3:2.
  대륙마다 상자 x · y · w · h(0~1, 그림 안) · 이름 자리 label(있으면 0~1, 상자 안), 지역마다 점 x · y(0~1).
  땅 위(surface) 대륙의 지역 점은 그 대륙 상자 안. 모르는 열쇠 · 빠진 열쇠는 오류.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAYERS = {"surface", "sky", "undersea", "underground"}
IMAGE = re.compile(r"^backgrounds/maps/world-map_([a-z]+)_([a-z0-9_]+)\.webp$")


def load(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def num01(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool) and 0 <= v <= 1


def check(W, D, S):
    errs, warns = [], []
    if not isinstance(W.get("version"), int):
        errs.append("version 은 정수")
    if not isinstance(W.get("note"), str) or not W.get("note"):
        errs.append("note 가 비었다")
    keys = {n["key"] for n in D["nations"]}
    conts = {}
    for c in W.get("continents", []):
        if c.get("key") in conts:
            errs.append("대륙 열쇠 겹침 %s" % c.get("key"))
        conts[c.get("key")] = c
        if c.get("layer") not in LAYERS:
            errs.append("대륙 %s 층 %r" % (c.get("key"), c.get("layer")))
        for f in ("ko", "en", "position", "why_ko"):
            if not c.get(f):
                errs.append("대륙 %s 빈 칸 %s" % (c.get("key"), f))
    regs = {}
    for r in W.get("regions", []):
        if r.get("key") in regs:
            errs.append("지역 열쇠 겹침 %s" % r.get("key"))
        regs[r.get("key")] = r
    for k, r in regs.items():
        for f in ("ko", "en", "why_ko"):
            if not r.get(f):
                errs.append("지역 %s 빈 칸 %s" % (k, f))
        if r.get("continent") not in conts:
            errs.append("지역 %s: 모르는 대륙 %s" % (k, r.get("continent")))
        for a in r.get("adjacent", []):
            if a not in regs:
                errs.append("지역 %s: 모르는 인접 %s" % (k, a))
            elif k not in regs[a].get("adjacent", []):
                errs.append("지역 인접 비대칭 %s→%s" % (k, a))
    nat = W.get("nations", {})
    if set(nat) != keys:
        errs.append("나라 차이 — 빠짐 %s · 설계표에 없음 %s" % (sorted(keys - set(nat)), sorted(set(nat) - keys)))
    per = {}
    for k, v in nat.items():
        if v.get("region") not in regs:
            errs.append("%s: 모르는 지역 %s" % (k, v.get("region")))
            continue
        per.setdefault(v["region"], []).append(k)
        nb = v.get("neighbours", [])
        if not 2 <= len(nb) <= 6:
            errs.append("%s: 이웃 %d" % (k, len(nb)))
        if len(set(nb)) != len(nb) or k in nb:
            errs.append("%s: 이웃 겹침/자기" % k)
        for x in nb:
            if x not in nat:
                errs.append("%s: 모르는 이웃 %s" % (k, x))
                continue
            if k not in nat[x].get("neighbours", []):
                errs.append("이웃 비대칭 %s→%s" % (k, x))
            ra, rb = v["region"], nat[x].get("region")
            if rb in regs and ra != rb and rb not in regs[ra].get("adjacent", []):
                errs.append("%s→%s: 지역 %s/%s 안 맞닿음" % (k, x, ra, rb))
        if not v.get("why_ko"):
            errs.append("%s: why_ko 없음" % k)
    for r in regs:
        if len(per.get(r, [])) < 2:
            errs.append("지역 %s: 나라 %d" % (r, len(per.get(r, []))))
    for c in conts:
        if not any(r.get("continent") == c for r in regs.values()):
            errs.append("대륙 %s: 지역 없음" % c)
    if not 15 <= len(regs) <= 30:
        warns.append("지역 수 %d" % len(regs))
    # 동맹 — 설계표의 여러 나라 가문
    fams = {}
    for n in D["nations"]:
        for f in n.get("families", []):
            if len(set(f.get("elements", []))) > 1:
                fams.setdefault(f["key"], set()).update(f["elements"])
                fams[f["key"]].add(n["key"])
    reg_of = {k: v.get("region") for k, v in nat.items()}
    cont_of = {k: regs[r]["continent"] for k, r in reg_of.items() if r in regs}
    al = W.get("alliances", [])
    seen = set()
    summ = {"total": 0, "same_region": 0, "cross_region_same_continent": 0, "cross_continent": 0}
    for a in al:
        fk = a.get("family")
        seen.add(fk)
        ns = a.get("nations", [])
        bad = [e for e in ns if e not in nat]
        if bad:
            errs.append("동맹 %s: 모르는 나라 %s" % (fk, bad))
            continue
        if fk in fams and set(ns) != fams[fk]:
            errs.append("동맹 %s: 나라 %s ≠ 설계표 가문 %s" % (fk, sorted(ns), sorted(fams[fk])))
        same = len({reg_of[e] for e in ns}) == 1
        if a.get("same_region") != same:
            errs.append("동맹 %s same_region 틀림" % fk)
        summ["total"] += 1
        if same:
            summ["same_region"] += 1
        elif len({cont_of.get(e) for e in ns}) == 1:
            summ["cross_region_same_continent"] += 1
        else:
            summ["cross_continent"] += 1
    if seen != set(fams):
        errs.append("동맹 목록 차이 %s" % sorted(seen ^ set(fams)))
    if W.get("alliance_summary") != summ:
        errs.append("alliance_summary %s ≠ 셈 %s" % (W.get("alliance_summary"), summ))
    # 지도 자리
    worlds = D["vocab"]["worlds"]
    for w, M in (W.get("map") or {}).items():
        where = "map.%s" % w
        if w not in worlds:
            errs.append("%s: 모르는 세계" % where)
        m = IMAGE.match(M.get("image", ""))
        if not m or m.group(1) != w or m.group(2) not in S["styles"]:
            errs.append("%s: 그림 이름 %r — backgrounds/maps/world-map_<세계>_<화풍>.webp" % (where, M.get("image")))
        size = M.get("size")
        if not (isinstance(size, list) and len(size) == 2 and size[0] * 2 == size[1] * 3):
            errs.append("%s: 크기 %r 는 3:2" % (where, size))
        mc, mr = M.get("continents", {}), M.get("regions", {})
        if set(mc) != set(conts):
            errs.append("%s: 대륙 차이 %s" % (where, sorted(set(mc) ^ set(conts))))
        if set(mr) != set(regs):
            errs.append("%s: 지역 차이 %s" % (where, sorted(set(mr) ^ set(regs))))
        for k, b in mc.items():
            if not all(num01(b.get(f)) for f in ("x", "y", "w", "h")) or b["w"] <= 0 or b["h"] <= 0 \
                    or b["x"] + b["w"] > 1 + 1e-9 or b["y"] + b["h"] > 1 + 1e-9:
                errs.append("%s 대륙 %s 상자 %r" % (where, k, b))
                continue
            if set(b) - {"x", "y", "w", "h", "label"}:
                errs.append("%s 대륙 %s 모르는 칸 %s" % (where, k, sorted(set(b) - {"x", "y", "w", "h", "label"})))
            lb = b.get("label")
            if lb is not None and not (isinstance(lb, list) and len(lb) == 2 and all(num01(v) for v in lb)
                                       and b["x"] <= lb[0] <= b["x"] + b["w"] and b["y"] <= lb[1] <= b["y"] + b["h"]):
                errs.append("%s 대륙 %s 이름 자리 %r 는 상자 안" % (where, k, lb))
        for k, p in mr.items():
            if not (num01(p.get("x")) and num01(p.get("y"))) or set(p) - {"x", "y"}:
                errs.append("%s 지역 %s 점 %r" % (where, k, p))
                continue
            c = regs.get(k, {}).get("continent")
            b = mc.get(c)
            if b and conts[c]["layer"] == "surface" and all(num01(b.get(f)) for f in ("x", "y", "w", "h")) \
                    and not (b["x"] <= p["x"] <= b["x"] + b["w"] and b["y"] <= p["y"] <= b["y"] + b["h"]):
                errs.append("%s 지역 %s 점 %r 이 대륙 %s 상자 밖" % (where, k, p, c))
    return errs, warns


def main(argv):
    if not argv or argv[0] != "check":
        print(__doc__)
        return 2
    path = argv[1] if len(argv) > 1 else os.path.join(ROOT, "data", "world-map.json")
    W = load(path)
    D = load(os.path.join(ROOT, "data", "element-design.json"))
    S = load(os.path.join(ROOT, "data", "style.json"))
    errs, warns = check(W, D, S)
    for w in warns:
        print("주의:", w)
    if errs:
        print("FAIL")
        for e in errs:
            print(" -", e)
        return 1
    per = {}
    for v in W["nations"].values():
        per[v["region"]] = per.get(v["region"], 0) + 1
    print("PASS — 나라 %d · 지역 %d · 대륙 %d · 동맹 %d · 지도 %s" % (len(W["nations"]), len(W["regions"]), len(W["continents"]),
                                                          len(W["alliances"]), ", ".join(sorted(W.get("map") or {})) or "없음"))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
