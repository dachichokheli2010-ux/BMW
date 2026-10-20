import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createInterface} from 'node:readline/promises';
import {Writable} from 'node:stream';
import {hashPassword} from '../server/passwords.js';
import {normalizeEmail,validPassword} from '../server/validation.js';

const root=fileURLToPath(new URL('../',import.meta.url));
let credentials;
try{
  if(process.argv.includes('--stdin')){
    // Automation passes one JSON line over stdin. Nothing received is echoed.
    const raw=process.stdin.isTTY;
    if(raw)process.stdin.setRawMode(true);
    process.stdout.write('Ready for hidden admin configuration on stdin.\n');
    const input=createInterface({input:process.stdin,terminal:false});
    try{for await(const line of input){credentials=JSON.parse(line);input.close();break;}}
    finally{if(raw)process.stdin.setRawMode(false);process.stdin.pause();}
  }else{
    if(!process.stdin.isTTY)throw new Error('Use --stdin for non-interactive configuration.');
    let hidden=false;
    const output=new Writable({write(chunk,_encoding,done){if(!hidden)process.stdout.write(chunk);done();}});
    const input=createInterface({input:process.stdin,output,terminal:true});
    try{
      const email=await input.question('Owner email: ');
      process.stdout.write('Owner password (hidden): ');hidden=true;
      const password=await input.question('');
      hidden=false;process.stdout.write('\n');credentials={email,password};
    }finally{input.close();}
  }
  const email=normalizeEmail(credentials?.email);
  if(!email||!validPassword(credentials?.password))throw new Error('Use a valid owner email and a password between 12 and 128 characters.');
  const hash=await hashPassword(credentials.password);
  credentials.password='';credentials=null;
  const filename=path.join(root,'.env.local');
  const before=await fs.readFile(filename,'utf8').catch(error=>{if(error.code==='ENOENT')return '';throw error;});
  const retained=before.split(/\r?\n/).filter(line=>!/^\s*(?:export\s+)?ADMIN_(?:LOGIN_EMAIL|PASSWORD_HASH|EMAILS|USER_IDS)\s*=/.test(line)).join('\n').replace(/\s+$/,'');
  await fs.writeFile(filename,(retained?retained+'\n':'')+'ADMIN_LOGIN_EMAIL='+JSON.stringify(email)+'\nADMIN_PASSWORD_HASH='+JSON.stringify(hash)+'\n',{mode:0o600});
  console.log('Private admin login configured in ignored .env.local. Restart the local server to apply it.');
  console.log('The password was hashed; no plaintext password was saved.');
}catch(error){
  credentials=null;
  console.error(error instanceof SyntaxError?'Admin configuration must be one JSON line with email and password.':error.message||'Could not configure private admin access.');
  process.exitCode=1;
}
