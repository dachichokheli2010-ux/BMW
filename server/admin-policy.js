// Administrator access is derived on every request from server configuration.
// An email alone is insufficient proof of ownership for password accounts.
const entries=value=>typeof value==='string'?value.split(',').map(item=>item.trim()).filter(Boolean):[];
export function administratorAccess(env,user){
 const ids=entries(env.ADMIN_USER_IDS),emails=entries(env.ADMIN_EMAILS).map(email=>email.toLowerCase());
 const byId=Boolean(user&&ids.includes(user.id)),byEmail=Boolean(user?.email&&emails.includes(user.email.toLowerCase()));
 const isAdmin=byId||byEmail&&user.emailVerified===true;
 return {isAdmin,configured:ids.length>0||emails.length>0,verificationRequired:Boolean(byEmail&&!byId&&!user.emailVerified)};
}
export function administratorUser(env,user){
 if(!user)return null;
 const {isAdmin}=administratorAccess(env,user);
 return {...user,isAdmin,role:isAdmin?'admin':'member'};
}
