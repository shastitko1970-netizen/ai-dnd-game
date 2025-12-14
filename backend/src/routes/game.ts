import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { GameManager } from '../services/GameManager.js';
import { AIService } from '../services/AIService.js';

export async function gameRoutes(server: FastifyInstance) {
  // Начать граю сессию
  server.post('/game/start', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { character, world } = request.body as any;

      // Настраиваем инициальные данные
      const initialNarrative = await AIService.generateInitialNarrative(character, world);
      const sessionId = `session-${Date.now()}`;

      const session = {
        id: sessionId,
        character,
        world,
        narrative: initialNarrative,
        narrativeHistory: [initialNarrative],
        actions: [],
        startedAt: new Date().toISOString(),
      };

      return reply.send({
        success: true,
        data: session,
      });
    } catch (error) {
      console.error('Game start ошибка:', error);
      return reply.status(500).send({
        success: false,
        error: 'Ошибка начала гамы',
      });
    }
  });

  // Обработать действие
  server.post('/game/action', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { action, narrative, character, world, previousActions } = request.body as any;

      // Получаем респонс Мастера
      const response = await AIService.generateActionResponse(
        action,
        narrative,
        character,
        world
      );

      // Генерируем следующие действия
      const nextActions = await AIService.generateNextActions(response, previousActions || []);

      return reply.send({
        success: true,
        data: {
          response,
          nextActions,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Game action ошибка:', error);
      return reply.status(500).send({
        success: false,
        error: 'Ошибка состояния активности',
      });
    }
  });
}
