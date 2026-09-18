// Assembles the browser simulations from the editable .mjs sources so the pages work offline.
import {readFileSync,writeFileSync} from 'node:fs';
const d3=readFileSync('simulation.html','utf8').split('\n').find(l=>l.startsWith('!function(t,n){"object"==typeof exports'));
if(!d3)throw new Error('d3 bundle not found in simulation.html');
const inline=(file)=>readFileSync(file,'utf8')
  .replace(/^import .*$/mg,'')
  .replace(/^export (const|function) /mg,'$1 ');
const strip=inline('model.mjs'),sheet=inline('sheet.mjs'),full=inline('full-model.mjs').replace(/stripModel\(/g,'simulate('),node=inline('node-model.mjs'),tube=inline('tube-model.mjs');
for(const [template,out,models] of [
  ['product-simulation.template.html','product-simulation.html',strip+'\n'+full],
  ['sheet-simulation.template.html','sheet-simulation.html',strip+'\n'+sheet],
  ['node-simulation.template.html','node-simulation.html',node],
  ['tube-simulation.template.html','tube-simulation.html',tube]]) {
  const html=readFileSync(template,'utf8').replace('/*__D3__*/',()=>d3).replace('/*__MODEL__*/',()=>models);
  writeFileSync(out,html);
  console.log(out,html.length,'bytes');
}
