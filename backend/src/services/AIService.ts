// Сервис аи Мастера Подземелья на OpenAI

import OpenAI from 'openai';
import type { Character, World } from '../types/index.js';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIService {
  /**
   * Начинаем анарратив для нового игрока
   */
  static async generateInitialNarrative(
    character: Character,
    world: World
  ): Promise<string> {
    const prompt = `Нты - AI Мастер Подземелья D&D 5e. 
    
Постави игрока в интересную ситуацию.
    
Герой: ${character.name}, ${character.race} ${character.class}
Мир: ${world.name}
Описание мира: ${world.description}

Напиши загадочные, вызывающие акцию сцены не более 2 предложений.`;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'Ты - D&D 5e Мастер Подземелья. Генерируешь вызывающие сцены для игроков. Ответ короткий, активный в части D&D.',
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 200,
      });

      return response.choices[0].message.content || 'Вы выживаете в мраке...';
    } catch (error) {
      console.error('OpenAI API ошибка:', error);
      throw error;
    }
  }

  /**
   * Отвечаем на действие игрока
   */
  static async generateActionResponse(
    action: string,
    previousNarrative: string,
    character: Character,
    world: World
  ): Promise<string> {
    const prompt = `
Гравый контекст:
${previousNarrative}

Герой ${character.name} отвечают действием: ${action}

На основании D&D 5e механики (DC 12 для броска), напиши вызывающий результат действия. 
Не более 2 предложений. Подготовь интересные развития`;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'Ты - D&D 5e Мастер Подземелья. Генерируешь динамичные ответы на действия. Короткие тексты, увлекательные сцены.',
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.85,
        max_tokens: 250,
      });

      return response.choices[0].message.content || 'Непрогнозируемая черэа в МОШ.—';
    } catch (error) {
      console.error('OpenAI API ошибка:', error);
      throw error;
    }
  }

  /**
   * Генерируем динамические возможные действия
   */
  static async generateNextActions(
    narrative: string,
    previousActions: string[]
  ): Promise<string[]> {
    const prompt = `
На основании этого нарратива:
${narrative}

Предыдущие действия: ${previousActions.join(', ')}

Генерирует 3-4 ндовых опций действия для D&D игрока. 
Ответ в формате JSON array с строками, только array, никаких не шов.
Пример: ["Атаковать", "Поговорить", "Осмотреть"]`;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'Ты - D&D 5e Мастер Подземелья. Отвечай только JSON аррея ничего больше.',
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 150,
      });

      const content = response.choices[0].message.content || '[]';
      const cleanContent = content.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanContent);
    } catch (error) {
      console.error('AI ошибка генерации действий:', error);
      return ['Атаковать', 'Осмотреть', 'Поговорить'];
    }
  }
}
