// AI DM Service на Claude (Anthropic) с быстрым fallback

import dotenv from 'dotenv';
import { Anthropic } from '@anthropic-ai/sdk';
import type { Character, World } from '../types/index.js';

// Загружаем .env в этом модуле
dotenv.config();

let client: Anthropic | null = null;
let aiEnabled = false;

/**
 * Инициализировать Claude клиент
 */
function initializeClient(): void {
  if (client) return;
  
  // Проверяем API ключ
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
    console.log('✅ Claude AI инициализирован, API ключ:', apiKey.substring(0, 20) + '...');
  } catch (e: any) {
    console.error('❌ Ошибка инициализации Claude:', e.message);
    aiEnabled = false;
  }
}

// Пытаемся инициализировать при загружении модуля
initializeClient();

export class AIService {
  /**
   * Генерируем начальный нарратив для новой игры
   */
  static async generateInitialNarrative(
    character: Character,
    world: World
  ): Promise<string> {
    // Fallback нарратив
    const fallbackNarrative = `Вы просыпаетесь в ${world.name}. ${character.name}, ${character.race} ${character.class}, чувствует тяжесть предстоящих испытаний. Тёмный лес окружает вас, а впереди слышны странные звуки...`;
    
    if (!aiEnabled || !client) {
      console.log('⚠️  Claude недоступен, используется fallback нарратив');
      return fallbackNarrative;
    }

    const systemPrompt = `Ты - великолепный D&D 5e Мастер Подземелья.
Кратко: не более 2 предложений.
Интригующе: затягивай в приключение.
На русском.`;

    const userPrompt = `НОВАЯ ИГРА:
Мир: ${world.name} - ${world.description}
Герой: ${character.name}, ${character.race} ${character.class}

Напиши загадочную начальную сцену для ${character.name}.`;

    try {
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        system: systemPrompt,
      });

      const result = response.content[0].type === 'text' ? response.content[0].text : fallbackNarrative;
      console.log('✅ Claude нарратив генерирован');
      return result;
    } catch (error: any) {
      console.error('❌ Claude ошибка:', error.message);
      
      // Отключаем на сетевых ошибках
      if (error.message?.includes('Connection') || error.message?.includes('timeout')) {
        aiEnabled = false;
      }
      
      return fallbackNarrative;
    }
  }

  /**
   * Генерируем ответ на действие игрока
   */
  static async generateActionResponse(
    action: string,
    previousNarrative: string,
    character: Character,
    world: World
  ): Promise<string> {
    const fallbackResponse = `Ваше действие "${action}" имеет неожиданные последствия. Мир меняется, и перед вами открываются новые возможности...`;
    
    if (!aiEnabled || !client) {
      return fallbackResponse;
    }

    const systemPrompt = `Ты - D&D 5e Мастер. Не более 2 предложений. На русском.`;

    const userPrompt = `Контекст: ${previousNarrative}

${character.name} делает: ${action}

Опиши результат этого действия.`;

    try {
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
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
      console.error('❌ Claude ошибка:', error.message);
      if (error.message?.includes('Connection') || error.message?.includes('timeout')) {
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

    const systemPrompt = `Ответь ТОЛЬКО JSON массивом. Ничего больше. Никакого маркдауна или объяснений.`;

    const userPrompt = `["Атаковать", "Осмотреть", "Поговорить", "Отступить"] - вот формат. Подскажи 3 действия для ${narrative.substring(0, 30)}...`;

    try {
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
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
      console.error('❌ Claude ошибка:', error.message);
      if (error.message?.includes('Connection') || error.message?.includes('timeout')) {
        aiEnabled = false;
      }
      return fallbackActions;
    }
  }
}

export default AIService;
