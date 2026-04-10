import * as schema from "./schema.js";

const url = process.env.DATABASE_URL ?? "file:dev.db";
const isSqliteCloud = url.startsWith("sqlitecloud://");

type Db = ReturnType<typeof import("drizzle-orm/libsql").drizzle>;

let _db: Db;

async function create(): Promise<Db> {
  if (isSqliteCloud) {
    const { default: Database } = await import("@sqlitecloud/drivers");
    const { drizzle } = await import("drizzle-orm/better-sqlite3");
    const connection = new Database(url);
    return drizzle(connection as any, { schema }) as unknown as Db;
  }
  const { createClient } = await import("@libsql/client");
  const { drizzle } = await import("drizzle-orm/libsql");
  return drizzle(createClient({ url }), { schema });
}

export async function getDb(): Promise<Db> {
  if (!_db) _db = await create();
  return _db;
}

// Synchronous accessor for after initialization
export function db(): Db {
  if (!_db) throw new Error("Database not initialized — call getDb() first");
  return _db;
}
