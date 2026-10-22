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
 if(key==='2027-01-16')return {type:'Regeneration',name:'Kurzer Lauf vor dem 10-km-Test',details:'Sehr locker, keine Steigerungen oder Longrun; am Folgetag ist ein Testwettkampf geplant.',distance:'4–5 km',pace:'5:45–6:10/km',purpose:'Frische Beine für die Standortbestimmung am Sonntag.'};
 if(key==='2027-01-18')return {type:'Regeneration',name:'Erholung nach dem 10-km-Test',details:'Sehr locker und kurz, kein Schwellentraining.',distance:'4–6 km',pace:'5:45–6:10/km',purpose:'Erholung nach dem Wettkampf.'};
 if(key==='2027-01-19')return {type:'Aerob',name:'Locker statt Schwelle nach dem 10-km-Test',details:'Gesprächstempo, keine Tempoabschnitte.',distance:'6–8 km',pace:'5:30–5:55/km',purpose:'Die 10-km-Standortbestimmung ersetzt diese Woche den Schwellenreiz.'};
 if(key==='2027-01-17')return {type:'Wettkampf',name:'10-km-Standortbestimmung',details:'Ohne spezielle Vorbereitung; gut einlaufen und nach Tagesform laufen.',distance:'10 km + Ein-/Auslaufen',pace:'Nach Tagesform',phase:'race'};
 const day=(d.getDay()+6)%7; // Montag = 0
 const week=Math.round((weekStart(d)-new Date("2026-10-19T12:00:00"))/(7*86400000));
 const phase=d<new Date("2026-12-01")?"base":d<new Date("2027-02-01")?"build":d<new Date("2027-03-01")?"specific":"taper";
 const cycle=((week%4)+4)%4;
 // Zuerst den ganzen Wochenrhythmus festlegen: genau ein Qualitätstag,
 // danach mindestens zwei lockere Tage bis zum Longrun.
 const easy=(name,dist,pace,why)=>({type:"Aerob",name,details:why,distance:dist,pace,purpose:why});
 const days=[
  {type:"Regeneration",name:"Sehr lockerer Lauf",distance:"5–6 km",pace:"5:40–6:05/km",details:"Erholung nach dem langen Lauf; entspannt und ohne Tempozwang.",purpose:"Regeneration nach dem Longrun, damit die Qualitätseinheit am Dienstag sinnvoll möglich wird."},
  null,
  easy("Lockerer Dauerlauf","7–8 km","5:25–5:50/km","Aerobe Basis und Erholung nach dem Schwellentag; kein zweites Tempotraining."),
  easy("Lockerer Dauerlauf","7–8 km","5:20–5:45/km","Grundlagenausdauer aufbauen, ohne die Schwellenbelastung zu wiederholen."),
  {type:"Locker + Steigerungen",name:"Locker mit optionalen Steigerungen",distance:"5–7 km",pace:"5:30–5:55/km",details:"Optional 4 × 15 Sekunden locker beschleunigen, jeweils vollständig erholen; nur mit frischen Beinen.",purpose:"Laufökonomie erhalten, ohne vor dem Longrun zusätzliche intensive Kilometer anzuhäufen."},
  {type:"Longrun",name:cycle===3?"Entlasteter langer Lauf":"Langer, lockerer Lauf",distance:cycle===3?"16–19 km":"20–23 km",pace:"5:20–5:45/km",details:"Konstant locker und gesprächsfähig laufen; Verpflegung testen. Keine zusätzlichen Marathonpace-Blöcke in dieser Woche.",purpose:"Marathonspezifische Ausdauer und Ermüdungsresistenz; bei höherer Intensität an anderer Stelle Belastung reduzieren."},
  {type:"Regeneration",name:"Kurzer Erholungslauf",distance:"4–6 km",pace:"5:45–6:10/km",details:"Sehr locker, keine Tempoabschnitte.",purpose:"Aktive Erholung nach dem Longrun und Vorbereitung der nächsten Trainingswoche."}
 ];
 const steps=[
  ["3 × 10 Min. Schwelle","3 × 10 Min. @ 4:27–4:33/km; zwischen den Blöcken je 3 Min. sehr locker traben (ca. 5:50–6:30/km); 2–3 km einlaufen, 2 km auslaufen.","10–12 km","4:27–4:33/km","30 Minuten Schwellenarbeit; Belastungsgefühl und Puls dokumentieren, um die nächste Woche sinnvoll zu steuern."],
  ["2 × 15 Min. Schwelle","2 × 15 Min. @ 4:30–4:35/km; dazwischen 3 Min. sehr locker traben (ca. 5:50–6:30/km); 2–3 km einlaufen, 2 km auslaufen.","10–12 km","4:30–4:35/km","30 Minuten Schwelle in längeren Blöcken; kein zusätzlicher Schwellentag."],
  ["3 × 12 Min. Schwelle","3 × 12 Min. @ 4:27–4:33/km; dazwischen je 3 Min. sehr locker traben (ca. 5:50–6:30/km); 2–3 km einlaufen, 2 km auslaufen.","11–13 km","4:27–4:33/km","36 Minuten Schwelle nur nach gut vertragenen Vorwochen; andernfalls die Vorwoche wiederholen oder entlasten."],
  ["2 × 10 Min. Schwelle · Entlastung","2 × 10 Min. @ 4:30–4:35/km; 3 Min. sehr locker traben; 2 km einlaufen, 2 km auslaufen.","8–10 km","4:30–4:35/km","Entlastungswoche: weniger intensive Minuten und kürzerer Longrun; nichts nachholen."]
 ];
 const q=steps[cycle];
 days[1]={type:"Schwelle",name:q[0],details:q[1],distance:q[2],pace:q[3],purpose:q[4]};
 if(phase==="specific")days[1]={type:"Marathonpace",name:"Kontrollierte Marathonpace-Blöcke",details:"2–3 km einlaufen, 2 × 3 km nahe 4:44/km, dazwischen 1 km locker, 2 km auslaufen. Nur bei guter Erholung; keine zusätzliche Schwelle.",distance:"11–13 km",pace:"Blöcke ca. 4:44/km",purpose:"Zielpace ökonomisch einüben, ohne mehrere harte Tage zu stapeln."};
 if(phase==="taper"){
  days[1]={type:"Locker + kurzer Reiz",name:"Locker mit kurzen Marathonpace-Abschnitten",details:"2 km locker, 2 × 5 Minuten bei Marathonpace mit 3 Minuten locker dazwischen, locker auslaufen; bei Müdigkeit ganz locker.",distance:"6–8 km",pace:"Locker, kurz ca. 4:44/km",purpose:"Bewegungsgefühl erhalten, ohne neue Ermüdung aufzubauen."};
  days[5]={type:"Tapering",name:"Reduzierter langer Lauf",details:"Locker und ohne Endbeschleunigung.",distance:"12–16 km",pace:"5:30–5:55/km",purpose:"Erholung vor dem Rennen."};
 }
 let w=days[day];

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
 const total=state.runs.reduce((sum,r)=>sum+Number(r.distance),0);
 $('totalKm').textContent=km(total);$('runCount').textContent=state.runs.length;$('avgKm').textContent=km(state.runs.length?total/state.runs.length:0);
 $('runList').innerHTML=sorted.length?sorted.map(r=>`<article class="run-item"><div class="run-date"><strong>${dateObj(r.date).getDate()}</strong>${dateObj(r.date).toLocaleDateString('de-CH',{month:'short'})}</div><div class="run-info"><strong>${km(r.distance)}${r.minutes?' · '+durationHMS(r.minutes):''}</strong><p>${r.hr?'Ø HF '+r.hr+' bpm · ':''}${escapeHTML(r.note||'Lauf erfasst')}</p>${r.analysis?`<details class="saved-analysis"><summary>${escapeHTML(r.analysis.status)} · Auswertung öffnen</summary>${analysisHTML(r.analysis)}<p><b>Belastung:</b> ${r.rpe||'–'}/10 · <b>Beine:</b> ${escapeHTML(r.legs||'–')}</p>${r.feedback?`<p><b>Deine Notiz:</b> ${escapeHTML(r.feedback)}</p>`:''}<p><b>Persönliches Coach-Fazit:</b> ${escapeHTML(r.analysis.coachFeedback||r.analysis.coach)}</p>${r.trainingLoad!=null?`<p>Geschätzter Belastungsindex: ${r.trainingLoad}</p>`:''}</details>`:''}</div><button class="delete-run" data-delete="${escapeHTML(r.id)}" aria-label="Lauf löschen">×</button></article>`).join(''):'<div class="notice"><strong>Noch keine Läufe erfasst</strong><p>Importiere deinen ersten Lauf auf der Startseite.</p></div>';
 document.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>{if(confirm('Diesen Lauf löschen?')){state.runs=state.runs.filter(r=>r.id!==b.dataset.delete);save()}}));
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderAll(){showWorkout();renderPlan();renderWeek();renderLog();if(typeof renderExtras==="function")renderExtras();$("weekKm").textContent=km(getWeekKm());$("streak").textContent=`${getStreak()} ${getStreak()===1?"Tag":"Tage"}`}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===b.dataset.tab))}));
$("exportBtn").addEventListener("click",()=>{const blob=new Blob([JSON.stringify({app:"Marathon Coach",version:"1.9.1",exportedAt:new Date().toISOString(),...state},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`FORGED-backup-${todayISO()}.json`;a.click();URL.revokeObjectURL(a.href)});
$("importFile").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!Array.isArray(data.runs)||!confirm(`Backup mit ${data.runs.length} Läufen importieren und aktuelle Läufe ersetzen?`))return;state={runs:data.runs.filter(r=>r.date&&Number(r.distance)>0).map(r=>({...r,id:r.id||String(Date.now()+Math.random())})),readiness:data.readiness||{},settings:data.settings||{},overrides:data.overrides||{}};save();alert("Backup importiert.")}catch(err){alert("Datei konnte nicht gelesen werden. Bitte ein gültiges Marathon-Coach-JSON-Backup wählen.")}e.target.value=""});
$("clearBtn").addEventListener("click",()=>{if(confirm("Wirklich alle lokal gespeicherten Läufe und Tagesformdaten löschen? Diese Aktion kann nicht rückgängig gemacht werden.")){state={runs:[],readiness:{},settings:{},overrides:{}};save()}});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
let deferredPrompt;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").hidden=false});$("installBtn").addEventListener("click",async()=>{if(!deferredPrompt){alert("Öffne das Browser-Menü und wähle «Installieren» oder «Zum Startbildschirm hinzufügen».");return}deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("installBtn").hidden=true});
// Initial render runs after features.js has loaded.

