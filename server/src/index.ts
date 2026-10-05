import fastify from './app';

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT ? parseInt(process.env.PORT) : 3000, host: '0.0.0.0' });
    console.log('Server listening');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
