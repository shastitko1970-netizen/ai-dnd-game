import { FastifyInstance } from 'fastify';
import { RulesEngine } from '../services/RulesEngine.js';
import { CustomContentManager } from '../services/CustomContentManager.js';

export async function rulesRoutes(fastify: FastifyInstance) {
  const customContentManager = new CustomContentManager();

  fastify.get('/core', async (request, reply) => {
    try {
      const rulesEngine = new RulesEngine();
      const coreRules = rulesEngine.getCoreRules();
      reply.send({ success: true, data: coreRules });
    } catch (error: any) {
      reply.status(500).send({ success: false, error: error.message });
    }
  });

  fastify.get('/merged', async (request, reply) => {
    try {
      const customContent = await customContentManager.loadCustomContent();
      const rulesEngine = new RulesEngine(customContent);
      const mergedRules = rulesEngine.getMergedRules();
      reply.send({ success: true, data: mergedRules });
    } catch (error: any) {
      reply.status(500).send({ success: false, error: error.message });
    }
  });

  fastify.get('/race/:name', async (request: any, reply) => {
    try {
      const customContent = await customContentManager.loadCustomContent();
      const rulesEngine = new RulesEngine(customContent);
      const race = rulesEngine.getRace(request.params.name);
      if (!race) return reply.status(404).send({ success: false, error: 'Race not found' });
      reply.send({ success: true, data: race });
    } catch (error: any) {
      reply.status(500).send({ success: false, error: error.message });
    }
  });
}

export default rulesRoutes;
