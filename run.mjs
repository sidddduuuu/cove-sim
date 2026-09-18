// Runs both simulations across parameter sweeps and writes RESULTS.md.
import {writeFileSync} from 'node:fs';
import {simulate} from './strip/model.mjs';
import {simulateSheet} from './sheet/sheet.mjs';
import {simulateSystem,systemDefaults} from './product/full-model.mjs';
import {simulateNode,nodeDefaults} from './node/node-model.mjs';
import {simulateTube,tubeParameters,tubeDefaults} from './tube/tube-model.mjs';
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



// Horizontal sizing: scale every dimension together, fill the pipe with coils, tune the spring to the wave,
// and pick the load that maximises power among the settings whose stroke still fits the travel. The
// unconstrained optimum just runs the magnet into the end magnets.
const TARGET=tubeDefaults.auvWh*(1-tubeDefaults.auvArrivalSoc)/(24*tubeDefaults.availability);
function sizedPipe(s,{mu=0.01,height=1,period=6,turns=1500}={}) {
  const bore=50*s,geom={tilt:90,frictionCoefficient:mu,height,period,boreDiameter:bore,
    magnetDiameter:Math.min(bore-2,40*s),magnetLength:50*s,tubeLength:1000*s,springGap:60*s,
    coilLength:30*s,coilTurns:turns,wireDiameter:Math.min(5,0.5*s),wallThickness:Math.min(50,Math.max(3,3*s)),coils:1};
  const probe=tubeParameters(geom),travel=2*probe.h;
  geom.coils=Math.max(1,Math.min(200,Math.floor(travel/(2*probe.sigma))));
  const tuned={...geom,springStiffness:tubeParameters(geom).tunedStiffness};
  let best=null;
  for(let e=-1;e<=5;e+=0.2) {
    try {
      const r=simulateTube({...tuned,loadResistance:Math.pow(10,e)});
      if(r.stroke>0.8*travel||r.issues.some(i=>i.includes('settled')||i.includes('end magnet')))continue;
      if(!best||r.loadPower>best.loadPower)best=r;
    } catch {}
  }
  return {best,travel};
}

// 5. PVC pipe linear generator
lines.push('## 5. PVC pipe linear generator (magnet sliding through coils)','',`Defaults: ${tubeDefaults.tubeLength} mm travel in a ${tubeDefaults.boreDiameter} mm bore, ${tubeDefaults.magnetDiameter}×${tubeDefaults.magnetLength} mm NdFeB magnet (${tubeParameters().m.toFixed(2)} kg), ${tubeDefaults.coils}×${tubeDefaults.coilTurns} turns of ${tubeDefaults.wireDiameter} mm wire, load auto-matched. "Levitation" = no spring: the end magnets hold the magnet up and set the stiffness.`,'');
const tube=(i)=>{const m=simulateTube(i);return [watts(m.loadPower),m.naturalPeriod.toFixed(2),(m.stroke*1000).toFixed(2),volts(m.peakEmf),m.issues.length?'suppressed: '+m.issues[0].slice(0,58):years(m.hours)];};
const watts=v=>{const a=Math.abs(v);return a<1e-11?v.toExponential(1)+' W':a<1e-6?(v*1e9).toFixed(2)+' nW':a<1e-3?(v*1e6).toFixed(2)+' µW':a<1?(v*1e3).toFixed(2)+' mW':v.toFixed(2)+' W';};
const volts=v=>{const a=Math.abs(v);return a<1e-3?(v*1e6).toFixed(0)+' µV':a<1?(v*1e3).toFixed(0)+' mV':v.toFixed(1)+' V';};
const rows7=[];
for(const height of [0.5,1,2]) for(const period of [4,6,8]) {
  try{rows7.push([height,period,...tube({height,period})]);}catch(e){rows7.push([height,period,'—','—','—','—','solver: '+e.message]);}
}
table(['H (m)','T (s)','load power','natural period s','stroke mm','peak EMF','years per 1 kWh'],rows7);

lines.push('### Suspension stiffness (H 1 m, T 6 s)','','The end magnets must hold the magnet up, so with no spring the suspension is stiff and the magnet rides with the pipe. Softening it toward the 6 s wave means a spring that sags at least g/ω² = 8.95 m under any mass.','');
const rows8=[];
for(const [label,k] of [['levitation (magnets only)',0],['500 N/m',500],['50 N/m',50],['5 N/m',5],['tuned to the wave',tubeParameters().tunedStiffness]]) {
  try{const m=simulateTube({springStiffness:k});
    rows8.push([label,k===0?'—':k.toFixed(2),...tube({springStiffness:k}).slice(0,4),(m.a.staticSag||0).toFixed(2),m.issues.length?'suppressed: '+m.issues[0].slice(0,44):'ok']);}
  catch(e){rows8.push([label,'—','—','—','—','—','—','solver: '+e.message]);}
}
table(['suspension','spring N/m','load power','natural period s','stroke mm','peak EMF','static sag m','screen'],rows8);

