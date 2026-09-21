// Cove S: mobile wave-powered AUV service platform. Reduced-order mission model.
//
// A two-body WEC converts relative motion between the surface platform and a deep
// reaction plate/service dock. Controllable foils on the submerged body convert a
// share of that motion directly into forward thrust. The electrical model advances
// an onboard battery through hourly-varying sea states, hotel loads, optional
// thruster assistance, and scheduled AUV charging sessions.

export const coveSDefaults=Object.freeze({
  scenario:'variable',days:14,timeStepHours:0.1,
  captureWidth:0.35,tunedPeriod:6,bandwidth:0.55,ratedPowerW:2000,ptoEfficiency:0.68,
  propulsionAllocation:0.18,maxWaveSpeedKn:1.5,thrusterTargetKn:0,thrusterWPerKnot3:1200,
  batteryWh:60000,initialSoc:0.7,reserveSoc:0.2,hotelW:60,
  auvWh:3000,auvArrivalSoc:0.2,visitsPerDay:1,dockPowerW:1500,dockEfficiency:0.85,
  serviceStartHour:12,serviceHoursPerDay:6,survivalWaveHeight:4.5
});

export const coveSBounds=Object.freeze({
  days:[1,60],timeStepHours:[0.025,0.25],captureWidth:[0.05,2],tunedPeriod:[3,12],bandwidth:[0.15,1.2],
  ratedPowerW:[100,15000],ptoEfficiency:[0.1,0.9],propulsionAllocation:[0,0.6],maxWaveSpeedKn:[0.2,3],
  thrusterTargetKn:[0,4],thrusterWPerKnot3:[100,10000],batteryWh:[5000,200000],initialSoc:[0,1],reserveSoc:[0.05,0.6],
  hotelW:[10,1000],auvWh:[500,20000],auvArrivalSoc:[0,0.9],visitsPerDay:[0,4],dockPowerW:[100,10000],
  dockEfficiency:[0.4,0.98],serviceStartHour:[0,23.9],serviceHoursPerDay:[1,23],survivalWaveHeight:[2,10]
});

const rho=1025,g=9.81,knToKmh=1.852;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));

export function coveSParameters(input={}) {
  const p=Object.freeze({...coveSDefaults,...input});
  if(!['design','variable','calm','storm'].includes(p.scenario))throw new RangeError('scenario must be design, variable, calm, or storm.');
  for(const [key,[lo,hi]] of Object.entries(coveSBounds))
    if(!Number.isFinite(p[key])||p[key]<lo||p[key]>hi)throw new RangeError(`${key}: enter ${lo}–${hi}.`);
  if(p.initialSoc<p.reserveSoc)throw new RangeError('Initial state of charge must be at or above the reserve.');
  return p;
}

// Representative deterministic scenarios for concept screening. They are not site records.
export function seaStateAt(hours,scenario='variable') {
  const d=hours/24;
  if(scenario==='design')return {height:1,period:6,label:'design sea'};
  let height=0.78+0.28*Math.sin(2*Math.PI*d/4.8)+0.17*Math.sin(2*Math.PI*d/1.35+0.8);
  let period=5.8+0.7*Math.sin(2*Math.PI*d/5.7+0.4)+0.35*Math.sin(2*Math.PI*d/1.9);
  if(scenario==='calm'){
    const phase=((d%8)+8)%8;
    if(phase>=2.2&&phase<=5.2){height*=0.18;period=4.2+0.2*Math.sin(d);}
  }
  if(scenario==='storm'){
    const pulse=Math.exp(-0.5*((d%7)-3.5)**2/0.38**2);
    height+=4.8*pulse;period+=3.2*pulse;
  }
  return {height:clamp(height,0.06,6),period:clamp(period,3,11),label:scenario};
}

export function waveFlux(height,period){return rho*g*g*height*height*period/(64*Math.PI);}

export function coveSAtSea(p,height,period) {
  const flux=waveFlux(height,period);
  const response=Math.exp(-0.5*(Math.log(period/p.tunedPeriod)/p.bandwidth)**2);
  const operating=height>=0.15&&height<=p.survivalWaveHeight;
  const absorbed=operating?flux*p.captureWidth*response:0;
  const electrical=Math.min(p.ratedPowerW,absorbed*p.ptoEfficiency*(1-p.propulsionAllocation));
  const seaDrive=(1-Math.exp(-height/0.45))*Math.exp(-0.18*Math.abs(period-p.tunedPeriod));
  const waveSpeedKn=height>p.survivalWaveHeight?0.12:p.maxWaveSpeedKn*clamp(seaDrive,0,1);
  return {flux,response,absorbed,electrical,waveSpeedKn,operating};
}

