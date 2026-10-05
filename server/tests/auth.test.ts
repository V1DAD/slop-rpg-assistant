import server from '../src/app';
import http from 'http';
import { test, expect, beforeAll, afterAll } from 'vitest';

let listen: http.Server;
let port: number;

beforeAll(async () => {
  listen = await server.listen({ port: 0, host: '127.0.0.1' });
  const addr = listen.address();
  if (typeof addr === 'object' && addr) {
    port = addr.port;
  } else throw new Error('Failed to get port');
});

afterAll(async () => {
  await listen.close();
});

test('login returns 200 and cookie', async () => {
  const options = {
    hostname: '127.0.0.1',
    port,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const res = await new Promise<{ statusCode: number; headers: http.IncomingHttpHeaders }>((resolve, reject) => {
    const req = http.request(options, res => {
      resolve({ statusCode: res.statusCode!, headers: res.headers });
    });
    req.on('error', reject);
    req.write(JSON.stringify({ username: process.env.ADMIN_USER ?? 'admin', password: process.env.ADMIN_PASSWORD ?? 'admin123' }));
    req.end();
  });
  expect(res.statusCode).toBe(200);
  expect(res.headers['set-cookie']).toBeDefined();
});

test('protected route returns 401 without login', async () => {
  const options = {
    hostname: '127.0.0.1',
    port,
    path: '/admin/users',
    method: 'GET'
  };
  const res = await new Promise<{ statusCode: number; body: any }>((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode!, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.end();
  });
  expect(res.statusCode).toBe(401);
});

