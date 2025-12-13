import { FastifyInstance } from 'fastify';
import { CharacterService } from '../services/CharacterService.js';
import { RulesEngine } from '../services/RulesEngine.js';
import { CustomContentManager } from '../services/CustomContentManager.js';

export async function characterRoutes(fastify: FastifyInstance) {
  fastify.post('/create', async (request: any, reply) => {
    try {
      const customContentManager = new CustomContentManager();
      const customContent = await customContentManager.loadCustomContent();
      const rulesEngine = new RulesEngine(customContent);
      const mergedRules = rulesEngine.getMergedRules();

      const characterService = new CharacterService(rulesEngine);
      const character = characterService.createCharacter(request.body, mergedRules);

      reply.status(201).send({ success: true, data: character });
    } catch (error: any) {
      reply.status(400).send({ success: false, error: error.message });
    }
  });

  fastify.get('/:id', async (request: any, reply) => {
    reply.send({ success: true, data: {} });
  });
}

export default characterRoutes;