lines.push('### Scaling the pipe (tuned suspension, H 1 m, T 6 s)','','The best case this architecture can reach, ignoring that the tuned suspension above is not buildable vertically.','');
const rows9=[];
for(const [label,i] of [['50 mm bore, 1 m, 1 coil',{}],['50 mm bore, 1 m, 10 coils',{coils:10}],
  ['110 mm bore, 2 m, 10 coils',{boreDiameter:110,magnetDiameter:100,magnetLength:150,tubeLength:2000,springGap:150,coils:10,coilTurns:2000,wireDiameter:1,coilLength:50}],
  ['160 mm bore, 4 m, 20 coils',{boreDiameter:160,magnetDiameter:150,magnetLength:300,tubeLength:4000,springGap:400,coils:20,coilTurns:3000,wireDiameter:1.5,coilLength:60}]]) {
  try{const p=tubeParameters(i),s={...i,springStiffness:p.tunedStiffness};
    rows9.push([label,p.m.toFixed(1),...tube(s).slice(0,4)]);}
  catch(e){rows9.push([label,'—','—','—','—','—']);}
}
table(['pipe','magnet kg','load power','natural period s','stroke mm','peak EMF'],rows9);

lines.push('### The tuning wall','','A vertical spring-mass tuned to a wave period sags g/ω² under its own weight, whatever the mass. That is the same length as a pendulum of the same period — which is why the pendulum node reaches wave frequency in a 12 m hull and a straight pipe cannot.','');
table(['wave period s','required stiffness / mass 1/s²','static sag m'],[4,6,8,10,12].map(T=>[T,(4*Math.PI**2/T**2).toFixed(3),(9.81*T*T/(4*Math.PI**2)).toFixed(2)]));


lines.push('## 6. Horizontal pipe: sizing for one AUV charge per day','','Lying the pipe flat takes gravity off the axis, so the suspension no longer has to hold the magnet up and can be tuned to the wave. The magnet then rests on the bore instead, and sliding friction replaces the sag as the limit. Both the friction force and the wave forcing scale with the magnet mass, so their ratio mu·g/(a·ω²) is a property of the sea state and the bearing alone — no magnet is heavy enough to break loose if it exceeds 1.','');
table(['wave','breakaway limit on mu (a·ω²/g)'],[[0.5,6],[1,6],[1,4],[1.5,5],[2,4],[2,8]].map(([H,T])=>[`H ${H} m, T ${T} s`,(H/2*(2*Math.PI/T)**2/9.81).toFixed(3)]));

lines.push('### Friction is the whole design (12 m pipe, H 1 m, T 6 s)','');
const rows10=[];
for(const mu of [0.003,0.01,0.02,0.03,0.05,0.1]) {
  const {best:r}=sizedPipe(12,{mu});
  rows10.push(r?[mu,r.stiction.toFixed(2),watts(r.loadPower),watts(r.frictionLoss),r.stroke.toFixed(2),r.issues.length?'suppressed: '+r.issues[0].slice(0,40):'ok']:[mu,'—','—','—','—','no feasible load']);
}
table(['bore friction mu','friction / wave forcing','load power','friction loss','stroke m','screen'],rows10);

lines.push('### How big it has to get (horizontal, tuned, mu 0.01, H 1 m / T 6 s)','',`One 4.5 kWh AUV arriving at 10% needs ${TARGET.toFixed(0)} W of load power at ${(tubeDefaults.availability*100).toFixed(0)}% availability. Every dimension scales together; coils fill the pipe and the load is chosen for maximum power among the settings whose stroke still fits the travel.`,'');
const rows11=[];
for(const s of [1,2,4,8,10,11,12,13]) {
  const {best:r}=sizedPipe(s);
  rows11.push(r?[(50*s)+' mm',(r.a.p.tubeLength/1000).toFixed(1),r.a.m.toFixed(0),r.a.p.coils,watts(r.loadPower),r.stroke.toFixed(2),(r.loadPower/r.a.m).toFixed(3),(r.loadPower*24*tubeDefaults.availability/(tubeDefaults.auvWh*(1-tubeDefaults.auvArrivalSoc))).toFixed(2)]:[(50*s)+' mm','—','—','—','—','—','—','—']);
}
table(['bore','pipe m','magnet kg','coils','load power','stroke m','W per kg','charges/day'],rows11);

