// SI units. Two-body linear frequency response; assumed coefficients, not BEM results.
export const defaults={H:2.14,T:6.25,wind:10.6,gust:13.6,current:.3,speed:.5,L:20,diameter:.12,pto:6000,EA:100000,rigid:false,cd:1,airCd:1.1,charge:false,seconds:180};
const rho=1025,g=9.81,air=1.225;
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]], sub=(a,b)=>[a[0]-b[0],a[1]-b[1]], mul=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]], scale=(a,s)=>a.map(x=>x*s), div=(a,b)=>{let d=b[0]**2+b[1]**2;return [(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d]};
export const drag=(density,cd,area,v)=>.5*density*cd*area*v*Math.abs(v);
export function spectrum(H,T,n=24){
 const wp=2*Math.PI/T, dw=wp*2.7/n;
 let terms=Array.from({length:n},(_,i)=>{const w=wp*.45+(i+.5)*dw;return {w,k:w*w/g,s:w**-5*Math.exp(-1.25*(wp/w)**4),phase:((i*2.3999632297+.71)% (2*Math.PI))};});
 const sum=terms.reduce((s,x)=>s+x.s,0);
 return terms.map(x=>({...x,a:Math.sqrt(2*(H/4)**2*x.s/sum)}));
}
export function response(input={}){
 const p={...defaults,...input};
 for(const k of Object.keys(defaults))if(typeof defaults[k]==='number'&&!Number.isFinite(p[k]))throw Error(`Invalid ${k}`);
 if(p.L<1||p.L>60||p.T<2||p.T>22||p.H<0||p.H>20||p.pto<0||p.EA<=0||p.cd<0||p.airCd<0||p.diameter<=0||p.seconds<=0)throw Error('Outside model bounds');
 const storm=p.H>4.5, damping=storm?300:p.pto, stiffness=p.rigid?1e10:p.EA/p.L;
 const ms=11000,mu=18000,ks=rho*g*12,ku=2000;
 // Representative equivalent linear viscous damping based on incident RMS orbital velocity.
 const vrms=p.H/4*2*Math.PI/p.T,bs=7000+rho*p.cd*10*vrms*.8,bu=5000+rho*p.cd*13.5*vrms*Math.exp(-((2*Math.PI/p.T)**2)/g*p.L)*.8;
 const terms=spectrum(p.H,p.T).map(x=>{
  const q=[stiffness,x.w*damping],A=add([ks-ms*x.w*x.w,x.w*bs],q),D=add([ku-mu*x.w*x.w,x.w*bu],q);
  const attenuation=Math.exp(-x.k*p.L);
  const fs=[ks*x.a,0],fu=[-rho*5*x.a*x.w*x.w*attenuation,0];
  const det=sub(mul(A,D),mul(q,q));
  const z1=div(add(mul(fs,D),mul(q,fu)),det),z2=div(add(mul(A,fu),mul(q,fs)),det);
  return {...x,z1,z2,attenuation};
 });
 return {p,terms,storm,damping,stiffness,bs,bu};
}
function harmonic(z,w,theta){const c=Math.cos(theta),s=Math.sin(theta);return [z[0]*c-z[1]*s,-w*(z[0]*s+z[1]*c)];}
export function instant(model,t){
 const {p,terms,damping,stiffness,storm}=model;
 let eta=0,zs=0,zu=0,vs=0,vu=0,orb=0,orbDeep=0;const segment=Array(12).fill(0);
 for(const x of terms){const th=x.w*t+x.phase,c=Math.cos(th);eta+=x.a*c;
  const a=harmonic(x.z1,x.w,th),b=harmonic(x.z2,x.w,th);zs+=a[0];vs+=a[1];zu+=b[0];vu+=b[1];
  orb+=x.a*x.w*c;orbDeep+=x.a*x.w*c*x.attenuation;
  for(let j=0;j<12;j++)segment[j]+=x.a*x.w*c*Math.exp(-x.k*p.L*(j+.5)/12);
 }
 const rel=zs-zu,rv=vs-vu,ptoForce=damping*rv,elastic=stiffness*rel,mechanical=damping*rv*rv;
 // 18% allocation to foils avoids counting the same energy twice.
 const foil=storm?0:mechanical*.18, shaft=storm?0:mechanical*.82,converted=shaft*.68,power=Math.min(2000,converted);
 const waterSurface=drag(rho,.7*p.cd,3,p.current+orb-p.speed),waterUnder=drag(rho,p.cd,2.8,p.current+orbDeep-p.speed);
 const beam=segment.reduce((s,v)=>s+drag(rho,1.2*p.cd,p.diameter*p.L/12,p.current+v-p.speed),0);
 const windForce=drag(air,p.airCd,5,p.wind-p.speed),gustForce=drag(air,p.airCd,5,p.gust-p.speed);
 const dragTotal=waterSurface+waterUnder+beam+windForce;
 // Force balance at imposed ground speed; no claimed free-running propulsion map.
 const foilThrust=foil*.45/Math.max(.3,Math.abs(p.speed-p.current));
 const required=Math.max(0,-dragTotal),deficit=Math.max(0,required-foilThrust);
 const holdW=deficit*Math.max(.3,Math.abs(p.speed-p.current))/.45;
 return {t,eta,zs,zu,vs,vu,rel,rv,mechanical,power,foil,loss:mechanical-power-foil,ptoForce,connection:elastic+ptoForce,
 waterSurface,waterUnder,beam,windForce,gustForce,dragTotal,holdW,foilThrust,orbDeep,pressureBar:1.013+rho*g*p.L/1e5};
}
export function simulate(input={}){
 const model=response(input),{p}=model,points=[];let battery=42000,generated=0,loads=0,curtailed=0,unserved=0,strokeMin=Infinity,strokeMax=-Infinity,peakForce=0;
 const dt=.2;for(let t=0;t<p.seconds-1e-8;t+=dt){const s=instant(model,t),step=Math.min(dt,p.seconds-t),charge=p.charge&&!model.storm&&Math.abs(s.vu)<.2&&battery>12000?1500:0;
 const load=60+s.holdW+charge/.85,energy=s.power*step/3600,demand=load*step/3600;
 const raw=battery+energy-demand;curtailed+=Math.max(0,raw-60000);unserved+=Math.max(0,-raw);battery=Math.max(0,Math.min(60000,raw));generated+=energy;loads+=demand;
 strokeMin=Math.min(strokeMin,s.rel);strokeMax=Math.max(strokeMax,s.rel);peakForce=Math.max(peakForce,Math.abs(s.connection));
 points.push({...s,battery,charge,load});}
 const avg=k=>points.reduce((s,x)=>s+x[k],0)/points.length;
 const peak=k=>Math.max(...points.map(x=>Math.abs(x[k])));
 const warnings=[];
 if(model.storm)warnings.push('Survival mode: generation and charging disabled. Extreme-wave motion is an extrapolation, not a survival prediction.');
 if(peak('rel')>1.5)warnings.push('Assumed ±1.5 m PTO travel exceeded: computed power is outside the usable stroke envelope.');
 if(peakForce>40000)warnings.push('Dynamic connection force exceeds the assumed 40 kN screening limit. Static preload and fatigue must be added.');
 if(p.rigid)warnings.push('Rigid-lock comparison: relative heave and useful PTO power approach zero.');
 if(p.H>p.L*.5)warnings.push('Shallow submergence relative to wave height: linear submerged-body assumptions unreliable.');
 if(p.L>1/(2*Math.PI/p.T)**2*g*3)warnings.push('Long connection: lower orbital motion but more connection drag.');
 return {model,points,avgPower:avg('power'),avgLoad:avg('load'),stroke:strokeMax-strokeMin,peakForce,generated,loads,curtailed,unserved,battery,
 residual:42000+generated-loads-curtailed+unserved-battery,waterDrag:avg('waterSurface')+avg('waterUnder'),beamDrag:avg('beam'),windDrag:avg('windForce'),pressure:points[0].pressureBar,underRms:Math.sqrt(avgSquared(points,'zu')),surfaceRms:Math.sqrt(avgSquared(points,'zs')),warnings};
}
function avgSquared(points,key){return points.reduce((s,x)=>s+x[key]**2,0)/points.length;}
