// Sealed pendulum wave node → generator → battery → dock → AUV. Reduced-order screening model, SI units.
// Hull: horizontal cylinder floating like a log, one pitch degree of freedom driven by regular waves
// (Froude–Krylov moment on the waterplane). Pendulum: physical pendulum on a transverse shaft at the
// hull's centre of rotation; the generator resists the pendulum–hull relative rotation (linear damping).
// Energy: wave work = hull damping + shaft friction + generator + stored. Electrical = generator × drive
// train efficiency. Charging is an energy-budget model around a node battery and a fixed-rate dock.
export const nodeDefaults=Object.freeze({height:1,period:6,hullLength:12,hullDiameter:2.8,hullMass:14000,
  hullDamping:0.1,pendulumMass:10000,armLength:1.1,gyrationRadius:1.2,friction:100,generatorDamping:0,springTuning:1,stopAngle:50,driveEfficiency:0.8,
  availability:0.35,nodeBatteryWh:10000,dockPowerW:1500,dockEfficiency:0.9,auvWh:4500,auvArrivalSoc:0.1,initialSoc:0.8});
export const nodeBounds=Object.freeze({height:[0,4],period:[2,14],hullLength:[1,12],hullDiameter:[0.3,3],hullMass:[50,60000],
  hullDamping:[0.02,0.6],pendulumMass:[5,10000],armLength:[0.01,3],gyrationRadius:[0.02,3],friction:[0,5000],springTuning:[0,1],stopAngle:[10,80],generatorDamping:[0,200000],driveEfficiency:[0,1],
  availability:[0,1],nodeBatteryWh:[100,200000],dockPowerW:[50,20000],dockEfficiency:[0,1],auvWh:[50,200000],auvArrivalSoc:[0,1],initialSoc:[0,1]});
const rho=1025,g=9.81;

export function nodeParameters(input={}) {
  const p=Object.freeze({...nodeDefaults,...input});
  for(const [key,[lo,hi]] of Object.entries(nodeBounds))
    if(!Number.isFinite(p[key])||p[key]<lo||p[key]>hi)throw new RangeError(`${key}: enter ${lo}–${hi}.`);
  if(p.gyrationRadius>p.hullDiameter*0.45||p.armLength>p.hullDiameter*0.45)throw new RangeError('Pendulum must fit inside the hull (arm and radius of gyration ≤ 45% of diameter).');
  if(p.armLength>p.gyrationRadius)throw new RangeError('Radius of gyration must be at least the COG offset (arm).');
  const displaced=rho*Math.PI*p.hullDiameter**2/4*p.hullLength;
  if(p.hullMass+p.pendulumMass>0.9*displaced)throw new RangeError(`Hull + pendulum (${Math.round(p.hullMass+p.pendulumMass)} kg) exceeds 90% of the ${Math.round(displaced)} kg the hull can displace.`);
  const L=p.hullLength,B=p.hullDiameter,w=2*Math.PI/p.period,k=w*w/g,lambda=2*Math.PI/k;
  const Iwp=B*L**3/12,Kh=rho*g*Iwp;                       // waterplane pitch stiffness (beam-wide waterplane approximation)
  const Ih=p.hullMass*(L*L/12+B*B/16)*1.25;               // hull pitch inertia incl. ~25% added inertia (heuristic)
  const ch=2*p.hullDamping*Math.sqrt(Kh*Ih);              // radiation + viscous pitch damping (heuristic ratio)
  const a=p.height/2,Mw=2*rho*g*B*a*(Math.sin(k*L/2)/(k*k)-L*Math.cos(k*L/2)/(2*k)); // Froude–Krylov pitch moment amplitude
  const Ip=p.pendulumMass*p.gyrationRadius**2,Kg=p.pendulumMass*g*p.armLength; // physical pendulum: inertia from gyration radius, gravity restoring from COG offset
  // Spring tuning: a torsion spring (negative when the gravity period is shorter than the wave) shifts the
  // pendulum's natural period toward the wave period (CorPower WaveSpring-style pretension; 0 = gravity only).
  const Ks=p.springTuning*(Ip*w*w-Kg),Kp=Kg+Ks;
  const stop=p.stopAngle*Math.PI/180,Kstop=50*Math.max(Kg,Math.abs(Ks),1e3),Cstop=2*Math.sqrt(Kstop*Ip); // end-stops: stiff spring + critical damper beyond the stop angle
  const waveFlux=rho*g*g*p.height**2*p.period/(64*Math.PI); // incident wave power per metre of crest, W/m
  const rao=Math.sin(k*L/2)/(k*L/2);                        // surge/heave follow the wave orbit, averaged over the hull length (heuristic RAO)
  const ml=p.pendulumMass*p.armLength;
  return {p,Kh,Ih,ch,Mw,Ip,Kp,Kg,Ks,stop,Kstop,Cstop,w,k,lambda,waveFlux,rao,ml,a,pendulumPeriod:2*Math.PI*Math.sqrt(Ip/Kp),hullPeriod:2*Math.PI*Math.sqrt(Ih/Kh)};
}

