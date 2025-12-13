import { FastifyInstance } from 'fastify';
import { CustomContentManager } from '../services/CustomContentManager.js';

export async function customFeatsRoutes(fastify: FastifyInstance) {
  const manager = new CustomContentManager();

  fastify.get('/', async (request, reply) => {
    try {
      const feats = await manager.getFeats();
      reply.send({ success: true, data: feats });
    } catch (error: any) {
      reply.status(500).send({ success: false, error: error.message });
    }
  });

  fastify.post('/', async (request: any, reply) => {
    try {
      const feat = await manager.createFeat(request.body);
      reply.status(201).send({ success: true, data: feat });
    } catch (error: any) {
      reply.status(400).send({ success: false, error: error.message });
    }
  });

  fastify.put('/:name', async (request: any, reply) => {
    try {
      const updated = await manager.updateFeat(request.params.name, request.body);
      reply.send({ success: true, data: updated });
    } catch (error: any) {
      reply.status(400).send({ success: false, error: error.message });
    }
  });

  fastify.delete('/:name', async (request: any, reply) => {
    try {
      await manager.deleteFeat(request.params.name);
      reply.send({ success: true, message: 'Feat deleted' });
    } catch (error: any) {
      reply.status(400).send({ success: false, error: error.message });
    }
  });
}

export default customFeatsRoutes;
