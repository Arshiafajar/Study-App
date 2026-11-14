import { db, collection, doc, onSnapshot, setDoc, deleteDoc } from "./db.js";
import { PRAISE, TILE, esc, CHECK, bowSvg, garden, dueLabel, subjectList, sortTasks, registerSW } from "./common.js";

const ls = {
  get(k){ try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } },
  set(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
};
const S = { tasks: [], done: {}, subj: null, celebrate: null, live: false };
const isDone = id => !!S.done[id];
const isNew = t => !isDone(t.id); // stays highlighted until she ticks it
const $app = document.getElementById("app");

function render() {
  let h = `<div class="top"><div class="bar"><div><h1>${esc("Maida")}'s Cherry Tasks</h1><div class="sub">Tick a task to collect cherries</div></div>
    <span class="pill">${navigator.onLine && S.live ? "Online" : "Offline"}</span></div></div>`;
  h += garden(S.tasks.filter(t => isDone(t.id)).length);
  h += S.subj ? taskList() : home();
  if (S.celebrate) h += `<div class="pop" id="pop"><div>${bowSvg(80,"#f2b8c6")}<p>${esc(S.celebrate)}</p><button class="b">Yay</button></div></div>`;
  $app.innerHTML = h;
}
function home() {
  let h = `<div class="grid">`, k = 0;
  for (const n of subjectList(S.tasks)) {
    const open = S.tasks.filter(t => t.subject === n && !isDone(t.id));
    const nw = open.filter(isNew).length;
    h += `<button class="tile ${nw?"hot":""}" style="background:${TILE[k++%TILE.length]}" data-s="${esc(n)}">${esc(n)}
      <div class="n">${nw ? nw+" new" : open.length ? open.length+" to do" : "All done"}</div>${nw?`<span class="new">NEW</span>`:""}</button>`;
  }
  return h + `</div>`;
}
function taskList() {
  let h = `<button class="b g back" id="back">Back</button><h2>${esc(S.subj)}</h2>`;
  const l = sortTasks(S.tasks.filter(t => t.subject === S.subj), isDone);
  if (!l.length) h += `<div class="card">No tasks here yet</div>`;
  for (const t of l) {
    const d = isDone(t.id), f = !d;
    h += `<div class="card ${d?"done":""} ${f?"fresh":""}"><button class="chk ${d?"on":""}" data-t="${t.id}">${CHECK}</button>
      <div><div class="t">${f?`<span class="tag">NEW</span>`:""}${esc(t.title)}</div><div class="d">${dueLabel(t,d)}</div></div></div>`;
  }
  return h;
}
function openSubject(n) { S.subj = n; render(); }
function toggle(id) {
  const ref = doc(db, "done", id);
  if (isDone(id)) { delete S.done[id]; deleteDoc(ref); }
  else { S.done[id] = true; S.celebrate = PRAISE[Math.floor(Math.random()*PRAISE.length)]; setDoc(ref, { at: Date.now() }); }
  render(); // no await: works offline, syncs when back online
}
$app.addEventListener("click", e => {
  const tile = e.target.closest(".tile"); if (tile) return openSubject(tile.dataset.s);
  if (e.target.closest("#back")) { S.subj = null; return render(); }
  const chk = e.target.closest(".chk"); if (chk) return toggle(chk.dataset.t);
  if (e.target.closest("#pop")) { S.celebrate = null; render(); }
});
addEventListener("online", render); addEventListener("offline", render);

onSnapshot(collection(db, "tasks"), q => {
  S.live = true; S.tasks = q.docs.map(d => ({ id: d.id, ...d.data() }));
  render();
}, () => {});
onSnapshot(collection(db, "done"), q => {
  const m = {}; q.docs.forEach(d => m[d.id] = true); S.done = m; render();
}, () => {});
render(); registerSW();
