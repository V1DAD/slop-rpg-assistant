import server from '../src/app';
import http from 'http';
import { test, expect, beforeAll, afterAll } from 'vitest';

let listen: http.Server;
let port: number;
let adminCookie: string | undefined;

beforeAll(async () => {
  listen = await server.listen({ port: 0, host: '127.0.0.1' });
  const addr = listen.address();
  if (typeof addr === 'object' && addr) {
    port = addr.port;
  } else throw new Error('Failed to get port');

  // login as admin to get cookie
  const loginOpts = {
    hostname: '127.0.0.1',
    port,
    path: '/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  };
  const loginRes = await new Promise<{ statusCode: number; headers: http.IncomingHttpHeaders }>((resolve, reject) => {
    const req = http.request(loginOpts, res => resolve({ statusCode: res.statusCode!, headers: res.headers }));
    req.on('error', reject);
    req.write(JSON.stringify({ username: process.env.ADMIN_USER ?? 'admin', password: process.env.ADMIN_PASSWORD ?? 'admin123' }));
    req.end();
  });
  const setCookie = loginRes.headers['set-cookie'];
  if (setCookie) adminCookie = setCookie[0].split(';')[0];
});
  listen = await server.listen({ port: 0, host: '127.0.0.1' });
  const addr = listen.address();
  if (typeof addr === 'object' && addr) {
    port = addr.port;
  } else throw new Error('Failed to get port');
});

afterAll(async () => {
  await listen.close();
});

test('login cookie set and admin route accessible', async () => {
  expect(adminCookie).toBeDefined();
  const adminOpts = {
    hostname: '127.0.0.1',
    port,
    path: '/admin/users',
    method: 'GET',
    headers: {
      Cookie: adminCookie!
    }
  };
  const adminRes = await new Promise<{ statusCode: number; body: any }>((resolve, reject) => {
    const req = http.request(adminOpts, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode!, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.end();
  });
  expect(adminRes.statusCode).toBe(200);
  expect(Array.isArray(adminRes.body)).toBe(true);
});

test('rate limiting returns 429 after 5 attempts', async () => {
  const attempt = async () => {
    const opts = {
      hostname: '127.0.0.1',
      port,
      path: '/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };
    return new Promise<{ statusCode: number }>((resolve, reject) => {
      const req = http.request(opts, res => resolve({ statusCode: res.statusCode! }));
      req.on('error', reject);
      req.write(JSON.stringify({ username: 'nonexistent', password: 'wrong' }));
      req.end();
    });
  };
  for (let i = 0; i < 5; i++) {
    const res = await attempt();
    expect(res.statusCode).toBe(401);
  }
  const res = await attempt();
  expect(res.statusCode).toBe(429);
});

test('logout clears session', async () => {
  // login first
  const loginOpts = {
    hostname: '127.0.0.1',
    port,
    path: '/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  };
  const loginRes = await new Promise<{ statusCode: number; headers: http.IncomingHttpHeaders }>((resolve, reject) => {
    const req = http.request(loginOpts, res => resolve({ statusCode: res.statusCode!, headers: res.headers }));
    req.on('error', reject);
    req.write(JSON.stringify({ username: process.env.ADMIN_USER ?? 'admin', password: process.env.ADMIN_PASSWORD ?? 'admin123' }));
    req.end();
  });
  const cookie = loginRes.headers['set-cookie']?.[0].split(';')[0];
  expect(cookie).toBeDefined();

  const logoutOpts = {
    hostname: '127.0.0.1',
    port,
    path: '/logout',
    method: 'POST',
    headers: { Cookie: cookie! }
  };
  const logoutRes = await new Promise<{ statusCode: number }>((resolve, reject) => {
    const req = http.request(logoutOpts, res => resolve({ statusCode: res.statusCode! }));
    req.on('error', reject);
    req.end();
  });
  expect(logoutRes.statusCode).toBe(200);

  const protectedOpts = {
    hostname: '127.0.0.1',
    port,
    path: '/admin/users',
    method: 'GET',
    headers: { Cookie: cookie! }
  };
  const protectedRes = await new Promise<{ statusCode: number }>((resolve, reject) => {
    const req = http.request(protectedOpts, res => resolve({ statusCode: res.statusCode! }));
    req.on('error', reject);
    req.end();
  });
  expect(protectedRes.statusCode).toBe(401);
});

test('policy hasRole works', () => {
  const { hasRole } = require('../src/policy');
  const gmUser = { role: 'GM' } as any;
  const playerUser = { role: 'PLAYER' } as any;
  expect(hasRole(gmUser, 'GM')).toBe(true);
  expect(hasRole(playerUser, 'GM')).toBe(false);
});

test('reset password flow', async () => {
  // create new player
  const createOpts = {
    hostname: '127.0.0.1',
    port,
    path: '/admin/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminCookie!
    }
  };
  const createRes = await new Promise<{ statusCode: number; body: any }>((resolve, reject) => {
    const req = http.request(createOpts, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode!, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(JSON.stringify({ username: 'testplayer' }));
    req.end();
  });
  expect(createRes.statusCode).toBe(201);
  const playerId = createRes.body.id;

  // reset password
  const resetOpts = {
    hostname: '127.0.0.1',
    port,
    path: `/admin/users/${playerId}/reset-password`,
    method: 'POST',
    headers: { Cookie: adminCookie! }
  };
  const resetRes = await new Promise<{ statusCode: number; body: any }>((resolve, reject) => {
    const req = http.request(resetOpts, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode!, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.end();
  });
  expect(resetRes.statusCode).toBe(200);
  const tempPass = resetRes.body.tempPassword;
  expect(typeof tempPass).toBe('string');

  // login with temp password
  const loginOpts = {
    hostname: '127.0.0.1',
    port,
    path: '/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  };
  const loginRes = await new Promise<{ statusCode: number }>((resolve, reject) => {
    const req = http.request(loginOpts, res => resolve({ statusCode: res.statusCode! }));
    req.on('error', reject);
    req.write(JSON.stringify({ username: 'testplayer', password: tempPass }));
    req.end();
  });
  expect(loginRes.statusCode).toBe(200);
});

  const { hasRole } = require('../src/policy');
  const gmUser = { role: 'GM' } as any;
  const playerUser = { role: 'PLAYER' } as any;
  expect(hasRole(gmUser, 'GM')).toBe(true);
  expect(hasRole(playerUser, 'GM')).toBe(false);
});

