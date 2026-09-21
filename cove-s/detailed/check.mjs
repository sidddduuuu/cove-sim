import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {drag,spectrum,response,simulate,defaults} from './physics.mjs';
const obs=JSON.parse(readFileSync(new URL('./data/observations.json',import.meta.url)));
assert.equal(drag(1025,1,2,0),0);assert.equal(drag(1025,1,2,-2),-drag(1025,1,2,2));assert.equal(drag(1025,1,2,2),4*drag(1025,1,2,1));
const terms=spectrum(2,8);assert.ok(Math.abs(terms.reduce((a,t)=>a+t.a*t.a/2,0)-(2/4)**2)<1e-12);
const calm=simulate({H:0,wind:0,gust:0,current:0,speed:0});assert.equal(calm.avgPower,0);assert.equal(calm.stroke,0);assert.equal(calm.beamDrag,0);assert.ok(Math.abs(calm.avgLoad-60)<1e-6);
const regular=simulate(),rigid=simulate({rigid:true});assert.ok(rigid.stroke<regular.stroke*.001);assert.ok(rigid.avgPower<regular.avgPower*.001);
assert.ok(response({L:40}).terms[5].attenuation<response({L:5}).terms[5].attenuation);
const stationaryShort=simulate({H:0,current:1,speed:0,L:5}),stationaryLong=simulate({H:0,current:1,speed:0,L:20});assert.ok(Math.abs(stationaryLong.beamDrag/stationaryShort.beamDrag-4)<1e-9);
for(const p of [...obs.presets,{H:16,T:18,wind:45,gust:60},{L:3,H:3},{L:50,H:1},{pto:0},{cd:0},{rigid:true}]){
 const r=simulate(p);assert.ok(Math.abs(r.residual)<1e-6,'Energy ledger closes');
 for(const s of r.points){for(const v of Object.values(s))assert.ok(Number.isFinite(v));assert.ok(s.power>=0&&s.power<=2000);assert.ok(Math.abs(s.mechanical-s.power-s.foil-s.loss)<1e-8);assert.ok(s.loss>=-1e-8);assert.ok(s.battery>=0&&s.battery<=60000);}
 if(p.H>4.5){assert.equal(r.avgPower,0);assert.ok(r.warnings.some(w=>w.includes('Survival')));}
}
assert.equal(simulate({pto:0}).avgPower,0);
for(const p of obs.presets)assert.ok(p.time.endsWith('Z')&&p.kind==='observed');
console.log('PASS: quadratic drag, sign, spectral variance, zero-wave behavior, rigid lock, depth attenuation, length drag, conversion and battery energy conservation, observed presets and storm cutoff.');
console.log(JSON.stringify({baseline:{powerW:regular.avgPower,strokeM:regular.stroke,peakForceN:regular.peakForce,warnings:regular.warnings},rigidPowerW:rigid.avgPower,observations:obs.validRows},null,2));
