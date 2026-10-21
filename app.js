const KEY="marathonCoachV1";
const $=id=>document.getElementById(id);
const todayISO=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
let state={runs:[],readiness:{},settings:{},overrides:{}};
try{const saved=JSON.parse(localStorage.getItem(KEY)||"null");if(saved&&Array.isArray(saved.runs))state={...state,...saved,overrides:saved.overrides||{}}}catch(e){}
function save(){localStorage.setItem(KEY,JSON.stringify(state));renderAll()}
function dateObj(s){return new Date(s+"T12:00:00")}
function fmtDate(s){return dateObj(s).toLocaleDateString("de-CH",{day:"2-digit",month:"short",year:"numeric"})}
function km(n){return `${Number(n||0).toLocaleString("de-CH",{maximumFractionDigits:1})} km`}
function weekStart(d=new Date()){const x=new Date(d);x.setHours(12,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return x}
function getWeekKm(){const start=weekStart();const end=new Date(start);end.setDate(end.getDate()+7);return state.runs.filter(r=>dateObj(r.date)>=start&&dateObj(r.date)<end).reduce((s,r)=>s+Number(r.distance),0)}
function getStreak(){const dates=new Set(state.runs.map(r=>r.date));let d=dateObj(todayISO());if(!dates.has(todayISO()))d.setDate(d.getDate()-1);let n=0;while(dates.has(d.toISOString().slice(0,10))){n++;d.setDate(d.getDate()-1)}return n}
function workoutForDate(d=new Date()){
 const key=dateKey(d);
 if(key==='2026-10-22')return {type:'Qualität · vereinbart',name:'6 × 1 km @ 4:30/km',details:'2–3 km einlaufen, 6 × 1 km in 4:30/km mit je 2–3 Min locker traben, 2 km auslaufen. Bei ungewöhnlichen Beschwerden Belastung reduzieren.',distance:'ca. 12–14 km',pace:'Intervalle 4:25–4:35/km · locker 5:40–6:00/km',phase:'base'};
 if(key==='2026-12-12')return {type:'Formtest',name:'3 km + 21,1 km @ 4:40 + 2 km',details:'Nur wenn erholt: langer Formtest im Training, nicht als Pflichtbelastung.',distance:'26,1 km',pace:'Testblock 4:40/km',phase:'test'};
 if(key==='2027-01-17')return {type:'Wettkampf',name:'10-km-Standortbestimmung',details:'Ohne spezielle Vorbereitung; gut einlaufen und nach Tagesform laufen.',distance:'10 km + Ein-/Auslaufen',pace:'Nach Tagesform',phase:'race'};
 const day=(d.getDay()+6)%7;
 const week=Math.floor((d-new Date("2026-10-19T12:00:00"))/(7*86400000));
 const phase= d<new Date("2026-12-01")?"base":d<new Date("2027-02-01")?"build":d<new Date("2027-03-01")?"specific":"taper";
 const items=[
  ["Regeneration","Sehr lockerer Lauf","Entspannt bleiben. Wenn müde, kurz und sehr ruhig laufen.","5–7 km","5:40–6:00/km"],
  ["Aerob","Lockerer Dauerlauf","Gesprächstempo; nicht aus einem lockeren Tag ein Tempotraining machen.","8–10 km","5:20–5:40/km"],
  ["Qualität","Kontrollierte Qualität","Nur bei guter Tagesform: Einlaufen, kontrollierte Schwellenblöcke, Auslaufen.","10–13 km","Schwelle 4:27–4:33/km"],
  ["Aerob","Lockerer Dauerlauf","Ruhige aerobe Kilometer. Pace nach Gefühl und Bedingungen.","8–10 km","5:20–5:40/km"],
  ["Locker + Steigerungen","Laufökonomie","Locker laufen; optional 4–6 kurze, entspannte Steigerungen bei frischen Beinen.","7–9 km","5:30–5:50/km"],
  ["Longrun","Langer Lauf","Gleichmässig und kontrolliert. Verpflegung bei längeren Läufen testen.","22–26 km","5:20–5:40/km"],
  ["Regeneration","Sehr lockerer Lauf","Kurze regenerative Runde. Keine Intensität nötig.","5–7 km","5:40–6:00/km"]
 ];
 // Rotate to keep the daily pattern; long run Saturday, quality Tuesday.
 const ix=[2,0,1,3,4,5,6][day];
 let w={type:items[ix][0],name:items[ix][1],details:items[ix][2],distance:items[ix][3],pace:items[ix][4]};
 if(phase==="specific"&&day===1){w={type:"Marathonpace",name:"Marathonpace-Blöcke",details:"Nur wenn erholt: kurze kontrollierte Abschnitte nahe Zielpace; keine Pace erzwingen.",distance:"11–14 km",pace:"ca. 4:44/km in Blöcken"}}
 if(phase==="taper"){w={type:"Tapering",name:day===5?"Reduzierter Longrun":"Locker & frisch bleiben",details:"Umfang reduzieren, kurze lockere Läufe erhalten. Keine verpassten Kilometer nachholen.",distance:day===5?"14–18 km":"5–8 km",pace:"5:30–5:50/km"}}
 return {...w,phase};
}
function showWorkout(){
 const w=state.overrides?.[todayISO()]||workoutForDate();
 $("todayTitle").textContent=new Date().toLocaleDateString("de-CH",{weekday:"long",day:"numeric",month:"long"});
 $("dayTag").textContent=(w.phase||'ADAPT').toUpperCase();
 $("workoutType").textContent=w.type;$("workoutName").textContent=w.name;$("workoutDetails").textContent=w.details;$("workoutKm").textContent=w.distance;$("workoutPace").textContent=w.pace;
}
function advice(){
 const s=$("sleep").value,f=Number($("fatigue").value),p=$("pain").value;
 let title="Coach-Tipp",msg="Bleib kontrolliert. Beginne die ersten 10 Minuten bewusst locker und entscheide dann neu.";
 if(p==="high"){title="Belastung stoppen";msg="Bei deutlichen oder zunehmenden Schmerzen heute keine Tempoeinheit. Laufe nicht durch Schmerzen hindurch; bei anhaltenden Beschwerden fachlich abklären. Deine Streak ist kein Grund, eine Verletzung zu verschlimmern."}
 else if(p==="mild"){title="Vorsichtiger Lauf";msg="Nur wenn die Beschwerden beim Gehen unauffällig sind und beim Laufen nicht zunehmen: sehr kurz und locker. Kein Tempo, keine Steigerungen. Bei Verschlechterung abbrechen."}
 else if(s==="poor"||f>=5){title="Heute deutlich reduzieren";msg="Schlechte Erholung plus starke Müdigkeit: streiche die Qualität und reduziere stark. Wenn du dich krank oder ungewöhnlich erschöpft fühlst, ist vollständige Erholung sicherer als ein Lauf."}
 else if(f>=4||s==="poor"){title="Regeneration priorisieren";msg="Mache aus der Einheit einen kurzen, sehr lockeren Lauf und lass Tempo weg. Nicht versuchen, Kilometer nachzuholen."}
 else if(s==="good"&&f<=2){title="Gute Tagesform";msg="Du kannst die geplante Einheit erwägen, sofern keine Beschwerden vorliegen. Qualität kontrolliert und nicht schneller als geplant."}
 $("coachAdvice").innerHTML=`<strong>${title}</strong><p>${msg}</p>`;
 state.readiness={date:todayISO(),sleep:s,fatigue:f,pain:p,note:$("readinessNote").value};
 localStorage.setItem(KEY,JSON.stringify(state));
}
function renderPlan(){
 const phases=[
 ["Grundlage stabilisieren","19. Okt – Nov 2026","55–65 km/Woche als Ausgangspunkt. Lockeres Volumen, eine kontrollierte Qualitätseinheit und Longrun 22–26 km; bei Müdigkeit entlasten.","55–65 km/Woche"],
 ["Aufbau & Schwelle","Dez 2026 – Jan 2027","Schwellenblöcke schrittweise ausbauen und Marathonpace dosiert integrieren. Alle 3–4 Wochen Belastung reduzieren; Umfang nur bei guter Erholung erhöhen.","individuell steigern"],
 ["Marathonspezifisch","Februar 2027","Marathonpace in kontrollierten Blöcken, längere Läufe und Verpflegung testen. Keine unnötigen Maximalbelastungen.","Peak nach Verträglichkeit"],
 ["Taper & Rennen","März 2027","Umfang reduzieren, kurze Reize behalten, Schlaf und Verpflegung priorisieren. Exaktes Rennen-Datum vor der letzten Planung bestätigen.","frisch an die Startlinie"]];
 $("planCards").innerHTML=phases.map(p=>`<article class="phase"><div class="phase-bar"></div><div><h3>${p[0]}</h3><p>${p[1]} · ${p[2]}</p><div class="phase-km">${p[3]}</div></div></article>`).join("");
}
function renderLog(){
 const sorted=[...state.runs].sort((a,b)=>b.date.localeCompare(a.date));
 const total=state.runs.reduce((s,r)=>s+Number(r.distance),0);
 $("totalKm").textContent=km(total);$("runCount").textContent=state.runs.length;$("avgKm").textContent=km(state.runs.length?total/state.runs.length:0);
 $("runList").innerHTML=sorted.length?sorted.map(r=>{const d=dateObj(r.date);return `<article class="run-item"><div class="run-date"><strong>${d.getDate()}</strong>${d.toLocaleDateString("de-CH",{month:"short"})}</div><div class="run-info"><strong>${km(r.distance)}${r.minutes?` · ${durationHMS(r.minutes)}`:""}</strong><p>${r.hr?`Ø HF ${r.hr} bpm · `:""}${escapeHTML(r.note||"Lauf erfasst")}</p></div><button class="delete-run" data-delete="${r.id}" aria-label="Lauf löschen">×</button></article>`}).join(""):`<div class="notice"><strong>Noch keine Läufe erfasst</strong><p>Importiere deinen ersten Lauf auf der Startseite. Deine Daten bleiben auf diesem Gerät.</p></div>`;
 document.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>{if(confirm("Diesen Lauf löschen?")){state.runs=state.runs.filter(r=>r.id!==b.dataset.delete);save()}}));
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderAll(){showWorkout();renderPlan();renderWeek();renderLog();if(typeof renderExtras==="function")renderExtras();$("weekKm").textContent=km(getWeekKm());$("streak").textContent=`${getStreak()} ${getStreak()===1?"Tag":"Tage"}`}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===b.dataset.tab))}));
$("exportBtn").addEventListener("click",()=>{const blob=new Blob([JSON.stringify({app:"Marathon Coach",version:"1.1",exportedAt:new Date().toISOString(),...state},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`FORGED-backup-${todayISO()}.json`;a.click();URL.revokeObjectURL(a.href)});
$("importFile").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!Array.isArray(data.runs)||!confirm(`Backup mit ${data.runs.length} Läufen importieren und aktuelle Läufe ersetzen?`))return;state={runs:data.runs.filter(r=>r.date&&Number(r.distance)>0).map(r=>({...r,id:r.id||String(Date.now()+Math.random())})),readiness:data.readiness||{},settings:data.settings||{},overrides:data.overrides||{}};save();alert("Backup importiert.")}catch(err){alert("Datei konnte nicht gelesen werden. Bitte ein gültiges Marathon-Coach-JSON-Backup wählen.")}e.target.value=""});
$("clearBtn").addEventListener("click",()=>{if(confirm("Wirklich alle lokal gespeicherten Läufe und Tagesformdaten löschen? Diese Aktion kann nicht rückgängig gemacht werden.")){state={runs:[],readiness:{},settings:{},overrides:{}};save()}});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
let deferredPrompt;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").hidden=false});$("installBtn").addEventListener("click",async()=>{if(!deferredPrompt){alert("Öffne das Browser-Menü und wähle «Installieren» oder «Zum Startbildschirm hinzufügen».");return}deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("installBtn").hidden=true});
// Initial render runs after features.js has loaded.

