// Runs both simulations across parameter sweeps and writes RESULTS.md.
import {writeFileSync} from 'node:fs';
import {simulate} from './model.mjs';
import {simulateSheet} from './sheet.mjs';
import {simulateSystem,systemDefaults} from './full-model.mjs';
import {simulateNode,nodeDefaults} from './node-model.mjs';
const uW=v=>(v*1e6).toFixed(2),years=h=>h===null?'—':(h/8766).toLocaleString(undefined,{maximumFractionDigits:0});
const lines=['# Simulation results','',`Generated ${new Date().toISOString().slice(0,10)} by \`node run.mjs\`. Screening-model outputs, not measurements. Defaults from MODEL.md unless a column says otherwise.`,''];
const table=(head,rows)=>{lines.push('| '+head.join(' | ')+' |','|'+head.map(()=>'---').join('|')+'|');for(const r of rows)lines.push('| '+r.join(' | ')+' |');lines.push('');};

// 1. Full product: wave height × period
lines.push('## 1. Full product (float → water column → jet → leaf)','',`Defaults: tube ${systemDefaults.tubeLength} m × ${systemDefaults.tubeDiameter} mm, nozzle ${systemDefaults.nozzle} mm, float ${systemDefaults.floatDiameter} m, hull ${systemDefaults.hullMass} kg, leaf ${systemDefaults.leafLength} mm, load ${systemDefaults.resistance} MΩ. Net = AC × ${systemDefaults.efficiency} × dock ${systemDefaults.dockEfficiency}.`,'');
const rows1=[];
for(const height of [0.05,0.1,0.2,0.3]) for(const period of [2,3,4,6]) {
  try{const m=simulateSystem({height,period});
    rows1.push([height,period,uW(m.power),uW(m.net),m.peakJet.toFixed(2),(m.peakQ*1000).toFixed(1),(m.strain*1e6).toFixed(0),m.issues.length?'suppressed: '+m.issues[0]:years(m.net>0?systemDefaults.batteryWh/m.net:null)]);}
  catch(e){rows1.push([height,period,'—','—','—','—','—','solver: '+e.message]);}
}
table(['H (m)','T (s)','AC µW','net µW','peak jet m/s','peak bend mm','strain µε','years per 1 kWh'],rows1);

// 2. Full product: tube length tuning at default wave
lines.push('### Water-column tuning (H 0.1 m, T 3 s)','');
const rows2=[];
for(const tubeLength of [1,1.5,2,2.5,3,4]) {
  const m=simulateSystem({tubeLength});
  rows2.push([tubeLength,m.waterPeriod.toFixed(2),uW(m.power),m.peakJet.toFixed(2),m.issues.length?'issues':'ok']);
}
table(['tube length m','column natural period s','AC µW','peak jet m/s','screen'],rows2);

// 3. Strip
const d=simulate();
lines.push('## 2. Single strip (defaults)','',`AC power ${uW(d.power)} µW · jet input ${(d.jetPower*1000).toFixed(1)} mW · conversion ${(d.power/d.jetPower*100).toFixed(4)}% · peak bend ${(d.peakQ*1000).toFixed(2)} mm · strain ${(d.strain*1e6).toFixed(0)} µε · natural ${d.frequency.toFixed(2)} Hz · ${years(d.hours)} years per 1 kWh.`,'');

// 4. Sheet: cells × sharing
lines.push('## 3. Sheet (cell size × cell count)','','Per-cell 150 × 20 mm strip, source jet 15 mm at 1 m/s, 6 s pulses.','');
const rows4=[];
for(const cells of [1,4,10,25,50,100,200]) {
  const row=[cells];
  for(const sharing of ['shared','independent']) {
    try{const s=simulateSheet({cells,sharing});row.push(uW(s.power),(s.jetPower*1000).toFixed(1),years(s.hours));}
    catch(e){row.push('—','—','—');}
  }
  row.push((cells*0.15*0.02*1e4).toFixed(0));
  rows4.push(row);
}
table(['cells','shared AC µW','shared jet mW','shared yrs/kWh','indep. AC µW','indep. jet mW','indep. yrs/kWh','sheet cm²'],rows4);

// 5. Sheet: cell size at fixed 10 cells, independent
lines.push('### Cell size sweep (10 cells, independent jets, load 5 MΩ)','');
const rows5=[];
for(const length of [80,100,150,200,300]) for(const width of [15,20,40]) {
  try{const s=simulateSheet({cells:10,sharing:'independent',length,width});
    rows5.push([length,width,uW(s.power),(s.strain*1e6).toFixed(0),s.frequency.toFixed(2),s.issues.length?'suppressed':'ok']);}
  catch(e){rows5.push([length,width,'—','—','—',e.message]);}
}
table(['cell length mm','cell width mm','sheet AC µW','strain µε','natural Hz','screen'],rows5);

