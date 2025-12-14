// AIService.ts - Claude Haiku controller with proxy support and fallback

import dotenv from 'dotenv';
import { Anthropic } from '@anthropic-ai/sdk';
import PromptService, { type GameContext } from './PromptService.js';
import type { Character, World } from '../types/index.js';
import https from 'https';
import http from 'http';

dotenv.config();

let client: Anthropic | null = null;
let aiEnabled = false;

const MODEL = 'claude-3-5-haiku-20241022';
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Initialize Claude client with optional proxy support
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
    const clientConfig: any = {
      apiKey: apiKey,
      timeout: REQUEST_TIMEOUT,
    };

    // Add proxy support if configured
    const proxyUrl = process.env.PROXY_URL || process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
    
    if (proxyUrl) {
      console.log(`🔐 Proxy configured: ${proxyUrl.replace(/:[^/]*@/, ':***@')}`);
      
      try {
        const proxyAgent = proxyUrl.startsWith('http://')
          ? new http.Agent({ timeout: REQUEST_TIMEOUT })
          : new https.Agent({ timeout: REQUEST_TIMEOUT });
        
        // For fetch-based clients
        clientConfig.httpAgent = proxyAgent;
        clientConfig.httpsAgent = proxyAgent;
      } catch (proxyErr) {
        console.warn('⚠️  Could not setup proxy agent:', proxyErr);
      }
    }

    client = new Anthropic(clientConfig);

    aiEnabled = true;
    console.log(`✅ Claude Haiku AI инициализирован (${MODEL})`);
    console.log('💰 Цена: самая дешёвая ($0.80/M input, $4/M output)');
    if (proxyUrl) {
      console.log('🔐 Using proxy for API requests');
    }
  } catch (e: any) {
    console.error('❌ Ошибка инициализации:', e.message);
    aiEnabled = false;
  }
}

initializeClient();

