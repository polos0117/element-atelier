/* 「들어가는 곳」 가문 층(2026-11-12, 설계 목표 4 · 물음 1 — 옛 gallery.html Family 를 바탕으로).
   가문주 크게(그림이면 누르면 한 장, 없으면 흐린 빈 원 → 목록의 그 칸) · 글(층 · 이름 · 인격 · 성질) · 설계된 주민 전부(아직 안 그린 주민은 빈 원 → 목록의 그 칸) ·
   같은 물질의 다른 나라(그 나라의 같은 가문으로 — 한 층 아래로 걷는 것이라 역사 칸).
   궤도에서 들어오면 ⑤: 누른 가문주 원에서 머리 그림이 날아와 커지고 주민이 차례로(lib/walk-fx.js — 움직임 판단 한 곳) */
import { h } from 'https://esm.sh/preact@10.24.3';
import { useLayoutEffect } from 'https://esm.sh/preact@10.24.3/hooks';
import { fx, FX, takeFrom } from './walk-fx.js?v=6';
import { cardsOf, pick, imgFail } from './walk-data.js?v=4';
import { EmptyArt } from './walk-orbit.js?v=7';

const R = window.AtelierWalk, W = window.W, IMG = window.AtelierImg;
const list = v => Array.isArray(v) ? v : (v ? String(v).split(/\s*,\s*/).filter(Boolean) : []);   /* 성질 — 가문은 쉼표 한 줄 */
/* 그림 — 큰 그림은 원본이 오는 동안 썸네일을 먼저 깔아 둔다(옛 전시관 Pic). 다른 세계에서 빌려 온 그림이면 「… 의 그림」(최종 검토 A7) */
const Pic = ({ p, big }) => h('span', { class: 'w-pic', style: big ? { backgroundImage: 'url("' + IMG.thumbURL(p.file) + '")' } : null },
  h('img', { src: big ? IMG.imgURL(p.file) : IMG.thumbURL(p.file), alt: '', loading: big ? 'eager' : 'lazy', decoding: 'async', onError: imgFail(p.file) }),
  p.from && h('span', { class: 'w-from' }, W('gallery.from', { world: W('world.' + p.world) })));

function Family({ doc, route, go, n }) {
  const d = doc.d, cards = cardsOf(doc, n), lord = cards.find(c => c.tier === 'lord' && c.family.key === route.f), f = lord.family, el = lord.el;
  const cits = cards.filter(c => c.tier === 'citizen' && c.family === f), world = R.worldOf(route, d.vocab.worlds);
  const toList = c => go({ mode: 'list', at: c.key, f: '', card: '' });
  const shown = c => pick(doc, c, world, route.st);
  const hp = shown(lord), traits = list(f.traits && f.traits.ko);
  const shared = (f.elements || []).filter(k => k !== n.key && d.nations.some(x => x.key === k && (x.families || []).some(y => y.key === f.key))).map(k => d.elements.find(e => e.key === k)).filter(Boolean);
  /* ⑤ — 궤도의 가문주 원에서 넘어온 자리가 있을 때만(주소로 바로 열거나 다른 나라에서 오면 없다) */
  useLayoutEffect(() => {   /* 그리기 전에 — 끝 모습이 한 틀 먼저 비치지 않게 */
    const from = takeFrom(), hero = document.querySelector('.w-hero .w-pic'); if (!from || !hero) return;
    fx('family', () => { FX.flyFrom(from, hero); FX.stagger(document.querySelectorAll('.w-cit'), { y: 16, each: .06 }); });
  }, []);
  return h('div', { class: 'w-fam' },
    h('div', { class: 'w-fam-top' },
      hp ? h('button', { type: 'button', class: 'w-hero', 'data-card': lord.key, 'aria-label': W('gallery.open', { name: lord.name }), onClick: () => go({ card: lord.key, pic: hp.file }) }, h(Pic, { p: hp, big: true }))
        : h(EmptyArt, { card: lord, class: 'w-hero empty', onClick: () => toList(lord) }),
      h('div', { class: 'w-ntext' },
        h('p', { class: 'w-tier' }, W('gallery.tier.lord') + ' · ' + el.symbol + ' ' + el.ko),
        h('h1', null, lord.name, h('small', null, f.en)),
        h('p', { class: 'w-persona' }, f.persona),
        traits.length > 0 && h('ul', { class: 'w-traits' }, traits.map((t, i) => h('li', { key: i }, t))),
        shared.length > 0 && h('p', { class: 'w-shared' }, W('gallery.shared') + ' — ', shared.map(e => h('button', { key: e.key, type: 'button', 'data-n': e.key, onClick: () => go({ n: e.key, f: f.key }) }, e.symbol + ' ' + e.ko))),
        /* 목록에서 보기 — 이 나라 목록의 가문주 칸으로(옛 전시관의 「도감에서 보기」, 최종 검토 A7) */
        h('a', { class: 'w-inlist', href: 'index.html?n=' + n.key + '&mode=list&at=' + lord.key, onClick: ev => { if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.button) return; ev.preventDefault(); toList(lord); } }, W('walk.inList')))),
    h('div', { class: 'w-cits' },
      h('h2', null, W('gallery.citizens', { n: cits.length })),
      h('ul', null, cits.map(c => { const p = shown(c);
        return h('li', { key: c.key }, h('button', { type: 'button', class: 'w-cit' + (p ? '' : ' empty'), 'data-c': c.key, 'aria-label': p ? W('gallery.open', { name: c.name }) : c.name + ' · ' + W('walk.noart'),
            onClick: () => p ? go({ card: c.key, pic: p.file }) : toList(c) },
          p ? h(Pic, { p }) : h('span', { class: 'w-pic w-empty-disc', 'aria-hidden': 'true' }),
          h('span', { class: 'w-cit-cap' }, h('b', null, c.name), h('small', null, p ? c.en : W('walk.noart')))));
      }))));
}

export function FamilyLayer({ doc, route, go }) {
  const n = doc.d.nations.find(x => x.key === route.n);
  /* 가문마다 새로 붙인다(같은 물질 다른 나라로 가도 효과 · 그림을 새로) */
  return h('section', { class: 'w-layer w-family', 'data-layer': 'family' }, h(Family, { key: n.key + '-' + route.f, doc, route, go, n }));
}