// state: [theta, thetaDot, psi, psiDot, Ework_in, Eloss, Egen]
// Hull pitch theta is driven by the wave moment; the pendulum (absolute angle psi) is driven by the hull's
// surge/heave along the wave orbit (base excitation at the pivot) and resisted by the shaft torque.
export function nodeRates(t,y,a,cg) {
  const [th,thd,ps,psd]=y,{p,Kh,Ih,ch,Mw,Ip,Kg,Ks,stop,Kstop,Cstop,w,rao,ml}=a,amp=a.a;
  const M=Mw*Math.cos(w*t),rel=psd-thd,tau=(cg+p.friction)*rel;     // shaft torque resisting relative rotation
  const ax=rao*amp*w*w*Math.sin(w*t),az=-rao*amp*w*w*Math.cos(w*t);   // pivot accelerations following the orbit
  const base=-ml*(az*Math.sin(ps)+ax*Math.cos(ps));                  // pseudo-force torque on the pendulum
  const thdd=(M-ch*thd-Kh*th+tau)/Ih;
  const over=Math.max(0,Math.abs(ps)-stop),stopTorque=over>0?-(Kstop*over*Math.sign(ps)+Cstop*psd):0;
  const psdd=(-Kg*Math.sin(ps)-Ks*ps+base-tau+stopTorque)/Ip;
  return [thd,thdd,psd,psdd,M*thd+base*psd,ch*thd*thd+p.friction*rel*rel+(over>0?Cstop*psd*psd:0),cg*rel*rel];
}
function rk4(t,y,h,a,cg) {
  const k1=nodeRates(t,y,a,cg),k2=nodeRates(t+h/2,y.map((v,i)=>v+h*k1[i]/2),a,cg);
  const k3=nodeRates(t+h/2,y.map((v,i)=>v+h*k2[i]/2),a,cg),k4=nodeRates(t+h,y.map((v,i)=>v+h*k3[i]),a,cg);
  return y.map((v,i)=>v+h*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6);
}
export function nodeEnergy(y,a) {
  const [th,thd,ps,psd]=y,{Kh,Ih,Ip,Kg,Ks,stop,Kstop}=a,over=Math.max(0,Math.abs(ps)-stop);
  return (Ih*thd*thd+Kh*th*th+Ip*psd*psd+Ks*ps*ps+Kstop*over*over)/2+Kg*(1-Math.cos(ps));
}

function integrate(a,cg,stepScale=1) {
  const {p}=a,T=p.period,cycles=30,start=(cycles-3)*T,end=cycles*T;
  const rate=Math.max((cg+p.friction)/a.Ip,(cg+p.friction)/a.Ih,a.ch/a.Ih,a.Cstop/a.Ip,Math.sqrt(a.Kstop/a.Ip));
  const dt=Math.min(T/200,0.5*Math.min(a.pendulumPeriod,a.hullPeriod)/20,0.4/Math.max(rate,1e-9))*stepScale;
  let y=Array(7).fill(0),t=0,next=start,first,points=[],steps=0;
  while(t<end-1e-10) {
    const target=t<start-1e-10?start:Math.min(next,end);
    if(target-t<1e-10){t=target;if(!first)first=[...y];points.push(point(t,y,a,cg));next=Math.min(end,next+T/100);if(t>=end-1e-10)break;continue;}
    const h=Math.min(dt,target-t);y=rk4(t,y,h,a,cg);t+=h;
    if(++steps>4e6||y.some(v=>!Number.isFinite(v)))throw new Error('Solver could not resolve this setting.');
  }
  points.push(point(end,y,a,cg));
  return {points,first,last:y,steps,duration:3*T};
}
function point(t,y,a,cg){return {t,theta:y[0],psi:y[2],relative:y[2]-y[0],power:cg*(y[3]-y[1])**2*a.p.driveEfficiency,wave:a.a*Math.cos(a.w*t),surge:-a.rao*a.a*Math.sin(a.w*t),heave:a.rao*a.a*Math.cos(a.w*t),energy:y[6]};}

