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
      ? `НАЧИНИ НОВОЕ ПРИКЛЮЧЕНИЕ. Первое ощущение ${character.name} в ${world.name}.`
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

      console.log('📊 Анализ действия: OK');
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
   */
  static async generateNextActions(
    character: Character,
    world: World,
    context: GameContext,
    language: 'ru' | 'en' = 'ru'
  ): Promise<string[]> {
    const fallbackActionsRU = ['Атаковать', 'Осмотреть', 'Поговорить', 'Отступить'];
    const fallbackActionsEN = ['Attack', 'Examine', 'Talk', 'Retreat'];
    const fallbackActions = language === 'ru' ? fallbackActionsRU : fallbackActionsEN;

    if (!aiEnabled || !client) {
      return fallbackActions;
    }

    const systemPrompt = PromptService.getSystemPrompt(character, world, context, language);
    const userPrompt = language === 'ru'
      ? `Брось 3 коротких актиона JSON: ["действиеРусские", ...]`
      : `Generate 3 short action options in JSON: ["action1", "action2", "action3"]`;

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
      const cleanContent = content
        .replace(/```json|```|`/g, '')
        .replace(/[^\[\]"\w\u0410-\u044f\s,]/g, '')
        .trim();

      try {
        const parsed = JSON.parse(cleanContent);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 4).map(a => String(a));
        }
      } catch (parseError) {
        console.warn('⚠️  Не смог парсить JSON действий');
      }

      return fallbackActions;
    } catch (error: any) {
      console.error('❌ AI ошибка:', error.message);
      return fallbackActions;
    }
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
          return /[\u0430-\u044f\u0410-\u042f\u0401\u0451\s.,!?;:\-—«»()0-9]/u.test(m) ? m : '';
        });
    } else {
      cleaned = cleaned
        .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, (m) => {
          return /[a-zA-Z0-9\s.,!?;:\-—"'()]/u.test(m) ? m : '';
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
