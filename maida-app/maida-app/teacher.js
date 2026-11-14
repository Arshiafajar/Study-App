import { app, db, collection, doc, onSnapshot, setDoc, deleteDoc } from "./db.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { esc, dueLabel, subjectList, sortTasks, registerSW } from "./common.js";

const auth = getAuth(app);
const S = { tasks: [], done: {}, user: null, msg: "" };
const $app = document.getElementById("app");

function render() {
  if (!S.user) {
    $app.innerHTML = `<div class="top"><h1>Teacher login</h1><div class="sub">Only you can add or delete tasks</div></div>
      <div class="card" style="display:block"><input id="em" type="email" placeholder="Email" autocomplete="username">
      <input id="pw" type="password" placeholder="Password" autocomplete="current-password">
      <button class="b" id="login" style="width:100%;margin-top:6px">Log in</button><div class="d" style="margin-top:6px">${esc(S.msg)}</div></div>`;
    return;
  }
  const doneN = S.tasks.filter(t => S.done[t.id]).length;
  let h = `<div class="top"><div class="bar"><div><h1>Teacher mode</h1><div class="sub">${S.tasks.length} tasks, ${doneN} done</div></div>
    <button class="b g" id="out">Log out</button></div></div>
    <div class="card" style="display:block"><b>New task</b>
    <select id="ns">${subjectList(S.tasks).map(n => `<option>${esc(n)}</option>`).join("")}<option value="__new">New subject...</option></select>
    <input id="nsn" placeholder="New subject name" style="display:none">
    <input id="nt" placeholder="e.g. Chapter 3 and 4, exercises 1 to 5">
    <input id="nd" type="date"><button class="b" id="add" style="width:100%;margin-top:6px">Add task</button></div>`;
  for (const n of subjectList(S.tasks)) {
    const l = sortTasks(S.tasks.filter(t => t.subject === n), id => !!S.done[id]);
    if (!l.length) continue;
    h += `<h3>${esc(n)}</h3>`;
    for (const t of l) {
      const d = !!S.done[t.id];
      h += `<div class="card ${d?"done":""}"><span class="st">${d?"Done":"Open"}</span><div style="flex:1"><div class="t">${esc(t.title)}</div><div class="d">${dueLabel(t,d)}</div></div>
        <button class="del" data-del="${t.id}">Delete</button></div>`;
    }
  }
  $app.innerHTML = h;
}
$app.addEventListener("change", e => { if (e.target.id === "ns") document.getElementById("nsn").style.display = e.target.value === "__new" ? "block" : "none"; });
$app.addEventListener("click", async e => {
  const id = e.target.id;
  if (id === "login") {
    try { await signInWithEmailAndPassword(auth, document.getElementById("em").value.trim(), document.getElementById("pw").value); }
    catch (err) { S.msg = "Wrong email or password, or no internet."; render(); }
  }
  if (id === "out") signOut(auth);
  if (id === "add") {
    let s = document.getElementById("ns").value;
    if (s === "__new") s = document.getElementById("nsn").value.trim();
    const t = document.getElementById("nt").value.trim(), d = document.getElementById("nd").value;
    if (!s || !t) return;
    await setDoc(doc(db, "tasks", "t" + Date.now().toString(36)), { subject: s, title: t, due: d || "", created: Date.now() });
  }
  const del = e.target.dataset.del;
  if (del && confirm("Delete this task?")) { await deleteDoc(doc(db, "tasks", del)); deleteDoc(doc(db, "done", del)); }
});
onAuthStateChanged(auth, u => { S.user = u; render(); });
onSnapshot(collection(db, "tasks"), q => { S.tasks = q.docs.map(d => ({ id: d.id, ...d.data() })); render(); }, () => {});
onSnapshot(collection(db, "done"), q => { const m = {}; q.docs.forEach(d => m[d.id] = true); S.done = m; render(); }, () => {});
render(); registerSW();
