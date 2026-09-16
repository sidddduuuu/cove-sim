import assert from 'node:assert/strict';
import {simulateSystem,systemRates,systemEnergy,systemParameters,systemAt} from './full-model.mjs';
const a=systemParameters(),y=[.02,.03,.04,-.05,.001,.002,1,0,0,0,0,0],rates=systemRates(.3,y,a),h=1e-6;
const dE=(systemEnergy(y.map((v,i)=>v+h*rates[i]),a)-systemEnergy(y.map((v,i)=>v-h*rates[i]),a))/(2*h);
assert.ok(Math.abs(dE-(rates[8]-rates[9]))<1e-7,'Differential energy identity');
const m=simulateSystem(),fine=simulateSystem({},0.5),zero=simulateSystem({height:0});
assert.ok(m.power>0&&Number.isFinite(m.power));
assert.ok(Math.abs(m.residual)/Math.max(Math.abs(m.inputWork),1e-12)<1e-5,'Integrated energy residual');
assert.ok(Math.abs(m.power-fine.power)/fine.power<0.01,'Step-halving convergence');
assert.equal(zero.power,0);assert.equal(zero.peakJet,0);assert.equal(systemAt(zero,100).energy,0);
assert.equal(simulateSystem({coupling:0}).power,0);
assert.equal(simulateSystem({efficiency:0}).net,0);
assert.ok(Math.abs(systemAt(m,m.duration*2).energy-2*m.energy)<1e-10,'Cumulative energy across playback loops');
assert.throws(()=>simulateSystem({height:NaN}),RangeError);
assert.throws(()=>simulateSystem({period:0}),RangeError);
assert.throws(()=>simulateSystem({},0),RangeError);
assert.throws(()=>systemAt(m,-1),RangeError);
for(const settings of [{period:1},{period:10},{height:0.5,leafLength:200},{nozzle:8,tubeDiameter:60}]) {
  const s=simulateSystem(settings);assert.ok(Number.isFinite(s.power));
  assert.ok(Math.abs(s.residual)/Math.max(Math.abs(s.inputWork),1e-12)<2e-4);
}
console.log('PASS: coupled energy identity, integration balance, time-step convergence, zero waves/coupling, storage accounting, bounds and parameter extremes.');
console.log(JSON.stringify({power_uW:m.power*1e6,peakJet:m.peakJet,peakBend_mm:m.peakQ*1000,strain_micro:m.strain*1e6,issues:m.issues,steps:m.steps,energyResidual:m.residual},null,2));
