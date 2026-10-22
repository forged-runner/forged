"use strict";
function durationMinutes(v){if(!/^\d{1,3}:[0-5]\d:[0-5]\d$/.test(v))throw Error("Zeitformat HH:MM:SS erforderlich");const [h,m,s]=v.split(":").map(Number);return h*60+m+s/60}
function durationHMS(v){if(v==null||!Number.isFinite(Number(v)))return "00:00:00";const t=Math.round(Number(v)*60);return [Math.floor(t/3600),Math.floor(t%3600/60),t%60].map(x=>String(x).padStart(2,"0")).join(":")}
function renderExtras(){
 const target=state.settings?.raceDate;
 if(target&&/^\d{4}-\d{2}-\d{2}$/.test(target)){
  const now=new Date();now.setHours(12,0,0,0);const end=new Date(target+"T12:00:00");const days=Math.ceil((end-now)/86400000);
  $("countdownDays").textContent=days>=0?days+" TAGE": "RENNEN VORBEI";$("countdownLabel").textContent=fmtDate(target)+" · SUB 03:20:00";
 }else{$("countdownDays").textContent="MÄRZ 2027";$("countdownLabel").textContent="Renndatum für exakten Countdown festlegen"}
 const runs=[...state.runs].filter(r=>r.minutes>0&&r.distance>=3).sort((a,b)=>a.date.localeCompare(b.date));
 const recent=runs.slice(-6);$("performanceTrend").innerHTML=recent.length?"<strong>Letzte Läufe mit Zeit</strong>"+recent.map(r=>`<p>${escapeHTML(fmtDate(r.date))} · ${km(r.distance)} · ${durationHMS(r.minutes)} · ${formatPace(r.minutes/r.distance)}/km${r.hr?" · Ø "+r.hr+" bpm":""}</p>`).join(""):"<strong>Noch keine Zeitdaten</strong><p>Importiere Läufe oder erfasse Distanz und Dauer, um deine Entwicklung zu sehen.</p>";
}
$("raceDate").value=state.settings?.raceDate||"";
$("saveRaceDate").addEventListener("click",()=>{const value=$("raceDate").value;if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(new Date(value+'T12:00:00').getTime())){$("raceDateStatus").textContent="Bitte ein gültiges Datum auswählen.";return}state.settings||={};state.settings.raceDate=value;save();$("raceDateStatus").textContent="Gespeichert: "+fmtDate(value)});
renderExtras();

// Tagesform: show a proposed change first; never silently overwrite the plan.
const readinessButton = $('adaptBtn');
if (readinessButton) {
  const readinessPanel = document.createElement('div');
  readinessPanel.id = 'readinessProposal';
  readinessPanel.className = 'advice';
  readinessPanel.hidden = true;
  readinessButton.insertAdjacentElement('afterend', readinessPanel);
  readinessButton.addEventListener('click', () => {
    try {
      const sleep = $('sleep').value;
      const fatigue = Number($('fatigue').value);
      const pain = $('pain').value;
      const key = todayISO();
      const original = state.overrides?.[key] || workoutForDate(new Date());
      let proposed = {...original};
      let reason = 'Die geplante Einheit bleibt unverändert. Gute Tagesform ist kein Grund, schneller als geplant zu laufen.';
      if (pain === 'high') {
        proposed = {...original, type:'Belastungspause empfohlen', name:'Beschwerden abklären', distance:'Keine Laufeinheit empfohlen', pace:'–', details:'Bei deutlichen oder zunehmenden Schmerzen nicht laufen; ärztlich abklären.'};
        reason = 'Deutliche oder zunehmende Schmerzen haben Vorrang vor der Laufstreak.';
      } else if (pain === 'mild' || sleep === 'poor' || fatigue >= 4) {
        const severe = sleep === 'poor' || fatigue >= 5;
        proposed = {...original, type:'FORGED ADAPT · Entlastung', name:severe?'Kurzer regenerativer Lauf':'Lockerer Erholungslauf', distance:severe?'3–5 km':'5–7 km', pace:'5:40–6:00/km', details:'Nur bei Beschwerdefreiheit beziehungsweise nicht zunehmenden Beschwerden; keine Intervalle, keine Steigerungen. Bei Verschlechterung abbrechen.'};
        reason = 'Wegen Schlaf, Müdigkeit oder Beschwerden wird die Belastung reduziert. Harte Einheiten werden nicht automatisch nachgeholt.';
      }
      state.readiness = {date:key,sleep,fatigue,pain,note:$('readinessNote').value};
      localStorage.setItem(KEY,JSON.stringify(state));
      const changed = proposed.name !== original.name || proposed.distance !== original.distance || proposed.type !== original.type;
      readinessPanel.hidden = false;
      readinessPanel.innerHTML = `<strong>FORGED ADAPT · Vorschlag</strong><p><b>Bisher:</b> ${escapeHTML(original.name)} · ${escapeHTML(original.distance)} · ${escapeHTML(original.pace)}</p><p><b>Vorschlag:</b> ${escapeHTML(proposed.name)} · ${escapeHTML(proposed.distance)} · ${escapeHTML(proposed.pace)}</p><p>${escapeHTML(reason)}</p><button id="acceptReadiness" type="button" class="btn primary full">${changed?'Änderung übernehmen':'Tagesform speichern'}</button><button id="cancelReadiness" type="button" class="btn secondary full" style="margin-top:8px">Verwerfen</button>`;
      $('acceptReadiness').onclick = () => { if(changed){state.overrides ||= {};state.overrides[key]=proposed;} save();readinessPanel.hidden=true; $('coachAdvice').innerHTML='<strong>Tagesform gespeichert</strong><p>'+(changed?'Der Tagesplan wurde nach deiner Bestätigung angepasst.':'Dein Trainingsplan bleibt unverändert.')+'</p>'; };
      $('cancelReadiness').onclick = () => {readinessPanel.hidden=true;};
    } catch(err) { readinessPanel.hidden=false;readinessPanel.textContent='Tagesform konnte nicht verarbeitet werden: '+err.message; }
  });
}

// Initialize only after all feature functions have been declared.
try { renderAll(); } catch (error) { console.error("FORGED startup:", error); const status=document.getElementById("activityStatus"); if(status) status.textContent="Startfehler: "+error.message; }
