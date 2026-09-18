// PVC pipe linear generator: an axially magnetised magnet slides in the bore between two repelling end
// magnets while coils wound on the outside see its flux move. Reduced-order screening model, SI units.
// The pipe heaves with the wave; the magnet is a base-excited mass in the pipe frame; coil current opposes
// the relative motion (Lenz). Energy: base work = friction + electromagnetic extraction + stored.
// Load power is the extraction less coil copper loss. Gravity is carried in the potential, so the magnet
// levitates on the lower end magnet and the spring is whatever that repulsion provides.
export const tubeDefaults=Object.freeze({height:1,period:6,heaveRao:1,
  boreDiameter:50,tubeLength:1000,magnetDiameter:40,magnetLength:50,remanence:1.3,density:7500,
  tilt:0,frictionCoefficient:0.15,springGap:60,springStiffness:0,coils:1,coilLength:30,coilTurns:1000,wireDiameter:0.5,wallThickness:3,fluxLinkage:0.4,
  loadResistance:0,friction:0.5,availability:0.35,auvWh:4500,auvArrivalSoc:0.1});
export const tubeBounds=Object.freeze({height:[0,6],period:[2,16],heaveRao:[0,1],
  boreDiameter:[10,2000],tubeLength:[100,60000],magnetDiameter:[5,1990],magnetLength:[5,10000],remanence:[0.1,1.5],density:[1000,9000],
  tilt:[0,90],frictionCoefficient:[0,1],springGap:[1,5000],springStiffness:[0,1e6],coils:[1,200],coilLength:[2,2000],coilTurns:[1,100000],wireDiameter:[0.05,5],wallThickness:[0.5,50],fluxLinkage:[0.02,1],
  loadResistance:[0,1e6],friction:[0,1000],availability:[0,1],auvWh:[50,200000],auvArrivalSoc:[0,1]});
const rhoCu=1.68e-8,mu0=4e-7*Math.PI,g=9.81;
// ponytail: Coulomb friction is regularised as mu*N*tanh(v/STICTION) instead of a proper stick-slip solver.
// Ceiling: motion below ~10 mm/s is smeared, so a design that barely breaks static friction reads optimistic.
const STICTION=0.01;

