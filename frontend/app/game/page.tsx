'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface DiceRoll {
  roll: number;
  modifier: number;
  total: number;
  success: boolean;
  criticalHit: boolean;
  criticalMiss: boolean;
}

interface ActionIntent {
  type: 'combat' | 'skill_check' | 'dialogue' | 'exploration' | 'freeform';
  skill?: string;
  difficulty?: number;
  requiresRoll: boolean;
}

interface GameResponse {
  sessionId: string;
  narrative: string;
  diceRoll: DiceRoll | null;
  actionIntent: ActionIntent;
  nextActions: string[];
  turn: number;
}

export default function GamePage() {
  const router = useRouter();
  const [character, setCharacter] = useState<any>(null);
  const [world, setWorld] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [narrative, setNarrative] = useState('');
  const [narrativeHistory, setNarrativeHistory] = useState<string[]>([]);
  const [currentActions, setCurrentActions] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [lastDiceRoll, setLastDiceRoll] = useState<DiceRoll | null>(null);
  const [lastActionIntent, setLastActionIntent] = useState<ActionIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [turn, setTurn] = useState(0);
  const narrativeEndRef = useRef<HTMLDivElement>(null);

  // Автоскрол к новым сообщениям
  useEffect(() => {
    if (narrativeEndRef.current) {
      narrativeEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [narrative]);

  // Загружаем основные данные и запускаем игру
  useEffect(() => {
    const char = localStorage.getItem('character');
    const w = localStorage.getItem('selectedWorld');
    
    if (!char || !w) {
      router.push('/world-select');
      return;
    }

    const charData = JSON.parse(char);
    const worldData = JSON.parse(w);
    
    setCharacter(charData);
    setWorld(worldData);
    startNewGame(charData, worldData);
  }, [router]);

  // 🎬 НАЧИНАЕМ НОВУЮ ИГРУ
  const startNewGame = async (char: any, w: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          character: char, 
          world: w,
          language: 'ru' // 🆕 Отправляем язык
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.data || !data.data.sessionId) {
        throw new Error('No sessionId received from backend');
      }

      // 🆕 СОХРАНЯЕМ sessionId!
      setSessionId(data.data.sessionId);
      console.log(`✅ Session started: ${data.data.sessionId}`);
      
      setNarrative(data.data.narrative);
      setNarrativeHistory([data.data.narrative]);
      setCurrentActions(['⚔️ Атаковать', '🔍 Осмотреть', '💬 Поговорить', '✨ Исследовать']);
      setGameStarted(true);
      setTurn(0);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'unknown error';
      setError(`❌ Game start failed: ${errorMsg}`);
      console.error('Game start error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ⚔️ ОБРАБАТЫВАЕМ ДЕЙСТВИЕ ЧЕРЕЗ ActionOrchestrator
  const handleAction = async (action: string) => {
    if (isLoading || !character || !sessionId) {
      if (!sessionId) setError('❌ No active session');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`📤 Sending action to backend:`, { sessionId, action });

      // 🎯 ПРАВИЛЬНЫЙ ЗАПРОС К БЭКЕНДУ
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,      // 🆕 Обязательный sessionId
          action,         // Действие игрока
          language: 'ru'  // 🆕 Язык
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json() as { data: GameResponse };
      
      if (!data.data) {
        throw new Error('Invalid response structure from backend');
      }

      const gameData = data.data;

      // 🎲 ОБНОВЛЯЕМ СОСТОЯНИЕ С ДАННЫМИ БЭКЕНДА
      setLastDiceRoll(gameData.diceRoll);
      setLastActionIntent(gameData.actionIntent);
      setTurn(gameData.turn);

      // 📖 ФОРМИРУЕМ ИСТОРИЮ
      const playerLine = `\n\n[${character.name}]: ${action}`;
      const gmLine = `\n[🎲 GM]: ${gameData.narrative}`;
      
      // 🎲 ДОБАВЛЯЕМ ИНФОРМАЦИЮ О БРОСКЕ ЕСЛИ БЫЛ
      let diceInfo = '';
      if (gameData.diceRoll) {
        const { roll, modifier, total, success, criticalHit, criticalMiss } = gameData.diceRoll;
        const resultText = criticalHit ? '✨ КРИТ!' : criticalMiss ? '💥 ФЕЙЛ!' : success ? '✅ Успех' : '❌ Провал';
        diceInfo = `\n📊 Бросок: d20[${roll}] + ${modifier} = ${total} [${resultText}]`;
      }
      const actionTypeInfo = `\n🎯 Тип: ${gameData.actionIntent.type}${gameData.actionIntent.skill ? ` (${gameData.actionIntent.skill})` : ''}`;

      const fullNarrative = narrative + playerLine + diceInfo + actionTypeInfo + gmLine;
      setNarrative(fullNarrative);
      setNarrativeHistory(prev => [
        ...prev,
        playerLine,
        diceInfo,
        actionTypeInfo,
        gmLine
      ]);
      
      // 🎬 СЛЕДУЮЩИЕ ДЕЙСТВИЯ ИЗ БЭКЕНДА
      setCurrentActions(gameData.nextActions || ['⚔️ Атаковать', '🔍 Осмотреть', '💬 Поговорить']);
      setUserInput('');

      console.log(`✅ Action processed:`, gameData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'unknown error';
      setError(`⚠️ Action failed: ${errorMsg}`);
      console.error('Action error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ✍️ ОБРАБАТЫВАЕМ ПОЛЬЗОВАТЕЛЬСКИЙ ВВОД
  const handleCustomAction = async () => {
    if (!userInput.trim() || isLoading) return;
    await handleAction(userInput);
  };

  // 🎨 РЕНДЕР
  if (!character || !gameStarted) {
    return (
      <div className="text-center py-12 text-slate-300">
        <p>⏳ Инициализация игровой сессии...</p>
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 📖 ОСНОВНОЕ ПОВЕСТВОВАНИЕ */}
        <div className="lg:col-span-2 space-y-6">
          {/* ❌ Ошибки */}
          {error && (
            <div className="card bg-red-900 border-red-600 border">
              <p className="text-red-300 text-sm font-mono">{error}</p>
            </div>
          )}

          {/* 📖 Нарратив */}
          <div className="card h-96 flex flex-col border border-slate-600">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-teal-400">📖 Повествование</h2>
              <span className="text-xs text-slate-400">Ход: {turn}</span>
            </div>
            <div className="flex-1 overflow-y-auto text-slate-300 mb-4 p-4 bg-slate-900 rounded whitespace-pre-wrap text-sm leading-relaxed font-mono border border-slate-700">
              {narrative}
              <div ref={narrativeEndRef} />
            </div>
          </div>

          {/* 🎲 Последний бросок */}
          {lastDiceRoll && (
            <div className="card bg-gradient-to-r from-orange-900 to-red-900 border-orange-500 border">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-yellow-300">{lastDiceRoll.roll}</p>
                  <p className="text-xs text-orange-200">d20</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-300">+{lastDiceRoll.modifier}</p>
                  <p className="text-xs text-orange-200">модификатор</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-300">{lastDiceRoll.total}</p>
                  <p className="text-xs text-orange-200">итого</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-orange-700 text-center">
                <p className="text-sm font-bold text-yellow-300">
                  {lastDiceRoll.criticalHit ? '✨ КРИТИЧЕСКИЙ УСПЕХ!' : lastDiceRoll.criticalMiss ? '💥 КРИТИЧЕСКИЙ ПРОВАЛ!' : lastDiceRoll.success ? '✅ Успех' : '❌ Провал'}
                </p>
              </div>
            </div>
          )}

          {/* 🎯 Тип действия */}
          {lastActionIntent && (
            <div className="card border border-slate-600 bg-slate-800">
              <p className="text-sm text-slate-300">
                <strong>🎯 Тип действия:</strong> <span className="text-teal-300 font-mono">{lastActionIntent.type}</span>
                {lastActionIntent.skill && <span className="text-slate-400"> • Навык: <strong>{lastActionIntent.skill}</strong></span>}
                {lastActionIntent.difficulty && <span className="text-slate-400"> • DC: <strong>{lastActionIntent.difficulty}</strong></span>}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {lastActionIntent.requiresRoll ? '🎲 Требует броска' : '📝 Без броска'}
              </p>
            </div>
          )}

          {/* ⚔️ КНОПКИ ДЕЙСТВИЙ */}
          <div className="card border border-slate-600">
            <p className="text-slate-300 mb-4 font-semibold">⚔️ Выберите действие:</p>
            <div className="flex gap-2 flex-wrap mb-4">
              {currentActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAction(action)}
                  disabled={isLoading}
                  className="px-3 py-2 rounded bg-teal-600 hover:bg-teal-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>

            {/* ✏️ ПОЛЬЗОВАТЕЛЬСКИЙ ВВОД */}
            <div className="space-y-2">
              <label className="block text-slate-300 text-sm font-semibold">✏️ Собственный ход:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomAction()}
                  placeholder="Напр: Попытаться залезть на дерево, Атаковать дракона мечом..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-600 text-slate-200 placeholder-slate-500 disabled:opacity-50 text-sm focus:border-teal-500 focus:outline-none"
                />
                <button
                  onClick={handleCustomAction}
                  disabled={isLoading || !userInput.trim()}
                  className="px-4 py-2 rounded bg-teal-600 hover:bg-teal-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
                >
                  ✓ OK
                </button>
              </div>
              <p className="text-xs text-slate-400">или нажми Enter</p>
            </div>
          </div>
        </div>

        {/* 👤 ПЕРСОНАЖ И ИНФОРМАЦИЯ */}
        <div>
          {/* 👤 ПЕРСОНАЖ */}
          <div className="card sticky top-4 border border-slate-600 mb-6">
            <h3 className="text-xl font-bold text-teal-400 mb-4">👤 Персонаж</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="border-b border-slate-700 pb-3">
                <p><strong>📝 Имя:</strong> {character.name}</p>
                <p><strong>🧝 Раса:</strong> {character.race}</p>
                <p><strong>⚔️ Класс:</strong> {character.class}</p>
                <p><strong>📊 Уровень:</strong> {character.level || 1}</p>
                {character.alignment && <p><strong>⚖️ Мировоззрение:</strong> {character.alignment}</p>}
              </div>
              
              <div className="border-b border-slate-700 pb-3">
                <p><strong>❤️ HP:</strong> {character.hp?.current || 10}/{character.hp?.max || 10}</p>
                <p><strong>🛡️ AC:</strong> {character.ac || 12}</p>
                <p><strong>⚡ Инициатива:</strong> {character.initiative || 0}</p>
              </div>

              {character.traits && character.traits.length > 0 && (
                <div className="border-b border-slate-700 pb-3">
                  <p><strong>🎭 Черты:</strong></p>
                  <ul className="list-disc list-inside text-xs text-slate-400 mt-1">
                    {character.traits.map((trait: string, i: number) => (
                      <li key={i}>{trait}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-b border-slate-700 pb-3">
                <h4 className="font-bold text-teal-300 mb-2">🗺️ Мир</h4>
                <p className="font-semibold text-teal-200">{world?.name}</p>
                <p className="text-xs text-slate-400 mt-1">Сложность: <strong>{world?.difficulty || 'Normal'}</strong></p>
                {world?.description && (
                  <p className="text-xs text-slate-500 mt-2 italic">{world.description}</p>
                )}
              </div>
            </div>

            {/* КНОПКА ВЫХОДА */}
            <button
              onClick={() => {
                localStorage.removeItem('character');
                localStorage.removeItem('selectedWorld');
                router.push('/world-select');
              }}
              className="w-full mt-6 px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-sm transition-colors"
            >
              ↩️ Вернуться к мирам
            </button>
          </div>

          {/* 📊 ИНФОРМАЦИЯ О СЕССИИ */}
          <div className="card border border-slate-600">
            <h4 className="text-sm font-bold text-teal-400 mb-3">📊 Сессия</h4>
            <div className="space-y-2 text-xs text-slate-400 font-mono">
              <p><strong>ID:</strong></p>
              <p className="text-slate-500 break-all">{sessionId}</p>
              <p className="mt-2"><strong>Ход:</strong> {turn}</p>
              <p><strong>Статус:</strong> {isLoading ? '⏳ Обработка...' : '✅ Активна'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
