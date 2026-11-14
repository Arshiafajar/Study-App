export const KID = "Maida";
export const SUBJECTS = ["English","Urdu","Maths","Islamiyat","Biology","Chemistry","Physics","Mutala Quran","Mutala Pakistan","Test"];
export const TILE = ["#fbe3e1","#f6d3d6","#fdeee6","#f2c9cf","#fae0dc","#f7d9d2"];
export const PRAISE = [`Good work, ${KID}!`,`Amazing, ${KID}!`,`You did it, ${KID}!`,`So proud of you, ${KID}!`,`Superstar ${KID}!`,`Well done, ${KID}!`];
export const esc = s => String(s).replace(/[&<>"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
export const CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>`;

const BOW = `<path d="M30 22C14 2 2 14 8 26C12 34 24 28 30 22Z"/><path d="M30 22C46 2 58 14 52 26C48 34 36 28 30 22Z"/><path d="M28 24L16 47L26 41L30 26ZM32 24L44 47L34 41L30 26Z"/><ellipse cx="30" cy="23" rx="5" ry="4.5"/>`;
const CHERRY = `<path d="M22 2Q16 14 12 32M22 2Q30 14 31 30" stroke="#6b7a4a" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="12" cy="37" r="9" fill="#a3243b"/><circle cx="31" cy="36" r="9" fill="#8e1a31"/><circle cx="9" cy="33" r="2.5" fill="#fff" opacity=".6"/><circle cx="28" cy="32" r="2.5" fill="#fff" opacity=".6"/>`;
export const bowSvg = (w, fill) => `<svg viewBox="0 0 60 50" width="${w}" height="${w*50/60}" fill="${fill}" stroke="#a3243b" stroke-width="1.5">${BOW}</svg>`;

function charm(i) {
  const len = 18 + ((i * 37) % 70);
  return `<svg width="46" height="${len+58}" viewBox="0 0 46 ${len+58}"><path d="M23 0V${len}" stroke="#b98a5e" stroke-width="2"/>
  <svg x="8" y="${len-8}" width="30" height="25" viewBox="0 0 60 50" fill="#f2b8c6">${BOW}</svg>
  <svg x="1" y="${len+8}" width="44" height="50" viewBox="0 0 44 50">${CHERRY}</svg></svg>`;
}
export function garden(n) {
  let h = `<div class="garden"><div class="count">${n} cherr${n==1?"y":"ies"} collected</div>`;
  for (let i = 0; i < Math.min(n, 14); i++)
    h += `<span class="charm" style="left:${(i*31)%88+1}%;animation-delay:${-(i%5)*0.8}s">${charm(i)}</span>`;
  if (!n) h += `<div class="empty">Finish a task to collect your first cherry</div>`;
  return h + `</div>`;
}
export function dueLabel(t, done) {
  if (!t.due) return "";
  const late = new Date(t.due + "T23:59:59") < new Date() && !done;
  const lbl = new Date(t.due + "T12:00:00").toLocaleDateString(undefined, {weekday:"short", day:"numeric", month:"short"});
  return `<span class="${late?"late":""}">${late?"Overdue, due ":"Due "}${lbl}</span>`;
}
export function subjectList(tasks) { return [...new Set([...SUBJECTS, ...tasks.map(t => t.subject)])]; }
export const sortTasks = (l, isDone) => [...l].sort((a,b) => (isDone(a.id)-isDone(b.id)) || ((a.due||"9") > (b.due||"9") ? 1 : -1));
export function registerSW() { if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{}); }
