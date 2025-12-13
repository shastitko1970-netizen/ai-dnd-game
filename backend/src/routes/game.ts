import { FastifyInstance } from 'fastify';
import { GameManager } from '../services/GameManager.js';
import { RulesEngine } from '../services/RulesEngine.js';
import { CustomContentManager } from '../services/CustomContentManager.js';

const gameManagers = new Map<string, GameManager>();

export async function gameRoutes(fastify: FastifyInstance) {
  const customContentManager = new CustomContentManager();

  fastify.post('/start', async (request: any, reply) => {
    try {
      const { character, world } = request.body;
      const sessionId = `session-${Date.now()}`;

      const customContent = await customContentManager.loadCustomContent();
      const rulesEngine = new RulesEngine(customContent);
      const gameManager = new GameManager(rulesEngine);

      const session = gameManager.createSession(sessionId, character, world);
      gameManagers.set(sessionId, gameManager);

      reply.status(201).send({ success: true, data: { sessionId, session } });
    } catch (error: any) {
      reply.status(400).send({ success: false, error: error.message });
    }
  });

  fastify.post('/action', async (request: any, reply) => {
    try {
      const { sessionId, action } = request.body;
      const gameManager = gameManagers.get(sessionId);

      if (!gameManager) {
        return reply.status(404).send({ success: false, error: 'Session not found' });
      }

      const result = await gameManager.processAction(sessionId, action);
      const session = gameManager.getSession(sessionId);

      reply.send({
        success: true,
        data: {
          actionResult: result,
          narrative: session?.narrative,
          session
        }
      });
    } catch (error: any) {
      reply.status(500).send({ success: false, error: error.message });
    }
  });

  fastify.get('/session/:sessionId', async (request: any, reply) => {
    try {
      const gameManager = gameManagers.get(request.params.sessionId);

      if (!gameManager) {
        return reply.status(404).send({ success: false, error: 'Session not found' });
      }

      const session = gameManager.getSession(request.params.sessionId);
      reply.send({ success: true, data: { session } });
    } catch (error: any) {
      reply.status(500).send({ success: false, error: error.message });
    }
  });
}

export default gameRoutes;
