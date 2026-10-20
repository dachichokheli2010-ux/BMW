import {adminConfiguration} from '../server/admin-auth.js';
import {databaseURL} from '../server/postgres-db.js';

// Configuration check only: never print the email, hash or connection string.
const configured=Boolean(adminConfiguration(process.env));
console.log(JSON.stringify({privateAdminConfigured:configured,storage:databaseURL()?'PostgreSQL':'SQLite',entry:'/admin',publicAccountsGrantAccess:false},null,2));
if(!configured){
  console.error('Private admin credentials are missing or invalid. Run npm run admin:configure locally, or set ADMIN_LOGIN_EMAIL and ADMIN_PASSWORD_HASH in the deployment environment.');
  process.exitCode=1;
}
