"use strict";
function durationMinutes(v){if(!/^\d{1,3}:[0-5]\d:[0-5]\d$/.test(v))throw Error("Zeitformat HH:MM:SS erforderlich");const [h,m,s]=v.split(":").map(Number);return h*60+m+s/60}
function durationHMS(v){if(v==null||!Number.isFinite(Number(v)))return "00:00:00";const t=Math.round(Number(v)*60);return [Math.floor(t/3600),Math.floor(t%3600/60),t%60].map(x=>String(x).padStart(2,"0")).join(":")}
function renderExtras(){
 const target=state.settings?.raceDate;
 if(target&&/^2027-03-\d{2}$/.test(target)){
  const now=new Date();now.setHours(12,0,0,0);const end=new Date(target+"T12:00:00");const days=Math.ceil((end-now)/86400000);
  $("countdownDays").textContent=days>=0?days+" TAGE": "RENNEN VORBEI";$("countdownLabel").textContent=fmtDate(target)+" · SUB 03:20:00";
 }else{$("countdownDays").textContent="MÄRZ 2027";$("countdownLabel").textContent="Renndatum für exakten Countdown festlegen"}
 const runs=[...state.runs].filter(r=>r.minutes>0&&r.distance>=3).sort((a,b)=>a.date.localeCompare(b.date));
 const recent=runs.slice(-6);$("performanceTrend").innerHTML=recent.length?"<strong>Letzte Läufe mit Zeit</strong>"+recent.map(r=>`<p>${escapeHTML(fmtDate(r.date))} · ${km(r.distance)} · ${durationHMS(r.minutes)} · ${formatPace(r.minutes/r.distance)}/km${r.hr?" · Ø "+r.hr+" bpm":""}</p>`).join(""):"<strong>Noch keine Zeitdaten</strong><p>Importiere Läufe oder erfasse Distanz und Dauer, um deine Entwicklung zu sehen.</p>";
}
$("raceDate").value=state.settings?.raceDate||"";
$("raceDate").addEventListener("change",e=>{state.settings||={};state.settings.raceDate=e.target.value;save()});
let audioCtx;
$("soundBtn").addEventListener("click",()=>{try{
 audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume();const start=audioCtx.currentTime;
 const notes=[82.41,110,164.81,220,329.63];notes.forEach((freq,i)=>{const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),t=start+i*.53;osc.type=i<2?"sawtooth":"triangle";osc.frequency.setValueAtTime(freq,t);osc.frequency.exponentialRampToValueAtTime(freq*1.5,t+.44);gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.11,t+.06);gain.gain.exponentialRampToValueAtTime(.0001,t+.5);osc.connect(gain).connect(audioCtx.destination);osc.start(t);osc.stop(t+.51)});
 }catch(e){alert("Audio auf diesem Gerät nicht verfügbar.")}});
renderExtras();