export function tubeParameters(input={}) {
  const p=Object.freeze({...tubeDefaults,...input});
  for(const [key,[lo,hi]] of Object.entries(tubeBounds))
    if(!Number.isFinite(p[key])||p[key]<lo||p[key]>hi)throw new RangeError(`${key}: enter ${lo}–${hi}.`);
  if(!Number.isInteger(p.coils))throw new RangeError('coils: enter a whole number.');
  if(p.magnetDiameter>p.boreDiameter-1)throw new RangeError(`Magnet (${p.magnetDiameter} mm) must clear the ${p.boreDiameter} mm bore by at least 1 mm.`);
  if(p.magnetLength>p.tubeLength-20)throw new RangeError('Magnet must be at least 20 mm shorter than the travel length.');
  const rm=p.magnetDiameter/2000,lm=p.magnetLength/1000,lc=p.coilLength/1000;
  const m=p.density*Math.PI*rm*rm*lm;                       // moving mass (the magnet alone; no carriage)
  const h=(p.tubeLength-p.magnetLength)/2000,d=p.springGap/1000; // h: half the free travel; d: static levitation gap
  if(d>=h)throw new RangeError(`Levitation gap (${p.springGap} mm) must be less than the half-travel (${(h*1000).toFixed(0)} mm).`);
  // Tilt takes gravity off the axis: 0° is a vertical pipe, 90° a horizontal one. The magnet then rests on
  // the bore instead of loading the spring, trading the suspension problem for sliding friction.
  const tilt=p.tilt*Math.PI/180,gAxial=g*Math.cos(tilt),Fcoulomb=p.frictionCoefficient*m*g*Math.sin(tilt);
  // End magnets repel as C/gap⁴ (coaxial dipole far-field), scaled to push back with the magnet's own weight
  // at the gap `springGap`. Vertical and unsprung they ARE the suspension; otherwise they are end bumpers.
  const C=m*g*d**4/(1-(d/(2*h-d))**4);
  // Rest position: preloaded to mid-travel when a spring carries the magnet, otherwise wherever the end
  // magnets balance the axial component of its weight (mid-travel when horizontal, near the lower end when not).
  let xeq=0;
  if(p.springStiffness===0&&gAxial>0){let lo=d-h,hi=0;for(let i=0;i<80;i++){const mid=(lo+hi)/2;springForce(mid,{C,h})>m*gAxial?lo=mid:hi=mid;}xeq=(lo+hi)/2;}
  const P=m*gAxial-springForce(xeq,{C,h});
  const kMag=4*C/(h+xeq)**5+4*C/(h-xeq)**5,kMid=8*C/h**5,w=2*Math.PI/p.period;
  const kSusp=p.springStiffness+kMag;
  // A spring soft enough to resonate must still hold the magnet up: its sag is m·g_axial/k = g·cos(tilt)/ω²,
  // 8.95 m for a vertical pipe at 6 s whatever the mass, and zero once the pipe lies flat.
  const tunedStiffness=Math.max(0,m*w*w-kMid),staticSag=p.springStiffness>0?m*gAxial/p.springStiffness:0;
  const rCoil=(p.boreDiameter/2+p.wallThickness)/1000+p.wireDiameter/2000;
  const wireArea=Math.PI*(p.wireDiameter/2000)**2;
  const Rcoil=rhoCu*(p.coils*p.coilTurns*2*Math.PI*rCoil)/wireArea;
  const Lcoil=p.coils*mu0*p.coilTurns**2*Math.PI*rCoil*rCoil/lc;
  // Flux linkage of one coil vs magnet offset u is taken as a Gaussian of width sigma, so the transduction
  // K = dλ/du is odd, zero with the magnet centred in the coil and peaking at u = ±sigma. Coils are spaced
  // 2·sigma apart and wound alternately so their contributions add.
  const sigma=Math.sqrt(lm*lm+lc*lc)/2,lambda=p.coilTurns*p.fluxLinkage*p.remanence*Math.PI*rm*rm;
  const offsets=Array.from({length:p.coils},(_,i)=>({o:xeq+(i-(p.coils-1)/2)*2*sigma,s:i%2?-1:1}));
  const k=w*w/g,span=p.tubeLength/1000*Math.sin(tilt);
  // A pipe lying along the wave spans several phases; average the orbital forcing over its horizontal extent.
  const rao=span>0?Math.sin(k*span/2)/(k*span/2):1,amp=p.height/2*p.heaveRao*rao;
  return {p,m,h,d,C,P,xeq,kMag,kMid,kSusp,k,lambda:2*Math.PI/k,staticSag,tunedStiffness,w,amp,tilt,gAxial,Fcoulomb,rao,rm,lm,lc,rCoil,wireArea,Rcoil,Lcoil,sigma,lambda,offsets,
    naturalPeriod:2*Math.PI*Math.sqrt(m/kSusp),Kpeak:peakCoupling({h,sigma,lambda,offsets})};
}

// Transduction K(x) in V·s/m (equivalently N/A): sum of every coil's dλ/dx at this magnet position.
function peakCoupling(a){let K=0;for(let i=0;i<=400;i++)K=Math.max(K,Math.abs(coupling(-a.h+2*a.h*i/400,a)));return K;}
export function coupling(x,a){let K=0;for(const {o,s} of a.offsets){const u=(x-o)/a.sigma;K+=s*a.lambda*u/a.sigma*Math.exp(-u*u/2);}return K;}
function springForce(x,a){return a.C/Math.max(a.h+x,1e-4)**4-a.C/Math.max(a.h-x,1e-4)**4;}

