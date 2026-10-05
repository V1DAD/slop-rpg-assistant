import Fastify from 'fastify';

const fastify = Fastify({
  logger: true
});

fastify.get('/healthz', async () => {
  return { status: 'ok' };
});

export default fastify;