lines.push('### The sized unit','');
{
  const {best:r}=sizedPipe(12),p=r.a.p;
  table(['quantity','value'],[['bore',p.boreDiameter+' mm'],['pipe travel length',(p.tubeLength/1000).toFixed(1)+' m'],
    ['magnet',p.magnetDiameter+' × '+p.magnetLength+' mm NdFeB, '+r.a.m.toFixed(0)+' kg'],
    ['winding',p.coils+' × '+p.coilTurns+' turns of '+p.wireDiameter+' mm wire'],
    ['tuning spring',p.springStiffness.toFixed(0)+' N/m → '+r.naturalPeriod.toFixed(2)+' s natural period'],
    ['stroke',r.stroke.toFixed(2)+' m peak to peak in '+(2*r.a.h).toFixed(1)+' m of travel'],
    ['load / coil resistance',r.RL.toFixed(0)+' Ω / '+r.a.Rcoil.toFixed(0)+' Ω'],
    ['load power',watts(r.loadPower)],['copper loss',watts(r.copperLoss)],['friction loss',watts(r.frictionLoss)],
    ['peak EMF',r.peakEmf.toFixed(0)+' V'],['charges per day',(r.loadPower*24*tubeDefaults.availability/(tubeDefaults.auvWh*(1-tubeDefaults.auvArrivalSoc))).toFixed(2)]]);
  lines.push('### The same unit across sea states','');
  const rows12=[];
  for(const [H,T] of [[0.5,6],[1,6],[1.5,5],[2,4],[2,8],[1,10]]) {
    const {best:x}=sizedPipe(12,{height:H,period:T});
    rows12.push(x?[`${H} m / ${T} s`,watts(x.loadPower),x.stroke.toFixed(2),(x.loadPower*24*tubeDefaults.availability/(tubeDefaults.auvWh*(1-tubeDefaults.auvArrivalSoc))).toFixed(2)]:[`${H} m / ${T} s`,'—','—','—']);
  }
  table(['sea state','load power','stroke m','charges/day'],rows12);
}

lines.push('## Reading these numbers','','Every configuration here lands in the microwatt range while the prescribed jets carry tens of milliwatts to watts; conversion is 10⁻⁴ to 10⁻² percent because a 0.17–0.5 Hz pulse bends a 6 Hz strip quasi-statically. Adding cells on a shared source reduces total power (per-cell force ∝ 1/N, power ∝ 1/N², N cells → 1/N). Independent jets scale linearly but the total jet input must come from the wave-to-water stage, which the full-product model shows delivers under a watt of jet power at a 0.1 m wave. Charging a 1 kWh vehicle is 10⁴–10⁶ years in every case.','','The pendulum node closes the gap because it puts tonnes, not grams, in motion at wave frequency and takes the energy out with a generator at ~80% instead of a piezo at 0.01%. The size needed is set by the physics of an inertial absorber (power scales with pendulum mass × wave height² ÷ period³): roughly a 10–12 m hull with a 6–10 t spring-tuned pendulum gives one small-survey charge per day in 1 m / 6 s seas; an 8 m hull with 3 t does it at a short-period 1.5 m site. The 4.5 m / 400 kg unit in the earlier design document makes single-digit watts in the same seas and is a sensor-power node, not an AUV charger. The charge session itself (3 h at 1.5 kW) always comes from the node battery; the waves decide how many sessions per day the battery can be refilled for.','');
lines.push('The PVC pipe generator removes the piezo conversion penalty — a coil and a magnet are an efficient transducer — and still lands in the nanowatt range as built, for a different reason: the suspension. Repelling end magnets strong enough to hold the magnet up are stiff (0.25 s natural period against a 6 s wave), so the magnet rides with the pipe instead of lagging it, and the relative stroke is under 2 mm. Softening the suspension to wave frequency is not a tuning choice but a geometry problem: a vertical spring-mass at 6 s sags 8.95 m under its own weight regardless of mass, more travel than the pipe has. Even granting the impossible spring, a 4 m pipe with a 40 kg magnet and 20 coils reaches single-digit watts. A pendulum escapes this because its restoring torque comes from gravity itself and a torsion spring adds stiffness without having to carry the weight, which is why the same 8.95 m appears as a hull dimension rather than a spring deflection.','');
lines.push('Laid flat the pipe escapes the sag and buys a friction problem instead: the magnet rests on the bore, and it only breaks loose if the bearing keeps mu below a·ω²/g — 0.056 in 1 m / 6 s seas, which rules out a magnet sliding on plastic and demands rollers or a radial bearing. Granted mu = 0.01, one AUV charge per day needs a 12 m pipe of 600 mm bore holding an 814 kg NdFeB magnet that strokes 8.2 m, for 581 W. That is the same 12 m length as the pendulum node for a similar duty, but the node makes its moving mass out of whatever is heavy and cheap, while here the moving mass has to be the magnet itself — roughly fifty thousand dollars of neodymium, plus an 8 m sliding seal, against a 10 t block of steel or concrete on a shaft.','');
writeFileSync('RESULTS.md',lines.join('\n'));
console.log(lines.join('\n'));
