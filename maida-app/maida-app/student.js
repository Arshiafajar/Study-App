import { db, collection, doc, onSnapshot, setDoc, deleteDoc } from "./db.js";
import { PRAISE, TILE, PRIZES, EXPIRE_DAYS, esc, CHECK, bowSvg, garden, dueLabel, subjectList, sortTasks, registerSW, pickPrize, dateKey, fmtDay, wheelSvg } from "./common.js";

const S = { tasks: [], done: {}, wallet: {}, walletReady: false, view: "home", subj: null, celebrate: null, live: false };
const isDone = id => !!S.done[id];
const isNew = t => !isDone(t.id); // stays highlighted until she ticks it
const prizeOf = id => PRIZES.find(p => p.id === id) || { label: id, desc: "" };
const expired = w => w.status === "saved" && Date.now() > w.gotAt + EXPIRE_DAYS * 864e5;
const expDate = w => fmtDay(dateKey(new Date(w.gotAt + EXPIRE_DAYS * 864e5)));
const entries = () => Object.entries(S.wallet).map(([id, w]) => ({ id, ...w })).sort((a, b) => b.gotAt - a.gotAt);
const savedList = () => entries().filter(w => w.status === "saved" && !expired(w));
const bonus = () => entries().filter(w => w.status === "used" && w.prize === "cherry").length;
const $app = document.getElementById("app");

