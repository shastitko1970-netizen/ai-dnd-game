// AI DM Service на Claude Haiku (самая дешёвая модель) с fallback

import dotenv from 'dotenv';
import { Anthropic } from '@anthropic-ai/sdk';
import type { Character, World } from '../types/index.js';

// Загружаем .env
dotenv.config();

let client: Anthropic | null = null;
let aiEnabled = false;

const MODEL = 'claude-3-5-haiku-20241022'; // Правильное имя модели!

/**
 * Инициализировать Claude клиент
 */
function initializeClient(): void {
  if (client) return;
  
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey || apiKey.trim().length === 0) {
    console.warn('⚠️  ANTHROPIC_API_KEY не установлена. AI DM будет использовать fallback.');
    aiEnabled = false;
    return;
  }
  
  try {
    client = new Anthropic({
      apiKey: apiKey,
      timeout: 15000,
    });
    
    aiEnabled = true;
    console.log(`✅ Claude Haiku AI инициализирован (${MODEL})`);
    console.log('💰 Цена: самая дешёвая ($0.80/M input, $4/M output)');
  } catch (e: any) {
    console.error('❌ Ошибка инициализации:', e.message);
    aiEnabled = false;
  }
}

// Пытаемся инициализировать
initializeClient();

export class AIService {
  /**
   * Генерируем начальный нарратив
   */
  static async generateInitialNarrative(
    character: Character,
    world: World
  ): Promise<string> {
    const fallbackNarrative = `Вы просыпаетесь в ${world.name}. ${character.name}, ${character.race} ${character.class}, слышит странные звуки и чувствует опасность...`;
    
    if (!aiEnabled || !client) {
      return fallbackNarrative;
    }

    const systemPrompt = `Ты - D&D 5e Мастер Подземелья. Нарратив краткие (макс 2 предложения), вызывающие, на русском.`;

    const userPrompt = `НОВАЯ ИГРА.
Мир: ${world.name}
Герой: ${character.name}, ${character.race} ${character.class}

Напиши загадочную сцену.`;

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        system: systemPrompt,
      });

      const result = response.content[0].type === 'text' ? response.content[0].text : fallbackNarrative;
      console.log('✅ AI генерация нарратива успешна');
      return result;
    } catch (error: any) {
      console.error('❌ AI ошибка:', error.message);
      if (error.message?.includes('Connection') || error.message?.includes('timeout')) {
        aiEnabled = false;
      }
      return fallbackNarrative;
    }
  }

  /**
   * Генерируем ответ на действие
   */
  static async generateActionResponse(
    action: string,
    previousNarrative: string,
    character: Character,
    world: World
  ): Promise<string> {
    const fallbackResponse = `${character.name} наносит ${action}. Нечто меняется в мире...`;
    
    if (!aiEnabled || !client) {
      return fallbackResponse;
    }

    const systemPrompt = `Краткие респонсы. D&D 5e. На русском.`;

    const userPrompt = `${character.name} делает: ${action}

Контекст: ${previousNarrative.substring(0, 100)}

Напиши результат (макс 2 предложения).`;

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        system: systemPrompt,
      });

      return response.content[0].type === 'text' ? response.content[0].text : fallbackResponse;
    } catch (error: any) {
      console.error('❌ AI ошибка:', error.message);
      if (error.message?.includes('Connection')) {
        aiEnabled = false;
      }
      return fallbackResponse;
    }
  }

  /**
   * Генерируем варианты действий
   */
  static async generateNextActions(
    narrative: string,
    previousActions: string[] = []
  ): Promise<string[]> {
    const fallbackActions = ['Атаковать', 'Осмотреть', 'Поговорить', 'Отступить'];
    
    if (!aiEnabled || !client) {
      return fallbackActions;
    }

    const systemPrompt = `Ответь ONLY JSON: ["действие"]. Без маркдауна.`;

    const userPrompt = `3 действия JSON: ["Атаковать", "Осмотреть", "Поговорить"]`;

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        system: systemPrompt,
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '[]';
      const cleanContent = content.replace(/```json|```|`/g, '').trim();
      
      try {
        const parsed = JSON.parse(cleanContent);
        return Array.isArray(parsed) ? parsed : fallbackActions;
      } catch {
        return fallbackActions;
      }
    } catch (error: any) {
      console.error('❌ AI ошибка:', error.message);
      return fallbackActions;
    }
  }
}

export default AIService;
