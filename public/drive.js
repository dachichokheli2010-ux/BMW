// Free-rev response is illustrative, not a factory ECU or power calculation.
export class EngineDrive {
 constructor(){this.profile={maxRPM:7000};this.stop();}
 configure(profile){this.stop();this.profile=profile;}
 async start(){this.running=true;this.elapsed=0;this.rpm=180;this.state='STARTUP';}
 stop(){this.running=false;this.rpm=0;this.throttle=0;this.elapsed=0;this.state='ENGINE OFF';}
 tick(dt){if(!this.running)return 0;const limit=this.profile.maxRPM||7000;this.elapsed+=dt;const starting=this.elapsed<.85;const target=starting?(this.elapsed<.16?220:760+350*Math.sin((this.elapsed-.16)/.69*Math.PI)):760+(limit-760)*this.throttle/100;const response=target>this.rpm?4.6:3.1;this.rpm+=(target-this.rpm)*Math.min(1,dt*response);this.state=starting?'STARTUP':this.rpm>limit-150?'REV LIMIT':this.rpm>1200?'REVVING':'IDLE';return this.rpm;}
}
