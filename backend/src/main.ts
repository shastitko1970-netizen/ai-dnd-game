import Fastify from 'fastify';
import cors from '@fastify/cors';
import gameRoutes from './routes/game.js';
import rulesRoutes from './routes/rules.js';
import characterRoutes from './routes/character.js';
import customRacesRoutes from './routes/custom-races.js';
import customClassesRoutes from './routes/custom-classes.js';
import customFeatsRoutes from './routes/custom-feats.js';

const PORT = parseInt(process.env.PORT || '3001');
const NODE_ENV = process.env.NODE_ENV || 'development';

const fastify = Fastify({
  logger: NODE_ENV === 'development'
});

// Register plugins
await fastify.register(cors, {
  origin: '*',
  credentials: true
});

// Register routes
await fastify.register(gameRoutes, { prefix: '/api/game' });
await fastify.register(rulesRoutes, { prefix: '/api/rules' });
await fastify.register(characterRoutes, { prefix: '/api/character' });
await fastify.register(customRacesRoutes, { prefix: '/api/custom-races' });
await fastify.register(customClassesRoutes, { prefix: '/api/custom-classes' });
await fastify.register(customFeatsRoutes, { prefix: '/api/custom-feats' });

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  const statusCode = error.statusCode || 500;
  reply.status(statusCode).send({
    success: false,
    error: error.message || 'Internal server error',
    code: statusCode
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`\n✅ Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API: http://localhost:${PORT}/api\n`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
