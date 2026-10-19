import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// The API uses the subset shared by Cloudflare D1 and this local SQLite adapter.
// Database handles stay private; caller input is always bound, never interpolated.
export async function createLocalDatabase(filename) {
  if (filename !== ':memory:') await fs.mkdir(path.dirname(path.resolve(filename)), {recursive:true});
  const database = new DatabaseSync(filename);
  database.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  database.exec('CREATE TABLE IF NOT EXISTS _bmw_migrations (name TEXT PRIMARY KEY NOT NULL, applied_at INTEGER NOT NULL)');
  const directory = fileURLToPath(new URL('../drizzle/', import.meta.url));
  try {
    for (const name of (await fs.readdir(directory)).filter(name => /^\d+_[a-z0-9_]+\.sql$/i.test(name)).sort()) {
      if (database.prepare('SELECT name FROM _bmw_migrations WHERE name = ?').get(name)) continue;
      const sql = await fs.readFile(path.join(directory,name),'utf8');
      database.exec('BEGIN IMMEDIATE');
      try {
        database.exec(sql);
        database.prepare('INSERT INTO _bmw_migrations (name, applied_at) VALUES (?, ?)').run(name, Date.now());
        database.exec('COMMIT');
      } catch (error) {database.exec('ROLLBACK'); throw error;}
    }
  } catch (error) {database.close(); throw error;}
  const statements=new WeakMap();
  const statement = (sql, values = []) => {
   const prepared={
    bind(...next) {return statement(sql,next);},
    async first(column) {const row = database.prepare(sql).get(...values) || null; return column && row ? row[column] : row;},
    async all() {return {results:database.prepare(sql).all(...values),success:true};},
    async run() {const result=database.prepare(sql).run(...values);return {success:true,meta:{changes:Number(result.changes),last_row_id:Number(result.lastInsertRowid)}};}
   };
   statements.set(prepared,{sql,values});return prepared;
  };
  return {prepare:sql=>statement(sql), async batch(batch) {
    database.exec('BEGIN IMMEDIATE');
    try {
      const results=batch.map(prepared=>{
        const entry=statements.get(prepared);if(!entry)throw new Error('Batch statements must belong to this database.');
        const result=database.prepare(entry.sql).run(...entry.values);
        return {success:true,meta:{changes:Number(result.changes)}};
      });
      database.exec('COMMIT');return results;
    }catch(error){database.exec('ROLLBACK');throw error;}
  }, async exec(sql) {database.exec(sql);return {success:true};}, close() {database.close();}};
}
