import Fastify from 'fastify';

export const MainServer = Fastify({
  logger: {
    enabled: true,
    transport: {
      target: 'pino-pretty',
    },
  },
});

MainServer.all('*', async (req, reply) => {
  reply.status(200).send({ status: 'Online' });
});
