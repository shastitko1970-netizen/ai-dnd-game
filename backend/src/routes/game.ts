// routes/game.ts - D&D Game Routes с интеграцией PromptService и расширенным контекстом

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { GameManager } from '../services/GameManager.js';
import { AIService } from '../services/AIService.js';
import PromptService, { type GameContext } from '../services/PromptService.js';
import type { Character, World, GameSession } from '../types/index.js';

// Простое хранилище сессий в памяти (для production использовать БД)
const activeSessions = new Map<string, GameSession>();

export async function gameRoutes(server: FastifyInstance) {
  /**
   * POST /game/start
   * Начать новую игровую сессию
   */
  server.post<{ Body: { character: Character; world: World; language?: 'ru' | 'en' } }>(
    '/start',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { character, world, language = 'ru' } = request.body;

        // Инициализируем контекст игры
        const gameContext: GameContext = {
          narrativeHistory: '',
          lastAction: language === 'ru' ? 'Начало приключения' : 'Adventure begins',
          emotionalState: language === 'ru' ? 'Ожидание и нервозность' : 'Anticipation and nerves',
          sessionDuration: 0,
          npcRelations: {},
        };

        // Генерируем начальный нарратив через улучшенный промпт
        const initialNarrative = await AIService.generateInitialNarrative(
          character,
          world,
          gameContext,
          language
        );

        // Создаём сессию
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const session: GameSession = {
          id: sessionId,
          character: {
            ...character,
            alignment: character.alignment || 'Neutral',
            traits: character.traits || [],
            emotionalState: gameContext.emotionalState,
            npcRelations: {},
          },
          world,
          narrative: initialNarrative,
          narrativeHistory: initialNarrative,
          lastAction: gameContext.lastAction,
          emotionalState: gameContext.emotionalState,
          npcRelations: {},
          actions: [],
          worldChanges: [],
          startTime: new Date(),
          turn: 0,
          combatActive: false,
          combatState: null,
          sessionDuration: 0,
        };

        // Сохраняем сессию
        activeSessions.set(sessionId, session);

        console.log(`✅ Новая сессия создана: ${sessionId}`);

        return reply.send({
          success: true,
          data: {
            sessionId,
            character: session.character,
            world: session.world,
            narrative: initialNarrative,
            language,
          },
        });
      } catch (error) {
        console.error('❌ Game start ошибка:', error);
        return reply.status(500).send({
          success: false,
          error: 'Ошибка начала игры',
        });
      }
    }
  );

  /**
   * POST /game/action
   * Обработать действие игрока
   */
  server.post<{ Body: { sessionId: string; action: string; language?: 'ru' | 'en' } }>(
    '/action',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { sessionId, action, language = 'ru' } = request.body;

        // Получаем активную сессию
        const session = activeSessions.get(sessionId);
        if (!session) {
          return reply.status(404).send({
            success: false,
            error: 'Сессия не найдена',
          });
        }

        // Обновляем контекст игры
        const gameContext: GameContext = {
          narrativeHistory: session.narrativeHistory,
          lastAction: action,
          emotionalState: session.emotionalState,
          npcRelations: session.npcRelations,
          sessionDuration: Math.floor((Date.now() - session.startTime.getTime()) / 60000),
        };

        // Генерируем ответ AI GM
        const response = await AIService.generateActionResponse(
          action,
          session.character,
          session.world,
          gameContext,
          language
        );

        // Генерируем следующие возможные действия
        const nextActions = await AIService.generateNextActions(
          session.character,
          session.world,
          gameContext,
          language
        );

        // Обновляем историю
        session.narrativeHistory += `\n\n[${session.character.name}]: ${action}\n[GM]: ${response}`;
        session.lastAction = action;
        session.turn++;

        // Сохраняем обновлённую сессию
        activeSessions.set(sessionId, session);

        console.log(`✅ Действие обработано в сессии ${sessionId}`);

        return reply.send({
          success: true,
          data: {
            sessionId,
            narrative: response,
            nextActions,
            turn: session.turn,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('❌ Game action ошибка:', error);
        return reply.status(500).send({
          success: false,
          error: 'Ошибка обработки действия',
        });
      }
    }
  );

  /**
   * GET /game/session/:id
   * Получить информацию о сессии
   */
  server.get<{ Params: { id: string } }>('/session/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const session = activeSessions.get(id);

      if (!session) {
        return reply.status(404).send({
          success: false,
          error: 'Сессия не найдена',
        });
      }

      return reply.send({
        success: true,
        data: {
          id: session.id,
          character: session.character,
          world: session.world,
          turn: session.turn,
          narrativeHistory: session.narrativeHistory,
          npcRelations: session.npcRelations,
          worldChanges: session.worldChanges,
        },
      });
    } catch (error) {
      console.error('❌ Get session ошибка:', error);
      return reply.status(500).send({
        success: false,
        error: 'Ошибка получения сессии',
      });
    }
  });

  /**
   * DELETE /game/session/:id
   * Завершить сессию
   */
  server.delete<{ Params: { id: string } }>(
    '/session/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };
        const deleted = activeSessions.delete(id);

        if (!deleted) {
          return reply.status(404).send({
            success: false,
            error: 'Сессия не найдена',
          });
        }

        console.log(`✅ Сессия завершена: ${id}`);

        return reply.send({
          success: true,
          message: 'Сессия завершена',
        });
      } catch (error) {
        console.error('❌ Delete session ошибка:', error);
        return reply.status(500).send({
          success: false,
          error: 'Ошибка завершения сессии',
        });
      }
    }
  );
}
