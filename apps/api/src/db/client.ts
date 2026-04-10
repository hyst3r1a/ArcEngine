import * as schema from "./schema.js";

const url = process.env.DATABASE_URL ?? "file:dev.db";
const isSqliteCloud = url.startsWith("sqlitecloud://");

type Db = ReturnType<typeof import("drizzle-orm/libsql").drizzle>;

let _db: Db;

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

async function create(): Promise<Db> {
  if (isSqliteCloud) {
    const mod: any = await import("@sqlitecloud/drivers");
    const Database = resolveDriver(mod);

    const { drizzle } = await import("drizzle-orm/sqlite-proxy");
    const connection = new Database(url);

    const runCb = (sql: string, ...args: unknown[]): Promise<void> =>
      new Promise((resolve, reject) =>
        connection.run(sql, ...args, (err: unknown) =>
          err ? reject(err) : resolve(),
        ),
      );

    const allCb = (sql: string, ...args: unknown[]): Promise<unknown[]> =>
      new Promise((resolve, reject) =>
        connection.all(sql, ...args, (err: unknown, rows: unknown) =>
          err ? reject(err) : resolve(rows == null ? [] : Array.from(rows as any)),
        ),
      );

    return drizzle(async (sql, params, method) => {
      if (method === "run") {
        await runCb(sql, ...(params as unknown[]));
        return { rows: [] };
      }
      const rows = await allCb(sql, ...(params as unknown[]));
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
