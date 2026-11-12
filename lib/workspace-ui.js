import { h } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useRef } from 'https://esm.sh/preact@10.24.3/hooks';

/* Appearance is shared between pages; generation settings are independent. */
function useAppearance() {
  const [appearance, setAppearance] = useState(() => window.AtelierAppearance.get());
  useEffect(() => {
    const sync = () => setAppearance(window.AtelierAppearance.get());
    addEventListener('atelier-appearance', sync);
    sync();
    return () => removeEventListener('atelier-appearance', sync);
  }, []);
  return appearance;
}
/* 설정 — 메뉴 줄의 ⚙ 하나. 누르면 배경·화면 밀도가 같은 폭 두 칸으로 펼쳐지고, 아랫줄에 머리 조작이 붙는다.
   바깥을 누르거나 Esc 면 닫힌다. 펼침은 저장하지 않는다 */
export function AppearanceControls({children}) {
  const appearance = useAppearance(), W = window.W;
  const [open, setOpen] = useState(false), ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const away = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = e => { if (e.key === 'Escape') { setOpen(false); ref.current?.querySelector('.appearance-toggle')?.focus(); } };
    addEventListener('pointerdown', away); addEventListener('keydown', esc);
    return () => { removeEventListener('pointerdown', away); removeEventListener('keydown', esc); };
  }, [open]);
  return h('div', {class:'appearance-controls' + (open ? ' open' : ''), ref},
    h('button', {type:'button', class:'appearance-toggle', 'aria-expanded':open, 'aria-label':W('ui.settings'), title:W('ui.settings'),
      onClick:() => setOpen(v => !v)}, h('span', {class:'theme-dot', 'aria-hidden':'true'}), h('span', {'aria-hidden':'true'}, '\u2699')),
    open && h('div', {class:'appearance-panel', role:'group', 'aria-label':W('ui.settings')},
      h('label', {class:'room-control'}, W('ui.theme'),
        h('select', {'aria-label':W('ui.theme'), value:appearance.theme,
          onChange:e => window.AtelierAppearance.set('theme', e.target.value)},
          window.AtelierAppearance.themes.map(key => h('option', {key, value:key}, W('theme.' + key))))),
      h('label', {class:'background-control'}, W('ui.background'),
        h('select', {'aria-label':W('ui.background'), value:appearance.background,
          onChange:e => window.AtelierAppearance.set('background', e.target.value)},
          ['on','off'].map(key => h('option', {key, value:key}, W('ui.background.' + key))))),
      h('label', null, W('ui.density'),
        h('select', {'aria-label':W('ui.density'), value:appearance.density,
          onChange:e => window.AtelierAppearance.set('density', e.target.value)},
          ['compact', 'relaxed'].map(key => h('option', {key, value:key}, W('ui.density.' + key))))),
      children && h('div', {class:'appearance-extra'}, children)));
}

/* 공방 문양 — 공간마다 원소의 물건 하나를 작은 선으로 그린다(실험실의 플라스크·천문대의 궤도·연금술 공방의 도가니·광산의 결정·제어실의 원자 고리) */
const CREST_MARK = {sunlit:[
  ['M19 6h10M21 6v12L10 38a3 3 0 0 0 3 4h22a3 3 0 0 0 3-4L27 18V6','line'],
  ['M14 32h20','signal'],
  ['M22 34h3v3h-3Z','primary']
],moonlit:[
  ['M24 24m-16 0a16 16 0 1 0 32 0a16 16 0 1 0-32 0','line'],
  ['M24 24m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0','signal'],
  ['M36 12h3v3h-3Z','primary']
],hanok:[
  ['M10 14h28l-4 24H14Z','line'],
  ['M16 20h16','signal'],
  ['M22 30h4v4h-4Z','primary']
],forest:[
  ['M24 5 38 19 24 43 10 19Z','line'],
  ['M10 19h28M24 5v38','signal'],
  ['M22 17h4v4h-4Z','primary']
],phosphor:[
  ['M24 24m-18 0a18 7 0 1 0 36 0a18 7 0 1 0-36 0','line'],
  ['M24 24m-7 -18a7 18 0 1 0 14 0a7 18 0 1 0-14 0','signal'],
  ['M22 22h4v4h-4Z','primary']
]};
const MARK_STYLE = {
  line:{stroke:'currentColor','stroke-width':2,'stroke-linejoin':'round','stroke-linecap':'round'},
  paint:{fill:'var(--signal)'},
  primary:{fill:'var(--accent)'},
  signal:{stroke:'var(--signal)','stroke-width':2.5,'stroke-linecap':'round','stroke-linejoin':'round'},
  surface:{fill:'var(--card)',stroke:'currentColor','stroke-width':2}
};
function Crest({theme}) {
  return h('svg',{class:'crest-mark',viewBox:'0 0 48 48',fill:'none','aria-hidden':'true'},
    (CREST_MARK[theme]||CREST_MARK.sunlit).map(([d,kind],i)=>h('path',{key:i,d,...MARK_STYLE[kind]})));
}
export function WorkspaceHeading({title,subtitle}) {
  const {theme}=useAppearance(),W=window.W;
  /* 문양은 첫 화면(index.html)으로 가는 링크 — 제목은 그 화면의 이름이라 링크가 아니다. 항해의 첫 화면 탭도 늘 있다 */
  return h('div',{class:'workspace-heading'},
    h('div',{class:'workspace-title'},h('a',{class:'workspace-home',href:'index.html','aria-label':W('nav.index')},h(Crest,{theme})),
      h('div',null,h('h1',null,title),h('p',null,subtitle))),
    h('div',{class:'crest-signature','aria-hidden':'true'},
      h('span',{class:'crest-name'},W('theme.' + theme)),h('i')));
}
/* The header folds: the title block hides, the navigation row (with its settings button) stays.
   The choice is a per-viewer convenience kept in this browser only — it can be missing or blocked. */
