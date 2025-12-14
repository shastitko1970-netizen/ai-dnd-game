/**
 * Диагностика OpenAI подключения
 * npx tsx src/scripts/diagnose-openai.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '..', '.env');

console.log('🔍 Loading .env from:', envPath);
dotenv.config({ path: envPath });

const apiKey = process.env.OPENAI_API_KEY;

console.log('\n🔍 OpenAI Диагностика');
console.log('═'.repeat(50));

if (!apiKey) {
  console.error('❌ OPENAI_API_KEY не установлена в .env');
  console.error('   Проверь backend/.env файл');
  process.exit(1);
}

console.log('✅ API ключ найден:', apiKey.substring(0, 20) + '...');

const client = new OpenAI({ apiKey });

(async () => {
  try {
    console.log('\n💡 Проверка подключения к OpenAI API...');
    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Ты помощник. Ответь одним словом.'
        },
        {
          role: 'user',
          content: 'Привет'
        }
      ],
      temperature: 0.7,
      max_tokens: 10,
    });

    console.log('✅ Подключение успешно!');
    console.log('📝 Ответ:', response.choices[0].message.content);
    console.log('🤖 Используемая модель:', response.model);
    console.log('\n✨ OpenAI готов к работе!');
  } catch (error: any) {
    console.error('\n❌ Ошибка подключения к OpenAI:');
    console.error('   Код ошибки:', error.code);
    console.error('   Статус:', error.status);
    console.error('   Сообщение:', error.message);
    
    if (error.status === 429) {
      console.error('\n⚠️  Ограничение по частоте запросов. Попробуй позже.');
    } else if (error.status === 401) {
      console.error('\n⚠️  Неправильный API ключ или срок действия истёк.');
    } else if (error.status === 403) {
      console.error('\n⚠️  Доступ запрещён. Возможно, блокировка геолокации.');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('\n⚠️  Ошибка сети. Проверь VPN или интернет-соединение.');
    }
    
    process.exit(1);
  }
})();
