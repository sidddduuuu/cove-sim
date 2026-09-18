// Sheet of piezo cells: N identical strips fed by a shared or independent pulsed source. See MODEL.md §Sheet.
import {simulate,defaults,bounds} from '../strip/model.mjs';

export const sheetDefaults=Object.freeze({...defaults,cells:10,sharing:'shared'});
export const sheetBounds=Object.freeze({...bounds,cells:[1,1000]});
export const sharingModes=Object.freeze(['shared','independent']);

// 'shared': one source of the given nozzle diameter and speed is split evenly across N cells
//           (per-cell jet area = A/N, same speed). Total jet power is fixed by the source.
// 'independent': every cell receives its own jet of the given diameter and speed (upper bound;
//           total jet power grows with N and must be supplied by the upstream pump).
export function simulateSheet(input={}) {
  const p={...sheetDefaults,...input};
  if(!Number.isInteger(p.cells)||p.cells<sheetBounds.cells[0]||p.cells>sheetBounds.cells[1])
    throw new RangeError(`cells must be an integer between ${sheetBounds.cells[0]} and ${sheetBounds.cells[1]}.`);
  if(!sharingModes.includes(p.sharing))throw new RangeError(`sharing must be one of ${sharingModes.join(', ')}.`);
  const {cells,sharing,...strip}=p;
  const cellDiameter=sharing==='shared'?p.diameter/Math.sqrt(cells):p.diameter;
  if(cellDiameter<bounds.diameter[0])
    throw new RangeError(`Too many cells for this source: per-cell jet would be ${cellDiameter.toFixed(2)} mm (< ${bounds.diameter[0]} mm). Use fewer cells or a larger source.`);
  const cell=simulate({...strip,diameter:cellDiameter});
  const power=cell.power*cells,net=power*p.efficiency,jetPower=cell.jetPower*cells;
  const area=cells*(p.length/1000)*(p.width/1000);
  return {p:Object.freeze(p),cell,cells,sharing,cellDiameter,power,net,jetPower,area,
    density:power/area,perCell:cell.power,strain:cell.strain,peakQ:cell.peakQ,frequency:cell.frequency,
    issues:cell.issues,hours:net>0&&!cell.issues.length?p.battery/net:null};
}

export function sheetSweep(input={},counts) {
  const base={...sheetDefaults,...input};
  const list=counts??Array.from({length:Math.max(1,Math.min(base.cells,60))},(_,i)=>Math.max(1,Math.round((i+1)*base.cells/Math.min(base.cells,60))));
  const rows=[];
  for(const n of [...new Set(list)].sort((a,b)=>a-b)) {
    const row={cells:n};
    for(const sharing of sharingModes) {
      try{row[sharing]=simulateSheet({...base,cells:n,sharing}).power;}catch{row[sharing]=null;}
    }
    rows.push(row);
  }
  return rows;
}
