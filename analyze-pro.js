'use strict';
function secondsPace(p){const m=/^(\d+):(\d+)$/.exec(p||'');return m?+m[1]*60 + +m[2]:null}
function evaluateActivity(raw,workout){
 const name=String(workout?.name||''), type=String(workout?.type||'');
 const text=(name+' '+type).toLowerCase();
 const isIntervals=/\d+\s*[×x]\s*\d+\s*(?:km|min)/i.test(text)||/intervall|vo2max/i.test(text);
 const z=raw.zones||[], covered=raw.covered||0, coverage=raw.minutes?Math.min(1,covered/(raw.minutes*60)):0;
 const paceSec=raw.distance>0?raw.minutes*60/raw.distance:null;
 const pace=paceSec?formatPace(paceSec/60):'–';
 const lowHR=(z[0]||0)+(z[1]||0)+(z[2]||0), highHR=(z[4]||0)+(z[5]||0);
 const lowShare=covered?lowHR/covered:null, highShare=covered?highHR/covered:null;
 const range=String(workout?.distance||'').replace(/,/g,'.').match(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)\s*km/i);
 const single=String(workout?.distance||'').replace(/,/g,'.').match(/(\d+(?:\.\d+)?)\s*km/i);
 let status='Lauf analysiert',detail='Keine eindeutige Distanzvorgabe erkannt; Soll-Ist-Vergleich eingeschränkt.';
 if(range){const lo=+range[1],hi=+range[2];status=raw.distance>=lo&&raw.distance<=hi?'Distanzziel erreicht':'Distanz ausserhalb des Plans';detail=`Geplant ${lo}–${hi} km, gelaufen ${raw.distance.toFixed(2)} km.`;}
 else if(single){const d=+single[1],tolerance=Math.max(.5,d*.05);status=Math.abs(raw.distance-d)<=tolerance?'Distanzziel erreicht':'Distanz ausserhalb des Plans';detail=`Geplant ca. ${d} km, gelaufen ${raw.distance.toFixed(2)} km (Toleranz ${tolerance.toFixed(1)} km).`;}
 const repeats=raw.repeats||[];
 if(isIntervals){const m=text.match(/(\d+)\s*[×x]\s*1\s*km/);if(m){const n=+m[1];detail+=` Automatisch erkannte schnelle 1-km-Abschnitte: ${repeats.length} von ${n}; GPS-Erkennung ist nur eine Näherung.`;}else detail+=' Intervalle können ohne strukturierte Rundenmarkierungen nicht zuverlässig einzeln überprüft werden.';}
 const splitSecs=(raw.splits||[]).map(secondsPace).filter(Number.isFinite);
 const half=Math.floor(splitSecs.length/2);
 const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
 const first=avg(splitSecs.slice(0,half)),last=avg(splitSecs.slice(half));
 const drift=first&&last?(last-first)/first*100:null;
 const driftText=drift===null?'Zu wenige Kilometer-Splits für einen Verlauf.':`Zweite Hälfte der vollständigen km-Splits ${Math.abs(drift).toFixed(1)} % ${drift>1?'langsamer':drift< -1?'schneller':'nahezu gleich schnell'} als die erste. Das allein belegt keine physiologische Ermüdung.`;
 const hrComment=coverage>=.6?`Herzfrequenz-Abdeckung ${Math.round(coverage*100)} %. HF-Zonen aus dem Pulsverlauf anhand der in FORGED hinterlegten Grenzen berechnet.`:'Zu wenige gültige Herzfrequenz-Sekunden für eine belastbare Zonenbewertung.';
 let coach=`${raw.distance.toFixed(1)} km mit Ø ${pace}/km und ${raw.hr??'–'} bpm. ${driftText}`;
 if(coverage>=.6){coach+=` ${Math.round((lowShare||0)*100)} % der erfassten Pulszeit bis 140 bpm, ${Math.round((highShare||0)*100)} % ab 150 bpm.`;}
 if(/longrun|langer|langlauf|ausdauer/i.test(text)||raw.distance>=18){coach+=' Der Lauf setzt einen Ausdauerreiz für das Marathonziel sub 3:20. Prüfe die Erholung vor der nächsten Qualitätseinheit.';}
 else if(/schwelle|tempo/i.test(text)){coach+=' Für eine echte Schwellenbewertung fehlen zuverlässig markierte Tempoabschnitte und deren Sollpace.';}
 else if(isIntervals){coach+=' Intervallqualität nur mit erkannten Wiederholungen und Zielvorgaben einschätzen; fehlende Runden nicht als Fehler werten.';}
 else coach+=' Die Intensität sollte zum geplanten lockeren oder regenerativen Charakter passen.';
 return {status,detail,hrComment,coach,repeats:isIntervals?repeats:[],zones:z,covered,coverage,planned:name,purpose:purpose(workout),splitPaces:raw.splits||[],pace,driftText};
}
function analysisHTML(a){if(!a)return '';const esc=escapeHTML;const rows=(a.repeats||[]).slice(0,16).map((r,i)=>`<tr><td>${i+1}</td><td>${esc(formatPace(r.paceSec/60))}/km</td><td>${r.hr||'–'} bpm</td><td>${r.paceSec>=265&&r.paceSec<=275?'✓':'–'}</td></tr>`).join('');const z=a.zones||[];return `<div class="pro-analysis"><h3>FORGED ANALYZE PRO</h3><p><strong>${esc(a.status)}</strong></p><p><b>Soll-Ist:</b> ${esc(a.detail)}</p>${rows?`<div style="overflow-x:auto"><table class="interval-table"><thead><tr><th>Intervall</th><th>Pace</th><th>Ø Puls</th><th>Ziel</th></tr></thead><tbody>${rows}</tbody></table></div>`:''}<p><b>HF-Zonen:</b> ${esc(['Unter Z1','Z1 122–131','Z2 132–140','Z3 141–149','Z4 150–156','Z5 ab 157'].map((label,i)=>`${label}: ${Math.round((z[i]||0)/60)} Min.`).join(' · '))}</p><p>${esc(a.hrComment)}</p><p><b>Trainingszweck:</b> ${esc(a.purpose||'')}</p><p><b>FORGED COACH:</b> ${esc(a.coach)}</p></div>`}
function coachWithFeedback(analysis,rpe,legs,note){let t='';if(rpe>=8)t+='Du empfandest die Einheit als sehr hart: die nächsten Tage besonders auf Erholung achten.';else if(rpe<=4)t+='Die Einheit fühlte sich locker an; das ist kein Grund, die nächsten Einheiten ungeplant zu verschärfen.';else t+='Dein Belastungsempfinden passt zu einer kontrollierten Einheit.';if(legs==='pain')t+=' Bei Schmerzen keine weitere Tempoeinheit; Beschwerden abklären.';if(legs==='tired')t+=' Schwere Beine sprechen für eine besonders ruhige Folgebelastung.';if(note)t+=' Eigene Notiz gespeichert.';return t.trim()}
