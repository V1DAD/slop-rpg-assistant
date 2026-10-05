import { randomUUID } from 'crypto';
import db from './database';
import { User } from './repository';
import crypto from 'crypto';

export interface SessionInfo {
  id: number;
  user_id: number;
  token_hash: string;
  created_at: string;
  expires_at: string;
}

export function createSession(userId: number): { token: string; expires_at: string } {
  const token = randomUUID();
  const token_hash = crypto.createHash('sha256').update(token).digest('hex');
  const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(); // 24h
  const stmt = db.prepare('INSERT INTO sessions_auth (user_id, token_hash, expires_at) VALUES (?, ?, ?)');
  const info = stmt.run(userId, token_hash, expires_at);
  return { token, expires_at };
}

export function findSessionByToken(token: string): SessionInfo | undefined {
  const token_hash = crypto.createHash('sha256').update(token).digest('hex');
  const row = db.prepare('SELECT * FROM sessions_auth WHERE token_hash = ?').get(token_hash);
  return row ? mapRow(row) : undefined;
}

export function deleteSession(token: string): void {
  const token_hash = crypto.createHash('sha256').update(token).digest('hex');
  db.prepare('DELETE FROM sessions_auth WHERE token_hash = ?').run(token_hash);
}

export function deleteAllSessionsForUser(userId: number): void {
  db.prepare('DELETE FROM sessions_auth WHERE user_id = ?').run(userId);
}

function mapRow(r: any): SessionInfo {
  return {
    id: r.id,
    user_id: r.user_id,
    token_hash: r.token_hash,
    created_at: r.created_at,
    expires_at: r.expires_at
  };
}
