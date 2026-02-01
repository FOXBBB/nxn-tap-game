import sqlite3 from "sqlite3";

export const db = new sqlite3.Database("./backend/data.sqlite");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      balance INTEGER DEFAULT 0,
      energy INTEGER DEFAULT 100,
      tap_power INTEGER DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_id INTEGER,
      to_id INTEGER,
      amount INTEGER,
      fee INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});
