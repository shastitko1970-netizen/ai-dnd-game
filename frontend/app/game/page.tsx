'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { generateDynamicActions, categorizeAction } from '@/lib/gameState';

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

  // Начинаем новую игру
  const startNewGame = (char: any, w: any) => {
    const initialNarrative = `Когда ты повернешься, ты оказываешься в сердце мира "${w.name}". 
    Твоё имя - ${char.name}, ${char.race} ${char.class}. 
    Вы стоите в интересном месте. Что вы делаете?`;
    
    setNarrative(initialNarrative);
    setNarrativeHistory([initialNarrative]);
    setCurrentActions(generateDynamicActions(initialNarrative));
    setGameStarted(true);
  };

  // Обрабатываем действие
  const handleAction = async (action: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Бросаем кости
      const roll = Math.floor(Math.random() * 20) + 1;
      setDiceRoll(roll);
      
      // Категоризируем акцию
      const category = categorizeAction(action);
      
      // Генерируем результат
      let result = '';
      const isSuccess = roll > 10;
      
      if (category === 'combat') {
        result = isSuccess 
          ? `Вы ударяете (Ловкость: ${roll})! Это попадание. Враг падает.`
          : `Вы махаете чресчур сильно (Ловкость: ${roll}). Мимо!`;
      } else if (category === 'social') {
        result = isSuccess
          ? `Ваши слова резат по душе (Приявность: ${roll}). НПС кивает и снимает воружение.`
          : `Ваши слова падают на uглухие уши. НПС смеется в лицо.`;
      } else if (category === 'exploration') {
        result = isSuccess
          ? `Вы замечаете нечто действительно интересное (Наблюдательность: ${roll})!`
          : `Вы просканиваете вокруг, но ничего интересного не видите.`;
      } else {
        result = `Вы тыкаете в темноте... (Ловкость: ${roll}). Счастье было с вами: ${isSuccess ? 'да' : 'нет'}!`;
      }

      // Обновляем историю
      const actionText = `
**Вы используете:** ${action}
${result}
`;
      
      setNarrative(prev => prev + '\n\n' + actionText);
      setNarrativeHistory(prev => [...prev, actionText]);
      
      // Генерируем новые возможные действия
      setCurrentActions(generateDynamicActions(result));
      setUserInput('');
      setDiceRoll(null);
    } catch (error) {
      console.error('Ошибка действия:', error);
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
    return <div className="text-center py-12 text-slate-300">Загружаю игру...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Narrative */}
        <div className="lg:col-span-2 space-y-6">
          {/* Narrative Display */}
          <div className="card h-96 flex flex-col">
            <h2 className="text-2xl font-bold text-teal-400 mb-4">Повествование</h2>
            <div className="flex-1 overflow-y-auto text-slate-300 mb-4 p-4 bg-slate-900 rounded whitespace-pre-wrap text-sm leading-relaxed">
              {narrative}
              <div ref={narrativeEndRef} />
            </div>
          </div>

          {/* Dice Roll Display */}
          {diceRoll !== null && (
            <div className="card bg-gradient-to-r from-orange-900 to-red-900 border-orange-500">
              <p className="text-center text-2xl font-bold text-yellow-300">💲 Кубик: {diceRoll} / 20</p>
              <p className="text-center text-sm text-orange-200 mt-2">
                {diceRoll > 15 ? 'Критический успех!' : diceRoll > 10 ? 'Успех!' : 'Неудача!'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="card">
            <p className="text-slate-300 mb-4 font-semibold">Выберите действие или наберите своё:</p>
            <div className="flex gap-2 flex-wrap mb-4">
              {currentActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAction(action)}
                  disabled={isLoading}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Custom Action Input */}
            <div className="space-y-2">
              <label className="block text-slate-300 text-sm">Мой обстановка:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomAction()}
                  placeholder="Например: Попытаться красться на дерево…"
                  disabled={isLoading}
                  className="flex-1 disabled:opacity-50"
                />
                <button
                  onClick={handleCustomAction}
                  disabled={isLoading || !userInput.trim()}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ОК
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Character Sheet */}
        <div>
          <div className="card sticky top-4">
            <h3 className="text-xl font-bold text-teal-400 mb-4">Персонаж</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="border-b border-slate-700 pb-3">
                <p><strong>Имя:</strong> {character.name}</p>
                <p><strong>Раса:</strong> {character.race}</p>
                <p><strong>Класс:</strong> {character.class}</p>
                <p><strong>Уровень:</strong> {character.level || 1}</p>
              </div>
              
              <div className="border-b border-slate-700 pb-3">
                <p><strong>HP:</strong> {character.hp?.current || 10}/{character.hp?.max || 10}</p>
                <p><strong>AC:</strong> {character.ac || 12}</p>
                <p><strong>Инициатива:</strong> {character.initiative || 0}</p>
              </div>

              <div>
                <h4 className="font-bold text-teal-300 mb-2">Мир:</h4>
                <p>{world?.name}</p>
                <p className="text-xs text-slate-400 mt-1">Сложность: {world?.difficulty}</p>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem('character');
                localStorage.removeItem('selectedWorld');
                router.push('/world-select');
              }}
              className="btn btn-secondary w-full mt-6"
            >
              Назад к мирам
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
