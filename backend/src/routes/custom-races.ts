import { FastifyInstance } from 'fastify';
import { CustomContentManager } from '../services/CustomContentManager.js';

export async function customRacesRoutes(fastify: FastifyInstance) {
  const manager = new CustomContentManager();

  fastify.get('/', async (request, reply) => {
    try {
      const races = await manager.getRaces();
      reply.send({ success: true, data: races });
    } catch (error: any) {
      reply.status(500).send({ success: false, error: error.message });
    }
  });

  fastify.post('/', async (request: any, reply) => {
    try {
      const race = await manager.createRace(request.body);
      reply.status(201).send({ success: true, data: race });
    } catch (error: any) {
      reply.status(400).send({ success: false, error: error.message });
    }
  });

  fastify.put('/:name', async (request: any, reply) => {
    try {
      const updated = await manager.updateRace(request.params.name, request.body);
      reply.send({ success: true, data: updated });
    } catch (error: any) {
      reply.status(400).send({ success: false, error: error.message });
    }
  });

  fastify.delete('/:name', async (request: any, reply) => {
    try {
      await manager.deleteRace(request.params.name);
      reply.send({ success: true, message: 'Race deleted' });
    } catch (error: any) {
      reply.status(400).send({ success: false, error: error.message });
    }
  });
}

export default customRacesRoutes;
