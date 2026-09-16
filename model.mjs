// Reduced-order screening model; SI units internally. See MODEL.md.
export const defaults = Object.freeze({length:150, width:20, substrate:0.2,
  piezo:0.2, diameter:15, speed:1, period:6, resistance:5,
  addedMass:5, damping:0.08, strainLimit:500, battery:1000, efficiency:0.6});
export const bounds = Object.freeze({length:[50,400],width:[10,100],substrate:[0.1,2],
  piezo:[0.1,1],diameter:[1,50],speed:[0,3],period:[0.5,15],resistance:[0.01,100],
  addedMass:[0,100],damping:[0.01,0.5],strainLimit:[100,2000],battery:[1,100000],efficiency:[0,1]});

export function validate(input) {
  const p = {...defaults,...input};
  for (const [key,[lo,hi]] of Object.entries(bounds)) {
    if (!Number.isFinite(p[key]) || p[key]<lo || p[key]>hi)
      throw new RangeError(`${key} must be between ${lo} and ${hi}.`);
  }
  if(p.diameter>p.width) throw new RangeError('Jet diameter must not exceed strip width.');
  return Object.freeze(p);
}

function section(p) {
  const L=p.length/1000,b=p.width/1000,ts=p.substrate/1000,tp=p.piezo/1000;
  const Es=193e9,Ep=67e9,d=190e-12,epsT=1900*8.8541878128e-12;
  const zs=ts/2,zp=ts+tp/2,z=(Es*ts*zs+Ep*tp*zp)/(Es*ts+Ep*tp);
  const EI=b*(Es*(ts**3/12+ts*(zs-z)**2)+Ep*(tp**3/12+tp*(zp-z)**2));
  const k=3*EI/L**3,m=(33/140)*b*L*(8000*ts+7800*tp)+p.addedMass/1000;
  const C=(epsT-d*d*Ep)*b*L/tp,theta=d*Ep*b*(zp-z)*1.5/L;
  return {L,b,ts,tp,z,EI,k,m,C,theta,c:2*p.damping*Math.sqrt(k*m),
    R:p.resistance*1e6,omega:2*Math.PI/p.period,area:Math.PI*(p.diameter/1000)**2/4};
}

function harmonic(F,w,s) {
  const G=1/s.R,den=G*G+(w*s.C)**2;
  const hr=s.theta*w*w*s.C/den,hi=s.theta*w*G/den;
  const dr=s.k-s.m*w*w+s.theta*hr,di=w*s.c+s.theta*hi;
  const qr=F*dr/(dr*dr+di*di),qi=-F*di/(dr*dr+di*di);
  return {w,F,qr,qi,vr:hr*qr-hi*qi,vi:hr*qi+hi*qr};
}

export function sample(model,t) {
  const {p,s,Fmax,harmonics}=model;
  let q=3*Fmax/(8*s.k),velocity=0,voltage=0;
  for(const h of harmonics) {
    const c=Math.cos(h.w*t),sn=Math.sin(h.w*t);
    q+=h.qr*c-h.qi*sn;
    velocity+=h.w*(-h.qr*sn-h.qi*c);
    voltage+=h.vr*c-h.vi*sn;
  }
  const u=p.speed*(1-Math.cos(s.omega*t))/2;
  return {t,q,velocity,voltage,u,force:0.5*1025*s.area*u*u,
    power:voltage*voltage/s.R,jetPower:0.5*1025*s.area*u**3};
}

export function simulate(input={}) {
  const p=validate(input),s=section(p),Fmax=0.5*1025*s.area*p.speed**2;
  // ponytail: prescribed jet and one bending mode; use measured flow/force and FSI for pump sizing.
  const harmonics=[harmonic(-Fmax/2,s.omega,s),harmonic(Fmax/8,2*s.omega,s)];
  const model={p,s,Fmax,harmonics};
  const points=Array.from({length:601},(_,i)=>sample(model,i*p.period/600));
  const power=harmonics.reduce((v,h)=>v+(h.vr*h.vr+h.vi*h.vi)/(2*s.R),0);
  const mechanical=harmonics.reduce((v,h)=>v-h.F*h.w*h.qi/2,0);
  const dampingLoss=harmonics.reduce((v,h)=>v+s.c*h.w*h.w*(h.qr*h.qr+h.qi*h.qi)/2,0);
  const jetPower=0.5*1025*s.area*p.speed**3*5/16;
  const peakQ=Math.max(...points.map(v=>Math.abs(v.q)));
  const peakVelocity=Math.max(...points.map(v=>Math.abs(v.velocity)));
  const strain=3*(s.ts+s.tp-s.z)*peakQ/(s.L*s.L);
  const issues=[];
  if(peakQ>s.L*0.1) issues.push('Deflection exceeds 10% of strip length: linear bending model invalid.');
  if(strain*1e6>p.strainLimit) issues.push('Piezo strain exceeds your screening limit; fatigue strength is unverified.');
  if(p.speed>0 && peakVelocity>0.2*p.speed) issues.push('Strip speed is too large for the prescribed-jet force approximation.');
  if(mechanical>jetPower*(1+1e-8)) issues.push('Mechanical uptake exceeds available jet power: hydraulic model invalid.');
  const net=power*p.efficiency;
  return {...model,points,power,mechanical,dampingLoss,jetPower,peakQ,strain,issues,net,
    frequency:Math.sqrt(s.k/s.m)/(2*Math.PI),hours:net>0&&!issues.length?p.battery/net:null};
}
