import {simulate as stripModel} from './model.mjs';

export const systemDefaults=Object.freeze({height:0.1,period:3,tubeLength:2,tubeDiameter:35,
  nozzle:15,floatDiameter:0.6,hullMass:40,hullDamping:0.15,waterDamping:0.2,
  coupling:1,leafLength:150,resistance:5,efficiency:0.6,dockEfficiency:0.9,batteryWh:1000});
export const systemBounds=Object.freeze({height:[0,0.5],period:[1,10],tubeLength:[0.5,6],
  tubeDiameter:[20,60],nozzle:[8,20],floatDiameter:[0.3,1],hullMass:[10,150],
  hullDamping:[0.05,0.5],waterDamping:[0.05,0.8],coupling:[0,1.5],leafLength:[80,200],
  resistance:[0.1,20],efficiency:[0,1],dockEfficiency:[0,1],batteryWh:[1,24000]});

export function systemParameters(input={}) {
  const p=Object.freeze({...systemDefaults,...input});
  for(const [key,[lo,hi]] of Object.entries(systemBounds))
    if(!Number.isFinite(p[key])||p[key]<lo||p[key]>hi)throw new RangeError(`${key}: enter ${lo}–${hi}.`);
  if(p.nozzle>p.tubeDiameter)throw new RangeError('Nozzle must fit inside the water tube.');
  const rho=1025,g=9.81,Ac=Math.PI*(p.tubeDiameter/1000)**2/4,Aj=Math.PI*(p.nozzle/1000)**2/4;
  const mw=rho*Ac*p.tubeLength,kw=rho*g*Ac,kb=rho*g*Math.PI*p.floatDiameter**2/4;
  const s=stripModel({length:p.leafLength,resistance:p.resistance,diameter:p.nozzle}).s;
  return {p,s,rho,Ac,Aj,mw,kw,kb,M:p.hullMass,
    cb:2*p.hullDamping*Math.sqrt(kb*p.hullMass),cw:2*p.waterDamping*Math.sqrt(kw*mw)};
}

export function systemRates(t,y,a) {
  const [z,vz,x,vx,q,vq,V]=y,{p,s,rho,Ac,Aj,mw,kw,kb,M,cb,cw}=a;
  const eta=p.height/2*Math.sin(2*Math.PI*t/p.period),Fw=p.coupling*kb*eta;
  // ponytail: ideal one-way routing; replace with measured head/flow/routing laws before hull design.
  const u=Ac/Aj*Math.max(0,vx),Fleaf=0.5*rho*Aj*u*u;
  const Fn=0.5*rho*Ac*(vx>=0?(Ac/Aj)**2:1)*vx*Math.abs(vx);
  const fw=-cw*vx-kw*x-Fn,fb=Fleaf-s.c*vq-s.k*q-s.theta*V;
  const az=(Fw-cb*vz-kb*z-fw-fb)/M;
  const power=V*V/s.R,hydraulic=Fn*vx,leafWork=Fleaf*vq;
  const loss=cb*vz*vz+cw*vx*vx+s.c*vq*vq+power+hydraulic-leafWork;
  return [vz,az,vx,fw/mw-az,vq,fb/s.m-az,(s.theta*vq-V/s.R)/s.C,
    power,Fw*vz,loss,hydraulic,leafWork];
}

function rk4(t,y,h,a) {
  const k1=systemRates(t,y,a),k2=systemRates(t+h/2,y.map((v,i)=>v+h*k1[i]/2),a);
  const k3=systemRates(t+h/2,y.map((v,i)=>v+h*k2[i]/2),a),k4=systemRates(t+h,y.map((v,i)=>v+h*k3[i]),a);
  return y.map((v,i)=>v+h*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6);
}

export function systemEnergy(y,a) {
  const [z,vz,x,vx,q,vq,V]=y,{s,mw,M,kb,kw}=a;
  return (M*vz*vz+mw*(vz+vx)**2+s.m*(vz+vq)**2+kb*z*z+kw*x*x+s.k*q*q+s.C*V*V)/2;
}

function point(t,y,a) {
  const {p,s,Ac,Aj}=a;
  return {t,z:y[0],x:y[2],waterVelocity:y[3],q:y[4],voltage:y[6],
    wave:p.height/2*Math.sin(2*Math.PI*t/p.period),jet:Ac/Aj*Math.max(0,y[3]),
    power:y[6]**2/s.R,energy:y[7],velocity:y[5]};
}