function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function weekDates(){const start=new Date();start.setHours(12,0,0,0);return Array.from({length:14},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d})}
function purpose(w){if(w.purpose)return w.purpose+' '+(w.details||'');let t=(w.type+' '+w.name).toLowerCase();if(t.includes('6 × 1'))return 'Tempo über Marathonpace: verbessert Tempohärte. 2–3 km einlaufen, 6 × 1 km @ 4:30/km, dazwischen jeweils 2:00 Minuten locker traben, 2 km auslaufen. Unterstützt das Ziel 4:44/km im Marathon.';if(t.includes('qualität')||t.includes('schwelle'))return 'Verbessert die länger haltbare Geschwindigkeit. Beispiel: 3 × 10 Minuten @ 4:27–4:33/km mit 3 Minuten Trabpause, davor und danach je 2 km locker. Unterstützt Marathon sub 3:20.';if(t.includes('longrun')||t.includes('langer'))return 'Trainiert Ausdauer, Verpflegung und Ermüdungsresistenz für die letzten Marathonkilometer.';if(t.includes('regener')||t.includes('entlast'))return 'Ermöglicht Erholung bei geringer Belastung und schützt die Qualität der folgenden Schlüsseleinheiten.';if(t.includes('steiger'))return 'Fördert Laufökonomie und lockere Schrittfrequenz ohne lange hohe Belastung.';if(t.includes('marathonpace'))return 'Gewöhnt an die Zielpace von ungefähr 4:44/km und hilft, sie kontrolliert zu laufen.';if(t.includes('formtest')||t.includes('wettkampf'))return 'Standortbestimmung für deine Form und das Marathonziel sub 3:20.';return 'Entwickelt die aerobe Grundlage für den Marathon und hält die Belastung zwischen harten Einheiten kontrolliert.'}
function renderWeek(){if(!$('weeklyPlan'))return;$('weeklyPlan').innerHTML=weekDates().map(d=>{const key=dateKey(d),w=state.overrides?.[key]||workoutForDate(d);return `<div class="week-day ${state.overrides?.[key]?'changed':''}"><strong>${d.toLocaleDateString('de-CH',{weekday:'short',day:'numeric',month:'short'})} · ${escapeHTML(w.type)}</strong><p>${escapeHTML(w.name)} · ${escapeHTML(w.distance)} · ${escapeHTML(w.pace)}</p><p><b>Warum diese Einheit?</b> ${escapeHTML(purpose(w))}</p><button class="btn secondary change-session" data-day="${key}" type="button">Diese Einheit passt mir nicht</button></div>`}).join('')}
function isHard(w){return /Schwelle|Qualität|Marathonpace|Intervall|Wettkampf|Formtest/i.test(w.type+' '+w.name)}
function editWorkout(day,reason,minutes,notes){
 const original=state.overrides?.[day]||workoutForDate(dateObj(day));
 const n=Math.max(10,Math.min(180,Number(minutes)||45));
 const kmEstimate=Math.max(2,Math.round(n/6*10)/10);
 let alt;
 if(reason==='pain')alt={type:'Gesundheit',name:'Belastung aussetzen und Beschwerden abklären',details:'Bei deutlichen oder zunehmenden Schmerzen keine Laufeinheit erzwingen. Keine harte Einheit nachholen.',distance:'0 km',pace:'–',purpose:'Verletzungen nicht verschlimmern; die langfristige Marathonvorbereitung geht vor.'};
 else if(reason==='time')alt={type:'FORGED ADAPT',name:'Zeitangepasster lockerer Lauf',details:`Bis zu ${n} Minuten locker, ohne Tempoanteile. ${notes||''}`,distance:`ca. ${kmEstimate} km`,pace:'5:40–6:00/km',purpose:'Aerobe Grundlage erhalten, ohne verpasste intensive Minuten später aufzustapeln.'};
 else if(reason==='tired'||reason==='hard')alt={type:'Regeneration',name:'Entlastender lockerer Lauf',details:`20–40 Minuten sehr locker, keine Intervalle. ${notes||''}`,distance:'4–7 km',pace:'5:40–6:00/km',purpose:'Erholung fördern und nächste Qualitätseinheit erst bei ausreichender Frische absolvieren.'};
 else if(reason==='easy')alt={...original,type:'Aerob + Steigerungen',name:'Lockerer Lauf mit 4–6 Steigerungen',details:`${original.distance} locker; nur bei frischen Beinen 4–6 × 15 Sekunden lockere Steigerungen, jeweils vollständig erholen. ${notes||''}`,pace:'5:20–5:40/km',purpose:'Etwas Laufökonomie ohne zusätzliche harte Einheit; Umfang nicht unkontrolliert steigern.'};
 else alt={type:'Aerob',name:'Alternativer lockerer Dauerlauf',details:`Kontrolliert locker laufen. Wunsch: ${notes||'Alternative zur ursprünglichen Einheit'}.`,distance:original.distance,pace:'5:20–5:40/km',purpose:'Belastung sinnvoll ersetzen, statt ungeprüft einen weiteren intensiven Reiz zu setzen.'};
 const next=weekDates().filter(d=>dateKey(d)>day).slice(0,3).map(d=>({day:dateKey(d),w:state.overrides?.[dateKey(d)]||workoutForDate(d)}));
 const note=isHard(original)?'Die gestrichene Qualität wird nicht automatisch nachgeholt. Nächste harte Einheit nur bei ausreichender Erholung.':'Andere Einheiten bleiben zunächst unverändert.';
 return {day,original,alt,note,warning:next.some(x=>isHard(x.w))?'In den nächsten drei Tagen ist bereits Qualität vorgesehen – keine zusätzliche harte Einheit einplanen.':''};
}
let pendingSessionEdit=null;
$('weeklyPlan').addEventListener('click',e=>{const btn=e.target.closest('.change-session');if(!btn)return;const day=btn.dataset.day;const panel=$('sessionEditPanel');panel.hidden=false;panel.innerHTML=`<h3>Einheit ändern · ${escapeHTML(fmtDate(day))}</h3><label>Warum passt sie nicht?<select id="editReason"><option value="hard">Zu hart</option><option value="easy">Zu leicht</option><option value="time">Zu wenig Zeit</option><option value="tired">Noch nicht erholt</option><option value="swap">Andere Einheit gewünscht</option><option value="pain">Schmerzen / Beschwerden</option></select></label><label>Verfügbare Minuten<input id="editMinutes" type="number" min="10" max="180" value="45"></label><label>Mein Wunsch / Hinweis<textarea id="editNote" rows="2" placeholder="Optional"></textarea></label><button class="btn primary full" id="previewSession" type="button">Alternative anzeigen</button><div id="sessionPreview"></div>`;panel.scrollIntoView({behavior:'smooth',block:'nearest'});$('previewSession').onclick=()=>{pendingSessionEdit=editWorkout(day,$('editReason').value,$('editMinutes').value,$('editNote').value.trim());const x=pendingSessionEdit;$('sessionPreview').innerHTML=`<p><b>Vorschlag – noch nicht übernommen</b></p><p>${escapeHTML(x.alt.name)} · ${escapeHTML(x.alt.distance)} · ${escapeHTML(x.alt.pace)}</p><p>${escapeHTML(x.alt.details)}</p><p>${escapeHTML(x.note)} ${escapeHTML(x.warning)}</p><button id="acceptSession" class="btn primary full" type="button">Änderung bestätigen</button><button id="cancelSession" class="btn secondary full" type="button">Verwerfen</button>`;$('acceptSession').onclick=()=>{state.overrides||={};state.overrides[x.day]=x.alt;save();pendingSessionEdit=null;panel.hidden=true};$('cancelSession').onclick=()=>{pendingSessionEdit=null;panel.hidden=true}}});

