import * as schema from "./schema.js";

const url = process.env.DATABASE_URL ?? "file:dev.db";
const isSqliteCloud = url.startsWith("sqlitecloud://");

type Db = ReturnType<typeof import("drizzle-orm/libsql").drizzle>;

let _db: Db;

function parseCloudUrl(u: string): { dbName: string; baseUrl: string } {
  const m = u.match(/^(sqlitecloud:\/\/[^/]+)\/([^?]+)(.*)$/);
  if (!m) return { dbName: "", baseUrl: u };
  return { dbName: m[2], baseUrl: m[1] + m[3] };
}

function resolveDriver(mod: any): new (url: string) => any {
  const Database = [
    mod.default?.Database,
    mod.Database,
    mod.default?.default,
    mod.default,
  ].find((x) => typeof x === "function");

  if (!Database) {
    console.error("@sqlitecloud/drivers exports:", Object.keys(mod));
    throw new Error("Failed to resolve Database constructor from @sqlitecloud/drivers");
  }
  return Database;
}

async function ensureCloudDb(Database: new (url: string) => any): Promise<void> {
  const { dbName, baseUrl } = parseCloudUrl(url);
  if (!dbName) return;

  console.log(`Ensuring SQLite Cloud database "${dbName}" exists...`);
  const bootstrap = new Database(baseUrl);
  try {
    await (bootstrap as any).run(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database "${dbName}" ready.`);
  } catch (e: any) {
    if (e.message?.includes("already exists")) {
      console.log(`Database "${dbName}" already exists.`);
    } else {
      console.warn("ensureCloudDb warning:", e.message);
    }
  } finally {
    try { (bootstrap as any).close?.(); } catch {}
  }
}

async function create(): Promise<Db> {
  if (isSqliteCloud) {
    const mod: any = await import("@sqlitecloud/drivers");
    const Database = resolveDriver(mod);

    await ensureCloudDb(Database);

    const { drizzle } = await import("drizzle-orm/sqlite-proxy");
    const connection = new Database(url);

    return drizzle(async (sql, params, method) => {
      const p = params as unknown[];
      if (method === "run") {
        await connection.run(sql, ...p);
        return { rows: [] };
      }
      const raw = await connection.all(sql, ...p);
      const rows = raw == null ? [] : Array.from(raw);
      return { rows };
    }, { schema }) as unknown as Db;
  }

  const { createClient } = await import("@libsql/client");
  const { drizzle } = await import("drizzle-orm/libsql");
  return drizzle(createClient({ url }), { schema });
}

export async function getDb(): Promise<Db> {
  if (!_db) _db = await create();
  return _db;
}

export function db(): Db {
  if (!_db) throw new Error("Database not initialized — call getDb() first");
  return _db;
}