export function simulateSystem(input={},stepScale=1) {
  if(!Number.isFinite(stepScale)||stepScale<=0||stepScale>1)throw new RangeError('stepScale must be in (0, 1].');
  const a=systemParameters(input),{p,s,mw,cw,rho,Ac,Aj}=a,T=p.period,start=20*T,end=23*T;
  const maxW=Math.max(Math.sqrt(s.k/s.m),Math.sqrt(a.kb/a.M),Math.sqrt(a.kw/mw));
  const dt=Math.min(0.003,0.12/maxW,0.15*s.R*s.C,T/400)*stepScale;
  let y=Array(12).fill(0),t=0,next=start,steps=0,first,lastCycleStart;
  const points=[];
  while(t<end-1e-10) {
    const hydroRate=(cw+rho*Ac*(Ac/Aj)**2*Math.abs(y[3]))/mw;
    const target=t<start-1e-10?start:Math.min(next,end);
    if(target-t<1e-10) {
      t=target;                                   // guarantee progress: t a hair below start must not pin target
      if(!first)first=[...y];
      if(Math.abs(t-22*T)<1e-7)lastCycleStart=[...y];
      points.push(point(t,y,a));next=Math.min(end,next+T/200);
      if(t>=end-1e-10)break;
      continue;
    }
    const h=Math.min(dt,0.15/Math.max(hydroRate,1),target-t);
    y=rk4(t,y,h,a);t+=h;
    if(++steps>1500000 || y.some(v=>!Number.isFinite(v)))throw new Error('Solver could not resolve this setting. Reduce forcing.');
  }
  points.push(point(end,y,a));
  return summarize(points,first,y,lastCycleStart,a,steps);
}

function summarize(points,first,last,lastCycleStart,a,steps) {
  const {p,s}=a,duration=3*p.period,energy=last[7]-first[7],power=energy/duration;
  const max=(key)=>Math.max(...points.map(v=>Math.abs(v[key])));
  const peakQ=max('q'),strain=3*(s.ts+s.tp-s.z)*peakQ/s.L**2,peakJet=max('jet');
  const issues=[];
  if(peakQ>0.1*s.L)issues.push('Leaf bend exceeds the linear-model range.');
  if(strain>500e-6)issues.push('Piezo strain exceeds the assumed 500 µε screen.');
  if(max('x')>0.2*p.tubeLength)issues.push('Water stroke exceeds the small-motion range.');
  if(max('z')>0.3*p.floatDiameter)issues.push('Float heave exceeds the small-motion range.');
  if(peakJet>0&&max('velocity')>0.2*peakJet)issues.push('Leaf speed is too large for the jet-force approximation.');
  if(last[11]-first[11]>last[10]-first[10]+1e-9)issues.push('Leaf work exceeds hydraulic energy; flow approximation invalid.');
  const cycleMismatch=lastCycleStart?Math.abs(last[0]-lastCycleStart[0])+Math.abs(last[2]-lastCycleStart[2]):Infinity;
  if(cycleMismatch>Math.max(1e-5,p.height*0.02))issues.push('Response has not settled to a repeating cycle.');
  const residual=last[8]-last[9]-systemEnergy(last,a);
  return {a,points:points.map(v=>({...v,t:v.t-20*p.period,energy:v.energy-first[7]})),duration,power,
    net:power*p.efficiency*p.dockEfficiency,peakQ,strain,peakJet,issues,energy,steps,residual,
    inputWork:last[8],cycleMismatch,waterPeriod:2*Math.PI*Math.sqrt(p.tubeLength/9.81)};
}

export function systemAt(model,time) {
  if(!Number.isFinite(time)||time<0)throw new RangeError('Time must be nonnegative.');
  const loops=Math.floor(time/model.duration),t=time-loops*model.duration,pts=model.points;
  let lo=0,hi=pts.length-1;
  while(hi-lo>1){const mid=(lo+hi)>>1;if(pts[mid].t<=t)lo=mid;else hi=mid;}
  const f=(t-pts[lo].t)/(pts[hi].t-pts[lo].t);
  const v=Object.fromEntries(Object.keys(pts[lo]).map(k=>[k,pts[lo][k]+f*(pts[hi][k]-pts[lo][k])]));
  return {...v,t:time,energy:v.energy+loops*model.energy};
}
