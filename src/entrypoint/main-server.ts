import Fastify from 'fastify';
import fastifyReplyFrom from '@fastify/reply-from';

export const MainServer = Fastify({
  logger: {
    enabled: true,
    transport: {
      target: 'pino-pretty',
    },
  },
});

MainServer.register(fastifyReplyFrom);

MainServer.all('*', async (req, reply) => {
  reply.status(200).send({ status: 'Online' });
});
