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

export const EXPIRE_DAYS = 30;
export const PRIZES = [
  {id:"cherry",  label:"Extra cherry",                 short:"Cherry",       desc:"One bonus cherry for your garden", w:15},
  {id:"sticker", label:"Special sticker",              short:"Sticker",      desc:"A special sticker for your collection", w:15},
  {id:"praise",  label:"Praise card",                  short:"Praise",       desc:"Arshia is so proud of you, Maida!", w:15},
  {id:"break",   label:"10 minute break",              short:"Break",        desc:"Take a 10 minute break during study time", w:15},
  {id:"late",    label:"Start 30 minutes later",       short:"Late start",   desc:"Start your work half an hour later", w:10},
  {id:"early30", label:"Finish 30 minutes early",      short:"Early finish", desc:"Stop your work half an hour early", w:10},
  {id:"skiptask",label:"Skip one task",                short:"Skip task",    desc:"Skip any one task today", w:10},
  {id:"hour",    label:"One hour early",               short:"1 hr early",   desc:"Finish your work one hour early", w:3},
  {id:"skipsub", label:"Skip one subject for a day",   short:"Skip subject", desc:"Skip all tasks of one subject for a day", w:3},
  {id:"dayoff",  label:"Day off",                      short:"Day off",      desc:"No tasks at all for one day", w:2},
  {id:"mystery", label:"Mystery gift from Arshia",     short:"Mystery",      desc:"A surprise gift from Arshia", w:2}
];
export function pickPrize() { let r = Math.random() * 100; for (const p of PRIZES) { r -= p.w; if (r < 0) return p; } return PRIZES[0]; }
export const dateKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
export const fmtDay = k => new Date(k + "T12:00:00").toLocaleDateString(undefined, {day:"numeric", month:"short"});
export function wheelSvg() {
  const n = PRIZES.length, seg = 360 / n, R = 150, fills = ["#fbe3e1","#f2c9cf","#fdeee6","#f6d3d6"];
  const pt = (a, r) => [(r*Math.sin(a*Math.PI/180)).toFixed(2), (-r*Math.cos(a*Math.PI/180)).toFixed(2)];
  let h = `<svg viewBox="-160 -160 320 320" width="300" height="300"><circle r="158" fill="#b98a5e"/>`;
  PRIZES.forEach((p, i) => {
    const [x0,y0] = pt(i*seg, R), [x1,y1] = pt((i+1)*seg, R), m = i*seg + seg/2;
    h += `<path d="M0 0L${x0} ${y0}A${R} ${R} 0 0 1 ${x1} ${y1}Z" fill="${fills[i%4]}" stroke="#b98a5e" stroke-width="1.5"/>`;
    h += `<text transform="rotate(${m}) translate(0 ${-R*0.58}) rotate(-90)" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="700" fill="#3d0f1e" font-family="Trebuchet MS,Segoe UI,sans-serif">${esc(p.short)}</text>`;
  });
  return h + `<circle r="20" fill="#a3243b" stroke="#b98a5e" stroke-width="3"/></svg>`;
}
