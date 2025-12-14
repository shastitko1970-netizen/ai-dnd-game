// AI DM Service на OpenAI GPT-4 с быстрым fallback

import dotenv from 'dotenv';
import OpenAI from 'openai';
import type { Character, World } from '../types/index.js';

// Загружаем .env в этом модуле
// (дополнительная зарядка если main.ts ее опустил)
dotenv.config();

let client: OpenAI | null = null;
let openAIEnabled = false; // По умолчанию fallback

/**
 * Инициализировать OpenAI клиент
 */
function initializeClient(): void {
  if (client) return;
  
  // Проверяем API ключ
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey.trim().length === 0) {
    console.warn('⚠️  OPENAI_API_KEY не установлена. AI DM будет использовать fallback.');
    openAIEnabled = false;
    return;
  }
  
  try {
    client = new OpenAI({
      apiKey: apiKey,
      timeout: 15000, // 15 секунд таймаут
    });
    
    openAIEnabled = true;
    console.log('✅ OpenAI client инициализирован, API ключ:', apiKey.substring(0, 20) + '...');
  } catch (e: any) {
    console.error('❌ Ошибка инициализации OpenAI:', e.message);
    openAIEnabled = false;
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
    
    if (!openAIEnabled || !client) {
      console.log('⚠️  OpenAI недоступен, используется fallback нарратив');
      return fallbackNarrative;
    }

    const prompt = `Ты - AI Мастер Подземелья D&D 5e.
    
Поставь игрока в интересную ситуацию.
    
Герой: ${character.name}, ${character.race} ${character.class}
Мир: ${world.name}
Описание мира: ${world.description}

Напиши загадочную, вызывающую действие сцену не более 2 предложений.`;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Ты - D&D 5e Мастер Подземелья. Генерируешь вызывающие сцены. Коротко, активно, интригующе.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 200,
      });

      const result = response.choices[0].message.content || fallbackNarrative;
      console.log('✅ OpenAI нарратив генерирован');
      return result;
    } catch (error: any) {
      console.error('❌ OpenAI ошибка:', error.message);
      
      // Отключаем OpenAI на сетевых ошибках
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.message?.includes('Connection')) {
        openAIEnabled = false;
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
    const fallbackResponse = `Ваше действие "${action}" имеет неожиданный результат. Окружающий мир меняется, и перед вами открывается новый путь.`;
    
    if (!openAIEnabled || !client) {
      return fallbackResponse;
    }

    const prompt = `Игровой контекст: ${previousNarrative}\nОтветь на действие "${action}":`;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Ты - D&D 5e Мастер. Коротко, динамично.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.85,
        max_tokens: 250,
      });

      return response.choices[0].message.content || fallbackResponse;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.message?.includes('Connection')) {
        openAIEnabled = false;
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
    
    if (!openAIEnabled || !client) {
      return fallbackActions;
    }

    const prompt = `Какие действия можно сделать? JSON array ["действие", ...]`;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Ответь ONLY JSON array, ничего больше.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 150,
      });

      const content = response.choices[0].message.content || '[]';
      const cleanContent = content.replace(/```json|```|`/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      return Array.isArray(parsed) ? parsed : fallbackActions;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.message?.includes('Connection')) {
        openAIEnabled = false;
      }
      return fallbackActions;
    }
  }
}

export default AIService;