const FOLD_KEY='element_header_fold';
/* 화면 차례 — 머리의 항해. 화면을 더하면 여기 한 줄과 낱말 표(nav.*)를 같이 고친다 */
export const PAGES=['hall','gallery','dex','alchemy','styles','prompt'];   /* alchemy = 원소 합성(Phaser 놀이, 2026-11-12) */   /* styles = 화풍 비교(2026-11-07, 삼국지 공방과 같이) */   /* gallery = 전시관(감상용, 2026-11-02) */   /* hall = 주기율표(공방 안내판, 2026-11-02 첫 화면을 타이틀로 세우며 index.html 에서 옮김) — 문양은 타이틀(index.html)로 간다. 더하면 여기 한 줄과 낱말 표(nav.*)를 같이 고친다 */
const SUBTITLED=['prompt'];
function readFold(){ try { return localStorage.getItem(FOLD_KEY)==='1'; } catch(e){ return false; } }
function writeFold(v){ try { if(v) localStorage.setItem(FOLD_KEY,'1'); else localStorage.removeItem(FOLD_KEY); } catch(e){} }
/* Every page uses the same header markup and navigation order. */
export function WorkspaceHeader({page}) {
  const W=window.W;
  const [folded,setFolded]=useState(readFold);
  const toggle=()=>setFolded(v=>{ writeFold(!v); return !v; });
  const title=page==='index'||page==='hall'?'app.title':page+'.title';
  return h('div',{class:'workspace-header'+(folded?' folded':'')},
    h(WorkspaceHeading,{title:W(title),
      subtitle:W(SUBTITLED.includes(page)?page+'.subtitle':'app.subtitle')}),
    h('div',{class:'workspace-nav-row'},
      h('nav',{class:'workspace-nav'},PAGES.map(key=>
        h('a',{key,href:key+'.html','aria-current':key===page?'page':undefined},
          W('nav.'+key)))),
      h(AppearanceControls,null,
        h('button',{type:'button',class:'header-fold','aria-expanded':!folded,
          'aria-label':W(folded?'ui.header.unfold':'ui.header.fold'),title:W(folded?'ui.header.unfold':'ui.header.fold'),onClick:toggle},
          W(folded?'ui.header.unfold':'ui.header.fold.short')))));
}
export function ThemeGallery() {
  const {theme,background}=useAppearance(),W=window.W;
  return h('section',{class:'room-preview','aria-label':W('home.themes')},
    h('div',{class:'room-preview-art','aria-hidden':'true'}),
    h('div',{class:'room-preview-copy'},
      h('p',{class:'editorial-kicker'},W('home.themes')),
      h('h2',null,W('theme.'+theme)),h('p',null,W('theme.note.'+theme)),
      h('div',{class:'room-choices',role:'group','aria-label':W('ui.theme')},
        window.AtelierAppearance.themes.map(key=>h('button',{key,type:'button',
          class:'room-choice','aria-pressed':theme===key,
          onClick:()=>window.AtelierAppearance.set('theme',key)},W('theme.'+key)))),
      h('button',{type:'button',class:'room-background-toggle',
        onClick:()=>window.AtelierAppearance.set('background',background==='on'?'off':'on')},
        W(background==='on'?'ui.background.hide':'ui.background.show'))));
}
