import db from './database';

import argon2 from 'argon2';
import crypto from 'crypto';

export type User = {
  id: number;
  username: string;
  password_hash: string;
  role: string;
  active: boolean;
  temp_password: boolean;
  temp_password_hash?: string;
  created_at: string;
  updated_at: string;
};

export async function createUser(username: string, password: string, role: string = 'PLAYER'): Promise<User> {
  const password_hash = await argon2.hash(password);
  const stmt = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
  const info = stmt.run(username, password_hash, role);
  return getUserById(info.lastInsertRowid as number);
}

export function getUserById(id: number): User | undefined {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return row ? mapRow(row) : undefined;
}

export function getUserByUsername(username: string): User | undefined {
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  return row ? mapRow(row) : undefined;
}

export async function updatePassword(userId: number, newPassword: string, temp = false): Promise<void> {
  const new_hash = await argon2.hash(newPassword);
  const stmt = db.prepare('UPDATE users SET password_hash = ?, temp_password = ?, updated_at = datetime("now") WHERE id = ?');
  stmt.run(new_hash, temp ? 1 : 0, userId);
}

export function deactivateUser(userId: number): void {
  db.prepare('UPDATE users SET active = 0, updated_at = datetime("now") WHERE id = ?').run(userId);
}

export function getAllUsers(): User[] {
  const rows = db.prepare('SELECT * FROM users').all();
  return rows.map(mapRow);
}

function mapRow(r: any): User {
  return {
    id: r.id,
    username: r.username,
    password_hash: r.password_hash,
    role: r.role,
    active: !!r.active,
    temp_password: !!r.temp_password,
    temp_password_hash: r.temp_password_hash,
    created_at: r.created_at,
    updated_at: r.updated_at
  };
}