export class AIService {
  /**
   * Generate initial narrative for new game
   */
  static async generateInitialNarrative(
    character: Character,
    world: World,
    context: GameContext = {
      narrativeHistory: '',
      lastAction: 'Герой пришол в мир',
      emotionalState: 'Ожидание и Нервозность',
      sessionDuration: 0,
    },
    language: 'ru' | 'en' = 'ru'
  ): Promise<string> {
    const fallbackNarrative = language === 'ru'
      ? `Вы просыпаетесь в ${world.name}. ${character.name}, ${character.race} ${character.class}, слышит странные звуки и чувствует опасность в воздухе.`
      : `You awaken in ${world.name}. As ${character.name}, a ${character.race} ${character.class}, you sense something strange in the air.`;

    if (!aiEnabled || !client) {
      console.log('⚠️  Claude недоступен, используется fallback');
      return fallbackNarrative;
    }

    const systemPrompt = PromptService.getSystemPrompt(character, world, context, language);
    const userPrompt = language === 'ru'
      ? `НАЧНИ НОВОЕ ПРИКЛЮЧЕНИЕ. Первое ощущение ${character.name} в ${world.name}.`
      : `START A NEW ADVENTURE. First moment ${character.name} awakens in ${world.name}.`;

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const rawText = response.content[0]?.type === 'text' ? response.content[0].text : fallbackNarrative;
      const cleaned = this.sanitizeOutput(rawText, language);

      console.log('✅ AI генерация нарратива успешна');
      return cleaned;
    } catch (error: any) {
      console.error('❌ AI ошибка:', error.message);
      if (error.message?.includes('Connection') || error.message?.includes('timeout')) {
        console.warn('⚠️  Connection failed. Using fallback narrative.');
      }
      return fallbackNarrative;
    }
  }

  /**
   * Analyze player intent (for ActionOrchestrator)
   */
  static async analyzeAction(systemPrompt: string, userPrompt: string): Promise<string> {
    const fallback = '{"type": "freeform", "requiresRoll": false, "reasoning": "Could not analyze"}';

    if (!aiEnabled || !client) {
      return fallback;
    }

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 200,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const rawText = response.content[0]?.type === 'text' ? response.content[0].text : fallback;
      const cleaned = rawText
        .replace(/```json|```|`/g, '')
        .trim();

      console.log('🔍 Анализ действия: OK');
      return cleaned;
    } catch (error: any) {
      console.error('❌ Ошибка анализа:', error.message);
      return fallback;
    }
  }

  /**
   * Generate response to player action
   */
  static async generateActionResponse(
    action: string,
    character: Character,
    world: World,
    context: GameContext,
    language: 'ru' | 'en' = 'ru'
  ): Promise<string> {
    const fallbackResponse = language === 'ru'
      ? `${character.name} делает ${action}. Происходит нечто неожиданное...`
      : `${character.name} does ${action}. Something unexpected happens...`;

    if (!aiEnabled || !client) {
      return fallbackResponse;
    }

    const systemPrompt = PromptService.getSystemPrompt(character, world, context, language);
    const userPrompt = language === 'ru'
      ? `${character.name} делает: ${action}\n\nОпиши что происходит (макс 3 предложения).`
      : `${character.name} does: ${action}\n\nDescribe what happens next (max 3 sentences).`;

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const rawText = response.content[0]?.type === 'text' ? response.content[0].text : fallbackResponse;
      return this.sanitizeOutput(rawText, language);
    } catch (error: any) {
      console.error('❌ AI ошибка:', error.message);
      return fallbackResponse;
    }
  }

  /**
   * Generate next action options for player
   * IMPROVED: Better JSON parsing, ensures array is always returned
   */
  static async generateNextActions(
    character: Character,
    world: World,
    context: GameContext,
    language: 'ru' | 'en' = 'ru'
  ): Promise<string[]> {
    const fallbackActionsRU = ['Приближиться', 'Осмотреть ближе', 'Послушать звуки', 'Реагировать'];
    const fallbackActionsEN = ['Approach', 'Look closer', 'Listen', 'React'];
    const fallbackActions = language === 'ru' ? fallbackActionsRU : fallbackActionsEN;

    if (!aiEnabled || !client) {
      console.log('🔐 AI не доступна, использую фалбек');
      return fallbackActions;
    }

    const systemPrompt = language === 'ru'
      ? `Генератор действий для D&D. Верни ТОЛЬКО JSON аррей с 3-4 действиями:
["действие_1", "действие_2", "действие_3"]

Действия:
- Короткие (2-5 слов)
- На русском
- Активные глаголы
- Контекстные для ситуации`
      : `Generate 3-4 short action options in JSON array format:
["action_1", "action_2", "action_3"]

Requirements:
- Short phrases (2-5 words)
- Active verbs
- Contextually relevant
- Return ONLY the JSON array, nothing else`;

    const userPrompt = language === 'ru'
      ? `${character.name} (${character.class}) в ${world.name}. Сocтояние: ${context.emotionalState || 'Ожидание'}.\n\nЧто ${character.name} может сделать дальше?`
      : `${character.name} (${character.class}) in ${world.name}. State: ${context.emotionalState || 'Waiting'}.\n\nWhat can ${character.name} do next?`;

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 150,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = response.content[0]?.type === 'text' ? response.content[0].text : '[]';
      const actions = this.parseActionsJSON(content, language);

      if (actions && actions.length > 0) {
        console.log(`✅ Получено ${actions.length} действий от AI`);
        return actions;
      }

      console.log('⚠️  Не смог парсить действия AI, от фалбека');
      return fallbackActions;
    } catch (error: any) {
      console.error('❌ Ошибка генерации действий:', error.message);
      return fallbackActions;
    }
  }

  /**
   * Parse JSON actions with multiple strategies
   */
  private static parseActionsJSON(rawText: string, language: 'ru' | 'en'): string[] | null {
    if (!rawText) return null;

    // Strategy 1: Extract array from response
    let cleanedText = rawText
      .replace(/```json|```|`/g, '')
      .trim();

    // Strategy 2: Find JSON array pattern
    const arrayMatch = cleanedText.match(/\[.*\]/s);
    if (arrayMatch) {
      try {
        const parsed = JSON.parse(arrayMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed
            .map(item => String(item).trim())
            .filter(item => item.length > 0 && item.length < 100);
        }
      } catch (e) {
        // Continue to next strategy
      }
    }

    // Strategy 3: Try parsing entire text as JSON
    try {
      const parsed = JSON.parse(cleanedText);
      if (Array.isArray(parsed)) {
        return parsed
          .map(item => String(item).trim())
          .filter(item => item.length > 0 && item.length < 100);
      }
    } catch (e) {
      // Continue
    }

    // Strategy 4: Manual extraction from quoted strings
    const quotedStrings = cleanedText.match(/["']([^"']*)["']/g) || [];
    if (quotedStrings.length > 0) {
      return quotedStrings
        .map(s => s.replace(/["']/g, '').trim())
        .filter(s => s.length > 0 && s.length < 100 && !s.startsWith('{'))
        .slice(0, 4);
    }

    return null;
  }

  /**
   * Clean AI output from artifacts
   */
  private static sanitizeOutput(text: string, language: 'ru' | 'en'): string {
    if (!text) return '';

    let cleaned = text;

    if (language === 'ru') {
      cleaned = cleaned
        .replace(/\b(I cannot|I apologize|I'm sorry|cannot assist|not possible)\b/gi, '')
        .replace(/\b(Ок, |Ок\.|OK|okay)\b/gi, '')
        .replace(/извин|скорбя|\bне могу|\bне подлю|согласно|\bне рекоменду/gi, '')
        .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, (m) => {
          return /[\u0430-\u044f\u0410-\u042f\u0401\u0451\s.,!?;:\-\u2014«»()0-9]/u.test(m) ? m : '';
        });
    } else {
      cleaned = cleaned
        .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, (m) => {
          return /[a-zA-Z0-9\s.,!?;:\-\u2014"'()]/u.test(m) ? m : '';
        });
    }

    cleaned = cleaned
      .replace(/\*\*|__|```|###|##|#(?!\w)/g, '')
      .replace(/\[\[|\]\]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return cleaned.substring(0, 5000);
  }
}

export default AIService;