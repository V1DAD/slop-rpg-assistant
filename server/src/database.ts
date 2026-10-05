import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'database.sqlite');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

const db = new Database(DB_PATH, { verbose: null });

export function initDatabase() {
  // Create migrations table if not exists
  db.prepare(
    `CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY
    );`
  ).run();

  const migrationRows = db.prepare('SELECT version FROM migrations ORDER BY version').all();
  const applied = migrationRows.map(r => r.version);

  // Define migrations in order
  const migrations = [
    {
      version: 1,
      up: () => {
        db.prepare(
          `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            active INTEGER NOT NULL DEFAULT 1,
            temp_password INTEGER NOT NULL DEFAULT 0,
            temp_password_hash TEXT,
            created_at DATETIME NOT NULL DEFAULT (datetime('now')),
            updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
          );`
        ).run();

        db.prepare(
          `CREATE TABLE IF NOT EXISTS sessions_auth (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token_hash TEXT NOT NULL,
            created_at DATETIME NOT NULL DEFAULT (datetime('now')),
            expires_at DATETIME NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
          );`
        ).run();

        db.prepare(`CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );`).run();

        db.prepare('INSERT INTO migrations (version) VALUES (1);').run();
      }
    }
  ];

  migrations.forEach(mig => {
    if (!applied.includes(mig.version)) {
      mig.up();
    }
  });
}

export default db;
