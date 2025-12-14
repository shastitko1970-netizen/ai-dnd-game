'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function GamePage() {
  const router = useRouter();
  const [character, setCharacter] = useState<any>(null);
  const [world, setWorld] = useState<any>(null);
  const [narrative, setNarrative] = useState('');
  const [narrativeHistory, setNarrativeHistory] = useState<string[]>([]);
  const [currentActions, setCurrentActions] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const narrativeEndRef = useRef<HTMLDivElement>(null);

  // Автоскрол к новым сообщениям
  useEffect(() => {
    if (narrativeEndRef.current) {
      narrativeEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [narrative]);

  // Загружаем основные данные
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

  // Начинаем новую игру с AI
  const startNewGame = async (char: any, w: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character: char, world: w }),
      });

      if (!response.ok) {
        throw new Error('Ошибка начала игры');
      }

      const data = await response.json();
      
      setNarrative(data.data.narrative);
      setNarrativeHistory([data.data.narrative]);
      
      // Генерируем первоначальные действия
      setCurrentActions([' Атаковать', '🔍 Осмотреть', '💬 Поговорить', '✨ Попробовать магию']);
      setGameStarted(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'неизвестная ошибка';
      setError('❌ ' + errorMsg + ' Проверь API ключ OpenAI в backend/.env');
      console.error(err);
      // Все равно запускаем игру локально
      const fallbackNarrative = `Ты оказываешься в сердце мира "${w.name}". Твоё имя - ${char.name}, ${char.race} ${char.class}. Что ты делаешь?`;
      setNarrative(fallbackNarrative);
      setNarrativeHistory([fallbackNarrative]);
      setCurrentActions(['⚔️ Атаковать', '🔍 Осмотреть', '💬 Поговорить', '✨ Попробовать магию']);
      setGameStarted(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Обрабатываем действие
  const handleAction = async (action: string) => {
    if (isLoading || !character) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Бросаем кости
      const roll = Math.floor(Math.random() * 20) + 1;
      setDiceRoll(roll);
      
      // Показываем действие игрока
      const playerActionText = `\n⚔️ **Ты пытаешься:** ${action} (Кубик: ${roll})`;
      setNarrative(prev => prev + playerActionText);
      
      // Попытаемся получить ответ от AI
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            narrative,
            character,
            world,
            previousActions: currentActions,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.data.response;
          const nextActions = data.data.nextActions || ['⚔️ Атаковать', '🔍 Осмотреть', '💬 Поговорить'];
          
          // Обновляем нарратив с ответом AI
          setNarrative(prev => prev + '\n\n🎲 **Результат:**\n' + aiResponse);
          setNarrativeHistory(prev => [...prev, playerActionText, aiResponse]);
          setCurrentActions(nextActions);
        } else {
          // Fallback - локальный ответ
          throw new Error('API не ответил');
        }
      } catch (aiError) {
        // Если AI не работает, используем локальный генератор
        const isSuccess = roll > 10;
        let result = '';
        
        if (action.toLowerCase().includes('атак')) {
          result = isSuccess 
            ? `✅ Удар попадает! Враг отступает.`
            : `❌ Промах! Враг уклоняется.`;
        } else if (action.toLowerCase().includes('говор')) {
          result = isSuccess
            ? `✅ Слова находят отклик. НПС слушает внимательно.`
            : `❌ НПС игнорирует твои слова и смеется.`;
        } else if (action.toLowerCase().includes('осмотр')) {
          result = isSuccess
            ? `✅ Ты замечаешь что-то интересное!`
            : `❌ Ничего особенного не видно.`;
        } else {
          result = isSuccess
            ? `✅ Действие удается!`
            : `❌ Что-то идет не так...`;
        }
        
        setNarrative(prev => prev + '\n\n🎲 **Результат:**\n' + result);
        setCurrentActions(['⚔️ Атаковать', '🔍 Осмотреть', '💬 Поговорить', '✨ Попробовать магию']);
      }
      
      setUserInput('');
      setDiceRoll(null);
    } catch (err) {
      setError('⚠️ ' + (err instanceof Error ? err.message : 'Ошибка'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Обрабатываем пользовательский ввод
  const handleCustomAction = async () => {
    if (!userInput.trim() || isLoading) return;
    await handleAction(userInput);
  };

  if (!character || !gameStarted) {
    return (
      <div className="text-center py-12 text-slate-300">
        <p>⏳ Загружаю игру...</p>
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Narrative */}
        <div className="lg:col-span-2 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="card bg-red-900 border-red-600">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Narrative Display */}
          <div className="card h-96 flex flex-col">
            <h2 className="text-2xl font-bold text-teal-400 mb-4">📖 Повествование</h2>
            <div className="flex-1 overflow-y-auto text-slate-300 mb-4 p-4 bg-slate-900 rounded whitespace-pre-wrap text-sm leading-relaxed font-mono">
              {narrative}
              <div ref={narrativeEndRef} />
            </div>
          </div>

          {/* Dice Roll Display */}
          {diceRoll !== null && (
            <div className="card bg-gradient-to-r from-orange-900 to-red-900 border-orange-500">
              <p className="text-center text-3xl font-bold text-yellow-300">🎲 {diceRoll} / 20</p>
              <p className="text-center text-sm text-orange-200 mt-2 font-bold">
                {diceRoll > 15 ? '✨ Критический успех!' : diceRoll > 10 ? '✅ Успех!' : '❌ Неудача!'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="card">
            <p className="text-slate-300 mb-4 font-semibold">⚔️ Выберите действие или напишите своё:</p>
            <div className="flex gap-2 flex-wrap mb-4">
              {currentActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAction(action)}
                  disabled={isLoading}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Custom Action Input */}
            <div className="space-y-2">
              <label className="block text-slate-300 text-sm font-semibold">✏️ Собственный ход:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomAction()}
                  placeholder="Напр: Попытаться залезть на дерево, Переговорить с драконом..."
                  disabled={isLoading}
                  className="flex-1 disabled:opacity-50 text-sm"
                />
                <button
                  onClick={handleCustomAction}
                  disabled={isLoading || !userInput.trim()}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  ✓ OK
                </button>
              </div>
              <p className="text-xs text-slate-400">Или нажми Enter</p>
            </div>
          </div>
        </div>

        {/* Character Sheet */}
        <div>
          <div className="card sticky top-4">
            <h3 className="text-xl font-bold text-teal-400 mb-4">👤 Персонаж</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="border-b border-slate-700 pb-3">
                <p><strong>📝 Имя:</strong> {character.name}</p>
                <p><strong>🧝 Раса:</strong> {character.race}</p>
                <p><strong>⚔️ Класс:</strong> {character.class}</p>
                <p><strong>📊 Уровень:</strong> {character.level || 1}</p>
              </div>
              
              <div className="border-b border-slate-700 pb-3">
                <p><strong>❤️ HP:</strong> {character.hp?.current || 10}/{character.hp?.max || 10}</p>
                <p><strong>🛡️ AC:</strong> {character.ac || 12}</p>
                <p><strong>⚡ Инициатива:</strong> {character.initiative || 0}</p>
              </div>

              <div>
                <h4 className="font-bold text-teal-300 mb-2">🗺️ Мир:</h4>
                <p className="font-semibold">{world?.name}</p>
                <p className="text-xs text-slate-400 mt-1">Сложность: {world?.difficulty}</p>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem('character');
                localStorage.removeItem('selectedWorld');
                router.push('/world-select');
              }}
              className="btn btn-secondary w-full mt-6 text-sm"
            >
              ↩️ Вернуться к мирам
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
