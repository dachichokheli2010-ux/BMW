import {Pool} from '@neondatabase/serverless';

const schema=[
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT,
    created_at DOUBLE PRECISION NOT NULL,
    updated_at DOUBLE PRECISION NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    csrf_token TEXT NOT NULL,
    created_at DOUBLE PRECISION NOT NULL,
    expires_at DOUBLE PRECISION NOT NULL
  )`,
  'CREATE INDEX IF NOT EXISTS sessions_user_created ON sessions(user_id, created_at DESC)',
  `CREATE TABLE IF NOT EXISTS auth_limits (
    key TEXT PRIMARY KEY,
    attempts INTEGER NOT NULL,
    window_start DOUBLE PRECISION NOT NULL,
    expires_at DOUBLE PRECISION NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS user_garages (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    state TEXT NOT NULL,
    revision INTEGER NOT NULL,
    updated_at DOUBLE PRECISION NOT NULL
  )`
];
let schemaReady=false,schemaInitialization;

function postgresPlaceholders(sql){
  let index=0;
  return sql.replace(/\?/g,()=>`$${++index}`);
}

export async function createPostgresDatabase(connectionString){
  const pool=new Pool({connectionString,max:1});
  try{
    if(!schemaReady){
      if(!schemaInitialization){
        schemaInitialization=(async()=>{
          for(const statement of schema)await pool.query(statement);
          schemaReady=true;
        })().catch(error=>{schemaInitialization=null;throw error;});
      }
      await schemaInitialization;
    }
  }catch(error){
    await pool.end();
    throw error;
  }
  return {
    prepare(sql){
      let values=[];
      const text=postgresPlaceholders(sql);
      const statement={
        bind(...parameters){values=parameters;return statement;},
        async first(){const result=await pool.query(text,values);return result.rows[0]||null;},
        async run(){
          const result=await pool.query(text,values);
          return {results:result.rows,meta:{changes:result.rowCount}};
        }
      };
      return statement;
    },
    close:()=>pool.end()
  };
}