function render() {
  let h = `<div class="top"><div class="bar"><div><h1>${esc("Maida")}'s Cherry Tasks</h1><div class="sub">Tick a task to collect cherries</div></div>
    <span class="pill">${navigator.onLine && S.live ? "Online" : "Offline"}</span></div></div>`;
  h += garden(S.tasks.filter(t => isDone(t.id)).length + bonus());
  h += S.view === "wallet" ? walletView() : S.subj ? taskList() : home();
  if (S.celebrate) h += `<div class="pop" id="pop"><div>${bowSvg(80,"#f2b8c6")}<p>${esc(S.celebrate)}</p><button class="b">Yay</button></div></div>`;
  $app.innerHTML = h;
}
function home() {
  const n = savedList().length;
  let h = `<button class="b g wbtn" id="walletBtn">Wallet${n ? ` (${n} saved)` : ""}</button><div class="grid">`, k = 0;
  for (const s of subjectList(S.tasks)) {
    const open = S.tasks.filter(t => t.subject === s && !isDone(t.id));
    const nw = open.filter(isNew).length;
    h += `<button class="tile ${nw?"hot":""}" style="background:${TILE[k++%TILE.length]}" data-s="${esc(s)}">${esc(s)}
      <div class="n">${nw ? nw+" new" : "All done"}</div>${nw?`<span class="new">NEW</span>`:""}</button>`;
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
function walletView() {
  let h = `<button class="b g back" id="wback">Back</button><h2>Saved prizes</h2>`;
  const sv = savedList();
  if (!sv.length) h += `<div class="card">No saved prizes right now. Open the app tomorrow to spin again.</div>`;
  for (const w of sv) {
    const p = prizeOf(w.prize);
    h += `<div class="card"><div style="flex:1"><div class="t">${esc(p.label)}</div><div class="d">Won ${fmtDay(w.got)}, use before ${expDate(w)}</div></div>
      <button class="b" data-use="${w.id}">Use now</button></div>`;
  }
  h += `<h2>History</h2>`;
  const all = entries();
  if (!all.length) h += `<div class="card">No spins yet</div>`;
  for (const w of all) {
    const st = w.status === "used" ? `Used on ${fmtDay(w.usedOn)}` : expired(w) ? "Expired" : "Saved";
    h += `<div class="card"><div style="flex:1"><div class="t">${esc(prizeOf(w.prize).label)}</div><div class="d">Won ${fmtDay(w.got)}</div></div><span class="st">${st}</span></div>`;
  }
  return h;
}
function toggle(id) {
  const ref = doc(db, "done", id);
  if (isDone(id)) { delete S.done[id]; deleteDoc(ref); }
  else { S.done[id] = true; S.celebrate = PRAISE[Math.floor(Math.random()*PRAISE.length)]; setDoc(ref, { at: Date.now() }); }
  render(); // no await: works offline, syncs when back online
}
function useWallet(id) {
  const w = S.wallet[id]; if (!w || w.status !== "saved") return;
  if (!confirm(`Use "${prizeOf(w.prize).label}" today?`)) return;
  setDoc(doc(db, "wallet", id), { status: "used", usedAt: Date.now(), usedOn: dateKey() }, { merge: true });
}
$app.addEventListener("click", e => {
  const tile = e.target.closest(".tile"); if (tile) { S.subj = tile.dataset.s; return render(); }
  if (e.target.closest("#back")) { S.subj = null; return render(); }
  if (e.target.closest("#walletBtn")) { S.view = "wallet"; return render(); }
  if (e.target.closest("#wback")) { S.view = "home"; return render(); }
  const chk = e.target.closest(".chk"); if (chk) return toggle(chk.dataset.t);
  const use = e.target.closest("[data-use]"); if (use) return useWallet(use.dataset.use);
  if (e.target.closest("#pop")) { S.celebrate = null; render(); }
});

// ---- daily spin overlay (separate from the main render so the animation is never interrupted)
const ov = document.createElement("div"); document.body.appendChild(ov);
function maybeWheel() { if (S.walletReady && !S.wallet[dateKey()] && !ov.innerHTML) showWheel(); }
function showWheel() {
  ov.innerHTML = `<div class="ov"><div class="modal"><h2 class="mh">Daily spin</h2><div class="sub">Spin the wheel to win a prize today</div>
    <div class="wheelbox"><div class="pointer"></div><div class="wheel" id="wheel" style="transform:rotate(0deg)">${wheelSvg()}</div></div>
    <button class="b" id="spinBtn">Spin</button></div></div>`;
}
function spin() {
  const btn = document.getElementById("spinBtn"); if (!btn || btn.disabled) return; btn.disabled = true;
  const p = pickPrize(), idx = PRIZES.indexOf(p), seg = 360 / PRIZES.length;
  const today = dateKey();
  setDoc(doc(db, "wallet", today), { prize: p.id, got: today, gotAt: Date.now(), status: "saved" });
  document.getElementById("wheel").style.transform = `rotate(${360*5 - (idx*seg + seg/2)}deg)`;
  setTimeout(() => showResult(p), 4500);
}
function showResult(p) {
  ov.innerHTML = `<div class="ov"><div class="modal"><div class="sub">You won</div><h2 class="mh">${esc(p.label)}</h2><p class="pd">${esc(p.desc)}</p>
    <div class="two"><button class="b" id="useToday">Use today</button><button class="b g" id="saveLater">Save for later</button></div>
    <div class="sub" style="margin-top:8px">Saved prizes stay in your wallet for ${EXPIRE_DAYS} days</div></div></div>`;
  ov.dataset.prize = p.id;
}
ov.addEventListener("click", e => {
  if (e.target.closest("#spinBtn")) return spin();
  if (e.target.closest("#saveLater")) { ov.innerHTML = ""; return; }
  if (e.target.closest("#useToday")) {
    setDoc(doc(db, "wallet", dateKey()), { status: "used", usedAt: Date.now(), usedOn: dateKey() }, { merge: true });
    ov.innerHTML = "";
  }
});

addEventListener("online", render); addEventListener("offline", render);
onSnapshot(collection(db, "tasks"), q => { S.live = true; S.tasks = q.docs.map(d => ({ id: d.id, ...d.data() })); render(); }, () => {});
onSnapshot(collection(db, "done"), q => { const m = {}; q.docs.forEach(d => m[d.id] = true); S.done = m; render(); }, () => {});
onSnapshot(collection(db, "wallet"), q => {
  const m = {}; q.docs.forEach(d => m[d.id] = d.data()); S.wallet = m; S.walletReady = true; render(); maybeWheel();
}, () => {});
render(); registerSW();