// state: [x, xdot, Ebase_in, Efriction, Eextracted]
export function tubeRates(t,y,a,RL) {
  const [x,xd]=y,{p,m,P,xeq,w,amp,Rcoil,gAxial,Fcoulomb}=a;
  const K=coupling(x,a),Fem=K*K*xd/(Rcoil+RL);           // Lenz force: current K·xd/R through coupling K
  // The wave orbit is circular, so the pipe's axial forcing has the same amplitude at any tilt — only its
  // phase changes. Tilt costs power through friction and gains it by freeing the spring, not through drive.
  const base=m*amp*w*w*Math.cos(w*t);
  const drag=p.friction*xd+Fcoulomb*Math.tanh(xd/STICTION);
  const acc=(base+P-m*gAxial+springForce(x,a)-p.springStiffness*(x-xeq)-drag-Fem)/m;
  return [xd,acc,base*xd,drag*xd,Fem*xd];
}
export function tubeEnergy(y,a) {
  const [x,xd]=y,{p,m,h,C,P,xeq,gAxial}=a;
  return m*xd*xd/2+(m*gAxial-P)*x+C/3*(1/Math.max(h+x,1e-4)**3+1/Math.max(h-x,1e-4)**3)+p.springStiffness*(x-xeq)**2/2;
}
function rk4(t,y,dt,a,RL) {
  const k1=tubeRates(t,y,a,RL),k2=tubeRates(t+dt/2,y.map((v,i)=>v+dt*k1[i]/2),a,RL);
  const k3=tubeRates(t+dt/2,y.map((v,i)=>v+dt*k2[i]/2),a,RL),k4=tubeRates(t+dt,y.map((v,i)=>v+dt*k3[i]),a,RL);
  return y.map((v,i)=>v+dt*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6);
}

function integrate(a,RL,stepScale=1) {
  const {p,m}=a,T=p.period,cycles=20,start=(cycles-3)*T,end=cycles*T;
  const damp=(p.friction+a.Fcoulomb/STICTION+a.Kpeak**2/(a.Rcoil+RL))/m;
  const dt=Math.min(T/400,a.naturalPeriod/60,0.4/Math.max(damp,1e-9))*stepScale;
  let y=[a.xeq,0,0,0,0],t=0,next=start,first,points=[],steps=0;
  while(t<end-1e-10) {
    const target=t<start-1e-10?start:Math.min(next,end);
    if(target-t<1e-10){t=target;if(!first)first=[...y];points.push(point(t,y,a,RL));next=Math.min(end,next+T/120);if(t>=end-1e-10)break;continue;}
    y=rk4(t,y,Math.min(dt,target-t),a,RL);t+=Math.min(dt,target-t);
    if(++steps>4e6||y.some(v=>!Number.isFinite(v)))throw new Error('Solver could not resolve this setting.');
  }
  points.push(point(end,y,a,RL));
  return {points,first,last:y,steps,duration:3*T};
}
function point(t,y,a,RL) {
  const K=coupling(y[0],a),emf=K*y[1],i=emf/(a.Rcoil+RL);
  return {t,x:y[0]-a.xeq,v:y[1],gap:a.h+y[0],emf,current:i,power:i*i*RL,
    wave:a.amp*Math.cos(a.w*t),magnet:a.amp*Math.cos(a.w*t)+y[0],energy:y[4]};
}

