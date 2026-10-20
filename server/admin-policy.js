// Public accounts are always members. Administrative authority is established
// only by the dedicated admin cookie, never by an account ID or email allowlist.
export function administratorUser(env,user){
 if(!user)return null;
 return {...user,isAdmin:false,role:'member'};
}