export function simulateCoveS(input={}) {
  const p=coveSParameters(input),dt=p.timeStepHours,steps=Math.ceil(p.days*24/dt);
  const reserveWh=p.reserveSoc*p.batteryWh,auvDeliveredWh=p.auvWh*(1-p.auvArrivalSoc);
  const dockDrawWh=auvDeliveredWh/p.dockEfficiency,dockHours=auvDeliveredWh/(p.dockPowerW*p.dockEfficiency);
  let battery=p.initialSoc*p.batteryWh,distanceKm=0,generatedWh=0,hotelWh=0,thrusterWh=0,dockWh=0;
  let queue=0,charging=null,completed=0,deferred=0,minBattery=battery,maxQueue=0,lastArrivalDay=-1;
  const points=[],events=[];
  for(let i=0;i<=steps;i++){
    const h=Math.min(i*dt,p.days*24),day=Math.floor(h/24),hour=h%24,sea=seaStateAt(h,p.scenario),atSea=coveSAtSea(p,sea.height,sea.period);
    const inService=hour>=p.serviceStartHour&&hour<p.serviceStartHour+p.serviceHoursPerDay;
    if(day!==lastArrivalDay&&hour>=p.serviceStartHour&&day<p.days){
      lastArrivalDay=day;queue+=p.visitsPerDay;maxQueue=Math.max(maxQueue,queue);
      if(p.visitsPerDay>0)events.push({h,type:'arrival',label:`${p.visitsPerDay} AUV arrival${p.visitsPerDay===1?'':'s'}`});
    }
    if(!charging&&queue>0&&inService&&battery>=reserveWh+dockDrawWh){
      charging={remainingWh:auvDeliveredWh};queue--;events.push({h,type:'start',label:'Charging started'});
    }
    let chargeLoadW=0;
    if(charging){
      chargeLoadW=Math.min(p.dockPowerW,charging.remainingWh/(p.dockEfficiency*Math.max(dt,1e-9)));
    }
    const desiredAssist=Math.max(0,p.thrusterTargetKn-atSea.waveSpeedKn),canAssist=battery>reserveWh+0.05*p.batteryWh;
    const assistKn=canAssist?desiredAssist:0,thrusterW=p.thrusterWPerKnot3*assistKn**3;
    const speedKn=inService?Math.min(0.2,atSea.waveSpeedKn):atSea.waveSpeedKn+assistKn;
    points.push({h,day:h/24,height:sea.height,period:sea.period,generationW:atSea.electrical,batteryWh:battery,
      soc:battery/p.batteryWh,hotelW:p.hotelW,thrusterW,chargeW:chargeLoadW,speedKn,distanceKm,queue,charging:!!charging,operating:atSea.operating});
    if(i===steps)break;
    const step=Math.min(dt,p.days*24-h);
    const inputWh=atSea.electrical*step,baseLoadWh=(p.hotelW+thrusterW)*step;
    let chargeStepWh=chargeLoadW*step;
    const availableForCharge=Math.max(0,battery+inputWh-baseLoadWh-reserveWh);
    chargeStepWh=Math.min(chargeStepWh,availableForCharge);
    battery=clamp(battery+inputWh-baseLoadWh-chargeStepWh,0,p.batteryWh);
    generatedWh+=inputWh;hotelWh+=p.hotelW*step;thrusterWh+=thrusterW*step;dockWh+=chargeStepWh;
    if(charging){
      charging.remainingWh-=chargeStepWh*p.dockEfficiency;
      if(charging.remainingWh<=1e-6){completed++;charging=null;events.push({h:h+step,type:'complete',label:'AUV charged'});}
    }
    distanceKm+=speedKn*knToKmh*step;minBattery=Math.min(minBattery,battery);
  }
  deferred=queue+(charging?1:0);
  const curtailedWh=points.reduce((sum,q,idx)=>{
    if(idx===points.length-1)return sum;
    const step=points[idx+1].h-q.h;
    const room=p.batteryWh-q.batteryWh;
    const net=Math.max(0,(q.generationW-q.hotelW-q.thrusterW-q.chargeW)*step-room);
    return sum+net;
  },0);
  const issues=[];
  if(minBattery<=reserveWh+1)issues.push('Battery reached the protected reserve; transit assistance and new charging sessions are curtailed.');
  if(deferred>0)issues.push(`${deferred} AUV charging request${deferred===1?' is':'s are'} unfinished at mission end.`);
  if(points.filter(q=>!q.operating).length>0)issues.push('The WEC feathers during cut-in or survival sea states.');
  return {p,points,events,reserveWh,auvDeliveredWh,dockDrawWh,dockHours,completed,deferred,maxQueue,distanceKm,
    generatedWh,hotelWh,thrusterWh,dockWh,curtailedWh,minBatteryWh:minBattery,endBatteryWh:battery,issues,
    energyResidualWh:generatedWh-(hotelWh+thrusterWh+dockWh+(battery-p.initialSoc*p.batteryWh)+curtailedWh)};
}

export function coveSAt(model,hours){
  if(!Number.isFinite(hours)||hours<0)throw new RangeError('Time must be nonnegative.');
  const t=clamp(hours,0,model.p.days*24),pts=model.points;
  let lo=0,hi=pts.length-1;
  while(hi-lo>1){const mid=(lo+hi)>>1;if(pts[mid].h<=t)lo=mid;else hi=mid;}
  const a=pts[lo],b=pts[hi],f=b.h===a.h?0:(t-a.h)/(b.h-a.h);
  const out={};for(const key of Object.keys(a))out[key]=typeof a[key]==='number'?a[key]+f*(b[key]-a[key]):a[key];
  return out;
}
