import assert from 'node:assert/strict';
import {simulate,sample,defaults} from './model.mjs';
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1e-12,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
const d=simulate();
assert.ok(d.power>0 && !d.issues.length);
near(d.mechanical,d.power+d.dampingLoss);
near(simulate({speed:0}).power,0);
near(simulate({speed:0}).peakQ,0);
assert.equal(simulate({speed:0}).hours,null);
near(simulate({efficiency:0}).net,0);
const half=simulate({speed:defaults.speed/2});
near(half.power,d.power/16); // F scales as u²; linear response power as F².
near(half.peakQ,d.peakQ/4);
const h=1e-5,t=1.234,a=sample(d,t-h),b=sample(d,t),c=sample(d,t+h),s=d.s;
near((c.q-a.q)/(2*h),b.velocity,1e-7);
near(s.m*(c.velocity-a.velocity)/(2*h)+s.c*b.velocity+s.k*b.q+s.theta*b.voltage,b.force,1e-7);
near(s.C*(c.voltage-a.voltage)/(2*h)+b.voltage/s.R,s.theta*b.velocity,1e-7);
near(d.points.slice(0,-1).reduce((a,p)=>a+p.power,0)/600,d.power);
assert.throws(()=>simulate({period:0}),RangeError);
assert.throws(()=>simulate({speed:NaN}),RangeError);
assert.throws(()=>simulate({diameter:30,width:20}),RangeError);
assert.ok(simulate({speed:3,length:400}).issues.length);
assert.equal(simulate({speed:3,length:400}).hours,null);
assert.deepEqual(defaults,{length:150,width:20,substrate:0.2,piezo:0.2,diameter:15,speed:1,period:6,resistance:5,addedMass:5,damping:0.08,strainLimit:500,battery:1000,efficiency:0.6});
for(const period of [0.5,2,6,15]) for(const resistance of [0.01,5,100]) {
  const m=simulate({period,resistance});
  near(m.mechanical,m.power+m.dampingLoss);
  assert.ok(Number.isFinite(m.power)&&m.power>=0);
}
console.log('PASS: zero input, equations of motion, energy balance, scaling, quadrature, validation, invalid-sizing suppression and parameter sweep.');
console.log(JSON.stringify({power_W:d.power,estimated_net_W:d.net,jet_W:d.jetPower,peak_mm:d.peakQ*1000,strain_micro:d.strain*1e6,natural_Hz:d.frequency,charge_years:d.hours/(24*365.25),issues:d.issues},null,2));
