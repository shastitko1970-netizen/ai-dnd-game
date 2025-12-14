// AI DM Service на OpenAI GPT-4 с поддержкой proxy и быстрого fallback

import OpenAI from 'openai';
import { HttpsProxyAgent } from 'https-proxy-agent';
import type { Character, World } from '../types/index.js';

let client: OpenAI | null = null;
let openAIEnabled = true; // Флаг доступности OpenAI

/**
 * Инициализировать OpenAI клиент (опционально)
 * Поддерживает OPENAI_PROXY для обхода блокировок
 */
function initializeClient(): void {
  if (client) return;
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY не установлена. AI DM будет недоступен.');
    openAIEnabled = false;
    return;
  }
  
  const options: any = {
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 10000, // 10 секунд таймаут
  };
  
  // Если задан OPENAI_PROXY, используем его
  if (process.env.OPENAI_PROXY) {
    console.log('🔗 Используется прокси:', process.env.OPENAI_PROXY.replace(/@.*:/, '@***:'));
    try {
      const httpsAgent = new HttpsProxyAgent(process.env.OPENAI_PROXY);
      options.httpAgent = httpsAgent;
      options.httpsAgent = httpsAgent;
    } catch (e: any) {
      console.error('⚠️  Ошибка при конфигурации прокси:', e.message);
      openAIEnabled = false;
    }
  }
  
  client = new OpenAI(options);
  console.log('✅ OpenAI client инициализирован');
}

export class AIService {
  /**
   * Генерируем начальный нарратив для новой игры
   */
  static async generateInitialNarrative(
    character: Character,
    world: World
  ): Promise<string> {
    // Fallback нарратив на случай недоступности AI
    const fallbackNarrative = `Вы просыпаетесь в ${world.name}. ${character.name}, ${character.race} ${character.class}, чувствует тяжесть предстоящих испытаний. Тёмный лес окружает вас, а впереди слышны странные звуки...`;
    
    if (!openAIEnabled) {
      console.log('⚠️  OpenAI недоступен, используется fallback нарратив');
      return fallbackNarrative;
    }
    
    if (!client) initializeClient();
    if (!client || !openAIEnabled) return fallbackNarrative;

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
            content: 'Ты - D&D 5e Мастер Подземелья. Генерируешь вызывающие сцены для игроков. Ответ короткий, активный, интригующий.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 200,
      });

      return response.choices[0].message.content || fallbackNarrative;
    } catch (error: any) {
      console.error('❌ OpenAI API ошибка при генерации нарратива:', error.message);
      
      // Если ошибка сети - отключаем OpenAI
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.message?.includes('Connection')) {
        console.warn('⚠️  OpenAI недоступен, отключаю для этой сессии');
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
    const fallbackResponse = `Ваше действие "${action}" имеет неожиданный результат. Окружающий мир меняется, и перед вами открывается новый путь. Что вы делаете дальше?`;
    
    if (!openAIEnabled) {
      console.log('⚠️  OpenAI недоступен, используется fallback ответ');
      return fallbackResponse;
    }
    
    if (!client) initializeClient();
    if (!client || !openAIEnabled) return fallbackResponse;

    const prompt = `Игровой контекст:
${previousNarrative}

Герой ${character.name} совершает действие: ${action}

На основании D&D 5e механики, напиши вызывающий результат действия. Не более 2 предложений.`;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Ты - D&D 5e Мастер Подземелья. Генерируешь динамичные ответы на действия. Короткие тексты, увлекательные сцены.'
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
      console.error('❌ OpenAI API ошибка при обработке действия:', error.message);
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.message?.includes('Connection')) {
        openAIEnabled = false;
      }
      
      return fallbackResponse;
    }
  }

  /**
   * Генерируем варианты действий для игрока
   */
  static async generateNextActions(
    narrative: string,
    previousActions: string[] = []
  ): Promise<string[]> {
    const fallbackActions = ['Атаковать', 'Осмотреть окрестности', 'Поговорить', 'Отступить'];
    
    if (!openAIEnabled) {
      console.log('⚠️  OpenAI недоступен, используются fallback действия');
      return fallbackActions;
    }
    
    if (!client) initializeClient();
    if (!client || !openAIEnabled) return fallbackActions;

    const prompt = `На основании этого нарратива:
${narrative}

Предыдущие действия: ${previousActions.join(', ')}

Генерируй 3-4 новых опции действия для D&D игрока.
Ответ ТОЛЬКО JSON array с строками, без каких-либо других символов.
Пример: ["Атаковать", "Поговорить", "Осмотреть"]`;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Ты - D&D 5e Мастер Подземелья. Отвечай ТОЛЬКО JSON массивом, ничего больше. Без markdown, без кода.'
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
      console.error('❌ AI ошибка генерации действий:', error.message);
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.message?.includes('Connection')) {
        openAIEnabled = false;
      }
      
      return fallbackActions;
    }
  }
}

export default AIService;
