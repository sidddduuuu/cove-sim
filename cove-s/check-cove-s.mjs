import assert from 'node:assert/strict';
import {coveSDefaults,coveSParameters,coveSAtSea,seaStateAt,simulateCoveS,coveSAt,waveFlux} from './cove-s-model.mjs';

assert.ok(waveFlux(1,6)>2500&&waveFlux(1,6)<3500,'Deep-water wave flux');
const p=coveSParameters(),rated=coveSAtSea(p,2,6);
assert.ok(rated.electrical>0&&rated.electrical<=p.ratedPowerW,'Electrical power bounded by rating');
assert.equal(coveSAtSea(p,0.05,6).electrical,0,'Cut-in');
assert.equal(coveSAtSea(p,5,8).electrical,0,'Survival feathering');
assert.deepEqual(seaStateAt(0,'design'),{height:1,period:6,label:'design sea'});

const design=simulateCoveS({scenario:'design',days:7});
assert.equal(design.completed,7,'One daily AUV service in design sea');
assert.equal(design.deferred,0,'No deferred service in design sea');
assert.ok(design.distanceKm>200,'Long-distance progress while servicing');
assert.ok(design.minBatteryWh>=design.reserveWh-1e-6,'Reserve protection');
assert.ok(Math.abs(design.energyResidualWh)<2,'Mission energy balance');
assert.ok(coveSAt(design,12).h===12&&coveSAt(design,12).batteryWh>0,'Timeline interpolation');

const calm=simulateCoveS({scenario:'calm',days:14,batteryWh:20000,initialSoc:0.5,auvWh:5000});
assert.ok(calm.deferred>0||calm.minBatteryWh<=calm.reserveWh+1,'Calm spell exposes storage limit');
const noAuv=simulateCoveS({scenario:'variable',days:3,visitsPerDay:0});
assert.equal(noAuv.completed,0);assert.equal(noAuv.deferred,0);
assert.throws(()=>simulateCoveS({initialSoc:0.1,reserveSoc:0.2}),RangeError);
assert.throws(()=>simulateCoveS({scenario:'unknown'}),RangeError);
assert.throws(()=>coveSAt(design,-1),RangeError);

console.log('PASS: wave flux, WEC limits, propulsion, charging schedule, reserve protection, energy balance, calm-spell behavior and validation.');
console.log(JSON.stringify({distance_km:design.distanceKm,generated_kWh:design.generatedWh/1000,auv_charges:design.completed,
  min_soc:design.minBatteryWh/design.p.batteryWh,end_soc:design.endBatteryWh/design.p.batteryWh,dock_kWh:design.dockWh/1000},null,2));
