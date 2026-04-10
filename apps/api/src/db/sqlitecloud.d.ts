declare module "@sqlitecloud/drivers" {
  class Database {
    constructor(url: string);
    prepare(sql: string): Statement;
    exec(sql: string): void;
    get(sql: string, ...params: unknown[]): unknown;
    all(sql: string, ...params: unknown[]): unknown[];
    run(sql: string, ...params: unknown[]): RunResult;
    close(): void;
  }
  interface Statement {
    run(...params: unknown[]): RunResult;
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
    bind(...params: unknown[]): Statement;
  }
  interface RunResult {
    changes: number;
    lastInsertRowid: number | bigint;
  }
  export default Database;
}
