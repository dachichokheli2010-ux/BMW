// Account links only use an explicitly configured public origin, never a Host
// header supplied by a visitor. Tests inject MAILER; production uses Resend.
export function accountOrigin(env={}) {
  try {
    const url=new URL(env.PUBLIC_ORIGIN);
    const local=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
    if((url.protocol!=='https:'&&!(local&&url.protocol==='http:'))||url.username||url.password||url.pathname!=='/'||url.search||url.hash)return null;
    return url.origin;
  } catch {return null;}
}
export function accountMailConfigured(env={}) {
  return Boolean(accountOrigin(env)&&(typeof env.MAILER?.send==='function'||typeof env.RESEND_API_KEY==='string'&&env.RESEND_API_KEY.trim()&&typeof env.ACCOUNT_MAIL_FROM==='string'&&env.ACCOUNT_MAIL_FROM.trim()&&!/[\r\n]/.test(env.ACCOUNT_MAIL_FROM)));
}
const copy={
  en:{verifySubject:'Verify your APEX email',verify:'Confirm your email address to mark your APEX account as verified.',resetSubject:'Reset your APEX password',reset:'Use this private link to choose a new APEX password. It expires in 30 minutes.',verifyExpiry:'This private link expires in 24 hours.',ignore:'If you did not request this, you can ignore this email.',notice:'APEX is an independent enthusiast site, not affiliated with BMW AG.'},
  ka:{verifySubject:'დაადასტურეთ APEX-ის ელფოსტა',verify:'დაადასტურეთ ელფოსტის მისამართი, რომ APEX-ის ანგარიში დადასტურებულად მოინიშნოს.',resetSubject:'APEX-ის პაროლის აღდგენა',reset:'ახალი პაროლის ასარჩევად გამოიყენეთ ეს პირადი ბმული. ბმული მოქმედებს 30 წუთის განმავლობაში.',verifyExpiry:'ეს პირადი ბმული მოქმედებს 24 საათის განმავლობაში.',ignore:'თუ ეს მოთხოვნა თქვენ არ გაგიგზავნიათ, შეგიძლიათ წერილი უგულებელყოთ.',notice:'APEX დამოუკიდებელი ენთუზიასტების საიტია და BMW AG-სთან დაკავშირებული არ არის.'},
  ru:{verifySubject:'Подтвердите почту APEX',verify:'Подтвердите адрес электронной почты, чтобы ваш аккаунт APEX был отмечен как подтверждённый.',resetSubject:'Сброс пароля APEX',reset:'Используйте эту личную ссылку, чтобы задать новый пароль APEX. Она действует 30 минут.',verifyExpiry:'Эта личная ссылка действует 24 часа.',ignore:'Если вы не отправляли этот запрос, просто проигнорируйте письмо.',notice:'APEX — независимый сайт энтузиастов, не связанный с BMW AG.'}
};
export async function sendAccountMail(env,{to,purpose,token,language='en',idempotencyKey}) {
  if(!accountMailConfigured(env))throw new Error('Account mail is not configured.');
  const strings=copy[language]||copy.en,reset=purpose==='reset';
  const link=new URL((language==='en'?'':'/'+language)+'/account',accountOrigin(env));
  // A fragment keeps a bearer token out of access logs and Referrer headers.
  link.hash=(reset?'reset=':'verify=')+token;
  const message={from:env.ACCOUNT_MAIL_FROM,to:[to],subject:reset?strings.resetSubject:strings.verifySubject,text:[reset?strings.reset:strings.verify,link.href,...(reset?[]:[strings.verifyExpiry]),strings.ignore,strings.notice].join('\n\n')};
  if(typeof env.MAILER?.send==='function'){await env.MAILER.send({...message,purpose,language,idempotencyKey});return;}
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY.trim(),'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify(message),signal:AbortSignal.timeout(8000)});
  // Never include provider response text: it can contain email addresses or links.
  if(!response.ok)throw new Error('Account mail delivery failed.');
}