export function simulateTube(input={},stepScale=1) {
  if(!Number.isFinite(stepScale)||stepScale<=0||stepScale>1)throw new RangeError('stepScale must be in (0, 1].');
  const a=tubeParameters(input),{p}=a;
  let RL=p.loadResistance,searched=false;
  if(RL===0) { // auto-match: search log-spaced load resistance for maximum mean load power
    searched=true;let best=-1,bestE=0;
    const trial=e=>{const R=Math.pow(10,e),r=integrate(a,R);const P=(r.last[4]-r.first[4])/r.duration*R/(a.Rcoil+R);if(P>best){best=P;RL=R;bestE=e;}};
    for(let e=-1;e<=5;e+=0.25)trial(e);
    for(let e=bestE-0.2;e<=bestE+0.2001;e+=0.05)trial(e);
  }
  const r=integrate(a,RL,stepScale),Rtot=a.Rcoil+RL;
  const extracted=(r.last[4]-r.first[4])/r.duration;      // total electromagnetic power (coil + load)
  const frictionLoss=(r.last[3]-r.first[3])/r.duration;
  const loadPower=extracted*RL/Rtot,copperLoss=extracted-loadPower;
  const inputWork=r.last[2]-r.first[2],residual=(r.last[2]-r.last[3]-r.last[4])-(tubeEnergy(r.last,a)-tubeEnergy([a.xeq,0],a));
  const max=key=>Math.max(...r.points.map(v=>Math.abs(v[key])));
  const stroke=max('x')*2,peakEmf=max('emf'),peakCurrent=max('current');
  const minGap=Math.min(...r.points.map(v=>Math.min(v.gap,2*a.h-v.gap)));
  const currentDensity=peakCurrent/(a.wireArea*1e6);        // A/mm²
  const coilSpan=2*a.sigma*p.coils,tau=a.Lcoil/Rtot;
  // Sliding friction and wave forcing both scale with the magnet's mass, so their ratio mu·g·sin(tilt)/(a·w²)
  // is a property of the sea state and the bearing alone: no magnet is heavy enough to break loose if it is >1.
  const stiction=a.Fcoulomb/Math.max(a.m*a.amp*a.w*a.w,1e-30);
  const issues=[];
  if(a.staticSag>a.h)issues.push(`A vertical spring this soft sags ${a.staticSag.toFixed(1)} m under the magnet's own weight but the pipe offers ${a.h.toFixed(2)} m of travel: this suspension cannot be built vertically.`);
  if(stiction>0.8)issues.push(`Sliding friction is ${stiction.toFixed(2)}× the wave forcing (mu·g·sin tilt / a·w²): the magnet barely breaks loose, and that ratio does not improve with a bigger magnet — lower the friction coefficient or tilt the pipe back up.`);
  if(minGap<0.005)issues.push(`Magnet closes to ${(minGap*1000).toFixed(1)} mm of an end magnet: contact and impact loads are not modeled.`);
  if(currentDensity>5)issues.push(`Coil current density ${currentDensity.toFixed(1)} A/mm² exceeds 5 A/mm²: no thermal model supports that winding.`);
  if(tau>a.naturalPeriod/20)issues.push('Coil L/R time constant is not small against the motion: the quasi-static current assumption fails.');
  if(max('x')>3*a.sigma&&p.coils===1)issues.push('Stroke runs far outside the single coil’s flux region: most of the travel generates nothing (add coils).');
  const last=r.points.at(-1),lastStart=r.points[0];
  if(Math.abs(Math.abs(last.x)-Math.abs(lastStart.x))>0.05*Math.max(max('x'),1e-9)+1e-9)issues.push('Response has not settled to a repeating cycle.');
  const dailyWh=loadPower*24*p.availability,auvNeedWh=p.auvWh*(1-p.auvArrivalSoc);
  return {a,RL,searched,points:r.points.map(v=>({...v,t:v.t-(20-3)*p.period,energy:v.energy-r.first[4]})),duration:r.duration,steps:r.steps,
    extracted,loadPower,copperLoss,frictionLoss,inputWork,residual,stroke,peakEmf,peakCurrent,currentDensity,minGap,coilSpan,tau,
    naturalPeriod:a.naturalPeriod,tuningRatio:p.period/a.naturalPeriod,stiction,issues,dailyWh,auvNeedWh,
    chargesPerDay:dailyWh/auvNeedWh,hours:issues.length?null:(loadPower>0?1000/loadPower:null)};
}

export function tubeAt(model,time) {
  if(!Number.isFinite(time)||time<0)throw new RangeError('Time must be nonnegative.');
  const loops=Math.floor(time/model.duration),t=time-loops*model.duration,pts=model.points;
  let lo=0,hi=pts.length-1;
  while(hi-lo>1){const mid=(lo+hi)>>1;if(pts[mid].t<=t)lo=mid;else hi=mid;}
  const f=(t-pts[lo].t)/(pts[hi].t-pts[lo].t);
  const v=Object.fromEntries(Object.keys(pts[lo]).map(k=>[k,pts[lo][k]+f*(pts[hi][k]-pts[lo][k])]));
  return {...v,t:time,energy:v.energy+loops*(model.extracted*model.duration)};
}
