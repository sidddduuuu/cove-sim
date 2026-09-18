import assert from 'node:assert/strict';
import {simulateSheet,sheetSweep,sheetDefaults} from './sheet.mjs';
import {simulate} from '../strip/model.mjs';
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1e-12,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
const one=simulateSheet({cells:1,sharing:'shared'}),strip=simulate();
near(one.power,strip.power);near(one.jetPower,strip.jetPower); // one cell is the strip model
const ind=simulateSheet({cells:25,sharing:'independent'});
near(ind.power,25*strip.power);near(ind.jetPower,25*strip.jetPower); // independent jets scale linearly
const sh=simulateSheet({cells:25,sharing:'shared'});
near(sh.jetPower,strip.jetPower); // shared source conserves total jet power
near(sh.power,strip.power/25);    // per-cell force /N, power /N², times N cells
near(sh.cellDiameter,sheetDefaults.diameter/5);
near(sh.area,25*0.15*0.02);
near(sh.density,sh.power/sh.area);
near(sh.net,sh.power*sheetDefaults.efficiency);
assert.ok(sh.hours>one.hours);
assert.throws(()=>simulateSheet({cells:0}),RangeError);
assert.throws(()=>simulateSheet({cells:2.5}),RangeError);
assert.throws(()=>simulateSheet({sharing:'series'}),RangeError);
assert.throws(()=>simulateSheet({cells:1000,sharing:'shared'}),RangeError); // per-cell jet < 1 mm
assert.equal(simulateSheet({cells:4,speed:3,length:400}).hours,null);
const rows=sheetSweep({cells:40});
assert.ok(rows.length>1&&rows.every(r=>r.independent>=r.shared));
assert.ok(rows.at(-1).independent>rows[0].independent&&rows.at(-1).shared<rows[0].shared);
console.log('PASS: sheet reduces to strip, independent scaling, shared conservation, geometry, validation, sweep monotonicity.');
console.log(JSON.stringify({defaultCells:sheetDefaults.cells,
  shared_total_uW:simulateSheet().power*1e6,independent_total_uW:simulateSheet({sharing:'independent'}).power*1e6,
  sheet_area_cm2:simulateSheet().area*1e4,shared_density_uW_per_m2:simulateSheet().density*1e6,
  shared_charge_years:simulateSheet().hours/8766},null,2));
