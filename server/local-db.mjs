import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// The API uses the subset shared by Cloudflare D1 and this local SQLite adapter.
// Database handles stay private; caller input is always bound, never interpolated.
export async function createLocalDatabase(filename) {
  if (filename !== ':memory:') await fs.mkdir(path.dirname(path.resolve(filename)), {recursive:true});
  const database = new DatabaseSync(filename);
  // Match PostgreSQL/JavaScript case folding for Georgian and Cyrillic names;
  // SQLite's built-in lower() otherwise only handles ASCII letters.
  database.function('lower',{deterministic:true},value=>value==null?null:String(value).toLowerCase());
  const directory = fileURLToPath(new URL('../drizzle/', import.meta.url));
  try {
    // Configure the wait before WAL/schema writes; concurrent server starts can
    // otherwise fail immediately while another connection is initializing.
    database.exec('PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;');
    const deadline=Date.now()+5000;
    for(;;){
      try{database.exec('PRAGMA journal_mode = WAL;');break;}
      catch(error){
        // SQLite can return BUSY immediately during a journal-mode change even
        // with busy_timeout set. Release this turn before retrying startup.
        if((error.errcode&255)!==5||Date.now()>=deadline)throw error;
        await new Promise(resolve=>setTimeout(resolve,25));
      }
    }
    database.exec('CREATE TABLE IF NOT EXISTS _bmw_migrations (name TEXT PRIMARY KEY NOT NULL, applied_at INTEGER NOT NULL)');
    for (const name of (await fs.readdir(directory)).filter(name => /^\d+_[a-z0-9_]+\.sql$/i.test(name)).sort()) {
      if (database.prepare('SELECT name FROM _bmw_migrations WHERE name = ?').get(name)) continue;
      const sql = await fs.readFile(path.join(directory,name),'utf8');
      database.exec('BEGIN IMMEDIATE');
      try {
        // The first read is an optimization. Recheck under the write lock in
        // case another process applied this migration while we read the file.
        if (!database.prepare('SELECT name FROM _bmw_migrations WHERE name = ?').get(name)) {
          database.exec(sql);
          database.prepare('INSERT INTO _bmw_migrations (name, applied_at) VALUES (?, ?)').run(name, Date.now());
        }
        database.exec('COMMIT');
      } catch (error) {database.exec('ROLLBACK'); throw error;}
    }
  } catch (error) {database.close(); throw error;}
  const execute=(sql,values)=>{
    const query=database.prepare(sql);
    if(!query.columns().length){const result=query.run(...values);return {results:[],success:true,meta:{changes:Number(result.changes),last_row_id:Number(result.lastInsertRowid)}};}
    const before=database.prepare('SELECT total_changes() AS total').get().total,results=query.all(...values);
    const after=database.prepare('SELECT total_changes() AS total,changes() AS changes,last_insert_rowid() AS id').get();
    return {results,success:true,meta:{changes:after.total===before?0:Number(after.changes),last_row_id:Number(after.id)}};
  };
  const statements=new WeakMap();
  const statement = (sql, values = []) => {
   const prepared={
    bind(...next) {return statement(sql,next);},
    async first(column) {const row = database.prepare(sql).get(...values) || null; return column && row ? row[column] : row;},
    async all() {return {results:database.prepare(sql).all(...values),success:true};},
    async run() {return execute(sql,values);}
   };
   statements.set(prepared,{sql,values});return prepared;
  };
  return {prepare:sql=>statement(sql), async batch(batch) {
    database.exec('BEGIN IMMEDIATE');
    try {
      const results=batch.map(prepared=>{
        const entry=statements.get(prepared);if(!entry)throw new Error('Batch statements must belong to this database.');
        return execute(entry.sql,entry.values);
      });
      database.exec('COMMIT');return results;
    }catch(error){database.exec('ROLLBACK');throw error;}
  }, async exec(sql) {database.exec(sql);return {success:true};}, close() {database.close();}};
}
