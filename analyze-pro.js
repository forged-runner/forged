'use strict';
function secondsPace(p){const m=/^(\d+):(\d+)$/.exec(p||'');return m?+m[1]*60 + +m[2]:null}
function evaluateActivity(raw,workout){
 const isIntervals=/6\s*[×x]\s*1\s*km/.test(workout.name||'');
 const target=270, repeats=raw.repeats||[];
 let status='Nicht eindeutig bewertbar', detail='Die vorhandenen Daten reichen für einen verlässlichen Soll-Ist-Nachweis nicht aus.';
 if(isIntervals){
  if(repeats.length>=6){const first=repeats.slice(0,6),hit=first.filter(r=>r.paceSec>=265&&r.paceSec<=275).length;status=hit===6?'Trainingsziel erreicht':hit>=4?'Teilweise erreicht':'Ziel nicht vollständig erreicht';detail=`${hit} von 6 Wiederholungen im vereinbarten Zielbereich 4:25–4:35/km. ${repeats.length>6?'Zusätzliche schnelle Abschnitte erkannt.':''}`;}
  else detail=`Geplant: 6 × 1 km in 4:30/km. ${repeats.length} passende schnelle Abschnitte erkannt; die automatische Erkennung kann bei GPS-Schwankungen oder unterbrochenen Aufzeichnungen unvollständig sein.`;
 }else{
  const range=(workout.distance||'').match(/(\d+)\s*[–-]\s*(\d+)\s*km/);
  if(range){const low=+range[1],high=+range[2];status=raw.distance>=low&&raw.distance<=high?'Distanzziel erreicht':'Distanz ausserhalb des Plans';detail=`Geplant ${low}–${high} km, gelaufen ${raw.distance.toFixed(2)} km. Die Intensität muss zusätzlich anhand von Pace, Puls und Empfinden beurteilt werden.`}
 }
 const z=raw.zones||[];const covered=raw.covered||0;
 const coverage=raw.minutes?covered/(raw.minutes*60):0;
 const hrComment=coverage>=.6?`Herzfrequenz-Abdeckung ${Math.round(coverage*100)} %. Deine Garmin-Zonen wurden aus dem Pulsverlauf berechnet.`:'Zu wenige gültige Herzfrequenz-Sekunden für eine belastbare Zonenbewertung.';
 const coach=status==='Trainingsziel erreicht'?'Sehr kontrollierte Qualitätseinheit. Morgen locker laufen und Erholung beachten.':status==='Teilweise erreicht'?'Ein Teil der Wiederholungen lag im Zielbereich. Keine zusätzliche harte Einheit zum Nachholen erzwingen.':status==='Ziel nicht vollständig erreicht'?'Tempo oder Umfang wichen vom Plan ab. Ursachen wie Tagesform und Pausen prüfen, nicht kompensieren.':'Die Trainingsdaten allein erlauben noch keine vollständige Qualitätsaussage. Vergleiche dein Belastungsempfinden mit der geplanten Intensität.';
 return {status,detail,hrComment,coach,repeats,zones:z,covered,coverage,planned:workout.name, purpose:purpose(workout),splitPaces:raw.splits||[]};
}
function analysisHTML(a){if(!a)return '';const esc=escapeHTML;const rows=(a.repeats||[]).slice(0,16).map((r,i)=>`<tr><td>${i+1}</td><td>${esc(formatPace(r.paceSec/60))}/km</td><td>${r.hr||'–'} bpm</td><td>${r.paceSec>=265&&r.paceSec<=275?'✓':'–'}</td></tr>`).join('');const z=a.zones||[];return `<div class="pro-analysis"><h3>FORGED ANALYZE PRO</h3><p><strong>${esc(a.status)}</strong></p><p><b>Soll-Ist:</b> ${esc(a.detail)}</p>${rows?`<div style="overflow-x:auto"><table class="interval-table"><thead><tr><th>Intervall</th><th>Pace</th><th>Ø Puls</th><th>Ziel</th></tr></thead><tbody>${rows}</tbody></table></div>`:''}<p><b>HF-Zonen:</b> ${esc(['Unter Z1','Z1 122–131','Z2 132–140','Z3 141–149','Z4 150–156','Z5 ab 157'].map((label,i)=>`${label}: ${Math.round((z[i]||0)/60)} Min.`).join(' · '))}</p><p>${esc(a.hrComment)}</p><p><b>Trainingszweck:</b> ${esc(a.purpose||'')}</p><p><b>FORGED COACH:</b> ${esc(a.coach)}</p></div>`}
function coachWithFeedback(analysis,rpe,legs,note){let t=analysis.coach+' ';if(rpe>=8)t+='Du empfandest die Einheit als sehr hart: die nächsten Tage besonders auf Erholung achten.';else if(rpe<=4)t+='Die Einheit fühlte sich locker an; das ist kein Grund, die nächsten Einheiten ungeplant zu verschärfen.';else t+='Dein Belastungsempfinden passt zu einer kontrollierten Einheit.';if(legs==='pain')t+=' Bei Schmerzen keine weitere Tempoeinheit; Beschwerden abklären.';if(legs==='tired')t+=' Schwere Beine sprechen für eine besonders ruhige Folgebelastung.';if(note)t+=' Eigene Notiz gespeichert.';return t}
