import assert from 'node:assert/strict';
import {simulateTube,tubeRates,tubeEnergy,tubeParameters,tubeAt,coupling,tubeDefaults} from './tube-model.mjs';
const a=tubeParameters(),RL=20,y=[a.xeq+0.01,0.05,0,0,0],rates=tubeRates(0.3,y,a,RL),h=1e-7;
const dE=(tubeEnergy(y.map((v,i)=>v+h*rates[i]),a)-tubeEnergy(y.map((v,i)=>v-h*rates[i]),a))/(2*h);
assert.ok(Math.abs(dE-(rates[2]-rates[3]-rates[4]))<1e-6*Math.max(1,Math.abs(dE)),'Differential energy identity');

// Coupling: a single coil is centred on the magnet's rest position, so EMF is zero there and peaks a
// distance sigma away — the reason a one-coil generator is dead at maximum speed.
const one=tubeParameters({coils:1});
assert.ok(Math.abs(coupling(one.xeq,one))<1e-12,'Zero coupling with the magnet centred in the coil');
assert.ok(Math.abs(coupling(one.xeq+one.sigma,one)+coupling(one.xeq-one.sigma,one))<1e-12,'Coupling is odd about the coil centre');
for(const f of [0.3,0.6,2,3])assert.ok(Math.abs(coupling(one.xeq+f*one.sigma,one))<Math.abs(coupling(one.xeq+one.sigma,one)),'Coupling peaks one sigma from centre');

const m=simulateTube(),fine=simulateTube({},0.4);
assert.ok(m.loadPower>0&&Number.isFinite(m.loadPower));
assert.ok(Math.abs(m.residual)/Math.abs(m.inputWork)<1e-3,'Integrated energy residual');
assert.ok(Math.abs(m.loadPower-fine.loadPower)/fine.loadPower<0.01,'Step-halving convergence');
assert.ok(Math.abs(m.extracted-(m.loadPower+m.copperLoss))<1e-12*m.extracted,'Extraction splits into load and copper loss');
assert.ok(m.searched&&m.RL>0);
const fixed=simulateTube({loadResistance:m.RL});
assert.ok(Math.abs(fixed.loadPower-m.loadPower)/m.loadPower<1e-9,'Fixed load reproduces the searched optimum');
assert.ok(simulateTube({loadResistance:m.RL*25}).loadPower<m.loadPower&&simulateTube({loadResistance:m.RL/25}).loadPower<m.loadPower,'Optimum load is a maximum');
assert.equal(simulateTube({height:0}).loadPower,0);
assert.equal(simulateTube({height:0}).peakEmf,0);

// Suspension: with no spring the magnet levitates on the lower end magnet; with one it sits at mid-travel.
assert.ok(Math.abs(a.xeq-(a.d-a.h))<1e-12&&a.staticSag===0,'Levitating magnet rests at the design gap');
assert.equal(tubeParameters({springStiffness:5}).xeq,0,'Sprung magnet is preloaded to mid-travel');
// A vertical suspension tuned to the wave sags g/w^2 whatever the magnet weighs: 8.95 m at 6 s.
for(const i of [{},{magnetDiameter:20,magnetLength:20},{magnetDiameter:120,magnetLength:200,boreDiameter:130}]) {
  const p=tubeParameters(i),t=tubeParameters({...i,springStiffness:p.tunedStiffness});
  assert.ok(t.staticSag>=9.81/(p.w*p.w)-1e-9,'Tuned static sag is at least g/w^2, whatever the magnet weighs');
  assert.ok(Math.abs(t.naturalPeriod-tubeDefaults.period)<0.01*tubeDefaults.period,'Tuned natural period matches the wave');
  assert.ok(simulateTube({...i,springStiffness:p.tunedStiffness}).issues.some(s=>s.includes('sags')),'Unbuildable sag is flagged');
}
assert.ok(tubeParameters({springStiffness:200}).naturalPeriod<tubeParameters({springStiffness:20}).naturalPeriod,'Stiffer spring shortens the natural period');

// Coils only help once the stroke reaches past one coil's flux region.
const long={springStiffness:0.5,tubeLength:2500,springGap:150};
assert.ok(simulateTube({...long,coils:8}).loadPower>simulateTube({...long,coils:1}).loadPower,'Coils pay off on a long stroke');
assert.ok(simulateTube({coils:8}).loadPower<simulateTube({coils:8}).extracted,'Copper loss is subtracted from the load');
assert.ok(simulateTube({springStiffness:0.5,tubeLength:2500,springGap:150,coils:1}).issues.some(s=>s.includes('coil')),'Stroke outside the coil is flagged');
assert.ok(Math.abs(tubeAt(m,m.duration*2).energy-2*m.extracted*m.duration)<1e-9,'Cumulative energy across loops');

// Regression: a settle boundary landing a hair below `start` used to pin the sampling target there, so the
// integrator looped forever appending points without advancing time. This geometry reproduced it.
const hang=simulateTube({tilt:90,frictionCoefficient:0.01,height:2,period:8,boreDiameter:600,magnetDiameter:480,
  magnetLength:600,tubeLength:12000,springGap:720,coilLength:360,coilTurns:1500,wireDiameter:5,wallThickness:36,
  coils:16,springStiffness:499.4,loadResistance:0.1});
assert.ok(hang.points.length<2000&&Number.isFinite(hang.loadPower),'Integrator terminates at the settle boundary');
assert.ok(tubeParameters({coils:16}).Kpeak>0,'Peak coupling is found for an even number of coils');

assert.throws(()=>simulateTube({period:0}),RangeError);
assert.throws(()=>simulateTube({magnetDiameter:60}),RangeError,'Magnet must clear the bore');
assert.throws(()=>simulateTube({springGap:4000}),RangeError,'Levitation gap must fit the travel');
assert.throws(()=>simulateTube({coils:2.5}),RangeError);
assert.throws(()=>tubeAt(m,-1),RangeError);
for(const s of [{period:3},{period:12},{height:3},{coils:30,coilTurns:200},{friction:20}]) {
  const x=simulateTube(s);assert.ok(Number.isFinite(x.loadPower)&&x.loadPower>=0);
  assert.ok(Math.abs(x.residual)/Math.max(Math.abs(x.inputWork),1e-12)<1e-2,'Energy balance across parameter extremes');
}
console.log('PASS: energy identity, coupling shape, integration balance, convergence, load optimum, suspension geometry, tuned-sag invariant, coil scaling, validation, parameter extremes.');
const d=simulateTube();
console.log(JSON.stringify({load_W:d.loadPower,extracted_W:d.extracted,copperLoss_W:d.copperLoss,loadResistance_ohm:d.RL,coilResistance_ohm:d.a.Rcoil,
  magnetMass_kg:d.a.m,naturalPeriod_s:d.naturalPeriod,tuningRatio:d.tuningRatio,stroke_mm:d.stroke*1000,peakEmf_V:d.peakEmf,
  tunedStiffness_Npm:d.a.tunedStiffness,sagIfTuned_m:9.81/(d.a.w*d.a.w),dailyWh:d.dailyWh,issues:d.issues},null,2));
