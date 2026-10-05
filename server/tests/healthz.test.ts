import fastify from '../src/app';
import { test, expect } from 'vitest';
import http from 'http';

const server = fastify.listen({ port: 0, host: '127.0.0.1' });

 test('GET /healthz returns 200', async () => {
   const instance = await server;
   const { port } = instance.server.address() as { port: number };
   const options = {
     hostname: '127.0.0.1',
     port,
     path: '/healthz',
     method: 'GET'
   };
   const res = await new Promise<{statusCode:number}>((resolve, reject)=>{
     const req = http.request(options, res=>{
       resolve({statusCode: res.statusCode!});
     });
     req.on('error', reject);
     req.end();
   });
   expect(res.statusCode).toBe(200);
 });
