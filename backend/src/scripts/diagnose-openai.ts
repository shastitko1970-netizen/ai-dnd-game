/**
 * Диагностика OpenAI подключения с аутентификацией прокси
 * npx tsx src/scripts/diagnose-openai.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import HttpsProxyAgent from 'https-proxy-agent';

// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '..', '.env');

console.log('🔍 Loading .env from:', envPath);
dotenv.config({ path: envPath });

const apiKey = process.env.OPENAI_API_KEY;
const proxyUrl = process.env.OPENAI_PROXY;

console.log('\n🔍 OpenAI Диагностика');
console.log('═'.repeat(50));

if (!apiKey) {
  console.error('❌ OPENAI_API_KEY не установлена в .env');
  console.error('   Проверь backend/.env файл');
  process.exit(1);
}

console.log('✅ API ключ найден:', apiKey.substring(0, 20) + '...');

if (proxyUrl) {
  console.log('🔗 Прокси задан:', proxyUrl);
} else {
  console.log('⚠️  OPENAI_PROXY не задан в .env');
}

const options: any = {
  apiKey: apiKey,
};

// Если есть прокси, используем его
// Формат: http://username:password@host:port
// Или: https://username:password@host:port
if (proxyUrl) {
  console.log('\n🔐 Конфигурирую прокси...');
  
  try {
    const httpsAgent = new HttpsProxyAgent(proxyUrl);
    options.httpAgent = httpsAgent;
    options.httpsAgent = httpsAgent;
    console.log('✅ Прокси конфигурирован');
  } catch (e: any) {
    console.error('❌ Ошибка при конфигурации прокси:', e.message);
  }
}

const client = new OpenAI(options);

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

    console.log('\n✅ Подключение успешно!');
    console.log('📝 Ответ:', response.choices[0].message.content);
    console.log('🤖 Используемая модель:', response.model);
    console.log('\n✨ OpenAI готов к работе!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Ошибка подключения к OpenAI:');
    console.error('   Код ошибки:', error.code || 'unknown');
    console.error('   Статус:', error.status || 'unknown');
    console.error('   Сообщение:', error.message);
    
    if (error.code === 'ERR_TLS_CERT_ALTNAME_INVALID' || error.code === 'CERT_HAS_EXPIRED') {
      console.error('\n⚠️  Проблема с SSL сертификатом прокси.');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('\n⚠️  Не могу подключиться к прокси. Проверь:');
      console.error('   - IP/port прокси');
      console.error('   - Логин/пароль');
      console.error('   - Ваш ост и порт');
    } else if (error.status === 429) {
      console.error('\n⚠️  Ограничение по частоте. Попробуй позже.');
    } else if (error.status === 401) {
      console.error('\n⚠️  Неправильный API ключ.');
    } else if (error.status === 403) {
      console.error('\n⚠️  Доступ запрещён.');
    }
    
    process.exit(1);
  }
})();
