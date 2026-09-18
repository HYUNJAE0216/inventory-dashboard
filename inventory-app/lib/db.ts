import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "db", "inventory.db");

declare global {
  var __inventoryDb: Database.Database | undefined;
}

function createConnection() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      sort_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      unit TEXT NOT NULL,
      price INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS monthly_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL,
      item_id INTEGER NOT NULL REFERENCES items(id),
      system_qty INTEGER NOT NULL,
      physical_qty INTEGER NOT NULL,
      UNIQUE(month, item_id)
    );

    CREATE TABLE IF NOT EXISTS monthly_accuracy (
      month TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      accuracy_pct REAL NOT NULL
    );
  `);
  return db;
}

export function getDb(): Database.Database {
  if (!global.__inventoryDb) {
    global.__inventoryDb = createConnection();
  }
  return global.__inventoryDb;
}
