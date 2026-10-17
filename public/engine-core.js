// Illustrative DSP profiles. These are sound-design choices, NOT measured BMW acoustics.
export const profiles={
 N55:{body:.88,rasp:.19,intake:.14,turbo:.14,weights:[1,.88,1.04,.94,1.02,.91]},
 N54:{body:.92,rasp:.22,intake:.15,turbo:.18,weights:[1,.87,1.03,.93,1.02,.9]},
 B58:{body:.94,rasp:.12,intake:.12,turbo:.12,weights:[1,.97,1.02,.96,1.01,.98]},
 S54:{body:.68,rasp:.47,intake:.32,turbo:0,weights:[1,.94,1.07,.91,1.03,.96]},
 M54:{body:.78,rasp:.15,intake:.22,turbo:0,weights:[1,.98,1.02,.96,1.02,.97]},
 S55:{body:.76,rasp:.44,intake:.2,turbo:.18,weights:[1,.9,1.07,.87,1.04,.94]},
 S58:{body:.87,rasp:.31,intake:.18,turbo:.18,weights:[1,.95,1.06,.91,1.02,.94]},
 S65:{body:.72,rasp:.35,intake:.34,turbo:0,weights:[1,.97,1.03,.99,1.02,.96,1.04,.98]},
 S85:{body:.58,rasp:.43,intake:.37,turbo:0,weights:[1,.96,1.03,.98,1.02,.97,1.04,.99,1.01,.95]},
 S62:{body:1.12,rasp:.17,intake:.22,turbo:0,weights:[1,.79,1.13,.86,1.07,.8,1.16,.88]},
 S63:{body:1.18,rasp:.2,intake:.13,turbo:.17,weights:[1,.78,1.13,.87,1.06,.79,1.17,.89]},
 S63TU:{body:1.14,rasp:.24,intake:.15,turbo:.17,weights:[1,.81,1.1,.89,1.06,.82,1.13,.91]},
 B48:{body:.72,rasp:.25,intake:.15,turbo:.12,weights:[1,.9,1.07,.93]},
 B46:{body:.7,rasp:.23,intake:.14,turbo:.12,weights:[1,.92,1.05,.94]},
 B38:{body:.76,rasp:.28,intake:.18,turbo:.12,weights:[1,.87,1.06]},
 S14:{body:.66,rasp:.38,intake:.29,turbo:0,weights:[1,.94,1.06,.97]},
 M70:{body:.84,rasp:.12,intake:.2,turbo:0,weights:[1,.98,1.02,.97,1.03,.99,1.01,.96,1.04,.98,1.02,1]}
};
// Unknown engines receive an illustrative profile with the matching cylinder
// count and aspiration. Engine-family matching is not an acoustic measurement.
function soundProfile(m){
 const code=String(m.code||'').trim().toUpperCase();
 if(profiles[code])return profiles[code];
 const family=code.match(/^([A-Z]+\d+)/)?.[1];
 if(profiles[family])return profiles[family];
 const turbo=Number(m.turbos)>0;
 switch(Number(m.cylinders)||6){
  case 3:return profiles.B38;
  case 4:return turbo?profiles.B48:profiles.S14;
  case 8:return turbo?profiles.S63:profiles.S62;
  case 10:return profiles.S85;
  case 12:return profiles.M70;
  default:return turbo?profiles.N55:profiles.M54;
 }
}
export class EngineCore{
 constructor(rate=48000){this.rate=rate;this.phase=0;this.crank=0;this.time=0;this.turboPhase=0;this.rpm=0;this.load=0;this.level=0;this.spool=0;this.air=0;this.random=12345;this.configure({code:'N55',cylinders:6,turbos:1,maxRPM:7000});this.target={rpm:0,load:0,running:false,gear:0};}
 configure(m){this.profile=soundProfile(m);this.cylinders=m.cylinders||6;this.turbos=m.turbos||0;this.limit=m.maxRPM||7000;this.phase=0;this.crank=0;this.spool=0;this.air=0;this.rpm=0;this.load=0;this.level=0;this.elapsed=0;this.coast=0;this.strokeStrength=1;}
 update(v){if(this.target?.running&&this.target.load>.3&&v.load<.15&&this.rpm>1800){this.coast=.45;if(this.turbos)this.air=Math.min(.85,.2+this.spool*1.7);}this.target=v;}
 render(outputs){const p=this.profile,dt=1/this.rate,t=this.target;const n=outputs[0].length;for(let i=0;i<n;i++){
  this.rpm+=(t.rpm-this.rpm)*Math.min(1,dt*22);const previous=this.load;this.load+=(t.load-this.load)*Math.min(1,dt*30);this.level+=((t.running?1:0)-this.level)*dt*(t.running?12:16);this.time+=dt;this.elapsed+=t.running?dt:0;
  const oldPhase=this.phase;const rpm=Math.max(80,this.rpm),f=rpm*this.cylinders/120,jitter=1+(.009-.006*rpm/this.limit)*Math.sin(this.time*23)+.003*Math.sin(this.time*41);this.phase=(this.phase+f*dt*jitter)%1;this.crank=(this.crank+rpm/120*dt)%1;
  const tau=Math.PI*2,ph=this.phase*tau;this.random=(1664525*this.random+1013904223)>>>0;const noise=this.random/2147483648-1;
  if(this.phase<oldPhase)this.strokeStrength=.83+(noise+1)*.15;const weights=p.weights,stroke=Math.floor(this.crank*this.cylinders)%weights.length;
  this.coast*=Math.exp(-dt*4.5);const breath=.68+this.load*.8;const fundamental=Math.sin(ph),harmonic=Math.sin(ph*2)*.28+Math.sin(ph*3)*.12+Math.sin(ph*4)*.07;
  const pulse=(Math.exp(-this.phase*(6+this.load*3))-(1-Math.exp(-(6+this.load*3)))/(6+this.load*3))*weights[stroke];
  const bank=(Math.sin(this.crank*tau)*.18+Math.sin(this.crank*tau*2)*.08)*p.body;
  const limiter=rpm>this.limit-120&&this.load>.8?(Math.sin(this.time*2*Math.PI*19)>-.1?1:.22):1;
  const start=this.elapsed<.7?(.45+.55*Math.min(1,this.elapsed/.7)):1,level=this.level*limiter*start;
  outputs[0][i]=(pulse*.37*this.strokeStrength*(1+noise*.45)+bank*.26+fundamental*.025+noise*.055*(.4+this.load)+harmonic*p.rasp*.10)*level*breath;
  outputs[1][i]=Math.tanh((pulse*.91*p.body*this.strokeStrength*(1+noise*.20)+bank*.65+harmonic*p.rasp*.35+noise*(.025+this.coast*.32))*1.65)*level*breath;
  outputs[2][i]=(noise*.13+Math.sin(ph*2)*.07)*p.intake*level*(.16+this.load*.84);
  const boostTarget=this.turbos?Math.max(0,(rpm-2200)/(this.limit-2200))*this.load*.3:0;
  const oldSpool=this.spool;this.spool+=(boostTarget-this.spool)*dt*(boostTarget>this.spool?1.8:4.5);
  this.air*=Math.exp(-dt*5.5);
  this.turboPhase=(this.turboPhase+(900+this.spool*2100)*dt)%1;outputs[3][i]=this.turbos?(noise*(this.spool*.15+this.air*.65)+Math.sin(this.turboPhase*tau)*this.spool*.008)*p.turbo*level:0;
  outputs[4][i]=(noise*.045*(.4+this.phase)+Math.sin(ph*5)*p.rasp*.012)*level*(.35+rpm/this.limit*.65);
 }return outputs;}
}