// 6. Proposed node: pendulum → generator → battery → dock
lines.push('## 4. Proposed node (sealed pendulum → generator → battery → dock → AUV)','',`Defaults: hull ${nodeDefaults.hullLength} m × Ø${nodeDefaults.hullDiameter} m, pendulum ${nodeDefaults.pendulumMass} kg on a ${nodeDefaults.armLength} m arm, spring-tuned to the wave period, generator damping auto-matched, drive efficiency ${nodeDefaults.driveEfficiency}, availability ${nodeDefaults.availability}, node battery ${nodeDefaults.nodeBatteryWh/1000} kWh, dock ${nodeDefaults.dockPowerW} W at ${nodeDefaults.dockEfficiency}. AUV ${nodeDefaults.auvWh} Wh arriving at ${nodeDefaults.auvArrivalSoc*100}%.`,'');
const rows6=[];
for(const [label,i] of [['default 12 m / 10 t, H 1 m T 6 s',{}],['default, H 0.5 m',{height:0.5}],['default, H 1.5 m T 5 s',{height:1.5,period:5}],['default, H 2 m T 8 s',{height:2,period:8}],['default, H 1 m T 10 s',{period:10}],
  ['10 m / 6 t, H 1 m T 6 s',{hullLength:10,hullDiameter:2.4,hullMass:9000,pendulumMass:6000,gyrationRadius:1.0,armLength:0.95}],
  ['8 m / 3 t, H 1 m T 6 s',{hullLength:8,hullDiameter:2,hullMass:6000,pendulumMass:3000,gyrationRadius:0.85,armLength:0.8}],
  ['8 m / 3 t, H 1.5 m T 5 s',{hullLength:8,hullDiameter:2,hullMass:6000,pendulumMass:3000,gyrationRadius:0.85,armLength:0.8,height:1.5,period:5}],
  ['4.5 m / 0.4 t (earlier design doc), H 1 m T 6 s',{hullLength:4.5,hullDiameter:1,hullMass:1200,pendulumMass:400,gyrationRadius:0.42,armLength:0.4}],
  ['default, gravity pendulum only (no spring)',{springTuning:0}]]) {
  try{const m=simulateNode(i);rows6.push([label,m.electrical.toFixed(0),(m.captureWidth/m.a.p.hullLength).toFixed(3),(m.peakPsi*180/Math.PI).toFixed(0),(m.dailyWh/1000).toFixed(2),m.sessionHours.toFixed(1),m.chargesPerDay.toFixed(2),m.issues.length?'issue: '+m.issues[0].slice(0,50):'ok']);}
  catch(e){rows6.push([label,'—','—','—','—','—','—',e.message]);}
}
table(['configuration','electrical W','capture width / hull length','pendulum swing °','kWh/day','session h','charges/day','screen'],rows6);

lines.push('## Reading these numbers','','Every configuration here lands in the microwatt range while the prescribed jets carry tens of milliwatts to watts; conversion is 10⁻⁴ to 10⁻² percent because a 0.17–0.5 Hz pulse bends a 6 Hz strip quasi-statically. Adding cells on a shared source reduces total power (per-cell force ∝ 1/N, power ∝ 1/N², N cells → 1/N). Independent jets scale linearly but the total jet input must come from the wave-to-water stage, which the full-product model shows delivers under a watt of jet power at a 0.1 m wave. Charging a 1 kWh vehicle is 10⁴–10⁶ years in every case.','','The pendulum node closes the gap because it puts tonnes, not grams, in motion at wave frequency and takes the energy out with a generator at ~80% instead of a piezo at 0.01%. The size needed is set by the physics of an inertial absorber (power scales with pendulum mass × wave height² ÷ period³): roughly a 10–12 m hull with a 6–10 t spring-tuned pendulum gives one small-survey charge per day in 1 m / 6 s seas; an 8 m hull with 3 t does it at a short-period 1.5 m site. The 4.5 m / 400 kg unit in the earlier design document makes single-digit watts in the same seas and is a sensor-power node, not an AUV charger. The charge session itself (3 h at 1.5 kW) always comes from the node battery; the waves decide how many sessions per day the battery can be refilled for.','');
writeFileSync('RESULTS.md',lines.join('\n'));
console.log(lines.join('\n'));
