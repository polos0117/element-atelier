#!/usr/bin/env python3
"""세계 그림 실루엣 나누기 — 근본 · 가문주마다 세계별 실루엣(설계표 sil.<세계>)을 원소 성격대로 정한다
(사용자 2026-11-09 「삼국지처럼 세계컷 의상도 다양화 시켜서, 원소 특징에 맞게 분배 시켜줘」 — 삼국지 공방 tools/sil-spread.py 를 원소 꼴로).

  python3 tools/sil-spread.py           비어 있는 카드 · 세계만 채운다(이미 적힌 값은 건드리지 않는다)
  python3 tools/sil-spread.py --check   모든 근본 · 가문주 · 세계에 표에 있는 실루엣이 있는지, 갈래마다 몇 장인지만 본다(안 쓴다)

나누는 법 — 카드마다 원소 성격 태그(lib/prompt-spec.js SIL_TAGS — 손으로 정했다: 무거운 금속 · 귀한 것 · 가벼운 기체 · 반응하는 불 · 생명 · 독 · 기술 · 바다)가 있고,
태그마다 세계별로 어울리는 갈래 묶음(SIL_POOLS)이 있다. 카드의 태그 묶음을 합친 후보 안에서 지금까지 가장 적게 쓰인 갈래를 고른다
(그 나라 근본 · 가문주끼리 같은 갈래는 되도록 피하고, 같으면 열쇠 해시). 카드 순서도 해시라 다시 돌려도 같은 결과.
주민은 고르지 않는다 — 주민의 옷은 그 물건이 정한다(COSTUME citizen 줄). 실루엣 열쇠는 lib/prompt-spec.js 의 *_SILHOUETTES 에서 읽는다.
"""
import collections, hashlib, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESIGN = os.path.join(ROOT, 'data', 'element-design.json')
SPEC = os.path.join(ROOT, 'lib', 'prompt-spec.js')
WORLDS = {'fantasy': 'FANTASY_SILHOUETTES', 'steampunk': 'STEAMPUNK_SILHOUETTES', 'mecha': 'MECHA_SILHOUETTES'}

# 태그 묶음(POOLS)과 카드 → 태그(TAGS)는 lib/prompt-spec.js 의 SIL_POOLS · SIL_TAGS 한 곳에서 읽는다(GPT 임의 설계 주문의 의상 목록도 같은 묶음, 2026-11-09). 없는 카드는 검사에서 걸린다


def spec_obj(name):
    src = open(SPEC, encoding='utf-8').read()
    m = re.search(r'var ' + name + r' = (\{.*?\n  \});', src, re.S)
    body = re.sub(r'/\*.*?\*/', '', m.group(1), flags=re.S).replace("'", '"')
    return json.loads(re.sub(r'(?<!")\b([a-z_]+):', r'"\1":', body))


POOLS, TAGS = spec_obj('SIL_POOLS'), spec_obj('SIL_TAGS')


def spec_keys():
    s = open(SPEC, encoding='utf-8').read()
    out = {}
    for w, name in WORLDS.items():
        m = re.search(r'var ' + name + r' = \[(.*?)\n  \];', s, re.S)
        out[w] = re.findall(r"\{ key: '([a-z_]+)'", m.group(1)) if m else []
    return out


def cards(D):
    """근본 · 가문주 — (열쇠, 설계표 줄, 나라 열쇠)"""
    for n in D['nations']:
        yield n['key'], n, n['key']
        for f in n.get('families') or []:
            yield n['key'] + '-' + f['key'], f, n['key']


def h(k):
    return int(hashlib.sha1(k.encode('utf-8')).hexdigest()[:8], 16)


def check(D, keys):
    bad, count = [], {w: collections.Counter() for w in WORLDS}
    for tag, pw in POOLS.items():
        for w, ks in pw.items():
            bad += ['갈래 묶음 %s/%s 의 %s 가 표에 없다' % (tag, w, k) for k in ks if k not in keys[w]]
    for w in WORLDS:
        used = {k for pw in POOLS.values() for k in pw[w]}
        bad += ['%s 갈래 %s 가 어느 태그 묶음에도 없다' % (w, k) for k in keys[w] if k not in used]
    for key, row, _ in cards(D):
        if key not in TAGS:
            bad.append('카드 %s 의 원소 성격 태그가 없다(TAGS)' % key)
        for w in WORLDS:
            v = (row.get('sil') or {}).get(w)
            if not v:
                bad.append('%s %s 실루엣이 없다' % (key, w))
            elif v not in keys[w]:
                bad.append('%s %s 실루엣 %s 가 표에 없다' % (key, w, v))
            else:
                count[w][v] += 1
    return bad, count


def main(argv):
    D = json.load(open(DESIGN, encoding='utf-8'))
    keys = spec_keys()
    if '--check' not in argv:
        used = {w: collections.Counter() for w in WORLDS}
        per = collections.defaultdict(collections.Counter)
        rows = list(cards(D))
        for key, row, nk in rows:
            for w, v in (row.get('sil') or {}).items():
                used[w][v] += 1; per[(nk, w)][v] += 1
        n = 0
        for key, row, nk in sorted(rows, key=lambda r: h(r[0])):
            for w in WORLDS:
                if (row.get('sil') or {}).get(w):
                    continue
                pool = []
                for t in TAGS.get(key, []):
                    pool += [k for k in POOLS[t][w] if k not in pool and k in keys[w]]
                if not pool:
                    continue
                pick = min(pool, key=lambda k: (per[(nk, w)][k] > 0, used[w][k], h(key + w + k)))   # 한 나라 안에서 먼저 겹치지 않게, 그다음 전체에서 덜 쓴 것
                row.setdefault('sil', {})[w] = pick
                used[w][pick] += 1; per[(nk, w)][pick] += 1; n += 1
        json.dump(D, open(DESIGN, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        open(DESIGN, 'a', encoding='utf-8').write('\n')
        print('채웠다 %d 칸' % n)
    bad, count = check(D, keys)
    for w in WORLDS:
        print('%s — %s' % (w, ' · '.join('%s %d' % kv for kv in count[w].most_common())))
    for b in bad:
        print('  ✗ ' + b)
    print('실루엣 ' + ('통과' if not bad else '%d 건' % len(bad)))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
