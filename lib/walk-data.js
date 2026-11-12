/* 「들어가는 곳」 자료 — 설계표 · 화풍 판 · 그림 등록부를 한 번 읽는다(옛 gallery.html useDocs 의 Promise 그대로). window.AtelierImg 를 쓴다 */
const IMG = window.AtelierImg;
const json = u => fetch(u, { cache: 'no-cache' }).then(r => r.ok ? r.json() : Promise.reject(new Error(String(r.status))));

export function loadDocs() {
  return Promise.all([
    json('data/element-design.json'),
    json('data/style.json'),
    fetch(IMG.DATA, { cache: 'no-cache' }).then(r => r.ok ? r.json() : { img: {} }).catch(() => ({ img: {} }))
  ]).then(([d, s, i]) => { IMG.setShards(i); IMG.setAdded(i); return { d, s, img: i.img || {} }; }).catch(() => ({ failed: true }));
}