export function simulateNode(input={},stepScale=1) {
  if(!Number.isFinite(stepScale)||stepScale<=0||stepScale>1)throw new RangeError('stepScale must be in (0, 1].');
  const a=nodeParameters(input),{p}=a;
  let cg=p.generatorDamping,searched=false;
  if(cg===0) { // auto-match: search log-spaced generator damping for maximum mean electrical power
    searched=true;let best=-1,bestE=0;
    const trial=e=>{const c=Math.pow(10,e);const r=integrate(a,c);const P=(r.last[6]-r.first[6])/r.duration;if(P>best){best=P;cg=c;bestE=e;}};
    for(let e=0;e<=5;e+=0.25)trial(e);
    for(let e=bestE-0.2;e<=bestE+0.2001;e+=0.05)trial(e); // refine around the best decade step
  }
  const r=integrate(a,cg,stepScale),duration=r.duration;
  const generated=(r.last[6]-r.first[6])/duration,electrical=generated*p.driveEfficiency;
  const inputWork=r.last[4]-r.first[4],residual=(r.last[4]-r.last[5]-r.last[6])-nodeEnergy(r.last,a);
  const max=key=>Math.max(...r.points.map(v=>Math.abs(v[key])));
  const peakRel=max('relative'),peakPitch=max('theta');
  const captureWidth=electrical/Math.max(1e-9,a.waveFlux),limitWidth=a.lambda/(2*Math.PI);
  const issues=[];
  const peakPsi=max('psi');
  if(peakPsi>a.stop*1.02)issues.push(`Pendulum hits the ${p.stopAngle}° end-stops: raise generator damping, shorten the arm, or accept impact loads (not modeled beyond a stiff stop).`);
  if(peakPitch>0.35)issues.push('Hull pitch exceeds 20°: linear hydrostatics invalid.');
  if(captureWidth>limitWidth)issues.push('Absorbed power exceeds the single-mode absorption limit λ/2π: hydrodynamic model invalid.');
  if(captureWidth>2*p.hullLength)issues.push('Capture width exceeds twice the hull length: unrealistic for a pitching body.');
  const last=r.points.at(-1),lastStart=r.points[0];
  if(Math.abs(Math.abs(last.theta)-Math.abs(lastStart.theta))>0.05*Math.max(peakPitch,1e-6)+1e-6)issues.push('Response has not settled to a repeating cycle.');
  // charging budget
  const dailyWh=electrical*24*p.availability,auvNeedWh=p.auvWh*(1-p.auvArrivalSoc);
  const sessionHours=auvNeedWh/(p.dockPowerW*p.dockEfficiency);
  const nodeDrawWh=auvNeedWh/p.dockEfficiency;
  const chargesPerDay=dailyWh/Math.max(1e-9,nodeDrawWh);
  const timeline=chargeTimeline(p,electrical,sessionHours);
  return {a,cg,searched,points:r.points.map(v=>({...v,t:v.t-(30-3)*p.period,energy:v.energy-r.first[6]})),duration,steps:r.steps,
    generated,electrical,inputWork,residual,peakRel,peakPsi,peakPitch,captureWidth,limitWidth,issues,
    dailyWh,auvNeedWh,sessionHours,nodeDrawWh,chargesPerDay,timeline,
    hours:issues.length?null:sessionHours};
}

// 24-hour energy budget: constant average generation (× availability), one AUV session starting at hour 0.
export function chargeTimeline(p,electrical,sessionHours) {
  const gen=electrical*p.availability,pts=[];let soc=p.initialSoc*p.nodeBatteryWh,minSoc=soc,shortfallWh=0;
  for(let h=0;h<=24;h+=0.05){
    const draw=h<sessionHours?p.dockPowerW:0;
    pts.push({h,socWh:soc,draw,gen});
    let next=soc+(gen-draw)*0.05;
    if(next<0){shortfallWh+=-next;next=0;}
    if(next>p.nodeBatteryWh)next=p.nodeBatteryWh;
    soc=next;minSoc=Math.min(minSoc,soc);
  }
  return {points:pts,minSocWh:minSoc,endSocWh:soc,shortfallWh,recovered:soc>=p.initialSoc*p.nodeBatteryWh-1e-6};
}

export function nodeAt(model,time) {
  if(!Number.isFinite(time)||time<0)throw new RangeError('Time must be nonnegative.');
  const loops=Math.floor(time/model.duration),t=time-loops*model.duration,pts=model.points;
  let lo=0,hi=pts.length-1;
  while(hi-lo>1){const mid=(lo+hi)>>1;if(pts[mid].t<=t)lo=mid;else hi=mid;}
  const f=(t-pts[lo].t)/(pts[hi].t-pts[lo].t);
  const v=Object.fromEntries(Object.keys(pts[lo]).map(k=>[k,pts[lo][k]+f*(pts[hi][k]-pts[lo][k])]));
  return {...v,t:time,energy:v.energy+loops*(model.generated*model.duration)};
}
