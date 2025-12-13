import { FastifyInstance } from 'fastify';
import { CustomContentManager } from '../services/CustomContentManager.js';

export async function customClassesRoutes(fastify: FastifyInstance) {
  const manager = new CustomContentManager();

  fastify.get('/', async (request, reply) => {
    try {
      const classes = await manager.getClasses();
      reply.send({ success: true, data: classes });
    } catch (error: any) {
      reply.status(500).send({ success: false, error: error.message });
    }
  });

  fastify.post('/', async (request: any, reply) => {
    try {
      const clazz = await manager.createClass(request.body);
      reply.status(201).send({ success: true, data: clazz });
    } catch (error: any) {
      reply.status(400).send({ success: false, error: error.message });
    }
  });

  fastify.put('/:name', async (request: any, reply) => {
    try {
      const updated = await manager.updateClass(request.params.name, request.body);
      reply.send({ success: true, data: updated });
    } catch (error: any) {
      reply.status(400).send({ success: false, error: error.message });
    }
  });

  fastify.delete('/:name', async (request: any, reply) => {
    try {
      await manager.deleteClass(request.params.name);
      reply.send({ success: true, message: 'Class deleted' });
    } catch (error: any) {
      reply.status(400).send({ success: false, error: error.message });
    }
  });
}

export default customClassesRoutes;
