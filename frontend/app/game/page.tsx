'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GamePage() {
  const router = useRouter();
  const [character, setCharacter] = useState<any>(null);
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const char = localStorage.getItem('character');
    if (!char) {
      router.push('/world-select');
      return;
    }
    setCharacter(JSON.parse(char));
    setNarrative('Твоё приключение начинается...');
    setLoading(false);
  }, [router]);

  const handleAction = async (actionType: string) => {
    setLoading(true);
    try {
      // Заглушка для тестирования
      setTimeout(() => {
        setNarrative(`Ты выполнил действие: ${actionType}. История продолжается...`);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Ошибка:', error);
      setLoading(false);
    }
  };

  if (loading || !character) {
    return <div className="text-center py-12 text-slate-300">Загружаю игру...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Narrative */}
        <div className="lg:col-span-2">
          <div className="card h-96 flex flex-col">
            <h2 className="text-2xl font-bold text-teal-400 mb-4">Повествование</h2>
            <div className="flex-1 overflow-y-auto text-slate-300 mb-4 p-4 bg-slate-900 rounded">
              {narrative || 'Твоё приключение начинается...'}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleAction('Атака')}
                disabled={loading}
                className="btn btn-primary"
              >
                Атаковать
              </button>
              <button
                onClick={() => handleAction('Уклониться')}
                disabled={loading}
                className="btn btn-primary"
              >
                Уклониться
              </button>
              <button
                onClick={() => handleAction('Помощь')}
                disabled={loading}
                className="btn btn-secondary"
              >
                Помощь
              </button>
            </div>
          </div>
        </div>

        {/* Character Sheet */}
        <div>
          <div className="card">
            <h3 className="text-xl font-bold text-teal-400 mb-4">Персонаж</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p><strong>Имя:</strong> {character.name}</p>
              <p><strong>Раса:</strong> {character.race}</p>
              <p><strong>Класс:</strong> {character.class}</p>
              <p><strong>Уровень:</strong> {character.level}</p>
              <hr className="border-slate-700 my-2" />
              <p><strong>HP:</strong> {character.hp?.current || 10}/{character.hp?.max || 10}</p>
              <p><strong>AC:</strong> {character.ac || 12}</p>
              <p><strong>Инициатива:</strong> {character.initiative || 0}</p>
            </div>
            <button
              onClick={() => router.push('/world-select')}
              className="btn btn-secondary w-full mt-4"
            >
              Назад к мирам
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
