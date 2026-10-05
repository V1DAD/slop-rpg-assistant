// Healthz endpoint test
import server from '../src/app';
import http from 'http';
import { test, expect } from 'vitest';

test('GET /healthz returns 200', async () => {
  const listen = server.listen({ port: 0, host: '127.0.0.1' });
  const { port } = await new Promise<{ port: number }>((resolve, reject) => {
    listen.once('listening', () => {
      const addr = listen.address();
      if (typeof addr === 'object' && addr) {
        resolve({ port: addr.port });
      } else {
        reject(new Error('No address'));
      }
    });
  });

  const options = {
    hostname: '127.0.0.1',
    port,
    path: '/healthz',
    method: 'GET'
  };

  const res = await new Promise<{ statusCode: number }>((resolve, reject) => {
    const req = http.request(options, res => {
      resolve({ statusCode: res.statusCode! });
    });
    req.on('error', reject);
    req.end();
  });

  expect(res.statusCode).toBe(200);
});
