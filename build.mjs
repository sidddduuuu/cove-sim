// Assembles the browser simulations from the editable .mjs sources so the pages work offline.
import {readFileSync,writeFileSync} from 'node:fs';
const d3=readFileSync('strip/simulation.html','utf8').split('\n').find(l=>l.startsWith('!function(t,n){"object"==typeof exports'));
if(!d3)throw new Error('d3 bundle not found in strip/simulation.html');
const inline=(file)=>readFileSync(file,'utf8')
  .replace(/^import .*$/mg,'')
  .replace(/^export (const|function) /mg,'$1 ');
const strip=inline('strip/model.mjs'),sheet=inline('sheet/sheet.mjs'),full=inline('product/full-model.mjs').replace(/stripModel\(/g,'simulate('),node=inline('node/node-model.mjs'),tube=inline('tube/tube-model.mjs');
for(const [template,out,models] of [
  ['product/product-simulation.template.html','product/product-simulation.html',strip+'\n'+full],
  ['sheet/sheet-simulation.template.html','sheet/sheet-simulation.html',strip+'\n'+sheet],
  ['node/node-simulation.template.html','node/node-simulation.html',node],
  ['tube/tube-simulation.template.html','tube/tube-simulation.html',tube]]) {
  const html=readFileSync(template,'utf8').replace('/*__D3__*/',()=>d3).replace('/*__MODEL__*/',()=>models);
  writeFileSync(out,html);
  console.log(out,html.length,'bytes');
}
