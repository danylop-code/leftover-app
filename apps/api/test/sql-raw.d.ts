// Vite `?raw` imports of SQL files (seed tests).
declare module '*.sql?raw' {
  const sql: string;
  export default sql;
}
