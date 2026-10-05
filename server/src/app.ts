import fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import cookie from '@fastify/cookie';
import { initDatabase } from './database';
import argon2 from 'argon2';
import db from './database';
import crypto from 'crypto';
import { createUser, getUserByUsername, getUserById, getAllUsers, updatePassword, deactivateUser } from './repository';
import { createSession, findSessionByToken, deleteSession } from './auth';
import { hasRole } from './policy';

initDatabase();
const allUsers = getAllUsers();
if (allUsers.length === 0) {
  const adminUser = process.env.ADMIN_USER ?? 'admin';
  const adminPass = process.env.ADMIN_PASSWORD ?? 'admin123';
  const password_hash = argon2.hashSync(adminPass);
  db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(adminUser, password_hash, 'GM');
  console.log(`Admin user ${adminUser} created`);
}

const app: FastifyInstance = fastify({ logger: true });

app.register(cookie, { secret: process.env.COOKIE_SECRET ?? 'supersecret' });

const loginAttempts = new Map<string, { count: number; first: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 1000;

app.get('/healthz', async (_req, reply) => {
  reply.code(200).send({ status: 'ok' });
});

app.post('/login', async (req, reply) => {
  const { username, password } = req.body as any;
  if (!username || !password) return reply.code(400).send({ error: 'Invalid body' });

  const key = `${req.ip}:${username}`;
  const now = Date.now();
  const entry = loginAttempts.get(key) || { count: 0, first: now };
  if (now - entry.first > RATE_WINDOW) {
    entry.count = 0;
    entry.first = now;
  }
  entry.count += 1;
  loginAttempts.set(key, entry);
  if (entry.count > RATE_LIMIT) {
    return reply.code(429).send({ error: 'Too many login attempts' });
  }

  const user = getUserByUsername(username);
  if (!user || !user.active) {
    return reply.code(401).send({ error: 'Invalid credentials' });
  }
  const valid = await argon2.verify(user.password_hash, password);
  if (!valid) {
    return reply.code(401).send({ error: 'Invalid credentials' });
  }

  const { token, expires_at } = createSession(user.id);
  reply.setCookie('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    expires: new Date(expires_at)
  });

  reply.send({ message: 'Logged in' });
});

app.post('/logout', async (req, reply) => {
  const token = req.cookies.session;
  if (token) deleteSession(token);
  reply.setCookie('session', '', {
    path: '/',
    expires: new Date(0)
  });
  reply.send({ message: 'Logged out' });
});

app.addHook('onRequest', async (req, reply) => {
  const token = req.cookies.session;
  if (!token) {
    (req as any).user = undefined;
    return;
  }
  const session = findSessionByToken(token);
  if (!session) {
    (req as any).user = undefined;
    return;
  }
  const user = getUserById(session.user_id);
   // Sliding expiration: extend session by 24h
   const newExpires = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
   db.prepare('UPDATE sessions_auth SET expires_at = ? WHERE id = ?').run(newExpires, session.id);
  (req as any).user = user;
});

function randomPassword(length = 12): string {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

const adminGuard = (req: FastifyRequest) => {
  const user: any = (req as any).user;
  if (!user) throw new Error('Unauthorized');
  if (!hasRole(user, 'GM')) throw new Error('Forbidden');
};

app.post('/admin/users', async (req, reply) => {
  try {
    adminGuard(req);
  } catch (e: any) {
    if (e.message === 'Unauthorized') return reply.code(401).send({ error: 'Unauthorized' });
    return reply.code(403).send({ error: 'Forbidden' });
  }
  const { username, role = 'PLAYER' } = req.body as any;
  if (!username) return reply.code(400).send({ error: 'Missing username' });
  const user = await createUser(username, randomPassword(), role);
  reply.code(201).send({ id: user.id, username: user.username, role: user.role, active: user.active });
});

app.put('/admin/users/:id', async (req, reply) => {
  try {
    adminGuard(req);
  } catch (e: any) {
    if (e.message === 'Unauthorized') return reply.code(401).send({ error: 'Unauthorized' });
    return reply.code(403).send({ error: 'Forbidden' });
  }
  const id = Number(req.params.id);
  const { username, role } = req.body as any;
  const user = getUserById(id);
  if (!user) return reply.code(404).send({ error: 'User not found' });
  if (username) user.username = username;
  if (role) user.role = role;
  // Update in DB
  db.prepare('UPDATE users SET username = ?, role = ? WHERE id = ?').run(user.username, user.role, id);
  reply.send({ id: user.id, username: user.username, role: user.role, active: user.active });
});

app.delete('/admin/users/:id', async (req, reply) => {
  try {
    adminGuard(req);
  } catch (e: any) {
    if (e.message === 'Unauthorized') return reply.code(401).send({ error: 'Unauthorized' });
    return reply.code(403).send({ error: 'Forbidden' });
  }
  const id = Number(req.params.id);
  const user = getUserById(id);
  if (!user) return reply.code(404).send({ error: 'User not found' });
  deactivateUser(id);
  reply.send({ message: 'User deactivated' });
});

app.post('/admin/users/:id/reset-password', async (req, reply) => {
  try {
    adminGuard(req);
  } catch (e: any) {
    if (e.message === 'Unauthorized') return reply.code(401).send({ error: 'Unauthorized' });
    return reply.code(403).send({ error: 'Forbidden' });
  }
  const id = Number(req.params.id);
  const user = getUserById(id);
  if (!user) return reply.code(404).send({ error: 'User not found' });
  const tempPass = randomPassword();
  await updatePassword(id, tempPass, true);
  reply.send({ tempPassword: tempPass });
});

app.get('/admin/users', async (req, reply) => {
  try {
    adminGuard(req);
  } catch (e: any) {
    if (e.message === 'Unauthorized') return reply.code(401).send({ error: 'Unauthorized' });
    return reply.code(403).send({ error: 'Forbidden' });
  }
  const users = getAllUsers().map(u => ({ id: u.id, username: u.username, role: u.role, active: u.active }));
  reply.send(users);
});

export default app;
