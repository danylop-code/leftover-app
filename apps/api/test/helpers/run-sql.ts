/** Runs a multi-statement SQL file (one statement per `;` line end, `--` comments) in one batch. */
export const runSql = async (db: D1Database, sql: string) => {
  const statements = sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter(Boolean);
  await db.batch(statements.map((s) => db.prepare(s)));
};
