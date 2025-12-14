// AI DM Service на OpenAI GPT-4

import OpenAI from 'openai';
import type { Character, World } from '../types/index.js';

let client: OpenAI | null = null;

/**
 * Инициализировать OpenAI клиент (опционально)
 */
function initializeClient(): void {
  if (client) return;
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY не установлена. AI DM будет недоступен.');
    return;
  }
  
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
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
    if (!client) initializeClient();
    if (!client) return 'Вы просыпаетесь в незнакомом месте. Впереди вас ждёт опасность и приключения...';

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

      return response.choices[0].message.content || 'Вы выживаете в мраке. Впереди слышны голоса...';
    } catch (error) {
      console.error('❌ OpenAI API ошибка при генерации нарратива:', error);
      return 'Вы находитесь в опасной ситуации. Что вы делаете?';
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
    if (!client) initializeClient();
    if (!client) return `Ваше действие "${action}" имеет неожиданный результат. Что дальше?`;

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

      return response.choices[0].message.content || 'Что-то неожиданное происходит...';
    } catch (error) {
      console.error('❌ OpenAI API ошибка при обработке действия:', error);
      return 'Действие выполнено. Что дальше?';
    }
  }

  /**
   * Генерируем варианты действий для игрока
   */
  static async generateNextActions(
    narrative: string,
    previousActions: string[] = []
  ): Promise<string[]> {
    if (!client) initializeClient();
    if (!client) return ['Атаковать', 'Осмотреть', 'Поговорить'];

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
      return Array.isArray(parsed) ? parsed : ['Атаковать', 'Осмотреть', 'Поговорить'];
    } catch (error) {
      console.error('❌ AI ошибка генерации действий:', error);
      return ['Атаковать', 'Осмотреть', 'Поговорить', 'Отступить'];
    }
  }
}

export default AIService;
