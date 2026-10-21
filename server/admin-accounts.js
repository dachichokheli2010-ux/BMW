const iso=value=>value==null?null:new Date(Number(value)).toISOString();
const escapeLike=value=>value.toLowerCase().replace(/[!%_]/g,'!$&');
const publicUsers="u.provider IN ('password','chatgpt')";

export async function handleAdminAccounts(request,env,{adminSession,ApiError,json}){
 if(!adminSession)throw new ApiError('Sign in to the administrator workspace.',401,'ADMIN_REQUIRED');
 if(request.method!=='GET')return json({error:'Method not allowed.'},405,{Allow:'GET'});
 const params=new URL(request.url).searchParams,query=(params.get('q')||'').trim(),status=params.get('status')||'all',sort=params.get('sort')||'newest';
 if(params.has('view')&&params.get('view')!=='accounts'||!['all','active','never-signed-in'].includes(status)||!['newest','oldest','last-signin'].includes(sort)||query.length>100||/[\u0000-\u001f\u007f]/.test(query))throw new ApiError('Choose a valid account view, search and filter.',400,'INVALID_ACCOUNT_FILTER');
 const integer=(key,fallback,max)=>{const value=params.get(key);if(value===null)return fallback;if(!/^[1-9]\d*$/.test(value)||Number(value)>max)throw new ApiError('Choose a valid account page and page size.',400,'INVALID_ACCOUNT_PAGE');return Number(value);};
 const requestedPage=integer('page',1,1000000),pageSize=integer('pageSize',20,100),now=Date.now(),day=new Date(now).toISOString().slice(0,10),today=Date.parse(day+'T00:00:00Z');
 const where=[publicUsers],values=[];
 if(status==='active'){where.push('EXISTS (SELECT 1 FROM sessions WHERE sessions.user_id = u.id AND sessions.expires_at > ?)');values.push(now);}
 if(status==='never-signed-in')where.push('a.user_id IS NULL');
 if(query){const needle='%'+escapeLike(query)+'%';where.push("(LOWER(u.name) LIKE ? ESCAPE '!' OR LOWER(COALESCE(u.email,'')) LIKE ? ESCAPE '!' OR LOWER(COALESCE(p.handle,'')) LIKE ? ESCAPE '!')");values.push(needle,needle,needle);}
 const from='FROM users u LEFT JOIN user_login_activity a ON a.user_id = u.id LEFT JOIN community_profiles p ON p.user_id = u.id WHERE '+where.join(' AND ');
 const total=Number((await env.DB.prepare('SELECT COUNT(*) AS count '+from).bind(...values).first()).count),totalPages=Math.max(1,Math.ceil(total/pageSize)),page=Math.min(requestedPage,totalPages);
 const order=sort==='last-signin'?'CASE WHEN a.last_signed_in_at IS NULL THEN 1 ELSE 0 END,a.last_signed_in_at DESC,u.id ASC':sort==='oldest'?'u.created_at ASC,u.id ASC':'u.created_at DESC,u.id ASC';
 // Select only directory fields and aggregate counts. Bearer/session tokens,
 // password records and private garages never enter this response projection.
 const rows=(await env.DB.prepare(`SELECT u.id,u.name,u.email,u.provider,u.created_at,
  CASE WHEN u.provider = 'chatgpt' OR v.verified_at IS NOT NULL THEN 1 ELSE 0 END AS email_verified,
  CASE WHEN u.provider = 'password' AND u.password_hash IS NOT NULL AND LENGTH(u.password_hash) > 0 THEN 1 ELSE 0 END AS password_configured,
  a.last_signed_in_at,COALESCE(a.sign_in_count,0) AS sign_in_count,
  (SELECT COUNT(*) FROM sessions WHERE sessions.user_id = u.id AND sessions.expires_at > ?) AS active_sessions
  FROM users u LEFT JOIN user_login_activity a ON a.user_id = u.id LEFT JOIN user_verifications v ON v.user_id = u.id LEFT JOIN community_profiles p ON p.user_id = u.id
  WHERE ${where.join(' AND ')} ORDER BY ${order} LIMIT ? OFFSET ?`).bind(now,...values,pageSize,(page-1)*pageSize).all()).results;
 const accounts=rows.map(row=>({id:row.id,name:row.name,email:row.email,provider:row.provider,createdAt:iso(row.created_at),emailVerified:Boolean(Number(row.email_verified)),passwordConfigured:Boolean(Number(row.password_configured)),lastSignedInAt:iso(row.last_signed_in_at),signInCount:Number(row.sign_in_count),activeSessions:Number(row.active_sessions)}));
 const raw=await env.DB.prepare(`SELECT COUNT(*) AS accounts,
  COALESCE(SUM(CASE WHEN EXISTS (SELECT 1 FROM sessions WHERE sessions.user_id = u.id AND sessions.expires_at > ?) THEN 1 ELSE 0 END),0) AS active_accounts,
  COALESCE(SUM(CASE WHEN a.last_signed_in_at >= ? AND a.last_signed_in_at < ? THEN 1 ELSE 0 END),0) AS signed_in_today,
  COALESCE(SUM(CASE WHEN u.created_at >= ? AND u.created_at < ? THEN 1 ELSE 0 END),0) AS new_accounts_today,
  COALESCE(SUM(a.sign_in_count),0) AS total_tracked_sign_ins
  FROM users u LEFT JOIN user_login_activity a ON a.user_id = u.id WHERE ${publicUsers}`).bind(now,today,today+86400000,today,today+86400000).first();
 const stats={accounts:Number(raw.accounts),activeAccounts:Number(raw.active_accounts),signedInToday:Number(raw.signed_in_today),newAccountsToday:Number(raw.new_accounts_today),totalTrackedSignIns:Number(raw.total_tracked_sign_ins)};
 const recent=(await env.DB.prepare(`SELECT u.id,u.name,u.email,u.provider,a.last_signed_in_at FROM user_login_activity a INNER JOIN users u ON u.id = a.user_id WHERE ${publicUsers} ORDER BY a.last_signed_in_at DESC,u.id ASC LIMIT 20`).all()).results;
 return json({accounts,stats,pagination:{view:'accounts',page,pageSize,total,totalPages,hasPrevious:page>1,hasNext:page<totalPages,query,status,sort},recentSignIns:recent.map(row=>({id:row.id,name:row.name,email:row.email,provider:row.provider,lastSignedInAt:iso(row.last_signed_in_at)}))});
}
