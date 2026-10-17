import {EngineCore} from './engine-core.js';
class BMWEngineProcessor extends AudioWorkletProcessor{
 constructor(){super();this.core=new EngineCore(sampleRate);this.port.onmessage=e=>{if(e.data.profile)this.core.configure(e.data.profile);if(e.data.state)this.core.update(e.data.state);};}
 process(inputs,outputs){this.core.render(outputs.map(o=>o[0]));return true;}
}
registerProcessor('bmw-engine',BMWEngineProcessor);