let pendingProposal=null;
$('proposeBtn').addEventListener('click',()=>{const mins=Number($('availableMinutes').value),reason=$('changeReason').value;const dates=weekDates(),today=todayISO(),todayIndex=dates.findIndex(d=>dateKey(d)===today);if(todayIndex<0)return;const d=dates[todayIndex],original=state.overrides?.[today]||workoutForDate(d);const serious=reason==='pain';const reduced=mins===0||serious||reason==='tired';const targetKm=Math.max(0,Math.min(12,Math.round(mins/6.2*10)/10));const proposed={...original,type:serious?'Beschwerden – keine Belastung erzwingen':reduced?'Entlastung':'FORGED ADAPT',name:serious?'Erholung / Beschwerden abklären':mins===0?'Heute keine Einheit möglich':`Angepasster lockerer Lauf`,details:serious?'Bei zunehmenden Schmerzen nicht laufen; medizinisch abklären.':`Heute höchstens ${mins} Minuten locker. Verpasste intensive Belastung nicht nachholen.`,distance:mins===0||serious?'0 km (Erholung)':`${targetKm} km (Richtwert)`,pace:'5:40–6:00/km'};
const other={};if(!reduced&&/Qualität|Marathonpace/.test(original.type)){const next=dates.slice(todayIndex+1,Math.min(todayIndex+5,dates.length)).find(x=>{const w=state.overrides?.[dateKey(x)]||workoutForDate(x);return /Aerob|Locker/.test(w.type)&&!state.overrides?.[dateKey(x)]});if(next){const key=dateKey(next),w=workoutForDate(next);other[key]={...w,type:'Aerob / optional Qualität',name:'Locker oder verschobene Qualität',details:'Nur falls vollständig erholt und mindestens 48 Stunden Abstand zur nächsten harten Einheit. Sonst locker bleiben.',distance:w.distance,pace:'5:40–6:00/km'}}}
pendingProposal={today,proposed,other};$('proposal').hidden=false;$('proposal').innerHTML=`<strong>Vorschlag – noch nicht übernommen</strong><p>Heute: ${escapeHTML(proposed.name)}, ${escapeHTML(proposed.distance)}. ${Object.keys(other).length?'Eine spätere Einheit wird als optionale Qualität markiert.':'Keine harte Einheit wird nachgeholt.'} Die tägliche Streak bleibt dein Ziel, aber bei Verletzungszeichen geht Gesundheit vor.</p><button id="confirmProposal" class="btn primary full">Änderung bestätigen</button><button id="rejectProposal" class="btn secondary full" style="margin-top:8px">Verwerfen</button>`;$('confirmProposal').onclick=()=>{state.overrides||={};state.overrides[today]=proposed;Object.assign(state.overrides,other);save();pendingProposal=null;$('proposal').hidden=true;document.querySelector('[data-tab="plan"]').click()};$('rejectProposal').onclick=()=>{pendingProposal=null;$('proposal').hidden=true}});
$('resetPlanBtn').addEventListener('click',()=>{if(confirm('Alle individuellen Planänderungen zurücksetzen?')){state.overrides={};save()}});
let pendingActivity=null;
async function analyzeSelectedActivity(){
 pendingActivity=null;$('saveActivityBtn').hidden=true;const f=$('activityFile').files?.[0];
 if(!f){$('activityStatus').textContent='Bitte zuerst eine FIT-, TCX- oder GPX-Datei auswählen.';return}
 try{
  $('activityStatus').textContent='Analysiere '+f.name+' …';if(f.size>25e6)throw Error('Datei ist zu gross (maximal 25 MB).');
  const result=await parseActivity(f);pendingActivity=result;const a=result.run;
  $('activityPreview').hidden=false;
  $('activityPreview').innerHTML=`<strong>Trainingsanalyse · ${escapeHTML(f.name)}</strong><div class="analysis-grid"><div><strong>${a.distance.toFixed(2)} km</strong><small>Distanz</small></div><div><strong>${durationHMS(a.minutes)}</strong><small>Dauer</small></div><div><strong>${escapeHTML(result.pace)}</strong><small>Ø Pace /km</small></div><div><strong>${a.hr||'–'} bpm</strong><small>Ø Puls</small></div></div>${analysisHTML(result.analysis)}<p><b>Kilometersplits:</b> ${escapeHTML(result.splits.map((v,i)=>`${i+1}: ${v}`).join(' · '))}</p><label>Empfundene Anstrengung (1–10)<select id="runRpe">${Array.from({length:10},(_,i)=>'<option value="'+(i+1)+'"'+(i===5?' selected':'')+'>'+(i+1)+'/10</option>').join('')}</select></label><label>Beingefühl<select id="runLegs"><option value="fresh">Frisch</option><option value="good" selected>Gut, leicht müde</option><option value="tired">Schwer / müde</option><option value="pain">Schmerzen / Beschwerden</option></select></label><label>Dein Eindruck<textarea id="runFeedback" rows="2" placeholder="Atmung, Beine, Wetter, Besonderheiten …"></textarea></label><button class="btn secondary full" id="runFeedbackBtn" type="button">Coach-Kommentar aktualisieren</button><p id="runFeedbackComment"></p>`;
  function updateFeedback(){const rpe=Number($('runRpe').value),legs=$('runLegs').value,note=$('runFeedback').value.trim();a.rpe=rpe;a.legs=legs;a.feedback=note;a.analysis={...result.analysis,coachFeedback:coachWithFeedback(result.analysis,rpe,legs,note)};const score=result.covered>=a.minutes*60*.6?Math.round(result.zones.reduce((v,x,i)=>v+x*[.5,1,2,3,4,5][i],0)/60*rpe/6):null;a.trainingLoad=score;$('runFeedbackComment').textContent=a.analysis.coachFeedback+(score===null?' Belastungsindex mangels HF-Abdeckung nicht berechnet.':' Geschätzter Belastungsindex: '+score+'.')}
  $('runFeedbackBtn').onclick=updateFeedback;['runRpe','runLegs','runFeedback'].forEach(id=>$(id).addEventListener('change',updateFeedback));updateFeedback();
  $('activityStatus').textContent='Analyse abgeschlossen. Mit „Training in Historie speichern“ bleibt die gesamte Auswertung im Laufprotokoll.';$('saveActivityBtn').hidden=false;
 }catch(err){$('activityPreview').hidden=false;$('activityPreview').textContent='Import fehlgeschlagen: '+err.message;$('activityStatus').textContent='Bitte Datei prüfen.'}
}
$('analyzeActivityBtn').addEventListener('click',analyzeSelectedActivity);
$('activityFile').addEventListener('change',()=>{ $('activityStatus').textContent=$('activityFile').files?.[0]?.name||'Noch keine Datei ausgewählt.'; $('activityPreview').hidden=true; $('saveActivityBtn').hidden=true; pendingActivity=null; if($('activityFile').files?.length) analyzeSelectedActivity(); });
$('saveActivityBtn').addEventListener('click',()=>{if(!pendingActivity)return;const r=pendingActivity.run;if(state.runs.some(x=>x.date===r.date&&Math.abs(x.distance-r.distance)<.05)&&!confirm('Ähnlicher Lauf bereits vorhanden. Trotzdem speichern?'))return;state.runs.push({...r,id:(globalThis.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())});save();pendingActivity=null;$('saveActivityBtn').hidden=true;$('activityFile').value='';document.querySelector('[data-tab="log"]').click()});