function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function weekDates(){const start=new Date();start.setHours(12,0,0,0);return Array.from({length:14},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d})}
function renderWeek(){if(!$('weeklyPlan'))return;$('weeklyPlan').innerHTML=weekDates().map(d=>{const key=dateKey(d),w=state.overrides?.[key]||workoutForDate(d);return `<div class="week-day ${state.overrides?.[key]?'changed':''}"><strong>${d.toLocaleDateString('de-CH',{weekday:'short',day:'numeric',month:'short'})} · ${escapeHTML(w.type)}</strong><p>${escapeHTML(w.name)} · ${escapeHTML(w.distance)} · ${escapeHTML(w.pace)}</p></div>`}).join('')}
let pendingProposal=null;
$('proposeBtn').addEventListener('click',()=>{const mins=Number($('availableMinutes').value),reason=$('changeReason').value;const dates=weekDates(),today=todayISO(),todayIndex=dates.findIndex(d=>dateKey(d)===today);if(todayIndex<0)return;const d=dates[todayIndex],original=state.overrides?.[today]||workoutForDate(d);const serious=reason==='pain';const reduced=mins===0||serious||reason==='tired';const targetKm=Math.max(0,Math.min(12,Math.round(mins/6.2*10)/10));const proposed={...original,type:serious?'Beschwerden – keine Belastung erzwingen':reduced?'Entlastung':'FORGED ADAPT',name:serious?'Erholung / Beschwerden abklären':mins===0?'Heute keine Einheit möglich':`Angepasster lockerer Lauf`,details:serious?'Bei zunehmenden Schmerzen nicht laufen; medizinisch abklären.':`Heute höchstens ${mins} Minuten locker. Verpasste intensive Belastung nicht nachholen.`,distance:mins===0||serious?'0 km (Erholung)':`${targetKm} km (Richtwert)`,pace:'5:40–6:00/km'};
const other={};if(!reduced&&/Qualität|Marathonpace/.test(original.type)){const next=dates.slice(todayIndex+1,Math.min(todayIndex+5,dates.length)).find(x=>{const w=state.overrides?.[dateKey(x)]||workoutForDate(x);return /Aerob|Locker/.test(w.type)&&!state.overrides?.[dateKey(x)]});if(next){const key=dateKey(next),w=workoutForDate(next);other[key]={...w,type:'Aerob / optional Qualität',name:'Locker oder verschobene Qualität',details:'Nur falls vollständig erholt und mindestens 48 Stunden Abstand zur nächsten harten Einheit. Sonst locker bleiben.',distance:w.distance,pace:'5:40–6:00/km'}}}
pendingProposal={today,proposed,other};$('proposal').hidden=false;$('proposal').innerHTML=`<strong>Vorschlag – noch nicht übernommen</strong><p>Heute: ${escapeHTML(proposed.name)}, ${escapeHTML(proposed.distance)}. ${Object.keys(other).length?'Eine spätere Einheit wird als optionale Qualität markiert.':'Keine harte Einheit wird nachgeholt.'} Die tägliche Streak bleibt dein Ziel, aber bei Verletzungszeichen geht Gesundheit vor.</p><button id="confirmProposal" class="btn primary full">Änderung bestätigen</button><button id="rejectProposal" class="btn secondary full" style="margin-top:8px">Verwerfen</button>`;$('confirmProposal').onclick=()=>{state.overrides||={};state.overrides[today]=proposed;Object.assign(state.overrides,other);save();pendingProposal=null;$('proposal').hidden=true;document.querySelector('[data-tab="plan"]').click()};$('rejectProposal').onclick=()=>{pendingProposal=null;$('proposal').hidden=true}});
$('resetPlanBtn').addEventListener('click',()=>{if(confirm('Alle individuellen Planänderungen zurücksetzen?')){state.overrides={};save()}});
let pendingActivity=null;
async function analyzeSelectedActivity(){pendingActivity=null;$('saveActivityBtn').hidden=true;const f=$('activityFile').files?.[0];if(!f){$('activityStatus').textContent='Bitte zuerst eine FIT-, TCX- oder GPX-Datei auswählen.';return}try{$('activityStatus').textContent='Analysiere '+f.name+' …';if(f.size>25e6)throw Error('Datei ist zu gross (maximal 25 MB).');const result=await parseActivity(f);pendingActivity=result;const a=result.run,fmt=v=>v==null?'–':v;$('activityPreview').hidden=false;$('activityPreview').innerHTML=`<strong>Trainingsanalyse · ${escapeHTML(f.name)}</strong><div class="analysis-grid"><div><strong>${a.distance.toFixed(2)} km</strong><small>Distanz</small></div><div><strong>${durationHMS(a.minutes)}</strong><small>Dauer</small></div><div><strong>${fmt(result.pace)}</strong><small>Ø Pace /km</small></div><div><strong>${fmt(a.hr)} bpm</strong><small>Ø Puls</small></div></div><p>${escapeHTML(result.splits.length?`Splits: ${result.splits.slice(0,40).map((s,i)=>`${i+1}: ${s}`).join(' · ')}`:'Keine vollständigen Kilometersplits vorhanden.')}</p><p>${escapeHTML(result.comparison)}</p>`;$('activityStatus').textContent='Analyse abgeschlossen. Du kannst den Lauf jetzt speichern.';$('saveActivityBtn').hidden=false}catch(err){$('activityPreview').hidden=false;$('activityPreview').textContent='Import fehlgeschlagen: '+err.message;$('activityStatus').textContent='Bitte Datei prüfen.'}}
$('analyzeActivityBtn').addEventListener('click',analyzeSelectedActivity);
$('activityFile').addEventListener('change',()=>{ $('activityStatus').textContent=$('activityFile').files?.[0]?.name||'Noch keine Datei ausgewählt.'; $('activityPreview').hidden=true; $('saveActivityBtn').hidden=true; pendingActivity=null; if($('activityFile').files?.length) analyzeSelectedActivity(); });
$('saveActivityBtn').addEventListener('click',()=>{if(!pendingActivity)return;const r=pendingActivity.run;if(state.runs.some(x=>x.date===r.date&&Math.abs(x.distance-r.distance)<.05)&&!confirm('Ähnlicher Lauf bereits vorhanden. Trotzdem speichern?'))return;state.runs.push({...r,id:(globalThis.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())});save();pendingActivity=null;$('saveActivityBtn').hidden=true;$('activityFile').value='';document.querySelector('[data-tab="log"]').click()});
